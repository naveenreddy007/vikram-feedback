import { Handler } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const path = event.path.replace('/.netlify/functions/auth', '');

  try {
    if (event.httpMethod === 'POST' && path === '/login') {
      // Login endpoint
      const body = JSON.parse(event.body || '{}');
      const { username, password } = body;

      if (!username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'MISSING_CREDENTIALS',
              message: 'Username and password are required'
            },
            timestamp: new Date().toISOString()
          })
        };
      }

      // Find admin user
      const admin = await prisma.adminUser.findUnique({
        where: { username }
      });

      if (!admin) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid username or password'
            },
            timestamp: new Date().toISOString()
          })
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid username or password'
            },
            timestamp: new Date().toISOString()
          })
        };
      }

      // Update last login
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          username: admin.username, 
          role: admin.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            token,
            user: {
              id: admin.id,
              username: admin.username,
              role: admin.role,
              lastLogin: admin.lastLogin
            }
          },
          message: 'Login successful',
          timestamp: new Date().toISOString()
        })
      };

    } else if (event.httpMethod === 'POST' && path === '/logout') {
      // Logout endpoint
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Logout successful',
          timestamp: new Date().toISOString()
        })
      };

    } else if (event.httpMethod === 'GET' && path === '/verify') {
      // Verify token endpoint
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
      
      const admin = await prisma.adminUser.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          role: true,
          lastLogin: true,
          createdAt: true
        }
      });

      if (!admin) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found'
            },
            timestamp: new Date().toISOString()
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            user: admin
          },
          timestamp: new Date().toISOString()
        })
      };

    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found'
          },
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error('Auth API Error:', error);
    
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