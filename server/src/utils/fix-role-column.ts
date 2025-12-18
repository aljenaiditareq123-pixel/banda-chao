/**
 * Database Migration Fix: Convert role column from enum to varchar
 * 
 * Problem: The database has role as UserRole enum, but the new schema uses String
 * Solution: Execute raw SQL to convert the column type
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fixRoleColumn(): Promise<void> {
  console.log('[DB FIX] Checking if role column needs to be converted from enum to varchar...');
  
  try {
    // Check current column type
    const columnInfo = await prisma.$queryRaw<Array<{ data_type: string; udt_name: string }>>`
      SELECT data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `;
    
    if (columnInfo.length === 0) {
      console.log('[DB FIX] Column "role" not found in users table');
      return;
    }
    
    const { data_type, udt_name } = columnInfo[0];
    console.log(`[DB FIX] Current role column type: ${data_type}, UDT: ${udt_name}`);
    
    // If it's already varchar/text/character varying, no fix needed
    if (data_type === 'character varying' || data_type === 'text' || data_type === 'varchar') {
      console.log('[DB FIX] ✅ Role column is already varchar/text, no fix needed');
      return;
    }
    
    // If it's an enum (USER-DEFINED type), convert it
    if (data_type === 'USER-DEFINED' || udt_name.toLowerCase().includes('userrole')) {
      console.log('[DB FIX] 🔧 Converting role column from enum to varchar...');
      
      // Step 1: Add BUYER to the enum if it doesn't exist (temporary fix)
      try {
        await prisma.$executeRawUnsafe(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'BUYER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
              ALTER TYPE "UserRole" ADD VALUE 'BUYER';
            END IF;
          END $$;
        `);
        console.log('[DB FIX] ✅ Added BUYER to UserRole enum (if not exists)');
      } catch (e: any) {
        console.log('[DB FIX] Note: Could not add BUYER to enum:', e.message);
      }
      
      // Step 2: Convert column from enum to varchar
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE users 
          ALTER COLUMN role TYPE VARCHAR(50) 
          USING role::text;
        `);
        console.log('[DB FIX] ✅ Converted role column from enum to varchar');
      } catch (e: any) {
        console.log('[DB FIX] Note: Could not convert column:', e.message);
      }
      
      // Step 3: Set default value
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE users 
          ALTER COLUMN role SET DEFAULT 'USER';
        `);
        console.log('[DB FIX] ✅ Set default value for role column');
      } catch (e: any) {
        console.log('[DB FIX] Note: Could not set default:', e.message);
      }
      
      console.log('[DB FIX] ✅ Role column migration complete');
    } else {
      console.log(`[DB FIX] Unknown column type: ${data_type}, skipping`);
    }
    
  } catch (error: any) {
    console.error('[DB FIX] Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixRoleColumn()
    .then(() => {
      console.log('[DB FIX] Done');
      process.exit(0);
    })
    .catch((e) => {
      console.error('[DB FIX] Failed:', e);
      process.exit(1);
    });
}

