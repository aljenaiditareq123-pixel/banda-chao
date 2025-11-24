# Banda Chao - Social E-commerce Platform

منصة سوشيال-كومرس حديثة تجمع بين وسائل التواصل الاجتماعي والتجارة الإلكترونية مع دعم متعدد اللغات (الصينية، الإنجليزية، العربية).

## 🚀 المميزات

- **منصة اجتماعية**: مشاركة الفيديوهات (قصيرة وطويلة)، المنشورات، التعليقات، الإعجابات
- **تجارة إلكترونية**: قوائم المنتجات، سلة التسوق، الدفع، ملفات الحرفيين
- **تكامل الذكاء الاصطناعي**: مساعدات AI، تفاعل صوتي، وكلاء متخصصون
- **دعم متعدد اللغات**: الصينية (zh)، الإنجليزية (en)، العربية (ar)
- **PWA**: تطبيق ويب تقدمي مع دعم وضع عدم الاتصال

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS**
- **Axios** للتواصل مع API

### Backend
- **Express.js** (TypeScript)
- **Prisma** ORM
- **PostgreSQL** Database
- **JWT** Authentication
- **Multer** لرفع الملفات

## 📁 هيكل المشروع

```
banda-chao/
├── app/                    # Next.js App Router
│   ├── founder/           # صفحات المؤسس
│   └── globals.css        # الأنماط العامة
├── components/            # مكونات React
│   ├── founder/          # مكونات المؤسس
│   └── home/              # مكونات الصفحة الرئيسية
├── contexts/              # React Contexts
│   └── LanguageContext.tsx
├── hooks/                 # Custom Hooks
│   ├── useAuth.ts
│   └── useFounderKpis.ts
├── lib/                   # Utilities
│   └── api.ts            # API Client
├── types/                 # TypeScript Types
│   ├── founder.ts
│   └── index.ts
└── server/                # Backend Server
    ├── src/
    │   ├── api/          # API Routes
    │   ├── middleware/   # Middleware
    │   └── utils/        # Utilities
    └── prisma/           # Prisma Schema
```

## 🚀 البدء السريع

### المتطلبات
- **Node.js**: 18+ 
- **PostgreSQL**: 14+
- **npm** أو **yarn**

### التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd banda-chao
```

2. **تثبيت dependencies للـ Frontend**
```bash
npm install
```

3. **تثبيت dependencies للـ Backend**
```bash
cd server
npm install
```

4. **إعداد قاعدة البيانات**
```bash
# إنشاء ملف .env في مجلد server
cd server
cp .env.example .env

# تعديل DATABASE_URL في server/.env
# مثال: DATABASE_URL="postgresql://user:password@localhost:5432/banda_chao?schema=public"

# تشغيل migrations
npm run db:migrate
npm run db:generate

# (اختياري) تشغيل seed script لملء قاعدة البيانات ببيانات تجريبية
npm run db:seed
```

5. **إعداد Frontend Environment Variables**
```bash
# إنشاء ملف .env.local في الجذر
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

6. **تشغيل المشروع**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

المشروع سيكون متاحاً على:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1

#---

## 🛠️ Maker Dashboard

**For Artisans:**
- Access your dashboard at `/[locale]/maker/dashboard`
- Manage products, videos, and profile
- Track earnings and orders
- Use AI tools for pricing and content

**Getting Started:**
1. Register as a user
2. Go to `/[locale]/maker/join` to become a maker
3. Complete your profile
4. Start adding products!

**See**: `CREATOR_HANDBOOK.md` for detailed guide

---

## 💰 Monetization

**Commission Model:**
- 10% platform commission per sale
- 90% revenue to makers
- Automatic calculation

**See**: `MONETIZATION_STRATEGY.md` for full details

---

## 🌍 Globalization

**Supported:**
- Multi-currency (USD, AED, CNY, EUR, GBP)
- Multi-language (Arabic, English, Chinese)
- Time zone support
- RTL layout for Arabic

**See**: `GLOBALIZATION_STRATEGY.md` for expansion plan

---

## 🎬 Investor Demo Mode – How to Use It

### Quick Start

1. **Review Demo Flow**: 
   - Open `DEMO_FLOW.md` for the complete demo sequence
   - Follow the 7-step presentation guide

2. **Key Pages to Show**:
   - Home: `http://localhost:3000/ar` (or `/en`, `/zh`)
   - Makers: `http://localhost:3000/ar/makers`
   - Products: `http://localhost:3000/ar/products`
   - About: `http://localhost:3000/ar/about`
   - Founder Console: `http://localhost:3000/founder`

3. **Test Checkout**:
   - Go to any product page
   - Click "Buy (Test Mode)"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout flow

4. **Show Analytics**:
   - Open Developer Console
   - Show tracked events
   - Explain analytics system

### Investor Resources

- **Investor README**: See `INVESTOR_README.md` for business overview
- **Demo Flow**: See `DEMO_FLOW.md` for presentation guide
- **Beta Launch Plan**: See `BETA_LAUNCH_PLAN.md` for launch strategy

---

## 📝 ملاحظات مهمة:

- **صفحة المؤسس**: `/founder` و `/founder/assistant` دائماً بالعربية
- **اللغات المدعومة**: `/zh`, `/en`, `/ar`
- **Authentication**: JWT tokens في localStorage

---

## 🎬 Demo Walkthrough

### خطوات تشغيل المشروع:

