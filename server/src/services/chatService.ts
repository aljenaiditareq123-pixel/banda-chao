import { prisma } from '../utils/prisma';

/**
 * Chat Service - AI Butler (PandaChat)
 * Handles intelligent customer service conversations
 * 
 * Future: Will integrate with OpenAI/Gemini for real AI responses
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContext {
  userId?: string;
  userName?: string;
  currentProductId?: string;
  recentOrderId?: string;
  conversationHistory: ChatMessage[];
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  action?: {
    type: 'redirect' | 'show_order' | 'show_product';
    data?: any;
  };
}

/**
 * Detect user intent from message
 */
function detectIntent(message: string, locale: string = 'en'): {
  intent: 'order_status' | 'product_inquiry' | 'return_policy' | 'shipping' | 'payment' | 'general' | 'greeting';
  confidence: number;
  extractedData?: any;
} {
  const normalizedMessage = message.toLowerCase().trim();

  // Intent patterns (multi-language)
  const patterns = {
    order_status: {
      en: ['order', 'where is my', 'track', 'status', 'when will', 'delivery'],
      ar: ['طلب', 'أين', 'تتبع', 'حالة', 'متى', 'تسليم'],
      zh: ['订单', '在哪里', '跟踪', '状态', '什么时候', '交付'],
    },
    product_inquiry: {
      en: ['product', 'price', 'stock', 'available', 'how much', 'cost'],
      ar: ['منتج', 'سعر', 'مخزون', 'متوفر', 'كم', 'تكلفة'],
      zh: ['产品', '价格', '库存', '可用', '多少', '成本'],
    },
    return_policy: {
      en: ['return', 'refund', 'exchange', 'send back', 'cancel'],
      ar: ['إرجاع', 'استرداد', 'تبديل', 'إرجاع', 'إلغاء'],
      zh: ['退货', '退款', '交换', '送回', '取消'],
    },
    shipping: {
      en: ['shipping', 'delivery', 'ship', 'arrive', 'when'],
      ar: ['شحن', 'تسليم', 'شحن', 'يصل', 'متى'],
      zh: ['运输', '交付', '发货', '到达', '什么时候'],
    },
    payment: {
      en: ['payment', 'pay', 'card', 'stripe', 'money', 'charge'],
      ar: ['دفع', 'دفع', 'بطاقة', 'سترايب', 'مال', 'شحن'],
      zh: ['支付', '付款', '卡', '条纹', '钱', '收费'],
    },
    greeting: {
      en: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greetings'],
      ar: ['مرحبا', 'أهلا', 'السلام', 'صباح الخير', 'مساء الخير'],
      zh: ['你好', '嗨', '早上好', '晚上好', '问候'],
    },
  };

  // Check for greeting first
  const greetingPatterns = patterns.greeting[locale as keyof typeof patterns.greeting] || patterns.greeting.en;
  if (greetingPatterns.some(pattern => normalizedMessage.includes(pattern))) {
    return { intent: 'greeting', confidence: 0.9 };
  }

  // Check other intents
  let bestIntent: keyof typeof patterns = 'general';
  let bestConfidence = 0;

  for (const [intent, langPatterns] of Object.entries(patterns)) {
    if (intent === 'greeting') continue;
    
    const intentPatterns = langPatterns[locale as keyof typeof langPatterns] || langPatterns.en;
    const matches = intentPatterns.filter(pattern => normalizedMessage.includes(pattern));
    
    if (matches.length > 0) {
      const confidence = matches.length / intentPatterns.length;
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestIntent = intent as keyof typeof patterns;
      }
    }
  }

  // Extract order number if order_status intent
  let extractedData: any = {};
  if (bestIntent === 'order_status') {
    const orderNumberMatch = normalizedMessage.match(/(?:order|طلب|订单)[\s#:]*([a-z0-9-]+)/i);
    if (orderNumberMatch) {
      extractedData.orderId = orderNumberMatch[1];
    }
  }

  return {
    intent: bestIntent as any,
    confidence: bestConfidence || 0.3,
    extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
  };
}

/**
 * Generate response based on intent and context
 */
export async function generateChatResponse(
  message: string,
  context: ChatContext,
  locale: string = 'en'
): Promise<ChatResponse> {
  const intent = detectIntent(message, locale);
  const { intent: detectedIntent, extractedData } = intent;

  // Greeting response
  if (detectedIntent === 'greeting') {
    const greeting = context.userName
      ? locale === 'ar'
        ? `أهلاً ${context.userName}! 🐼 كيف يمكنني مساعدتك اليوم؟`
        : locale === 'zh'
        ? `你好 ${context.userName}！🐼 今天我能为你做什么？`
        : `Hello ${context.userName}! 🐼 How can I help you today?`
      : locale === 'ar'
      ? 'أهلاً بك! 🐼 أنا الباندا المساعد. كيف يمكنني مساعدتك؟'
      : locale === 'zh'
      ? '你好！🐼 我是熊猫助手。我能为你做什么？'
      : 'Hello! 🐼 I\'m Panda, your AI assistant. How can I help you?';

    return {
      message: greeting,
      suggestions: [
        locale === 'ar' ? 'تتبع طلبي' : locale === 'zh' ? '跟踪我的订单' : 'Track my order',
        locale === 'ar' ? 'استفسار عن منتج' : locale === 'zh' ? '产品查询' : 'Product inquiry',
        locale === 'ar' ? 'سياسة الإرجاع' : locale === 'zh' ? '退货政策' : 'Return policy',
      ],
    };
  }

  // Order status inquiry
  if (detectedIntent === 'order_status') {
    if (!context.userId) {
      return {
        message: locale === 'ar'
          ? 'يرجى تسجيل الدخول لتتبع طلبك. هل تريد تسجيل الدخول الآن؟'
          : locale === 'zh'
          ? '请登录以跟踪您的订单。您想现在登录吗？'
          : 'Please log in to track your order. Would you like to log in now?',
        suggestions: [
          locale === 'ar' ? 'تسجيل الدخول' : locale === 'zh' ? '登录' : 'Log in',
        ],
      };
    }

    const orderId = extractedData?.orderId || context.recentOrderId;
    
    if (!orderId) {
      return {
        message: locale === 'ar'
          ? 'يرجى إدخال رقم الطلب. يمكنك العثور عليه في بريد التأكيد أو في صفحة الطلبات.'
          : locale === 'zh'
          ? '请输入订单号。您可以在确认邮件或订单页面找到它。'
          : 'Please provide your order number. You can find it in your confirmation email or orders page.',
        suggestions: [
          locale === 'ar' ? 'صفحة الطلبات' : locale === 'zh' ? '订单页面' : 'My Orders',
        ],
      };
    }

    // Fetch order from database
    try {
      const order = await prisma.orders.findFirst({
        where: {
          id: orderId,
          user_id: context.userId,
        },
        include: {
          order_items: {
            include: {
              products: true,
            },
          },
        },
      } as any);

      if (!order) {
        return {
          message: locale === 'ar'
            ? `لم أتمكن من العثور على طلب برقم ${orderId}. يرجى التحقق من الرقم والمحاولة مرة أخرى.`
            : locale === 'zh'
            ? `找不到订单号 ${orderId}。请检查号码并重试。`
            : `I couldn't find an order with number ${orderId}. Please check the number and try again.`,
        };
      }

      const statusMessages: Record<string, Record<string, string>> = {
        PENDING: {
          ar: 'قيد المعالجة',
          en: 'Pending',
          zh: '待处理',
        },
        PROCESSING: {
          ar: 'قيد التحضير',
          en: 'Processing',
          zh: '处理中',
        },
        SHIPPED: {
          ar: 'تم الشحن',
          en: 'Shipped',
          zh: '已发货',
        },
        DELIVERED: {
          ar: 'تم التسليم',
          en: 'Delivered',
          zh: '已交付',
        },
        CANCELLED: {
          ar: 'ملغي',
          en: 'Cancelled',
          zh: '已取消',
        },
      };

      const statusText = statusMessages[order.status as string]?.[locale] || order.status;
      const total = (order as any).totalAmount || 0;

      return {
        message: locale === 'ar'
          ? `✅ طلبك #${orderId} في حالة "${statusText}".\n\nالمبلغ الإجمالي: ${total} ${(order as any).currency || 'USD'}\n\nهل تريد معرفة المزيد عن طلبك؟`
          : locale === 'zh'
          ? `✅ 您的订单 #${orderId} 状态为"${statusText}"。\n\n总金额：${total} ${(order as any).currency || 'USD'}\n\n您想了解更多关于您的订单吗？`
          : `✅ Your order #${orderId} is "${statusText}".\n\nTotal amount: ${total} ${(order as any).currency || 'USD'}\n\nWould you like to know more about your order?`,
        action: {
          type: 'show_order',
          data: { orderId },
        },
        suggestions: [
          locale === 'ar' ? 'تفاصيل الطلب' : locale === 'zh' ? '订单详情' : 'Order details',
          locale === 'ar' ? 'تتبع الشحن' : locale === 'zh' ? '跟踪发货' : 'Track shipment',
        ],
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        message: locale === 'ar'
          ? 'حدث خطأ أثناء البحث عن طلبك. يرجى المحاولة مرة أخرى لاحقاً.'
          : locale === 'zh'
          ? '查找订单时出错。请稍后再试。'
          : 'An error occurred while searching for your order. Please try again later.',
      };
    }
  }

  // Product inquiry
  if (detectedIntent === 'product_inquiry') {
    if (!context.currentProductId) {
      return {
        message: locale === 'ar'
          ? 'يرجى الانتقال إلى صفحة المنتج لطرح أسئلة محددة عنه.'
          : locale === 'zh'
          ? '请转到产品页面以询问具体问题。'
          : 'Please navigate to a product page to ask specific questions about it.',
        suggestions: [
          locale === 'ar' ? 'تصفح المنتجات' : locale === 'zh' ? '浏览产品' : 'Browse products',
        ],
      };
    }

    try {
      const product = await prisma.products.findUnique({
        where: { id: context.currentProductId },
      } as any);

      if (!product) {
        return {
          message: locale === 'ar'
            ? 'لم أتمكن من العثور على معلومات المنتج.'
            : locale === 'zh'
            ? '找不到产品信息。'
            : 'I couldn\'t find product information.',
        };
      }

      const price = product.price || 0;
      const name = locale === 'ar' ? (product.name_ar || product.name) :
                   locale === 'zh' ? (product.name_zh || product.name) : product.name;

      return {
        message: locale === 'ar'
          ? `📦 المنتج: ${name}\n💰 السعر: ${price} ${product.currency || 'USD'}\n\nهل تريد إضافته للسلة؟`
          : locale === 'zh'
          ? `📦 产品：${name}\n💰 价格：${price} ${product.currency || 'USD'}\n\n您想将其添加到购物车吗？`
          : `📦 Product: ${name}\n💰 Price: ${price} ${product.currency || 'USD'}\n\nWould you like to add it to cart?`,
        action: {
          type: 'show_product',
          data: { productId: context.currentProductId },
        },
        suggestions: [
          locale === 'ar' ? 'إضافة للسلة' : locale === 'zh' ? '添加到购物车' : 'Add to cart',
          locale === 'ar' ? 'عرض التفاصيل' : locale === 'zh' ? '查看详情' : 'View details',
        ],
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        message: locale === 'ar'
          ? 'حدث خطأ أثناء جلب معلومات المنتج.'
          : locale === 'zh'
          ? '获取产品信息时出错。'
          : 'An error occurred while fetching product information.',
      };
    }
  }

  // Return policy
  if (detectedIntent === 'return_policy') {
    return {
      message: locale === 'ar'
        ? '📋 سياسة الإرجاع:\n\n• يمكنك إرجاع المنتج خلال 14 يوماً من الاستلام\n• يجب أن يكون المنتج في حالته الأصلية\n• سيتم استرداد المبلغ خلال 5-7 أيام عمل\n\nهل تريد بدء عملية الإرجاع؟'
        : locale === 'zh'
        ? '📋 退货政策：\n\n• 您可以在收到后14天内退货\n• 产品必须处于原始状态\n• 退款将在5-7个工作日内处理\n\n您想开始退货流程吗？'
        : '📋 Return Policy:\n\n• You can return products within 14 days of receipt\n• Product must be in original condition\n• Refund will be processed within 5-7 business days\n\nWould you like to start a return?',
      suggestions: [
        locale === 'ar' ? 'بدء الإرجاع' : locale === 'zh' ? '开始退货' : 'Start return',
        locale === 'ar' ? 'اتصل بالدعم' : locale === 'zh' ? '联系支持' : 'Contact support',
      ],
    };
  }

  // Shipping inquiry
  if (detectedIntent === 'shipping') {
    return {
      message: locale === 'ar'
        ? '🚚 معلومات الشحن:\n\n• الشحن المجاني للطلبات فوق $50\n• الشحن العادي: 3-5 أيام عمل\n• الشحن السريع: 1-2 أيام عمل (رسوم إضافية)\n\nهل تريد معرفة المزيد؟'
        : locale === 'zh'
        ? '🚚 运输信息：\n\n• 订单超过 $50 免费送货\n• 标准运输：3-5 个工作日\n• 快速运输：1-2 个工作日（额外费用）\n\n您想了解更多吗？'
        : '🚚 Shipping Information:\n\n• Free shipping on orders over $50\n• Standard shipping: 3-5 business days\n• Express shipping: 1-2 business days (additional fee)\n\nWould you like to know more?',
      suggestions: [
        locale === 'ar' ? 'حاسبة الشحن' : locale === 'zh' ? '运费计算器' : 'Shipping calculator',
      ],
    };
  }

  // Payment inquiry
  if (detectedIntent === 'payment') {
    return {
      message: locale === 'ar'
        ? '💳 طرق الدفع:\n\n• بطاقات الائتمان/الخصم (Visa, Mastercard)\n• PayPal\n• Stripe (آمن ومشفر)\n\nجميع المدفوعات آمنة ومشفرة.'
        : locale === 'zh'
        ? '💳 支付方式：\n\n• 信用卡/借记卡（Visa、Mastercard）\n• PayPal\n• Stripe（安全加密）\n\n所有支付都是安全加密的。'
        : '💳 Payment Methods:\n\n• Credit/Debit Cards (Visa, Mastercard)\n• PayPal\n• Stripe (Secure & Encrypted)\n\nAll payments are secure and encrypted.',
      suggestions: [
        locale === 'ar' ? 'معلومات الأمان' : locale === 'zh' ? '安全信息' : 'Security info',
      ],
    };
  }

  // General/Unknown intent
  return {
    message: locale === 'ar'
      ? 'أعتذر، لم أفهم تماماً. يمكنني مساعدتك في:\n\n• تتبع الطلبات\n• الاستفسار عن المنتجات\n• سياسة الإرجاع\n• معلومات الشحن\n• طرق الدفع\n\nكيف يمكنني مساعدتك؟'
      : locale === 'zh'
      ? '抱歉，我不太明白。我可以帮助您：\n\n• 跟踪订单\n• 产品查询\n• 退货政策\n• 运输信息\n• 支付方式\n\n我能为您做什么？'
      : 'I apologize, I didn\'t quite understand. I can help you with:\n\n• Order tracking\n• Product inquiries\n• Return policy\n• Shipping information\n• Payment methods\n\nHow can I assist you?',
    suggestions: [
      locale === 'ar' ? 'تتبع طلبي' : locale === 'zh' ? '跟踪我的订单' : 'Track my order',
      locale === 'ar' ? 'استفسار عن منتج' : locale === 'zh' ? '产品查询' : 'Product inquiry',
      locale === 'ar' ? 'سياسة الإرجاع' : locale === 'zh' ? '退货政策' : 'Return policy',
    ],
  };
}

/**
 * Get user's recent order ID
 */
export async function getUserRecentOrder(userId: string): Promise<string | null> {
  try {
    const order = await prisma.orders.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      select: { id: true },
    } as any);

    return order?.id || null;
  } catch (error) {
    console.error('Error fetching recent order:', error);
    return null;
  }
}
