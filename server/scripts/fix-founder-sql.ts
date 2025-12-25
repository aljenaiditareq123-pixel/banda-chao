/**
 * Fix Founder Role using Raw SQL (bypasses Prisma schema validation)
 * 
 * Usage in Render Shell:
 *   cd ~/project/src && npx tsx scripts/fix-founder-sql.ts
 * 
 * Or from project root:
 *   cd server && npx tsx scripts/fix-founder-sql.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FOUNDER_EMAIL = 'founder@bandachao.com';
const FOUNDER_PASSWORD = 'founder123';
const FOUNDER_NAME = 'Founder';

async function fixFounderWithSQL() {
  try {
    console.log('\n🔐 Fixing Founder Account using Raw SQL...');
    console.log(`📧 Email: ${FOUNDER_EMAIL}`);
    console.log('');

    // Step 1: Check if user exists using raw SQL
    const existingUsers = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
    }>>`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = ${FOUNDER_EMAIL}
      LIMIT 1;
    `;

    if (existingUsers.length === 0) {
      // User doesn't exist - create it using raw SQL
      console.log('📝 User not found. Creating new founder account...');
      
      const hashedPassword = await bcrypt.hash(FOUNDER_PASSWORD, 10);
      const { randomUUID } = await import('crypto');
      const userId = randomUUID();
      
      await prisma.$executeRaw`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (
          ${userId}::uuid,
          ${FOUNDER_EMAIL},
          ${hashedPassword},
          ${FOUNDER_NAME},
          'FOUNDER'::"UserRole",
          NOW(),
          NOW()
        );
      `;
      
      console.log('✅ Founder account created successfully!');
    } else {
      // User exists - update role and password using raw SQL
      const existingUser = existingUsers[0];
      console.log('✅ User found. Updating password and role...');
      console.log(`   Current Role: ${existingUser.role}`);
      
      const hashedPassword = await bcrypt.hash(FOUNDER_PASSWORD, 10);
      
      await prisma.$executeRaw`
        UPDATE users
        SET 
          role = 'FOUNDER'::"UserRole",
          password = ${hashedPassword},
          name = ${FOUNDER_NAME},
          updated_at = NOW()
        WHERE email = ${FOUNDER_EMAIL};
      `;
      
      console.log('✅ User updated successfully!');
    }

    // Verify the update
    const verifiedUsers = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
    }>>`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = ${FOUNDER_EMAIL}
      LIMIT 1;
    `;

    if (verifiedUsers.length > 0) {
      const user = verifiedUsers[0];
      console.log('\n✅ Verification successful!');
      console.log('\n📋 Founder Account Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${FOUNDER_PASSWORD}`);
      
      console.log('\n🎉 You can now login with:');
      console.log(`   Email: ${FOUNDER_EMAIL}`);
      console.log(`   Password: ${FOUNDER_PASSWORD}`);
      console.log('\n🌐 Login URL: https://banda-chao.onrender.com/ar/login');
    } else {
      console.error('\n❌ Verification failed - user not found after update');
    }

  } catch (error: any) {
    console.error('\n❌ ERROR:');
    console.error(`   Message: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.meta) {
      console.error(`   Meta:`, error.meta);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixFounderWithSQL().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
