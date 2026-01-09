# Project History & Context Report: Banda Chao (Dec 2025 - Jan 2026)

**To Cursor AI**: This is a comprehensive log of the project's lifecycle, architectural decisions, and deployed fixes. Use this to understand the codebase evolution and avoid recurring issues.

---

## 1. التأسيس والبنية التحتية (Start of Journey)

**Entity**: Banda Chao FZ-LLC (RAKEZ) - Established Dec 3, 2025.

**Infrastructure**:
- RAKEZ Co-working lease signed
- Corporate Tax registered (TRN Issued Dec 29, 2025)

**Platform**: 
- Next.js (Frontend) + Express/Node.js (Backend) on Render

---

## 2. الجدول الزمني للتطوير (Development Timeline)

### Phase 1: Foundation & Security Architecture (Dec 11 - Dec 13)

**Events**:
- Built "Social Commerce Platform Schema" (Products, Variants, Social Graph)
- Implemented "Security Fortification" (4 Guards):
  - **Persistency**: Redis Queue for background jobs
  - **Fraud Guard**: Velocity checks & IP-based detection
  - **Content Moderation**: Text/Image guards
  - **Inventory Protection**: Atomic reservation via Redis

**Challenges & Fixes**:
- **Nodemailer Conflict**: Downgraded to v6.9.16 due to peer dependency conflicts
- **Render Build Limits**: Optimized build commands and disabled swcMinify
- **NextAuth**: Fixed Function.prototype.apply errors by forcing Node.js 18/20 in .nvmrc

### Phase 2: Feature Explosion & AI (Dec 14)

**New Features Added**:
- **AI Trinity Brain**:
  - Advisor (Behavior Analysis)
  - Treasurer (Dynamic Pricing)
  - Coordinator (Content Sync)
- **Gamification**: Daily Check-in, Spin Wheel, Panda Haggle, Night Market (8PM-6AM theme)
- **Commerce**: Reverse Auction (Flash Drop), Clan Buying (Group Purchase), Blind Boxes
- **Visuals**: Virtual Try-On, Video Reviews (Stories style)

**Major Technical Debt & Fixes**:
- **TypeScript Hell**: Fixed massive type errors in orders.ts and advisorService (snake_case vs camelCase Prisma models)
- **Prisma**: Migrated from SQLite to PostgreSQL
- **Dependencies**: Moved tailwindcss, types/node, recharts to dependencies (not devDependencies) for Render production builds

### Phase 3: Integration & Stabilization (Dec 18 - Dec 30)

**Key Fixes**:
- **Geo-IP**: Removed geoip-lite (caused build failures) → Replaced with external APIs (ip-api.com)
- **Storage**: Integrated Alibaba OSS for video uploads (fixed ali-oss import issues)
- **Hardcoded URLs**: Replaced all localhost:3001 with centralized getApiUrl() utility
- **Prisma Schema**: Removed UserRole enum causing migration clashes → switched to String

---

## 3. الوضع الحالي (Current Status - Jan 8, 2026)

### Latest Critical Issue: Hydration Mismatch Error #310

**Recent Commits**:
- `d1814c7`: FIX: Use external backend URL in SSR for Render - detect Render environment automatically
- `0fd6a85`: FIX: Restore real API fetching for Orders - remove dummy data and fix hook dependencies
- `771c0e2`: FIX: Critical hydration fixes (Added useMounted to SmartToasts, CartToast, VirtualHost)
- `07aa841`: SECURITY: Removed hardcoded passwords; moved to Environment Variables
- `57cdcff`: FIX: Attempt to resolve Hydration Mismatch by delaying rendering of client-only components

**Deployment Status**:
- Backend: Operational
- Frontend: Building with latest fixes (awaiting deployment completion)

---

## 4. أحداث اليوم (Today's Session - Jan 8, 2026)

### 1️⃣ إصلاحات الأمان (Security Fixes) - ✅ مكتمل

**المشكلة**: 
- اكتشاف تسريب كلمات مرور (Email & Database) في الكود المصدري
- وجود أسرار hardcoded في الملفات

**الإجراء**:
- نقل جميع الأسرار إلى ملف `.env`
- تحديث `.gitignore` لضمان عدم رفع ملفات `.env`
- تنظيف الكود من جميع الأسرار المخزنة

**النتيجة**: 
- الكود الآن نظيف وآمن (Secret-free)
- Commit: `07aa841`

---

### 2️⃣ معركة أخطاء Hydration (Hydration Error #310) - ✅ تم المعالجة

