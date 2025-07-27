import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to detect device type
const getDeviceType = (userAgent) => {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'TABLET';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'MOBILE';
  }
  return 'DESKTOP';
};

// Validation function
const validateFeedback = (data) => {
  const errors = [];

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

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Access token is required'
      },
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        },
        timestamp: new Date().toISOString()
      });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/feedback', async (req, res) => {
  try {
    console.log('Received feedback submission:', req.body);
    
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

    console.log('Feedback saved successfully:', feedback.id);

    return res.status(201).json({
      success: true,
      data: {
        id: feedback.id,
        submittedAt: feedback.submittedAt
      },
      message: 'Feedback submitted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
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

  } catch (error) {
    console.error('Error fetching feedback:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
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
    const admin = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!admin) {
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
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

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

    return res.status(200).json({
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
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return a success response
  res.status(200).json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        role: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: admin
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Protected feedback routes (admin only)
app.get('/api/admin/feedback', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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

    return res.status(200).json({
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
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin feedback:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
  }
});

app.delete('/api/admin/feedback/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.studentFeedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FEEDBACK_NOT_FOUND',
          message: 'Feedback not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    await prisma.studentFeedback.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Development API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});