# 🔧 إصلاح مشكلة Prisma WASM Module Not Found

## المشكلة

```
Error: Cannot find module '/opt/render/project/src/server/node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js'
```

## السبب

1. **Prisma Client** لا يجد ملف WASM المطلوب
2. **`npx prisma generate`** قد يعمل من مسار خاطئ
3. **Prisma Client** قد لا يُثبت بشكل صحيح في `node_modules`

## الحل

### الخطوة 1: تحديث Build Command في Render Dashboard

**Build Command** يجب أن يكون:

```bash
npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build
```

**التفسير:**
- `npm install --include=dev` → يثبت جميع dependencies (بما فيها `@prisma/client`)
- `npx prisma generate --schema=./prisma/schema.prisma` → ينشئ Prisma Client من المسار الصحيح
- `npm run build` → يترجم TypeScript إلى `dist/`

### الخطوة 2: التحقق من Start Command

**Start Command** يجب أن يكون:
```bash
node dist/index.js
```

**❌ لا تستخدم:**
- `npm start` (لأنه يحتوي على `prisma db push` في production)

### الخطوة 3: التحقق من Root Directory

**Root Directory** يجب أن يكون:
```
server
```

### الخطوة 4: التحقق من Prisma Schema

تأكد من أن `server/prisma/schema.prisma` يحتوي على:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## التحقق من النجاح

بعد Deployment، يجب أن ترى في Logs:

```
==> Running build command 'npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build'...
> banda-chao-server@1.0.0 postinstall
> prisma generate
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client
> banda-chao-server@1.0.0 build
> tsc
==> Build successful 🎉
==> Deploying...
==> Running 'node dist/index.js'
🚀 Server is running
```

**يجب ألا ترى:**
```
Error: Cannot find module '/opt/render/project/src/server/node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js'
```

## إذا استمرت المشكلة

### Option 1: استخدام Prisma Binary Targets

يمكنك إضافة `binaryTargets` إلى `generator client` في `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

لكن هذا عادة غير ضروري إذا كان Build Command صحيح.

### Option 2: التحقق من Node Version

تأكد من أن **Node Version** في Render هو `20.x.x` أو `18.x.x` (متوافق مع Prisma).

### Option 3: تنظيف و Rebuild

1. في Render Dashboard، اضغط **Suspend Service**
2. اضغط **Resume Service**
3. سيتم rebuild تلقائياً

## ملخص الإعدادات النهائية

**Render Dashboard Settings:**

- **Root Directory:** `server`
- **Build Command:** `npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build`
- **Start Command:** `node dist/index.js`
- **Node Version:** `20.x.x` (أو `18.x.x`)

**ملاحظة:** `render.yaml` تم تحديثه، لكن Render Dashboard قد لا يستخدمه تلقائياً. تأكد من تحديث Build Command في Dashboard يدوياً.



