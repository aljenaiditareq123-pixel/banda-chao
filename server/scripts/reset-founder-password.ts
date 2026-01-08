/**
 * Reset Founder Password Script
 * Changes password for founder@bandachao.com to 123456
 * 
 * Usage: cd server && npx tsx scripts/reset-founder-password.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FOUNDER_EMAIL = 'founder@bandachao.com';
// SECURITY: Use environment variable for password, never hardcode
const NEW_PASSWORD = process.env.FOUNDER_RESET_PASSWORD || process.env.DEFAULT_PASSWORD || '';

async function resetFounderPassword() {
  try {
    // SECURITY: Validate password is provided
    if (!NEW_PASSWORD || NEW_PASSWORD.trim() === '') {
      console.error('❌ ERROR: FOUNDER_RESET_PASSWORD or DEFAULT_PASSWORD environment variable must be set');
      console.error('❌ Never hardcode passwords in source code');
      process.exit(1);
    }

    console.log('\n🔐 Resetting Founder Password...');
    console.log(`📧 Email: ${FOUNDER_EMAIL}`);
    console.log(`🔑 New Password: [HIDDEN]`);
    console.log('');

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: FOUNDER_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${FOUNDER_EMAIL}`);
      console.log('\n💡 Make sure the email is correct.');
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log('');

    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    // Update password using raw SQL to avoid schema validation issues
    await prisma.$executeRaw`
      UPDATE users
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE email = ${FOUNDER_EMAIL};
    `;

    console.log('✅ Password updated successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${FOUNDER_EMAIL}`);
    console.log(`   Password: [Set via FOUNDER_RESET_PASSWORD env var]`);
    console.log('');
    console.log('🌐 Login URL: https://banda-chao.onrender.com/ar/login');
    console.log('');
    console.log('🎉 You can now login with these credentials!');

  } catch (error: any) {
    console.error('\n❌ ERROR:');
    console.error(`   Message: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error(`   Stack:`, error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetFounderPassword().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
