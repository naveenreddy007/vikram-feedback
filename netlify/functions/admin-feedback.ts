import { Handler } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

// Authentication middleware function
const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Verify authentication
    const authHeader = event.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Access token is required'
          },
          timestamp: new Date().toISOString()
        })
      };
    }

    const user = verifyToken(token);

    if (event.httpMethod === 'GET') {
      // Get admin feedback with pagination
      const page = parseInt(event.queryStringParameters?.page || '1');
      const limit = parseInt(event.queryStringParameters?.limit || '10');
      const skip = (page - 1) * limit;

      const totalFeedback = await prisma.studentFeedback.count();
      
      const feedback = await prisma.studentFeedback.findMany({
        skip,
        take: limit,
        orderBy: {
          submittedAt: 'desc'
        }
      });

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
            feedback,
            totalFeedback,
            currentPage: page,
            totalPages: Math.ceil(totalFeedback / limit),
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

    } else if (event.httpMethod === 'DELETE') {
      // Delete feedback (extract ID from path)
      const pathParts = event.path.split('/');
      const id = pathParts[pathParts.length - 1];

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'MISSING_ID',
              message: 'Feedback ID is required'
            },
            timestamp: new Date().toISOString()
          })
        };
      }

      const feedback = await prisma.studentFeedback.findUnique({
        where: { id }
      });

      if (!feedback) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'FEEDBACK_NOT_FOUND',
              message: 'Feedback not found'
            },
            timestamp: new Date().toISOString()
          })
        };
      }

      await prisma.studentFeedback.delete({
        where: { id }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Feedback deleted successfully',
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
    console.error('Admin API Error:', error);
    
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