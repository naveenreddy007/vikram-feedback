import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      },
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Get comprehensive dashboard data
    const totalFeedback = await prisma.studentFeedback.count();
    
    const averageRatings = await prisma.studentFeedback.aggregate({
      _avg: {
        teachingSkills: true,
        realWorldExplanation: true,
        overallSatisfaction: true
      },
      _min: {
        teachingSkills: true,
        realWorldExplanation: true,
        overallSatisfaction: true
      },
      _max: {
        teachingSkills: true,
        realWorldExplanation: true,
        overallSatisfaction: true
      }
    });

    const teachingPaceStats = await prisma.studentFeedback.groupBy({
      by: ['teachingPace'],
      _count: { teachingPace: true }
    });

    const deviceStats = await prisma.studentFeedback.groupBy({
      by: ['deviceType'],
      _count: { deviceType: true }
    });

    const realWorldTopicsStats = await prisma.studentFeedback.groupBy({
      by: ['realWorldTopics'],
      _count: { realWorldTopics: true }
    });

    const recentFeedback = await prisma.studentFeedback.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        teachingSkills: true,
        realWorldExplanation: true,
        overallSatisfaction: true,
        realWorldTopics: true,
        teachingPace: true,
        additionalComments: true,
        deviceType: true,
        submittedAt: true
      }
    });

    // Get feedback trends over time
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.studentFeedback.groupBy({
      by: ['submittedAt'],
      _count: { id: true },
      _avg: {
        teachingSkills: true,
        realWorldExplanation: true,
        overallSatisfaction: true
      },
      where: {
        submittedAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { submittedAt: 'asc' }
    });

    const topFutureTopics = await prisma.studentFeedback.findMany({
      select: { futureTopics: true },
      where: {
        submittedAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Count most requested future topics
    const topicCounts: { [key: string]: number } = {};
    topFutureTopics.forEach(feedback => {
      feedback.futureTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    const mostRequestedTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalFeedback,
          averageRatings: averageRatings._avg,
          minRatings: averageRatings._min,
          maxRatings: averageRatings._max
        },
        stats: {
          teachingPace: teachingPaceStats,
          deviceType: deviceStats,
          realWorldTopics: realWorldTopicsStats
        },
        recentFeedback,
        trends: {
          dailyStats,
          mostRequestedTopics
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching dashboard data'
      },
      timestamp: new Date().toISOString()
    });
  }
}

export default withAuth(handler);