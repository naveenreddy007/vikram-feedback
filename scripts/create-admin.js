import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'vikram' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username: vikram');
      console.log('You can update the password if needed.');
      return;
    }

    // Hash the password
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
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
    console.log('');
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();