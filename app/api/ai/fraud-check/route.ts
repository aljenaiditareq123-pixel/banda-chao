import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ai/fraud-check
 * Analyze transaction for fraud detection using Gemini AI as cybersecurity expert
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
      orderAmount,
      itemCount,
      ipAddress,
      accountAgeDays,
      purchaseHistory,
      userId,
      productNames,
    } = body;

    // Validate required fields
    if (orderAmount === undefined || orderAmount === null) {
      return NextResponse.json(
        { error: 'orderAmount is required' },
        { status: 400 }
      );
    }

    if (itemCount === undefined || itemCount === null) {
      return NextResponse.json(
        { error: 'itemCount is required' },
        { status: 400 }
      );
    }

    // Build the cybersecurity expert prompt
    const accountAgeInfo = accountAgeDays !== undefined && accountAgeDays !== null
      ? `عمر الحساب: ${accountAgeDays} يوم${accountAgeDays > 1 ? 'ات' : ''}`
      : 'عمر الحساب: غير معروف';
    
    const purchaseHistoryInfo = purchaseHistory !== undefined
      ? `عدد المشتريات السابقة: ${purchaseHistory}`
      : 'عدد المشتريات السابقة: غير معروف';
    
    const ipInfo = ipAddress ? `عنوان IP: ${ipAddress}` : 'عنوان IP: غير معروف';
    const productsInfo = productNames && productNames.length > 0
      ? `المنتجات: ${productNames.join(', ')}`
      : '';

    const prompt = `أنت خبير أمن سيبراني متخصص في كشف عمليات الاحتيال في التجارة الإلكترونية.

**المهمة:**
قم بتحليل معاملة شراء وتحقق من احتمالية كونها احتيال.

**بيانات المعاملة:**
- مبلغ الطلب: ${orderAmount} درهم إماراتي
- عدد المنتجات: ${itemCount}
${ipInfo}
${accountAgeInfo}
${purchaseHistoryInfo}
${productsInfo ? `- ${productsInfo}` : ''}

**المطلوب:**
1. قم بتقييم مستوى المخاطر من 0 إلى 100 (حيث 0 = آمن تماماً، 100 = احتيال محتمل جداً)
2. حدد مستوى المخاطر: Low (0-30), Medium (31-70), High (71-100)
3. حدد الإجراء المطلوب: Approve (موافق), Review (مراجعة), Reject (رفض)
4. اشرح السبب بالعربية

**معايير التقييم:**
- حساب جديد + مبلغ كبير = خطر عالي
- حساب قديم + مبلغ صغير = خطر منخفض
- عدد منتجات كبير + قيمة عالية = خطر متوسط إلى عالي
- عنوان IP مشبوه أو غير طبيعي = خطر عالي
- نمط شراء غير طبيعي = خطر عالي

**مهم جداً:**
- أجب بصيغة JSON فقط بالشكل التالي:
{
  "riskScore": عدد_من_0_إلى_100,
  "riskLevel": "Low" أو "Medium" أو "High",
  "action": "Approve" أو "Review" أو "Reject",
  "reason": "السبب بالعربية في جملة أو جملتين"
}

- تأكد أن riskScore بين 0 و 100
- riskLevel يجب أن يتطابق مع riskScore (Low: 0-30, Medium: 31-70, High: 71-100)
- action يجب أن يتطابق مع riskLevel (Low→Approve, Medium→Review, High→Reject)`;

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
            temperature: 0.3, // Lower temperature for more consistent risk assessment
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
        console.log(`[FraudCheck] ${modelName} not available, trying gemini-1.5-pro...`);
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
                maxOutputTokens: 1024,
              },
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[FraudCheck] Gemini API error:', response.status, errorData);
        return NextResponse.json(
          { error: 'Fraud detection service unavailable', details: errorData },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!responseText) {
      return NextResponse.json(
        { error: 'No fraud analysis received from AI' },
        { status: 500 }
      );
    }

    // Parse JSON response from Gemini
    let fraudData;
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fraudData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError: any) {
      console.error('[FraudCheck] Failed to parse JSON response:', parseError);
      console.error('[FraudCheck] Raw response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse fraud analysis', details: responseText },
        { status: 500 }
      );
    }

    // Validate fraud data
    const riskScore = parseInt(fraudData.riskScore);
    if (isNaN(riskScore) || riskScore < 0 || riskScore > 100) {
      return NextResponse.json(
        { error: 'Invalid riskScore received', details: fraudData },
        { status: 500 }
      );
    }

    // Validate risk level
    const validRiskLevels = ['Low', 'Medium', 'High'];
    if (!validRiskLevels.includes(fraudData.riskLevel)) {
      // Auto-calculate risk level based on score
      if (riskScore <= 30) {
        fraudData.riskLevel = 'Low';
      } else if (riskScore <= 70) {
        fraudData.riskLevel = 'Medium';
      } else {
        fraudData.riskLevel = 'High';
      }
    }

    // Validate and set action based on risk level
    const validActions = ['Approve', 'Review', 'Reject'];
    if (!validActions.includes(fraudData.action)) {
      // Auto-set action based on risk level
      if (fraudData.riskLevel === 'Low') {
        fraudData.action = 'Approve';
      } else if (fraudData.riskLevel === 'Medium') {
        fraudData.action = 'Review';
      } else {
        fraudData.action = 'Reject';
      }
    }

    // Ensure reason exists
    if (!fraudData.reason) {
      fraudData.reason = 'تم تحليل المعاملة بناءً على البيانات المتوفرة';
    }

    return NextResponse.json({
      riskScore,
      riskLevel: fraudData.riskLevel,
      action: fraudData.action,
      reason: fraudData.reason,
    });
  } catch (error: any) {
    console.error('[FraudCheck] Error:', error);
    return NextResponse.json(
      {
        error: 'Fraud detection failed',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
