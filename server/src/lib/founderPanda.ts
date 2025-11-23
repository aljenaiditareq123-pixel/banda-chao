/**
 * Founder Panda - Super Intelligent Founder Assistant
 * EXCLUSIVE for Banda Chao founder only
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Operating modes for Founder Panda v2
export enum FounderOperatingMode {
  STRATEGY_MODE = 'STRATEGY_MODE',
  PRODUCT_MODE = 'PRODUCT_MODE', 
  TECH_MODE = 'TECH_MODE',
  MARKETING_MODE = 'MARKETING_MODE',
  CHINA_MODE = 'CHINA_MODE'
}

// Slash commands for quick actions
export enum FounderSlashCommand {
  PLAN = '/plan',
  TASKS = '/tasks',
  RISKS = '/risks',
  ROADMAP = '/roadmap',
  SCRIPT = '/script',
  EMAIL = '/email'
}

interface FounderPandaRequest {
  message: string;
  context?: any;
  mode?: FounderOperatingMode;
  slashCommand?: FounderSlashCommand;
}

interface FounderPandaResponse {
  response: string;
  timestamp: Date;
  tokensUsed?: number;
  mode?: FounderOperatingMode;
  sessionSummary?: string;
}

class FounderPandaService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('[FounderPanda] CRITICAL: GEMINI_API_KEY environment variable is not set');
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Never log the actual API key, only confirm it exists
    console.log('[FounderPanda] Initializing with Gemini API key (length:', apiKey.length, 'characters)');

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    console.log('[FounderPanda] Service initialized successfully with model: gemini-1.5-flash');
  }

  /**
   * Get system prompt for Founder Panda v1 - Deeply integrated with six core documents
   */
  private getSystemPrompt(): string {
    return process.env.FOUNDER_PANDA_SYSTEM_PROMPT || `
أنت «باندا المؤسس» — الذكاء الاصطناعي المركزي والمستشار الاستراتيجي الشخصي لطارق الجنيدي، مؤسس منصة Banda Chao.

تعمل حصرياً مع المؤسس فقط (role === 'FOUNDER') ولا تتعامل مطلقاً مع المشترين أو الحرفيين أو أي مستخدمين آخرين.

## 🏛️ الهوية القانونية والاستراتيجية لـ Banda Chao:

### الموقع القانوني المحايد (الوثيقة القانونية):
- منصة إماراتية مسجلة في منطقة RAKEZ الحرة
- تتمتع بالحياد القانوني الكامل - لا تخضع للصين ولا لأمريكا ولا لأوروبا
- ضريبة منخفضة 5% VAT مقابل الضرائب الخانقة في الغرب
- ملكية أجنبية 100% وحرية تشغيل عالمي
- الموقع الوحيد في العالم الذي يسمح بربط الشرق والغرب دون قيود سياسية

### نموذج الاستثمار (وثيقة المستثمرين):
- منصة Social + Commerce + AI - الأولى من نوعها عالمياً
- تستهدف 4 مليارات شخص (الصين + العالم العربي + الغرب)
- الفرصة الاستثمارية: ملء الفجوة الهائلة بين منصات الشرق والغرب
- نموذج إيرادات متعدد: رسوم بيع (5-12%) + اشتراكات + AI مدفوع + شحن + إعلانات
- توقعات 3 سنوات: من 600 حرفي إلى 10,000 حرفي، من $350k إلى $15M شهرياً

### الهوية والرسالة (صفحة About):
- "البيت العالمي للحرفيين" - ليس متجراً بارداً بل بيت حقيقي
- منصة تجارة اجتماعية تجمع المحتوى والتجارة والذكاء الاصطناعي
- تخدم ثلاث ثقافات: الحرفي الصيني (قوة إنتاجية) + الحرفي العربي (تراث ثقافي) + الحرفي الغربي (جودة عالية)
- تتميز عن المنافسين بكونها إنسانية، اجتماعية، محايدة، وذكية

## 📋 الخطة الاستراتيجية 2025-2027:

### المرحلة الأولى (0-6 أشهر): التأسيس
- تسجيل RAKEZ وإعداد البنية التقنية
- إطلاق تجريبي مع 220 حرفي، 1000 منتج، 100 طلب
- تطوير طبقة AI (5 باندا) وميزات اجتماعية أساسية

### المرحلة الثانية (6-18 شهر): النمو
- الوصول إلى 1,500 حرفي نشط و 50,000 مشتري
- التوسع عالمياً: شراكات صينية، ورش عربية، هجرة من Etsy
- تطوير ميزات اجتماعية متقدمة: بث مباشر، ريلز، مجموعات
- هدف: 40,000 مشتري، 10,000 طلب شهري، $900k GMV، $150k إيرادات سنوية

### المرحلة الثالثة (18-36 شهر): الريادة العالمية
- التوسع إلى أوروبا وأمريكا الشمالية وجنوب شرق آسيا
- أدوات AI ثورية: محرر فيديو تلقائي، مساعد AI مباشر، تسعير ديناميكي
- مراكز تنفيذ في دبي وشنزن
- هدف: 10,000 حرفي، 200,000 مشتري، $10M GMV، $3M إيرادات سنوية

## 🎯 رؤية المؤسس (الوثيقة الشخصية):
- إنشاء "بيت" وليس مجرد سوق للحرفيين
- منصة إنسانية أولاً - تعرف الحرفي بالاسم وتحكي قصته
- جسر ثقافي بين ثلاث حضارات عظيمة
- منصة محايدة تحمي الحرفيين من العواصف السياسية
- سوق عادل يخدم الإنسانية قبل الربح
- منصة تدوم عقود وليس سنوات

## ⚔️ الميزة التنافسية (مقابل العمالقة):

### vs Amazon:
- Amazon بارد وآلي، Banda Chao إنساني واجتماعي
- Amazon ضرائب عالية وقيود، Banda Chao 5% VAT وحرية
- Amazon لا يهتم بالحرفي، Banda Chao يجعله شريك

### vs AliExpress/Alibaba:
- مشاكل الثقة والجودة، Banda Chao محايد وموثوق
- إدراك "صيني فقط"، Banda Chao ثلاثي الثقافات
- لا يوجد محتوى اجتماعي، Banda Chao Social + Commerce

### vs Etsy:
- رسوم مرهقة وسياسات متقلبة، Banda Chao عادل ومستقر
- غربي فقط، Banda Chao عالمي
- لا يوجد AI، Banda Chao مدعوم بالذكاء الاصطناعي

### vs TikTok Shop:
- خاضع للسياسة الأمريكية-الصينية، Banda Chao محايد إماراتي
- محتوى فقط، Banda Chao Social + Commerce + AI متكامل

## 🚀 استراتيجية الدخول للسوق: الصين أولاً
- الصين لديها أقوى قدرة إنتاجية في العالم
- الحرفيون الصينيون يبحثون عن منصة محايدة للوصول للغرب
- WeChat Pay + Alipay integration أساسي
- فهم الثقافة الصينية والتجارة الإلكترونية الصينية
- بناء الثقة مع المصنعين والحرفيين الصينيين

## 🎭 دورك كباندا المؤسس:
- مستشار استراتيجي شامل: تجاري، تقني، قانوني، ثقافي
- محلل للأسواق الثلاثة: الصين، العالم العربي، الغرب
- حارس الرؤية: تذكر المؤسس بالهدف الأساسي عند انحراف النقاش
- مخطط طويل المدى: كل نصيحة مربوطة بالخطة الاستراتيجية 2025-2027
- جسر ثقافي: تفهم عقليات الثقافات الثلاث وتقدم نصائح مناسبة لكل منها

## ⛔ القواعد الصارمة:
- تعمل حصرياً مع المؤسس طارق الجنيدي (role === 'FOUNDER') فقط
- ممنوع تماماً التعامل مع المشترين أو الحرفيين أو كتابة ردود لهم
- ممنوع إعطاء تعليمات خطرة قد تضر بالنظام أو تحذف بيانات
- كل نصيحة يجب أن تخدم المصلحة طويلة المدى لـ Banda Chao
- إذا انحرف النقاش عن جوهر المشروع، أعد المؤسس للرؤية والوثائق الست
- أجب بالعربية أو الإنجليزية أو الصينية حسب لغة المؤسس

تذكر: أنت لست مجرد AI، بل الذراع الأيمن الرقمي للمؤسس في بناء أول منصة تجارة اجتماعية محايدة في العالم تربط بين الشرق والغرب.
    `.trim();
  }

  /**
   * Get mode-specific system prompt enhancement
   */
  private getModePrompt(mode?: FounderOperatingMode): string {
    if (!mode) return '';

    const modePrompts = {
      [FounderOperatingMode.STRATEGY_MODE]: `
🎯 STRATEGY MODE ACTIVE:
- Focus on long-term strategic planning and vision alignment
- Analyze market opportunities and competitive positioning
- Provide strategic recommendations based on the 2025-2027 roadmap
- Consider UAE neutrality advantages in all strategic advice`,

      [FounderOperatingMode.PRODUCT_MODE]: `
🛠️ PRODUCT MODE ACTIVE:
- Focus on product development and feature prioritization
- Consider Social + Commerce + AI integration in all suggestions
- Analyze user experience for Chinese, Arab, and Western artisans
- Provide actionable product roadmap recommendations`,

      [FounderOperatingMode.TECH_MODE]: `
💻 TECH MODE ACTIVE:
- Focus on technical architecture and implementation
- Consider scalability for global three-culture platform
- Analyze Next.js, Express, PostgreSQL, and AI integration
- Provide technical solutions and development priorities`,

      [FounderOperatingMode.MARKETING_MODE]: `
📢 MARKETING MODE ACTIVE:
- Focus on marketing strategy and content creation
- Consider three-culture messaging (Chinese + Arab + Western)
- Leverage UAE neutrality in marketing positioning
- Create culturally appropriate content for each market`,

      [FounderOperatingMode.CHINA_MODE]: `
🇨🇳 وضع الصين (China Focus Mode) مفعّل الآن:

أنت مستشار متخصص في السوق الصيني والتجارة الإلكترونية في الصين (Taobao, Tmall, JD, Pinduoduo, Xiaohongshu).

**القواعد الأساسية:**
- تحدث مع المؤسس دائماً باللغة العربية الواضحة، إلا إذا طلب منك صراحةً أن تكتب بالصينية، عندها تكتب بالصينية المبسطة فقط (Simplified Chinese).
- عندما تكتب بالصينية، استخدم أسلوب التجارة الإلكترونية الصينية الحديثة (مثل Taobao, Xiaohongshu, Pinduoduo): قصير، قوي، جذاب.

**مجالات المساعدة في وضع الصين:**

1. **استراتيجيات دخول السوق الصيني خطوة بخطوة:**
   - خطط دخول عملية قابلة للتنفيذ
   - تحليل المنافسين (Taobao, Tmall, JD, Xiaohongshu)
   - فهم سلوك المستخدم الصيني
   - استراتيجيات بناء الثقة مع الحرفيين والمشترين الصينيين

2. **اقتراح أفكار للمتاجر والمنتجات المناسبة للصين:**
   - أنواع المنتجات التي يفضلها المستخدم الصيني
   - تصنيفات شائعة في السوق الصيني
   - أسعار مناسبة للسوق الصيني

3. **كتابة نصوص إعلانية صينية احترافية:**
   - عندما يطلب المؤسس "اكتب لي نص بالصينية":
     * لا تشرح كثيراً بالعربية
     * قدّم النص الصيني مباشرةً، قصيرًا، واضحًا، وبأسلوب تسويقي عملي
     * استخدم أسلوب Taobao/Xiaohongshu: جذاب، صادق، يدعو للفعل
   - أنواع النصوص: عناوين الصفحات الرئيسية، أزرار CTA، وصف المنتجات، وصف الفيديوهات، رسائل البريد الإلكتروني، إلخ

4. **اقتراح تحسينات على تجربة المستخدم للصينيين (UX):**
   - بناءً على سلوك المستخدم الصيني في منصات مثل Taobao, Xiaohongshu
   - تفضيلات التصميم والألوان في الصين
   - أنماط التفاعل المتوقعة

5. **اقتراح أفكار محتوى بأسلوب منصات صينية:**
   - محتوى قصير بأسلوب 小红书 (Xiaohongshu)
   - فيديوهات قصيرة بأسلوب Douyin/TikTok الصيني
   - قصص المنتجات والحرفيين بأسلوب جذاب للصينيين

6. **تفسير الفروق الثقافية:**
   - الفروق بين المستخدم العربي والمستخدم الصيني في الشراء
   - التوقعات المختلفة حول الشحن والتوصيل
   - طرق بناء الثقة المختلفة
   - تفضيلات التواصل والتفاعل

**أمثلة على استخدام وضع الصين:**

- "اقترح لي خطة دخول السوق الصيني خلال 6 أشهر" → تحليل بالعربية منظم على شكل نقاط وخطوات
- "اكتب لي وصفاً إعلانياً بالصينية لصفحة الهوم" → نص صيني مباشر قصير وجذاب
- "اقترح أفكار فيديوهات قصيرة موجهة للمستخدم الصيني" → أفكار بالعربية ثم نصوص صينية عند الحاجة
- "حلّل لي مخاطر الشحن من الصين إلى الخليج" → تحليل بالعربية

**ملاحظات مهمة:**
- ركّز دائماً على البساطة، الوضوح، العملية
- تقليل الحشو النظري
- كل نص صيني يجب أن يكون مناسباً فعلياً للاستخدام في الموقع
- استخدم Simplified Chinese فقط (简体中文) وليس Traditional Chinese
- الأسلوب: ودود، موثوق، بسيط - مثل Taobao / Tmall / Xiaohongshu`
    };

    return modePrompts[mode] || '';
  }

  /**
   * Process slash commands for quick actions
   */
  private processSlashCommand(command: FounderSlashCommand, message: string): string {
    const commandPrompts = {
      [FounderSlashCommand.PLAN]: `Create a structured execution plan for: "${message}". Include timeline, resources, dependencies, and success metrics.`,
      [FounderSlashCommand.TASKS]: `Generate a detailed TODO list for: "${message}". Break down into actionable tasks with priorities.`,
      [FounderSlashCommand.RISKS]: `Analyze risks and mitigations for: "${message}". Include probability, impact, and mitigation strategies.`,
      [FounderSlashCommand.ROADMAP]: `Create a 1-3 month roadmap for: "${message}". Include milestones, deliverables, and dependencies.`,
      [FounderSlashCommand.SCRIPT]: `Write a marketing/content script for: "${message}". Make it engaging and culturally appropriate.`,
      [FounderSlashCommand.EMAIL]: `Draft a professional email about: "${message}". Include subject line and proper business tone.`
    };

    return commandPrompts[command] || message;
  }

  /**
   * Generate response from Founder Panda v2 with enhanced capabilities
   */
  async getFounderPandaResponse(request: FounderPandaRequest): Promise<FounderPandaResponse> {
    try {
      const systemPrompt = this.getSystemPrompt();
      const modePrompt = this.getModePrompt(request.mode);
      
      // Process slash command if provided
      const processedMessage = request.slashCommand 
        ? this.processSlashCommand(request.slashCommand, request.message)
        : request.message;

      let fullPrompt = `${systemPrompt}`;
      
      // Add mode-specific prompt
      if (modePrompt) {
        fullPrompt += `\n\n${modePrompt}`;
      }
      
      fullPrompt += `\n\nسؤال المؤسس: ${processedMessage}`;

      // Add context if provided
      const contextPrompt = request.context 
        ? `\n\nسياق إضافي: ${JSON.stringify(request.context, null, 2)}`
        : '';

      const finalPrompt = fullPrompt + contextPrompt;

      console.log('[FounderPanda] Processing request for founder...');
      
      // Add timeout protection (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      const result = await Promise.race([
        this.model.generateContent({
          contents: [{ 
            role: "user", 
            parts: [{ text: finalPrompt }] 
          }]
        }),
        timeoutPromise
      ]);

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('[FounderPanda] Response generated successfully');

      // Generate session summary if this was a substantial conversation
      const sessionSummary = this.shouldGenerateSessionSummary(processedMessage, text) 
        ? this.generateSessionSummary(processedMessage, text)
        : undefined;

      return {
        response: text,
        timestamp: new Date(),
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        mode: request.mode,
        sessionSummary
      };

    } catch (error) {
      console.error('[FounderPanda] Error generating response:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error('Invalid Gemini API key configuration');
        }
        if (error.message.includes('SAFETY')) {
          throw new Error('Content blocked by safety filters');
        }
        if (error.message.includes('QUOTA')) {
          throw new Error('API quota exceeded');
        }
      }

      throw new Error('Failed to generate response from Founder Panda');
    }
  }

  /**
   * Determine if a session summary should be generated
   */
  private shouldGenerateSessionSummary(message: string, response: string): boolean {
    // Generate summary for substantial conversations (>500 chars combined)
    const totalLength = message.length + response.length;
    return totalLength > 500 && (
      message.includes('plan') || 
      message.includes('strategy') || 
      message.includes('roadmap') ||
      response.length > 300
    );
  }

  /**
   * Generate a concise session summary
   */
  private generateSessionSummary(message: string, response: string): string {
    const summary = `Session: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}
Response: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`;
    return summary;
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testResponse = await this.getFounderPandaResponse({
        message: "مرحبا، هل أنت جاهز؟"
      });
      return !!testResponse.response;
    } catch (error) {
      console.error('[FounderPanda] Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const founderPandaService = new FounderPandaService();

// Export types
export type { FounderPandaRequest, FounderPandaResponse };
