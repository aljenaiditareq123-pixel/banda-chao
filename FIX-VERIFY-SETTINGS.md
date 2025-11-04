# ✅ إصلاح Verify Settings

## ✅ **أنت في نافذة "Verify Settings"**

---

## ❌ **المشكلة:**

- ✅ **Root Directory:** `server` (صحيح!)
- ❌ **Build Command:** `server/ $ npm install && npx prisma generate && npm run build` (خطأ!)
- ❌ **Start Command:** `server/ $ npm start` (خطأ!)

**يجب حذف `server/ $` من بداية Commands!**

---

## 🔧 **الحل:**

---

### **الخطوة 1: عدّل Build Command**

#### **في حقل "Build Command":**

1. **احذف:** `server/ $` من البداية
2. **يجب أن يكون:**
   ```
   npm install && npx prisma generate && npm run build
   ```
   - ✅ **لا تكتب `server/ $`**
   - ✅ **لا تكتب `cd server &&`**

---

### **الخطوة 2: عدّل Start Command**

#### **في حقل "Start Command":**

1. **احذف:** `server/ $` من البداية
2. **يجب أن يكون:**
   ```
   npm start
   ```
   - ✅ **لا تكتب `server/ $`**
   - ✅ **لا تكتب `cd server &&`**

---

### **الخطوة 3: Update Fields**

#### **في أسفل النافذة:**

1. **اضغط:** **"Update Fields"** (الزر الأبيض على اليمين)
2. **ستحفظ التغييرات**
3. **Render سيبدأ Build جديد تلقائياً**

---

## ✅ **القيم الصحيحة (انسخها كما هي):**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

## 📋 **ملخص الخطوات:**

```
1️⃣  Build Command: احذف 'server/ $' → اكتب: npm install && npx prisma generate && npm run build
2️⃣  Start Command: احذف 'server/ $' → اكتب: npm start
3️⃣  Update Fields (الزر الأبيض)
```

---

## ✅ **بعد Update Fields:**

### **Render سيبدأ:**

1. ✅ **Clone Repository**
2. ✅ **يذهب إلى `/opt/render/project/server`**
3. ✅ **npm install**
4. ✅ **npx prisma generate**
5. ✅ **npm run build**
6. ✅ **npm start**

---

## 🎯 **لماذا يجب حذف `server/ $`:**

### **لأن Root Directory = `server`:**

- ✅ Render يبدأ مباشرة من `/opt/render/project/server`
- ✅ جميع Commands تعمل داخل `server/` تلقائياً
- ✅ لا حاجة لـ `cd server &&` أو `server/ $`
- ❌ `server/ $` سيسبب خطأ لأن Render داخل `server/` بالفعل

---

**احذف `server/ $` من Commands واضغط "Update Fields"!** 🔧

