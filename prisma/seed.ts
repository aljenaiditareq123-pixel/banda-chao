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

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log('  - Admin user: admin@bandachao.com / admin123');
  console.log('  - Founder user: founder@bandachao.com / founder123');
  console.log('  - Categories: 5 categories created');
  console.log('  - Pricing Rules: 4 rules created');
  console.log('  - Supplier: 1 supplier created');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
