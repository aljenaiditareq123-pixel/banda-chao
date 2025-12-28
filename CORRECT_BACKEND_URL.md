# ✅ URL الصحيح للـ Backend API

**تاريخ:** 28 ديسمبر 2024

---

## ⚠️ المشكلة المكتشفة:

عند اختبار Login API، الطلب أرسل إلى URL خاطئ:

### ❌ **URL خاطئ:**
```
https://banda-chao.onrender.com/api/v1/auth/login
```
(هذا Frontend Service، ليس Backend)

---

## ✅ **URL الصحيح:**

### **Backend API URL:**
```
https://banda-chao-backend.onrender.com/api/v1/auth/login
```

---

## 🔍 **الفرق:**

- **Frontend Service:** `banda-chao-frontend` أو `banda-chao`
  - URL: `https://banda-chao.onrender.com` أو `https://banda-chao-frontend.onrender.com`
  - هذا هو Next.js Frontend (صفحات الويب)

- **Backend Service:** `banda-chao-backend`
  - URL: `https://banda-chao-backend.onrender.com`
  - هذا هو Express API Server (API endpoints)

---

## ✅ **اختبار Login من Browser Console:**

افتح Browser Console (F12) وانسخ هذا الكود:

```javascript
fetch('https://banda-chao-backend.onrender.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'founder@bandachao.com',
    password: '123456'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ Login successful!');
  } else {
    console.error('❌ Login failed:', data.error || data.message);
    if (data.error && data.error.includes('JWT_SECRET')) {
      console.log('⚠️ SOLUTION: Restart Backend Service (banda-chao-backend)');
    }
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
```

---

## 📋 **الروابط الصحيحة:**

### **Frontend (صفحات الويب):**
- Homepage: `https://banda-chao.onrender.com`
- Login Page: `https://banda-chao.onrender.com/ar/login`

### **Backend API:**
- Login API: `https://banda-chao-backend.onrender.com/api/v1/auth/login`
- Health Check: `https://banda-chao-backend.onrender.com/api/health`

---

## ✅ **الخلاصة:**

**استخدم `banda-chao-backend.onrender.com` للـ API calls** ✅

---

**🚀 جرّب Login من Browser Console باستخدام URL الصحيح!** ✅
