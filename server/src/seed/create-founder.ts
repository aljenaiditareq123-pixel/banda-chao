/**
 * Founder Seed Script
 * 
 * This script creates or updates the founder user in the database.
 * It is idempotent - safe to run multiple times without creating duplicate users.
 * 
 * Logic:
 * - Reads FOUNDER_EMAIL from environment variables (defaults to 'founder@banda-chao.com')
 * - Reads FOUNDER_PASSWORD from environment variables (defaults to 'Founder123!')
 * - Uses upsert to ensure the founder user exists with role='FOUNDER'
 * - If user already exists, updates role to 'FOUNDER' (in case it was changed)
 * - If user doesn't exist, creates new user with role='FOUNDER'
 * 
 * Usage:
 * - Local: npm run build && npm run seed:founder
 * - Render: After build, run via Web Shell: node dist/seed/create-founder.js
 * 
 * Security Notes:
 * - Password is hashed using bcryptjs before storing
 * - Default password (Founder123!) is for development only - change in production
 * - Never commit actual passwords to version control
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Get founder email from environment (default: founder@banda-chao.com)
  const founderEmail = process.env.FOUNDER_EMAIL || 'founder@banda-chao.com';
  
  // Get founder password from environment (default: Founder123!)
  // Default password is for development only - should be changed in production
  const plainPassword = process.env.FOUNDER_PASSWORD || 'Founder123!';
  
  // Get founder name from environment (optional, defaults to 'Banda Chao Founder')
  const founderName = process.env.FOUNDER_NAME || 'Banda Chao Founder';

  console.log('🌱 Starting founder seed...');
  console.log(`📧 Email: ${founderEmail}`);
  
  // Hash password using bcrypt (salt rounds: 10)
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // Upsert founder user (idempotent operation)
  // - If user exists: update role to 'FOUNDER' (in case it was changed)
  // - If user doesn't exist: create new user with role='FOUNDER'
    const founderUser = await prisma.users.upsert({
      where: { email: founderEmail },
      update: {
        // If user already exists, ensure role is set to FOUNDER
        role: 'FOUNDER',
      // Optionally update password if FOUNDER_PASSWORD is provided
      // This allows password rotation without deleting user
      ...(process.env.FOUNDER_PASSWORD ? { password: passwordHash } : {}),
    },
    create: {
      email: founderEmail,
      password: passwordHash,
      name: founderName,
      role: 'FOUNDER',
    },
  });

  // Log success (without exposing password)
  console.log('✅ Founder user ensured successfully!');
  console.log(`   ID: ${founderUser.id}`);
  console.log(`   Email: ${founderUser.email}`);
  console.log(`   Name: ${founderUser.name || 'N/A'}`);
  console.log(`   Role: ${founderUser.role}`);
  
  // Log password info only if using default (development)
  if (!process.env.FOUNDER_PASSWORD) {
    console.log(`   ⚠️  Using default password (Founder123!) - change in production!`);
  } else {
    console.log(`   🔐 Password updated from FOUNDER_PASSWORD environment variable`);
  }
  
  console.log('\n📝 You can now login at /login with:');
  console.log(`   Email: ${founderEmail}`);
  if (!process.env.FOUNDER_PASSWORD) {
    console.log(`   Password: Founder123! (default - change in production)`);
  } else {
    console.log(`   Password: [from FOUNDER_PASSWORD env variable]`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Error creating founder user:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