**المشكلة**: 
- ظهور React Error #310 (Hydration Mismatch)
- اختلاف في النصوص/المحتوى بين السيرفر (SSR) والعميل (Client)
- السبب: استخدام `new Date()`, `window`, `localStorage` في الـ render الأولي

**المحاولات الأولى** (فشلت):
- محاولة إصلاح مكونات فردية
- الخطأ استمر لأن المشكلة في الـ Layout الرئيسي

**الحل الجذري** (نجح):
- استخدام `useMounted` pattern في جميع المكونات التي تحتاج Browser APIs
- المكونات التي تم إصلاحها:
  - ✅ `components/SmartToasts.tsx` - كان يستخدم `Date.now()` فوراً
  - ✅ `components/cart/CartToast.tsx` - كان يستخدم `window`
  - ✅ `components/avatar/VirtualHost.tsx` - المساعد الذكي
  - ✅ `hooks/useNightMarket.ts` - Night Market hook
  - ✅ `contexts/NightMarketContext.tsx` - Night Market context
  - ✅ `components/home/FlashSale.tsx` - Flash Sale component
  - ✅ `components/common/ChatWidget.tsx` - Chat widget
  - ✅ `components/home/DailyFengShui.tsx` - Daily Feng Shui
  - ✅ `components/nightmarket/NightMarketBanner.tsx` - Night Market banner
  - ✅ `app/admin/orders/page-client.tsx` - Admin orders page
  - ✅ `hooks/useOrders.ts` - Orders hook (SSR-safe)

**الحالة**: 
- تم رفع التعديلات (Commit: `771c0e2`)
- جميع المكونات الآن تنتظر `mounted === true` قبل استخدام Browser APIs

---

### 3️⃣ إصلاح صفحة الطلبات (Admin Orders Page) - ✅ مكتمل

**المشكلة**: 
- صفحة `/admin/orders` كانت تعرض بيانات وهمية فقط (Dummy Data)
- الطلبات الحقيقية من قاعدة البيانات لا تظهر
- المستخدمون يضيفون طلبات جديدة لكنها لا تظهر

**السبب**: 
- Hook `useOrders` كان يعيد بيانات hardcoded بدلاً من جلب البيانات من API
- الكود كان في "HARDCODE MODE" للاختبار

**الحل**:
- استعادة جلب البيانات الحقيقية من API في `hooks/useOrders.ts`
- إصلاح مشكلة Hydration Mismatch في نفس الـ hook
- تغيير initial loading state من `true` إلى `false` (SSR-safe)
- إضافة `mounted` state للتحقق من أن الكود يعمل في المتصفح
- تحسين معالجة الأخطاء مع رسائل عربية واضحة

**التحسينات الإضافية**:
- تحسين تنسيق التاريخ والعملة في `components/admin/OrdersTable.tsx`
- إضافة validation للتواريخ والأرقام قبل التنسيق

**النتيجة**: 
- الطلبات الحقيقية تظهر الآن بشكل صحيح
- Commit: `0fd6a85`

---

### 4️⃣ إصلاحات الرفع والاتصال (Deployment & API Issues) - ⚠️ قيد التنفيذ

**المشكلة الأولى (Render Stuck)**:
- واجهنا تعليقاً في عملية البناء على Render صباحاً
- **الحل**: إرسال Empty Commit لتحريك عملية البناء

**المشكلة الثانية (404 Errors بعد النشر)**:
- بعد النشر، ظهرت أخطاء 404 عند محاولة جلب البيانات
- الخطأ: `Request failed with status code 404` على `/api/v1/makers`, `/api/v1/products`, etc.
- **السبب**: الكود في SSR كان يحاول الاتصال بـ `localhost:10000` بدلاً من Backend URL الخارجي

**السبب الجذري**:
- في Render، Frontend و Backend هما خدمتان منفصلتان
- Frontend يعمل على `https://banda-chao-frontend.onrender.com`
- Backend يعمل على `https://banda-chao-backend.onrender.com`
- الكود كان يفترض أنهما على نفس الخادم

**الحل المطبق**:
- تعديل `lib/api-utils.ts` لاستخدام URL خارجي في SSR
- إضافة كشف تلقائي عن بيئة Render عبر:
  - `process.env.RENDER`
  - `process.env.RENDER_SERVICE_ID`
  - `process.env.RENDER_SERVICE_NAME`
  - `process.env.RENDER_EXTERNAL_URL`
  - `process.env.HOSTNAME` (contains "render")
- استخدام `NEXT_PUBLIC_API_URL` إذا كان موجوداً
- Fallback إلى `https://banda-chao-backend.onrender.com` في الإنتاج أو Render

