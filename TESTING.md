# Testing Guide - Banda Chao

**تاريخ الإنشاء**: ديسمبر 2024  
**الهدف**: توثيق منظومة الاختبارات في مشروع Banda Chao

---

## 🧪 Testing Strategy

### Unit Tests
- **Backend**: اختبارات للـ API endpoints بشكل منفصل
- **Frontend**: اختبارات للمكونات (Components) بشكل منفصل

### Integration Tests
- **Backend**: اختبارات للـ API endpoints مع قاعدة البيانات
- **Frontend**: اختبارات للصفحات الكاملة مع mock data

### E2E Tests
- (مستقبلاً) اختبارات end-to-end باستخدام Playwright أو Cypress

---

## 🚀 Local Testing

### Backend Tests

**التشغيل:**
```bash
cd server
npm test              # تشغيل جميع الاختبارات
npm run test:watch    # تشغيل في وضع watch mode
npm run test:coverage # تشغيل مع coverage report
```

**الاختبارات المتوفرة:**
- `tests/health.test.ts` - Health check endpoint
- `tests/auth.test.ts` - Authentication endpoints (register, login, me)
- `tests/makers.test.ts` - Makers API endpoints
- `tests/products.test.ts` - Products API endpoints
- `tests/videos.test.ts` - Videos API endpoints
- `tests/404.test.ts` - 404 error handling

**مثال على تشغيل اختبار محدد:**
```bash
npm test -- tests/auth.test.ts
```

### Frontend Tests

**التشغيل:**
```bash
npm test              # تشغيل جميع الاختبارات
npm run test:watch    # تشغيل في وضع watch mode
npm run test:ui       # تشغيل مع UI (Vitest UI)
```

**الاختبارات المتوفرة:**
- `tests/home.test.tsx` - الصفحة الرئيسية
- `tests/makers-page.test.tsx` - صفحة قائمة الحرفيين
- `tests/founder-page.test.tsx` - صفحة المؤسس

**مثال على تشغيل اختبار محدد:**
```bash
npm test -- tests/home.test.tsx
```

---

## 📋 Test Coverage

### Backend Coverage
- ✅ Health check endpoint
- ✅ Authentication (register, login, me)
- ✅ Makers API (list, get by id, filters)
- ✅ Products API (list, get by id, filters)
- ✅ Videos API (list, get by id, filters)
- ✅ 404 error handling
- ✅ Validation errors (400)
- ✅ Authentication errors (401, 403)

### Frontend Coverage
- ✅ Home page rendering
- ✅ Makers page (loading, error, empty, data states)
- ✅ Founder console (KPIs, AI assistant)

### Payment Testing
- ⚠️ **تحذير**: اختبارات الدفع حالياً في وضع test mode فقط
- ⚠️ **مهم**: لا يجب استخدام مفاتيح Stripe production في الاختبارات
- ⚠️ **ملاحظة**: Webhook testing يحتاج Stripe CLI أو ngrok للـ local testing
- ✅ Checkout flow (started, completed, cancelled)
- ✅ Order creation and status updates

---

## 🔧 Test Configuration

### Backend (Vitest)
- **Config**: `server/vitest.config.ts`
- **Setup**: `server/tests/setup.ts`
- **Environment**: Node.js
- **Test Database**: يستخدم نفس قاعدة البيانات مع عزل واضح

### Frontend (Vitest + React Testing Library)
- **Config**: `vitest.config.ts`
- **Setup**: `tests/setup.ts`
- **Environment**: jsdom
- **Mocks**: Next.js router, localStorage

---

## 🐛 Bug Hunt Process

1. **تشغيل الاختبارات:**
   ```bash
   # Backend
   cd server && npm test
   
   # Frontend
   npm test
   ```

2. **فحص الأخطاء:**
   - أي اختبار يفشل يجب فحصه
   - إذا كان الكود هو المشكلة → إصلاح الكود
   - إذا كان الاختبار هو المشكلة → إصلاح الاختبار

3. **إضافة اختبارات جديدة:**
   - عند إضافة feature جديد، أضف اختبارات له
   - عند إصلاح bug، أضف اختبار يمنع تكراره

---

## 🌐 Third-Party Testing (External Tools)

### TestSprite & AI Testing Tools

المشروع مجهّز ليتم اختباره عبر أدوات خارجية مثل:
- **TestSprite**: منصة AI testing
- **Postman/Insomnia**: API testing
- **Playwright/Cypress**: E2E testing (مستقبلاً)

### كيفية الاستخدام:

1. **تشغيل المشروع محلياً:**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. **تشغيل على Staging:**
   - نشر Backend على Render (staging)
   - نشر Frontend على Vercel (staging)
   - استخدام URLs الـ staging في أدوات الاختبار

3. **ربط مع TestSprite:**
   - TODO: إضافة configuration لـ TestSprite
   - TODO: إضافة API keys و authentication
   - TODO: إعداد test suites في TestSprite

### API Endpoints للاختبار:

**Base URLs:**
- Local: `http://localhost:3001/api/v1`
- Staging: `https://banda-chao-staging.onrender.com/api/v1`
- Production: `https://banda-chao-backend.onrender.com/api/v1`

**Endpoints المتاحة:**
- `GET /health` - Health check
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (requires JWT)
- `GET /makers` - List makers
- `GET /products` - List products
- `GET /videos` - List videos
- `POST /ai/assistant` - AI assistant (requires FOUNDER role)

---

## 📊 Test Metrics

### Current Status:
- **Backend Tests**: ~30+ test cases
- **Frontend Tests**: ~10+ test cases
- **Coverage**: ~60-70% (تقريبي)

### Goals:
- [ ] زيادة coverage إلى 80%+
- [ ] إضافة E2E tests
- [ ] إضافة performance tests
- [ ] إضافة security tests

---

## 🛠️ Troubleshooting

### مشاكل شائعة:

1. **اختبارات Backend تفشل:**
   - تأكد من أن قاعدة البيانات تعمل
   - تأكد من أن `DATABASE_URL` صحيح
   - تأكد من أن migrations تم تشغيلها

2. **اختبارات Frontend تفشل:**
   - تأكد من تثبيت dependencies: `npm install`
   - تأكد من أن mocks تعمل بشكل صحيح

3. **TypeScript errors:**
   - شغّل `npm run type-check` للتحقق
   - أصلح أي أخطاء TypeScript قبل تشغيل الاختبارات

---

## 📝 Best Practices

1. **اكتب اختبارات قبل إصلاح bugs:**
   - هذا يضمن أن الـ bug لن يعود

2. **استخدم descriptive test names:**
   - مثال: `should return 400 if email is missing` بدلاً من `test 1`

3. **عزل الاختبارات:**
   - كل اختبار يجب أن يكون مستقل
   - لا تعتمد على ترتيب تشغيل الاختبارات

4. **استخدم mocks بحكمة:**
   - Mock فقط ما هو ضروري
   - تجنب over-mocking

5. **حافظ على الاختبارات بسيطة:**
   - اختبار واحد = سيناريو واحد
   - تجنب اختبارات معقدة جداً

---

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**آخر تحديث**: ديسمبر 2024

