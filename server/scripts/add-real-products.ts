/**
 * Script to add real products to the database
 * Run with: npx tsx server/scripts/add-real-products.ts
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to add real products...');

  // Find or create a maker user for these products
  let makerUser = await prisma.users.findFirst({
    where: {
      role: 'MAKER',
    },
    include: {
      makers: true,
    },
  });

  // If no maker exists, create one
  if (!makerUser) {
    console.log('📦 No maker found, creating a default maker...');
    // Use environment variable for password, fallback to secure random password
    const makerPasswordPlain = process.env.MAKER_DEFAULT_PASSWORD || 
      `Temp${Math.random().toString(36).slice(-12)}!`;
    const hashedPassword = await bcrypt.hash(makerPasswordPlain, 10);
    
    makerUser = await prisma.users.create({
      data: {
        id: randomUUID(),
        email: 'electronics@bandachao.com',
        password: hashedPassword,
        name: 'متجر الإلكترونيات الذكية',
        role: 'MAKER',
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        makers: true,
      },
    });

    // Create maker profile
    await prisma.makers.create({
      data: {
        id: randomUUID(),
        user_id: makerUser.id,
        slug: 'electronics-store',
        name: 'متجر الإلكترونيات الذكية',
        bio: 'متجر متخصص في أحدث الأجهزة الإلكترونية والذكية',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    // Reload makerUser to include makers
    makerUser = await prisma.users.findUnique({
      where: { id: makerUser.id },
      include: {
        makers: true,
      },
    });

    console.log('✅ Created maker user:', makerUser.email);
  }

  // Define the three products
  const products = [
    {
      name: 'سماعة الرأس اللاسلكية "بيور ساوند"',
      description: 'سماعة احترافية عازلة للضجيج مع بطارية تدوم 30 ساعة وشحن سريع.',
      price: 299,
      currency: 'AED',
      category: 'إلكترونيات',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
      externalLink: 'https://banda-chao-frontend.onrender.com/ar/products',
    },
    {
      name: 'ساعة ذكية رياضية "باندا فيت"',
      description: 'تتبع نبضات القلب، خطوات المشي، ومقاومة للماء. رفيقك المثالي للرياضة.',
      price: 149,
      currency: 'AED',
      category: 'رياضة',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      externalLink: 'https://banda-chao-frontend.onrender.com/ar/products',
    },
    {
      name: 'حقيبة الظهر الذكية (ضد السرقة)',
      description: 'حقيبة عصرية بمدخل USB للشحن، تصميم مريح للظهر، وسحابات مخفية للأمان.',
      price: 199,
      currency: 'AED',
      category: 'سفر',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
      externalLink: 'https://banda-chao-frontend.onrender.com/ar/products',
    },
  ];

  // Add or update products
  for (const productData of products) {
    // Check if product already exists (by name)
    const existingProduct = await prisma.products.findFirst({
      where: {
        name: productData.name,
        user_id: makerUser.id,
      },
    });

    if (existingProduct) {
      // Update existing product
      await prisma.products.update({
        where: { id: existingProduct.id },
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image_url: productData.imageUrl,
          external_link: productData.externalLink,
          updated_at: new Date(),
        },
      });
      console.log(`✅ Updated product: ${productData.name}`);
    } else {
      // Create new product
      await prisma.products.create({
        data: {
          id: randomUUID(),
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image_url: productData.imageUrl,
          external_link: productData.externalLink,
          user_id: makerUser.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log(`✅ Created product: ${productData.name}`);
    }
  }

  console.log('🎉 Real products added successfully!');
  console.log(`📊 Total products in database: ${await prisma.products.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error adding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

