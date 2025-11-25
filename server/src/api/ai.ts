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

    // Call Gemini 1.5 Pro
    const response = await generateFounderAIResponse(prompt);

    console.log('[AIAssistant] Response generated successfully');

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

    // Get assistant profile for system prompt
    const profile = getAssistantProfile('consultant');
    const SYSTEM_PROMPT = profile.systemPrompt;

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