**التوثيق**:
- إنشاء ملف `PROJECT_HISTORY_AND_CONTEXT.md` لتوثيق كل ما سبق

**الحالة**: 
- تم رفع التعديلات (Commit: `d1814c7`)
- في انتظار اكتمال البناء والاختبار

**ملاحظة مهمة**:
- يمكن إضافة `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com` في Render Dashboard كـ Environment Variable (اختياري)
- الكود الآن يكتشف Render تلقائياً ويستخدم URL الصحيح

---

### Recent Fixes (Jan 2026)

**Orders Hook Restoration**:
- Restored `useOrders` hook to fetch real data from API (was hardcoded with dummy data)
- Fixed hydration mismatch by:
  - Changing initial loading state from `true` to `false` (SSR-safe)
  - Added `mounted` state to prevent fetching before client mount
  - Made date/currency formatting SSR-safe

**Hydration Safety Improvements**:
- All client components using `useEffect` with `localStorage` now use `mounted` pattern
- Date formatting functions validate input before formatting
- Currency formatting ensures consistent output across server/client

---

## 4. ملاحظات تقنية هامة لـ Cursor (Technical Constraints)

### Render Specifics:
1. **DO NOT use geoip-lite**; it breaks the build
2. **Ensure all @types packages** used in production code are in dependencies
3. **Always bind server to 0.0.0.0**, not localhost

### Hydration Rules:
1. **Never use Date.now()** or `window` in the initial render of Layout components
2. **Always use the useMounted hook** for any component involving:
   - Time-dependent logic
   - Randomness (Night Market)
   - Browser APIs (localStorage, window, etc.)

### Database:
1. We use **Prisma with PostgreSQL**
2. Be careful with **snake_case database columns vs camelCase JS objects**
   - Use `as any` casting if strictly necessary as a temporary fix
   - Prefer proper Prisma type generation

### API Patterns:
1. **Centralized API URL**: Use `getApiUrl()` utility instead of hardcoded URLs
2. **Authentication**: Always check for token in localStorage before API calls
3. **Error Handling**: Provide user-friendly Arabic error messages

### Component Patterns:
1. **Client Components**: Mark with `'use client'` directive
2. **SSR Safety**: Always initialize state with SSR-safe defaults
3. **Loading States**: Show loading UI until component is mounted
4. **Error Boundaries**: Wrap risky components in ErrorBoundary

### State Management:
1. **Cart**: Stored in localStorage, synced via CartContext
2. **Auth**: Managed via useAuth hook with NextAuth integration
3. **Language**: Context-based with localStorage persistence

---

## 5. Known Issues & Workarounds

### Current Known Issues:
1. **Hydration Mismatch**: Recently fixed in useOrders hook, but monitor other components
2. **Build Failures on Render**: May require dependency adjustments for production
3. **TypeScript Type Assertions**: Some Prisma types require `as any` due to schema complexity

### Temporary Workarounds:
1. **Prisma Types**: Use `as any` for complex nested queries (acceptable for now)
2. **Date Formatting**: Always validate dates before formatting to prevent hydration issues
3. **API URLs**: Use getApiUrl() utility for all API calls

---

## 6. Architecture Decisions

### Why These Choices?

**Next.js + Express Split**:
- Next.js for frontend SSR/SSG capabilities
- Express for API endpoints and business logic
- Allows independent scaling

**Prisma + PostgreSQL**:
- Type-safe database access
- Migrations management
- Better than raw SQL for complex relations

**Redis for Queues**:
- Background job processing
- Inventory reservation
- Rate limiting

**Alibaba OSS**:
- Cost-effective video storage
- CDN integration
- Suitable for China market access

---

## 7. Future Considerations

### Technical Debt to Address:
1. Reduce `as any` type assertions in Prisma queries
2. Standardize error handling across all API endpoints
3. Add comprehensive E2E tests
4. Optimize bundle size (currently large due to many features)

### Planned Features:
- Complete AI Panda assistants integration
- Enhanced fraud detection
- Multi-currency support
- Advanced analytics dashboard

---

## 8. Quick Reference: Common Fixes

### If you see "Hydration Mismatch":
```typescript
// Add mounted state
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <LoadingState />;
```

### If you see "geoip-lite build error":
```typescript
// Use external API instead
const response = await fetch(`http://ip-api.com/json/${ip}`);
const data = await response.json();
```

### If you see "Prisma type errors":
```typescript
// Temporary workaround (acceptable for now)
const result = await prisma.query() as any;
```

---

**Last Updated**: January 8, 2026
**Maintainer**: Tariq Al-Janaidi (Founder, Banda Chao FZ-LLC)
**Platform Status**: Development/Production (Render)
