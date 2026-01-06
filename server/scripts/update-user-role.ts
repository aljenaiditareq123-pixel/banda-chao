/**
 * Script to update user role in database
 * Usage: cd server && npx tsx scripts/update-user-role.ts <email> <role>
 * Example: npx tsx scripts/update-user-role.ts aljenaidtareq123@gmail.com ADMIN
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

// Available roles
const VALID_ROLES = ['USER', 'ADMIN', 'FOUNDER', 'MAKER', 'JUNDI', 'MECHANIC', 'BUYER'];

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3]?.toUpperCase();

  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/update-user-role.ts <email> <role>');
    console.log('\nExample:');
    console.log('  npx tsx scripts/update-user-role.ts aljenaidtareq123@gmail.com ADMIN');
    console.log('\nAvailable roles:');
    VALID_ROLES.forEach(r => console.log(`  - ${r}`));
    process.exit(1);
  }

  if (!role) {
    console.error('❌ Error: Role is required');
    console.log('\nAvailable roles:');
    VALID_ROLES.forEach(r => console.log(`  - ${r}`));
    process.exit(1);
  }

  if (!VALID_ROLES.includes(role)) {
    console.error(`❌ Error: Invalid role "${role}"`);
    console.log('\nAvailable roles:');
    VALID_ROLES.forEach(r => console.log(`  - ${r}`));
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Looking for user: ${email}`);
    
    // Try exact match first
    let user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // If not found, try case-insensitive search
    if (!user) {
      console.log(`\n⚠️  Exact match not found. Searching case-insensitively...`);
      const allUsers = await prisma.users.findMany({
        where: {
          email: {
            contains: email,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
        take: 10,
      });

      if (allUsers.length === 0) {
        console.error(`❌ User not found: ${email}`);
        console.log('\n💡 Tip: Make sure the email is correct');
        process.exit(1);
      } else if (allUsers.length === 1) {
        user = allUsers[0];
        console.log(`✅ Found user with similar email: ${user.email}`);
      } else {
        console.error(`\n❌ Multiple users found. Please use the exact email:`);
        allUsers.forEach(u => {
          console.log(`   - ${u.email} (${u.role})`);
        });
        process.exit(1);
      }
    }

    console.log(`\n📋 Current user info:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === role) {
      console.log(`\n⚠️  User already has role "${role}". No update needed.`);
      process.exit(0);
    }

    // Update user role
    console.log(`\n🔄 Updating role from "${user.role}" to "${role}"...`);
    
    const updatedUser = await prisma.users.update({
      where: { email },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`\n✅ Success! User role updated.`);
    console.log(`\n📋 Updated user info:`);
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name || 'N/A'}`);
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`\n💡 Tip: Refresh the page or log out and log in again to see the changes.`);
    
  } catch (error: any) {
    console.error('\n❌ Error updating user role:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateUserRole().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});










