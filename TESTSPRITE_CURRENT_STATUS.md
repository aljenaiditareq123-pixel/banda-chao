# TestSprite - الحالة الحالية والتحديثات المطلوبة
# TestSprite - Current Status & Required Updates

**التاريخ:** ديسمبر 16, 2025  
**آخر تحديث:** بعد إصلاحات NextAuth و Admin Dashboard

---

## 📊 الحالة الحالية

### ✅ ما تم إصلاحه:

1. **Admin Dashboard Crash** ✅
   - تم إصلاح React error #310
   - تم إزالة `SessionProviderWrapper` 
   - تم استبدال `useSession` بـ `getSession()`
   - تم إصلاح `useOrders` hook (hardcode mode مؤقتاً)

2. **NextAuth Configuration** ✅
   - تم إصلاح `trustHost` error
   - تم تحديث environment variables (`AUTH_SECRET`, `AUTH_URL`)
   - تم تعطيل `EmailProvider` (يحتاج adapter)

3. **Authentication Flow** ✅
   - تسجيل الدخول يعمل عبر `/api/v1/auth/login`
   - JWT tokens تعمل بشكل صحيح
   - Founder email (`founder@banda-chao.com`) يحصل على role ADMIN تلقائياً

---

## ⚠️ تحديثات TestSprite المطلوبة

### 1. تحديث بيانات تسجيل الدخول

**المشكلة الحالية:**
- TestSprite يستخدم `user@example.com` و `password123`
- هذه البيانات غير موجودة في قاعدة البيانات

**الحل:**

#### Option A: استخدام Founder Account (موصى به)
```json
{
  "name": "User Login - Founder",
  "endpoint": "/api/v1/auth/login",
  "method": "POST",
  "authentication": "None",
  "requestBody": {
    "email": "founder@banda-chao.com",
    "password": "founder_password"
  },
  "expectedStatus": 200
}
```

#### Option B: إنشاء مستخدم تجريبي
1. سجل مستخدم جديد عبر `/api/v1/auth/register`:
```json
{
  "email": "test@bandachao.com",
  "password": "TestPassword123!",
  "name": "Test User"
}
```

2. ثم استخدم هذه البيانات في TestSprite

---

### 2. تحديث Frontend Tests

**المشكلة:**
- TestSprite يحاول اختبار `/admin/orders` كـ API endpoint
- `/admin/orders` هو frontend page (HTML) وليس API endpoint

**الحل:**

#### للـ Frontend Tests:
- **استخدم Browser Automation** (Playwright/Selenium)
- **لا تستخدم HTTP requests** للصفحات

#### للـ API Tests:
- استخدم `/api/v1/orders` (إذا كان موجوداً)
- أو استخدم `/api/v1/orders` من Backend مباشرة

---

### 3. تحديث Base URLs

**الحالة الحالية:**
```json
{
  "baseUrl": "https://banda-chao-backend.onrender.com"
}
```

**يجب التأكد من:**
- ✅ Backend URL: `https://banda-chao-backend.onrender.com`
- ✅ Frontend URL: `https://banda-chao-frontend.onrender.com`

---

## 🔧 إعدادات TestSprite المحدثة

### API Endpoints للاختبار:

#### 1. Health Check
```json
{
  "name": "Health Check",
  "endpoint": "https://banda-chao-backend.onrender.com/api/health",
  "method": "GET",
  "authentication": "None"
}
```

#### 2. User Login (Updated)
```json
{
  "name": "User Login - Founder",
  "endpoint": "https://banda-chao-backend.onrender.com/api/v1/auth/login",
  "method": "POST",
  "authentication": "None",
  "requestBody": {
    "email": "founder@banda-chao.com",
    "password": "founder_password"
  },
  "expectedStatus": 200,
  "expectedResponse": {
    "success": true,
    "token": "JWT token string",
    "user": {
      "id": "string",
      "email": "founder@banda-chao.com",
      "name": "string",
      "role": "FOUNDER"
    }
  }
}
```

