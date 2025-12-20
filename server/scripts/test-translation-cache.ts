/**
 * Test script for Translation Cache functionality (Brick 4 with Caching)
 * Tests that caching system works correctly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTranslationCache() {
  console.log('🧪 Testing Translation Cache System (Brick 4)\n');
  console.log('='.repeat(70));

  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const testText = 'High quality leather shoes';
  const targetLanguage = 'ar';

  try {
    // Clean up any existing cache entry for this test
    console.log('\n📋 Step 1: Cleanup existing cache');
    console.log('─'.repeat(70));
    try {
      await prisma.translation_cache.deleteMany({
        where: {
          original_text: testText.trim(),
          target_language: targetLanguage,
        },
      });
      console.log('✅ Cache cleaned (if existed)\n');
    } catch (error: any) {
      console.log('ℹ️  No existing cache to clean\n');
    }

    // Test 1: First request (should be cache MISS and call Gemini)
    console.log('📋 Test Case 1: First Request (Cache MISS)');
    console.log('─'.repeat(70));
    console.log(`🔤 Text: "${testText}"`);
    console.log(`🌍 Target Language: ${targetLanguage} (Arabic)\n`);

    const startTime1 = Date.now();
    const response1 = await fetch(`${baseUrl}/api/ai/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        targetLanguage,
      }),
    });

    const time1 = Date.now() - startTime1;
    console.log(`📡 Response Status: ${response1.status} ${response1.statusText}`);
    console.log(`⏱️  Response Time: ${time1}ms\n`);

    if (!response1.ok) {
      const errorData = await response1.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Translation API returned ${response1.status}: ${JSON.stringify(errorData)}`);
    }

    const data1 = await response1.json();
    const translatedText1 = data1.translatedText || '';
    const cached1 = data1.cached || false;

    console.log(`✅ First Translation Received!`);
    console.log(`   Translated: "${translatedText1.substring(0, 60)}${translatedText1.length > 60 ? '...' : ''}"`);
    console.log(`   Cached: ${cached1}`);
    console.log(`   Time: ${time1}ms\n`);

    if (cached1) {
      console.log('⚠️  WARNING: First request was cached (unexpected)');
    }

    // Wait a bit to ensure cache is saved
    console.log('⏳ Waiting 1 second for cache to be saved...\n');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify cache entry exists in database
    const cacheEntry = await prisma.translation_cache.findUnique({
      where: {
        original_text_target_language: {
          original_text: testText.trim(),
          target_language: targetLanguage,
        },
      },
    });

    if (cacheEntry) {
      console.log('✅ Cache entry verified in database');
      console.log(`   Cache ID: ${cacheEntry.id}`);
      console.log(`   Created: ${cacheEntry.created_at}\n`);
    } else {
      console.log('⚠️  Cache entry not found in database (may be async)\n');
    }

    // Test 2: Second request (should be cache HIT)
    console.log('📋 Test Case 2: Second Request (Cache HIT)');
    console.log('─'.repeat(70));
    console.log(`🔤 Same Text: "${testText}"`);
    console.log(`🌍 Same Target Language: ${targetLanguage}\n`);

    const startTime2 = Date.now();
    const response2 = await fetch(`${baseUrl}/api/ai/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        targetLanguage,
      }),
    });

    const time2 = Date.now() - startTime2;
    console.log(`📡 Response Status: ${response2.status} ${response2.statusText}`);
    console.log(`⏱️  Response Time: ${time2}ms\n`);

    if (!response2.ok) {
      const errorData = await response2.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Translation API returned ${response2.status}: ${JSON.stringify(errorData)}`);
    }

    const data2 = await response2.json();
    const translatedText2 = data2.translatedText || '';
    const cached2 = data2.cached || false;

    console.log(`✅ Second Translation Received!`);
    console.log(`   Translated: "${translatedText2.substring(0, 60)}${translatedText2.length > 60 ? '...' : ''}"`);
    console.log(`   Cached: ${cached2}`);
    console.log(`   Time: ${time2}ms\n`);

    // Verify results
    console.log('='.repeat(70));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(70));
    console.log(`First Request:  ${cached1 ? '❌ Cached (unexpected)' : '✅ Fresh (expected)'} - ${time1}ms`);
    console.log(`Second Request: ${cached2 ? '✅ Cached (expected)' : '❌ Fresh (unexpected)'} - ${time2}ms`);
    console.log(`Speedup: ${time1 > 0 ? ((time1 / time2).toFixed(2)) : 'N/A'}x faster with cache\n`);

    // Verify translations match
    if (translatedText1 === translatedText2) {
      console.log('✅ Translations match (correct)');
    } else {
      console.log('⚠️  Translations differ (may be normal if API returns different results)');
    }

    // Final assessment
    if (cached2 && time2 < time1) {
      console.log('\n✅ TEST PASSED: Cache system working correctly!');
      console.log(`   - First request: Fresh translation (${time1}ms)`);
      console.log(`   - Second request: Cached translation (${time2}ms)`);
      console.log(`   - Speedup: ${((time1 / time2).toFixed(2))}x faster\n`);
      return { success: true, time1, time2, cached1, cached2 };
    } else if (cached2) {
      console.log('\n✅ TEST PASSED: Cache system working (cached flag correct)');
      console.log(`   - Cache hit detected correctly`);
      return { success: true, time1, time2, cached1, cached2 };
    } else {
      console.log('\n⚠️  TEST INCONCLUSIVE: Cache may not be working as expected');
      console.log(`   - Second request should be cached but wasn't`);
      return { success: false, error: 'Cache not working' };
    }
  } catch (error: any) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testTranslationCache()
    .then(result => {
      console.log('='.repeat(70));
      if (result.success) {
        console.log('✅ نتيجة الاختبار: نجاح');
        console.log(`   - نظام الكاش يعمل بشكل صحيح`);
        console.log(`   - الطلب الأول: ${result.time1}ms (Fresh)`);
        console.log(`   - الطلب الثاني: ${result.time2}ms (Cached)`);
        process.exit(0);
      } else {
        console.log(`❌ نتيجة الاختبار: فشل`);
        console.log(`   السبب: ${result.error || 'غير معروف'}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { testTranslationCache };
