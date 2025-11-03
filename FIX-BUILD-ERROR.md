# ⚠️ خطأ في Build - إصلاح سريع

## ❌ **الخطأ:**

```
Service Root Directory "/opt/render/project/src/ server" is missing.
```

---

## 💡 **السبب:**

- ✅ **Root Directory:** تم تعيينه إلى `server` (صحيح)
- ❌ **Build Command:** يستخدم `cd server && ...` (خطأ!)
- ❌ **Start Command:** يستخدم `cd server && ...` (خطأ!)

**Render داخل `server` بالفعل، فلا نحتاج `cd server`!**

---

## 🔧 **الحل:**

### **1. اذهب إلى Settings:**

#### **في الشريط الجانبي الأيسر:**
- اضغط **"Settings"** (تحت قسم MONITOR)

---

### **2. Build Command:**

#### **ابحث عن حقل "Build Command":**
- **القيمة الحالية (خطأ):**
  ```
  cd server && npm install && npm run build
  ```

- **غيّرها إلى (صحيح):**
  ```
  npm install && npm run build
  ```

---

### **3. Start Command:**

#### **ابحث عن حقل "Start Command":**
- **القيمة الحالية (خطأ):**
  ```
  cd server && npm start
  ```

- **غيّرها إلى (صحيح):**
  ```
  npm start
  ```

---

### **4. Save Changes:**

#### **في أسفل الصفحة:**
- اضغط **"Save Changes"**
- Render سيبدأ Build جديد تلقائياً

---

## ✅ **بعد Save:**

### **Render سيبدأ:**
1. ✅ Clone Repository
2. ✅ Install Dependencies (`npm install`)
3. ✅ Build Project (`npm run build`)
4. ⚠️ **قد يفشل Build** لأنه يحتاج Database URL
5. لا مشكلة - سننشئ Database ونضيف Variables

---

## 📝 **الخطوات الكاملة:**

1. ✅ **Settings** → **Build Command** → `npm install && npm run build`
2. ✅ **Settings** → **Start Command** → `npm start`
3. ✅ **Save Changes**
4. ✅ انتظر Build جديد
5. ✅ (إذا فشل) Create Database
6. ✅ Add Environment Variables
7. ✅ Redeploy

---

**اذهب إلى Settings الآن وأصلح Build & Start Commands!** 🔧

