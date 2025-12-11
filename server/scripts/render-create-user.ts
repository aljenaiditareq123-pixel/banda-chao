/**
 * Script to create user in database on Render
 * Run this in Render Shell: npx ts-node scripts/render-create-user.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createUser() {
  const email = 'aljenaiditareq123@gmail.com';
  // Use environment variable for password, fallback to secure random password
  const password = process.env.USER_DEFAULT_PASSWORD || 
    `Temp${Math.random().toString(36).slice(-12)}!`;
  const name = 'Tareq';
  const role = 'USER';

  try {
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    console.log('');

    console.log('👤 Creating user...');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log('');

    // Check if user exists
    const existingUsers = await prisma.$queryRaw<Array<{ id: string; email: string }>>`
      SELECT id, email FROM users WHERE email = ${email} LIMIT 1;
    `;

    if (existingUsers.length > 0) {
      console.log('⚠️  User already exists, updating...');
      const userId = existingUsers[0].id;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user with correct enum casting
      await prisma.$executeRaw`
        UPDATE users
        SET 
          password = ${hashedPassword},
          name = ${name},
          updated_at = NOW()
        WHERE id = ${userId};
      `;

      console.log('✅ User updated successfully');
    } else {
      console.log('📝 Creating new user...');
      const userId = randomUUID();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Use explicit enum casting with correct case: "UserRole" (capital U, capital R)
      await prisma.$executeRaw`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (${userId}, ${email}, ${hashedPassword}, ${name}, ${role}::"UserRole", NOW(), NOW());
      `;

      console.log('✅ User created successfully');
    }

    // Verify user
    console.log('');
    console.log('🔍 Verifying user...');
    const users = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string;
      role: string;
    }>>`
      SELECT id, email, name, role
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `;

    if (users.length > 0) {
      const user = users[0];
      console.log('✅ User verified:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.log('❌ User not found after creation');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.meta) {
      console.error(`   Meta:`, error.meta);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUser()
  .then(() => {
    console.log('');
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

