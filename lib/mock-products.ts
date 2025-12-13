// Mock Product Data - Professional products for demo
export interface MockProduct {
  id: string;
  name: string;
  nameAr?: string;
  nameZh?: string;
  description: string;
  descriptionAr?: string;
  descriptionZh?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  stock: number;
  category: string;
  categoryAr?: string;
  categoryZh?: string;
  images: string[];
  maker: {
    id: string;
    displayName: string;
    displayNameAr?: string;
    displayNameZh?: string;
    avatarUrl?: string;
    country?: string;
    city?: string;
  };
  specifications?: Record<string, string>;
  rating?: number;
  reviews?: number;
  sold?: number;
  colors?: string[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    name: 'Premium Wireless Earbuds Pro',
    nameAr: 'سماعات لاسلكية بريميوم برو',
    nameZh: '高级无线耳机 Pro',
    description: 'High-quality wireless earbuds with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
    descriptionAr: 'سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء النشط، بطارية تدوم 30 ساعة، وجودة صوت ممتازة. مثالية لعشاق الموسيقى والمحترفين.',
    descriptionZh: '高品质无线耳机，具有主动降噪功能，30小时电池续航，音质出色。非常适合音乐爱好者和专业人士。',
    price: 89.99,
    originalPrice: 149.99,
    currency: 'AED',
    stock: 45,
    category: 'Electronics',
    categoryAr: 'إلكترونيات',
    categoryZh: '电子产品',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-1',
      displayName: 'TechCraft Studio',
      displayNameAr: 'استوديو تيك كرافت',
      displayNameZh: '科技工艺工作室',
      avatarUrl: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=200&auto=format&fit=crop',
      country: 'China',
      city: 'Shenzhen',
    },
    specifications: {
      'Battery Life': '30 hours',
      'Noise Cancellation': 'Active',
      'Connectivity': 'Bluetooth 5.2',
      'Water Resistance': 'IPX7',
      'Weight': '5.2g per earbud',
    },
    rating: 4.8,
    reviews: 1247,
    sold: 8934,
    colors: ['Black', 'White', 'Blue', 'Red'],
  },
  {
    id: '2',
    name: 'Handmade Leather Wallet',
    nameAr: 'محفظة جلدية يدوية الصنع',
    nameZh: '手工真皮钱包',
    description: 'Premium genuine leather wallet handcrafted by skilled artisans. Features multiple card slots, cash compartment, and RFID blocking technology.',
    descriptionAr: 'محفظة جلدية أصلية فاخرة مصنوعة يدوياً من قبل حرفيين مهرة. تتميز بفتحات بطاقات متعددة، ومساحة للنقود، وتقنية حجب RFID.',
    descriptionZh: '由熟练工匠手工制作的优质真皮钱包。具有多个卡槽、现金隔层和RFID屏蔽技术。',
    price: 45.00,
    originalPrice: 75.00,
    currency: 'AED',
    stock: 23,
    category: 'Fashion',
    categoryAr: 'أزياء',
    categoryZh: '时尚',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-2',
      displayName: 'Leather Masters',
      displayNameAr: 'أساتذة الجلود',
      displayNameZh: '皮革大师',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      country: 'Italy',
      city: 'Florence',
    },
    specifications: {
      'Material': 'Genuine Leather',
      'Color': 'Brown',
      'Card Slots': '8',
      'Dimensions': '10.5 x 7.5 cm',
      'Warranty': '2 years',
    },
    rating: 4.9,
    reviews: 892,
    sold: 3456,
    colors: ['Brown', 'Black', 'Tan'],
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    nameAr: 'ساعة ذكية لللياقة البدنية',
    nameZh: '智能健身手表',
    description: 'Advanced fitness tracking watch with heart rate monitor, GPS, sleep tracking, and 50+ sport modes. Waterproof design for active lifestyle.',
    descriptionAr: 'ساعة تتبع لياقة بدنية متقدمة مع مراقب معدل ضربات القلب، GPS، تتبع النوم، وأكثر من 50 وضع رياضي. تصميم مقاوم للماء لنمط حياة نشط.',
    descriptionZh: '先进的健身追踪手表，具有心率监测、GPS、睡眠追踪和50多种运动模式。防水设计，适合积极的生活方式。',
    price: 199.99,
    originalPrice: 299.99,
    currency: 'AED',
    stock: 12,
    category: 'Electronics',
    categoryAr: 'إلكترونيات',
    categoryZh: '电子产品',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-3',
      displayName: 'FitTech Innovations',
      displayNameAr: 'ابتكارات فيت تيك',
      displayNameZh: '健身科技创新',
      avatarUrl: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=200&auto=format&fit=crop',
      country: 'China',
      city: 'Beijing',
    },
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery': '7 days',
      'Water Resistance': '5 ATM',
      'GPS': 'Built-in',
      'Sensors': 'Heart Rate, SpO2, Accelerometer',
    },
    rating: 4.7,
    reviews: 2156,
    sold: 12456,
    colors: ['Black', 'Silver', 'Rose Gold'],
  },
  {
    id: '4',
    name: 'Artisan Ceramic Coffee Set',
    nameAr: 'طقم قهوة سيراميك حرفي',
    nameZh: '手工陶瓷咖啡套装',
    description: 'Beautiful handcrafted ceramic coffee set including 4 cups, saucers, and a coffee pot. Each piece is unique, made by traditional artisans.',
    descriptionAr: 'طقم قهوة سيراميك جميل مصنوع يدوياً يتضمن 4 أكواب، صحون، وإبريق قهوة. كل قطعة فريدة، مصنوعة من قبل حرفيين تقليديين.',
    descriptionZh: '精美的手工陶瓷咖啡套装，包括4个杯子、碟子和咖啡壶。每件都是独特的，由传统工匠制作。',
    price: 65.00,
    originalPrice: 95.00,
    currency: 'AED',
    stock: 8,
    category: 'Home & Living',
    categoryAr: 'المنزل والمعيشة',
    categoryZh: '家居生活',
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-4',
      displayName: 'Ceramic Art Studio',
      displayNameAr: 'استوديو الفن السيراميكي',
      displayNameZh: '陶瓷艺术工作室',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      country: 'Morocco',
      city: 'Fes',
    },
    specifications: {
      'Material': 'Ceramic',
      'Set Includes': '4 cups, 4 saucers, 1 pot',
      'Capacity': '250ml per cup',
      'Dishwasher Safe': 'Yes',
      'Handmade': 'Yes',
    },
    rating: 4.9,
    reviews: 567,
    sold: 1234,
  },
  {
    id: '5',
    name: 'Designer Silk Scarf',
    nameAr: 'وشاح حرير مصمم',
    nameZh: '设计师真丝围巾',
    description: 'Luxurious 100% pure silk scarf with elegant patterns. Hand-printed using traditional techniques. Perfect accessory for any occasion.',
    descriptionAr: 'وشاح حرير فاخر 100% خالص بأنماط أنيقة. مطبوع يدوياً باستخدام تقنيات تقليدية. إكسسوار مثالي لأي مناسبة.',
    descriptionZh: '奢华的100%纯真丝围巾，带有优雅图案。使用传统技术手工印刷。适合任何场合的完美配饰。',
    price: 55.00,
    originalPrice: 85.00,
    currency: 'AED',
    stock: 34,
    category: 'Fashion',
    categoryAr: 'أزياء',
    categoryZh: '时尚',
    images: [
      'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-5',
      displayName: 'Silk Traditions',
      displayNameAr: 'تقاليد الحرير',
      displayNameZh: '丝绸传统',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      country: 'India',
      city: 'Varanasi',
    },
    specifications: {
      'Material': '100% Pure Silk',
      'Dimensions': '90 x 90 cm',
      'Care': 'Dry clean only',
      'Origin': 'Handmade in India',
      'Pattern': 'Traditional',
    },
    rating: 4.8,
    reviews: 1234,
    sold: 5678,
  },
  {
    id: '6',
    name: 'Portable Phone Charger 20000mAh',
    nameAr: 'شاحن هاتف محمول 20000 مللي أمبير',
    nameZh: '便携式手机充电器 20000mAh',
    description: 'High-capacity portable charger with fast charging technology. Can charge your phone 5-6 times. Compact design, perfect for travel.',
    descriptionAr: 'شاحن محمول عالي السعة مع تقنية الشحن السريع. يمكنه شحن هاتفك 5-6 مرات. تصميم مضغوط، مثالي للسفر.',
    descriptionZh: '大容量便携式充电器，具有快速充电技术。可为您的手机充电5-6次。紧凑设计，非常适合旅行。',
    price: 39.99,
    originalPrice: 59.99,
    currency: 'AED',
    stock: 67,
    category: 'Electronics',
    categoryAr: 'إلكترونيات',
    categoryZh: '电子产品',
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1609091839506-0c7c79c8e3a1?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-6',
      displayName: 'PowerTech Solutions',
      displayNameAr: 'حلول باور تيك',
      displayNameZh: '电源科技解决方案',
      avatarUrl: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=200&auto=format&fit=crop',
      country: 'China',
      city: 'Guangzhou',
    },
    specifications: {
      'Capacity': '20000mAh',
      'Output': '5V/3A Fast Charge',
      'Input': '5V/2A',
      'Ports': '2 USB-A, 1 USB-C',
      'Weight': '380g',
    },
    rating: 4.6,
    reviews: 3456,
    sold: 23456,
  },
  {
    id: '7',
    name: 'Handwoven Bamboo Basket',
    nameAr: 'سلة خيزران منسوجة يدوياً',
    nameZh: '手工编织竹篮',
    description: 'Eco-friendly handwoven bamboo storage basket. Perfect for organizing home, office, or as a decorative piece. Sustainable and durable.',
    descriptionAr: 'سلة تخزين منسوجة يدوياً من الخيزران صديقة للبيئة. مثالية لتنظيم المنزل أو المكتب أو كقطعة ديكور. مستدامة ومتينة.',
    descriptionZh: '环保的手工编织竹制储物篮。非常适合整理家居、办公室或作为装饰品。可持续且耐用。',
    price: 28.00,
    originalPrice: 42.00,
    currency: 'AED',
    stock: 19,
    category: 'Home & Living',
    categoryAr: 'المنزل والمعيشة',
    categoryZh: '家居生活',
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-7',
      displayName: 'Bamboo Crafts Co.',
      displayNameAr: 'شركة حرف الخيزران',
      displayNameZh: '竹艺公司',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      country: 'Vietnam',
      city: 'Hanoi',
    },
    specifications: {
      'Material': 'Natural Bamboo',
      'Dimensions': '30 x 25 x 15 cm',
      'Weight': '450g',
      'Handmade': 'Yes',
      'Eco-Friendly': '100%',
    },
    rating: 4.7,
    reviews: 789,
    sold: 3456,
  },
  {
    id: '8',
    name: 'Vintage Style Sunglasses',
    nameAr: 'نظارات شمسية بأسلوب كلاسيكي',
    nameZh: '复古风格太阳镜',
    description: 'Stylish vintage-inspired sunglasses with UV400 protection. Lightweight frame, comfortable fit. Available in multiple colors.',
    descriptionAr: 'نظارات شمسية أنيقة مستوحاة من الطراز الكلاسيكي مع حماية UV400. إطار خفيف الوزن، مريحة. متوفرة بألوان متعددة.',
    descriptionZh: '时尚的复古风格太阳镜，具有UV400保护。轻质镜框，舒适贴合。多种颜色可选。',
    price: 35.00,
    originalPrice: 55.00,
    currency: 'AED',
    stock: 56,
    category: 'Fashion',
    categoryAr: 'أزياء',
    categoryZh: '时尚',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop',
    ],
    maker: {
      id: 'maker-8',
      displayName: 'Style Optics',
      displayNameAr: 'ستايل أوبتكس',
      displayNameZh: '风格光学',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      country: 'Italy',
      city: 'Milan',
    },
    specifications: {
      'UV Protection': 'UV400',
      'Frame Material': 'Acetate',
      'Lens Material': 'Polycarbonate',
      'Weight': '25g',
      'Warranty': '1 year',
    },
    rating: 4.5,
    reviews: 2345,
    sold: 12345,
  },
];

