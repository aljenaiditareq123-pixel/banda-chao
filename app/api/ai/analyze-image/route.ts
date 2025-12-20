import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/analyze-image
 * Analyzes product image using Gemini Vision AI
 * Extracts: name, category, color, description
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
    const { imageBase64, imageUrl } = body;

    // Validate input - must have either base64 or URL
    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'imageBase64 or imageUrl is required' },
        { status: 400 }
      );
    }

    // Build the prompt for Gemini Vision
    const prompt = `حلل هذه الصورة لمنتج تجاري. استخرج لي المعلومات التالية فقط (بالعربية):

1. اسم المنتج المقترح: (اسم عربي مناسب للمنتج)
2. الفئة (Category): (اختر واحدة فقط من: handmade, art, jewelry, clothing, home, electronics, other)
3. اللون الرئيسي: (اسم اللون الرئيسي بالعربي)
4. وصف قصير جداً: (جملة أو جملتان فقط)

**مهم جداً:**
- أجب بصيغة JSON فقط بالشكل التالي:
{
  "name": "اسم المنتج",
  "category": "الفئة",
  "color": "اللون",
  "description": "الوصف"
}
- لا تكتب أي نص إضافي قبل أو بعد JSON
- استخدم الفئات الإنجليزية فقط: handmade, art, jewelry, clothing, home, electronics, other`;

    // Prepare image data for Gemini
    let imageData: { inlineData?: { data: string; mimeType: string }; url?: string } | undefined;

    if (imageBase64) {
      // Extract base64 data (remove data:image/...;base64, prefix if present)
      let base64Data = imageBase64;
      let mimeType = 'image/jpeg';

      if (imageBase64.includes(',')) {
        const parts = imageBase64.split(',');
        const dataPart = parts[1];
        const headerPart = parts[0];

        // Extract mime type from header
        const mimeMatch = headerPart.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }

        base64Data = dataPart;
      }

      imageData = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };
    } else if (imageUrl) {
      imageData = {
        url: imageUrl,
      };
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      );
    }

    // Call Gemini Vision API
    const modelName = 'gemini-1.5-flash'; // Using flash for faster responses with vision

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
              imageData,
            ],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Vision AI] Gemini API error:', response.status, errorText);

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
                imageData,
              ],
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
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

      // Parse JSON from response
      const analysis = parseAnalysisResponse(analysisText);
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

    // Parse JSON from response
    const analysis = parseAnalysisResponse(analysisText);
    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('[Vision AI] Error:', error);
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
 * Parse JSON response from Gemini, handling cases where response includes markdown or extra text
 */
function parseAnalysisResponse(text: string): {
  name: string;
  category: string;
  color: string;
  description: string;
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

    // If no JSON found, try parsing the whole text
    return JSON.parse(text);
  } catch (parseError) {
    console.error('[Vision AI] Failed to parse JSON response:', text);
    // Return default structure with parsed values where possible
    return {
      name: '',
      category: 'other',
      color: '',
      description: text.substring(0, 200), // Use raw text as fallback description
    };
  }
}
