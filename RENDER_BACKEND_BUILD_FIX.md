# 🔧 إصلاح خطأ TypeScript في Backend Service على Render

## ⚠️ المشكلة

خطأ `"This is not the tsc command you are looking for"` يحدث في Backend Service لأن TypeScript غير متاح أثناء البناء.

## ✅ الحل

### Backend Service Build Command يجب أن يكون:

```bash
npm install --legacy-peer-deps && npm run build
```

**أو بشكل أكثر صراحة:**

```bash
cd server && npm install --legacy-peer-deps && npm run build
```

### ملاحظة مهمة:

- **Root Directory** في Render Dashboard للـ Backend Service يجب أن يكون: `server/`
- إذا كان Root Directory = `server/`، فإن Build Command يجب أن يكون: `npm install --legacy-peer-deps && npm run build`
- إذا كان Root Directory = `.` (الجذر)، فإن Build Command يجب أن يكون: `cd server && npm install --legacy-peer-deps && npm run build`

## 📋 خطوات الإصلاح في Render Dashboard:

1. **اذهب إلى Render Dashboard** → Backend Service (`banda-chao-backend`)
2. **افتح Settings** → **Build & Deploy**
3. **تحقق من Root Directory:**
   - يجب أن يكون: `server`
4. **حدّث Build Command إلى:**
   ```bash
   npm install --legacy-peer-deps && npm run build
   ```
5. **احفظ التغييرات**

## ✅ التحقق من النجاح:

بعد الحفظ، يجب أن ترى في Build Logs:
- ✅ `npm install --legacy-peer-deps` يعمل بنجاح
- ✅ `npm run build` يعمل بنجاح
- ✅ `npx tsc -p tsconfig.json` يجد TypeScript
- ✅ Build يكتمل بنجاح

---

**تاريخ الإنشاء:** 2025-01-20
