# 🌱 استخدام Seed API - تشغيل Seed عن بُعد

**دليل لاستخدام API endpoint لتشغيل Seed** ✅

---

## 📋 **المتطلبات:**

### **1. إضافة SEED_SECRET في Environment Variables:**

في Render Dashboard (Backend):
- **Key:** `SEED_SECRET`
- **Value:** أي مفتاح سري قوي (مثل: `my-super-secret-seed-key-2024`)

**⚠️ مهم:** استخدم مفتاح قوي وغير قابل للتخمين!

---

## 🚀 **الاستخدام:**

### **الطريقة 1: استخدام curl**

```bash
curl -X POST https://YOUR-BACKEND-URL.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR-SEED-SECRET"}'
```

**مثال:**
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "my-super-secret-seed-key-2024"}'
```

---

### **الطريقة 2: استخدام Postman**

1. **Method:** POST
2. **URL:** `https://YOUR-BACKEND-URL.onrender.com/api/v1/seed`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (JSON):**
   ```json
   {
     "secret": "YOUR-SEED-SECRET"
   }
   ```

---

### **الطريقة 3: استخدام JavaScript/TypeScript**

```javascript
const response = await fetch('https://YOUR-BACKEND-URL.onrender.com/api/v1/seed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    secret: 'YOUR-SEED-SECRET'
  })
});

const data = await response.json();
console.log(data);
```

---

## ✅ **النتيجة المتوقعة:**

### **نجاح (200):**
```json
{
  "success": true,
  "message": "Database seed completed successfully",
  "summary": {
    "users": 5,
    "videos": 10,
    "products": 15,
    "posts": 5
  }
}
```

### **خطأ - Secret غير صحيح (401):**
```json
{
  "success": false,
  "error": "Invalid secret key"
}
```

### **خطأ - Secret مفقود (400):**
```json
{
  "success": false,
  "error": "Secret key is required"
}
```

---

## 🔒 **الأمان:**

- ✅ **Secret Key:** يجب أن يكون قوياً وغير قابل للتخمين
- ✅ **HTTPS:** يتم إرسال الطلب عبر HTTPS
- ✅ **POST Only:** فقط POST requests مقبولة
- ✅ **Validation:** يتم التحقق من Secret قبل التنفيذ

---

## ⚠️ **تحذيرات:**

1. **سيتم مسح البيانات الموجودة!**
   - Seed سيمسح جميع البيانات الحالية
   - تأكد من عدم وجود بيانات مهمة

2. **لا تستخدم في Production بدون حذر!**
   - Seed مخصص للبيئات التطويرية/التجريبية
   - استخدمه بحذر في Production

3. **احفظ Secret Key بشكل آمن!**
   - لا تشارك Secret Key مع أي شخص
   - استخدم Environment Variables فقط

---

## 🎯 **الاستخدام الموصى به:**

1. **أضف SEED_SECRET في Render:**
   - Environment Variables → Add
   - Key: `SEED_SECRET`
   - Value: مفتاح قوي

2. **شغّل Seed:**
   ```bash
   curl -X POST https://YOUR-BACKEND-URL.onrender.com/api/v1/seed \
     -H "Content-Type: application/json" \
     -d '{"secret": "YOUR-SEED-SECRET"}'
   ```

3. **تحقق من النتيجة:**
   - افتح الموقع
   - ستجد 5 مستخدمين، 10 فيديوهات، 15 منتج

---

## 📝 **ملاحظات:**

- Seed يستغرق 10-30 ثانية للتنفيذ
- يمكنك تشغيل Seed عدة مرات (سيتم مسح البيانات القديمة)
- بعد Seed، يمكنك تسجيل الدخول بأي من الحسابات التجريبية

---

**🚀 جاهز للاستخدام!**


