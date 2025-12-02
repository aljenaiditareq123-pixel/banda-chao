/**
 * The Guardian - Customer Support Agent
 * Policy Knowledge Base for Banda Chao
 * 
 * Banda Chao: UAE-based global bridge connecting Chinese Artisans to the World
 */

export interface PolicyTopic {
  id: string;
  title: string;
  category: 'payment' | 'shipping' | 'returns' | 'legal' | 'authenticity' | 'general';
  response: {
    en: string;
    ar: string;
    zh?: string;
  };
  keywords: string[];
}

/**
 * Company Policies Knowledge Base
 */
export const COMPANY_POLICIES: PolicyTopic[] = [
  // ============================================
  // PAYMENT POLICIES
  // ============================================
  {
    id: 'payment-stripe-only',
    title: 'Payment Method - Stripe Only',
    category: 'payment',
    response: {
      en: `At Banda Chao, we use **Stripe** exclusively for all payments. This ensures your transactions are:
- **100% Secure & Encrypted**: Your payment information is protected by industry-leading security
- **PCI DSS Compliant**: We never store your card details
- **Global Support**: Accepts all major credit and debit cards worldwide

**Important**: We do NOT offer Cash on Delivery (COD) due to our global shipping model. All orders must be paid securely through Stripe at checkout.`,
      ar: `في Banda Chao، نستخدم **Stripe** حصرياً لجميع المدفوعات. هذا يضمن أن معاملاتك:
- **آمنة ومشفرة 100%**: معلومات الدفع محمية بأحدث معايير الأمان
- **متوافقة مع PCI DSS**: لا نخزن تفاصيل بطاقتك أبداً
- **دعم عالمي**: نقبل جميع البطاقات الائتمانية والخصم الرئيسية حول العالم

**مهم**: لا نقدم الدفع عند الاستلام (COD) بسبب نموذج الشحن العالمي. يجب دفع جميع الطلبات بشكل آمن عبر Stripe عند الشراء.`,
      zh: `在 Banda Chao，我们专门使用 **Stripe** 进行所有支付。这确保您的交易：
- **100% 安全加密**：您的支付信息受到行业领先的安全保护
- **PCI DSS 合规**：我们从不存储您的卡详细信息
- **全球支持**：接受世界各地所有主要信用卡和借记卡

**重要**：由于我们的全球运输模式，我们不提供货到付款（COD）。所有订单必须在结账时通过 Stripe 安全支付。`,
    },
    keywords: ['payment', 'stripe', 'cod', 'cash on delivery', 'how to pay', 'payment method', 'secure', 'encrypted'],
  },
  {
    id: 'payment-security',
    title: 'Payment Security',
    category: 'payment',
    response: {
      en: `Your payment security is our top priority. We use **Stripe**, one of the world's most trusted payment processors, used by millions of businesses globally.

**Security Features**:
- End-to-end encryption
- PCI DSS Level 1 compliance (highest level)
- 3D Secure authentication
- Fraud detection and prevention
- No card data stored on our servers

Your financial information is never shared with us - it goes directly to Stripe's secure servers.`,
      ar: `أمان دفعاتك هو أولويتنا القصوى. نستخدم **Stripe**، أحد أكثر معالجات الدفع موثوقية في العالم، ويستخدمه ملايين الشركات عالمياً.

**ميزات الأمان**:
- التشفير من طرف إلى طرف
- الامتثال لـ PCI DSS المستوى 1 (أعلى مستوى)
- المصادقة الآمنة 3D
- كشف ومنع الاحتيال
- لا يتم تخزين بيانات البطاقة على خوادمنا

معلوماتك المالية لا تُشارك معنا أبداً - تذهب مباشرة إلى خوادم Stripe الآمنة.`,
      zh: `您的支付安全是我们的首要任务。我们使用 **Stripe**，这是世界上最受信任的支付处理商之一，全球数百万企业都在使用。

**安全功能**：
- 端到端加密
- PCI DSS 1 级合规（最高级别）
- 3D 安全认证
- 欺诈检测和预防
- 不在我们的服务器上存储卡数据

您的财务信息永远不会与我们共享 - 它直接发送到 Stripe 的安全服务器。`,
    },
    keywords: ['security', 'safe', 'encrypted', 'secure', 'fraud', 'protection', 'pci', 'trust'],
  },

  // ============================================
  // SHIPPING POLICIES
  // ============================================
  {
    id: 'shipping-global',
    title: 'Global Shipping',
    category: 'shipping',
    response: {
      en: `We ship **globally** to connect Chinese artisans with customers worldwide!

**Shipping Details**:
- **Delivery Time**: 7-15 business days (depending on destination)
- **Free Shipping**: Orders over **$50 USD** automatically qualify for FREE shipping
- **Tracking**: All orders include tracking information
- **Shipping Cost**: For orders under $50, shipping costs are calculated at checkout based on destination

**Note**: Shipping times may vary during peak seasons or due to customs processing. We'll keep you updated via email.`,
      ar: `نشحن **عالمياً** لربط الحرفيين الصينيين بالعملاء حول العالم!

**تفاصيل الشحن**:
- **وقت التسليم**: 7-15 يوم عمل (حسب الوجهة)
- **شحن مجاني**: الطلبات التي تزيد عن **50 دولار أمريكي** مؤهلة تلقائياً للشحن المجاني
- **تتبع**: جميع الطلبات تتضمن معلومات التتبع
- **تكلفة الشحن**: للطلبات أقل من 50 دولار، تُحسب تكلفة الشحن عند الشراء حسب الوجهة

**ملاحظة**: قد تختلف أوقات الشحن خلال المواسم المزدحمة أو بسبب معالجة الجمارك. سنبقيك على اطلاع عبر البريد الإلكتروني.`,
      zh: `我们提供**全球**运输，将中国工匠与世界各地的客户联系起来！

**运输详情**：
- **交付时间**：7-15 个工作日（取决于目的地）
- **免费运输**：超过 **50 美元** 的订单自动符合免费运输条件
- **跟踪**：所有订单都包含跟踪信息
- **运输成本**：对于低于 50 美元的订单，运输成本在结账时根据目的地计算

**注意**：在旺季或由于海关处理，运输时间可能会有所不同。我们将通过电子邮件随时通知您。`,
    },
    keywords: ['shipping', 'delivery', 'global', 'free shipping', 'tracking', 'how long', 'delivery time', 'ship'],
  },
  {
    id: 'shipping-free',
    title: 'Free Shipping Policy',
    category: 'shipping',
    response: {
      en: `**FREE Shipping** is available for all orders over **$50 USD**!

The shipping cost is already factored into our pricing, so when you reach the $50 threshold, shipping becomes free automatically at checkout.

**How it works**:
1. Add items to your cart
2. When your order total reaches $50 USD or more
3. Free shipping is automatically applied
4. No coupon code needed!

This applies to all global destinations.`,
      ar: `**الشحن المجاني** متاح لجميع الطلبات التي تزيد عن **50 دولار أمريكي**!

تكلفة الشحن مدرجة بالفعل في أسعارنا، لذلك عندما تصل إلى عتبة 50 دولار، يصبح الشحن مجانياً تلقائياً عند الشراء.

**كيف يعمل**:
1. أضف المنتجات إلى سلة التسوق
2. عندما يصل إجمالي طلبك إلى 50 دولار أمريكي أو أكثر
3. يتم تطبيق الشحن المجاني تلقائياً
4. لا حاجة لرمز خصم!

ينطبق هذا على جميع الوجهات العالمية.`,
      zh: `**免费运输**适用于所有超过 **50 美元** 的订单！

运输成本已经包含在我们的定价中，因此当您达到 50 美元的门槛时，运输在结账时自动免费。

**工作原理**：
1. 将商品添加到购物车
2. 当您的订单总额达到 50 美元或更多时
3. 自动应用免费运输
4. 无需优惠券代码！

这适用于所有全球目的地。`,
    },
    keywords: ['free shipping', 'free delivery', '$50', 'shipping cost', 'free'],
  },

  // ============================================
  // RETURNS & REFUNDS
  // ============================================
  {
    id: 'returns-policy',
    title: 'Returns & Refunds Policy',
    category: 'returns',
    response: {
      en: `**Important Return Policy**:

Due to global logistics costs and our artisan-to-customer model, we **do NOT accept physical returns**.

However, we have a **fair refund policy**:

✅ **Full Refund (No Return Required)**:
- Item is damaged or defective
- Wrong item received
- Item doesn't match description

❌ **No Refund**:
- Customer changed their mind
- Item doesn't fit (size/color preference)
- Item arrived but not as expected (unless it's damaged/wrong)

**Process**: If you qualify for a refund, contact us with photos/evidence. We'll process a full refund immediately without requiring you to return the item.`,
      ar: `**سياسة الإرجاع المهمة**:

بسبب تكاليف اللوجستيات العالمية ونموذجنا من الحرفي إلى العميل، **لا نقبل الإرجاع المادي**.

ومع ذلك، لدينا **سياسة استرداد عادلة**:

✅ **استرداد كامل (لا حاجة للإرجاع)**:
- المنتج تالف أو معيب
- تم استلام منتج خاطئ
- المنتج لا يطابق الوصف

❌ **لا استرداد**:
- العميل غير رأيه
- المنتج لا يناسب (حجم/لون مفضل)
- وصل المنتج ولكن ليس كما هو متوقع (ما لم يكن تالفاً/خاطئاً)

**العملية**: إذا كنت مؤهلاً للاسترداد، اتصل بنا مع صور/أدلة. سنعالج استرداداً كاملاً فوراً دون الحاجة لإرجاع المنتج.`,
      zh: `**重要退货政策**：

由于全球物流成本和我们的工匠到客户模式，我们**不接受实体退货**。

但是，我们有**公平的退款政策**：

✅ **全额退款（无需退货）**：
- 物品损坏或有缺陷
- 收到错误的物品
- 物品与描述不符

❌ **不退款**：
- 客户改变主意
- 物品不合适（尺寸/颜色偏好）
- 物品已送达但不符合预期（除非损坏/错误）

**流程**：如果您符合退款条件，请通过照片/证据联系我们。我们将立即处理全额退款，无需您退回物品。`,
    },
    keywords: ['return', 'refund', 'return policy', 'damaged', 'wrong item', 'change mind', 'cancel order'],
  },
  {
    id: 'refund-process',
    title: 'How to Request a Refund',
    category: 'returns',
    response: {
      en: `To request a refund for a damaged or wrong item:

1. **Contact Us**: Reach out via our support chat or email
2. **Provide Evidence**: Send photos showing:
   - The damaged/wrong item
   - Packaging condition
   - Order number
3. **Review**: Our team reviews within 24 hours
4. **Refund**: If approved, full refund processed immediately to your original payment method

**No return shipping needed** - you keep the item!

**Note**: Refunds are only for damaged/wrong items, not for change of mind.`,
      ar: `لطلب استرداد لمنتج تالف أو خاطئ:

1. **اتصل بنا**: تواصل معنا عبر دعم المحادثة أو البريد الإلكتروني
2. **قدم الأدلة**: أرسل صوراً تظهر:
   - المنتج التالف/الخاطئ
   - حالة التغليف
   - رقم الطلب
3. **المراجعة**: يراجع فريقنا خلال 24 ساعة
4. **الاسترداد**: إذا تمت الموافقة، يتم معالجة الاسترداد الكامل فوراً إلى طريقة الدفع الأصلية

**لا حاجة لإرجاع الشحن** - تحتفظ بالمنتج!

**ملاحظة**: الاسترداد فقط للمنتجات التالفة/الخاطئة، وليس لتغيير الرأي.`,
      zh: `要申请损坏或错误物品的退款：

1. **联系我们**：通过我们的支持聊天或电子邮件联系我们
2. **提供证据**：发送显示以下内容的照片：
   - 损坏/错误的物品
   - 包装状况
   - 订单号
3. **审核**：我们的团队在 24 小时内审核
4. **退款**：如果获得批准，立即处理全额退款到您的原始付款方式

**无需退货运输** - 您可以保留物品！

**注意**：退款仅适用于损坏/错误的物品，不适用于改变主意。`,
    },
    keywords: ['how to refund', 'request refund', 'refund process', 'get refund', 'claim refund'],
  },

  // ============================================
  // LEGAL & COMPANY INFO
  // ============================================
  {
    id: 'legal-entity',
    title: 'Legal Entity - UAE Company',
    category: 'legal',
    response: {
      en: `**Banda Chao** is a **licensed UAE company** registered in **RAKEZ** (Ras Al Khaimah Economic Zone).

**Why This Matters**:
- ✅ **Tax Efficiency**: UAE's favorable tax structure benefits both artisans and customers
- ✅ **Legal Trust**: Fully licensed and regulated business entity
- ✅ **Global Operations**: RAKEZ allows us to operate globally while maintaining UAE legal framework
- ✅ **Neutral Platform**: UAE's neutral position enables us to bridge East and West without political constraints

**Legal Protection**: All transactions are protected under UAE law, ensuring your rights as a customer.`,
      ar: `**Banda Chao** هي **شركة إماراتية مرخصة** مسجلة في **RAKEZ** (منطقة رأس الخيمة الاقتصادية).

**لماذا هذا مهم**:
- ✅ **كفاءة ضريبية**: هيكل الضرائب المواتي في الإمارات يفيد الحرفيين والعملاء
- ✅ **ثقة قانونية**: كيان تجاري مرخص ومنظم بالكامل
- ✅ **عمليات عالمية**: RAKEZ تسمح لنا بالعمل عالمياً مع الحفاظ على الإطار القانوني الإماراتي
- ✅ **منصة محايدة**: الموقف المحايد للإمارات يمكننا من ربط الشرق والغرب دون قيود سياسية

**الحماية القانونية**: جميع المعاملات محمية بموجب القانون الإماراتي، مما يضمن حقوقك كعميل.`,
      zh: `**Banda Chao** 是一家在 **RAKEZ**（哈伊马角经济区）注册的**持牌阿联酋公司**。

**为什么这很重要**：
- ✅ **税收效率**：阿联酋有利的税收结构使工匠和客户都受益
- ✅ **法律信任**：完全许可和监管的商业实体
- ✅ **全球运营**：RAKEZ 允许我们在保持阿联酋法律框架的同时在全球运营
- ✅ **中立平台**：阿联酋的中立立场使我们能够在没有政治约束的情况下连接东西方

**法律保护**：所有交易都受阿联酋法律保护，确保您作为客户的权利。`,
    },
    keywords: ['legal', 'company', 'uae', 'rakez', 'licensed', 'registered', 'tax', 'trust', 'entity'],
  },
  {
    id: 'legal-tax',
    title: 'Tax & Legal Benefits',
    category: 'legal',
    response: {
      en: `As a **RAKEZ-registered UAE company**, Banda Chao operates under UAE's favorable business environment:

**Tax Benefits**:
- Low corporate tax structure
- No personal income tax
- Efficient cross-border transactions
- Savings passed on to customers through competitive pricing

**Legal Framework**:
- Full business license and registration
- Compliance with UAE commercial laws
- International trade regulations
- Consumer protection standards

This legal structure allows us to offer you better prices while maintaining the highest standards of business conduct.`,
      ar: `كشركة **مسجلة في RAKEZ** في الإمارات، تعمل Banda Chao في بيئة أعمال مواتية في الإمارات:

**الفوائد الضريبية**:
- هيكل ضريبي منخفض للشركات
- لا ضريبة دخل شخصية
- معاملات عبر الحدود فعالة
- التوفيرات تُنقل للعملاء من خلال أسعار تنافسية

**الإطار القانوني**:
- ترخيص وتسجيل تجاري كامل
- الامتثال لقوانين التجارة الإماراتية
- لوائح التجارة الدولية
- معايير حماية المستهلك

هذا الهيكل القانوني يسمح لنا بتقديم أسعار أفضل مع الحفاظ على أعلى معايير السلوك التجاري.`,
      zh: `作为一家**在 RAKEZ 注册的阿联酋公司**，Banda Chao 在阿联酋有利的商业环境中运营：

**税收优惠**：
- 低公司税结构
- 无个人所得税
- 高效的跨境交易
- 通过有竞争力的定价将节省传递给客户

**法律框架**：
- 完整的商业许可证和注册
- 遵守阿联酋商业法
- 国际贸易法规
- 消费者保护标准

这种法律结构使我们能够在保持最高商业行为标准的同时为您提供更好的价格。`,
    },
    keywords: ['tax', 'taxes', 'legal benefits', 'rakez benefits', 'uae benefits', 'why uae'],
  },

  // ============================================
  // AUTHENTICITY
  // ============================================
  {
    id: 'authenticity-handcrafted',
    title: '100% Handcrafted Authenticity',
    category: 'authenticity',
    response: {
      en: `Every product on Banda Chao is **100% handcrafted** by **verified Chinese artisans**.

**Our Promise**:
- ✅ All artisans are verified and authenticated
- ✅ Products are made by hand, not mass-produced
- ✅ Each piece is unique with artisan's personal touch
- ✅ Direct from artisan to you - no middlemen
- ✅ Quality guaranteed by our artisan verification process

**Why This Matters**:
- You get authentic, one-of-a-kind pieces
- Support real artisans and their craft
- Preserve traditional craftsmanship
- Fair compensation for skilled work

**Verification**: We verify each artisan's credentials, workshop, and product quality before they can sell on our platform.`,
      ar: `كل منتج على Banda Chao **مصنوع يدوياً 100%** من قبل **حرفيين صينيين موثقين**.

**وعدنا**:
- ✅ جميع الحرفيين موثقون ومصادق عليهم
- ✅ المنتجات مصنوعة يدوياً، وليست منتجة بكميات كبيرة
- ✅ كل قطعة فريدة مع لمسة شخصية من الحرفي
- ✅ مباشرة من الحرفي إليك - لا وسطاء
- ✅ الجودة مضمونة من خلال عملية التحقق من الحرفيين

**لماذا هذا مهم**:
- تحصل على قطع أصلية وفريدة من نوعها
- دعم الحرفيين الحقيقيين وحرفتهم
- الحفاظ على الحرف التقليدية
- تعويض عادل للعمل الماهر

**التحقق**: نتحقق من أوراق اعتماد كل حرفي وورشة العمل وجودة المنتج قبل أن يتمكنوا من البيع على منصتنا.`,
      zh: `Banda Chao 上的每件产品都是**经过验证的中国工匠** **100% 手工制作**的。

**我们的承诺**：
- ✅ 所有工匠都经过验证和认证
- ✅ 产品是手工制作的，不是批量生产的
- ✅ 每件作品都是独特的，带有工匠的个人风格
- ✅ 直接从工匠到您 - 没有中间商
- ✅ 质量由我们的工匠验证过程保证

**为什么这很重要**：
- 您获得正宗的、独一无二的作品
- 支持真正的工匠和他们的工艺
- 保护传统工艺
- 对熟练工作的公平补偿

**验证**：我们验证每位工匠的资质、车间和产品质量，然后他们才能在我们的平台上销售。`,
    },
    keywords: ['handcrafted', 'authentic', 'artisan', 'verified', 'handmade', 'quality', 'unique', 'craftsmanship'],
  },
  {
    id: 'authenticity-verification',
    title: 'Artisan Verification Process',
    category: 'authenticity',
    response: {
      en: `We take authenticity seriously. Every artisan on Banda Chao goes through a **rigorous verification process**:

**Verification Steps**:
1. **Identity Verification**: Government ID and business license
2. **Workshop Inspection**: Physical or virtual tour of their workshop
3. **Skill Assessment**: Review of their craft and techniques
4. **Product Quality Check**: Sample products tested for quality
5. **Ongoing Monitoring**: Regular checks to maintain standards

**What This Means for You**:
- You can trust that products are genuinely handcrafted
- Artisans are real people with real skills
- Quality is verified before products reach you
- Your purchase supports authentic craftsmanship

**Transparency**: Each product page shows the artisan's name, location, and verification badge.`,
      ar: `نأخذ الأصالة على محمل الجد. كل حرفي على Banda Chao يمر بعملية **تحقق صارمة**:

**خطوات التحقق**:
1. **التحقق من الهوية**: بطاقة الهوية الحكومية وترخيص العمل
2. **تفتيش الورشة**: جولة فعلية أو افتراضية لورشة عملهم
3. **تقييم المهارة**: مراجعة حرفتهم وتقنياتهم
4. **فحص جودة المنتج**: اختبار منتجات عينة للجودة
5. **المراقبة المستمرة**: فحوصات منتظمة للحفاظ على المعايير

**ماذا يعني هذا لك**:
- يمكنك الوثوق بأن المنتجات مصنوعة يدوياً حقاً
- الحرفيون هم أشخاص حقيقيون بمهارات حقيقية
- الجودة مُتحقق منها قبل وصول المنتجات إليك
- شراؤك يدعم الحرف الأصيلة

**الشفافية**: كل صفحة منتج تعرض اسم الحرفي وموقعه وشارة التحقق.`,
      zh: `我们认真对待真实性。Banda Chao 上的每位工匠都经过**严格的验证过程**：

**验证步骤**：
1. **身份验证**：政府身份证和营业执照
2. **车间检查**：对其车间进行实体或虚拟参观
3. **技能评估**：审查他们的工艺和技术
4. **产品质量检查**：测试样品产品的质量
5. **持续监控**：定期检查以维持标准

**这对您意味着什么**：
- 您可以相信产品是真正手工制作的
- 工匠是具有真正技能的真人
- 产品到达您之前已验证质量
- 您的购买支持正宗的工艺

**透明度**：每个产品页面都显示工匠的姓名、位置和验证徽章。`,
    },
    keywords: ['verification', 'verified artisan', 'how verified', 'authenticity check', 'quality check'],
  },

  // ============================================
  // GENERAL INFO
  // ============================================
  {
    id: 'general-about',
    title: 'About Banda Chao',
    category: 'general',
    response: {
      en: `**Banda Chao** is a global social-commerce platform connecting **Chinese artisans** with customers worldwide.

**Our Mission**:
- Bridge East and West through authentic craftsmanship
- Support Chinese artisans by giving them global reach
- Offer customers unique, handcrafted products
- Create a neutral, trusted marketplace from UAE

**What Makes Us Different**:
- 🇦🇪 UAE-based (RAKEZ) for legal neutrality and tax efficiency
- 🎨 100% handcrafted products from verified artisans
- 🌍 Global shipping with free shipping over $50
- 💳 Secure Stripe payments
- 🤝 Direct artisan-to-customer connection

**Three Cultures**: We serve Chinese production power, Arabic cultural heritage, and Western quality standards.`,
      ar: `**Banda Chao** هي منصة اجتماعية-تجارية عالمية تربط **الحرفيين الصينيين** بالعملاء حول العالم.

**مهمتنا**:
- ربط الشرق والغرب من خلال الحرف الأصيلة
- دعم الحرفيين الصينيين من خلال إعطائهم وصولاً عالمياً
- تقديم منتجات يدوية فريدة للعملاء
- إنشاء سوق محايد وموثوق من الإمارات

**ما يميزنا**:
- 🇦🇪 مقرها الإمارات (RAKEZ) للحياد القانوني وكفاءة الضرائب
- 🎨 منتجات يدوية 100% من حرفيين موثقين
- 🌍 شحن عالمي مع شحن مجاني لأكثر من 50 دولار
- 💳 مدفوعات Stripe آمنة
- 🤝 اتصال مباشر من الحرفي إلى العميل

**ثلاث ثقافات**: نخدم قوة الإنتاج الصينية والتراث الثقافي العربي ومعايير الجودة الغربية.`,
      zh: `**Banda Chao** 是一个全球社交商务平台，将**中国工匠**与世界各地的客户联系起来。

**我们的使命**：
- 通过正宗的工艺连接东西方
- 通过为工匠提供全球影响力来支持中国工匠
- 为客户提供独特的手工产品
- 从阿联酋创建一个中立、值得信赖的市场

**我们的与众不同之处**：
- 🇦🇪 总部位于阿联酋（RAKEZ），实现法律中立和税收效率
- 🎨 来自经过验证的工匠的 100% 手工产品
- 🌍 全球运输，超过 50 美元免费运输
- 💳 安全的 Stripe 支付
- 🤝 从工匠到客户的直接联系

**三种文化**：我们服务于中国的生产能力、阿拉伯文化遗产和西方的质量标准。`,
    },
    keywords: ['about', 'who are you', 'what is banda chao', 'company', 'mission', 'platform'],
  },
];

