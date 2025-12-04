/**
 * Curator Seed Script - Realistic Arabic Artisan Data
 * Creates 5 inspiring makers with stories, products, and videos
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
    name: 'العم سالم',
    email: 'saleem.pottery@bandachao.com',
    slug: 'saleem-pottery',
    bio: 'صانع فخار تقليدي من جدة، يحافظ على الحرفة الأصيلة منذ 40 عاماً',
    story: 'بدأت رحلتي مع الفخار في سن السادسة عشرة، عندما تعلمت من والدي الذي ورث هذه الحرفة من جده. اليوم، بعد 40 عاماً من العمل، ما زلت أستخدم نفس التقنيات التقليدية التي تعلمتها، وأضيف لمسة عصرية على التصاميم الكلاسيكية. كل قطعة تحمل قصة وتاريخ.',
    profilePicture: 'https://picsum.photos/seed/saleem-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/saleem-cover/1200/400',
    products: [
      {
        name: 'مزهرية فخارية تقليدية',
        description: 'مزهرية فخارية يدوية الصنع بتصميم عربي أصيل، مناسبة للزينة أو كهدية قيمة. مصنوعة من الطين الطبيعي ومزججة يدوياً.',
        price: 125.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/saleem-product1/600/600',
      },
      {
        name: 'طقم أواني فخارية للطبخ',
        description: 'طقم أواني فخارية تقليدية للطبخ، آمنة للاستخدام على النار، تحافظ على نكهة الطعام الأصيلة. يتضمن 3 أواني بأحجام مختلفة.',
        price: 180.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/saleem-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'كيف تصنع مزهرية فخارية يدوياً',
        description: 'ورشة عمل كاملة تشرح خطوات صناعة المزهرية الفخارية من البداية حتى النهاية، مع نصائح من العم سالم',
        type: 'LONG',
        duration: 420,
      },
      {
        title: 'جولة في ورشة الفخار التقليدية',
        description: 'جولة قصيرة داخل ورشة العم سالم، حيث يشرح الأدوات والتقنيات المستخدمة في صناعة الفخار',
        type: 'SHORT',
        duration: 90,
      },
    ],
  },
  {
    name: 'ليلى النسيج',
    email: 'layla.weaving@bandachao.com',
    slug: 'layla-weaving',
    bio: 'فنانة نسيج يدوي من دمشق، متخصصة في السجاد والمنسوجات التقليدية',
    story: 'نشأت في عائلة دمشقية عريقة في صناعة النسيج. تعلمت الحرفة من جدتي التي كانت تنسج السجاد باليد. اليوم، أدمج بين التصاميم التقليدية السورية واللمسات العصرية، وأنسج كل قطعة بحب وصبر. كل سجادة تحكي قصة من قصص بلدي.',
    profilePicture: 'https://picsum.photos/seed/layla-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/layla-cover/1200/400',
    products: [
      {
        name: 'سجادة حريرية يدوية',
        description: 'سجادة حريرية فاخرة منسوجة يدوياً بتصميم دمشقي تقليدي. كل سجادة فريدة من نوعها وتستغرق شهرين من العمل المتواصل.',
        price: 850.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/layla-product1/600/600',
      },
      {
        name: 'وشاح حريري منسوج يدوياً',
        description: 'وشاح حريري أنيق منسوج يدوياً بتصاميم عربية كلاسيكية. مثالي للهدايا أو الاستخدام الشخصي.',
        price: 95.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/layla-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'فن النسيج اليدوي: من الخيط إلى السجادة',
        description: 'فيلم وثائقي قصير عن عملية النسيج اليدوي الكاملة، من اختيار الخيوط حتى الانتهاء من السجادة',
        type: 'LONG',
        duration: 600,
      },
      {
        title: 'تصميم جديد: سجادة دمشقية عصرية',
        description: 'ليلى تشرح تصميمها الجديد الذي يدمج بين التراث والحداثة',
        type: 'SHORT',
        duration: 120,
      },
    ],
  },
  {
    name: 'أحمد النحاس',
    email: 'ahmed.copper@bandachao.com',
    slug: 'ahmed-copper',
    bio: 'حرفي نحاس من القاهرة، متخصص في النقش والتصميم على النحاس',
    story: 'ورثت حرفة النقش على النحاس من والدي الذي كان يعمل في خان الخليلي. أتقنت هذه الحرفة على مدى 25 عاماً، وأصمم اليوم قطعاً فنية تجمع بين التصاميم الإسلامية التقليدية واللمسات المعاصرة. كل قطعة نحاسية تحمل توقيعي الفني.',
    profilePicture: 'https://picsum.photos/seed/ahmed-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/ahmed-cover/1200/400',
    products: [
      {
        name: 'مصباح نحاسي منقوش',
        description: 'مصباح نحاسي فاخر منقوش يدوياً بتصاميم عربية إسلامية. يضفي جواً دافئاً وتراثياً على أي مساحة.',
        price: 220.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/ahmed-product1/600/600',
      },
      {
        name: 'طبق تقديم نحاسي كبير',
        description: 'طبق تقديم نحاسي كبير منقوش بتصاميم هندسية جميلة. مثالي لتقديم الفواكه أو الحلويات في المناسبات.',
        price: 150.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/ahmed-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'فن النقش على النحاس: من الفكرة إلى القطعة',
        description: 'ورشة عمل شاملة تشرح تقنيات النقش على النحاس، من الرسم الأولي حتى الانتهاء من القطعة',
        type: 'LONG',
        duration: 480,
      },
      {
        title: 'تصميم جديد: مصباح نحاسي عصري',
        description: 'أحمد يعرض تصميمه الجديد لمصباح نحاسي يجمع بين التراث والحداثة',
        type: 'SHORT',
        duration: 75,
      },
    ],
  },
  {
    name: 'فاطمة الخزف',
    email: 'fatima.ceramics@bandachao.com',
    slug: 'fatima-ceramics',
    bio: 'فنانة خزف من فاس، متخصصة في الخزف المغربي التقليدي',
    story: 'تعلمت فن الخزف من والدتي التي كانت تصنع الأواني الفخارية للجيران. بعد 20 عاماً من الممارسة، أصبحت متخصصة في الخزف المغربي التقليدي بلمسات عصرية. أستخدم نفس التقنيات القديمة ولكن بتصاميم جديدة تناسب الحياة المعاصرة.',
    profilePicture: 'https://picsum.photos/seed/fatima-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/fatima-cover/1200/400',
    products: [
      {
        name: 'طقم أطباق خزفية مغربية',
        description: 'طقم أطباق خزفية يدوية الصنع بتصاميم مغربية تقليدية. يتضمن 6 أطباق بأحجام مختلفة، كل قطعة فريدة.',
        price: 140.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/fatima-product1/600/600',
      },
      {
        name: 'إبريق شاي خزفي تقليدي',
        description: 'إبريق شاي خزفي تقليدي من فاس، مصنوع يدوياً بتصميم مغربي أصيل. مثالي لتحضير الشاي المغربي الأصيل.',
        price: 85.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/fatima-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'صناعة الخزف المغربي: تقليد عريق',
        description: 'فيلم وثائقي عن صناعة الخزف المغربي التقليدي، من تحضير الطين حتى الحرق والتزجيج',
        type: 'LONG',
        duration: 540,
      },
      {
        title: 'كيف تصنع إبريق شاي خزفي',
        description: 'فاطمة تشرح خطوات صناعة إبريق الشاي الخزفي التقليدي',
        type: 'SHORT',
        duration: 105,
      },
    ],
  },
  {
    name: 'خالد الخشب',
    email: 'khalid.woodwork@bandachao.com',
    slug: 'khalid-woodwork',
    bio: 'نجار تقليدي من بغداد، متخصص في الأثاث الخشبي المنحوت',
    story: 'بدأت العمل في النجارة في سن الثانية عشرة مع والدي في دكانه الصغير في شارع الرشيد. بعد 30 عاماً، أصبحت متخصصاً في صناعة الأثاث الخشبي المنحوت بتصاميم عراقية تقليدية. كل قطعة أثاث تحمل روح بغداد القديمة.',
    profilePicture: 'https://picsum.photos/seed/khalid-profile/400/400',
    coverPicture: 'https://picsum.photos/seed/khalid-cover/1200/400',
    products: [
      {
        name: 'طاولة قهوة خشبية منحوتة',
        description: 'طاولة قهوة خشبية يدوية الصنع منحوتة بتصاميم عراقية تقليدية. مصنوعة من خشب الجوز الطبيعي.',
        price: 350.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/khalid-product1/600/600',
      },
      {
        name: 'ساعة حائط خشبية منحوتة',
        description: 'ساعة حائط خشبية فاخرة منحوتة يدوياً بتصميم عراقي كلاسيكي. كل ساعة فريدة ومصنوعة يدوياً.',
        price: 280.00,
        category: 'HANDMADE',
        imageUrl: 'https://picsum.photos/seed/khalid-product2/600/600',
      },
    ],
    videos: [
      {
        title: 'فن النجارة التقليدية: من الخشب إلى الأثاث',
        description: 'ورشة عمل شاملة عن صناعة الأثاث الخشبي المنحوت، من اختيار الخشب حتى الانتهاء من القطعة',
        type: 'LONG',
        duration: 660,
      },
      {
        title: 'جولة في ورشة النجارة التقليدية',
        description: 'جولة قصيرة في ورشة خالد، حيث يعرض الأدوات والتقنيات المستخدمة',
        type: 'SHORT',
        duration: 90,
      },
    ],
  },
];

async function seedCurator() {
  try {
    console.log('🎨 ============================================');
    console.log('🎨 Curator Seed Script - Starting...');
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
          console.log(`      ✅ Created product: ${product.name} (${product.price} ريال)`);
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

