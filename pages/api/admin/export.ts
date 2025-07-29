import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
  }

  try {
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: { message: 'No token provided' } });
    }

    jwt.verify(token, JWT_SECRET);

    const { format = 'json' } = req.query;

    // Fetch all feedback data
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        overallRating: true,
        teachingPace: true,
        realWorldTopics: true,
        additionalComments: true,
        deviceType: true,
        createdAt: true
      }
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'ID,Overall Rating,Teaching Pace,Real World Topics,Additional Comments,Device Type,Created At\n';
      const csvData = feedback.map(item => 
        `${item.id},${item.overallRating},${item.teachingPace},${item.realWorldTopics},"${item.additionalComments?.replace(/"/g, '""') || ''}",${item.deviceType},${item.createdAt.toISOString()}`
      ).join('\n');
      
      const csvContent = csvHeaders + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="feedback-export-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.status(200).send(csvContent);
    }

    // Default JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="feedback-export-${new Date().toISOString().split('T')[0]}.json"`);
    return res.status(200).json({
      success: true,
      data: {
        exportDate: new Date().toISOString(),
        totalRecords: feedback.length,
        feedback
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to export feedback data' }
    });
  }
}