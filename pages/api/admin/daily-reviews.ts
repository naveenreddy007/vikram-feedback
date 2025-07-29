import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, published } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where = published !== undefined ? { isPublished: published === 'true' } : {};
      
      const [reviews, total] = await Promise.all([
        prisma.dailyReview.findMany({
          where,
          include: {
            author: {
              select: { id: true, username: true }
            }
          },
          orderBy: { date: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.dailyReview.count({ where })
      ]);
      
      return res.status(200).json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch daily reviews' },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { title, content, date, tags, isPublished } = req.body;
      
      const review = await prisma.dailyReview.create({
        data: {
          title,
          content,
          date: new Date(date),
          tags: tags || [],
          isPublished: isPublished || false,
          authorId: req.user!.id
        },
        include: {
          author: {
            select: { id: true, username: true }
          }
        }
      });
      
      return res.status(201).json({
        success: true,
        data: review,
        message: 'Daily review created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create daily review' },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { id, title, content, date, tags, isPublished } = req.body;
      
      const review = await prisma.dailyReview.update({
        where: { id },
        data: {
          title,
          content,
          date: new Date(date),
          tags: tags || [],
          isPublishe