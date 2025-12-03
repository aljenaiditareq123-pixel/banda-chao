# 🚀 الحل الأبسط لتنفيذ Seeding على Render

## ✅ الحل الموصى به (أمر واحد فقط):

```bash
cd /opt/render/project/src/server && npm run db:quick-seed
```

**هذا هو الأسهل والأسرع!** السكريبت موجود بالفعل في المشروع.

---

## 🔄 إذا أردت استخدام الطريقة اليدوية:

### الخطوة 1: مسح أي ملف قديم
```bash
cd /opt/render/project/src/server && rm -f seed-now.ts
```

### الخطوة 2: إنشاء السكريبت (انسخ الكود كاملاً)
```bash
cat > seed-now.ts << 'ENDOFFILE'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting seeding...');
    
    // Create 5 makers
    for (let i = 1; i <= 5; i++) {
      const userId = randomUUID();
      const email = `maker${i}@bandachao.com`;
      const password = await bcrypt.hash('maker123', 10);
      const name = `حرفي ${i}`;
      
      await prisma.$executeRaw`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (${userId}, ${email}, ${password}, ${name}, 'USER'::"UserRole", NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
      `;
      
      await prisma.$executeRaw`
        INSERT INTO makers (id, user_id, slug, name, bio, created_at, updated_at)
        VALUES (${randomUUID()}, ${userId}, ${`maker-${i}`}, ${name}, ${`وصف ${i}`}, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING;
      `;
      
      console.log(`✅ Maker ${i} created`);
    }
    
    // Get makers
    const makers = await prisma.$queryRaw<Array<{user_id: string}>>`
      SELECT user_id FROM makers LIMIT 5
    `;
    
    // Create 5 products
    const products = ['سجادة', 'مزهرية', 'ساعة', 'مصباح', 'طبق'];
    for (let i = 0; i < 5; i++) {
      const maker = makers[i % makers.length];
      await prisma.$executeRaw`
        INSERT INTO products (id, user_id, name, description, price, category, image_url, external_link, created_at, updated_at)
        VALUES (${randomUUID()}, ${maker.user_id}, ${products[i]}, ${`وصف ${i}`}, ${100 + i * 10}, 'HANDMADE', ${`https://picsum.photos/400/400?random=${i}`}, ${'https://example.com'}, NOW(), NOW())
      `;
      console.log(`✅ Product ${i + 1} created`);
    }
    
    // Create 5 videos
    const videos = ['فيديو 1', 'فيديو 2', 'فيديو 3', 'فيديو 4', 'فيديو 5'];
    for (let i = 0; i < 5; i++) {
      const maker = makers[i % makers.length];
      await prisma.$executeRaw`
        INSERT INTO videos (id, user_id, title, description, video_url, thumbnail_url, duration, type, views, likes, created_at, updated_at)
        VALUES (${randomUUID()}, ${maker.user_id}, ${videos[i]}, ${`وصف ${i}`}, ${'https://example.com/video.mp4'}, ${`https://picsum.photos/640/360?random=${i}`}, ${60}, 'SHORT', 0, 0, NOW(), NOW())
      `;
      console.log(`✅ Video ${i + 1} created`);
    }
    
    await prisma.$disconnect();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seed();
ENDOFFILE
```

### الخطوة 3: تشغيل السكريبت
```bash
npx tsx seed-now.ts
```

---

## ⚠️ ملاحظات مهمة:

1. **استخدم `ENDOFFILE` بدلاً من `EOF`** - هذا يمنع التداخل مع أي `EOF` موجود في الكود
2. **انسخ الكود كاملاً** - من `cat >` حتى `ENDOFFILE`
3. **لا تعدل الكود** - انسخه كما هو

---

## ✅ النتيجة المتوقعة:

```
🌱 Starting seeding...
✅ Maker 1 created
✅ Maker 2 created
✅ Maker 3 created
✅ Maker 4 created
✅ Maker 5 created
✅ Product 1 created
✅ Product 2 created
✅ Product 3 created
✅ Product 4 created
✅ Product 5 created
✅ Video 1 created
✅ Video 2 created
✅ Video 3 created
✅ Video 4 created
✅ Video 5 created
✅ Done!
```

---

## 🎯 بعد التنفيذ:

1. ✅ ستظهر البيانات في لوحة التحكم `/founder`
2. ✅ لن تبقى لوحة التحكم عالقة على التحميل
3. ✅ ستظهر المنتجات في `/products`
4. ✅ ستظهر الفيديوهات في `/videos`

---

**آخر تحديث:** بعد إضافة حل مبسط

