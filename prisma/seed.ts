import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Social Commerce Platform...');

  // ============================================
  // 1. Create Admin User
  // ============================================
  const adminEmail = 'admin@bandachao.com';
  let adminUser = await prisma.users.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await prisma.users.create({
      data: {
        email: adminEmail,
        name: 'Admin Banda Chao',
        password: hashedPassword,
        role: 'ADMIN',
        level: 10,
        points: 0,
        bio: 'System Administrator',
        profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      },
    });
    console.log('✅ Created Admin user:', adminUser.email);
  } else {
    console.log('✅ Admin user already exists');
  }

  // ============================================
  // 2. Create Founder User
  // ============================================
  const founderEmail = 'founder@bandachao.com';
  let founderUser = await prisma.users.findUnique({
    where: { email: founderEmail },
  });

  if (!founderUser) {
    const hashedPassword = await bcrypt.hash('founder123', 10);
    founderUser = await prisma.users.create({
      data: {
        email: founderEmail,
        name: 'Founder',
        password: hashedPassword,
        role: 'FOUNDER',
        level: 10,
        points: 0,
        bio: 'Platform Founder',
        profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Founder',
      },
    });
    console.log('✅ Created Founder user:', founderUser.email);
  } else {
    console.log('✅ Founder user already exists');
  }

  // ============================================
  // 3. Create Categories
  // ============================================
  const categories = [
    {
      name: 'Fashion',
      name_ar: 'أزياء',
      name_zh: '时尚',
      slug: 'fashion',
      description: 'Clothing and fashion accessories',
    },
    {
      name: 'Electronics',
      name_ar: 'إلكترونيات',
      name_zh: '电子产品',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
    },
    {
      name: 'Beauty',
      name_ar: 'تجميل',
      name_zh: '美妆',
      slug: 'beauty',
      description: 'Beauty and cosmetics products',
    },
    {
      name: 'Home & Living',
      name_ar: 'منزل',
      name_zh: '家居',
      slug: 'home-living',
      description: 'Home decoration and living essentials',
    },
    {
      name: 'Sports',
      name_ar: 'رياضة',
      name_zh: '运动',
      slug: 'sports',
      description: 'Sports equipment and accessories',
    },
  ];

  for (const categoryData of categories) {
    const existingCategory = await prisma.categories.findUnique({
      where: { slug: categoryData.slug },
    });

    if (!existingCategory) {
      await prisma.categories.create({
        data: categoryData,
      });
      console.log(`✅ Created category: ${categoryData.name}`);
    } else {
      console.log(`✅ Category already exists: ${categoryData.name}`);
    }
  }

  // ============================================
  // 4. Create Pricing Rules (Treasurer Rules)
  // ============================================
  const pricingRules = [
    {
      rule_name: 'NEW_CUSTOMER_DISCOUNT',
      rule_type: 'DISCOUNT',
      conditions: JSON.stringify({
        userType: 'NEW',
        minOrderValue: 50,
      }),
      actions: JSON.stringify({
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscount: 20,
      }),
      priority: 100,
      is_active: true,
      valid_from: new Date(),
      valid_until: null, // No expiration
    },
    {
      rule_name: 'SEASONAL_SALE_FASHION',
      rule_type: 'SEASONAL',
      conditions: JSON.stringify({
        category: 'fashion',
        season: 'WINTER',
      }),
      actions: JSON.stringify({
        discountType: 'PERCENTAGE',
        discountValue: 15,
        maxDiscount: 50,
      }),
      priority: 80,
      is_active: true,
      valid_from: new Date(),
      valid_until: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
    {
      rule_name: 'BULK_PURCHASE_DISCOUNT',
      rule_type: 'DYNAMIC',
      conditions: JSON.stringify({
        minQuantity: 5,
        minOrderValue: 200,
      }),
      actions: JSON.stringify({
        discountType: 'PERCENTAGE',
        discountValue: 5,
      }),
      priority: 50,
      is_active: true,
      valid_from: new Date(),
      valid_until: null,
    },
    {
      rule_name: 'FLASH_SALE_ELECTRONICS',
      rule_type: 'SURGE',
      conditions: JSON.stringify({
        category: 'electronics',
        timeWindow: 'FLASH',
      }),
      actions: JSON.stringify({
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscount: 100,
      }),
      priority: 90,
      is_active: true,
      valid_from: new Date(),
      valid_until: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  ];

  for (const ruleData of pricingRules) {
    const existingRule = await prisma.pricing_rules.findUnique({
      where: { rule_name: ruleData.rule_name },
    });

    if (!existingRule) {
      await prisma.pricing_rules.create({
        data: ruleData,
      });
      console.log(`✅ Created pricing rule: ${ruleData.rule_name}`);
    } else {
      console.log(`✅ Pricing rule already exists: ${ruleData.rule_name}`);
    }
  }

  // ============================================
  // 5. Create Demo Supplier
  // ============================================
  const supplierEmail = 'supplier@bandachao.com';
  let supplier = await prisma.suppliers.findFirst({
    where: { email: supplierEmail },
  });

  if (!supplier) {
    supplier = await prisma.suppliers.create({
      data: {
        name: 'China Direct Supplier',
        name_ar: 'مورد مباشر من الصين',
        name_zh: '中国直接供应商',
        email: supplierEmail,
        phone: '+86-123-456-7890',
        country: 'CN',
        city: 'Shenzhen',
        contact_person: 'Mr. Wang',
        status: 'ACTIVE',
        rating: 4.8,
      },
    });
    console.log('✅ Created supplier:', supplier.name);
  } else {
    console.log('✅ Supplier already exists');
  }

  // ============================================
  // 6. Create Demo Product for Flash Drop
  // ============================================
  const fashionCategory = await prisma.categories.findUnique({
    where: { slug: 'fashion' },
  });

  if (fashionCategory && adminUser) {
    // Create a demo product for Flash Drop
    const flashDropProduct = await prisma.products.findFirst({
      where: { name: 'Flash Drop Demo Product' },
    });

    if (!flashDropProduct) {
      const product = await prisma.products.create({
        data: {
          name: 'Flash Drop Demo Product',
          name_ar: 'منتج تجريبي للمزاد العكسي',
          name_zh: '闪电特卖演示产品',
          description: 'A demo product for Flash Drop feature',
          description_ar: 'منتج تجريبي لميزة المزاد العكسي',
          description_zh: '闪电特卖功能的演示产品',
          price: 100,
          currency: 'USD',
          stock: 10,
          user_id: adminUser.id,
          category_id: fashionCategory.id,
          status: 'ACTIVE',
        },
      });

      // Create Flash Drop for this product
      const flashDrop = await (prisma as any).flash_drops.create({
        data: {
          product_id: product.id,
          starting_price: 100,
          current_price: 100,
          min_price: 50,
          price_decrement: 1.0,
          interval_seconds: 10,
          status: 'ACTIVE',
          started_at: new Date(),
          last_price_update: new Date(),
        },
      });
      console.log('✅ Created Flash Drop product and flash drop:', product.name);
    } else {
      console.log('✅ Flash Drop product already exists');
    }
  }

  // ============================================
  // 7. Create Demo Discount Code (Pet Reward)
  // ============================================
  if (adminUser) {
    const discountCode = await prisma.discount_codes.findFirst({
      where: { code: 'PET2024' },
    });

    if (!discountCode) {
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 1); // Valid for 1 month

      await prisma.discount_codes.create({
        data: {
          user_id: adminUser.id,
          code: 'PET2024',
          discount_type: 'PERCENTAGE',
          discount_value: 15,
          min_purchase: 50,
          max_discount: 20,
          valid_from: new Date(),
          valid_until: validUntil,
          max_uses: 1,
          is_active: true,
          source: 'PET_REWARD',
        },
      });
      console.log('✅ Created demo discount code: PET2024 (15% off, min $50)');
    } else {
      console.log('✅ Discount code already exists');
    }
  }

  // ============================================
  // 8. Create Demo Pet State for Admin
  // ============================================
  if (adminUser) {
    const petState = await prisma.pet_states.findUnique({
      where: { user_id: adminUser.id },
    });

    if (!petState) {
      await (prisma as any).pet_states.create({
        data: {
          user_id: adminUser.id,
          hunger_level: 75,
          happiness_level: 60,
          last_fed_at: new Date(),
          last_hunger_update: new Date(),
          total_feeds: 0,
        },
      });
      console.log('✅ Created pet state for admin user');
    } else {
      console.log('✅ Pet state already exists for admin');
    }
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log('  - Admin user: admin@bandachao.com / admin123');
  console.log('  - Founder user: founder@bandachao.com / founder123');
  console.log('  - Categories: 5 categories created');
  console.log('  - Pricing Rules: 4 rules created');
  console.log('  - Supplier: 1 supplier created');
  console.log('  - Flash Drop: 1 demo flash drop created');
  console.log('  - Discount Code: PET2024 (15% off)');
  console.log('  - Pet State: Created for admin user');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
