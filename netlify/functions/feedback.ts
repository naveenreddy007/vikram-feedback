import { Handler } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to detect device type
const getDeviceType = (userAgent: string): 'MOBILE' | 'DESKTOP' | 'TABLET' => {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'TABLET';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'MOBILE';
  }
  return 'DESKTOP';
};

// Validation function
const validateFeedback = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    errors.push('Phone number is required');
  }

  if (data.email && typeof data.email !== 'string') {
    errors.push('Email must be a valid string');
  }

  if (!Number.isInteger(data.teachingSkills) || data.teachingSkills < 1 || data.teachingSkills > 10) {
    errors.push('Teaching skills rating must be between 1 and 10');
  }

  if (!Number.isInteger(data.realWorldExplanation) || data.realWorldExplanation < 1 || data.realWorldExplanation > 10) {
    errors.push('Real world explanation rating must be between 1 and 10');
  }

  if (!Number.isInteger(data.overallSatisfaction) || data.overallSatisfaction < 1 || data.overallSatisfaction > 10) {
    errors.push('Overall satisfaction rating must be between 1 and 10');
  }

  if (typeof data.realWorldTopics !== 'boolean') {
    errors.push('Real world topics preference must be true or false');
  }

  if (!Array.isArray(data.futureTopics)) {
    errors.push('Future topics must be an array');
  }

  if (!['TOO_FAST', 'PERFECT', 'TOO_SLOW'].includes(data.teachingPace)) {
    errors.push('Teaching pace must be TOO_FAST, PERFECT, or TOO_SLOW');
  }

  return { isValid: errors.length === 0, errors };
};

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      // Submit feedback
      const body = JSON.parse(event.body || '{}');
      const { isValid, errors } = validateFeedback(body);
      
      if (!isValid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid data provided',
              details: errors
            },
            timestamp: new Date().toISOString()
          })
        };
      }

      const userAgent = event.headers['user-agent'] || '';
      const deviceType = getDeviceType(userAgent);

      const feedback = await prisma.studentFeedback.create({
        data: {
          name: body.name.trim(),
          email: body.email?.trim() || null,
          phoneNumber: body.phoneNumber.trim(),
          teachingSkills: body.teachingSkills,
          realWorldExplanation: body.realWorldExplanation,
          overallSatisfaction: body.overallSatisfaction,
          realWorldTopics: body.realWorldTopics,
          futureTopics: body.futureTopics,
          teachingPace: body.teachingPace,
          additionalComments: body.additionalComments || '',
          deviceType,
          browserInfo: userAgent,
          sessionDuration: body.sessionDuration || 0,
        }
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            id: feedback.id,
            submittedAt: feedback.submittedAt
          },
          message: 'Feedback submitted successfully',
          timestamp: new Date().toISOString()
        })
      };

    } else if (event.httpMethod === 'GET') {
      // Get feedback analytics
      const totalFeedback = await prisma.studentFeedback.count();
      
      const averageRatings = await prisma.studentFeedback.aggregate({
        _avg: {
          teachingSkills: true,
          realWorldExplanation: true,
          overallSatisfaction: true
        }
      });

      const teachingPaceStats = await prisma.studentFeedback.groupBy({
        by: ['teachingPace'],
        _count: {
          teachingPace: true
        }
      });

      const deviceStats = await prisma.studentFeedback.groupBy({
        by: ['deviceType'],
        _count: {
          deviceType: true
        }
      });

      const recentFeedback = await prisma.studentFeedback.findMany({
        take: 5,
        orderBy: {
          submittedAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          teachingSkills: true,
          realWorldExplanation: true,
          overallSatisfaction: true,
          submittedAt: true
        }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            totalFeedback,
            averageRatings: {
              teachingSkills: Number(averageRatings._avg.teachingSkills?.toFixed(1)) || 0,
              realWorldExplanation: Number(averageRatings._avg.realWorldExplanation?.toFixed(1)) || 0,
              overallSatisfaction: Number(averageRatings._avg.overallSatisfaction?.toFixed(1)) || 0
            },
            teachingPaceStats,
            deviceStats,
            recentFeedback
          },
          timestamp: new Date().toISOString()
        })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${event.httpMethod} not allowed`
          },
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error('API Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        },
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    await prisma.$disconnect();
  }
};