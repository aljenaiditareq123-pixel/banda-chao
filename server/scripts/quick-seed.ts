/**
 * Quick Seed Script - Adds 5 makers, 5 products, and 5 videos
 * Run this in Render Shell: npx ts-node scripts/quick-seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function quickSeed() {
  try {
    console.log('🌱 Starting quick database seeding...');
    console.log('');

    // 0. Create FOUNDER user (if not exists)
    console.log('👑 Creating/Updating FOUNDER user...');
    // Normalize email to lowercase for consistency
    const founderEmail = 'aljenaiditareq123@gmail.com'.toLowerCase().trim();
    const founderPassword = 'Founder123!';
    const founderName = 'Tareq';
    
    try {
      const existingFounder = await prisma.$queryRaw<Array<{ 
        id: string; 
        email: string; 
        name: string | null; 
        role: string;
      }>>`
        SELECT id, email, name, role FROM users WHERE email = ${founderEmail} LIMIT 1;
      `;
      
      if (existingFounder.length === 0) {
        // Create new FOUNDER user
        console.log(`  📝 Creating new FOUNDER user...`);
        const founderId = randomUUID();
        const hashedFounderPassword = await bcrypt.hash(founderPassword, 10);
        
        console.log(`  🔐 Hashing password...`);
        await prisma.$executeRaw`
          INSERT INTO users (id, email, password, name, role, created_at, updated_at)
          VALUES (${founderId}, ${founderEmail}, ${hashedFounderPassword}, ${founderName}, 'FOUNDER'::"UserRole", NOW(), NOW())
          ON CONFLICT (email) DO NOTHING;
        `;
        
        // Verify creation
        const verifyUser = await prisma.$queryRaw<Array<{ 
          id: string; 
          email: string; 
          name: string | null; 
          role: string;
        }>>`
          SELECT id, email, name, role FROM users WHERE email = ${founderEmail} LIMIT 1;
        `;
        
        if (verifyUser.length > 0) {
          console.log(`  ✅ FOUNDER user created successfully!`);
          console.log(`     ID: ${verifyUser[0].id}`);
          console.log(`     Email: ${verifyUser[0].email}`);
          console.log(`     Name: ${verifyUser[0].name || 'N/A'}`);
          console.log(`     Role: ${verifyUser[0].role}`);
          console.log(`     Password: ${founderPassword}`);
        } else {
          console.log(`  ⚠️  User creation may have failed - user not found after insert`);
        }
      } else {
        // Update existing user to FOUNDER role and password
        const existingUser = existingFounder[0];
        console.log(`  📝 Found existing user, updating to FOUNDER...`);
        console.log(`     Current Role: ${existingUser.role}`);
        
        const hashedFounderPassword = await bcrypt.hash(founderPassword, 10);
        
        await prisma.$executeRaw`
          UPDATE users
          SET 
            role = 'FOUNDER'::"UserRole",
            password = ${hashedFounderPassword},
            name = ${founderName},
            updated_at = NOW()
          WHERE email = ${founderEmail};
        `;
        
        // Verify update
        const verifyUser = await prisma.$queryRaw<Array<{ 
          id: string; 
          email: string; 
          name: string | null; 
          role: string;
        }>>`
          SELECT id, email, name, role FROM users WHERE email = ${founderEmail} LIMIT 1;
        `;
        
        if (verifyUser.length > 0) {
          console.log(`  ✅ FOUNDER user updated successfully!`);
          console.log(`     ID: ${verifyUser[0].id}`);
          console.log(`     Email: ${verifyUser[0].email}`);
          console.log(`     Name: ${verifyUser[0].name || 'N/A'}`);
          console.log(`     Role: ${verifyUser[0].role}`);
          console.log(`     Password: ${founderPassword} (updated)`);
        } else {
          console.log(`  ⚠️  User update may have failed - user not found after update`);
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Error creating/updating FOUNDER user:`, {
        message: error?.message || 'Unknown error',
        code: error?.code || 'No error code',
        meta: error?.meta || 'No metadata',
      });
      throw error;
    }
    console.log('');

    // 1. Create 5 Makers (Users + Makers profiles)
    console.log('📝 Creating 5 makers...');
    const makers = [];

    for (let i = 1; i <= 5; i++) {
      const userId = randomUUID();
      const email = `maker${i}@bandachao.com`;
      const password = await bcrypt.hash('maker123', 10);
      const name = `حرفي ${i}`;
      const slug = `maker-${i}`;

      // Create user
      await prisma.$executeRaw`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (${userId}, ${email}, ${password}, ${name}, ${'USER'}::"UserRole", NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
      `;

      // Create maker profile
      await prisma.$executeRaw`
        INSERT INTO makers (id, user_id, slug, name, bio, created_at, updated_at)
        VALUES (${randomUUID()}, ${userId}, ${slug}, ${name}, ${`سيرة مختصرة للحرفي ${i}`}, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING;
      `;

      makers.push({ userId, email, name, slug });
      console.log(`  ✅ Created maker ${i}: ${name} (${email})`);
    }

    console.log('');
    console.log('📦 Creating 5 products...');

    // 2. Create 5 Products
    const products = [];
    const productNames = [
      'سجادة يدوية من الحرير',
      'مزهرية خزفية تقليدية',
      'ساعة حائط خشبية',
      'مصباح نحاسي منقوش',
      'طبق تقديم نحاسي',
    ];
    const productDescriptions = [
      'سجادة يدوية مصنوعة من الحرير الطبيعي بتصميم عربي أصيل',
      'مزهرية خزفية تقليدية من الصين بتصميم كلاسيكي',
      'ساعة حائط خشبية يدوية الصنع بتصميم عصري',
      'مصباح نحاسي منقوش بتصميم عربي تقليدي',
      'طبق تقديم نحاسي كبير بتصميم هندسي جميل',
    ];
    const productPrices = [150.00, 85.50, 120.00, 65.00, 95.00];

    for (let i = 0; i < 5; i++) {
      const productId = randomUUID();
      const maker = makers[i % makers.length];
      const price = productPrices[i];

      await prisma.$executeRaw`
        INSERT INTO products (
          id, user_id, name, description, price, category, 
          image_url, external_link, created_at, updated_at
        )
        VALUES (
          ${productId},
          ${maker.userId},
          ${productNames[i]},
          ${productDescriptions[i]},
          ${price},
          ${'HANDMADE'},
          ${`https://picsum.photos/400/400?random=${i + 100}`},
          ${`https://banda-chao-frontend.onrender.com/products/${productId}`},
          NOW(),
          NOW()
        );
      `;

      products.push({ id: productId, name: productNames[i] });
      console.log(`  ✅ Created product ${i + 1}: ${productNames[i]}`);
    }

    console.log('');
    console.log('🎥 Creating 5 videos...');

    // 3. Create 5 Videos
    const videoTitles = [
      'ورشة عمل: صناعة السجادة اليدوية',
      'جولة في ورشة الخزف',
      'كيف تصنع ساعة حائط خشبية',
      'عملية النقش على النحاس',
      'تصميم طبق تقديم نحاسي',
    ];
    const videoDescriptions = [
      'فيديو تعليمي عن كيفية صناعة السجادة اليدوية من الحرير',
      'جولة داخل ورشة الخزف التقليدية',
      'خطوات صناعة ساعة حائط خشبية يدوياً',
      'عملية النقش على النحاس بتقنيات تقليدية',
      'تصميم وصناعة طبق تقديم نحاسي',
    ];

    for (let i = 0; i < 5; i++) {
      const videoId = randomUUID();
      const maker = makers[i % makers.length];
      const type = i < 3 ? 'SHORT' : 'LONG'; // First 3 are SHORT, last 2 are LONG

      await prisma.$executeRaw`
        INSERT INTO videos (
          id, user_id, title, description, video_url, thumbnail_url,
          duration, type, views, likes, created_at, updated_at
        )
        VALUES (
          ${videoId},
          ${maker.userId},
          ${videoTitles[i]},
          ${videoDescriptions[i]},
          ${`https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`},
          ${`https://picsum.photos/640/360?random=${i + 200}`},
          ${i < 3 ? 60 : 300}, -- SHORT videos are 60s, LONG are 300s
          ${type},
          0,
          0,
          NOW(),
          NOW()
        );
      `;

      console.log(`  ✅ Created video ${i + 1}: ${videoTitles[i]} (${type})`);
    }

    console.log('');
    console.log('✅ Quick seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${makers.length} makers created`);
    console.log(`   - ${products.length} products created`);
    console.log(`   - 5 videos created`);
    console.log('');

  } catch (error: any) {
    console.error('❌ Seeding error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

