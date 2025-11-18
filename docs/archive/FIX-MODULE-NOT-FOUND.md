# ⚠️ إصلاح خطأ MODULE_NOT_FOUND

## ❌ **الخطأ الجديد:**

```
code: 'MODULE_NOT_FOUND'
requireStack: []
```

Build نجح لكن Service فشل عند التشغيل!

---

## 💡 **السبب المحتمل:**

### **1. Start Command خاطئ**
- قد يحاول تشغيل ملف غير موجود

### **2. Environment Variables مفقودة**
- `DATABASE_URL` أو `JWT_SECRET` مفقود

### **3. مسار الملفات خاطئ**

---

## 🔧 **الحل:**

### **الخطوة 1: تحقق من Start Command**

#### **في Render Dashboard:**

1. **Settings** → **Build & Deploy**
2. **ابحث عن "Start Command"**
3. **تأكد من القيمة:**
   ```
   npm start
   ```

---

### **الخطوة 2: تحقق من package.json**

#### **في `server/package.json`:**

Start Command يجب أن يكون:
```json
"scripts": {
  "start": "node dist/index.js"
}
```

---

### **الخطوة 3: تحقق من Environment Variables**

#### **في Render Dashboard:**

1. **Settings** → **Environment**
2. **تأكد من وجود:**
   - `DATABASE_URL` (مهم جداً!)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`

---

### **الخطوة 4: إذا كان Start Command خاطئ**

#### **في Settings → Build & Deploy:**

1. **Start Command:**
   - **إذا كان:** `node dist/index.js`
   - **استخدم:** `npm start` (أفضل)
   
   **أو:**
   
   - **إذا كان:** `npm start` موجود
   - **استخدم:** `node dist/index.js` مباشرة

---

## ✅ **الحل الأفضل:**

### **Start Command:**
```
npm start
```

### **Build Command:**
```
npm install && npx prisma generate && npm run build
```

### **Root Directory:**
```
server
```

---

## 📋 **الخطوات الكاملة:**

1. **Settings** → **Build & Deploy**
2. **تأكد من:**
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
3. **Settings** → **Environment**
4. **أضف Environment Variables:**
   ```
   DATABASE_URL = (من Render Database)
   JWT_SECRET = my-super-secret-jwt-key-12345
   JWT_EXPIRES_IN = 7d
   NODE_ENV = production
   ```
5. **Save Changes**
6. **Manual Deploy** → **"Deploy latest commit"**

---

## ✅ **بعد الإصلاح:**

- ✅ Build سينجح
- ✅ Service سيعمل
- ✅ **المشروع جاهز!** 🎉

---

**اذهب إلى Settings وحدث Start Command و Environment Variables!** 🔧


