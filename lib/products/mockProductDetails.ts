export type ShippingOption = {
  id: string;
  label: string;
  description: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  priceUSD: number;
  videoUrl: string;
  posterUrl?: string;
  artisanName: string;
  artisanOrigin: string;
  artisanStory: string;
  artisanPortrait: string;
  materials: string;
  productHighlights: string[];
  shippingOptions: ShippingOption[];
  gallery: string[];
};

export const mockProducts: ProductDetail[] = [
  {
    id: 'silk-scarf',
    name: '丝绸手绘围巾 · Silk Horizon Scarf',
    priceUSD: 180,
    videoUrl: 'https://cdn.coverr.co/videos/coverr-weaving-with-love-4614/1080p.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80',
    artisanName: 'ليلى حسن',
    artisanOrigin: 'Suzhou, China · 18 سنة من حكايات الحرير',
    artisanStory:
      'أنا ليلى، نساجة تعلمت من جدتي كيف يحكي الحرير ألوان الصباح. كل وشاح ألوّنه يبدأ بقصة مكتوبة بخط اليد، ثم أطبعه على الحرير باستخدام أصباغ طبيعية من قشور الرمان وحبر الزعفران. أريد لمن يقتنيه أن يشعر بنسيم قناة سوتشو وصوت السوق الشعبي. عندما يصل الوشاح إليك، افتحه ببطء وستجد بطاقة صغيرة كتبتها بالعربية والصينية تقول: "هذا اللون مرَّ من بين يدي وماء النهر."',
    artisanPortrait: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    materials: '100% حرير موربيري طبيعي، مصبوغ يدويًا بمستخلص الرمان والنيلي.',
    productHighlights: [
      'Limited release of 30 scarves — each signed by the artisan in Arabic & Chinese.',
      'Hand-painted gradients that echo sunrise over the Suzhou canals.',
      'Packaging includes a bilingual story card and a reusable silk storage sleeve.',
    ],
    shippingOptions: [
      {
        id: 'express',
        label: 'Express Worldwide · 3-5 business days',
        description: 'DHL Express with carbon-neutral offset and full insurance.',
      },
      {
        id: 'standard',
        label: 'Standard International · 7-12 business days',
        description: 'Tracked shipping from the Shanghai fulfillment studio.',
      },
      {
        id: 'atelier',
        label: 'Atelier Pickup · Suzhou',
        description: 'Meet Leila at the studio for a personal fitting and tea ceremony.',
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1300&q=80',
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1300&q=80',
    ],
  },
  {
    id: 'tea-set',
    name: '景德镇柴烧茶具 · Fire-Kiln Tea Ritual Set',
    priceUSD: 245,
    videoUrl: 'https://cdn.coverr.co/videos/coverr-fire-pots-8899/1080p.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1523805014012-2b586f0d4afa?auto=format&fit=crop&w=1400&q=80',
    artisanName: 'Mei Chen',
    artisanOrigin: 'Jingdezhen, China · Kiln artisan since 1999',
    artisanStory:
      'Every firing in our family kiln is a ceremony. I layer bamboo ash over the clay and let the flame paint unpredictable galaxies on each cup. The set travels with a handwritten brewing ritual, inviting you to slow down and brew tea the way my grandfather taught me. 火与茶的故事，分享给懂得的人。',
    artisanPortrait: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    materials: 'Stoneware clay, bamboo ash glaze, fired at 1280°C for 18 hours.',
    productHighlights: [
      'Includes teapot, fairness pitcher, and four cups — each with unique kiln patterns.',
      'Handwritten brewing ritual in English and Simplified Chinese.',
      'Portion of each sale funds Jingdezhen apprenticeship scholarships.',
    ],
    shippingOptions: [
      {
        id: 'priority',
        label: 'Priority Air · 4-6 business days',
        description: 'Packed in shock-absorbent bamboo fiber with fragile handling.',
      },
      {
        id: 'sea',
        label: 'Collector Freight · 12-18 business days',
        description: 'Eco sea freight with climate-controlled storage.',
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1300&q=80',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1300&q=80',
    ],
  },
];

export const findMockProductById = (id: string) => mockProducts.find((product) => product.id === id);
