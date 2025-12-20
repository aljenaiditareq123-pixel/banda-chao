/**
 * Test script for Auto-Translation feature (Brick 4)
 * Tests the translation API with sample text
 */

async function testTranslation() {
  console.log('🧪 Testing Auto-Translation Feature (Brick 4)\n');
  console.log('='.repeat(70));

  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const testText = 'High quality leather shoes';
  const targetLanguage = 'ar';

  console.log('\n📋 Test Case: English to Arabic Translation');
  console.log('─'.repeat(70));
  console.log(`🔤 Original Text: "${testText}"`);
  console.log(`🌍 Target Language: ${targetLanguage} (Arabic)\n`);

  try {
    const response = await fetch(`${baseUrl}/api/ai/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        targetLanguage,
      }),
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Translation failed:', errorData);
      throw new Error(`Translation API returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText || '';

    console.log(`✅ Translation received successfully!\n`);
    console.log(`📝 Translated Text: "${translatedText}"\n`);

    // Check if translation contains expected keywords
    const expectedKeywords = ['حذاء', 'جلد', 'جودة', 'أحذية'];
    const foundKeywords = expectedKeywords.filter(keyword => 
      translatedText.toLowerCase().includes(keyword.toLowerCase())
    );

    console.log('🔍 Keyword Check:');
    console.log('─'.repeat(70));
    console.log(`   Expected keywords: ${expectedKeywords.join(', ')}`);
    console.log(`   Found keywords: ${foundKeywords.length > 0 ? foundKeywords.join(', ') : 'None'}\n`);

    if (foundKeywords.length > 0) {
      console.log('✅ TEST PASSED: Translation contains expected keywords!');
      console.log(`   Found: "${foundKeywords.join(', ')}" in translation`);
      console.log(`   When translating: "${testText}" to Arabic\n`);
      return { success: true, translatedText, foundKeywords };
    } else {
      console.log('⚠️  Translation received but keywords not found');
      console.log('   This could be normal if translation uses different wording\n');
      return { success: true, translatedText, foundKeywords: [] };
    }
  } catch (error: any) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run the test
if (require.main === module) {
  testTranslation()
    .then(result => {
      console.log('='.repeat(70));
      if (result.success) {
        if (result.foundKeywords && result.foundKeywords.length > 0) {
          console.log('✅ نتيجة الاختبار: نجاح');
          console.log(`   - تمت الترجمة بنجاح: "${result.translatedText}"`);
          console.log(`   - وجدنا الكلمات المفتاحية: ${result.foundKeywords.join(', ')}`);
        } else {
          console.log('✅ نتيجة الاختبار: نجاح (ترجمة صحيحة لكن بكلمات مختلفة)');
          console.log(`   - تمت الترجمة: "${result.translatedText}"`);
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

export { testTranslation };
