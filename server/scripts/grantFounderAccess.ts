import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function grantFounderAccess() {
  const email = 'aljenaiditareq123@gmail.com';
  const defaultPassword = 'Founder123!'; // Placeholder password - should be changed on first login

  try {
    console.log('🔐 Granting FOUNDER access...');
    console.log(`Email: ${email}`);

    // Check if user exists
    const existingUser = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
    }>>`
      SELECT id, email, name, role
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `;

    if (existingUser.length > 0) {
      // User exists - update role to FOUNDER
      const user = existingUser[0];
      console.log(`\n📋 Found existing user:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Current Role: ${user.role}`);

      if (user.role === 'FOUNDER') {
        console.log('\n✅ User already has FOUNDER access!');
      } else {
        // Update role to FOUNDER
        await prisma.$executeRaw`
          UPDATE users
          SET role = 'FOUNDER'::UserRole, updated_at = NOW()
          WHERE email = ${email};
        `;

        console.log('\n✅ Role updated to FOUNDER!');
      }

      // Verify update
      const updatedUser = await prisma.$queryRaw<Array<{
        id: string;
        email: string;
        name: string | null;
        role: string;
        created_at: Date;
      }>>`
        SELECT id, email, name, role, created_at
        FROM users
        WHERE email = ${email}
        LIMIT 1;
      `;

      if (updatedUser.length > 0) {
        console.log('\n📋 Updated User Details:');
        console.log(`   ID: ${updatedUser[0].id}`);
        console.log(`   Email: ${updatedUser[0].email}`);
        console.log(`   Name: ${updatedUser[0].name || 'N/A'}`);
        console.log(`   Role: ${updatedUser[0].role}`);
        console.log(`   Created: ${updatedUser[0].created_at}`);
        console.log('\n✅ Access Granted: FOUNDER role activated!');
      }
    } else {
      // User doesn't exist - create with FOUNDER role
      console.log('\n📝 User not found. Creating new FOUNDER account...');

      const userId = randomUUID();
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const userName = 'CEO'; // Default name

      await prisma.$executeRaw`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (
          ${userId},
          ${email},
          ${hashedPassword},
          ${userName},
          'FOUNDER'::UserRole,
          NOW(),
          NOW()
        );
      `;

      console.log('\n✅ New FOUNDER account created!');
      console.log('\n📋 Account Details:');
      console.log(`   ID: ${userId}`);
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${userName}`);
      console.log(`   Role: FOUNDER`);
      console.log(`   Password: ${defaultPassword} (Please change on first login)`);
      console.log('\n✅ Access Granted: FOUNDER account ready!');
    }
  } catch (error: any) {
    console.error('\n❌ Error granting FOUNDER access:', error);
    if (error.message) {
      console.error(`   Message: ${error.message}`);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

grantFounderAccess()
  .catch((error) => {
    console.error('\n❌ Failed to grant FOUNDER access:', error);
    process.exit(1);
  });

