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
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();