import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/pricing
 * Get smart pricing suggestion using Gemini AI as economic expert
 */
export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { productName, category, description } = body;

    if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'productName is required' },
        { status: 400 }
      );
    }

    // Build the economic expert prompt
    const categoryContext = category ? `الفئة: ${category}.` : '';
    const descriptionContext = description ? `الوصف: ${description.trim().substring(0, 500)}.` : '';
    
    const prompt = `أنت خبير اقتصادي ومحلل أسواق محترف متخصص في تقييم أسعار المنتجات في السوق العالمي.

**المهمة:**
قم بتقييم المنتج التالي واقترح نطاق سعر عادل له في السوق العالمي حالياً:

- اسم المنتج: ${productName.trim()}
${categoryContext ? `- ${categoryContext}` : ''}
${descriptionContext ? `- ${descriptionContext}` : ''}

**المتطلبات:**
1. قم بتحليل المنتج بناءً على اسمه، فئته، ووصفه
2. فكر في أسعار السوق الحالية للمنتجات المشابهة عالمياً
3. اقترح نطاق سعر عادل (سعر أدنى وسعر أعلى) بالدرهم الإماراتي (AED)
4. اذكر سبب اقتراحك في جملة أو جملتين

**مهم جداً:**
- أجب بصيغة JSON فقط بالشكل التالي:
{
  "minPrice": عدد_صحيح_أو_عشري,
  "maxPrice": عدد_صحيح_أو_عشري,
  "currency": "AED",
  "reasoning": "السبب بالعربية"
}

- تأكد أن minPrice أقل من أو يساوي maxPrice
- استخدم قيماً واقعية بناءً على السوق الحالي (2024-2025)
- إذا كان المنتج غير معروف، استخدم متوسط أسعار فئته`;

    // Use Gemini 1.5 Flash for faster response (fallback to Pro if needed)
    const modelName = 'gemini-1.5-flash';
    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7, // Higher temperature for more creative analysis
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      // Try fallback to gemini-1.5-pro
      if (response.status === 404 || response.status === 400) {
        console.log(`[Pricing] ${modelName} not available, trying gemini-1.5-pro...`);
        const fallbackModel = 'gemini-1.5-pro';
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${fallbackModel}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Pricing] Gemini API error:', response.status, errorData);
        return NextResponse.json(
          { error: 'Pricing service unavailable', details: errorData },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!responseText) {
      return NextResponse.json(
        { error: 'No pricing suggestion received from AI' },
        { status: 500 }
      );
    }

    // Parse JSON response from Gemini
    let pricingData;
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pricingData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError: any) {
      console.error('[Pricing] Failed to parse JSON response:', parseError);
      console.error('[Pricing] Raw response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse pricing suggestion', details: responseText },
        { status: 500 }
      );
    }

    // Validate pricing data
    if (
      typeof pricingData.minPrice !== 'number' ||
      typeof pricingData.maxPrice !== 'number' ||
      pricingData.minPrice < 0 ||
      pricingData.maxPrice < pricingData.minPrice
    ) {
      return NextResponse.json(
        { error: 'Invalid pricing data received', details: pricingData },
        { status: 500 }
      );
    }

    // Ensure currency is AED
    pricingData.currency = 'AED';
    
    // Ensure reasoning exists
    if (!pricingData.reasoning) {
      pricingData.reasoning = 'تم اقتراح السعر بناءً على تحليل السوق الحالي';
    }

    return NextResponse.json({
      minPrice: Math.round(pricingData.minPrice * 100) / 100, // Round to 2 decimal places
      maxPrice: Math.round(pricingData.maxPrice * 100) / 100,
      currency: pricingData.currency,
      reasoning: pricingData.reasoning,
    });
  } catch (error: any) {
    console.error('[Pricing] Error:', error);
    return NextResponse.json(
      {
        error: 'Pricing suggestion failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
