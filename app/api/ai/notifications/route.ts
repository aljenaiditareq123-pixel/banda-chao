import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/notifications
 * Generate smart, personalized push notification message using Gemini AI
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
    const {
      cartItems, // Array of products in cart
      favoriteProducts, // Array of favorite/liked products
      recentlyViewed, // Array of recently viewed products
      userName, // User's name (optional)
    } = body;

    // Build context from user data
    const cartItemsInfo = cartItems && cartItems.length > 0
      ? `المنتجات في السلة: ${cartItems.map((item: any) => item.name || item.productName).join(', ')}`
      : '';
    
    const favoriteProductsInfo = favoriteProducts && favoriteProducts.length > 0
      ? `المنتجات المفضلة: ${favoriteProducts.slice(0, 3).map((p: any) => p.name).join(', ')}`
      : '';
    
    const recentlyViewedInfo = recentlyViewed && recentlyViewed.length > 0
      ? `آخر المنتجات المُتصفحة: ${recentlyViewed.slice(0, 3).map((p: any) => p.name).join(', ')}`
      : '';

    const userNameContext = userName ? `اسم المستخدم: ${userName}.` : '';

    // Build the smart notification prompt
    const prompt = `أنت خبير تسويق إلكتروني متخصص في كتابة إشعارات دفع (Push Notifications) جذابة وشخصية جداً.

**المهمة:**
اكتب إشعاراً ذكياً وشخصياً جداً للمستخدم بناءً على نشاطه في الموقع.

**بيانات المستخدم:**
${userNameContext}
${cartItemsInfo ? `- ${cartItemsInfo}` : ''}
${favoriteProductsInfo ? `- ${favoriteProductsInfo}` : ''}
${recentlyViewedInfo ? `- ${recentlyViewedInfo}` : ''}

**المتطلبات:**
1. اجعل الرسالة شخصية جداً - استخدم اسم المنتج/المنتجات المحددة
2. اربط المنتجات ببعضها إذا أمكن (مثلاً: الحذاء الرياضي مع القميص الأزرق)
3. استخدم نبرة ودودة ومشجعة (كأنك تتحدث لصديق)
4. أضف عنصر إلحاح أو إغراء إذا كان مناسباً (مثلاً: خصم، عرض محدود)
5. اجعل الرسالة قصيرة (50-80 حرفاً) ومناسبة للإشعارات
6. استخدم الرموز التعبيرية المناسبة (Emoji واحد أو اثنين)
7. لا تستخدم علامات الترقيم المفرطة

**أمثلة على الرسائل الجيدة:**
- "وجدنا لك الحذاء الرياضي الذي يناسب قميصك الأزرق.. وبخصم خاص! 🎁"
- "الساعة الذكية التي أضفتها للمفضلة متوفرة الآن بخصم 20% ⏰"
- "لم تكمل شراء الجورب في السلة.. اضغط لإتمام الطلب 🛒"

**مهم جداً:**
- أجب فقط بالنص النهائي للإشعار (بدون عنوان، بدون JSON، فقط النص)
- استخدم اللغة العربية
- اجعل الرسالة جذابة ومقنعة ولكن ليست مبالغاً فيها`;

    // Use Gemini 1.5 Flash for faster response
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
            temperature: 0.8, // Higher temperature for more creative and personal messages
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256, // Short messages for notifications
          },
        }),
      }
    );

    if (!response.ok) {
      // Try fallback to gemini-1.5-pro
      if (response.status === 404 || response.status === 400) {
        console.log(`[Notifications] ${modelName} not available, trying gemini-1.5-pro...`);
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
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 256,
              },
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Notifications] Gemini API error:', response.status, errorData);
        return NextResponse.json(
          { error: 'Notification generation service unavailable', details: errorData },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    let notificationText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!notificationText) {
      return NextResponse.json(
        { error: 'No notification message received from AI' },
        { status: 500 }
      );
    }

    // Clean up the response (remove quotes if wrapped, remove markdown formatting)
    notificationText = notificationText
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold
      .trim();

    // If no user data provided, return a generic notification
    if (!cartItemsInfo && !favoriteProductsInfo && !recentlyViewedInfo) {
      notificationText = '👋 مرحباً! تصفح منتجاتنا المميزة واكتشف عروض جديدة';
    }

    return NextResponse.json({
      message: notificationText,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json(
      {
        error: 'Notification generation failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
