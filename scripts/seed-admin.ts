#!/usr/bin/env tsx

/**
 * Seed Admin User Script
 * Creates or updates an admin user in the database
 * 
 * Usage: npx tsx scripts/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from multiple locations
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!\n');
  console.error('💡 To get DATABASE_URL from Render:');
  console.error('   1. Go to: https://dashboard.render.com');
  console.error('   2. Open your Database service');
  console.error('   3. Go to "Connections" tab');
  console.error('   4. Copy "Internal Database URL" or "External Database URL"\n');
  console.error('💡 Then run:');
  console.error('   DATABASE_URL="postgresql://..." npx tsx scripts/seed-admin.ts\n');
  console.error('   Or add it to your .env file:\n');
  console.error('   DATABASE_URL=postgresql://user:password@host:port/database\n');
  process.exit(1);
}

// Create Prisma client with DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function seedAdmin() {
  try {
    console.log('🔐 Starting admin user seed...\n');

    // Admin user details
    const adminEmail = 'admin@bandachao.com';
    const adminPassword = 'password123';
    const adminName = 'Admin';
    const adminRole = 'ADMIN'; // Using ADMIN role (check schema for available roles)

    // Normalize email (lowercase, trimmed)
    const normalizedEmail = adminEmail.trim().toLowerCase();

    console.log('📋 Admin User Details:');
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: ${adminRole}`);
    console.log(`   Password: ${adminPassword} (will be hashed)\n`);

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUsers = await prisma.$queryRaw<Array<{ id: string; email: string; role: string }>>`
      SELECT id, email, role 
      FROM users 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(${normalizedEmail})) 
      LIMIT 1;
    `;

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log(`⚠️  User already exists with ID: ${existingUser.id}`);
      console.log(`   Current role: ${existingUser.role}\n`);

      // Hash the new password
      console.log('🔒 Hashing password...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Update existing user
      console.log('🔄 Updating existing user...');
      await prisma.$executeRaw`
        UPDATE users 
        SET 
          password = ${hashedPassword},
          name = ${adminName},
          role = ${adminRole},
          updated_at = NOW()
        WHERE id = ${existingUser.id};
      `;

      console.log('✅ User updated successfully!\n');
      console.log('📋 Updated User Info:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${normalizedEmail}`);
      console.log(`   Name: ${adminName}`);
      console.log(`   Role: ${adminRole}`);
      console.log(`   Password: Updated (hashed)\n`);
    } else {
      // Hash password
      console.log('🔒 Hashing password...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create new user
      console.log('➕ Creating new admin user...');
      const userId = randomUUID();
      await prisma.$executeRaw`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (${userId}, ${normalizedEmail}, ${hashedPassword}, ${adminName}, ${adminRole}, NOW(), NOW());
      `;

      console.log('✅ Admin user created successfully!\n');
      console.log('📋 Created User Info:');
      console.log(`   ID: ${userId}`);
      console.log(`   Email: ${normalizedEmail}`);
      console.log(`   Name: ${adminName}`);
      console.log(`   Role: ${adminRole}`);
      console.log(`   Password: Hashed and stored\n`);
    }

    // Verify the user was created/updated
    console.log('🔍 Verifying user...');
    const verifyUsers = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      created_at: Date;
      updated_at: Date;
    }>>`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(${normalizedEmail}))
      LIMIT 1;
    `;

    if (verifyUsers.length > 0) {
      const user = verifyUsers[0];
      console.log('✅ Verification successful!\n');
      console.log('📋 Final User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Updated: ${user.updated_at}\n`);
    } else {
      console.error('❌ Verification failed - user not found after creation!');
      process.exit(1);
    }

    console.log('🎉 Admin user seed completed successfully!\n');
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Password: ${adminPassword}\n`);
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');

  } catch (error: any) {
    console.error('❌ Error seeding admin user:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAdmin();

