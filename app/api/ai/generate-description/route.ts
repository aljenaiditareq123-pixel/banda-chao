import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/generate-description
 * Generates product description using Gemini AI
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

    // Parse request body
    const body = await request.json();
    const { productName, category } = body;

    // Validate input
    if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
      return NextResponse.json(
        { error: 'productName is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Build the marketing-focused prompt in Arabic
    const categoryContext = category ? `الفئة: ${category}.` : '';
    const prompt = `أنت خبير تسويق إلكتروني محترف متخصص في كتابة أوصاف المنتجات الجذابة.

**المهمة:**
اكتب وصفاً تسويقياً جذاباً باللغة العربية الفصحى المبسطة للمنتج التالي:
- اسم المنتج: ${productName.trim()}
${categoryContext ? `- ${categoryContext}` : ''}

**المتطلبات:**
1. ركز على الفوائد (Benefits) للمشتري وليس فقط المزايا (Features)
2. استخدم لغة عربية فصحى مبسطة وجذابة
3. أضف رموز تعبيرية (Emojis) مناسبة في الأماكن المناسبة لزيادة الجاذبية
4. اجعل الوصف يتراوح بين 3-5 جمل
5. استخدم نبرة إيجابية ومشجعة
6. لا تستخدم markdown formatting، فقط نص عادي

**الوصف المطلوب:`;

    // Call Gemini API using REST API v1
    const modelName = 'gemini-1.5-flash'; // Using flash for faster responses
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Copywriter] Gemini API error:', response.status, errorText);
      
      // Try fallback model
      const fallbackResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
        }
      );

      if (!fallbackResponse.ok) {
        throw new Error(`Gemini API failed: ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json() as { 
        candidates?: Array<{ 
          content?: { 
            parts?: Array<{ text?: string }> 
          } 
        }> 
      };
      
      const description = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!description) {
        throw new Error('Empty response from Gemini API');
      }

      return NextResponse.json({ description });
    }

    const data = await response.json() as { 
      candidates?: Array<{ 
        content?: { 
          parts?: Array<{ text?: string }> 
        } 
      }> 
    };
    
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!description) {
      throw new Error('Empty response from Gemini API');
    }

    return NextResponse.json({ description });

  } catch (error: any) {
    console.error('[AI Copywriter] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate description',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
