import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/haggle
 * AI-powered price negotiation with Panda seller agent
 * Uses Gemini AI to simulate a friendly negotiation conversation
 */
export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      productName, 
      originalPrice, 
      userOffer, 
      conversationHistory = [],
      locale = 'ar'
    } = body;

    if (!productName || !originalPrice || userOffer === undefined) {
      return NextResponse.json(
        { error: 'productName, originalPrice, and userOffer are required' },
        { status: 400 }
      );
    }

    const userOfferNum = parseFloat(userOffer);
    const originalPriceNum = parseFloat(originalPrice);

    if (isNaN(userOfferNum) || isNaN(originalPriceNum) || userOfferNum <= 0 || originalPriceNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid price values' },
        { status: 400 }
      );
    }

    // Calculate minimum acceptable price (85% of original)
    const minPrice = originalPriceNum * 0.85;
    const offerPercentage = (userOfferNum / originalPriceNum) * 100;

    // Build conversation context
    const systemPrompt = locale === 'ar' ? `أنت "باندا البائع" 🐼 - بائع مرح ومهذب في منصة تجارة إلكترونية.
أنت تمثل المالك/البائع للمنتج "${productName}" بسعر ${originalPriceNum} ${body.currency || 'درهم'}.

**قواعد التفاوض:**
- السعر الأصلي: ${originalPriceNum} ${body.currency || 'درهم'}
- أقل سعر تقبله: ${minPrice.toFixed(2)} ${body.currency || 'درهم'} (85% من السعر الأصلي)
- أنت مرح، ودود، وتحاول البيع بسعر جيد، لكن يجب ألا تقبل أقل من الحد الأدنى.

**سلوكك:**
- ابدأ بالترحيب والحماس للمنتج
- إذا كان العرض >= 90% من السعر الأصلي: قبل فوراً بحماس
- إذا كان العرض بين 85-90%: تفاوض بلطف واقترح سعراً وسطاً (تقريباً 87.5%)
- إذا كان العرض < 85%: رفض بلطف ولكن كن مرحاً واقترح سعراً أعلى

أجب بجملة واحدة أو جملتين قصيرتين ومرحتين بالعربية.` : 
`You are "Panda Seller" 🐼 - a friendly and polite seller on an e-commerce platform.
You represent the owner/seller of the product "${productName}" priced at ${originalPriceNum} ${body.currency || 'USD'}.

**Negotiation Rules:**
- Original Price: ${originalPriceNum} ${body.currency || 'USD'}
- Minimum Acceptable Price: ${minPrice.toFixed(2)} ${body.currency || 'USD'} (85% of original)
- You are friendly, enthusiastic, and want to make a good sale, but you cannot accept less than the minimum.

**Your Behavior:**
- Start with a warm welcome and enthusiasm for the product
- If offer >= 90% of original price: Accept immediately with enthusiasm
- If offer between 85-90%: Negotiate gently and suggest a middle price (around 87.5%)
- If offer < 85%: Decline politely but be friendly and suggest a higher price

Respond with one or two short, friendly sentences in ${locale === 'zh' ? 'Chinese' : 'English'}.`;

    // Build conversation history for context
    let conversationContext = systemPrompt + '\n\n';
    if (conversationHistory.length > 0) {
      conversationContext += '**تاريخ المحادثة:**\n';
      conversationHistory.slice(-5).forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'المشتري' : 'الباندا'}: ${msg.content}\n`;
      });
      conversationContext += '\n';
    }

    conversationContext += `**العرض الحالي من المشتري:** ${userOfferNum} ${body.currency || 'درهم'}\n\n`;
    conversationContext += locale === 'ar' ? 'أجب الآن كالباندا البائع:' : 'Respond now as Panda Seller:';

    // Call Gemini API
    const modelName = 'gemini-1.5-flash';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: conversationContext }],
          }],
          generationConfig: {
            temperature: 0.9, // Higher temperature for more creative/friendly responses
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Haggle AI] Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiResponse) {
      throw new Error('Empty response from Gemini API');
    }

    // Determine if offer is accepted, rejected, or counter-offered
    let action: 'accept' | 'reject' | 'counter';
    let counterPrice: number | null = null;

    if (offerPercentage >= 90) {
      action = 'accept';
    } else if (offerPercentage >= 85) {
      action = 'counter';
      counterPrice = Math.round(originalPriceNum * 0.875); // Suggest 87.5%
    } else {
      action = 'reject';
      counterPrice = Math.round(minPrice); // Suggest minimum price
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      action,
      counterPrice,
      originalPrice: originalPriceNum,
      userOffer: userOfferNum,
      minPrice,
    });

  } catch (error: any) {
    console.error('[Haggle AI] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process negotiation',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
