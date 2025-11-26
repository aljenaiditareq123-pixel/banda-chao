# Developer Guide - Banda Chao

**تاريخ الإنشاء**: ديسمبر 2024  
**الهدف**: دليل شامل للمطورين لفهم بنية المشروع في 20 دقيقة

---

## 📖 Architecture Overview

Banda Chao هو منصة اجتماعية تجارية مبنية على:
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Backend**: Express.js + Prisma + PostgreSQL
- **Real-time**: Socket.IO
- **Payments**: Stripe
- **AI**: Custom AI Assistant (ready for Gemini/OpenAI integration)

---

## 🏗️ Project Structure

```
banda-chao/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Locale-specific pages (ar, en, zh)
│   │   ├── page.tsx             # Home page
│   │   ├── makers/              # Makers pages
│   │   ├── products/            # Products pages
│   │   ├── videos/              # Videos pages
│   │   ├── about/               # About page
│   │   ├── checkout/            # Checkout pages
│   │   └── messages/            # Messaging pages
│   ├── founder/                 # Founder pages (Arabic only)
│   └── layout.tsx               # Root layout
├── components/                   # React Components
│   ├── cards/                   # Card components (MakerCard, ProductCard, VideoCard)
│   ├── common/                  # Common components (LoadingState, ErrorState, EmptyState, NotificationBell)
│   ├── founder/                 # Founder-specific components
│   ├── home/                    # Home page components
│   └── messaging/               # Messaging components (ChatBox)
├── contexts/                     # React Contexts
│   └── LanguageContext.tsx      # Language/i18n context
├── hooks/                        # Custom Hooks
│   ├── useAuth.ts               # Authentication hook
│   └── useFounderKpis.ts        # Founder KPIs hook
├── lib/                          # Utilities
│   ├── api.ts                   # API client (Axios)
│   ├── analytics.ts             # Analytics helper
│   └── socket.ts                # Socket.IO client
├── types/                        # TypeScript Types
├── server/                       # Backend
│   ├── src/
│   │   ├── api/                 # API Routes
│   │   │   ├── auth.ts          # Authentication
│   │   │   ├── makers.ts        # Makers API
│   │   │   ├── products.ts      # Products API
│   │   │   ├── videos.ts        # Videos API
│   │   │   ├── posts.ts         # Posts API
│   │   │   ├── comments.ts      # Comments API
│   │   │   ├── payments.ts      # Payments API
│   │   │   ├── analytics.ts     # Analytics API
│   │   │   ├── orders.ts        # Orders API
│   │   │   ├── notifications.ts # Notifications API
│   │   │   ├── conversations.ts # Conversations API
│   │   │   └── ai.ts            # AI Assistant API
│   │   ├── middleware/          # Express Middleware
│   │   │   ├── auth.ts          # JWT authentication
│   │   │   ├── errorHandler.ts  # Error handling
│   │   │   ├── requestLogger.ts  # Request logging
│   │   │   └── validate.ts      # Input validation
│   │   ├── lib/                 # Backend utilities
│   │   │   ├── stripe.ts        # Stripe helper
│   │   │   ├── notifications.ts # Notification helper
│   │   │   └── cache.ts         # Caching helper
│   │   ├── realtime/            # Real-time
│   │   │   └── socket.ts        # Socket.IO server
│   │   ├── validation/          # Zod schemas
│   │   └── index.ts             # Express app entry
│   └── prisma/
│       ├── schema.prisma        # Database schema
│       └── seed.ts              # Database seed
└── public/                       # Static files
    └── branding/                # Brand assets
```

---

## 🎨 Frontend Structure

### App Router (Next.js 14)

**Locale-based Routing:**
- `/ar` - Arabic (RTL)
- `/en` - English (LTR)
- `/zh` - Chinese (LTR)

**Key Pages:**
- `/[locale]/page.tsx` - Home page
- `/[locale]/makers` - Makers list
- `/[locale]/makers/[id]` - Maker detail
- `/[locale]/products` - Products list
- `/[locale]/products/[id]` - Product detail
- `/[locale]/videos` - Videos list
- `/[locale]/videos/[id]` - Video detail
- `/[locale]/about` - About page
- `/[locale]/checkout/success` - Checkout success
- `/[locale]/checkout/cancel` - Checkout cancel
- `/[locale]/messages/[conversationId]` - Chat page
- `/founder` - Founder console (Arabic only)

### Components

**Card Components:**
- `components/cards/MakerCard.tsx` - Maker display card
- `components/cards/ProductCard.tsx` - Product display card
- `components/cards/VideoCard.tsx` - Video display card

