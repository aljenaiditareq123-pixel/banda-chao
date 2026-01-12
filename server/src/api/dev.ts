import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * POST /api/v1/dev/seed
 * Secure database seeding endpoint for production
 * 
 * Requires header: x-seed-secret
 * Must match: process.env.SEED_SECRET
 */
router.post('/seed', async (req: Request, res: Response) => {
  // Ensure CORS headers are set
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-seed-secret");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  try {
    // Check for x-seed-secret header
    const seedSecret = req.headers['x-seed-secret'];
    const expectedSecret = process.env.SEED_SECRET;

    if (!seedSecret) {
      return res.status(401).json({
        error: 'Missing x-seed-secret header',
        message: 'Please provide x-seed-secret header with valid secret'
      });
    }

    if (!expectedSecret) {
      console.error('⚠️  SEED_SECRET environment variable is not set');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'SEED_SECRET is not configured on the server'
      });
    }

    // Compare secrets (case-sensitive)
    if (seedSecret !== expectedSecret) {
      return res.status(401).json({
        error: 'Invalid x-seed-secret',
        message: 'The provided secret does not match the server configuration'
      });
    }

    // Run seed logic (same as prisma/seed.ts)
    console.log('🌱 Starting database seeding via API...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.messages.deleteMany();
    await prisma.posts.deleteMany();
    await prisma.videos.deleteMany();
    await prisma.products.deleteMany();
    await prisma.makers.deleteMany();
    await prisma.users.deleteMany();

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
      const createdUser = await prisma.users.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          profile_picture: `https://i.pravatar.cc/150?u=${user.email}`,
        },
      });
      users.push(createdUser);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    // Create 8 short videos
    console.log('🎬 Creating videos...');
    const shortVideoTitles = [
      '有趣的短视频 #1',
      '生活小技巧分享',
      '美食制作教程',
      '旅行见闻',
      '搞笑瞬间',
      '手工制作过程',
      '日常Vlog分享',
      '快速化妆教程',
    ];
    
    const shortVideoDescriptions = [
      '这是一个非常有趣的短视频，希望大家喜欢！',
      '分享一个实用的生活小技巧，对大家很有帮助。',
      '今天教大家做一道简单又美味的菜。',
      '记录一次难忘的旅行经历。',
      '生活中的搞笑瞬间，让人忍俊不禁。',
      '展示手工制作的详细过程，简单易学。',
      '记录一天的有趣生活，分享给大家。',
      '3分钟快速化妆，适合忙碌的早晨。',
    ];

    for (let i = 0; i < shortVideoTitles.length; i++) {
      const user = users[i % users.length];
      await prisma.videos.create({
        data: {
          id: `${user.id}-video-${i}`,
          user_id: user.id,
          title: shortVideoTitles[i],
          description: shortVideoDescriptions[i],
          video_url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
          thumbnail_url: `https://picsum.photos/640/360?random=${i + 1}`,
          duration: 30 + Math.floor(Math.random() * 60), // 30-90 seconds
          type: 'SHORT',
          views: Math.floor(Math.random() * 10000),
          likes: Math.floor(Math.random() * 500),
        },
      });
      console.log(`✅ Created short video: ${shortVideoTitles[i]}`);
    }

    // Create 5 long videos
    const longVideoTitles = [
      '完整的烹饪教程 - 如何制作宫保鸡丁',
      '深度解析：中国传统文化',
      '旅行vlog：探索美丽的云南',
      '技术分享：前端开发最佳实践',
      '电影评论：最新热门影片',
    ];

    const longVideoDescriptions = [
      '在这个视频中，我将详细讲解如何制作正宗的宫保鸡丁，包括选材、切配、烹饪技巧等。',
      '深入探讨中国传统文化的精髓，了解历史背景和现代意义。',
      '跟随我的镜头，一起探索云南的美丽风景和独特文化。',
      '分享我在前端开发过程中总结的最佳实践和经验。',
      '对最新上映的热门电影进行深度评论和分析。',
    ];

    for (let i = 0; i < longVideoTitles.length; i++) {
      const user = users[i % users.length];
      await prisma.videos.create({
        data: {
          id: `${user.id}-video-long-${i}`,
          user_id: user.id,
          title: longVideoTitles[i],
          description: longVideoDescriptions[i],
          video_url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`,
          thumbnail_url: `https://picsum.photos/1280/720?random=${i + 10}`,
          duration: 600 + Math.floor(Math.random() * 1800), // 10-40 minutes
          type: 'LONG',
          views: Math.floor(Math.random() * 50000),
          likes: Math.floor(Math.random() * 2000),
        },
      });
      console.log(`✅ Created long video: ${longVideoTitles[i]}`);
    }

    // Create 20+ products covering all Chinese categories
    console.log('🛍️ Creating products...');
    const productData = [
      // 电子产品 (Electronics) - 6 products
      {
        name: 'iPhone 15 Pro',
        description: '最新款iPhone，配备A17 Pro芯片，拍照功能强大，性能卓越。',
        price: 7999,
        category: '电子产品',
        imageUrl: 'https://picsum.photos/400/400?random=101',
        externalLink: 'https://www.apple.com',
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
        name: '智能手表',
        description: '多功能智能手表，健康监测，运动追踪。',
        price: 1299,
        category: '电子产品',
        imageUrl: 'https://picsum.photos/400/400?random=111',
        externalLink: 'https://www.example.com',
      },
      {
        name: '平板电脑',
        description: '高性能平板电脑，适合办公和学习。',
        price: 2499,
        category: '电子产品',
        imageUrl: 'https://picsum.photos/400/400?random=116',
        externalLink: 'https://www.example.com',
      },
      {
        name: '游戏手柄',
        description: '专业游戏手柄，支持多平台，手感舒适。',
        price: 299,
        category: '电子产品',
        imageUrl: 'https://picsum.photos/400/400?random=117',
        externalLink: 'https://www.example.com',
      },
      {
        name: '便携式充电宝',
        description: '大容量移动电源，快速充电，安全可靠。',
        price: 129,
        category: '电子产品',
        imageUrl: 'https://picsum.photos/400/400?random=118',
        externalLink: 'https://www.example.com',
      },
      // 时尚 (Fashion) - 5 products
      {
        name: '时尚运动鞋',
        description: '舒适透气的运动鞋，适合日常运动和休闲穿着。',
        price: 299,
        category: '时尚',
        imageUrl: 'https://picsum.photos/400/400?random=102',
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
        name: '时尚背包',
        description: '多功能时尚背包，容量大，适合旅行和日常使用。',
        price: 199,
        category: '时尚',
        imageUrl: 'https://picsum.photos/400/400?random=112',
        externalLink: 'https://www.example.com',
      },
      {
        name: '潮流太阳镜',
        description: '时尚太阳镜，UV防护，多种款式选择。',
        price: 159,
        category: '时尚',
        imageUrl: 'https://picsum.photos/400/400?random=119',
        externalLink: 'https://www.example.com',
      },
      {
        name: '精致手表',
        description: '经典设计手表，优雅大方，适合商务场合。',
        price: 899,
        category: '时尚',
        imageUrl: 'https://picsum.photos/400/400?random=120',
        externalLink: 'https://www.example.com',
      },
      // 家居 (Home) - 5 products
      {
        name: '现代简约沙发',
        description: '北欧风格沙发，舒适耐用，适合现代家居装饰。',
        price: 2999,
        category: '家居',
        imageUrl: 'https://picsum.photos/400/400?random=103',
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
        name: '记忆棉枕头',
        description: '舒适记忆棉枕头，护颈设计，改善睡眠质量。',
        price: 159,
        category: '家居',
        imageUrl: 'https://picsum.photos/400/400?random=113',
        externalLink: 'https://www.example.com',
      },
      {
        name: '落地灯',
        description: '现代风格落地灯，LED光源，节能环保。',
        price: 299,
        category: '家居',
        imageUrl: 'https://picsum.photos/400/400?random=121',
        externalLink: 'https://www.example.com',
      },
      {
        name: '装饰画',
        description: '精美装饰画，提升家居品味，多种风格可选。',
        price: 89,
        category: '家居',
        imageUrl: 'https://picsum.photos/400/400?random=122',
        externalLink: 'https://www.example.com',
      },
      // 运动 (Sports) - 5 products
      {
        name: '瑜伽垫',
        description: '防滑瑜伽垫，厚度适中，适合各种瑜伽练习。',
        price: 89,
        category: '运动',
        imageUrl: 'https://picsum.photos/400/400?random=104',
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
        name: '哑铃套装',
        description: '可调节重量哑铃，适合家庭健身。',
        price: 299,
        category: '运动',
        imageUrl: 'https://picsum.photos/400/400?random=114',
        externalLink: 'https://www.example.com',
      },
      {
        name: '运动护膝',
        description: '专业运动护膝，保护关节，适合跑步和健身。',
        price: 79,
        category: '运动',
        imageUrl: 'https://picsum.photos/400/400?random=123',
        externalLink: 'https://www.example.com',
      },
      {
        name: '健身球',
        description: '多用途健身球，适合瑜伽和力量训练。',
        price: 129,
        category: '运动',
        imageUrl: 'https://picsum.photos/400/400?random=124',
        externalLink: 'https://www.example.com',
      },
    ];

    // Create makers for first 3 users
    console.log('🎨 Creating makers...');
    const makerData = [
      {
        name: '张明手作',
        bio: '来自云南的手工艺人，专注于传统竹编和木工技艺',
        story: '我从小跟随祖父学习传统手工艺，每一件作品都承载着对传统文化的热爱。希望通过这个平台，让更多人了解传统手工艺的魅力。',
        profilePictureUrl: 'https://i.pravatar.cc/200?u=maker1',
        coverPictureUrl: 'https://picsum.photos/800/400?random=maker1',
      },
      {
        name: '李华工作室',
        bio: '独立设计师，专注于现代家居用品设计',
        story: '作为一名独立设计师，我相信好的设计应该既美观又实用。我的作品融合了现代美学与传统工艺，希望能为你的生活增添一份美好。',
        profilePictureUrl: 'https://i.pravatar.cc/200?u=maker2',
        coverPictureUrl: 'https://picsum.photos/800/400?random=maker2',
      },
      {
        name: '王芳手作坊',
        bio: '陶瓷艺术家，专注于手工陶瓷制品',
        story: '陶瓷是我生命中的一部分。每一件作品都经过精心制作，从选料到烧制，都倾注了我的心血。希望这些作品能为你带来温暖和美好。',
        profilePictureUrl: 'https://i.pravatar.cc/200?u=maker3',
        coverPictureUrl: 'https://picsum.photos/800/400?random=maker3',
      },
    ];

    const makers = [];
    for (let i = 0; i < Math.min(makerData.length, users.length); i++) {
      const makerInfo = makerData[i];
      const user = users[i];
      const slug = makerInfo.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const maker = await prisma.makers.create({
        data: {
          id: `maker-${user.id}`,
          user_id: user.id,
          name: makerInfo.name,
          slug: `${slug}-${user.id}`,
          bio: makerInfo.bio,
          story: makerInfo.story,
          profile_picture_url: makerInfo.profilePictureUrl,
          cover_picture_url: makerInfo.coverPictureUrl,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      makers.push(maker);
      console.log(`✅ Created maker: ${makerInfo.name} for user ${user.name}`);
    }

    for (let i = 0; i < productData.length; i++) {
      const product = productData[i];
      // Assign products to makers if available, otherwise to users
      const owner = makers[i % makers.length] || users[i % users.length];
      await prisma.products.create({
        data: {
          user_id: 'userId' in owner ? owner.userId : owner.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category_string: product.category,
          image_url: product.imageUrl,
          external_link: product.externalLink,
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
      await prisma.posts.create({
        data: {
          id: `post-${user.id}-${i}`,
          user_id: user.id,
          content: postContents[i],
          images: JSON.stringify([`https://picsum.photos/800/600?random=${i + 200}`]),
        },
      });
      console.log(`✅ Created post by ${user.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');

    // Return summary
    return res.status(200).json({
      users: users.length,
      makers: makers.length,
      videos: 13, // 8 short + 5 long
      products: productData.length,
      posts: postContents.length,
    });
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    return res.status(500).json({
      error: 'Failed to run seed',
      message: error.message,
    });
  }
});

export default router;





