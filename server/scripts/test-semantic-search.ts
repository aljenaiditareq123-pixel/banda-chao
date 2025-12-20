/**
 * Semantic Search Test Script
 * Tests if semantic search works correctly
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { storeProductEmbedding, searchProductsBySimilarity } from '../src/services/productVectorService';
import { searchProducts } from '../src/services/searchService';

const prisma = new PrismaClient();

async function testSemanticSearch() {
  console.log('🧪 Starting Semantic Search Test...\n');

  try {
    // Step 1: Create a test product
    console.log('📦 Step 1: Creating test product...');
    const testProductName = 'مفك براغي احترافي';
    const testProductDescription = 'مفك براغي احترافي عالي الجودة مناسب لجميع أنواع الصيانة والتصليح';
    const testProductCategory = 'electronics';

    // Check if product already exists
    const existingProduct = await prisma.products.findFirst({
      where: {
        name: testProductName,
      },
    });

    let productId: string;
    if (existingProduct) {
      console.log('ℹ️  Test product already exists, using existing one...');
      productId = existingProduct.id;
      console.log(`ℹ️  Using existing product with ID: ${productId}`);
      
      // Update embedding anyway to ensure it's fresh
      console.log('🔮 Step 2: Updating embedding for existing product...');
      await storeProductEmbedding(
        productId,
        testProductName,
        testProductDescription,
        testProductCategory
      );
      console.log('✅ Embedding updated successfully');
    } else {
      // Get a valid user ID or create a test user
      let userId = (await prisma.users.findFirst())?.id;
      if (!userId) {
        // Create a test user if none exists
        const testUser = await prisma.users.create({
          data: {
            email: `test-user-${Date.now()}@test.com`,
            name: 'Test User',
          },
        });
        userId = testUser.id;
      }

      // Create test product (use raw SQL to avoid Prisma schema issues)
      const productId = randomUUID();
      await prisma.$executeRawUnsafe(`
        INSERT INTO products (id, name, description, category, price, user_id, external_link, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, productId, testProductName, testProductDescription, testProductCategory, 25.99, userId, '');
      
      const product = { id: productId, name: testProductName };
      productId = product.id;
      console.log(`✅ Created test product with ID: ${productId}`);

      // Generate and store embedding
      console.log('🔮 Step 2: Generating embedding for test product...');
      await storeProductEmbedding(
        productId,
        testProductName,
        testProductDescription,
        testProductCategory
      );
      console.log('✅ Embedding stored successfully');
    }

    // Wait a bit for embedding to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test semantic search
    console.log('\n🔍 Step 3: Testing semantic search...');
    const searchQuery = 'أداة لتصليح أثاث المنزل';
    console.log(`   Search query: "${searchQuery}"`);
    console.log(`   Expected to find: "${testProductName}"\n`);

    // Test vector search directly
    console.log('   Testing vector similarity search...');
    const vectorResults = await searchProductsBySimilarity(searchQuery, 10, 0.2);
    console.log(`   Vector search found ${vectorResults.length} results`);
    
    const foundInVector = vectorResults.some(r => r.productId === productId);
    if (foundInVector) {
      const result = vectorResults.find(r => r.productId === productId);
      console.log(`   ✅ Found product in vector search! Similarity: ${result?.similarity?.toFixed(4)}`);
    } else {
      console.log('   ❌ Product NOT found in vector search');
      console.log('   Top results:', vectorResults.slice(0, 3).map(r => ({
        productId: r.productId,
        similarity: r.similarity?.toFixed(4),
        name: r.name,
      })));
    }

    // Test full search service
    console.log('\n   Testing full search service...');
    const searchResults = await searchProducts(searchQuery, {
      locale: 'ar',
      limit: 20,
    });

    const foundInFullSearch = searchResults.products.some(p => p.id === productId);
    if (foundInFullSearch) {
      const productIndex = searchResults.products.findIndex(p => p.id === productId);
      console.log(`   ✅ Found product in full search! Position: ${productIndex + 1}`);
      console.log(`   Total results: ${searchResults.total}`);
    } else {
      console.log('   ❌ Product NOT found in full search');
      console.log(`   Total results: ${searchResults.total}`);
      if (searchResults.products.length > 0) {
        console.log('   Top results:', searchResults.products.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name || p.displayName,
        })));
      }
    }

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (foundInVector || foundInFullSearch) {
      console.log('✅ TEST PASSED: Semantic search is working!');
      console.log(`   Searched for: "${searchQuery}"`);
      console.log(`   Found: "${testProductName}"`);
      console.log('='.repeat(60));
      return true;
    } else {
      console.log('❌ TEST FAILED: Product not found in search results');
      console.log('='.repeat(60));
      return false;
    }

  } catch (error: any) {
    console.error('\n❌ TEST ERROR:', error);
    console.error('Stack:', error.stack);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSemanticSearch()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
