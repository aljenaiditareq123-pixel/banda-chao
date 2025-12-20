/**
 * Test script for VectorService
 * Run this after the migration to verify the vector memory system is working
 * 
 * Usage: npx tsx scripts/test-vector-service.ts
 */

import { testConnection, storeMemory } from '../src/services/VectorService';

async function main() {
  console.log('🧠 Testing Vector Memory Service (Neuro-Genesis)...\n');

  try {
    // Test 1: Connection Test
    console.log('📡 Test 1: Testing database connection...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Connection successful! Vector database is online.\n');
    } else {
      console.log('❌ Connection failed! Please check your DATABASE_URL and migration status.\n');
      process.exit(1);
    }

    // Test 2: Store Memory
    console.log('💾 Test 2: Storing a test memory...');
    const testMemory = await storeMemory(
      'This is the first memory stored in the AI brain. The Neuro-Genesis phase has begun!',
      {
        source: 'neuro-genesis-test',
        eventType: 'SYSTEM_INIT',
        tags: ['test', 'neuro-genesis', 'vector-memory'],
      }
    );

    console.log('✅ Memory stored successfully!');
    console.log(`   ID: ${testMemory.id}`);
    console.log(`   Content: ${testMemory.content.substring(0, 60)}...`);
    console.log(`   Embedding dimensions: ${testMemory.embedding.length}`);
    console.log(`   Created at: ${testMemory.created_at.toISOString()}\n`);

    console.log('🎉 All tests passed! The AI brain is online and ready! 🧠✨\n');
    console.log('Next steps:');
    console.log('  1. Integrate embedding generation (OpenAI/other service)');
    console.log('  2. Implement vector similarity search');
    console.log('  3. Add memory retrieval methods');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

main();