#### 3. Get Current User (بعد Login)
```json
{
  "name": "Get Current User",
  "endpoint": "https://banda-chao-backend.onrender.com/api/v1/users/me",
  "method": "GET",
  "authentication": "Bearer Token",
  "note": "استخدم JWT token من Login response"
}
```

#### 4. Admin Orders (Frontend - Browser Test)
```json
{
  "name": "Admin Orders Page",
  "endpoint": "https://banda-chao-frontend.onrender.com/admin/orders",
  "method": "GET",
  "type": "Frontend Page (HTML)",
  "note": "يجب استخدام Browser Automation، ليس HTTP request",
  "expectedElements": [
    "Orders table",
    "Order status filters",
    "Order details"
  ]
}
```

---

## 🧪 خطوات اختبار TestSprite

### 1. اختبار Backend APIs:

```bash
# 1. Health Check
GET https://banda-chao-backend.onrender.com/api/health

# 2. Login
POST https://banda-chao-backend.onrender.com/api/v1/auth/login
Body: {
  "email": "founder@banda-chao.com",
  "password": "founder_password"
}

# 3. Get User (باستخدام token من الخطوة 2)
GET https://banda-chao-backend.onrender.com/api/v1/users/me
Headers: {
  "Authorization": "Bearer {token}"
}
```

### 2. اختبار Frontend Pages:

**يجب استخدام Browser Automation:**

```javascript
// Playwright Example
const page = await browser.newPage();

// Navigate to login
await page.goto('https://banda-chao-frontend.onrender.com/ar/auth/signin');

// Fill login form
await page.fill('input[type="email"]', 'founder@banda-chao.com');
await page.fill('input[type="password"]', 'founder_password');
await page.click('button[type="submit"]');

// Wait for redirect
await page.waitForURL('**/admin/orders');

// Check if orders page loaded
const ordersTable = await page.locator('table').isVisible();
expect(ordersTable).toBe(true);
```

---

## 📝 ملاحظات مهمة

### 1. Authentication:
- ✅ Backend APIs تستخدم JWT tokens
- ✅ Frontend يستخدم NextAuth + JWT
- ✅ Founder email يحصل على ADMIN role تلقائياً

### 2. Admin Dashboard:
- ✅ تم إصلاح crash في `/admin/orders`
- ✅ البيانات حالياً hardcoded (مؤقت)
- ⚠️ يجب استعادة API fetching بعد التأكد من عمل الواجهة

### 3. Test Data:
- ⚠️ تأكد من وجود المستخدم في قاعدة البيانات قبل الاختبار
- ✅ يمكن استخدام `founder@banda-chao.com` للاختبارات
- ⚠️ أو أنشئ مستخدم تجريبي جديد

---

## 🚀 الخطوات التالية

1. **تحديث TestSprite Configuration:**
   - ✅ تحديث login credentials
   - ✅ تحديث base URLs
   - ✅ إضافة Browser Automation tests للـ Frontend

2. **اختبار Admin Dashboard:**
   - ✅ تأكد من عمل `/admin/orders` بدون crash
   - ⏳ استعادة API fetching بعد التأكد

3. **اختبار Authentication Flow:**
   - ✅ Login via Backend API
   - ✅ Access Admin Dashboard
   - ✅ Verify role permissions

---

## 📞 للمساعدة

إذا واجهت مشاكل في TestSprite:
1. تحقق من أن Backend يعمل: `https://banda-chao-backend.onrender.com/api/health`
2. تحقق من أن Frontend يعمل: `https://banda-chao-frontend.onrender.com`
3. تحقق من بيانات تسجيل الدخول في قاعدة البيانات
4. استخدم Browser DevTools لفحص Network requests

---

**آخر تحديث:** ديسمبر 16, 2025  
**الحالة:** ✅ جاهز للاختبار بعد التحديثات

