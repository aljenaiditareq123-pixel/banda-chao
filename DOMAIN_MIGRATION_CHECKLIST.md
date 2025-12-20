# 📋 قائمة تحقق ربط الدومين - Domain Migration Checklist
## ربط `bandachao.com` مع Render

**تاريخ:** 2025-01-20  
**الدومين الجديد:** `https://bandachao.com`  
**الدومين الحالي:** `https://banda-chao-frontend.onrender.com`

---

## ⚠️ **قبل ربط الدومين** (يجب إكمالها أولاً)

### 1. ✅ تحديث CORS في Backend Code

**الملف:** `server/src/index.ts`

**المشكلة الحالية:** CORS يسمح فقط بـ `.onrender.com` patterns

**الحل المطلوب:** إضافة `bandachao.com` للـ allowed origins

```typescript
const allowedOriginPatterns: (string | RegExp)[] = NODE_ENV === 'production'
  ? [
      FRONTEND_URL,
      'https://bandachao.com',  // ✅ أضف هذا
      'https://www.bandachao.com',  // ✅ أضف هذا أيضاً
      // ... existing patterns
    ].filter(Boolean)
  : [ /* ... */ ];
```

**الحالة:** ❌ **يجب تعديله الآن قبل الربط**

---

### 2. ✅ تحديث Socket.IO CORS

**الملف:** `server/src/realtime/socket.ts`

**المشكلة الحالية:** Socket.IO يستخدم `FRONTEND_URL` environment variable فقط

**الحل:** Socket.IO سيستخدم `FRONTEND_URL` الجديد تلقائياً بعد تحديث Environment Variable

**الحالة:** ✅ **لا يحتاج تعديل كود** (يعتمد على `FRONTEND_URL`)

---

### 3. ✅ تحديث Environment Variables في Render

#### Backend Service (`banda-chao-backend`):

**قبل الربط - لا تغير بعد:**
- ❌ `FRONTEND_URL` - اتركه على `https://banda-chao-frontend.onrender.com` مؤقتاً

**بعد الربط - يجب التغيير:**
- ✅ `FRONTEND_URL` → `https://bandachao.com`

#### Frontend Service (`banda-chao-frontend`):

**قبل الربط - لا تغير بعد:**
- ❌ `NEXT_PUBLIC_FRONTEND_URL` - اتركه على `https://banda-chao-frontend.onrender.com` مؤقتاً
- ❌ `NEXTAUTH_URL` / `AUTH_URL` - اتركه على `https://banda-chao-frontend.onrender.com` مؤقتاً

**بعد الربط - يجب التغيير:**
- ✅ `NEXT_PUBLIC_FRONTEND_URL` → `https://bandachao.com`
- ✅ `NEXTAUTH_URL` → `https://bandachao.com`
- ✅ `AUTH_URL` → `https://bandachao.com`

---

## 🔧 **أثناء ربط الدومين** (في Cloudflare)

### 4. ✅ إعداد DNS في Cloudflare

1. اذهب إلى Cloudflare Dashboard → DNS Settings
2. أضف CNAME record:
   - **Name:** `@` (أو `bandachao.com`)
   - **Target:** `banda-chao-frontend.onrender.com`
   - **Proxy:** ✅ Enabled (Orange Cloud)
3. أضف CNAME record للـ www:
   - **Name:** `www`
   - **Target:** `banda-chao-frontend.onrender.com`
   - **Proxy:** ✅ Enabled (Orange Cloud)

---

### 5. ✅ إعداد Custom Domain في Render

1. اذهب إلى Render Dashboard → Frontend Service → Settings
2. Custom Domains → Add Custom Domain
3. أدخل: `bandachao.com`
4. Render سيعطيك DNS records (استخدم CNAME من Cloudflare أعلاه)

---

## 🌐 **بعد ربط الدومين** (يجب إكمالها فوراً)

### 6. ✅ تحديث Environment Variables في Render

**Backend Service:**
```
FRONTEND_URL=https://bandachao.com
```

