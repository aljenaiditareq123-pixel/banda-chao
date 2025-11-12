# 🔍 فحص المشكلة - Service لم يعمل

## ⚠️ **المشكلة:**

- ⚠️ Service أخذ وقت أطول بكثير من 30-60 ثانية
- ⚠️ قد تكون هناك مشكلة

---

## 🔍 **الفحص:**

---

### **الخطوة 1: تحقق من Render Dashboard**

#### **في Render Dashboard:**

1. **Service `banda-chao-backend`**
2. **Logs** (في الـ Sidebar → MONITOR)
3. **اقرأ آخر Logs:**
   - هل هناك أخطاء؟
   - ما آخر رسالة؟
   - Build نجح أم فشل؟

---

### **الخطوة 2: تحقق من Deployment Status**

#### **في Render Dashboard:**

1. **Events** (في الـ Sidebar)
2. **أحدث Deployment:**
   - Status: Live أم Failed؟
   - متى آخر Build؟

---

### **الخطوة 3: تحقق من Environment Variables**

#### **في Render Dashboard:**

1. **Settings** → **Environment**
2. **تأكد من وجود:**
   - ✅ `DATABASE_URL` (مهم جداً!)
   - ✅ `JWT_SECRET`
   - ✅ `JWT_EXPIRES_IN`
   - ✅ `NODE_ENV`

---

## 🐛 **المشاكل المحتملة:**

---

### **المشكلة 1: DATABASE_URL مفقود أو خاطئ**

#### **الحل:**

1. **Database `banda-chao-db`** → **Settings**
2. **Copy Internal Database URL**
3. **Service** → **Environment** → **أضف/حدث DATABASE_URL**

---

### **المشكلة 2: Build فشل**

#### **الحل:**

1. **Events** → **أحدث Deployment**
2. **اقرأ Logs**
3. **إذا Build فشل:**
   - تحقق من Build Command
   - تحقق من Root Directory
   - تحقق من Prisma schema

---

### **المشكلة 3: Prisma Migrations لم تعمل**

#### **الحل:**

1. **Service** → **Shell**
2. **اكتب:**
   ```bash
   npx prisma migrate deploy
   ```
   أو
   ```bash
   npx prisma db push
   ```

---

### **المشكلة 4: Service في حالة Failed**

#### **الحل:**

1. **Events** → **أحدث Deployment**
2. **إذا Status: Failed:**
   - اقرأ Logs
   - حدد المشكلة
   - Manual Deploy مرة أخرى

---

## 📋 **خطوات الفحص:**

```
1️⃣  Render Dashboard → Service → Logs
    → اقرأ آخر Logs

2️⃣  Events → أحدث Deployment
    → Status: Live أم Failed?

3️⃣  Settings → Environment
    → تأكد من Environment Variables

4️⃣  إذا Build فشل → أصلح المشكلة
5️⃣  Manual Deploy مرة أخرى
```

---

## ✅ **بعد تحديد المشكلة:**

### **ستعرف:**

- ✅ ما هي المشكلة بالضبط
- ✅ كيف تحلها
- ✅ Service سيعمل بعد الإصلاح

---

**اذهب إلى Render Dashboard → Service → Logs واقرأ آخر Logs!** 🔍


