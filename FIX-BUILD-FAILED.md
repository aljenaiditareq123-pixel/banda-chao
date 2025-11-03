# ⚠️ Build فشل - الحل السريع

## ❌ **الخطأ:**

```
Exited with status 1 while running your code
Node.js module loading error
```

---

## 🔧 **الحل:**

### **الخطوة 1: اذهب إلى Settings**

1. في الشريط الجانبي الأيسر
2. تحت `anda-chao-backend` (أو `banda-chao-backend`)
3. اضغط **"Settings"** (⚙️)

---

### **الخطوة 2: تحقق من Root Directory**

#### **في صفحة Settings:**

1. ابحث عن **"Root Directory"**
2. تأكد أنه: **`server`**
3. إذا كان فارغاً أو خاطئاً:
   - احذف كل شيء
   - اكتب: **`server`**

---

### **الخطوة 3: تحقق من Build Command**

#### **ابحث عن "Build Command":**

1. اضغط **"Edit"** (✏️)
2. **احذف كل شيء**
3. **اكتب بالضبط:**
   ```
   npm install && npx prisma generate && npm run build
   ```
4. **Save**

---

### **الخطوة 4: تحقق من Start Command**

#### **ابحث عن "Start Command":**

1. اضغط **"Edit"** (✏️)
2. **احذف كل شيء**
3. **اكتب بالضبط:**
   ```
   npm start
   ```
4. **Save**

---

### **الخطوة 5: Save Changes**

#### **في أسفل صفحة Settings:**

1. اضغط **"Save Changes"**
2. Render سيبدأ Build جديد تلقائياً

---

## ✅ **القيم الصحيحة:**

### **Root Directory:**
```
server
```

### **Build Command:**
```
npm install && npx prisma generate && npm run build
```

### **Start Command:**
```
npm start
```

---

## ⚠️ **مهم جداً:**

### **❌ لا تكتب:**
- ❌ `cd server && npm install` (لا حاجة لـ cd)
- ❌ `npm install && npm run build` (ناقص prisma generate)

### **✅ اكتب بالضبط:**
- ✅ `server` (Root Directory فقط)
- ✅ `npm install && npx prisma generate && npm run build` (Build Command كامل)
- ✅ `npm start` (Start Command فقط)

---

## 🗄️ **بعد Save (إذا استمر الفشل):**

### **السبب المحتمل:**
- ⚠️ يحتاج Database URL

### **الحل:**
1. **Create Database** أولاً
2. **Add Environment Variables**
3. **Redeploy**

---

## 📋 **ملخص:**

1. ✅ **Settings** → Root Directory = `server`
2. ✅ **Build Command** = `npm install && npx prisma generate && npm run build`
3. ✅ **Start Command** = `npm start`
4. ✅ **Save Changes**
5. ✅ **Create Database** (إذا استمر الفشل)
6. ✅ **Add Environment Variables**

---

**اذهب إلى Settings وأصلح الأوامر الآن!** 🔧