**Frontend Service:**
```
NEXT_PUBLIC_FRONTEND_URL=https://bandachao.com
NEXTAUTH_URL=https://bandachao.com
AUTH_URL=https://bandachao.com
```

**بعد التحديث:**
- ✅ اضغط "Save Changes"
- ✅ Render سيعيد نشر الخدمات تلقائياً

---

### 7. ✅ تحديث Google OAuth Redirect URIs

**في Google Cloud Console:**

1. اذهب إلى: https://console.cloud.google.com/apis/credentials
2. افتح OAuth 2.0 Client ID الخاص بك
3. في "Authorized redirect URIs" أضف:
   ```
   https://bandachao.com/api/auth/callback/google
   ```
4. **لا تحذف** URIs القديمة (`.onrender.com`) - قد تحتاجها للاختبار
5. احفظ التغييرات

---

### 8. ✅ تحديث Stripe Redirect URIs

**في Stripe Dashboard:**

1. اذهب إلى: https://dashboard.stripe.com/settings/applications
2. في "Redirect URIs" أضف:
   ```
   https://bandachao.com/api/auth/callback/stripe
   https://bandachao.com/checkout/success
   https://bandachao.com/checkout/cancel
   ```
3. **لا تحذف** URIs القديمة (`.onrender.com`) - قد تحتاجها للاختبار
4. احفظ التغييرات

---

## ✅ **قائمة التحقق النهائية**

### قبل الربط:
- [ ] ✅ تحديث CORS في `server/src/index.ts` لإضافة `bandachao.com`
- [ ] ✅ Commit و Push التغييرات
- [ ] ✅ Render يعيد بناء Backend بنجاح

### أثناء الربط:
- [ ] ✅ إعداد DNS في Cloudflare (CNAME records)
- [ ] ✅ إضافة Custom Domain في Render Dashboard
- [ ] ✅ التحقق من أن DNS propagation يعمل (يمكن استخدام `dig bandachao.com`)

### بعد الربط:
- [ ] ✅ تحديث `FRONTEND_URL` في Backend Service
- [ ] ✅ تحديث `NEXT_PUBLIC_FRONTEND_URL` في Frontend Service
- [ ] ✅ تحديث `NEXTAUTH_URL` و `AUTH_URL` في Frontend Service
- [ ] ✅ إعادة نشر الخدمات (Render سيفعل ذلك تلقائياً)
- [ ] ✅ تحديث Google OAuth Redirect URIs
- [ ] ✅ تحديث Stripe Redirect URIs
- [ ] ✅ اختبار الموقع على `https://bandachao.com`
- [ ] ✅ اختبار تسجيل الدخول بـ Google
- [ ] ✅ اختبار عملية الدفع (Stripe)
- [ ] ✅ التحقق من أن CORS يعمل (لا توجد أخطاء في Console)

---

## 📝 **ملاحظات مهمة**

### 1. ترتيب التحديثات:
- ✅ **أولاً:** تحديث CORS code و Commit
- ✅ **ثانياً:** ربط الدومين في Cloudflare و Render
- ✅ **ثالثاً:** تحديث Environment Variables
- ✅ **رابعاً:** تحديث OAuth Redirect URIs

### 2. DNS Propagation:
- قد يستغرق DNS propagation من 5 دقائق إلى 48 ساعة
- استخدم Cloudflare Proxy (Orange Cloud) لتسريع العملية
- تحقق من DNS: `dig bandachao.com` أو `nslookup bandachao.com`

### 3. Backward Compatibility:
- **لا تحذف** `.onrender.com` URLs من CORS - قد تحتاجها للاختبار
- **لا تحذف** `.onrender.com` Redirect URIs من Google/Stripe - للنسخ الاحتياطي

### 4. HTTPS:
- Render يوفر SSL تلقائياً للـ Custom Domains
- Cloudflare Proxy يوفر SSL أيضاً
- تأكد من أن HTTPS يعمل على `https://bandachao.com`

---

**تاريخ الإنشاء:** 2025-01-20  
**آخر تحديث:** 2025-01-20
