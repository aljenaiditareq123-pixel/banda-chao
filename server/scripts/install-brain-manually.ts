/**
 * Surgical Brain Installation Script
 * Safely installs vector memory system without modifying existing schema
 * 
 * This script ONLY:
 * 1. Enables pgvector extension
 * 2. Creates ai_memories table
 * 
 * It does NOT modify any existing tables (like users, products, etc.)
 * 
 * Usage: npx tsx scripts/install-brain-manually.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from server directory
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../src/utils/prisma';

async function installBrain() {
  console.log('🧠 Installing AI Brain (Neuro-Genesis) - Surgical Installation\n');
  console.log('⚠️  This script will ONLY add vector extension and ai_memories table');
  console.log('✅ It will NOT modify any existing tables\n');

  try {
    // Step 1: Enable pgvector extension
    console.log('📦 Step 1: Enabling pgvector extension...');
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('✅ pgvector extension enabled\n');

    // Step 2: Create ai_memories table (exact structure from migration)
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

    // Step 3: Create index (if not exists)
    console.log('📊 Step 3: Creating indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ai_memories_created_at_idx" ON "ai_memories"("created_at");
    `);
    console.log('✅ Index created\n');

    console.log('🎉 Brain installation complete! Neuro-Genesis phase activated! 🧠✨\n');
    console.log('✅ Vector extension: Enabled');
    console.log('✅ ai_memories table: Created');
    console.log('✅ All existing tables: Untouched (including users table with role column)\n');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Installation failed:', error.message);
    console.error('\nFull error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

installBrain();





