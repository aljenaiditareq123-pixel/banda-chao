# 🧪 كيفية اختبار Login - خطوة بخطوة

**تاريخ:** 28 ديسمبر 2024

---

## 📋 خطوات الاختبار السريع:

### 1️⃣ **افتح Login Page:**

```
https://banda-chao.onrender.com/ar/login
```

---

### 2️⃣ **أدخل البيانات:**

- **Email field (البريد الإلكتروني):**
  ```
  founder@bandachao.com
  ```

- **Password field (كلمة المرور):**
  ```
  123456
  ```

---

### 3️⃣ **اضغط زر "تسجيل الدخول" (Login button)**

---

### 4️⃣ **راقب ما يحدث:**

#### ✅ **إذا نجح:**
- ستنتقل للصفحة الرئيسية
- سترى رسالة ترحيب
- يمكنك الوصول لـ Admin

#### ❌ **إذا ظهر خطأ:**

**أ) "Server configuration error: JWT_SECRET is missing":**
- **الحل:** أعد تشغيل Backend Service (`banda-chao`)

**ب) "Invalid email or password":**
- **التحقق:**
  - تأكد من Email: `founder@bandachao.com`
  - تأكد من Password: `123456`
  - تأكد من عدم وجود مسافات إضافية

---

## 🔍 طريقة متقدمة: اختبار API مباشرة

يمكنك اختبار Login API مباشرة من Browser Console:

1. اضغط **F12** في المتصفح
2. اذهب إلى **Console** tab
3. انسخ والصق هذا الكود:

```javascript
fetch('https://banda-chao.onrender.com/api/v1/auth/login', {
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
  console.log('✅ Response:', data);
  if (data.success) {
    console.log('✅ Login successful!');
    console.log('Token:', data.token);
  } else {
    console.error('❌ Login failed:', data.error || data.message);
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
```

4. اضغط **Enter**
5. راقب النتيجة في Console

---

## ✅ ما يجب أن تراه في Console:

### ✅ **إذا نجح:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "founder@bandachao.com",
    "role": "FOUNDER"
  }
}
```

### ❌ **إذا فشل بسبب JWT_SECRET:**
```json
{
  "success": false,
  "error": "Server configuration error: JWT_SECRET is missing"
}
```

### ❌ **إذا فشل بسبب Email/Password:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 🎯 الخلاصة:

**جرّب Login الآن باستخدام:**
- **URL:** `https://banda-chao.onrender.com/ar/login`
- **Email:** `founder@bandachao.com`
- **Password:** `123456`

**إذا ظهر خطأ "JWT_SECRET is missing":**
- أعد تشغيل Backend Service (`banda-chao`)

---

**🚀 جرّب الآن وأخبرني بالنتيجة!** ✅
