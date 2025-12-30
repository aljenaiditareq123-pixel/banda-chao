# 🔍 كيفية العثور على Backend Service في Render Dashboard

**تاريخ:** 28 ديسمبر 2025

---

## ⚠️ المشكلة:

Logs التي أرسلتها هي من **Frontend Service** (`banda-chao-frontend`).

نحتاج لفحص **Backend Service** (`banda-chao-backend`) للتحقق من JWT_SECRET.

---

## ✅ خطوات العثور على Backend Service:

### **1️⃣ افتح Render Dashboard:**

1. اذهب إلى: `https://dashboard.render.com`
2. سجل دخولك

---

### **2️⃣ ابحث عن Backend Service:**

في Render Dashboard، ابحث عن:

#### **أ) في قائمة "Projects" أو "Services":**

- **`banda-chao-backend`** ← هذا هو Backend Service ✅
- **`banda-chao-frontend`** ← هذا هو Frontend Service ❌ (لا نحتاجه الآن)
- **`banda-chao-db`** ← هذا هو Database ❌

---

#### **ب) إذا لم تجده باسم `banda-chao-backend`:**

ابحث عن أي Service يحتوي على:
- **"backend"** في الاسم
- أو **"API"** في الوصف
- أو Service مختلف عن Frontend

---

### **3️⃣ افتح Backend Service:**

1. اضغط على **`banda-chao-backend`** (أو أي اسم مشابه)
2. ستفتح صفحة Service

---

### **4️⃣ افتح Logs:**

1. في صفحة Backend Service
2. اضغط **"Logs"** في القائمة الجانبية (تحت "MONITOR")
3. **ليس** "Events" أو "Settings"

---

### **5️⃣ ابحث عن رسائل Startup:**

عند بدء Backend، يجب أن ترى:

#### ✅ **إذا كان JWT_SECRET موجود:**

```
[JWT_SECRET] Checking JWT_SECRET in production...
[JWT_SECRET] JWT_SECRET_ENV type: string
[JWT_SECRET] JWT_SECRET_ENV length: 46
[JWT_SECRET] JWT_SECRET_ENV exists: true
✅ [JWT_SECRET] JWT_SECRET is loaded successfully in production (length: 46)
[ENV CHECK] Environment variables status:
  JWT_SECRET: ✅ Set (length: 46)
🚀 Server is running on 0.0.0.0:10000
```

---

#### ❌ **إذا كان JWT_SECRET مفقود:**

```
[JWT_SECRET] Checking JWT_SECRET in production...
[JWT_SECRET] JWT_SECRET_ENV type: undefined
[JWT_SECRET] JWT_SECRET_ENV length: 0
[JWT_SECRET] JWT_SECRET_ENV exists: false
❌ [CRITICAL] JWT_SECRET is not set in production environment!
[ENV CHECK] Environment variables status:
  JWT_SECRET: ❌ Missing
```

---

## 🔍 كيفية التمييز بين Frontend و Backend:

| Service | اسم المحتمل | Logs تظهر |
|---------|------------|-----------|
| **Frontend** | `banda-chao-frontend` | `Next.js`, `[GET] /ar/login` |
| **Backend** | `banda-chao-backend` | `[JWT_SECRET]`, `🚀 Server is running` |

---

## ⚠️ إذا لم تجد Backend Service:

### **احتمالات:**

1. **Backend Service غير موجود:**
   - يجب إنشاء Backend Service في Render

2. **Backend Service باسم مختلف:**
   - ابحث في جميع Services عن Service مختلف عن Frontend

3. **Backend Service في Project مختلف:**
   - تحقق من جميع Projects في Render Dashboard

---

## 🎯 الخطوة التالية:

1. ✅ افتح Render Dashboard
2. ✅ ابحث عن **`banda-chao-backend`** (أو Service باسم مشابه)
3. ✅ اضغط عليه
4. ✅ افتح **"Logs"** tab
5. ✅ ابحث عن `[JWT_SECRET]` messages
6. ✅ أخبرني ماذا ترى

---

**🚀 ابحث عن Backend Service الآن وأرسل لي Logs من Backend!** ✅
