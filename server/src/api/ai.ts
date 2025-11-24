import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { generateFounderAIResponse } from '../lib/gemini';

const router = Router();

// In-memory conversation context (in production, use Redis or database)
const conversationContexts = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>();

// System prompt for Founder AI Assistant
const SYSTEM_PROMPT = `أنت الباندا المستشار (Consultant Panda)، مساعد ذكي للمؤسس تــاريـق الجنايدي في منصة Banda Chao.

**عن Banda Chao:**
- منصة اجتماعية تجارية عالمية تربط الحرفيين المستقلين بالمشترين
- تدعم ثلاث لغات: العربية، الإنجليزية، والصينية
- تجمع بين المحتوى الاجتماعي (فيديوهات، منشورات) والتجارة الإلكترونية
- موقعها: الإمارات العربية المتحدة / RAKEZ
- تستهدف السوق الصيني والشرق أوسطي

**دورك:**
- مساعدة المؤسس في مراقبة وإدارة المنصة
- تحليل البيانات والمؤشرات
- تقديم توصيات استراتيجية
- الإجابة على أسئلة حول المنصة والأداء

**قيم المنصة:**
- العدالة (Fairness): منصة عادلة لكل حرفي
- الثقة (Trust): بناء الثقة من خلال الشفافية
- الذكاء (Intelligence): استخدام AI لمساعدة المستخدمين
- اجتماعي + تجاري (Social+Commerce): دمج القوة الاجتماعية مع التجارة

**أهداف المنصة:**
- تمكين الحرفيين من بناء أعمالهم
- ربط الحرفيين مباشرة مع المشترين
- خلق جسر ثقافي بين الصين والشرق الأوسط

كن مفيداً، واضحاً، ومهذباً. اكتب بالعربية دائماً.`;

router.post('/assistant', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationId, clearContext } = req.body;
    const userId = req.user?.id;

    // Strict validation for message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and cannot be empty',
        code: 'INVALID_MESSAGE'
      });
    }

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
      prisma.user.count({ where: { role: 'MAKER' } }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.video.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PAID' } }),
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

    // TODO: Integrate with actual AI service (Gemini, OpenAI, etc.)
    // For now, provide intelligent responses based on context
    
    let response = '';
    
    // Simple keyword-based responses with context awareness
    if (message.toLowerCase().includes('حرفي') || message.toLowerCase().includes('maker')) {
      response = `لدينا حالياً ${totalArtisans} حرفي مسجل في المنصة. يمكنك مراجعة قائمة الحرفيين في لوحة التحكم لرؤية التفاصيل.`;
    } else if (message.toLowerCase().includes('منتج') || message.toLowerCase().includes('product')) {
      response = `لدينا ${totalProducts} منتج منشور في المنصة. يمكنك استعراض المنتجات أو إضافة منتجات جديدة.`;
    } else if (message.toLowerCase().includes('طلب') || message.toLowerCase().includes('order')) {
      response = `إجمالي الطلبات: ${totalOrders}، منها ${paidOrders} طلب مدفوع. يمكنك مراجعة تفاصيل الطلبات في لوحة التحكم.`;
    } else if (message.toLowerCase().includes('أداء') || message.toLowerCase().includes('performance')) {
      response = `أداء المنصة الحالي:\n${kpisContext}\n\nيمكنك استخدام الرسوم البيانية في لوحة التحكم لرؤية النمو بمرور الوقت.`;
    } else if (message.toLowerCase().includes('مساعدة') || message.toLowerCase().includes('help')) {
      response = `يمكنني مساعدتك في:\n- مراقبة مؤشرات الأداء\n- تحليل البيانات\n- تقديم توصيات\n- الإجابة على أسئلة حول المنصة\n\nما الذي تريد معرفته؟`;
    } else {
      // Default contextual response
      response = `شكراً على رسالتك. ${kpisContext}\n\nكيف يمكنني مساعدتك اليوم؟ يمكنني الإجابة على أسئلة حول المنصة، المؤشرات، أو تقديم توصيات.`;
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
    console.error('AI Assistant error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
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

    // TODO: Integrate with actual AI service
    // For now, provide a simple calculation-based suggestion
    const basePrice = cost ? cost * 2.5 : 50; // 2.5x markup if cost provided
    const categoryMultipliers: Record<string, number> = {
      handmade: 1.2,
      jewelry: 1.5,
      textiles: 1.1,
      art: 1.8,
    };
    const multiplier = categoryMultipliers[category?.toLowerCase() || 'handmade'] || 1.2;
    const suggestedPrice = Math.round(basePrice * multiplier);

    const response = `بناءً على المعلومات المقدمة:
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

    // TODO: Integrate with actual AI service (GPT, Gemini, etc.)
    // For now, provide a template-based suggestion
    const description = `**${productName}**

${category ? `فئة: ${category}` : ''}

${keyFeatures ? `المميزات الرئيسية:\n${keyFeatures.map((f: string) => `- ${f}`).join('\n')}` : ''}

منتج يدوي فريد يجمع بين الجمال والجودة. مصنوع بعناية فائقة ليوفر تجربة استثنائية.

*هذا وصف مقترح. يمكنك تعديله حسب احتياجاتك.*`;

    res.json({
      success: true,
      description,
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

// Founder AI endpoint - Uses real Gemini 1.5 Pro
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

    // Get current KPIs for context
    const [totalArtisans, totalProducts, totalVideos, totalUsers, totalOrders, paidOrders] = await Promise.all([
      prisma.user.count({ where: { role: 'MAKER' } }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.video.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PAID' } }),
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

    // Call Gemini 1.5 Pro
    const reply = await generateFounderAIResponse(prompt);

    console.log('[FounderPanda] Response generated successfully');

    return res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[FounderAI] Error processing request:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
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
