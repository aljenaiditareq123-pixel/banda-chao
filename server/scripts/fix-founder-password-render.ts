/**
 * Fix Founder Password for Render Production
 * This script properly updates the password using Prisma's parameterized queries
 * 
 * Usage in Render Shell:
 *   cd ~/project/src/server && npx tsx scripts/fix-founder-password-render.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FOUNDER_EMAIL = 'founder@bandachao.com';
const NEW_PASSWORD = '123456';

async function fixFounderPassword() {
  try {
    console.log('\n🔐 Fixing Founder Password on Render...');
    console.log(`📧 Email: ${FOUNDER_EMAIL}`);
    console.log(`🔑 New Password: ${NEW_PASSWORD}`);
    console.log('');

    // Step 1: Find user
    const users = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      password: string | null;
    }>>`
      SELECT id, email, name, role, password
      FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(${FOUNDER_EMAIL}))
      LIMIT 1;
    `;

    if (users.length === 0) {
      console.error(`❌ User not found: ${FOUNDER_EMAIL}`);
      process.exit(1);
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Current Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
    console.log('');

    // Step 2: Hash new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`);
    console.log('');

    // Step 3: Update password using parameterized query (correct way)
    console.log('🔄 Updating password and role...');
    await prisma.$executeRaw`
      UPDATE users
      SET 
        password = ${hashedPassword},
        role = 'FOUNDER'::"UserRole",
        updated_at = NOW()
      WHERE email = ${FOUNDER_EMAIL};
    `;

    console.log('✅ Password and role updated successfully!');
    console.log('');

    // Step 4: Verify the update
    const verifyUsers = await prisma.$queryRaw<Array<{
      email: string;
      role: string;
      password: string | null;
    }>>`
      SELECT email, role, password
      FROM users
      WHERE email = ${FOUNDER_EMAIL}
      LIMIT 1;
    `;

    if (verifyUsers.length > 0) {
      const verifiedUser = verifyUsers[0];
      console.log('✅ Verification successful!');
      console.log('');
      console.log('📋 Updated Account Details:');
      console.log(`   Email: ${verifiedUser.email}`);
      console.log(`   Role: ${verifiedUser.role}`);
      console.log(`   Password Hash: ${verifiedUser.password ? verifiedUser.password.substring(0, 30) + '...' : 'NULL'}`);
      console.log('');
      
      // Step 5: Test password comparison
      console.log('🧪 Testing password comparison...');
      if (verifiedUser.password) {
        const isMatch = await bcrypt.compare(NEW_PASSWORD, verifiedUser.password);
        console.log(`   Password match test: ${isMatch ? '✅ PASSED' : '❌ FAILED'}`);
        if (!isMatch) {
          console.error('   ⚠️  WARNING: Password hash does not match!');
        }
      } else {
        console.error('   ❌ ERROR: Password is NULL after update!');
      }
      console.log('');

      console.log('🎉 SUCCESS! Login credentials:');
      console.log(`   Email: ${FOUNDER_EMAIL}`);
      console.log(`   Password: ${NEW_PASSWORD}`);
      console.log(`   Role: ${verifiedUser.role}`);
      console.log('');
      console.log('🌐 Login URL: https://banda-chao.onrender.com/ar/login');
    } else {
      console.error('❌ Verification failed - user not found after update');
    }

  } catch (error: any) {
    console.error('\n❌ ERROR:');
    console.error(`   Message: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (process.env.NODE_ENV === 'development' || true) {
      console.error(`   Stack:`, error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixFounderPassword().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
