import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { generateFounderAIResponse } from '../lib/gemini';
import { getAssistantProfile } from '../lib/assistantProfiles';

const router = Router();

// In-memory conversation context (in production, use Redis or database)
const conversationContexts = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>();

router.post('/assistant', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationId, clearContext, assistant } = req.body;
    const userId = req.user?.id;

    // Strict validation for message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and cannot be empty',
        code: 'INVALID_MESSAGE'
      });
    }

    // Get assistant profile
    const assistantRole = assistant || 'consultant';
    const profile = getAssistantProfile(assistantRole);
    const SYSTEM_PROMPT = profile.systemPrompt;

    // Generate conversation ID if not provided
    const convId = conversationId || `founder-${userId}`;

    // Clear context if requested
    if (clearContext) {
      conversationContexts.delete(convId);
    }

    // Get or initialize conversation context
    let context = conversationContexts.get(convId) || [];
    
    // Add user message to context
    context.push({ role: 'user', content: message });

    // Get current KPIs for context
    const [totalArtisans, totalProducts, totalVideos, totalUsers, totalOrders, paidOrders] = await Promise.all([
      prisma.users.count({ where: { role: 'MAKER' as any } }),
      prisma.products.count({ where: {} }),
      prisma.videos.count(),
      prisma.users.count(),
      prisma.orders.count(),
      prisma.orders.count({ where: { status: 'PAID' } }),
    ]);

    const kpisContext = `
**المؤشرات الحالية:**
- إجمالي الحرفيين: ${totalArtisans}
- إجمالي المنتجات: ${totalProducts}
- إجمالي الفيديوهات: ${totalVideos}
- إجمالي المستخدمين: ${totalUsers}
- إجمالي الطلبات: ${totalOrders}
- الطلبات المدفوعة: ${paidOrders}
`;

    // Build conversation history
    const conversationHistory = context
      .slice(-10) // Keep last 10 messages for context
      .map((msg) => `${msg.role === 'user' ? 'المستخدم' : 'المساعد'}: ${msg.content}`)
      .join('\n\n');

    // Build full prompt for AI Assistant
    const prompt = `${SYSTEM_PROMPT}

${kpisContext}

${conversationHistory ? `\n**تاريخ المحادثة:**\n${conversationHistory}\n` : ''}

**رسالة المستخدم الحالية:**
${message}

**تعليمات:**
- أجب بالعربية فقط
- كن مفيداً، عملياً، ومباشراً
- ركّز على تخطيط العمل، المراحل، الأولويات، وتحسين المنصة
- استخدم البيانات المقدمة أعلاه في إجابتك عند الحاجة
- إذا كان هناك سياق محادثة سابقة، استخدمه لفهم السياق`;

    console.log('[AIAssistant] Processing request with Gemini...');
    console.log('[AIAssistant] Conversation ID:', convId);
    console.log('[AIAssistant] Message length:', message.length, 'characters');

    // Call Gemini 1.0 Pro with error handling
    let response: string;
    try {
      response = await generateFounderAIResponse(prompt);
      console.log('[AIAssistant] Response generated successfully, length:', response.length, 'characters');
    } catch (error: any) {
      console.error('[AIAssistant] Failed to generate response:', {
        message: error?.message || 'Unknown error',
        status: error?.status || error?.statusCode || 'N/A',
        originalError: error?.originalError ? {
          message: error.originalError.message,
          status: error.originalError.status || error.originalError.statusCode,
        } : null,
        fullError: process.env.NODE_ENV === 'development' ? error : undefined,
      });
      
      // Return user-friendly error message
      let userMessage = 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.';
      
      // Provide more specific error messages based on error type
      if (error?.message?.includes('timeout')) {
        userMessage = 'استغرق الرد وقتاً طويلاً. يرجى المحاولة مرة أخرى أو تبسيط الرسالة.';
      } else if (error?.message?.includes('All Gemini models failed') || error?.message?.includes('not found')) {
        userMessage = 'خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً.';
      } else if (error?.message?.includes('GEMINI_API_KEY')) {
        userMessage = 'خدمة الذكاء الاصطناعي غير مُعدة بشكل صحيح. يرجى الاتصال بالدعم.';
      }
      
      // Return detailed error response
      return res.status(500).json({
        success: false,
        error: 'AI_SERVICE_ERROR',
        message: userMessage,
        details: process.env.NODE_ENV === 'development' ? {
          originalError: error?.originalError?.message || error?.message,
          status: error?.status || error?.statusCode,
          stack: error?.stack,
        } : undefined,
      });
    }

    // Add assistant response to context
    context.push({ role: 'assistant', content: response });
    
    // Keep context limited to last 20 messages
    if (context.length > 20) {
      context = context.slice(-20);
    }
    
    conversationContexts.set(convId, context);

    res.json({
      success: true,
      response,
      assistant: 'consultant',
      conversationId: convId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AIAssistant] Unexpected error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      body: req.body,
    });
    
    res.status(500).json({ 
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: error?.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error?.stack,
      } : undefined,
    });
  }
});

