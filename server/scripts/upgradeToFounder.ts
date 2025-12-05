import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upgradeToFounder() {
  const email = 'aljnaiditareq123@gmail.com';

  try {
    console.log('🔐 Upgrading user to FOUNDER...');
    console.log(`Email: ${email}`);

    // Check if user exists
    const existingUser = await prisma.$queryRaw<Array<{ id: string; email: string; role: string }>>`
      SELECT id, email, role FROM users WHERE email = ${email} LIMIT 1;
    `;

    if (existingUser.length === 0) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    const user = existingUser[0];
    console.log(`Current role: ${user.role}`);

    if (user.role === 'FOUNDER') {
      console.log('✅ User is already FOUNDER!');
    } else {
      // Update role to FOUNDER
      await prisma.$executeRaw`
        UPDATE users 
        SET role = 'FOUNDER', updated_at = NOW()
        WHERE email = ${email};
      `;

      console.log('✅ Role updated to FOUNDER!');
    }

    // Verify update
    const updatedUser = await prisma.$queryRaw<Array<{
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

    if (updatedUser.length > 0) {
      console.log('\n📋 Updated User Details:');
      console.log(`   ID: ${updatedUser[0].id}`);
      console.log(`   Email: ${updatedUser[0].email}`);
      console.log(`   Name: ${updatedUser[0].name}`);
      console.log(`   Role: ${updatedUser[0].role}`);
      console.log('\n✅ Account upgraded successfully!');
      console.log('🔄 Please refresh the page to see the Founder Dashboard.');
    }
  } catch (error) {
    console.error('❌ Error upgrading user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

upgradeToFounder()
  .catch((error) => {
    console.error('❌ Failed to upgrade user:', error);
    process.exit(1);
  });