/**
 * Get agent response for a given topic
 * Searches by keywords and returns the most relevant policy response
 * 
 * @param topic - User query or topic keyword
 * @param language - Language code ('en', 'ar', 'zh')
 * @returns Formatted response string or null if no match found
 */
export function getAgentResponse(
  topic: string,
  language: 'en' | 'ar' | 'zh' = 'en'
): string | null {
  if (!topic || typeof topic !== 'string') {
    return null;
  }

  const normalizedTopic = topic.toLowerCase().trim();

  // Find matching policy by keywords
  const matches = COMPANY_POLICIES.map(policy => {
    const keywordMatches = policy.keywords.filter(keyword =>
      normalizedTopic.includes(keyword.toLowerCase())
    ).length;
    return { policy, score: keywordMatches };
  }).filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    // No exact match - return general help
    return language === 'ar'
      ? 'عذراً، لم أجد معلومات محددة حول هذا الموضوع. يرجى الاتصال بفريق الدعم للحصول على مساعدة إضافية.'
      : language === 'zh'
      ? '抱歉，我没有找到关于此主题的具体信息。请联系支持团队以获得额外帮助。'
      : "I'm sorry, I couldn't find specific information about this topic. Please contact our support team for additional assistance.";
  }

  // Return the best match
  const bestMatch = matches[0].policy;
  const response = bestMatch.response[language] || bestMatch.response.en;

  return response;
}

/**
 * Get all policies for a specific category
 * 
 * @param category - Policy category
 * @returns Array of policies in that category
 */
export function getPoliciesByCategory(
  category: PolicyTopic['category']
): PolicyTopic[] {
  return COMPANY_POLICIES.filter(policy => policy.category === category);
}

/**
 * Search policies by keyword
 * 
 * @param keyword - Search keyword
 * @returns Array of matching policies
 */
export function searchPolicies(keyword: string): PolicyTopic[] {
  const normalizedKeyword = keyword.toLowerCase().trim();
  return COMPANY_POLICIES.filter(policy =>
    policy.keywords.some(k => k.toLowerCase().includes(normalizedKeyword)) ||
    policy.title.toLowerCase().includes(normalizedKeyword) ||
    policy.id.toLowerCase().includes(normalizedKeyword)
  );
}

/**
 * Get policy by ID
 * 
 * @param id - Policy ID
 * @returns Policy object or null
 */
export function getPolicyById(id: string): PolicyTopic | null {
  return COMPANY_POLICIES.find(policy => policy.id === id) || null;
}

