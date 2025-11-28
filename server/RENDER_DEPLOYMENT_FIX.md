# إصلاح خطأ P2022 على Render

## الحل التلقائي (موصى به)

✅ **الخبر السار:** الأمر `npx prisma db push` يتم تنفيذه **تلقائياً** بعد كل بناء على Render!

في `server/package.json`، السطر 9:
```json
"postbuild": "npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss || echo 'Database push failed, continuing...'"
```

هذا يعني أن كل مرة يتم فيها البناء على Render، سيتم:
1. `npm install`
2. `npm run build` (يولد Prisma Client)
3. `npm run postbuild` (ينفذ `db push` تلقائياً)

## الخطوات المطلوبة على Render

### الطريقة 1: إعادة البناء (أسهل)

1. **اذهب إلى Render Dashboard** → `banda-chao` (Backend service)
2. **انقر على "Manual Deploy"**
3. **اختر "Clear build cache & deploy"**
4. **انتظر حتى يكتمل البناء**
5. **تحقق من Logs** - يجب أن ترى:
   ```
   > banda-chao-server@1.0.0 postbuild
   > npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
   
   ✅ Your database is now in sync with your Prisma schema.
   ```

### الطريقة 2: تنفيذ يدوي من Shell

1. **اذهب إلى Render Dashboard** → `banda-chao` → **Shell**
2. **نفذ:**
   ```bash
   cd server
   npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
   ```
3. **انتظر رسالة النجاح**
4. **أعد تشغيل الخادم** (Manual Deploy → Deploy latest commit)

## التحقق من النجاح

بعد إعادة البناء أو التنفيذ اليدوي، تحقق من:
- ✅ لا توجد أخطاء P2022 في Logs
- ✅ الخادم يعمل بنجاح
- ✅ API endpoints تستجيب بشكل صحيح

## ملاحظة

إذا استمرت المشكلة بعد `db push`، قد تحتاج إلى:
1. التحقق من أن `schema.prisma` يحتوي على جميع الحقول المطلوبة
2. التأكد من أن `@@map` موجودة بشكل صحيح
3. فحص Logs للبحث عن أخطاء محددة

