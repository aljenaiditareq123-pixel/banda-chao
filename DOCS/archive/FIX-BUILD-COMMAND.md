# ⚠️ إصلاح Build Command - المفقود

## ❌ **المشكلة:**

**Build Command ناقص!**

**القيمة الحالية (خطأ):**
```
npm install && npx prisma generate
```

**يجب أن يكون:**
```
npm install && npx prisma generate && npm run build
```

**`npm run build` مفقود!**

---

## 🔧 **الحل:**

---

### **الخطوة 1: عدّل Build Command**

#### **في صفحة Settings:**

1. **ابحث عن:** **"Build Command"**
2. **اضغط:** **"Edit"** (بجانب Build Command)
3. **في حقل الإدخال:**
   - **احذف:** `npm install && npx prisma generate`
   - **اكتب:**
     ```
     npm install && npx prisma generate && npm run build
     ```
4. **Save** (أو **Update**)

---

### **الخطوة 2: تحقق من Start Command**

#### **يجب أن يكون:**

**Start Command:**
```
npm start
```

**✅ هذا يبدو صحيحاً!**

---

## ✅ **القيم الصحيحة الكاملة:**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

## 📋 **ملخص الخطوات:**

```
1️⃣  Build Command → Edit
2️⃣  احذف: npm install && npx prisma generate
3️⃣  اكتب: npm install && npx prisma generate && npm run build
4️⃣  Save
5️⃣  Save Changes (في أسفل الصفحة)
```

---

## ✅ **بعد Save:**

1. **Render سيبدأ Build جديد تلقائياً**
2. **أو Manual Deploy** → **Deploy latest commit**
3. **راقب Build progress**

---

## 🎯 **لماذا `npm run build` مهم:**

- ✅ **Compile TypeScript** إلى JavaScript
- ✅ **Build Prisma Client**
- ✅ **إنشاء ملفات Production**
- ✅ **بدونها، Server لن يعمل!**

---

**عدّل Build Command وأضف `&& npm run build` في النهاية!** 🔧


