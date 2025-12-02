import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const videoTemplates = [
  {
    title: 'كيفية صنع مزهرية سيراميك يدوية',
    titleEn: 'How to Make a Handmade Ceramic Vase',
    description: 'شاهد عملية صنع مزهرية سيراميك فاخرة بتقنيات تقليدية عريقة',
    type: 'LONG',
    duration: 600,
  },
  {
    title: 'عرض سريع: طقم شاي نحاسي',
    titleEn: 'Quick Showcase: Copper Tea Set',
    description: 'عرض سريع لطقم شاي نحاسي أنيق مصنوع يدوياً',
    type: 'SHORT',
    duration: 60,
  },
  {
    title: 'عملية نسج السجادة الصوفية',
    titleEn: 'Wool Rug Weaving Process',
    description: 'شاهد كيف يتم نسج السجادة الصوفية التقليدية خطوة بخطوة',
    type: 'LONG',
    duration: 900,
  },
  {
    title: 'درس سريع: صنع إبريق فخاري',
    titleEn: 'Quick Tutorial: Making a Pottery Jug',
    description: 'درس سريع لصنع إبريق فخاري تقليدي',
    type: 'SHORT',
    duration: 90,
  },
  {
    title: 'كواليس ورشة العمل',
    titleEn: 'Behind the Scenes: Workshop',
    description: 'جولة في ورشة العمل لرؤية كيف يعمل الحرفيون',
    type: 'LONG',
    duration: 720,
  },
  {
    title: 'عرض المنتج: سلة خيزران',
    titleEn: 'Product Showcase: Bamboo Basket',
    description: 'عرض تفصيلي لسلة خيزران يدوية الصنع',
    type: 'SHORT',
    duration: 45,
  },
  {
    title: 'صنع مصباح زجاجي ملون',
    titleEn: 'Making a Colored Glass Lamp',
    description: 'عملية كاملة لصنع مصباح زجاجي بتصميم فني',
    type: 'LONG',
    duration: 800,
  },
  {
    title: 'نحت صندوق خشبي',
    titleEn: 'Carving a Wooden Box',
    description: 'شاهد عملية نحت صندوق خشبي بتصاميم عربية',
    type: 'SHORT',
    duration: 120,
  },
  {
    title: 'تطريز وسادة حريرية',
    titleEn: 'Embroidering a Silk Pillow',
    description: 'عملية تطريز وسادة فاخرة بالحرير',
    type: 'LONG',
    duration: 650,
  },
  {
    title: 'صنع قلادة فضية',
    titleEn: 'Making a Silver Necklace',
    description: 'عملية صنع قلادة فضية منقوشة يدوياً',
    type: 'SHORT',
    duration: 75,
  },
];

async function seedVideos() {
  console.log('🎬 Starting video seeding...\n');

  // Get all users who are makers
  const makers = await prisma.$queryRawUnsafe<Array<{ id: string; user_id: string }>>(`
    SELECT id, user_id FROM makers LIMIT 20
  `);

  if (makers.length === 0) {
    console.log('⚠️  No makers found. Please run massive-seed.ts first.');
    return;
  }

  let videoCount = 0;
  for (let i = 0; i < videoTemplates.length && i < makers.length; i++) {
    const template = videoTemplates[i];
    const maker = makers[i];
    const videoId = randomUUID();
    
    const languages = ['ar', 'en', 'zh'];
    const language = languages[i % languages.length];

    await prisma.$executeRawUnsafe(`
      INSERT INTO videos (id, user_id, title, description, video_url, thumbnail_url, duration, type, views, likes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    `,
      videoId,
      maker.user_id,
      template.title,
      template.description,
      `https://example.com/videos/${videoId}.mp4`,
      `https://picsum.photos/1280/720?random=${i + 100}`,
      template.duration,
      template.type,
      Math.floor(Math.random() * 1000) + 100,
      Math.floor(Math.random() * 50) + 10
    );

    videoCount++;
    console.log(`✅ Created video ${videoCount}/10: ${template.title}`);
  }

  console.log(`\n🎉 Created ${videoCount} videos successfully!`);
}

seedVideos()
  .catch((e) => {
    console.error('❌ Error seeding videos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