// Helper function to get product by ID
export function getMockProductById(id: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find(p => p.id === id);
}

// Helper function to get all mock products
export function getAllMockProducts(): MockProduct[] {
  return MOCK_PRODUCTS;
}

// Convert mock product to API format
export function mockProductToApiFormat(product: MockProduct, locale: string = 'en'): any {
  return {
    id: product.id,
    name: locale === 'ar' ? (product.nameAr || product.name) : 
          locale === 'zh' ? (product.nameZh || product.name) : 
          product.name,
    description: locale === 'ar' ? (product.descriptionAr || product.description) :
                  locale === 'zh' ? (product.descriptionZh || product.description) :
                  product.description,
    price: product.price,
    currency: product.currency,
    stock: product.stock,
    category: locale === 'ar' ? (product.categoryAr || product.category) :
              locale === 'zh' ? (product.categoryZh || product.category) :
              product.category,
    images: product.images.map(url => ({ url })),
    imageUrl: product.images[0],
    maker: {
      id: product.maker.id,
      displayName: locale === 'ar' ? (product.maker.displayNameAr || product.maker.displayName) :
                   locale === 'zh' ? (product.maker.displayNameZh || product.maker.displayName) :
                   product.maker.displayName,
      avatarUrl: product.maker.avatarUrl,
      country: product.maker.country,
      city: product.maker.city,
    },
    makerId: product.maker.id,
    specifications: product.specifications,
    rating: product.rating,
    reviews: product.reviews,
    sold: product.sold,
    originalPrice: product.originalPrice,
    colors: product.colors,
  };
}
