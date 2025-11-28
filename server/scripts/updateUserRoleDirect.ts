import { PrismaClient } from '@prisma/client';

// This script tries to connect using Prisma Client
// which should use DATABASE_URL from schema.prisma
// or environment variables that Prisma can access

const prisma = new PrismaClient();

async function updateUserRole() {
  const email = 'test@example.com';
  const newRole = 'FOUNDER';

  try {
    console.log(`\n🔍 Searching for user with email: ${email}...`);

    // Try to connect first
    try {
      await prisma.$connect();
      console.log('✅ Connected to database via Prisma Client');
    } catch (connectError: any) {
      console.error('❌ Cannot connect to database');
      console.error('   Message:', connectError.message);
      console.error('\n💡 Make sure DATABASE_URL is set in:');
      console.error('   - server/.env file');
      console.error('   - Or as environment variable');
      process.exit(1);
    }

    // Find user by email using raw SQL (since table is 'users' not 'User')
    const users = await prisma.$queryRaw<Array<{
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

    if (users.length === 0) {
      console.error(`❌ ERROR: User with email "${email}" not found in database`);
      console.log('\n💡 Tip: Make sure you have created an account with this email first.');
      console.log('   You can create an account at: http://localhost:3000/ar/signup');
      process.exit(1);
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   Current role: ${user.role}`);

    if (user.role === newRole) {
      console.log(`\n✅ User already has role "${newRole}". No update needed.`);
      await prisma.$disconnect();
      process.exit(0);
    }

    // Update user role using raw SQL
    await prisma.$executeRaw`
      UPDATE users
      SET role = ${newRole}, "updatedAt" = NOW()
      WHERE email = ${email};
    `;

    // Verify the update
    const updatedUsers = await prisma.$queryRaw<Array<{
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

    const updatedUser = updatedUsers[0];

    console.log(`\n✅ SUCCESS! User role updated:`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Old role: ${user.role}`);
    console.log(`   New role: ${updatedUser.role}`);
    console.log(`\n🎉 User "${email}" is now a FOUNDER!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Log out from the website (if logged in)`);
    console.log(`   2. Log in again with: ${email}`);
    console.log(`   3. You will be redirected to: http://localhost:3000/founder`);

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
updateUserRole();

