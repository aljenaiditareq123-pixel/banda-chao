import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Clearing existing data...');
  await prisma.message.deleteMany();
  await prisma.post.deleteMany();
  await prisma.video.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create 5 users
  console.log('👥 Creating users...');
  const users = [];
  const userData = [
    { email: 'user1@bandachao.com', name: '张明', password: 'password123' },
    { email: 'user2@bandachao.com', name: '李华', password: 'password123' },
    { email: 'user3@bandachao.com', name: '王芳', password: 'password123' },
    { email: 'user4@bandachao.com', name: '刘强', password: 'password123' },
    { email: 'user5@bandachao.com', name: '陈静', password: 'password123' },
  ];

  for (const user of userData) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        profilePicture: `https://i.pravatar.cc/150?u=${user.email}`,
      },
    });
    users.push(createdUser);
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  // Create 10 videos (5 short, 5 long)
  console.log('🎬 Creating videos...');
  const videoTitles = {
    short: [
      '有趣的短视频 #1',
      '生活小技巧分享',
      '美食制作教程',
      '旅行见闻',
      '搞笑瞬间',
    ],
    long: [
      '完整的烹饪教程 - 如何制作宫保鸡丁',
      '深度解析：中国传统文化',
      '旅行vlog：探索美丽的云南',
      '技术分享：前端开发最佳实践',
      '电影评论：最新热门影片',
    ],
  };

  const videoDescriptions = {
    short: [
      '这是一个非常有趣的短视频，希望大家喜欢！',
      '分享一个实用的生活小技巧，对大家很有帮助。',
      '今天教大家做一道简单又美味的菜。',
      '记录一次难忘的旅行经历。',
      '生活中的搞笑瞬间，让人忍俊不禁。',
    ],
    long: [
      '在这个视频中，我将详细讲解如何制作正宗的宫保鸡丁，包括选材、切配、烹饪技巧等。',
      '深入探讨中国传统文化的精髓，了解历史背景和现代意义。',
      '跟随我的镜头，一起探索云南的美丽风景和独特文化。',
      '分享我在前端开发过程中总结的最佳实践和经验。',
      '对最新上映的热门电影进行深度评论和分析。',
    ],
  };

  // Create short videos
  for (let i = 0; i < 5; i++) {
    const user = users[i % users.length];
    await prisma.video.create({
      data: {
        userId: user.id,
        title: videoTitles.short[i],
        description: videoDescriptions.short[i],
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        thumbnailUrl: `https://picsum.photos/640/360?random=${i + 1}`,
        duration: 30 + Math.floor(Math.random() * 60), // 30-90 seconds
        type: 'short',
        views: Math.floor(Math.random() * 10000),
        likes: Math.floor(Math.random() * 500),
      },
    });
    console.log(`✅ Created short video: ${videoTitles.short[i]}`);
  }

  // Create long videos
  for (let i = 0; i < 5; i++) {
    const user = users[i % users.length];
    await prisma.video.create({
      data: {
        userId: user.id,
        title: videoTitles.long[i],
        description: videoDescriptions.long[i],
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`,
        thumbnailUrl: `https://picsum.photos/1280/720?random=${i + 10}`,
        duration: 600 + Math.floor(Math.random() * 1800), // 10-40 minutes
        type: 'long',
        views: Math.floor(Math.random() * 50000),
        likes: Math.floor(Math.random() * 2000),
      },
    });
    console.log(`✅ Created long video: ${videoTitles.long[i]}`);
  }

  // Create 15 products
  console.log('🛍️ Creating products...');
  const productData = [
    {
      name: 'iPhone 15 Pro',
      description: '最新款iPhone，配备A17 Pro芯片，拍照功能强大，性能卓越。',
      price: 7999,
      category: '电子产品',
      imageUrl: 'https://picsum.photos/400/400?random=101',
      externalLink: 'https://www.apple.com',
    },
    {
      name: '时尚运动鞋',
      description: '舒适透气的运动鞋，适合日常运动和休闲穿着。',
      price: 299,
      category: '时尚',
      imageUrl: 'https://picsum.photos/400/400?random=102',
      externalLink: 'https://www.example.com',
    },
    {
      name: '现代简约沙发',
      description: '北欧风格沙发，舒适耐用，适合现代家居装饰。',
      price: 2999,
      category: '家居',
      imageUrl: 'https://picsum.photos/400/400?random=103',
      externalLink: 'https://www.example.com',
    },
    {
      name: '瑜伽垫',
      description: '防滑瑜伽垫，厚度适中，适合各种瑜伽练习。',
      price: 89,
      category: '运动',
      imageUrl: 'https://picsum.photos/400/400?random=104',
      externalLink: 'https://www.example.com',
    },
    {
      name: '有机绿茶',
      description: '优质有机绿茶，口感清香，健康养生。',
      price: 59,
      category: '美食',
      imageUrl: 'https://picsum.photos/400/400?random=105',
      externalLink: 'https://www.example.com',
    },
    {
      name: '无线蓝牙耳机',
      description: '高品质蓝牙耳机，降噪功能强大，音质清晰。',
      price: 399,
      category: '电子产品',
      imageUrl: 'https://picsum.photos/400/400?random=106',
      externalLink: 'https://www.example.com',
    },
    {
      name: '时尚连衣裙',
      description: '优雅时尚的连衣裙，适合各种场合穿着。',
      price: 199,
      category: '时尚',
      imageUrl: 'https://picsum.photos/400/400?random=107',
      externalLink: 'https://www.example.com',
    },
    {
      name: '实木餐桌',
      description: '优质实木餐桌，环保健康，经久耐用。',
      price: 1999,
      category: '家居',
      imageUrl: 'https://picsum.photos/400/400?random=108',
      externalLink: 'https://www.example.com',
    },
    {
      name: '跑步机',
      description: '家用跑步机，静音设计，适合室内运动。',
      price: 2999,
      category: '运动',
      imageUrl: 'https://picsum.photos/400/400?random=109',
      externalLink: 'https://www.example.com',
    },
    {
      name: '手工巧克力',
      description: '精致手工巧克力，多种口味，精美包装。',
      price: 129,
      category: '美食',
      imageUrl: 'https://picsum.photos/400/400?random=110',
      externalLink: 'https://www.example.com',
    },
    {
      name: '智能手表',
      description: '多功能智能手表，健康监测，运动追踪。',
      price: 1299,
      category: '电子产品',
      imageUrl: 'https://picsum.photos/400/400?random=111',
      externalLink: 'https://www.example.com',
    },
    {
      name: '时尚背包',
      description: '多功能时尚背包，容量大，适合旅行和日常使用。',
      price: 199,
      category: '时尚',
      imageUrl: 'https://picsum.photos/400/400?random=112',
      externalLink: 'https://www.example.com',
    },
    {
      name: '记忆棉枕头',
      description: '舒适记忆棉枕头，护颈设计，改善睡眠质量。',
      price: 159,
      category: '家居',
      imageUrl: 'https://picsum.photos/400/400?random=113',
      externalLink: 'https://www.example.com',
    },
    {
      name: '哑铃套装',
      description: '可调节重量哑铃，适合家庭健身。',
      price: 299,
      category: '运动',
      imageUrl: 'https://picsum.photos/400/400?random=114',
      externalLink: 'https://www.example.com',
    },
    {
      name: '有机蜂蜜',
      description: '纯天然有机蜂蜜，营养丰富，口感纯正。',
      price: 79,
      category: '美食',
      imageUrl: 'https://picsum.photos/400/400?random=115',
      externalLink: 'https://www.example.com',
    },
  ];

  for (let i = 0; i < productData.length; i++) {
    const product = productData[i];
    const user = users[i % users.length];
    await prisma.product.create({
      data: {
        userId: user.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        externalLink: product.externalLink,
      },
    });
    console.log(`✅ Created product: ${product.name}`);
  }

  // Create some posts
  console.log('📝 Creating posts...');
  const postContents = [
    '今天天气真好，适合出去走走！',
    '分享一张美丽的风景照片 📸',
    '刚刚完成了一个新项目，很有成就感！',
    '推荐一本好书给大家：《活着》',
    '周末计划：去爬山，享受大自然 🌲',
  ];

  for (let i = 0; i < postContents.length; i++) {
    const user = users[i % users.length];
    await prisma.post.create({
      data: {
        userId: user.id,
        content: postContents[i],
        images: [`https://picsum.photos/800/600?random=${i + 200}`],
      },
    });
    console.log(`✅ Created post by ${user.name}`);
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Videos: 10 (5 short, 5 long)`);
  console.log(`   - Products: ${productData.length}`);
  console.log(`   - Posts: ${postContents.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


