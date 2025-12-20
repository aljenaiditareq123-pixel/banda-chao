/**
 * Alternative migration script to apply vector extension and table creation
 * This uses Prisma's raw SQL execution to bypass migration system if needed
 * 
 * Usage: npx tsx scripts/apply-vector-migration.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from server directory
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../src/utils/prisma';

async function applyVectorMigration() {
  console.log('🧠 Applying Vector Memory Migration...\n');

  try {
    // Step 1: Enable pgvector extension
    console.log('📦 Step 1: Enabling pgvector extension...');
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ pgvector extension enabled\n');

    // Step 2: Create ai_memories table
    console.log('📋 Step 2: Creating ai_memories table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ai_memories" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "embedding" vector(1536),
        "metadata" JSONB,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ai_memories_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ ai_memories table created\n');

    // Step 3: Create index
    console.log('📊 Step 3: Creating indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ai_memories_created_at_idx" ON "ai_memories"("created_at");
    `);
    console.log('✅ Indexes created\n');

    console.log('🎉 Migration applied successfully! Vector memory system is ready! 🧠✨\n');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

applyVectorMigration();

