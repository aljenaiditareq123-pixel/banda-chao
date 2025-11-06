# 🔧 إصلاح الأوامر في Render - حذف `server/ $`

**المشكلة:** Build Command و Start Command يحتويان على `server/ $` في البداية ❌

---

## 🔍 **المشكلة:**

في نافذة "Verify Settings":
- ✅ **Root Directory:** `server` (صحيح)
- ❌ **Build Command:** `server/ $ npm install --legacy-peer-deps && npm run build` (خطأ)
- ❌ **Start Command:** `server/ $ npm start` (خطأ)

**السبب:** Render يضيف `server/ $` تلقائياً، لكن يجب حذفه لأن Root Directory مضبوط على `server` بالفعل.

---

## 🔧 **الحل:**

### **الخطوة 1: إصلاح Build Command**

في نافذة "Verify Settings":

**Build Command الحالي (خطأ):**
```
server/ $ npm install --legacy-peer-deps && npm run build
```

**Build Command الصحيح:**
```
npm install --legacy-peer-deps && npm run build
```

**الخطوات:**
1. في حقل **"Build Command"**
2. **احذف** `server/ $ ` من البداية
3. **اترك** فقط: `npm install --legacy-peer-deps && npm run build`

---

### **الخطوة 2: إصلاح Start Command**

في نفس النافذة:

**Start Command الحالي (خطأ):**
```
server/ $ npm start
```

**Start Command الصحيح:**
```
npm start
```

**الخطوات:**
1. في حقل **"Start Command"**
2. **احذف** `server/ $ ` من البداية
3. **اترك** فقط: `npm start`

---

### **الخطوة 3: حفظ التغييرات**

1. بعد إصلاح Build Command و Start Command
2. اضغط على **"Update Fields"** (الزر الأسود في الأسفل)
3. Render سيبدأ Deploy تلقائياً

---

## ✅ **الإعدادات الصحيحة النهائية:**

| الإعداد | القيمة الصحيحة |
|---------|----------------|
| **Root Directory** | `server` |
| **Build Command** | `npm install --legacy-peer-deps && npm run build` |
| **Start Command** | `npm start` |

---

## 🔍 **لماذا يجب حذف `server/ $`؟**

- ✅ Root Directory مضبوط على `server`
- ✅ Render يعمل بالفعل داخل مجلد `server`
- ❌ `server/ $` في البداية قد يسبب أخطاء في التنفيذ

---

## 📝 **ملخص الخطوات:**

1. ✅ **Root Directory:** `server` (صحيح - لا تغيره)
2. ✅ **Build Command:** احذف `server/ $ ` من البداية
3. ✅ **Start Command:** احذف `server/ $ ` من البداية
4. ✅ اضغط على **"Update Fields"**

---

## 🎯 **النتيجة المتوقعة:**

بعد إصلاح الأوامر:
- ✅ Render سيبدأ Deploy تلقائياً
- ✅ Build سيعمل بشكل صحيح
- ✅ Backend سيبدأ بنجاح ✅

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **جاهز - يحتاج حذف `server/ $` من الأوامر**

