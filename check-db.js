import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    console.log('Checking admin user...');
    const adminUser = await prisma.adminUser.findUnique({
      where: { username: 'vikram' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        lastLogin: adminUser.lastLogin
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Count all admin users
    const adminCount = await prisma.adminUser.count();
    console.log(`Total admin users: ${adminCount}`);
    
    // Check feedback entries
    console.log('\nChecking feedback entries...');
    const feedbackCount = await prisma.studentFeedback.count();
    console.log(`Total feedback entries: ${feedbackCount}`);
    
    if (feedbackCount > 0) {
      const recentFeedback = await prisma.studentFeedback.findMany({
        take: 3,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          name: true,
          overallSatisfaction: true,
          submittedAt: true
        }
      });
      console.log('Recent feedback entries:');
      recentFeedback.forEach(feedback => {
        console.log(`- ${feedback.name}: ${feedback.overallSatisfaction}/10 (${feedback.submittedAt})`);
      });
    } else {
      console.log('No feedback entries found in database');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();