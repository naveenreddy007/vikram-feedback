import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Username and password are required'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          lastLogin: adminUser.lastLogin
        }
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
  }
}