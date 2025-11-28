import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from multiple possible locations
// Same approach as server/src/index.ts
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
];

// Try loading from all possible locations
let loaded = false;
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      if (process.env.DATABASE_URL) {
        console.log(`✅ Loaded DATABASE_URL from: ${envPath}`);
        loaded = true;
        break;
      }
    }
  } catch (e) {
    // Continue to next path
  }
}

// Also try default dotenv.config() as fallback
if (!loaded) {
  dotenv.config();
}

const prisma = new PrismaClient();

async function updateUserRole() {
  const email = 'test@example.com';
  const newRole = 'FOUNDER';

  try {
    console.log(`\n🔍 Searching for user with email: ${email}...`);

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERROR: DATABASE_URL is not set in environment variables');
      console.error('\n💡 Trying to use Prisma Client connection...');
      
      // Try to connect and see if we can query
      try {
        await prisma.$connect();
        console.log('✅ Connected to database via Prisma Client');
        // Continue with the script
      } catch (connectError: any) {
        console.error('❌ Cannot connect to database');
        console.error('   Message:', connectError.message);
        console.error('\n💡 Solutions:');
        console.error('   1. Add DATABASE_URL to server/.env file');
        console.error('   2. Or set it as environment variable: export DATABASE_URL="..."');
        console.error('   3. Or pass it directly: DATABASE_URL="..." npx ts-node scripts/updateUserRole.ts');
        process.exit(1);
      }
    } else {
      const dbUrl = process.env.DATABASE_URL || '';
      console.log(`✅ DATABASE_URL is set (${dbUrl.substring(0, 20)}...)`);
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
