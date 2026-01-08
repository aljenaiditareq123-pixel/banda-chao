/**
 * Fix Founder Credentials Script
 * This script ensures the founder account exists with known credentials
 * 
 * Usage in Render Shell:
 *   cd server
 *   npx tsx scripts/fix-founder-credentials.ts
 * 
 * Or from project root:
 *   cd server && npx tsx scripts/fix-founder-credentials.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// SECURITY: Use environment variables for credentials, never hardcode
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL || 'founder@bandachao.com';
const FOUNDER_PASSWORD = process.env.FOUNDER_RESET_PASSWORD || process.env.DEFAULT_PASSWORD || '';
const FOUNDER_NAME = 'Founder';

async function fixFounderCredentials() {
  try {
    // SECURITY: Validate password is provided
    if (!FOUNDER_PASSWORD || FOUNDER_PASSWORD.trim() === '') {
      console.error('❌ ERROR: FOUNDER_RESET_PASSWORD or DEFAULT_PASSWORD environment variable must be set');
      console.error('❌ Never hardcode passwords in source code');
      process.exit(1);
    }

    console.log('\n🔐 Fixing Founder Credentials...');
    console.log(`📧 Email: ${FOUNDER_EMAIL}`);
    console.log(`🔑 Password: [HIDDEN]`);
    console.log('');

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email: FOUNDER_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (existingUser) {
      // User exists - update password and role
      console.log('✅ User found. Updating password and role...');
      console.log(`   Current Role: ${existingUser.role}`);
      
      const hashedPassword = await bcrypt.hash(FOUNDER_PASSWORD, 10);
      
      await prisma.users.update({
        where: { email: FOUNDER_EMAIL },
        data: {
          password: hashedPassword,
          role: 'FOUNDER',
          name: FOUNDER_NAME,
          updated_at: new Date(),
        },
      });

      console.log('✅ User updated successfully!');
      console.log(`   Email: ${FOUNDER_EMAIL}`);
      console.log(`   Password: [Set via FOUNDER_RESET_PASSWORD env var]`);
      console.log(`   Role: FOUNDER`);
    } else {
      // User doesn't exist - create it
      console.log('📝 User not found. Creating new founder account...');
      
      const hashedPassword = await bcrypt.hash(FOUNDER_PASSWORD, 10);
      
      const newUser = await prisma.users.create({
        data: {
          email: FOUNDER_EMAIL,
          password: hashedPassword,
          name: FOUNDER_NAME,
          role: 'FOUNDER',
          level: 10,
          points: 0,
          bio: 'Platform Founder',
        },
      });

      console.log('✅ Founder account created successfully!');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Password: [Set via FOUNDER_RESET_PASSWORD env var]`);
      console.log(`   Role: ${newUser.role}`);
    }

    // Verify the account
    const verifiedUser = await prisma.users.findUnique({
      where: { email: FOUNDER_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (verifiedUser) {
      console.log('\n✅ Verification successful!');
      console.log('\n📋 Founder Account Details:');
      console.log(`   Email: ${verifiedUser.email}`);
      console.log(`   Name: ${verifiedUser.name}`);
      console.log(`   Role: ${verifiedUser.role}`);
      console.log(`   Password: [Set via FOUNDER_RESET_PASSWORD env var]`);
      
      console.log('\n🎉 You can now login with:');
      console.log(`   Email: ${FOUNDER_EMAIL}`);
      console.log(`   Password: [Set via FOUNDER_RESET_PASSWORD env var]`);
      console.log('\n🌐 Login URL: https://banda-chao.onrender.com/ar/login');
    }

  } catch (error: any) {
    console.error('\n❌ ERROR:');
    console.error(`   Message: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixFounderCredentials().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
