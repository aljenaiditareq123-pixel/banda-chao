/**
 * Promote User to FOUNDER Role
 * 
 * This script promotes a user to FOUNDER role to access the Admin Dashboard.
 * 
 * Usage:
 *   npx ts-node scripts/promote-founder.ts
 *   
 * Or from server directory:
 *   cd server && npx ts-node ../scripts/promote-founder.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'ceo@banda-chao.com';
const NEW_ROLE = 'FOUNDER';

async function promoteToFounder() {
  console.log('🔍 Searching for user:', TARGET_EMAIL);
  console.log('-------------------------------------------');

  try {
    // Find the user
    const user = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      created_at: Date;
    }>>`
      SELECT id, email, name, role, created_at 
      FROM users 
      WHERE LOWER(email) = LOWER(${TARGET_EMAIL})
      LIMIT 1;
    `;

    if (!user || user.length === 0) {
      console.log('❌ User not found with email:', TARGET_EMAIL);
      console.log('');
      console.log('📋 Available users:');
      
      const allUsers = await prisma.$queryRaw<Array<{
        email: string;
        role: string;
      }>>`SELECT email, role FROM users ORDER BY created_at DESC LIMIT 10;`;
      
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.role})`);
      });
      
      return;
    }

    const foundUser = user[0];
    console.log('✅ User found!');
    console.log('   ID:', foundUser.id);
    console.log('   Email:', foundUser.email);
    console.log('   Name:', foundUser.name || '(no name)');
    console.log('   Current Role:', foundUser.role);
    console.log('   Created:', foundUser.created_at);
    console.log('');

    if (foundUser.role === NEW_ROLE) {
      console.log(`ℹ️  User already has ${NEW_ROLE} role. No changes needed.`);
      return;
    }

    // Update the role
    console.log(`🔄 Updating role from "${foundUser.role}" to "${NEW_ROLE}"...`);
    
    await prisma.$executeRaw`
      UPDATE users 
      SET role = ${NEW_ROLE}, updated_at = NOW() 
      WHERE id = ${foundUser.id};
    `;

    // Verify the update
    const updatedUser = await prisma.$queryRaw<Array<{
      role: string;
    }>>`
      SELECT role FROM users WHERE id = ${foundUser.id};
    `;

    if (updatedUser[0]?.role === NEW_ROLE) {
      console.log('');
      console.log('🎉 SUCCESS! User role updated to:', NEW_ROLE);
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('  You can now log in to the Admin Dashboard');
      console.log('  URL: https://banda-chao-frontend.onrender.com/admin');
      console.log('  Email:', TARGET_EMAIL);
      console.log('═══════════════════════════════════════════');
    } else {
      console.log('❌ Update failed. Current role:', updatedUser[0]?.role);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    // Try alternative approach with raw SQL if enum issues
    if (error.message.includes('enum') || error.message.includes('UserRole')) {
      console.log('');
      console.log('⚠️  Trying alternative approach (VARCHAR)...');
      
      try {
        await prisma.$executeRaw`
          UPDATE users 
          SET role = 'FOUNDER'::VARCHAR, updated_at = NOW() 
          WHERE LOWER(email) = LOWER(${TARGET_EMAIL});
        `;
        console.log('✅ Alternative update successful!');
      } catch (altError: any) {
        console.error('❌ Alternative also failed:', altError.message);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
promoteToFounder()
  .then(() => {
    console.log('');
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

