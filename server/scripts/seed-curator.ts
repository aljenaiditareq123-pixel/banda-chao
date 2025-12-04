/**
 * Curator Seed Script - Global Chinese Artisan Data
 * Creates 5 inspiring Chinese makers with stories, products, and videos
 * Run: npx tsx scripts/seed-curator.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

interface MakerData {
  name: string;
  email: string;
  slug: string;
  bio: string;
  story: string;
  profilePicture: string;
  coverPicture: string;
  products: Array<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
  }>;
  videos: Array<{
    title: string;
    description: string;
    type: 'SHORT' | 'LONG';
    duration: number;
  }>;
}

const makersData: MakerData[] = [
  {
    name: 'Master Shifu',
    email: 'shifu.bamboo@bandachao.com',
    slug: 'shifu-bamboo',
    bio: 'Master craftsman from Hangzhou, specializing in bamboo and wood artistry for over 30 years',
    story: 'I began my journey with bamboo at the age of 15, learning from my grandfather who was a master craftsman in the ancient art of bamboo weaving. After 30 years of dedication, I combine traditional Chinese techniques with modern design aesthetics. Each piece I create carries the wisdom of generations and the spirit of nature. My workshop in Hangzhou is where tradition meets innovation.',
    profilePicture: 'https://picsum.photos/seed/shifu-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/shifu-cover/1200/400',
    products: [
      {
        name: 'Handwoven Bamboo Tea Set',
        description: 'Exquisite handwoven bamboo tea set with traditional Chinese design. Each piece is carefully crafted using ancient techniques passed down through generations. Perfect for tea ceremonies or as a beautiful home decoration.',
        price: 145.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/shifu-product1/600/600',
      },
      {
        name: 'Bamboo Wind Chime - Zen Collection',
        description: 'Elegant bamboo wind chime designed for tranquility and harmony. Handcrafted with precision, each chime produces a unique soothing sound. Perfect for gardens, patios, or meditation spaces.',
        price: 65.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/shifu-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'The Art of Bamboo Weaving: Traditional Techniques',
        description: 'A comprehensive workshop showing the complete process of bamboo weaving, from selecting materials to finishing the final piece. Learn ancient Chinese craftsmanship from Master Shifu.',
        type: 'LONG',
        duration: 480,
      },
      {
        title: 'Quick Tour: Master Shifu\'s Bamboo Workshop',
        description: 'A short tour inside Master Shifu\'s workshop in Hangzhou, showcasing tools and traditional techniques used in bamboo artistry',
        type: 'SHORT',
        duration: 90,
      },
    ],
  },
  {
    name: 'Mulan',
    email: 'mulan.silk@bandachao.com',
    slug: 'mulan-silk',
    bio: 'Silk artist from Suzhou, creating luxurious handwoven silk products with modern elegance',
    story: 'Growing up in Suzhou, the silk capital of China, I learned the art of silk weaving from my mother, who inherited this craft from her ancestors. Today, after 20 years of practice, I blend traditional Suzhou silk techniques with contemporary designs. Every silk piece I create tells a story of heritage and innovation. My atelier is where ancient Chinese elegance meets modern luxury.',
    profilePicture: 'https://picsum.photos/seed/mulan-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/mulan-cover/1200/400',
    products: [
      {
        name: 'Luxury Handwoven Silk Scarf',
        description: 'Premium handwoven silk scarf featuring traditional Chinese patterns with a modern twist. Made from 100% pure silk, each scarf is unique and takes weeks to complete. A perfect blend of tradition and contemporary style.',
        price: 185.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/mulan-product1/600/600',
      },
      {
        name: 'Silk Robe - Traditional Chinese Design',
        description: 'Elegant silk robe handcrafted using traditional Suzhou techniques. Features intricate embroidery and luxurious fabric. Perfect for special occasions or as a statement piece in your wardrobe.',
        price: 320.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/mulan-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'Silk Weaving Masterclass: From Thread to Luxury',
        description: 'A documentary-style video showing the complete silk weaving process, from selecting silk threads to finishing a luxurious scarf. Experience the artistry of Suzhou silk.',
        type: 'LONG',
        duration: 600,
      },
      {
        title: 'New Design: Modern Silk Collection',
        description: 'Mulan introduces her latest collection that blends traditional Chinese silk patterns with contemporary fashion',
        type: 'SHORT',
        duration: 120,
      },
    ],
  },
  {
    name: 'Neo',
    email: 'neo.tech@bandachao.com',
    slug: 'neo-tech',
    bio: 'Tech artisan from Shenzhen, creating innovative smart gadgets and modern Chinese tech products',
    story: 'Based in Shenzhen, the Silicon Valley of China, I combine cutting-edge technology with traditional Chinese craftsmanship. With 15 years of experience in electronics and design, I create smart gadgets that blend innovation with cultural heritage. Each product is designed to enhance modern life while honoring Chinese traditions. My workshop is where the future meets tradition.',
    profilePicture: 'https://picsum.photos/seed/neo-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/neo-cover/1200/400',
    products: [
      {
        name: 'Smart Tea Maker with App Control',
        description: 'Innovative smart tea maker that combines traditional Chinese tea culture with modern technology. Control brewing temperature and time via smartphone app. Features elegant design inspired by ancient Chinese teapots.',
        price: 199.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/neo-product1/600/600',
      },
      {
        name: 'Wireless Charging Pad - Bamboo Design',
        description: 'Elegant wireless charging pad with bamboo finish, featuring fast charging technology. Combines modern functionality with natural Chinese aesthetics. Perfect for home or office.',
        price: 45.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/neo-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'Tech Meets Tradition: Building Smart Chinese Products',
        description: 'A comprehensive guide showing how traditional Chinese design principles are integrated into modern smart gadgets. See the complete development process from concept to finished product.',
        type: 'LONG',
        duration: 540,
      },
      {
        title: 'Unboxing: Smart Tea Maker Prototype',
        description: 'Neo demonstrates his latest smart tea maker prototype, showcasing innovative features and design',
        type: 'SHORT',
        duration: 105,
      },
    ],
  },
  {
    name: 'Luna',
    email: 'luna.ceramics@bandachao.com',
    slug: 'luna-ceramics',
    bio: 'Modern ceramic artist from Jingdezhen, creating contemporary Chinese ceramics with traditional roots',
    story: 'I learned pottery in Jingdezhen, the porcelain capital of China, where ceramics have been made for over 1,000 years. After 18 years of mastering traditional techniques, I now create modern ceramic pieces that honor Chinese heritage while embracing contemporary aesthetics. Each piece is fired in traditional kilns but designed for modern living. My studio bridges centuries of Chinese ceramic art.',
    profilePicture: 'https://picsum.photos/seed/luna-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/luna-cover/1200/400',
    products: [
      {
        name: 'Modern Chinese Ceramic Tea Set',
        description: 'Contemporary ceramic tea set featuring minimalist design with traditional Chinese influences. Handcrafted in Jingdezhen using time-honored techniques. Each set is unique and perfect for modern tea ceremonies.',
        price: 165.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/luna-product1/600/600',
      },
      {
        name: 'Porcelain Vase - Contemporary Collection',
        description: 'Elegant porcelain vase with modern geometric patterns inspired by ancient Chinese motifs. Handcrafted using traditional Jingdezhen porcelain techniques. A beautiful statement piece for any home.',
        price: 125.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/luna-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'Jingdezhen Porcelain: Ancient Art, Modern Design',
        description: 'A documentary exploring the art of Jingdezhen porcelain, from clay preparation to kiln firing. Learn how traditional Chinese ceramics are reimagined for contemporary life.',
        type: 'LONG',
        duration: 520,
      },
      {
        title: 'How to Make a Modern Chinese Ceramic Vase',
        description: 'Luna demonstrates the process of creating a contemporary ceramic vase using traditional Jingdezhen techniques',
        type: 'SHORT',
        duration: 110,
      },
    ],
  },
  {
    name: 'Kai',
    email: 'kai.metalwork@bandachao.com',
    slug: 'kai-metalwork',
    bio: 'Master metalworker from Beijing, specializing in handmade swords and traditional Chinese metalwork',
    story: 'I began my apprenticeship in traditional Chinese metalwork at age 16, learning from masters in Beijing\'s ancient craft district. After 25 years, I specialize in creating handcrafted swords and metal art that honor Chinese martial traditions. Each piece is forged using traditional methods passed down through generations, but designed for modern collectors and practitioners. My forge is where ancient Chinese warrior spirit meets contemporary artistry.',
    profilePicture: 'https://picsum.photos/seed/kai-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/kai-cover/1200/400',
    products: [
      {
        name: 'Handcrafted Chinese Sword - Collector\'s Edition',
        description: 'Exquisite handcrafted Chinese sword made using traditional forging techniques. Features authentic Chinese design with modern precision. Each sword is unique and comes with a custom display stand. Perfect for collectors and martial arts practitioners.',
        price: 450.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/kai-product1/600/600',
      },
      {
        name: 'Decorative Metal Wall Art - Dragon Design',
        description: 'Stunning handcrafted metal wall art featuring traditional Chinese dragon design. Made from high-quality metal with intricate details. A powerful statement piece that brings Chinese cultural heritage to any space.',
        price: 280.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/kai-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'The Art of Chinese Sword Making: Traditional Forging',
        description: 'A comprehensive workshop on traditional Chinese sword making, from selecting materials to final polishing. Learn ancient Chinese metalworking techniques from Master Kai.',
        type: 'LONG',
        duration: 720,
      },
      {
        title: 'Tour: Kai\'s Traditional Forge',
        description: 'A short tour of Kai\'s forge in Beijing, showcasing traditional tools and metalworking techniques',
        type: 'SHORT',
        duration: 95,
      },
    ],
  },
];

async function seedCurator() {
  try {
    console.log('🎨 ============================================');
    console.log('🎨 Curator Seed Script - Global Chinese Theme');
    console.log('🎨 ============================================');
    console.log('');

    let totalMakers = 0;
    let totalProducts = 0;
    let totalVideos = 0;

    for (const makerData of makersData) {
      console.log(`👤 Processing: ${makerData.name}`);
      console.log(`   Email: ${makerData.email}`);
      console.log(`   Slug: ${makerData.slug}`);

      // Check if maker already exists
      const existingMaker = await prisma.$queryRaw<Array<{ user_id: string }>>`
        SELECT user_id FROM makers WHERE slug = ${makerData.slug} LIMIT 1;
      `;

      let userId: string;

      if (existingMaker.length > 0) {
        // Maker exists, get user_id
        userId = existingMaker[0].user_id;
        console.log(`   ✅ Maker already exists, using existing user_id: ${userId}`);
      } else {
        // Create new user
        userId = randomUUID();
        const hashedPassword = await bcrypt.hash('Maker123!', 10);
        const normalizedEmail = makerData.email.toLowerCase().trim();

        await prisma.$executeRaw`
          INSERT INTO users (id, email, password, name, role, created_at, updated_at)
          VALUES (${userId}, ${normalizedEmail}, ${hashedPassword}, ${makerData.name}, 'USER'::"UserRole", NOW(), NOW())
          ON CONFLICT (email) DO NOTHING;
        `;

        // Get the actual user_id (in case of conflict)
        const userCheck = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1;
        `;
        if (userCheck.length > 0) {
          userId = userCheck[0].id;
        }

        // Create maker profile
        const makerId = randomUUID();
        await prisma.$executeRaw`
          INSERT INTO makers (
            id, user_id, slug, name, bio, story,
            profile_picture_url, cover_picture_url, created_at, updated_at
          )
          VALUES (
            ${makerId},
            ${userId},
            ${makerData.slug},
            ${makerData.name},
            ${makerData.bio},
            ${makerData.story},
            ${makerData.profilePicture},
            ${makerData.coverPicture},
            NOW(),
            NOW()
          )
          ON CONFLICT (user_id) DO NOTHING;
        `;

        console.log(`   ✅ Created new maker: ${makerData.name}`);
        totalMakers++;
      }

      // Create products (2 per maker)
      console.log(`   📦 Creating products...`);
      for (const product of makerData.products) {
        // Check if product already exists (by name and user_id)
        const existingProduct = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM products 
          WHERE user_id = ${userId} AND name = ${product.name} 
          LIMIT 1;
        `;

        if (existingProduct.length === 0) {
          const productId = randomUUID();
          await prisma.$executeRaw`
            INSERT INTO products (
              id, user_id, name, description, price, category,
              image_url, external_link, created_at, updated_at
            )
            VALUES (
              ${productId},
              ${userId},
              ${product.name},
              ${product.description},
              ${product.price},
              ${product.category},
              ${product.imageUrl},
              ${`https://banda-chao-frontend.onrender.com/products/${productId}`},
              NOW(),
              NOW()
            );
          `;
          console.log(`      ✅ Created product: ${product.name} ($${product.price.toFixed(2)})`);
          totalProducts++;
        } else {
          console.log(`      ⏭️  Product already exists: ${product.name}`);
        }
      }

      // Create videos (2 per maker)
      console.log(`   🎥 Creating videos...`);
      for (const video of makerData.videos) {
        // Check if video already exists (by title and user_id)
        const existingVideo = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM videos 
          WHERE user_id = ${userId} AND title = ${video.title} 
          LIMIT 1;
        `;

        if (existingVideo.length === 0) {
          const videoId = randomUUID();
          const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          const thumbnailUrl = `https://picsum.photos/seed/${makerData.slug}-${video.title}/640/360`;

          await prisma.$executeRaw`
            INSERT INTO videos (
              id, user_id, title, description, video_url, thumbnail_url,
              duration, type, views, likes, created_at, updated_at
            )
            VALUES (
              ${videoId},
              ${userId},
              ${video.title},
              ${video.description},
              ${videoUrl},
              ${thumbnailUrl},
              ${video.duration},
              ${video.type},
              0,
              0,
              NOW(),
              NOW()
            );
          `;
          console.log(`      ✅ Created video: ${video.title} (${video.type}, ${video.duration}s)`);
          totalVideos++;
        } else {
          console.log(`      ⏭️  Video already exists: ${video.title}`);
        }
      }

      console.log('');
    }

    console.log('🎨 ============================================');
    console.log('✅ Curator Seeding Completed Successfully!');
    console.log('🎨 ============================================');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👤 Makers: ${totalMakers} new, ${makersData.length} total`);
    console.log(`   📦 Products: ${totalProducts} new`);
    console.log(`   🎥 Videos: ${totalVideos} new`);
    console.log('');
    console.log('🔐 Default Login Credentials (for all makers):');
    console.log(`   Email: [maker-email]`);
    console.log(`   Password: Maker123!`);
    console.log('');
    console.log('📝 Maker Emails:');
    makersData.forEach((maker) => {
      console.log(`   - ${maker.name}: ${maker.email}`);
    });
    console.log('');

  } catch (error: any) {
    console.error('❌ Curator seeding error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCurator()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
