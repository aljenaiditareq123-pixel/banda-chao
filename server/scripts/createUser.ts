import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  const email = 'aljnaiditareq123@gmail.com';
  const password = '123123';
  const name = 'Tareq';

  try {
    console.log('🔐 Creating user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);

    // Check if user already exists
    const existingUser = await prisma.$queryRaw<Array<{ id: string; email: string }>>`
      SELECT id, email FROM users WHERE email = ${email} LIMIT 1;
    `;

    if (existingUser.length > 0) {
      console.log('⚠️  User already exists! Updating password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.$executeRaw`
        UPDATE users 
        SET password = ${hashedPassword}, name = ${name}, updated_at = NOW()
        WHERE email = ${email};
      `;
      
      console.log('✅ User password updated successfully!');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();
      
      await prisma.$executeRaw`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (${userId}, ${email}, ${hashedPassword}, ${name}, 'USER', NOW(), NOW());
      `;
      
      console.log('✅ User created successfully!');
    }

    // Verify user was created/updated
    const user = await prisma.$queryRaw<Array<{
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

    if (user.length > 0) {
      console.log('\n📋 User Details:');
      console.log(`   ID: ${user[0].id}`);
      console.log(`   Email: ${user[0].email}`);
      console.log(`   Name: ${user[0].name}`);
      console.log(`   Role: ${user[0].role}`);
      console.log('\n✅ Account is ready! You can now login.');
    }
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUser()
  .catch((error) => {
    console.error('❌ Failed to create user:', error);
    process.exit(1);
  });

