import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const prisma = new PrismaClient();

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

    // Normalize text for cache lookup (trim and normalize whitespace)
    const normalizedText = text.trim().replace(/\s+/g, ' ');

    // 🛡️ STEP 1: Check cache first (0 cost, ultra-fast)
    try {
      const cachedTranslation = await prisma.translation_cache.findUnique({
        where: {
          original_text_target_language: {
            original_text: normalizedText,
            target_language: targetLanguage,
          },
        },
      });

      if (cachedTranslation) {
        console.log(`[Translate] ✅ Cache HIT for text (${normalizedText.substring(0, 50)}...) to ${targetLanguage}`);
        return NextResponse.json({
          translatedText: cachedTranslation.translated_text,
          originalText: normalizedText,
          targetLanguage,
          cached: true, // Flag to indicate this was from cache
        });
      }
    } catch (cacheError: any) {
      // If cache lookup fails, continue to translation (don't block user)
      console.warn('[Translate] Cache lookup failed, continuing to translation:', cacheError?.message);
    }

    console.log(`[Translate] 🔍 Cache MISS for text (${normalizedText.substring(0, 50)}...) to ${targetLanguage}, calling Gemini...`);

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

    // 🛡️ STEP 2: Save to cache for future requests (async, don't block response)
    prisma.translation_cache
      .upsert({
        where: {
          original_text_target_language: {
            original_text: normalizedText,
            target_language: targetLanguage,
          },
        },
        update: {
          translated_text: translatedText,
          updated_at: new Date(),
        },
        create: {
          original_text: normalizedText,
          target_language: targetLanguage,
          translated_text: translatedText,
        },
      })
      .then(() => {
        console.log(`[Translate] ✅ Saved translation to cache for future use`);
      })
      .catch((cacheError: any) => {
        // Log error but don't fail the request
        console.warn('[Translate] Failed to save to cache (non-blocking):', cacheError?.message);
      });

    return NextResponse.json({
      translatedText,
      originalText: normalizedText,
      targetLanguage,
      cached: false, // Flag to indicate this was fresh from Gemini
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
