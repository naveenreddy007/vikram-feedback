import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const questions = await prisma.question.findMany({
        orderBy: { order: 'asc' }
      });
      
      return res.status(200).json({
        success: true,
        data: questions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch questions' },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { title, description, type, options, required, order } = req.body;
      
      const question = await prisma.question.create({
        data: {
          title,
          description,
          type,
          options: options || [],
          required: required !== undefined ? required : true,
          order: order || 0
        }
      });
      
      return res.status(201).json({
        success: true,
        data: question,
        message: 'Question created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create question' },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, title, description, type, options, required, order, isActive } = req.body;
      
      const question = await prisma.question.update({
        where: { id },
        data: {
          title,
          description,
          type,
          options: options || [],
          required,
          order,
          isActive
        }
      });
      
      return res.status(200).json({
        success: true,
        data: question,
        message: 'Question updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update question' },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      
      await prisma.question.delete({
        where: { id }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Question deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete question' },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler);