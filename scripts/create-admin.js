import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: process.env.ADMIN_USERNAME }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log(`Username: ${process.env.ADMIN_USERNAME}`);
      console.log('You can update the password if needed.');
      return;
    }

    // Hash the password
    const password = process.env.ADMIN_PASSWORD;
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        username: process.env.ADMIN_USERNAME,
        passwordHash,
        role: 'admin'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Username: ${process.env.ADMIN_USERNAME}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
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