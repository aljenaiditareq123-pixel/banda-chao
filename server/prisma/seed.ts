import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Founder User
  const founderPassword = await bcrypt.hash('founder123', 10);
  const founder = await prisma.user.upsert({
    where: { email: 'founder@bandachao.com' },
    update: {},
    create: {
      email: 'founder@bandachao.com',
      passwordHash: founderPassword,
      name: 'المؤسس',
      role: 'FOUNDER',
      bio: 'مؤسس منصة Banda Chao',
    },
  });
  console.log('✅ Created founder user:', founder.email);

  // 2. Create Makers (3-5 makers)
  const makersData = [
    {
      email: 'zhang@maker.com',
      name: '张师傅',
      displayName: '张师傅 - 传统陶瓷大师',
      bio: '传统陶瓷工艺大师，拥有30年经验，专注于制作精美的中国陶瓷艺术品。',
      bioEn: 'Master Zhang - Traditional ceramics master with 30 years of experience, specializing in exquisite Chinese ceramic art.',
      bioAr: 'الأستاذ Zhang - سيد السيراميك التقليدي مع 30 عاماً من الخبرة، متخصص في صناعة الفنون السيراميكية الصينية الرائعة.',
      country: 'China',
      city: '景德镇',
      languages: ['zh', 'en'],
      role: 'MAKER' as const,
    },
    {
      email: 'li@maker.com',
      name: '李师傅',
      displayName: '李师傅 - 丝绸刺绣专家',
      bio: '丝绸刺绣专家，传承家族技艺，创作精美的刺绣作品。',
      bioEn: 'Master Li - Silk embroidery expert, inheriting family craftsmanship, creating exquisite embroidery works.',
      bioAr: 'الأستاذ Li - خبير التطريز الحريري، وراثة الحرف العائلية، إنشاء أعمال تطريز رائعة.',
      country: 'China',
      city: '苏州',
      languages: ['zh', 'en', 'ar'],
      role: 'MAKER' as const,
    },
    {
      email: 'wang@maker.com',
      name: '王师傅',
      displayName: '王师傅 - 竹编工艺师',
      bio: '竹编工艺师，创新传统设计，制作实用的竹编产品。',
      bioEn: 'Master Wang - Bamboo weaving artisan, innovating traditional designs, creating practical bamboo products.',
      bioAr: 'الأستاذ Wang - حرفي نسج الخيزران، ابتكار التصاميم التقليدية، صناعة منتجات الخيزران العملية.',
      country: 'China',
      city: '杭州',
      languages: ['zh', 'en'],
      role: 'MAKER' as const,
    },
    {
      email: 'ahmed@maker.com',
      name: 'أحمد الحرفي',
      displayName: 'أحمد الحرفي - صانع الفخار',
      bio: 'صانع فخار تقليدي من مصر، متخصص في صناعة الأواني الفخارية اليدوية.',
      bioEn: 'Ahmed the Artisan - Traditional potter from Egypt, specializing in handmade pottery.',
      bioAr: 'أحمد الحرفي - صانع فخار تقليدي من مصر، متخصص في صناعة الأواني الفخارية اليدوية.',
      country: 'Egypt',
      city: 'القاهرة',
      languages: ['ar', 'en'],
      role: 'MAKER' as const,
    },
    {
      email: 'sarah@maker.com',
      name: 'Sarah Maker',
      displayName: 'Sarah - Handmade Jewelry',
      bio: 'Handmade jewelry designer creating unique pieces inspired by Chinese and Arabic cultures.',
      bioEn: 'Handmade jewelry designer creating unique pieces inspired by Chinese and Arabic cultures.',
      bioAr: 'مصممة مجوهرات يدوية تصنع قطعاً فريدة مستوحاة من الثقافتين الصينية والعربية.',
      country: 'USA',
      city: 'New York',
      languages: ['en', 'zh'],
      role: 'MAKER' as const,
    },
  ];

  const createdMakers = [];
  for (const makerData of makersData) {
    const password = await bcrypt.hash('maker123', 10);
    const user = await prisma.user.upsert({
      where: { email: makerData.email },
      update: {},
      create: {
        email: makerData.email,
        passwordHash: password,
        name: makerData.name,
        role: makerData.role,
        bio: makerData.bio,
      },
    });

    const maker = await prisma.maker.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: makerData.displayName,
        bio: makerData.bio,
        country: makerData.country,
        city: makerData.city,
        languages: makerData.languages,
        rating: Math.random() * 2 + 3.5, // 3.5-5.5
        reviewCount: Math.floor(Math.random() * 50) + 10,
      },
    });

    createdMakers.push(maker);
    console.log(`✅ Created maker: ${maker.displayName}`);
  }

  // 3. Create Products for each Maker (5-10 products each)
  const productTemplates = [
    { name: 'Ceramic Vase', nameZh: '陶瓷花瓶', nameAr: 'مزهرية سيراميك', price: 150, category: 'Ceramics' },
    { name: 'Silk Scarf', nameZh: '丝绸围巾', nameAr: 'وشاح حريري', price: 80, category: 'Textiles' },
    { name: 'Bamboo Basket', nameZh: '竹篮', nameAr: 'سلة خيزران', price: 45, category: 'Bamboo' },
    { name: 'Handmade Pot', nameZh: '手工陶罐', nameAr: 'وعاء فخاري يدوي', price: 60, category: 'Pottery' },
    { name: 'Embroidered Pillow', nameZh: '刺绣枕头', nameAr: 'وسادة مطرزة', price: 120, category: 'Textiles' },
    { name: 'Jade Necklace', nameZh: '玉项链', nameAr: 'قلادة من اليشم', price: 300, category: 'Jewelry' },
    { name: 'Tea Set', nameZh: '茶具', nameAr: 'طقم شاي', price: 200, category: 'Ceramics' },
    { name: 'Wooden Box', nameZh: '木盒', nameAr: 'صندوق خشبي', price: 90, category: 'Woodwork' },
  ];

  for (const maker of createdMakers) {
    const productCount = Math.floor(Math.random() * 6) + 5; // 5-10 products
    const selectedProducts = productTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, productCount);

    for (const template of selectedProducts) {
      const product = await prisma.product.create({
        data: {
          makerId: maker.id,
          name: template.name,
          description: `Beautiful handmade ${template.name.toLowerCase()} crafted with traditional techniques.`,
          price: template.price + Math.random() * 50,
          currency: 'USD',
          stock: Math.floor(Math.random() * 20) + 5,
          status: 'PUBLISHED',
          category: template.category,
          tags: [template.category.toLowerCase(), 'handmade', 'traditional'],
          images: {
            create: [
              {
                url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(template.name)}`,
                alt: template.name,
                order: 0,
              },
            ],
          },
        },
      });
      console.log(`  ✅ Created product: ${product.name} for ${maker.displayName}`);
    }
  }

  // 4. Create Videos for each Maker (3-5 videos each)
  const videoTemplates = [
    { title: 'Making Process', titleZh: '制作过程', titleAr: 'عملية الصنع', type: 'LONG' as const },
    { title: 'Quick Tutorial', titleZh: '快速教程', titleAr: 'درس سريع', type: 'SHORT' as const },
    { title: 'Product Showcase', titleZh: '产品展示', titleAr: 'عرض المنتج', type: 'SHORT' as const },
    { title: 'Behind the Scenes', titleZh: '幕后花絮', titleAr: 'كواليس', type: 'LONG' as const },
  ];

  for (const maker of createdMakers) {
    const videoCount = Math.floor(Math.random() * 3) + 3; // 3-5 videos
    const selectedVideos = videoTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, videoCount);

    for (const template of selectedVideos) {
      const video = await prisma.video.create({
        data: {
          makerId: maker.id,
          title: template.title,
          description: `Watch how ${maker.displayName} creates beautiful handmade products.`,
          videoUrl: `https://example.com/videos/${maker.id}/${template.title.toLowerCase().replace(/\s+/g, '-')}.mp4`,
          thumbnailUrl: `https://via.placeholder.com/1280x720?text=${encodeURIComponent(template.title)}`,
          language: maker.languages[0] || 'en',
          duration: template.type === 'SHORT' ? 60 : 600,
          type: template.type,
          viewsCount: Math.floor(Math.random() * 1000) + 100,
          likesCount: Math.floor(Math.random() * 100) + 10,
        },
      });
      console.log(`  ✅ Created video: ${video.title} for ${maker.displayName}`);
    }
  }

  // 5. Create some Posts
  const firstMaker = createdMakers[0];
  if (firstMaker) {
    const firstMakerUser = await prisma.user.findUnique({
      where: { id: firstMaker.userId },
    });

    if (firstMakerUser) {
      const post = await prisma.post.create({
        data: {
          authorId: firstMakerUser.id,
          makerId: firstMaker.id,
          content: 'Excited to share my latest creation! Check out my new ceramic collection.',
          type: 'TEXT',
        },
      });
      console.log('✅ Created post');

      // 6. Create some Comments
      const buyer = await prisma.user.create({
        data: {
          email: 'buyer@example.com',
          passwordHash: await bcrypt.hash('buyer123', 10),
          name: 'Test Buyer',
          role: 'BUYER',
        },
      });

      await prisma.comment.create({
        data: {
          authorId: buyer.id,
          targetType: 'POST',
          targetId: post.id,
          content: 'Amazing work! I love your craftsmanship.',
        },
      });
      console.log('✅ Created comment');
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



