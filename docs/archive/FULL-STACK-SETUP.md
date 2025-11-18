# 🚀 دليل إعداد Backend كامل (Full-Stack)

## 📋 نظرة عامة

تم إعداد Backend منفصل باستخدام:
- **Express.js** - خادم HTTP
- **Prisma** - ORM لقاعدة البيانات
- **Socket.io** - للتواصل اللحظي
- **JWT** - للمصادقة
- **PostgreSQL** - قاعدة البيانات

---

## 🗂️ هيكل المشروع

```
banda-chao/
├── server/                    # Backend منفصل
│   ├── src/
│   │   ├── api/              # API Routes
│   │   │   ├── auth.ts       # المصادقة (تسجيل دخول/تسجيل)
│   │   │   ├── users.ts      # إدارة المستخدمين
│   │   │   ├── messages.ts   # الرسائل والدردشة
│   │   │   ├── posts.ts      # المنشورات الاجتماعية
│   │   │   └── products.ts   # المنتجات
│   │   ├── middleware/       # Middleware
│   │   │   └── auth.ts       # التحقق من JWT
│   │   ├── services/         # الخدمات
│   │   │   └── websocket.ts  # إدارة WebSocket
│   │   ├── utils/            # Utilities
│   │   │   └── prisma.ts     # Prisma Client
│   │   └── index.ts          # نقطة البداية
│   ├── prisma/
│   │   └── schema.prisma     # مخطط قاعدة البيانات
│   ├── package.json
│   └── tsconfig.json
├── lib/
│   ├── api.ts                # API Client للواجهة الأمامية
│   └── socket.ts             # WebSocket Client
└── contexts/
    └── AuthContext.tsx       # Context للمصادقة
```

---

## 🔧 خطوات الإعداد

### 1. تثبيت الاعتمادات

```bash
cd server
npm install
# أو
pnpm install
```

### 2. إعداد قاعدة البيانات

#### أ) إنشاء قاعدة بيانات PostgreSQL

يمكنك استخدام:
- **Supabase PostgreSQL** (موجود لديك)
- **Local PostgreSQL**
- **أي قاعدة بيانات PostgreSQL أخرى**

#### ب) تكوين Prisma

1. أنشئ ملف `.env` في مجلد `server/`:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

2. قم بتشغيل Prisma Migration:

```bash
cd server
npx prisma migrate dev --name init
```

3. قم بإنشاء Prisma Client:

```bash
npx prisma generate
```

### 3. تشغيل الخادم

```bash
cd server
npm run dev
```

الخادم سيعمل على: `http://localhost:3001`

---

## 📡 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /auth/register` - تسجيل مستخدم جديد
- `POST /auth/login` - تسجيل الدخول

### Users (`/api/v1/users`)
- `GET /users/me` - الحصول على المستخدم الحالي
- `GET /users/:id` - الحصول على مستخدم محدد
- `PUT /users/:id` - تحديث الملف الشخصي

### Messages (`/api/v1/messages`)
- `POST /messages` - إرسال رسالة
- `GET /messages/:userId1/:userId2` - تاريخ الدردشة
- `GET /messages/conversations` - جميع المحادثات

### Posts (`/api/v1/posts`)
- `GET /posts` - جميع المنشورات (Feed)
- `POST /posts` - إنشاء منشور
- `GET /posts/:id` - منشور محدد
- `PUT /posts/:id` - تحديث منشور
- `DELETE /posts/:id` - حذف منشور

### Products (`/api/v1/products`)
- `GET /products` - جميع المنتجات
- `POST /products` - إضافة منتج
- `GET /products/:id` - منتج محدد
- `PUT /products/:id` - تحديث منتج
- `DELETE /products/:id` - حذف منتج

---

## 🔌 WebSocket Events

### من العميل إلى الخادم:
- `join_chat` - الانضمام لمحادثة
- `leave_chat` - مغادرة محادثة
- `send_message` - إرسال رسالة (بديل لـ REST API)
- `typing` - إشارة الكتابة

### من الخادم إلى العميل:
- `new_message` - رسالة جديدة
- `message_notification` - إشعار برسالة جديدة
- `user_typing` - مستخدم يكتب

---

## 🔗 ربط الواجهة الأمامية

### 1. إضافة متغيرات البيئة

في `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 2. استخدام AuthContext

```tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// في app/layout.tsx
<AuthProvider>
  {children}
</AuthProvider>

// في أي مكون
const { user, login, logout } = useAuth();
```

### 3. استخدام API Client

```tsx
import { authAPI, messagesAPI } from '@/lib/api';

// تسجيل الدخول
await authAPI.login({ email, password });

// إرسال رسالة
await messagesAPI.sendMessage({ receiverId, content });
```

### 4. استخدام WebSocket

```tsx
import { connectSocket, socketHelpers } from '@/lib/socket';

// الاتصال
const socket = connectSocket(token);

// الانضمام لمحادثة
socketHelpers.joinChat(otherUserId);

// الاستماع للرسائل
socketHelpers.onMessage((message) => {
  console.log('New message:', message);
});
```

---

## 🛡️ حماية المسارات

استخدم `ProtectedRoute`:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

<ProtectedRoute>
  <YourProtectedPage />
</ProtectedRoute>
```

---

## 📝 ملاحظات مهمة

### ⚠️ التكامل مع Supabase

- **يمكنك استخدام Supabase PostgreSQL** لنفس قاعدة البيانات
- **أو استخدام قاعدة بيانات منفصلة** للـ Backend الجديد
- **Supabase Auth** و **Express JWT Auth** يمكن أن يعملا معاً

### 🔄 خيارات التكامل:

1. **استخدام Supabase فقط** (الوضع الحالي)
2. **استخدام Express Backend فقط** (الجديد)
3. **استخدام كليهما** (Supabase للـ Auth، Express للـ API المعقدة)

---

## 🚀 النشر

### في بيئة التطوير:
```bash
npm run dev  # في مجلد server
```

### في بيئة الإنتاج:
```bash
npm run build  # بناء المشروع
npm start      # تشغيل الملفات المترجمة
```

---

## ✅ الخطوات التالية

1. ✅ إنشاء Backend Structure
2. ✅ إعداد Prisma Schema
3. ✅ إنشاء API Routes
4. ✅ إعداد WebSocket
5. ✅ إنشاء Frontend API Client
6. ⏳ ربط الواجهة الأمامية بالـ Backend
7. ⏳ اختبار جميع الميزات
8. ⏳ إضافة صفحات جديدة (Profile, Feed, Products)

---

**🎉 تم إعداد Backend بنجاح!**


