# ⚡ إصلاح فوري: JWT_SECRET مفقود بعد Restart

**تاريخ:** 28 ديسمبر 2025 - 9:03 AM

---

## 🎯 المشكلة:

تم Restart Backend Service في 9:00 AM، لكن خطأ "JWT_SECRET is missing" لا يزال يظهر.

---

## ✅ الحل السريع (3 خطوات):

### 1️⃣ **افتح Environment Variables:**

1. Render Dashboard → **`banda-chao`** (Backend)
2. اضغط **"Environment"** في القائمة

---

### 2️⃣ **تحقق من JWT_SECRET:**

**ابحث عن:**
- Key: `JWT_SECRET`
- Value: يجب أن يكون string طويل (مثل: `Jk89sfd789ASFD789asfd789KLJ3241kjASDF789`)

**إذا كان مفقود:**
1. اضغط **"Add Environment Variable"**
2. Key: `JWT_SECRET`
3. Value: `Jk89sfd789ASFD789asfd789KLJ3241kjASDF789`
4. اضغط **"Save Changes"**

---

### 3️⃣ **Restart مرة أخرى:**

1. بعد إضافة/تحديث `JWT_SECRET`
2. اضغط **"Restart"**
3. انتظر **60 ثانية**
4. جرّب Login مرة أخرى

---

## 🔍 التحقق السريع:

بعد Restart، افتح Browser Console (F12) وانسخ:

```javascript
fetch('https://banda-chao-backend.onrender.com/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'founder@bandachao.com', password: '123456' })
})
.then(r => r.json())
.then(d => console.log(d.error ? '❌ ' + d.error : '✅ Login works!'));
```

---

**⏱️ الوقت المتوقع: 2-3 دقائق فقط**

**🚀 ابدأ الآن:** Render Dashboard → `banda-chao` → Environment ✅
