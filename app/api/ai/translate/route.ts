import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/translate
 * Translate text using Gemini AI
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
    const { text, targetLanguage } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Map language codes to full names for better translation quality
    const languageMap: Record<string, string> = {
      ar: 'Arabic',
      en: 'English',
      zh: 'Chinese',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
      it: 'Italian',
      ja: 'Japanese',
      ko: 'Korean',
      pt: 'Portuguese',
      ru: 'Russian',
      'ar-SA': 'Arabic',
      'zh-CN': 'Chinese (Simplified)',
      'en-US': 'English',
    };

    const targetLangName = languageMap[targetLanguage] || targetLanguage;

    // Construct translation prompt
    const prompt = `Translate the following text to ${targetLangName}. 
    
**Important instructions:**
- Preserve the formatting (line breaks, paragraphs, etc.)
- Keep any special characters, numbers, and symbols as they are
- Maintain the tone and style of the original text
- If the text is already in ${targetLangName}, return it as-is
- Do not add any explanations or additional text, just return the translation

**Text to translate:**
${text.trim()}

**Translation:**`;

    // Use Gemini 1.5 Flash for faster translation (fallback to Pro if needed)
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
            temperature: 0.3, // Lower temperature for more accurate translation
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      // Try fallback to gemini-1.5-pro
      if (response.status === 404 || response.status === 400) {
        console.log(`[Translate] ${modelName} not available, trying gemini-1.5-pro...`);
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
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Translate] Gemini API error:', response.status, errorData);
        return NextResponse.json(
          { error: 'Translation service unavailable', details: errorData },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    const translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!translatedText) {
      return NextResponse.json(
        { error: 'No translation received from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText,
      originalText: text.trim(),
      targetLanguage,
    });
  } catch (error: any) {
    console.error('[Translate] Error:', error);
    return NextResponse.json(
      {
        error: 'Translation failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
