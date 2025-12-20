import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/summarize-reviews
 * Summarize product reviews using Gemini AI
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
    const { productId } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    // Fetch last 10-20 reviews for the product
    const reviews = await prisma.comments.findMany({
      where: {
        product_id: productId,
        content: {
          not: null,
        },
      },
      select: {
        content: true,
        review_rating: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 20, // Get last 20 reviews
    });

    // Filter out empty reviews
    const validReviews = reviews.filter(r => r.content && r.content.trim().length > 0);

    // If less than 3 reviews, don't summarize
    if (validReviews.length < 3) {
      return NextResponse.json({
        summary: null,
        message: 'Not enough reviews to generate summary (minimum 3 reviews required)',
        reviewCount: validReviews.length,
      });
    }

    // Build reviews text for Gemini
    const reviewsText = validReviews
      .map((review, index) => {
        const rating = review.review_rating ? `⭐ ${review.review_rating}/5` : '';
        return `مراجعة ${index + 1}${rating ? ` (${rating})` : ''}:\n${review.content.trim()}`;
      })
      .join('\n\n');

    // Build the summarization prompt
    const prompt = `أنت خبير في تحليل آراء المستهلكين. قم بتحليل المراجعات التالية لمنتج تجاري وألخصها في 3 نقاط رئيسية.

**المراجعات:**
${reviewsText}

**المطلوب:**
لخص آراء المشترين في 3 نقاط منفصلة:
1. ✅ **المميزات (الإيجابيات):** ما الذي أعجب المشترين في المنتج؟
2. ⚠️ **العيوب (السلبيات):** ما هي المشاكل أو النقاط السلبية التي ذكرها المشترون؟
3. 💡 **الخلاصة النهائية:** توصية عامة بناءً على جميع المراجعات

**مهم جداً:**
- أجب بصيغة JSON فقط بالشكل التالي:
{
  "pros": ["نقطة إيجابية 1", "نقطة إيجابية 2", ...],
  "cons": ["نقطة سلبية 1", "نقطة سلبية 2", ...],
  "summary": "الخلاصة النهائية في جملة أو جملتين"
}

- استخدم لغة عربية واضحة ومبسطة
- ركز على النقاط المشتركة بين المراجعات
- إذا كانت معظم المراجعات إيجابية، اذكر ذلك في الخلاصة
- إذا كانت هناك مشاكل متكررة، اذكرها بوضوح في العيوب`;

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
            temperature: 0.7,
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
        console.log(`[SummarizeReviews] ${modelName} not available, trying gemini-1.5-pro...`);
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
        console.error('[SummarizeReviews] Gemini API error:', response.status, errorData);
        return NextResponse.json(
          { error: 'Review summarization service unavailable', details: errorData },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!responseText) {
      return NextResponse.json(
        { error: 'No summary received from AI' },
        { status: 500 }
      );
    }

    // Parse JSON response from Gemini
    let summaryData;
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summaryData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError: any) {
      console.error('[SummarizeReviews] Failed to parse JSON response:', parseError);
      console.error('[SummarizeReviews] Raw response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse review summary', details: responseText },
        { status: 500 }
      );
    }

    // Validate summary data
    if (
      !Array.isArray(summaryData.pros) ||
      !Array.isArray(summaryData.cons) ||
      typeof summaryData.summary !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid summary format received', details: summaryData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      summary: {
        pros: summaryData.pros || [],
        cons: summaryData.cons || [],
        summary: summaryData.summary || '',
      },
      reviewCount: validReviews.length,
    });
  } catch (error: any) {
    console.error('[SummarizeReviews] Error:', error);
    return NextResponse.json(
      {
        error: 'Review summarization failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
