import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function populateDatabase() {
  try {
    console.log('🚀 Populating database...');

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'vikram' }
    });

    if (!existingAdmin) {
      // Create admin user
      const password = 'admin123';
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const admin = await prisma.adminUser.create({
        data: {
          username: 'vikram',
          passwordHash,
          role: 'admin'
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log('Username: vikram');
      console.log('Password: admin123');
      console.log('User ID:', admin.id);
    } else {
      console.log('✅ Admin user already exists!');
      console.log('Username: vikram');
    }

    // Add some sample feedback data for demo
    const feedbackCount = await prisma.studentFeedback.count();
    
    if (feedbackCount === 0) {
      console.log('📝 Adding sample feedback data...');
      
      const sampleFeedback = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
          teachingSkills: 9,
          realWorldExplanation: 8,
          overallSatisfaction: 9,
          realWorldTopics: true,
          futureTopics: ['AI', 'Machine Learning', 'IoT'],
          teachingPace: 'PERFECT',
          additionalComments: 'Great teacher! Love the real-world examples.',
          deviceType: 'DESKTOP',
          browserInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionDuration: 180
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phoneNumber: '+1234567891',
          teachingSkills: 8,
          realWorldExplanation: 9,
          overallSatisfaction: 8,
          realWorldTopics: true,
          futureTopics: ['Robotics', 'Data Science'],
          teachingPace: 'PERFECT',
          additionalComments: 'Excellent explanations of complex topics.',
          deviceType: 'MOBILE',
          browserInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          sessionDuration: 240
        },
        {
          name: 'Mike Johnson',
          phoneNumber: '+1234567892',
          teachingSkills: 7,
          realWorldExplanation: 8,
          overallSatisfaction: 7,
          realWorldTopics: false,
          futureTopics: ['Blockchain', 'Cybersecurity'],
          teachingPace: 'TOO_FAST',
          additionalComments: 'Could slow down a bit, but great content.',
          deviceType: 'TABLET',
          browserInfo: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
          sessionDuration: 200
        }
      ];

      for (const feedback of sampleFeedback) {
        await prisma.studentFeedback.create({
          data: feedback
        });
      }

      console.log('✅ Sample feedback data added!');
    } else {
      console.log('✅ Feedback data already exists!');
    }

    console.log('🎉 Database population complete!');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateDatabase();