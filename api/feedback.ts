import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types
interface StudentFeedback {
  name: string;
  email?: string;
  phoneNumber: string;
  teachingSkills: number;
  realWorldExplanation: number;
  overallSatisfaction: number;
  realWorldTopics: boolean;
  futureTopics: string[];
  teachingPace: 'TOO_FAST' | 'PERFECT' | 'TOO_SLOW';
  additionalComments: string;
  deviceType: 'MOBILE' | 'DESKTOP' | 'TABLET';
  browserInfo: string;
  sessionDuration: number;
}

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

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // Submit feedback
      const { isValid, errors } = validateFeedback(req.body);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid data provided',
            details: errors
          },
          timestamp: new Date().toISOString()
        });
      }

      const userAgent = req.headers['user-agent'] || '';
      const deviceType = getDeviceType(userAgent);

      const feedback = await prisma.studentFeedback.create({
        data: {
          name: req.body.name.trim(),
          email: req.body.email?.trim() || null,
          phoneNumber: req.body.phoneNumber.trim(),
          teachingSkills: req.body.teachingSkills,
          realWorldExplanation: req.body.realWorldExplanation,
          overallSatisfaction: req.body.overallSatisfaction,
          realWorldTopics: req.body.realWorldTopics,
          futureTopics: req.body.futureTopics,
          teachingPace: req.body.teachingPace,
          additionalComments: req.body.additionalComments || '',
          deviceType,
          browserInfo: userAgent,
          sessionDuration: req.body.sessionDuration || 0,
        }
      });

      return res.status(201).json({
        success: true,
        data: {
          id: feedback.id,
          submittedAt: feedback.submittedAt
        },
        message: 'Feedback submitted successfully',
        timestamp: new Date().toISOString()
      });

    } else if (req.method === 'GET') {
      // Get feedback analytics (basic stats)
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

      return res.status(200).json({
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
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed`
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
  } finally {
    await prisma.$disconnect();
  }
}