1. **تشغيل Backend:**
   ```bash
   cd server
   npm install
   npm run db:migrate
   npm run db:seed  # لملء قاعدة البيانات ببيانات تجريبية
   npm run dev
   ```

2. **تشغيل Frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **زيارة الصفحات:**

   **للزوار:**
   - الصفحة الرئيسية: `http://localhost:3000/zh` (أو `/en` أو `/ar`)
   - قائمة الحرفيين: `http://localhost:3000/zh/makers`
   - قائمة المنتجات: `http://localhost:3000/zh/products`
   - قائمة الفيديوهات: `http://localhost:3000/zh/videos`
   - صفحة حرفي: `http://localhost:3000/zh/makers/[maker-id]`
   - صفحة منتج: `http://localhost:3000/zh/products/[product-id]`
   - صفحة فيديو: `http://localhost:3000/zh/videos/[video-id]`

   **للمؤسس:**
   - لوحة التحكم: `http://localhost:3000/founder`
   - مساعد AI: `http://localhost:3000/founder/assistant`

### تجربة المستخدم:

**1. كزائر (Visitor):**
- تصفح الصفحة الرئيسية ورؤية Featured Makers/Products/Videos
- استكشاف الحرفيين والمنتجات والفيديوهات
- زيارة صفحات التفاصيل لكل نوع من المحتوى
- التنقل بين الصفحات بسلاسة

**2. كمؤسس (Founder):**
- تسجيل الدخول بحساب FOUNDER
- زيارة `/founder` لرؤية:
  - KPIs (إجمالي الحرفيين، المنتجات، الفيديوهات، المستخدمين)
  - أحدث الحرفيين والمنتجات والفيديوهات
  - الباندا المستشار (AI Assistant) للتفاعل مع المنصة

**3. كحرفي (Maker):**
- تسجيل الدخول بحساب MAKER
- إنشاء/تحديث ملف الحرفي
- إضافة منتجات وفيديوهات (مستقبلاً)

### بيانات تجريبية:

بعد تشغيل `npm run db:seed`:
- **مؤسس**: `founder@bandachao.com` / `founder123`
- **حرفيون**: 5 حرفيين تجريبيين
- **منتجات**: 5-10 منتجات لكل حرفي
- **فيديوهات**: 3-5 فيديوهات لكل حرفي

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - تسجيل مستخدم جديد (validation: email, password min 6, name)
- `POST /api/v1/auth/login` - تسجيل الدخول (validation: email, password)
- `GET /api/v1/auth/me` - الحصول على المستخدم الحالي

### Users
- `GET /api/v1/users/me` - الحصول على المستخدم الحالي
- `GET /api/v1/users/:id` - الحصول على مستخدم بالـ ID
- `PUT /api/v1/users/:id` - تحديث المستخدم
- `POST /api/v1/users/avatar` - رفع صورة الملف الشخصي

### Makers
- `GET /api/v1/makers` - قائمة الحرفيين (pagination: page, pageSize, filters: country, language, search)
- `GET /api/v1/makers/:id` - تفاصيل حرفي
- `POST /api/v1/makers` - إنشاء/تحديث ملف الحرفي (MAKER role, validation)

### Products
- `GET /api/v1/products` - قائمة المنتجات (pagination, filters: status, category, makerId, search)
- `GET /api/v1/products/:id` - تفاصيل منتج
- `GET /api/v1/products/makers/:makerId` - منتجات حرفي معين

### Videos
- `GET /api/v1/videos` - قائمة الفيديوهات (pagination, filters: type, language, makerId, search)
- `GET /api/v1/videos/:id` - تفاصيل فيديو (increments views)
- `GET /api/v1/videos/makers/:makerId` - فيديوهات حرفي معين

### Posts
- `GET /api/v1/posts` - قائمة المنشورات (pagination, filters: type, makerId)
- `GET /api/v1/posts/:id` - تفاصيل منشور
- `GET /api/v1/posts/:id/comments` - تعليقات منشور

### Comments
- `GET /api/v1/comments` - تعليقات (targetType, targetId, pagination)
- `POST /api/v1/comments` - إنشاء تعليق (validation: targetType, targetId, content)

### Founder
- `GET /api/v1/founder/kpis` - الحصول على مؤشرات الأداء (FOUNDER فقط)
- `POST /api/v1/founder/chat` - محادثة مع AI Assistant (FOUNDER فقط)

### AI
- `POST /api/v1/ai/assistant` - AI Assistant (FOUNDER فقط, rate limited)

## 🔐 Authentication

المشروع يستخدم JWT للـ authentication:
1. تسجيل الدخول أو التسجيل للحصول على token
2. إرسال token في header: `Authorization: Bearer <token>`
3. Token يتم حفظه في `localStorage` تلقائياً

## 🌍 دعم اللغات

المشروع يدعم 3 لغات:
- **الصينية (zh)** - اللغة الافتراضية
- **الإنجليزية (en)**
- **العربية (ar)** - مع دعم RTL

استخدام:
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const { language, setLanguage, t } = useLanguage();
// t('key') للحصول على النص المترجم
```

## 🧪 التطوير

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## 📦 النشر

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Render/Railway)
1. ربط repository
2. إعداد environment variables
3. Deploy

## 📄 الترخيص

هذا المشروع خاص.

## 👥 المساهمون

- فريق Banda Chao

---

**ملاحظة**: هذا المشروع قيد التطوير النشط. قد تحتاج بعض الميزات إلى إعدادات إضافية.