// AI Pricing Suggestion
router.post('/pricing-suggestion', authenticateToken, requireRole(['MAKER', 'FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { productName, description, category, cost } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required',
      });
    }

    // Build prompt for Gemini AI pricing suggestion
    const pricingPrompt = `أنت خبير في تسعير المنتجات اليدوية والحرفية. مهمتك هي اقتراح سعر مناسب لمنتج بناءً على المعلومات التالية:

**معلومات المنتج:**
- اسم المنتج: ${productName}
- الوصف: ${description || 'غير متوفر'}
- الفئة: ${category || 'عام'}
${cost ? `- التكلفة الإنتاجية: ${cost} ${req.body.currency || 'USD'}` : '- التكلفة الإنتاجية: غير محددة'}

**المطلوب:**
1. اقترح سعراً مناسباً للمنتج (بالعملة: ${req.body.currency || 'USD'})
2. قدم ثلاثة خيارات: سعر تنافسي، سعر متوسط، سعر مميز
3. اشرح سبب كل سعر بشكل مختصر
4. قدم نصيحة إضافية حول التسعير

**تعليمات:**
- أجب بالعربية فقط
- كن عملياً ومباشراً
- راعِ نوع المنتج والفئة عند الاقتراح
- إذا كانت التكلفة متوفرة، استخدمها كأساس للاقتراح`;

    console.log('[AIPricing] Processing pricing suggestion with Gemini...');
    
    // Call Gemini AI for pricing suggestion
    const aiResponse = await generateFounderAIResponse(pricingPrompt);
    
    console.log('[AIPricing] Response generated successfully');

    // Extract suggested price from AI response (fallback to calculation if needed)
    const basePrice = cost ? cost * 2.5 : 50;
    const categoryMultipliers: Record<string, number> = {
      handmade: 1.2,
      jewelry: 1.5,
      textiles: 1.1,
      art: 1.8,
    };
    const multiplier = categoryMultipliers[category?.toLowerCase() || 'handmade'] || 1.2;
    const fallbackPrice = Math.round(basePrice * multiplier);

    // Try to extract price from AI response, otherwise use fallback
    const priceMatch = aiResponse.match(/(\d+(?:\.\d+)?)\s*(?:USD|دولار|ريال|درهم|يوان)/i);
    const suggestedPrice = priceMatch ? Math.round(parseFloat(priceMatch[1])) : fallbackPrice;

    const response = aiResponse || `بناءً على المعلومات المقدمة:
- اسم المنتج: ${productName}
- الفئة: ${category || 'عام'}
${cost ? `- التكلفة: ${cost}` : ''}

**السعر المقترح**: ${suggestedPrice} ${req.body.currency || 'USD'}

**التوصية**: 
- سعر تنافسي: ${Math.round(suggestedPrice * 0.9)} ${req.body.currency || 'USD'}
- سعر متوسط: ${suggestedPrice} ${req.body.currency || 'USD'}
- سعر مميز: ${Math.round(suggestedPrice * 1.2)} ${req.body.currency || 'USD'}

*ملاحظة: هذا اقتراح أولي. يُنصح بمراجعة أسعار السوق والمنافسين.*`;

    res.json({
      success: true,
      suggestion: response,
      suggestedPrice,
      priceRange: {
        competitive: Math.round(suggestedPrice * 0.9),
        standard: suggestedPrice,
        premium: Math.round(suggestedPrice * 1.2),
      },
    });
  } catch (error: any) {
    console.error('AI Pricing Suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// AI Content Helper (Description Generation)
router.post('/content-helper', authenticateToken, requireRole(['MAKER', 'FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { productName, category, keyFeatures } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required',
      });
    }

    // Build prompt for Gemini AI content generation
    const contentPrompt = `أنت خبير في كتابة وصف المنتجات اليدوية والحرفية. مهمتك هي كتابة وصف جذاب ومهني لمنتج بناءً على المعلومات التالية:

**معلومات المنتج:**
- اسم المنتج: ${productName}
- الفئة: ${category || 'عام'}
${keyFeatures && Array.isArray(keyFeatures) && keyFeatures.length > 0 
  ? `- المميزات الرئيسية:\n${keyFeatures.map((f: string) => `  • ${f}`).join('\n')}`
  : ''}

**المطلوب:**
اكتب وصفاً احترافياً للمنتج يتضمن:
1. مقدمة جذابة عن المنتج
2. المميزات والفوائد الرئيسية
3. معلومات عن الجودة والتصنيع
4. دعوة للعمل (Call to Action) مناسبة

**تعليمات:**
- أجب بالعربية فقط
- استخدم لغة جذابة ومهنية
- ركز على القيمة والجودة
- اجعل الوصف مناسباً للتسويق عبر الإنترنت
- لا تستخدم علامات التنسيق المفرطة (مثل ** أو ##)`;

    console.log('[AIContent] Processing content generation with Gemini...');
    
    // Call Gemini AI for content generation
    const description = await generateFounderAIResponse(contentPrompt);
    
    console.log('[AIContent] Response generated successfully');
    
    // Fallback to template if AI response is empty or error
    const finalDescription = description || `**${productName}**

${category ? `فئة: ${category}` : ''}

${keyFeatures && Array.isArray(keyFeatures) && keyFeatures.length > 0 
  ? `المميزات الرئيسية:\n${keyFeatures.map((f: string) => `- ${f}`).join('\n')}` 
  : ''}

منتج يدوي فريد يجمع بين الجمال والجودة. مصنوع بعناية فائقة ليوفر تجربة استثنائية.

*هذا وصف مقترح. يمكنك تعديله حسب احتياجاتك.*`;

    res.json({
      success: true,
      description: finalDescription,
      message: 'تم إنشاء وصف مقترح. يمكنك تعديله قبل الحفظ.',
    });
  } catch (error: any) {
    console.error('AI Content Helper error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Founder AI endpoint - Uses real Gemini 1.0 Pro
router.post('/founder', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { message, context: additionalContext } = req.body;
    const userId = req.user?.id;

    // Validate message
    const userMessage = message?.trim();
    if (!userMessage) {
      return res.status(400).json({ 
        success: false, 
        error: "EMPTY_MESSAGE",
        message: "Message is required and cannot be empty"
      });
    }

    console.log(`[FounderAI] Request from founder ${userId}`);

    // Get assistant profile for system prompt
    const profile = getAssistantProfile('consultant');
    const SYSTEM_PROMPT = profile.systemPrompt;

    // Get current KPIs for context
    const [totalArtisans, totalProducts, totalVideos, totalUsers, totalOrders, paidOrders] = await Promise.all([
      prisma.users.count({ where: { role: 'MAKER' as any } }),
      prisma.products.count({ where: {} }),
      prisma.videos.count(),
      prisma.users.count(),
      prisma.orders.count(),
      prisma.orders.count({ where: { status: 'PAID' } }),
    ]);

    const kpisContext = `
**المؤشرات الحالية:**
- إجمالي الحرفيين: ${totalArtisans}
- إجمالي المنتجات: ${totalProducts}
- إجمالي الفيديوهات: ${totalVideos}
- إجمالي المستخدمين: ${totalUsers}
- إجمالي الطلبات: ${totalOrders}
- الطلبات المدفوعة: ${paidOrders}
`;

    // Build full prompt for Founder Panda
    const prompt = `${SYSTEM_PROMPT}

${kpisContext}

${additionalContext ? `\n**سياق إضافي:**\n${additionalContext}\n` : ''}

**رسالة المؤسس:**
${userMessage}

**تعليمات:**
- أجب بالعربية فقط
- كن مفيداً، عملياً، ومباشراً
- ركّز على تخطيط العمل، المراحل، الأولويات، وتحسين المنصة
- لا تدخل في مواضيع لا علاقة لها بباندتشاو
- استخدم البيانات المقدمة أعلاه في إجابتك عند الحاجة`;

    console.log('[FounderPanda] Processing request for founder...');
    console.log('[FounderPanda] User ID:', userId);
    console.log('[FounderPanda] Message length:', userMessage.length, 'characters');

    // Call Gemini 1.0 Pro with error handling
    let reply: string;
    try {
      reply = await generateFounderAIResponse(prompt);
      console.log('[FounderPanda] Response generated successfully, length:', reply.length, 'characters');
    } catch (error: any) {
      console.error('[FounderPanda] Failed to generate response:', {
        message: error?.message || 'Unknown error',
        originalError: error?.originalError || error,
      });
      
      // Return detailed error response
      return res.status(500).json({
        success: false,
        error: 'AI_SERVICE_ERROR',
        message: error?.message || 'Failed to generate AI response',
        details: process.env.NODE_ENV === 'development' ? {
          originalError: error?.originalError?.message || error?.message,
          stack: error?.stack,
        } : undefined,
      });
    }

    return res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[FounderAI] Unexpected error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      body: req.body,
    });
    
    res.status(500).json({ 
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: error?.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error?.stack,
      } : undefined,
    });
  }
});

// TODO: AI can eventually:
// - Analyze maker performance
// - Suggest product pricing (✅ Basic implementation)
// - Analyze buyer behavior
// - Recommend marketing strategies
// - Predict trends
// - Generate reports
// - Content generation (✅ Basic implementation)

export default router;
