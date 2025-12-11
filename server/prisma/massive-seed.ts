import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Arabic product names and descriptions
const arabicProducts = [
  {
    name: 'مزهرية سيراميك يدوية',
    nameEn: 'Handmade Ceramic Vase',
    description: 'مزهرية سيراميك فاخرة مصنوعة يدوياً بتقنيات تقليدية عريقة. تتميز بتصميم أنيق وألوان زاهية تضيف لمسة جمالية لأي مساحة.',
    price: 150,
    category: 'Ceramics',
  },
  {
    name: 'سجادة صوفية تقليدية',
    nameEn: 'Traditional Wool Rug',
    description: 'سجادة صوفية فاخرة منسوجة يدوياً بطرق تقليدية. تتميز بجودة عالية وتصاميم عربية أصيلة تضيف دفء وأناقة للمنزل.',
    price: 350,
    category: 'Textiles',
  },
  {
    name: 'طقم شاي نحاسي',
    nameEn: 'Copper Tea Set',
    description: 'طقم شاي نحاسي أنيق مصنوع يدوياً بتقنيات الحرفيين المهرة. مثالي لتقديم الشاي العربي الأصيل بطريقة راقية.',
    price: 280,
    category: 'Metalwork',
  },
  {
    name: 'مصباح زجاجي ملون',
    nameEn: 'Colored Glass Lamp',
    description: 'مصباح زجاجي ملون بتصميم فني رائع. يضفي إضاءة دافئة وجميلة مع لمسة عربية أصيلة.',
    price: 120,
    category: 'Glass',
  },
  {
    name: 'صندوق خشبي منحوت',
    nameEn: 'Carved Wooden Box',
    description: 'صندوق خشبي منحوت يدوياً بتصاميم عربية تقليدية. مثالي لحفظ المجوهرات والتحف الثمينة.',
    price: 95,
    category: 'Woodwork',
  },
  {
    name: 'وسادة مطرزة بالحرير',
    nameEn: 'Silk Embroidered Pillow',
    description: 'وسادة فاخرة مطرزة بالحرير بتصاميم عربية تقليدية. تضيف لمسة فاخرة وأناقة للديكور الداخلي.',
    price: 180,
    category: 'Textiles',
  },
  {
    name: 'إبريق فخاري تقليدي',
    nameEn: 'Traditional Pottery Jug',
    description: 'إبريق فخاري مصنوع يدوياً بتقنيات تقليدية. يحافظ على برودة الماء بشكل طبيعي ومثالي للاستخدام اليومي.',
    price: 65,
    category: 'Pottery',
  },
  {
    name: 'سلة خيزران يدوية',
    nameEn: 'Handmade Bamboo Basket',
    description: 'سلة خيزران أنيقة مصنوعة يدوياً. متعددة الاستخدامات وتضيف لمسة طبيعية للمنزل.',
    price: 45,
    category: 'Bamboo',
  },
  {
    name: 'قلادة فضية منقوشة',
    nameEn: 'Engraved Silver Necklace',
    description: 'قلادة فضية فاخرة منقوشة بتصاميم عربية تقليدية. قطعة فريدة تضيف أناقة وتميز.',
    price: 220,
    category: 'Jewelry',
  },
  {
    name: 'طبق نحاسي مزخرف',
    nameEn: 'Decorated Copper Plate',
    description: 'طبق نحاسي مزخرف بتصاميم عربية أصيلة. مثالي لتقديم الطعام بطريقة راقية وأنيقة.',
    price: 110,
    category: 'Metalwork',
  },
];

const chineseProducts = [
  {
    name: '传统陶瓷花瓶',
    nameEn: 'Traditional Ceramic Vase',
    description: '精美的手工陶瓷花瓶，采用传统工艺制作。设计优雅，色彩鲜艳，为任何空间增添美感。',
    price: 180,
    category: 'Ceramics',
  },
  {
    name: '丝绸围巾',
    nameEn: 'Silk Scarf',
    description: '高品质手工丝绸围巾，采用传统工艺编织。质地柔软，图案精美，是时尚配饰的完美选择。',
    price: 120,
    category: 'Textiles',
  },
  {
    name: '竹编篮子',
    nameEn: 'Bamboo Woven Basket',
    description: '精美的手工竹编篮子，传统工艺制作。实用美观，为家居增添自然气息。',
    price: 55,
    category: 'Bamboo',
  },
  {
    name: '手工茶具',
    nameEn: 'Handmade Tea Set',
    description: '传统手工茶具套装，采用优质陶瓷制作。设计精美，适合品茶和待客。',
    price: 250,
    category: 'Ceramics',
  },
  {
    name: '刺绣抱枕',
    nameEn: 'Embroidered Cushion',
    description: '精美的手工刺绣抱枕，采用传统图案设计。舒适美观，为家居增添文化气息。',
    price: 140,
    category: 'Textiles',
  },
  {
    name: '玉制项链',
    nameEn: 'Jade Necklace',
    description: '精美的玉制项链，采用传统工艺雕刻。质地温润，寓意吉祥，是珍贵的收藏品。',
    price: 400,
    category: 'Jewelry',
  },
  {
    name: '木制首饰盒',
    nameEn: 'Wooden Jewelry Box',
    description: '精美的手工木制首饰盒，采用传统雕刻工艺。设计精美，适合存放珍贵物品。',
    price: 130,
    category: 'Woodwork',
  },
  {
    name: '传统灯笼',
    nameEn: 'Traditional Lantern',
    description: '精美的手工传统灯笼，采用传统工艺制作。设计精美，为节日和装饰增添氛围。',
    price: 85,
    category: 'Paper',
  },
];

