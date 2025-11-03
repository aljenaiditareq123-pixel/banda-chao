# ⚠️ Build فشل - إصلاح Settings

## ❌ **الخطأ:**

```
Service Root Directory "/opt/render/project/src/ server" is missing.
```

---

## 🔧 **الحل:**

### **1. أغلق Pop-up:**

#### **نافذة "Debug build issues with AI":**
- اضغط **"Dismiss"** لإغلاقها
- (أو اضغط خارج النافذة)

---

### **2. اذهب إلى Settings:**

#### **في الشريط الجانبي الأيسر:**
- تحت **"banda-chao-backend"**
- اضغط **"Settings"** (⚙️ أيقونة الترس)
- سيفتح صفحة Settings

---

### **3. عدّل Build Command:**

#### **ابحث عن قسم "Build & Deploy":**
- ابحث عن حقل **"Build Command"**

#### **القيمة الحالية (خطأ):**
```
cd server && npm install && npm run build
```

#### **غيّرها إلى (صحيح):**
```
npm install && npm run build
```

---

### **4. عدّل Start Command:**

#### **في نفس القسم:**
- ابحث عن حقل **"Start Command"**

#### **القيمة الحالية (خطأ):**
```
cd server && npm start
```

#### **غيّرها إلى (صحيح):**
```
npm start
```

---

### **5. Save Changes:**

#### **في أسفل الصفحة:**
- ابحث عن زر **"Save Changes"**
- اضغط عليه
- Render سيبدأ Build جديد تلقائياً

---

## ✅ **بعد Save:**

### **Render سيبدأ:**
1. ✅ Cancel Build القديم (إن لزم)
2. ✅ Start Build جديد
3. ✅ Install Dependencies
4. ✅ Build Project
5. ⚠️ **قد يفشل Build** لأنه يحتاج Database URL
6. لا مشكلة - سننشئ Database ونضيف Variables

---

## 📝 **ملخص:**

1. ✅ **Dismiss** Pop-up
2. ✅ **Settings** (الشريط الجانبي)
3. ✅ **Build Command:** `npm install && npm run build`
4. ✅ **Start Command:** `npm start`
5. ✅ **Save Changes**
6. ✅ انتظر Build جديد

---

**أغلق Pop-up واذهب إلى Settings الآن!** 🔧

