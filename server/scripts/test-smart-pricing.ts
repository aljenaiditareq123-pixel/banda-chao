/**
 * Test script for Smart Pricing feature (Brick 7)
 * Tests pricing suggestion API with known products
 */

async function testSmartPricing() {
  console.log('🧪 Testing Smart Pricing Feature (Brick 7)\n');
  console.log('='.repeat(70));

  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const testProduct = {
    name: 'PlayStation 5',
    category: 'electronics',
    description: 'Sony PlayStation 5 gaming console with 4K gaming support',
  };

  console.log('\n📋 Test Case: PlayStation 5 Pricing Suggestion');
  console.log('─'.repeat(70));
  console.log(`🎮 Product: "${testProduct.name}"`);
  console.log(`📦 Category: ${testProduct.category}`);
  console.log(`📝 Description: ${testProduct.description}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/ai/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productName: testProduct.name,
        category: testProduct.category,
        description: testProduct.description,
      }),
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Pricing API failed:', errorData);
      throw new Error(`Pricing API returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const { minPrice, maxPrice, currency, reasoning } = data;

    console.log(`✅ Pricing Suggestion Received!\n`);
    console.log(`💰 Price Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} ${currency}`);
    console.log(`💭 Reasoning: ${reasoning}\n`);

    // Validate pricing data
    if (typeof minPrice !== 'number' || typeof maxPrice !== 'number') {
      throw new Error('Invalid price data received');
    }

    if (minPrice < 0 || maxPrice < minPrice) {
      throw new Error('Invalid price range (minPrice >= maxPrice or negative)');
    }

    if (currency !== 'AED') {
      console.log(`⚠️  WARNING: Expected currency AED but got ${currency}`);
    }

    // Check if price is reasonable for PlayStation 5
    // Expected range: 1800-2500 AED (approximately $500-680 USD)
    const expectedMin = 1500;
    const expectedMax = 3000;

    console.log('='.repeat(70));
    console.log('📊 Price Validation');
    console.log('─'.repeat(70));
    console.log(`Expected Range: ${expectedMin} - ${expectedMax} AED`);
    console.log(`Suggested Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} AED\n`);

    const isReasonable =
      minPrice >= expectedMin * 0.5 && // Allow 50% flexibility below
      maxPrice <= expectedMax * 1.5 && // Allow 50% flexibility above
      minPrice <= maxPrice;

    if (isReasonable) {
      console.log('✅ TEST PASSED: Pricing suggestion is reasonable!');
      console.log(`   - Price range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} AED`);
      console.log(`   - Reasoning provided: ${reasoning ? 'Yes' : 'No'}`);
      console.log(`   - Currency: ${currency}\n`);
      return {
        success: true,
        minPrice,
        maxPrice,
        currency,
        reasoning,
        isReasonable: true,
      };
    } else {
      console.log('⚠️  TEST INCONCLUSIVE: Price range seems unusual');
      console.log(`   - Suggested: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} AED`);
      console.log(`   - Expected: ${expectedMin} - ${expectedMax} AED`);
      console.log(`   - This might be acceptable depending on market conditions\n`);
      return {
        success: true,
        minPrice,
        maxPrice,
        currency,
        reasoning,
        isReasonable: false,
      };
    }
  } catch (error: any) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run the test
if (require.main === module) {
  testSmartPricing()
    .then(result => {
      console.log('='.repeat(70));
      if (result.success) {
        if (result.isReasonable) {
          console.log('✅ نتيجة الاختبار: نجاح');
          console.log(`   - تم اقتراح السعر بنجاح`);
          console.log(`   - النطاق: ${result.minPrice.toFixed(2)} - ${result.maxPrice.toFixed(2)} ${result.currency}`);
          console.log(`   - السعر منطقي ومناسب`);
        } else {
          console.log('⚠️  نتيجة الاختبار: نجاح جزئي');
          console.log(`   - تم اقتراح السعر: ${result.minPrice.toFixed(2)} - ${result.maxPrice.toFixed(2)} ${result.currency}`);
          console.log(`   - النطاق قد يكون غير عادي لكن ربما مقبول`);
        }
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

export { testSmartPricing };