const westernProducts = [
  {
    name: 'Handmade Leather Bag',
    nameEn: 'Handmade Leather Bag',
    description: 'Premium handmade leather bag crafted with traditional techniques. Durable, stylish, and perfect for everyday use.',
    price: 320,
    category: 'Leather',
  },
  {
    name: 'Artisan Pottery Bowl',
    nameEn: 'Artisan Pottery Bowl',
    description: 'Beautiful handcrafted pottery bowl with unique glazing. Perfect for serving or as a decorative piece.',
    price: 75,
    category: 'Pottery',
  },
  {
    name: 'Handwoven Wool Blanket',
    nameEn: 'Handwoven Wool Blanket',
    description: 'Luxurious handwoven wool blanket with traditional patterns. Warm, cozy, and adds elegance to any room.',
    price: 280,
    category: 'Textiles',
  },
  {
    name: 'Handcrafted Wooden Cutting Board',
    nameEn: 'Handcrafted Wooden Cutting Board',
    description: 'Premium wooden cutting board made from sustainable wood. Functional and beautiful kitchen essential.',
    price: 90,
    category: 'Woodwork',
  },
  {
    name: 'Artisan Ceramic Mug',
    nameEn: 'Artisan Ceramic Mug',
    description: 'Unique handcrafted ceramic mug with beautiful glazing. Perfect for your morning coffee or tea.',
    price: 45,
    category: 'Ceramics',
  },
];

// Combine all products
const allProducts = [...arabicProducts, ...chineseProducts, ...westernProducts];

// Maker data with Arabic, Chinese, and Western names
const makersData = [
  // Arabic Makers
  { name: 'أحمد الفخاري', nameEn: 'Ahmed the Potter', country: 'Egypt', city: 'القاهرة', languages: ['ar', 'en'], culture: 'arabic' },
  { name: 'فاطمة المطرزة', nameEn: 'Fatima the Embroiderer', country: 'Morocco', city: 'فاس', languages: ['ar', 'fr'], culture: 'arabic' },
  { name: 'محمد النحاس', nameEn: 'Mohammed the Coppersmith', country: 'Syria', city: 'دمشق', languages: ['ar', 'en'], culture: 'arabic' },
  { name: 'خديجة الزجاجية', nameEn: 'Khadija the Glassmaker', country: 'Lebanon', city: 'بيروت', languages: ['ar', 'en'], culture: 'arabic' },
  { name: 'علي الخشاب', nameEn: 'Ali the Woodworker', country: 'UAE', city: 'دبي', languages: ['ar', 'en'], culture: 'arabic' },
  { name: 'مريم السجاد', nameEn: 'Maryam the Rug Weaver', country: 'Iran', city: 'أصفهان', languages: ['ar', 'fa'], culture: 'arabic' },
  { name: 'يوسف الفضائي', nameEn: 'Youssef the Silversmith', country: 'Jordan', city: 'عمان', languages: ['ar', 'en'], culture: 'arabic' },
  
  // Chinese Makers
  { name: '张师傅', nameEn: 'Master Zhang', country: 'China', city: '景德镇', languages: ['zh', 'en'], culture: 'chinese' },
  { name: '李师傅', nameEn: 'Master Li', country: 'China', city: '苏州', languages: ['zh', 'en'], culture: 'chinese' },
  { name: '王师傅', nameEn: 'Master Wang', country: 'China', city: '杭州', languages: ['zh', 'en'], culture: 'chinese' },
  { name: '陈师傅', nameEn: 'Master Chen', country: 'China', city: '北京', languages: ['zh', 'en'], culture: 'chinese' },
  { name: '刘师傅', nameEn: 'Master Liu', country: 'China', city: '成都', languages: ['zh', 'en'], culture: 'chinese' },
  { name: '赵师傅', nameEn: 'Master Zhao', country: 'China', city: '西安', languages: ['zh', 'en'], culture: 'chinese' },
  
  // Western Makers
  { name: 'Sarah Artisan', nameEn: 'Sarah Artisan', country: 'USA', city: 'New York', languages: ['en'], culture: 'western' },
  { name: 'James Craftsman', nameEn: 'James Craftsman', country: 'UK', city: 'London', languages: ['en'], culture: 'western' },
  { name: 'Emma Maker', nameEn: 'Emma Maker', country: 'Canada', city: 'Toronto', languages: ['en', 'fr'], culture: 'western' },
  { name: 'Lucas Artisan', nameEn: 'Lucas Artisan', country: 'France', city: 'Paris', languages: ['fr', 'en'], culture: 'western' },
  { name: 'Sophia Creator', nameEn: 'Sophia Creator', country: 'Germany', city: 'Berlin', languages: ['de', 'en'], culture: 'western' },
  { name: 'Michael Handmade', nameEn: 'Michael Handmade', country: 'Australia', city: 'Sydney', languages: ['en'], culture: 'western' },
  { name: 'Isabella Craft', nameEn: 'Isabella Craft', country: 'Italy', city: 'Florence', languages: ['it', 'en'], culture: 'western' },
];

