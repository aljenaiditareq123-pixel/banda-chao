/**
 * Auto-promote founder script - Safe to run in postbuild
 * This script will only update the role if the user exists and is not already FOUNDER
 * Usage: npx tsx scripts/promote-founder-auto.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FOUNDER_EMAIL = 'aljenaiditareq123@gmail.com';
const TARGET_ROLE = 'FOUNDER';

async function autoPromoteFounder() {
  try {
    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: FOUNDER_EMAIL },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      // User doesn't exist - silently skip (not an error)
      console.log(`ℹ️  User ${FOUNDER_EMAIL} not found. Skipping role update.`);
      return;
    }

    if (user.role === TARGET_ROLE) {
      // Already FOUNDER - silently skip (not an error)
      console.log(`ℹ️  User ${FOUNDER_EMAIL} already has role ${TARGET_ROLE}. Skipping update.`);
      return;
    }

    // Update role to FOUNDER
    await prisma.users.update({
      where: { email: FOUNDER_EMAIL },
      data: { 
        role: TARGET_ROLE,
        updated_at: new Date(),
      },
    });

    console.log(`✅ Updated ${FOUNDER_EMAIL} role to ${TARGET_ROLE}`);
    
  } catch (error: any) {
    // Log error but don't fail the build
    console.warn(`⚠️  Could not update founder role: ${error.message}`);
    // Don't throw - allow build to continue
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
autoPromoteFounder().catch(() => {
  // Silently fail - don't break the build process
  process.exit(0);
});
