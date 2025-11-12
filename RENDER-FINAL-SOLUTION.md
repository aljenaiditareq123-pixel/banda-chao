# 🔧 الحل النهائي - Render Root Directory

## ⚠️ **المشكلة المستمرة:**

Render يبحث عن `/opt/render/project/src/server` بدلاً من `/opt/render/project/server`

```
Service Root Directory "/opt/render/project/src/server" is missing.
cd: /opt/render/project/src/server: No such file or directory
```

---

## 💡 **السبب:**

Render يضيف `src/` تلقائياً عندما يكون `Root Directory` فارغاً أو غير محدد!

---

## ✅ **الحل النهائي:**

### **الخيار 1: استخدام `.` في Root Directory**

بدلاً من فارغ، استخدم `.` (نقطة) لتعني الجذر الحالي.

---

### **الخيار 2: تحديث Settings يدوياً (الأفضل)**

تحديث Settings يدوياً في Render Dashboard مباشرة.

---

## 🎯 **الحل: تحديث Settings يدوياً**

### **الخطوات:**

#### **1. اذهب إلى Settings:**

- Render Dashboard
- Service `anda-chao-backend`
- اضغط **"Settings"** في الـ Sidebar

---

#### **2. Build & Deploy Section:**

- ابحث عن **"Build & Deploy"**

---

#### **3. Root Directory:**

**الخيار الأفضل:**
- اكتب: `.` (نقطة واحدة فقط)
- أو اتركه فارغاً تماماً

**إذا استمرت المشكلة:**
- اكتب: `./` 
- أو اكتب: `server` (لكن بدون `src/`)

---

#### **4. Build Command:**

```
cd server && npm install && npx prisma generate && npm run build
```

---

#### **5. Start Command:**

```
cd server && npm start
```

---

#### **6. Save Changes:**

- اضغط **"Save Changes"**

---

## 🔄 **حل بديل: حذف وإعادة إنشاء Service**

### **إذا استمرت المشكلة:**

1. **حذف Service الحالي:**
   - Settings → Danger Zone → Delete Service

2. **إنشاء Service جديد:**
   - New → Web Service
   - Connect GitHub Repository
   - Render سيقرأ `render.yaml` تلقائياً عند الإنشاء الأول

---

## 📋 **القيم الصحيحة (جربها بالترتيب):**

### **المحاولة 1:**
```
Root Directory: . (نقطة)
Build Command: cd server && npm install && npx prisma generate && npm run build
Start Command: cd server && npm start
```

### **المحاولة 2:**
```
Root Directory: (فارغ تماماً)
Build Command: cd server && npm install && npx prisma generate && npm run build
Start Command: cd server && npm start
```

### **المحاولة 3:**
```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

## ✅ **بعد Save:**

1. **Manual Deploy** → **"Deploy latest commit"**
2. راقب الـ Logs
3. إذا نجح → احفظ القيم
4. إذا فشل → جرّب المحاولة التالية

---

**جرب المحاولة 1 أولاً!** 🔧