**Common Components:**
- `components/common/Card.tsx` - Generic card wrapper
- `components/common/LoadingState.tsx` - Loading indicator
- `components/common/ErrorState.tsx` - Error display
- `components/common/EmptyState.tsx` - Empty state display
- `components/common/NotificationBell.tsx` - Notification bell with dropdown

**Founder Components:**
- `components/founder/FounderConsole.tsx` - Main founder dashboard

**Messaging:**
- `components/messaging/ChatBox.tsx` - Real-time chat component

### State Management

- **Language Context**: `contexts/LanguageContext.tsx` - i18n state
- **Auth Hook**: `hooks/useAuth.ts` - Authentication state
- **Local State**: React `useState` for component-level state

### API Client

**Location**: `lib/api.ts`

**Structure:**
```typescript
export const authAPI = { ... }
export const makersAPI = { ... }
export const productsAPI = { ... }
export const videosAPI = { ... }
export const paymentsAPI = { ... }
export const notificationsAPI = { ... }
export const aiAPI = { ... }
```

**Features:**
- Axios instance with base URL
- Automatic JWT token injection
- Error handling interceptor
- Type-safe responses

---

## 🔧 Backend Structure

### API Routes

**Authentication:**
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

**Makers:**
- `GET /api/v1/makers` - List makers (pagination, filters)
- `GET /api/v1/makers/:id` - Get maker details
- `POST /api/v1/makers` - Create/update maker profile

**Products:**
- `GET /api/v1/products` - List products (pagination, filters)
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/makers/:makerId` - Get maker's products

**Videos:**
- `GET /api/v1/videos` - List videos (pagination, filters)
- `GET /api/v1/videos/:id` - Get video details (increments views)
- `GET /api/v1/videos/makers/:makerId` - Get maker's videos

**Payments:**
- `POST /api/v1/payments/checkout` - Create checkout session
- `POST /api/v1/payments/webhook` - Stripe webhook handler

**Notifications:**
- `GET /api/v1/notifications` - Get user notifications
- `POST /api/v1/notifications/read` - Mark as read
- `POST /api/v1/notifications/send` - Send notification (admin)

**Conversations:**
- `GET /api/v1/conversations` - Get user conversations
- `POST /api/v1/conversations` - Create/get conversation
- `GET /api/v1/conversations/:id/messages` - Get messages
- `POST /api/v1/conversations/:id/messages` - Send message

**AI:**
- `POST /api/v1/ai/assistant` - AI Assistant (Founder only)

### Middleware

**Authentication:**
- `authenticateToken` - Verify JWT token
- `requireRole` - Require specific user role

**Validation:**
- `validate` - Zod schema validation

**Error Handling:**
- `errorHandler` - Centralized error handling
- `requestLogger` - Request logging (dev only)

### Database (Prisma)

**Key Models:**
- `User` - Users (FOUNDER, MAKER, BUYER, ADMIN)
- `Maker` - Artisan profiles
- `Product` - Products
- `Video` - Videos
- `Post` - Posts
- `Comment` - Comments
- `Order` - Orders
- `Conversation` - Conversations
- `Message` - Messages
- `Notification` - Notifications
- `AnalyticsEvent` - Analytics events

**Relations:**
- User → Maker (one-to-one)
- Maker → Products (one-to-many)
- Maker → Videos (one-to-many)
- User → Orders (one-to-many)
- Conversation → Messages (one-to-many)

---

## 🔌 Real-time (Socket.IO)

### Server Setup

**Location**: `server/src/realtime/socket.ts`

**Events:**
- `connection` - User connects
- `join:conversation` - Join conversation room
- `message:send` - Send message
- `message:receive` - Receive message
- `leave:conversation` - Leave conversation room

### Client Setup

**Location**: `lib/socket.ts`

**Usage:**
```typescript
import { initializeSocketClient } from '@/lib/socket';

const socket = initializeSocketClient(token);
socket.on('message:receive', (message) => {
  // Handle message
});
```

---

## 🤖 AI Assistant

### Endpoint

**POST /api/v1/ai/assistant**

**Features:**
- Context memory (in-memory, last 20 messages)
- System prompt with Banda Chao context
- KPIs integration
- Multi-turn conversations

**Future:**
- TODO: Integrate Gemini/OpenAI
- TODO: Persistent conversation storage
- TODO: Advanced AI tools

---

## 📊 Analytics

### Event Types

- `PAGE_VIEW` - Page views
- `CHECKOUT_STARTED` - Checkout started
- `CHECKOUT_COMPLETED` - Checkout completed
- `PRODUCT_VIEWED` - Product viewed
- `MAKER_VIEWED` - Maker viewed
- `AI_MESSAGE_SENT` - AI message sent

### Tracking

**Frontend**: `lib/analytics.ts`
```typescript
import { trackEvent, trackPageView } from '@/lib/analytics';