async function main() {
  console.log('🌱 Starting MASSIVE database seeding...');
  console.log('📦 Creating 20 makers, 50+ products, reviews, and orders...\n');

  // Create 20 Makers
  const createdMakers = [];
  for (let i = 0; i < makersData.length; i++) {
    const makerData = makersData[i];
    const email = `maker${i + 1}@bandachao.com`;
    // Use environment variable for password, fallback to secure random password
    const makerPasswordPlain = process.env.MAKER_DEFAULT_PASSWORD || 
      `Temp${Math.random().toString(36).slice(-12)}!`;
    const password = await bcrypt.hash(makerPasswordPlain, 10);
    
    // Create user
    const userId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO users (id, email, password, name, role, created_at, updated_at)
      VALUES (${userId}, ${email}, ${password}, ${makerData.name}, 'USER', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET name = ${makerData.name}, updated_at = NOW();
    `;

    // Get user
    const users = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM users WHERE email = ${email} LIMIT 1;
    `;
    const user = users[0];

    // Create maker
    const makerId = randomUUID();
    const slug = makerData.nameEn.toLowerCase().replace(/\s+/g, '-');
    const bio = makerData.culture === 'arabic' 
      ? `حرفي ماهر متخصص في ${makerData.nameEn} من ${makerData.city}`
      : makerData.culture === 'chinese'
      ? `传统工艺大师，来自${makerData.city}`
      : `Skilled artisan specializing in handmade crafts from ${makerData.city}`;

    await prisma.$executeRaw`
      INSERT INTO makers (id, user_id, slug, name, bio, created_at, updated_at)
      VALUES (${makerId}, ${user.id}, ${slug}, ${makerData.name}, ${bio}, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET name = ${makerData.name}, bio = ${bio}, updated_at = NOW();
    `;

    const makers = await prisma.$queryRaw<Array<{ id: string; user_id: string }>>`
      SELECT id, user_id FROM makers WHERE user_id = ${user.id} LIMIT 1;
    `;
    const maker = makers[0];

    createdMakers.push({ ...maker, name: makerData.name, nameEn: makerData.nameEn, culture: makerData.culture });
    console.log(`✅ Created maker ${i + 1}/20: ${makerData.name} (${makerData.country})`);
  }

  console.log(`\n📦 Creating products for ${createdMakers.length} makers...\n`);

  // Create products (distribute across makers)
  let productCount = 0;
  const allCreatedProducts = [];

  // Create at least 50 products total
  const targetProducts = 50;
  const productsPerMaker = Math.ceil(targetProducts / createdMakers.length);
  
  for (let i = 0; i < createdMakers.length; i++) {
    const maker = createdMakers[i];
    const numProducts = i === createdMakers.length - 1 
      ? targetProducts - productCount // Last maker gets remaining products
      : productsPerMaker;
    
    for (let j = 0; j < numProducts; j++) {
      const productTemplate = allProducts[j % allProducts.length];
      const productId = randomUUID();
      const price = productTemplate.price + Math.random() * 50 - 25; // ±25 variation
      const stock = Math.floor(Math.random() * 30) + 5;
      
      // Use Arabic name for Arabic makers, English for others
      const productName = maker.culture === 'arabic' && productTemplate.name 
        ? productTemplate.name 
        : productTemplate.nameEn;
      
      const description = maker.culture === 'arabic' && productTemplate.description
        ? productTemplate.description
        : `${productTemplate.nameEn} - Beautiful handmade ${productTemplate.category.toLowerCase()} crafted with traditional techniques.`;

      await prisma.$executeRaw`
        INSERT INTO products (id, user_id, name, description, price, category, image_url, external_link, created_at, updated_at)
        VALUES (${productId}, ${maker.user_id}, ${productName}, ${description}, ${price}, ${productTemplate.category}, ${`https://picsum.photos/800/600?random=${productCount + 1}`}, '', NOW(), NOW());
      `;

      allCreatedProducts.push({ id: productId, name: productName, price, userId: maker.user_id });
      productCount++;
      
      if (productCount % 10 === 0) {
        console.log(`  ✅ Created ${productCount} products...`);
      }
    }
  }

  console.log(`\n✅ Created ${productCount} products total!\n`);

  // Create some buyers for reviews and orders
  console.log('👥 Creating buyers for reviews and orders...\n');
  const buyers = [];
  for (let i = 0; i < 15; i++) {
    const buyerId = randomUUID();
    const email = `buyer${i + 1}@bandachao.com`;
    // Use environment variable for password, fallback to secure random password
    const buyerPasswordPlain = process.env.BUYER_DEFAULT_PASSWORD || 
      `Temp${Math.random().toString(36).slice(-12)}!`;
    const password = await bcrypt.hash(buyerPasswordPlain, 10);
    const names = ['أحمد', 'محمد', 'فاطمة', 'خديجة', 'علي', 'مريم', 'يوسف', 'سارة', 'جيمس', 'إيما', 'لوكاس', 'صوفيا', 'مايكل', 'إيزابيلا', 'ديفيد'];
    const name = names[i] || `Buyer ${i + 1}`;

    await prisma.$executeRaw`
      INSERT INTO users (id, email, password, name, role, created_at, updated_at)
      VALUES (${buyerId}, ${email}, ${password}, ${name}, 'USER', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `;

    const users = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM users WHERE email = ${email} LIMIT 1;
    `;
    if (users.length > 0) {
      buyers.push(users[0]);
    }
  }

  console.log(`✅ Created ${buyers.length} buyers\n`);

  // Create reviews/comments on products
  console.log('⭐ Creating reviews and comments...\n');
  let reviewCount = 0;
  for (const product of allCreatedProducts.slice(0, 40)) { // Add reviews to first 40 products
    const numReviews = Math.floor(Math.random() * 5) + 2; // 2-6 reviews per product
    
    for (let i = 0; i < numReviews && i < buyers.length; i++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const commentId = randomUUID();
      
      const reviews = [
        'منتج رائع وجودة عالية! أنصح به بشدة.',
        'جودة ممتازة وتصميم جميل. راضٍ تماماً.',
        'منتج يدوي أصيل يستحق كل قرش.',
        'Excellent quality and beautiful craftsmanship!',
        'Amazing product, highly recommended!',
        'Beautiful handmade piece, love it!',
        '传统工艺精湛，质量上乘！',
        '非常满意，推荐购买！',
      ];
      
      const content = reviews[Math.floor(Math.random() * reviews.length)];

      await prisma.$executeRaw`
        INSERT INTO comments (id, user_id, product_id, content, likes, created_at, updated_at)
        VALUES (${commentId}, ${buyer.id}, ${product.id}, ${content}, ${Math.floor(Math.random() * 10)}, NOW(), NOW());
      `;
      
      reviewCount++;
    }
  }

  console.log(`✅ Created ${reviewCount} reviews/comments\n`);

  // Create some orders for the founder dashboard
  console.log('🛒 Creating orders for dashboard...\n');
  let orderCount = 0;
  for (let i = 0; i < 25; i++) {
    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const product = allCreatedProducts[Math.floor(Math.random() * allCreatedProducts.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const orderId = randomUUID();
    const totalAmount = (product.price || 0) * quantity;
    
    const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await prisma.$executeRaw`
      INSERT INTO orders (id, user_id, status, "totalAmount", shipping_name, shipping_city, shipping_country, created_at, updated_at)
      VALUES (${orderId}, ${buyer.id}, ${status}::"OrderStatus", ${totalAmount}, ${buyer.id}, 'City', 'Country', NOW() - (${i} || ' days')::interval, NOW());
    `;

    const orderItemId = randomUUID();
    await prisma.$executeRaw`
      INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at)
      VALUES (${orderItemId}, ${orderId}, ${product.id}, ${quantity}, ${product.price || 0}, NOW());
    `;

    orderCount++;
    if (orderCount % 5 === 0) {
      console.log(`  ✅ Created ${orderCount} orders...`);
    }
  }

  console.log(`\n✅ Created ${orderCount} orders\n`);

  console.log('🎉 MASSIVE seeding completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - ${createdMakers.length} makers created`);
  console.log(`   - ${productCount} products created`);
  console.log(`   - ${buyers.length} buyers created`);
  console.log(`   - ${reviewCount} reviews/comments created`);
  console.log(`   - ${orderCount} orders created`);
  console.log(`\n✅ Your store is now fully populated and ready!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

