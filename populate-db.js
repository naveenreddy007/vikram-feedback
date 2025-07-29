import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sampleFeedback = [
  {
    name: 'Arjun Sharma',
    email: 'arjun.sharma@email.com',
    phoneNumber: '+91-9876543210',
    teachingSkills: 9,
    realWorldExplanation: 8,
    overallSatisfaction: 9,
    realWorldTopics: true,
    futureTopics: ['Machine Learning', 'Data Structures'],
    teachingPace: 'PERFECT',
    additionalComments: 'Excellent teaching style and very clear explanations.',
    deviceType: 'DESKTOP',
    browserInfo: 'Chrome 120.0.0.0',
    sessionDuration: 1200
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phoneNumber: '+91-9876543211',
    teachingSkills: 8,
    realWorldExplanation: 9,
    overallSatisfaction: 8,
    realWorldTopics: true,
    futureTopics: ['React Advanced Patterns', 'System Design'],
    teachingPace: 'PERFECT',
    additionalComments: 'Great real-world examples that helped me understand concepts better.',
    deviceType: 'MOBILE',
    browserInfo: 'Safari 17.0',
    sessionDuration: 900
  },
  {
    name: 'Rahul Kumar',
    email: 'rahul.kumar@email.com',
    phoneNumber: '+91-9876543212',
    teachingSkills: 7,
    realWorldExplanation: 8,
    overallSatisfaction: 7,
    realWorldTopics: false,
    futureTopics: ['Database Design', 'API Development'],
    teachingPace: 'TOO_FAST',
    additionalComments: 'Good content but could slow down a bit during complex topics.',
    deviceType: 'DESKTOP',
    browserInfo: 'Firefox 121.0',
    sessionDuration: 1500
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    phoneNumber: '+91-9876543213',
    teachingSkills: 10,
    realWorldExplanation: 10,
    overallSatisfaction: 10,
    realWorldTopics: true,
    futureTopics: ['Cloud Computing', 'DevOps'],
    teachingPace: 'PERFECT',
    additionalComments: 'Outstanding teacher! Best programming instructor I have had.',
    deviceType: 'TABLET',
    browserInfo: 'Chrome 120.0.0.0',
    sessionDuration: 1800
  },
  {
    name: 'Vikash Singh',
    email: 'vikash.singh@email.com',
    phoneNumber: '+91-9876543214',
    teachingSkills: 6,
    realWorldExplanation: 7,
    overallSatisfaction: 6,
    realWorldTopics: true,
    futureTopics: ['Testing Frameworks', 'Performance Optimization'],
    teachingPace: 'TOO_SLOW',
    additionalComments: 'Good explanations but could pick up the pace a little.',
    deviceType: 'DESKTOP',
    browserInfo: 'Edge 120.0.0.0',
    sessionDuration: 2100
  }
];

async function populateDatabase() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    console.log('\nPopulating database with sample feedback...');
    
    for (const feedback of sampleFeedback) {
      const created = await prisma.studentFeedback.create({
        data: feedback
      });
      console.log(`✅ Created feedback from ${feedback.name}`);
    }
    
    console.log(`\n🎉 Successfully added ${sampleFeedback.length} feedback entries to the database!`);
    
    // Verify the data
    const totalCount = await prisma.studentFeedback.count();
    console.log(`\nTotal feedback entries in database: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Error populating database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

populateDatabase();