trackPageView('/zh/products');
trackEvent('PRODUCT_VIEWED', { productId: '123' });
```

**Backend**: `server/src/api/analytics.ts`
- `POST /api/v1/analytics/event` - Track event
- `GET /api/v1/analytics/summary` - Get summary (Founder)

---

## 🔔 Notifications

### Types

- `new-product` - New product created
- `order-placed` - Order placed
- `order-update` - Order status changed
- `message` - New message
- `new-maker` - New maker registered

### Flow

1. Event occurs (e.g., order placed)
2. `createNotification()` called
3. Notification saved to database
4. Socket.IO event emitted (TODO)
5. Frontend receives notification
6. NotificationBell updates

---

## 💳 Payments

### Flow

1. User clicks "Buy" on product page
2. Frontend calls `POST /api/v1/payments/checkout`
3. Backend creates Order (PENDING)
4. Backend creates Stripe Checkout Session
5. User redirected to Stripe
6. Stripe webhook updates Order (PAID)
7. User redirected to success page

### Test Mode

- Currently in Test Mode
- Use test card: `4242 4242 4242 4242`
- No real money charged

---

## 🧪 Testing

### Backend Tests

**Location**: `server/tests/`

**Run:**
```bash
cd server
npm test
```

**Coverage:**
- Health check
- Authentication
- Makers API
- Products API
- Videos API
- Error handling

### Frontend Tests

**Location**: `tests/`

**Run:**
```bash
npm test
```

**Coverage:**
- Home page
- Makers page
- Founder console

---

## 🚀 Deployment

### Backend

**Docker:**
```bash
cd server
docker build -t banda-chao-backend .
docker run -p 3001:3001 banda-chao-backend
```

**Render:**
- Root Directory: `server`
- Build: `npm install && npm run build`
- Start: `npm start`

### Frontend

**Vercel:**
- Framework: Next.js
- Build: `npm run build`
- Auto-deploy on push

**Docker:**
```bash
docker build -t banda-chao-frontend .
docker run -p 3000:3000 banda-chao-frontend
```

---

## 🔐 Security

### Implemented

- ✅ Helmet (security headers)
- ✅ CORS (configured)
- ✅ Rate limiting (auth, AI endpoints)
- ✅ JWT authentication
- ✅ Input validation (Zod)
- ✅ Error message sanitization
- ✅ SQL injection protection (Prisma)

### Best Practices

- Never commit secrets
- Use environment variables
- Validate all inputs
- Sanitize error messages
- Use HTTPS in production

---

## 📝 Common Tasks

### Add New API Endpoint

1. Create route file in `server/src/api/`
2. Add to `server/src/index.ts`
3. Add to `lib/api.ts` (frontend)
4. Add validation schema (if needed)
5. Add tests

### Add New Page

1. Create page in `app/[locale]/`
2. Create client component if needed
3. Add API calls in `lib/api.ts`
4. Add to navigation (if needed)

### Add New Database Model

1. Update `server/prisma/schema.prisma`
2. Run migration: `npm run db:migrate`
3. Update types if needed

---

## 🐛 Debugging

### Backend

```bash
cd server
npm run dev  # Watch mode with logs
```

**Check:**
- Database connection
- Environment variables
- API endpoints
- Socket.IO connection

### Frontend

```bash
npm run dev  # Next.js dev server
```

**Check:**
- Browser console
- Network tab
- React DevTools

---

## 📚 Key Files to Know

**Must Read:**
- `server/prisma/schema.prisma` - Database schema
- `server/src/index.ts` - Backend entry point
- `lib/api.ts` - API client
- `app/layout.tsx` - Root layout

**Important:**
- `server/src/middleware/auth.ts` - Authentication
- `server/src/lib/stripe.ts` - Payments
- `server/src/realtime/socket.ts` - Real-time
- `components/founder/FounderConsole.tsx` - Founder dashboard

---

## 🔗 External Services

- **Stripe**: Payment processing
- **PostgreSQL**: Database
- **Socket.IO**: Real-time communication
- **Future**: Gemini/OpenAI for AI

---

## 📖 Additional Resources

- **README.md** - Quick start
- **DEPLOYMENT.md** - Deployment guide
- **TESTING.md** - Testing guide
- **INVESTOR_README.md** - Business overview
- **DEMO_FLOW.md** - Demo presentation guide

---

**آخر تحديث**: ديسمبر 2024



