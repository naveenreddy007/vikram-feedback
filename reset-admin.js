import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.adminUser.upsert({
      where: { username: 'vikram' },
      update: {
        passwordHash: hashedPassword
      },
      create: {
        username: 'vikram',
        passwordHash: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('✅ Admin user updated/created successfully');
    console.log('Username: vikram');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error resetting admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();