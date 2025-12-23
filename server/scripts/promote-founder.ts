/**
 * Script to promote a specific user to FOUNDER role
 * Usage: cd server && npx tsx scripts/promote-founder.ts
 * 
 * This script will update the role of aljenaiditareq123@gmail.com to FOUNDER
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const FOUNDER_EMAIL = 'aljenaiditareq123@gmail.com';
const TARGET_ROLE = 'FOUNDER';

async function promoteToFounder() {
  try {
    console.log('\n🔐 Promoting user to FOUNDER role...');
    console.log(`📧 Email: ${FOUNDER_EMAIL}`);
    console.log(`🎖️  Target Role: ${TARGET_ROLE}\n`);

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
      console.log('\n💡 Make sure the email is correct or create the user first.');
      process.exit(1);
    }

    console.log('📋 Current user info:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === TARGET_ROLE) {
      console.log(`\n✅ User already has role "${TARGET_ROLE}". No update needed.`);
      console.log('\n🎉 You are already a FOUNDER!');
      await prisma.$disconnect();
      process.exit(0);
    }

    // Update user role to FOUNDER
    console.log(`\n🔄 Updating role from "${user.role}" to "${TARGET_ROLE}"...`);
    
    const updatedUser = await prisma.users.update({
      where: { email: FOUNDER_EMAIL },
      data: { 
        role: TARGET_ROLE,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updated_at: true,
      },
    });

    console.log('\n✅ SUCCESS! User role updated to FOUNDER!');
    console.log('\n📋 Updated user info:');
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name || 'N/A'}`);
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   Updated: ${updatedUser.updated_at}`);
    
    console.log('\n🎉 You are now a FOUNDER!');
    console.log('\n📝 Next steps:');
    console.log('   1. Log out from the website (if logged in)');
    console.log('   2. Log in again with your email');
    console.log('   3. You will have access to the Founder Dashboard');
    console.log('\n✅ Script completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ ERROR updating user role:');
    console.error('   Message:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
promoteToFounder().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
