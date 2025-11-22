# 🔧 إصلاح مشكلة MODULE_NOT_FOUND: dist/index.js

## المشكلة

```
Error: Cannot find module '/opt/render/project/src/server/dist/index.js'
```

## السبب

Render يبحث في مسار خاطئ لأن:
1. **Build Command** لم ينفذ بشكل صحيح (لم ينشئ `dist/`)
2. أو **Build Command** فشل بدون أخطاء واضحة
3. أو **Build Command** لا يحتوي على `--include=dev`

## الحل

### الخطوة 1: تحديث Build Command في Render Dashboard

1. اذهب إلى: **Render Dashboard** → **Your Service** → **Settings** → **Build & Deploy**
2. اضغط **Edit** بجانب **Build Command**
3. تأكد من أن الأمر **كامل** وليس مقطوعاً:

```bash
npm install --include=dev && npx prisma generate && npm run build
```

**⚠️ مهم جداً:**
- تأكد من وجود `--include=dev` (بدون هذا، `@types/*` لن تُثبت)
- تأكد من وجود `&&` بين الأوامر (ليس `&`)
- تأكد من أن الأمر **كامل** وليس مقطوعاً

### الخطوة 2: التحقق من Start Command

**Start Command** يجب أن يكون:
```bash
node dist/index.js
```

**❌ لا تستخدم:**
- `npm start` (لأنه يحتوي على `prisma db push` في production)
- `cd server && node dist/index.js` (لأن Root Directory = `server`)

### الخطوة 3: التحقق من Root Directory

**Root Directory** يجب أن يكون:
```
server
```

### الخطوة 4: Trigger Manual Deploy

بعد تحديث Build Command:
1. اذهب إلى **Manual Deploy** tab
2. اضغط **Deploy latest commit**
3. راقب Logs بعناية

## التحقق من النجاح

بعد Deployment، يجب أن ترى في Logs:

```
==> Running build command 'npm install --include=dev && npx prisma generate && npm run build'...
> banda-chao-server@1.0.0 build
> tsc
==> Build successful 🎉
==> Deploying...
==> Running 'node dist/index.js'
🚀 Server is running on http://localhost:XXXX
```

**يجب ألا ترى:**
```
Error: Cannot find module '/opt/render/project/src/server/dist/index.js'
```

## إذا استمرت المشكلة

### Option 1: التحقق من Build Logs

في Logs، ابحث عن:
```
==> Running build command...
> tsc
```

إذا لم ترى `> tsc`، فهذا يعني أن Build Command لم ينفذ بشكل صحيح.

### Option 2: استخدام Pre-Deploy Command

يمكنك إضافة **Pre-Deploy Command** (اختياري):
```bash
npm run build
```

لكن هذا يجب ألا يكون ضرورياً إذا كان Build Command صحيح.

### Option 3: التحقق من tsconfig.json

تأكد من أن `server/tsconfig.json` يحتوي على:
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## ملخص الإعدادات النهائية

**Render Dashboard Settings:**

- **Root Directory:** `server`
- **Build Command:** `npm install --include=dev && npx prisma generate && npm run build`
- **Start Command:** `node dist/index.js`
- **Node Version:** `20.x.x` (أو `18.x.x`)

**ملاحظة:** `render.yaml` تم تحديثه، لكن Render Dashboard قد لا يستخدمه تلقائياً. تأكد من تحديث الإعدادات في Dashboard يدوياً.




