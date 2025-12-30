# 🔐 تعليمات إصلاح كلمة مرور Founder على Render

## المشكلة
كلمة المرور لم يتم تحديثها بشكل صحيح لأن الأمر السابق استخدم template literal خاطئ.

## الحل الصحيح

### الطريقة 1: استخدام السكريبت الجديد (موصى به)

في Render Shell، نفذ:

```bash
cd ~/project/src/server && npx tsx scripts/fix-founder-password-render.ts
```

هذا السكريبت:
- ✅ يستخدم Prisma parameterized queries بشكل صحيح
- ✅ يختبر كلمة المرور بعد التحديث
- ✅ يتحقق من تحديث الدور إلى FOUNDER

---

### الطريقة 2: أمر مباشر (بديل)

إذا لم يعمل السكريبت، جرب هذا الأمر:

```bash
cd ~/project/src/server && node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const email = 'founder@bandachao.com';
const password = '123456';

(async () => {
  try {
    const hash = await bcrypt.hash(password, 10);
    await prisma.\$executeRaw\`UPDATE users SET password = \${hash}, role = 'FOUNDER'::\"UserRole\", updated_at = NOW() WHERE email = \${email}\`;
    console.log('✅ Password updated successfully!');
    const verify = await prisma.\$queryRaw\`SELECT email, role FROM users WHERE email = \${email}\`;
    console.log('✅ Verified:', verify[0]);
    await bcrypt.compare(password, hash).then(match => console.log('✅ Password test:', match ? 'PASSED' : 'FAILED'));
    await prisma.\$disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await prisma.\$disconnect();
    process.exit(1);
  }
})();
"
```

**ملاحظة مهمة:** في هذا الأمر، لاحظ استخدام `\${hash}` (backslash قبل $) لأننا داخل string مزدوج.

---

## بعد التحديث

جرب الدخول بـ:
- **Email:** `founder@bandachao.com`
- **Password:** `123456`

إذا استمرت المشكلة، تحقق من Render Logs للبحث عن أخطاء authentication.

