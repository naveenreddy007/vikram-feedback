import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      console.log('Received feedback submission:', req.body);
      
      const { isValid, errors } = validateFeedback(req.body);
      if (!isValid) {
        console.log('Validation failed:', errors);
        res.status(400).json({ 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid data provided', 
            details: errors 
          }, 
          timestamp: new Date().toISOString() 
        });
        return;
      }

      const userAgent = req.headers['user-agent'] || '';
      const deviceType = getDeviceType(userAgent);
      
      console.log('Creating feedback record...');
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
      
      console.log('Feedback created successfully:', feedback.id);
      res.status(201).json({ 
        success: true, 
        data: { 
          id: feedback.id, 
          submittedAt: feedback.submittedAt 
        }, 
        message: 'Feedback submitted successfully', 
        timestamp: new Date().toISOString() 
      });
      return;
      
    } else if (req.method === 'GET') {
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
        _count: { teachingPace: true } 
      });
      const deviceStats = await prisma.studentFeedback.groupBy({ 
        by: ['deviceType'], 
        _count: { deviceType: true } 
      });
      const recentFeedback = await prisma.studentFeedback.findMany({ 
        take: 5, 
        orderBy: { submittedAt: 'desc' }, 
        select: { 
          id: true, 
          name: true, 
          submittedAt: true, 
          overallSatisfaction: true 
        } 
      });
      
      res.status(200).json({ 
        success: true, 
        data: { 
          totalFeedback, 
          averageRatings: averageRatings._avg, 
          teachingPaceStats, 
          deviceStats, 
          recentFeedback 
        }, 
        timestamp: new Date().toISOString() 
      });
      return;
      
    } else {
      res.setHeader('Allow', ['POST', 'GET', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: { 
        code: 'INTERNAL_SERVER_ERROR', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }, 
      timestamp: new Date().toISOString() 
    });
    return;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to detect device type
const getDeviceType = (userAgent: string) => {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'TABLET';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'MOBILE';
  }
  return 'DESKTOP';
};

// Validation function
const validateFeedback = (data: any) => {
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