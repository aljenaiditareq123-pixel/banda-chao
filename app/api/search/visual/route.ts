import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/search/visual
 * Visual Search using Gemini Vision
 * Analyzes uploaded image and extracts product keywords for search
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

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = imageFile.type;

    // Build prompt for Gemini Vision
    const prompt = `أنت خبير تجارة إلكترونية. حلل هذه الصورة لمنتج تجاري واستخرج الكلمات المفتاحية (Keywords) المناسبة للبحث عن منتجات مشابهة.

**المطلوب:**
1. اسم المنتج (من 1-3 كلمات رئيسية بالعربية والإنجليزية)
2. الفئة/النوع (مثال: حذاء رياضي، ساعة ذكية، سماعة لاسلكية)
3. الصفات البارزة (مثال: لون، حجم، مادة)

**مهم جداً:**
- أجب بصيغة JSON فقط:
{
  "keywords": "الكلمات المفتاحية للبحث",
  "productName": "اسم المنتج",
  "category": "الفئة"
}
- الكلمات المفتاحية يجب أن تكون مناسبة للبحث (2-5 كلمات بالعربية والإنجليزية)
- لا تكتب أي نص إضافي قبل أو بعد JSON`;

    // Call Gemini Vision API
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
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Visual Search] Gemini API error:', response.status, errorText);
      
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
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                  },
                },
              ],
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 512,
            },
          }),
        }
      );

      if (!fallbackResponse.ok) {
        throw new Error(`Gemini Vision API failed: ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json() as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const analysisText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!analysisText) {
        throw new Error('Empty response from Gemini Vision API');
      }

      const analysis = parseVisualSearchResponse(analysisText);
      return NextResponse.json(analysis);
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!analysisText) {
      throw new Error('Empty response from Gemini Vision API');
    }

    const analysis = parseVisualSearchResponse(analysisText);
    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('[Visual Search] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Parse JSON response from Gemini
 */
function parseVisualSearchResponse(text: string): {
  keywords: string;
  productName: string;
  category: string;
} {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to find JSON object in the text
    const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return JSON.parse(jsonObjectMatch[0]);
    }

    // If no JSON found, use raw text as keywords
    return {
      keywords: text.substring(0, 100),
      productName: text.split(' ').slice(0, 3).join(' '),
      category: 'other',
    };
  } catch (parseError) {
    console.error('[Visual Search] Failed to parse JSON response:', text);
    return {
      keywords: text.substring(0, 100),
      productName: 'منتج',
      category: 'other',
    };
  }
}
