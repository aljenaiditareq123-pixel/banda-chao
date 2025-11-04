# 🔧 إصلاح نهائي - Render Settings يدوياً

## ⚠️ **المشكلة:**

Render ما زال يبحث عن `src/server` بدلاً من `server`!

الخطأ:
```
Service Root Directory "/opt/render/project/src/server" is missing.
```

---

## 🎯 **الحل: تحديث Settings يدوياً**

### **Render قد لا يقرأ `render.yaml` تلقائياً**

الحل: تحديث Settings يدوياً!

---

## 📝 **الخطوات:**

### **1. اذهب إلى Settings:**

في Render Dashboard:
- Service `anda-chao-backend`
- اضغط **"Settings"** في الـ Sidebar الأيسر

---

### **2. Build & Deploy Section:**

ابحث عن قسم **"Build & Deploy"**

---

### **3. Root Directory:**

- ابحث عن حقل **"Root Directory"**
- **احذف كل شيء**
- **اتركه فارغاً تماماً** ✅
- **لا تكتب `server` ولا `src/server`**

---

### **4. Build Command:**

- ابحث عن حقل **"Build Command"**
- **احذف كل شيء**
- اكتب بالضبط:
  ```
  cd server && npm install && npx prisma generate && npm run build
  ```

---

### **5. Start Command:**

- ابحث عن حقل **"Start Command"**
- **احذف كل شيء**
- اكتب بالضبط:
  ```
  cd server && npm start
  ```

---

### **6. Save Changes:**

- اضغط **"Save Changes"** في أسفل الصفحة

---

## ✅ **بعد Save:**

### **Render سيستخدم:**

- ✅ Root Directory: فارغ (لا `src/` ولا شيء)
- ✅ Build Command: `cd server && npm install && npx prisma generate && npm run build`
- ✅ Start Command: `cd server && npm start`

---

## 🚀 **الخطوة التالية - Manual Deploy:**

### **بعد Save:**

1. ارجع إلى **"Events"** أو الصفحة الرئيسية
2. اضغط **"Manual Deploy"**
3. اضغط **"Deploy latest commit"**
4. Build سيعمل! 🎉

---

## 📋 **ملخص القيم:**

```
Root Directory: (فارغ تماماً)
Build Command: cd server && npm install && npx prisma generate && npm run build
Start Command: cd server && npm start
```

---

**اذهب إلى Settings وطبّق هذه القيم يدوياً!** 🔧

