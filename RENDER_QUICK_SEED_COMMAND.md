# 🚀 أمر تنفيذ Quick Seed على Render

## ✅ الأمر الصحيح (استخدم هذا):

```bash
cd /opt/render/project/src/server && npm run db:quick-seed
```

---

## 🔄 أو باستخدام tsx مباشرة:

```bash
cd /opt/render/project/src/server && npx tsx scripts/quick-seed.ts
```

---

## ⚠️ ملاحظة مهمة:

**لا تستخدم `ts-node`** - المشروع يستخدم `tsx` وليس `ts-node`.

---

## 📋 خطوات التحقق قبل التنفيذ:

```bash
# 1. التحقق من الموقع
cd /opt/render/project/src/server
pwd

# 2. التحقق من وجود الملف
ls -la scripts/quick-seed.ts

# 3. التحقق من وجود tsx
which tsx || npm list tsx

# 4. تنفيذ السكريبت
npm run db:quick-seed
```

---

## ✅ النتيجة المتوقعة:

```
🌱 Starting quick database seeding...

📝 Creating 5 makers...
  ✅ Created maker 1: حرفي 1 (maker1@bandachao.com)
  ✅ Created maker 2: حرفي 2 (maker2@bandachao.com)
  ✅ Created maker 3: حرفي 3 (maker3@bandachao.com)
  ✅ Created maker 4: حرفي 4 (maker4@bandachao.com)
  ✅ Created maker 5: حرفي 5 (maker5@bandachao.com)

📦 Creating 5 products...
  ✅ Created product 1: سجادة يدوية من الحرير
  ✅ Created product 2: مزهرية خزفية تقليدية
  ✅ Created product 3: ساعة حائط خشبية
  ✅ Created product 4: مصباح نحاسي منقوش
  ✅ Created product 5: طبق تقديم نحاسي

🎥 Creating 5 videos...
  ✅ Created video 1: ورشة عمل: صناعة السجادة اليدوية (SHORT)
  ✅ Created video 2: جولة في ورشة الخزف (SHORT)
  ✅ Created video 3: كيف تصنع ساعة حائط خشبية (SHORT)
  ✅ Created video 4: عملية النقش على النحاس (LONG)
  ✅ Created video 5: تصميم طبق تقديم نحاسي (LONG)

✅ Quick seeding completed successfully!

📊 Summary:
   - 5 makers created
   - 5 products created
   - 5 videos created

✅ Script completed successfully
```

---

**آخر تحديث:** Commit `beba0a4`

