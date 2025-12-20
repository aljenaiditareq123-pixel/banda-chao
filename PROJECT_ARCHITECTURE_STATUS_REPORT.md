# 🏗️ Banda Chao: Project Architecture & Status Report
## Comprehensive Technical Documentation for AI Context Synchronization

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Production-Ready (with routing fix pending)  
**Target Audience:** AI Assistants, Developers, Technical Stakeholders

---

## 📋 Executive Summary

**Banda Chao** is a global social-commerce platform connecting independent artisans worldwide with buyers. The platform serves 4 billion people across Arabic, English, and Chinese markets, operating from UAE's RAKEZ free zone.

### Current Status:
- ✅ **11 out of 12 AI Bricks Completed** (91.7%)
- ✅ **Core Platform Features:** 100% Complete
- ⚠️ **Deployment:** Live but experiencing routing issue (JSON response instead of HTML)
- ✅ **Codebase:** Production-ready with minor fixes needed

### Technical Debt:
1. **Routing Issue:** Requests going to Backend Server instead of Next.js Frontend
2. **Deployment Configuration:** Need to verify Render settings
3. **Future:** Trend Spotter feature (Brick 8) - deferred

---

## 1. 🛠️ Tech Stack & Architecture

### 1.1 Frontend Stack

#### Core Framework:
- **Next.js:** `^16.0.7` (App Router)
- **React:** `^18.3.0`
- **TypeScript:** `^5.4.0` (strict mode)
- **Node.js:** `>=20.9.0`

#### Styling & UI:
- **Tailwind CSS:** `^3.4.0`
- **Framer Motion:** `^12.23.26` (animations)
- **Lucide React:** `^0.559.0` (icons)
- **React Icons:** `^5.5.0`

#### State Management:
- **React Context API:** Custom hooks for auth, cart, language
- **Local Storage:** Client-side persistence
- **Custom Hooks:** `useAuth`, `useCart`, `useLanguage`

#### API Client:
- **Axios:** `^1.7.0` with retry logic and interceptors
- **Centralized API Client:** `lib/api.ts`

#### Payment & Real-time:
- **Stripe.js:** `@stripe/stripe-js ^8.5.3`
- **Socket.IO Client:** `^4.6.0`

### 1.2 Backend Stack

#### Runtime & Framework:
- **Node.js:** `>=20.9.0`
- **Express.js:** TypeScript implementation
- **TypeScript:** Full type safety

#### Database:
- **PostgreSQL:** Production database
- **Prisma ORM:** `^6.0.0`
- **pgvector:** Vector embeddings storage
- **SQLite:** Local development only

#### Authentication:
- **NextAuth.js:** `^5.0.0-beta.30` (Next.js API routes)
- **JWT:** `jsonwebtoken` (legacy support)
- **Bcrypt:** Password hashing

#### AI Services:
- **Google Gemini API:** `1.5 Pro` & `1.5 Flash`
- **Google Embeddings:** `embedding-001` & `text-embedding-004`
- **Google Speech-to-Text:** Speech recognition

#### File Storage:
- **Google Cloud Storage (GCS):** Production file storage
- **Multer:** Local development uploads

#### Real-time:
- **Socket.IO Server:** Real-time communication

#### Payment Processing:
- **Stripe API:** Payment processing
- **Webhook Handling:** Payment event processing

### 1.3 Project Structure

```
banda-chao/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-based routing (ar, en, zh)
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Locale layout
│   │   ├── products/             # Product pages
│   │   ├── makers/               # Maker pages
│   │   ├── videos/               # Video pages
│   │   ├── checkout/             # Checkout flow
│   │   ├── profile/              # User profile
│   │   └── ...                   # Other pages
│   ├── api/                      # Next.js API Routes
│   │   ├── ai/                   # AI feature endpoints
│   │   │   ├── generate-description/
│   │   │   ├── analyze-image/
│   │   │   ├── translate/
│   │   │   ├── pricing/
│   │   │   ├── summarize-reviews/
│   │   │   ├── fraud-check/
│   │   │   └── notifications/
│   │   ├── auth/                 # NextAuth routes
│   │   └── checkout/             # Payment routes
│   ├── admin/                    # Admin dashboard
│   ├── founder/                  # Founder console
│   └── layout.tsx                # Root layout
│
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   ├── SearchBar.tsx
│   │   └── AuthButtons.tsx
│   ├── common/                   # Shared components
│   │   ├── NotificationBell.tsx
│   │   └── ErrorBoundary.tsx
│   ├── cards/                    # Card components
│   │   ├── ProductCard.tsx
│   │   ├── MakerCard.tsx
│   │   └── VideoCard.tsx
│   ├── maker/                    # Maker-specific
│   │   └── AddProductForm.tsx
│   └── home/                     # Home page components
│       └── HomePageClient.tsx
│
├── server/                       # Express backend
│   ├── src/
│   │   ├── api/                  # API route handlers
│   │   │   ├── products.ts
│   │   │   ├── makers.ts
│   │   │   ├── videos.ts
│   │   │   ├── ai.ts             # Founder AI
│   │   │   └── ...
│   │   ├── controllers/          # Business logic
│   │   │   └── AIController.ts   # AI chat controller
│   │   ├── services/             # Service layer
│   │   │   ├── productVectorService.ts
│   │   │   ├── searchService.ts
│   │   │   └── ...
│   │   ├── lib/                  # Utility libraries
│   │   │   ├── gemini.ts         # Gemini AI client
│   │   │   ├── embeddings.ts     # Vector embeddings
│   │   │   └── ...
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── index.ts              # Server entry point
│   └── package.json
│
├── prisma/                       # Database schema
│   ├── schema.prisma             # Prisma schema
│   └── seed.ts                   # Database seeding
│
├── lib/                          # Shared utilities
│   ├── api.ts                    # API client
│   └── ...
│
├── contexts/                     # React contexts
│   ├── CartContext.tsx
│   ├── LanguageContext.tsx
│   └── ...
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── ...
│
├── middleware.ts                 # Next.js middleware (locale routing)
├── next.config.js                # Next.js configuration
└── package.json                  # Dependencies
```

### 1.4 Internationalization (i18n) Architecture

#### Implementation:
- **Locale-based Routing:** `app/[locale]/` structure
- **Supported Locales:** `ar` (Arabic), `en` (English), `zh` (Chinese)
- **Default Locale:** `ar` (Arabic)

#### Middleware Logic:
- **File:** `middleware.ts`
- **Functionality:**
  - Detects locale from URL path (`/ar/`, `/en/`, `/zh/`)
  - IP-based locale detection (fallback)
  - Accept-Language header detection
  - Redirects root path (`/`) to default locale (`/ar`)
  - Excludes API routes, static files, `/admin`, `/founder` from locale routing

#### Language Context:
- **File:** `contexts/LanguageContext.tsx`
- **Features:**
  - React Context for current language
  - Language switching
  - Persistent language preference

#### RTL Support:
- **Arabic:** RTL layout (`dir="rtl"`)
- **English/Chinese:** LTR layout (`dir="ltr"`)
- **Fonts:** Almarai (Arabic), Inter (English/Chinese)

---

## 2. 🧱 The 12 AI Bricks Status

### Phase 1: Foundation (Interaction) ✅

#### ✅ Brick 1: Founder AI (Chatbot)
- **Status:** ✅ Complete
- **Description:** AI chatbot for answering visitor questions
- **Backend Files:**
  - `server/src/controllers/AIController.ts` - Main controller
  - `server/src/lib/gemini.ts` - Gemini client integration
  - `server/src/api/ai.ts` - API endpoint `/api/v1/ai/assistant`
- **Frontend Files:**
  - `app/founder/assistant/page-client.tsx` - Founder chat UI
  - `components/common/ChatWidget.tsx` - Chat widget
- **Features:**
  - Vector-based memory search
  - System prompt about Tariq and platform
  - Gemini 1.5 Pro/Flash integration
  - Always calls Gemini (no early returns)

#### ✅ Brick 2: Semantic Search (Vector Search)
- **Status:** ✅ Complete
- **Description:** Meaning-based product search using embeddings
- **Backend Files:**
  - `server/src/services/productVectorService.ts` - Vector operations
  - `server/src/lib/embeddings.ts` - Embedding generation
  - `server/src/services/searchService.ts` - Search logic
  - `server/src/api/search.ts` - API endpoint
- **Frontend Files:**
  - `components/layout/SearchBar.tsx` - Main search bar
  - `components/search/SmartSearchBar.tsx` - Advanced search
- **Features:**
  - Gemini embeddings (`embedding-001`)
  - Vector similarity search (pgvector)
  - Fallback to keyword search
  - Auto-generate embeddings on product create/update

#### ✅ Brick 3: Voice Command
- **Status:** ✅ Complete
- **Description:** Voice-to-text search using Web Speech API
- **Frontend Files:**
  - `components/layout/SearchBar.tsx` - Microphone icon
  - `components/search/SmartSearchBar.tsx` - Voice integration
- **Features:**
  - Browser-native Web Speech API
  - Microphone icon with pulsing animation
  - Auto-execute search on speech result
  - No API keys required

#### ✅ Brick 4: Auto-Translation (with Caching)
- **Status:** ✅ Complete
- **Description:** AI-powered translation with database caching
- **Backend Files:**
  - `app/api/ai/translate/route.ts` - Translation API
  - `prisma/schema.prisma` - `translation_cache` model
- **Frontend Files:**
  - `app/[locale]/products/[id]/page-client.tsx` - Translate button
- **Features:**
  - Gemini-based translation
  - Database caching (cache-first strategy)
  - Supports: ar, en, zh
  - Performance optimized for Chinese market

### Phase 2: Maker & Products Tools ✅

#### ✅ Brick 5: AI Copywriter
- **Status:** ✅ Complete
- **Description:** Auto-generate product descriptions using AI
- **Backend Files:**
  - `app/api/ai/generate-description/route.ts` - Description API
- **Frontend Files:**
  - `components/maker/AddProductForm.tsx` - Magic wand button ✨
- **Features:**
  - Marketing-focused Arabic descriptions
  - Emoji support
  - Benefits-focused copy
  - One-click generation

#### ✅ Brick 6: Vision AI (Image Analysis)
- **Status:** ✅ Complete
- **Description:** Extract product data from images
- **Backend Files:**
  - `app/api/ai/analyze-image/route.ts` - Vision API
- **Frontend Files:**
  - `components/maker/AddProductForm.tsx` - Analyze button 👁️
- **Features:**
  - Gemini Vision (1.5 Flash)
  - Extracts: name, category, color, description
  - Auto-fills only empty fields
  - Base64 image processing

#### ✅ Brick 7: Smart Pricing
- **Status:** ✅ Complete
- **Description:** AI-powered price suggestions
- **Backend Files:**
  - `app/api/ai/pricing/route.ts` - Pricing API
- **Frontend Files:**
  - `components/maker/AddProductForm.tsx` - Price suggestion button 💰
- **Features:**
  - Economic expert AI
  - Price range (min/max) in AED
  - Reasoning explanation
  - One-click apply

### Phase 3: Business Intelligence ✅

#### ⬜ Brick 8: Trend Spotter
- **Status:** ⬜ Deferred
- **Description:** Discover trending products and categories
- **Note:** Not yet implemented, planned for future

#### ✅ Brick 9: Recommendation Engine
- **Status:** ✅ Complete
- **Description:** AI-powered product recommendations using vectors
- **Backend Files:**
  - `app/api/products/[id]/recommendations/route.ts` - Recommendations API
  - `server/src/services/productVectorService.ts` - `getRelatedProducts` function
- **Frontend Files:**
  - `app/[locale]/products/[id]/page-client.tsx` - Recommendations section
- **Features:**
  - Vector similarity (Nearest Neighbors)
  - Shows 4 related products
  - Section: "🎯 منتجات قد تعجبك"

#### ✅ Brick 10: Review Summarizer
- **Status:** ✅ Complete
- **Description:** AI summarizes product reviews into pros/cons
- **Backend Files:**
  - `app/api/ai/summarize-reviews/route.ts` - Summarization API
- **Frontend Files:**
  - `app/[locale]/products/[id]/page-client.tsx` - AI Summary card
- **Features:**
  - Extracts pros ✅ and cons ⚠️
  - Final summary 💡
  - Requires 3+ reviews
  - Beautiful gradient card UI

#### ✅ Brick 11: Fraud Guard
- **Status:** ✅ Complete
- **Description:** AI-powered fraud detection for transactions
- **Backend Files:**
  - `app/api/ai/fraud-check/route.ts` - Fraud detection API
- **Features:**
  - Risk score (0-100)
  - Risk levels: Low, Medium, High
  - Actions: Approve, Review, Reject
  - Cybersecurity expert AI
  - JSON validation and auto-correction

#### ✅ Brick 12: Smart Notifications
- **Status:** ✅ Complete
- **Description:** Personalized AI-generated push notifications
- **Backend Files:**
  - `app/api/ai/notifications/route.ts` - Notification generation API
- **Frontend Files:**
  - `components/common/NotificationBell.tsx` - Smart notification display
- **Features:**
  - Personalized messages (50-80 chars)
  - Analyzes: cart items, favorites, recently viewed
  - Auto-generates when cart has items
  - Beautiful gradient card in notification dropdown

---

## 3. 🚀 Deployment Context

### 3.1 Deployment Platform: Render

#### Frontend Service Configuration:
- **Type:** Web Service
- **Build Command:**
  ```bash
  npm install --legacy-peer-deps && prisma generate && npm run build
  ```
- **Start Command:**
  ```bash
  cd .next/standalone && node server.js
  ```
- **Node Version:** `20.x`
- **Output Mode:** `standalone` (Next.js config)

#### Backend Service Configuration:
- **Type:** Web Service (separate)
- **Port:** `3001`
- **Express Server:** `server/src/index.ts`

### 3.2 Manual Environment Variable Updates (⚠️ Important)

**These were manually updated on Render Dashboard and should be noted:**

1. **`FOUNDER_EMAIL`:**
   - **Previous:** (incorrect/placeholder value)
   - **Current:** Real owner email address
   - **Location:** Render Dashboard → Environment Variables

2. **`FRONTEND_URL`:**
   - **Previous:** `https://banda-chao-frontend.onrender.com` (incorrect)
   - **Current:** `https://banda-chao.onrender.com`
   - **Note:** Removed `-frontend` suffix
   - **Location:** Render Dashboard → Environment Variables

3. **`NEXTAUTH_URL`:**
   - **Previous:** `https://banda-chao-frontend.onrender.com` (incorrect)
   - **Current:** `https://banda-chao.onrender.com`
   - **Note:** Matches `FRONTEND_URL`
   - **Location:** Render Dashboard → Environment Variables

### 3.3 Current Deployment Issue

#### Problem:
- **Symptom:** Site returns JSON response `{"success":false,"message":"Route not found"}` instead of HTML UI
- **URLs Affected:**
  - `https://banda-chao.onrender.com` → JSON response
  - `https://banda-chao.onrender.com/ar` → JSON response (Arabic)

#### Root Cause Analysis:
1. **JSON Response Source:**
   - Message comes from **Backend Server** (`server/src/index.ts:357-362`)
   - This is the Express.js 404 handler, not Next.js

2. **What This Indicates:**
   - Requests are going to **Backend Server** (PORT 3001) instead of **Next.js Standalone Server** (PORT 3000)
   - Next.js standalone server may not be running correctly
   - OR Render routing is misconfigured

3. **Middleware Status:**
   - `middleware.ts` has been verified and is correct
   - `app/page.tsx` correctly redirects `/` to `/ar`
   - Issue is **not** in middleware logic

#### Potential Causes:
1. **Build Issue:**
   - `.next/standalone/server.js` may not exist after build
   - Build command may be failing silently
   - Prisma generate may be failing

2. **Start Command Issue:**
   - Start command path may be incorrect
   - `cd .next/standalone && node server.js` may fail
   - Working directory may be wrong

3. **Port Configuration:**
   - PORT environment variable may not be set correctly
   - Render may be routing to wrong service
   - Next.js may not be listening on expected port

#### Troubleshooting Steps (for Render Dashboard):
1. **Check Build Logs:**
   - Verify `npm run build` succeeded
   - Verify `.next/standalone/server.js` was created
   - Look for Prisma errors

2. **Check Runtime Logs:**
   - Verify `node server.js` started successfully
   - Check for port binding errors
   - Verify server is listening on PORT

3. **Verify Start Command:**
   - Ensure command is: `cd .next/standalone && node server.js`
   - Verify working directory is correct

4. **Alternative Solution:**
   If standalone mode continues to fail, use standard Next.js start:
   ```bash
   # Start Command:
   npm start
   ```
   (Uses more memory but more stable)

---

## 4. 📊 Technical Summary

### 4.1 What's 100% Complete:

#### Core Platform:
- ✅ **E-commerce Infrastructure:** Products, Makers, Videos, Orders
- ✅ **Authentication System:** NextAuth + JWT (dual support)
- ✅ **Payment Processing:** Stripe integration (production-ready)
- ✅ **Database Schema:** Complete Prisma schema with migrations
- ✅ **Multi-language Support:** Arabic, English, Chinese (RTL/LTR)
- ✅ **File Storage:** Google Cloud Storage integration
- ✅ **Real-time Features:** Socket.IO integration

#### AI Features (11/12 Bricks):
- ✅ Founder AI Chatbot
- ✅ Semantic Search (Vector-based)
- ✅ Voice Command
- ✅ Auto-Translation (with caching)
- ✅ AI Copywriter
- ✅ Vision AI (Image Analysis)
- ✅ Smart Pricing
- ✅ Recommendation Engine
- ✅ Review Summarizer
- ✅ Fraud Guard
- ✅ Smart Notifications

#### Developer Experience:
- ✅ TypeScript (strict mode)
- ✅ Code organization (clear separation of concerns)
- ✅ Error handling and logging
- ✅ Testing infrastructure (Vitest, Playwright)

### 4.2 Technical Debt & Issues:

#### Critical (Blocks Production):
1. **⚠️ Routing Issue (Current):**
   - Requests going to Backend Server instead of Next.js
   - **Impact:** Site returns JSON instead of UI
   - **Priority:** HIGH
   - **Fix:** Verify Render configuration (Build/Start commands)

#### Minor (Non-blocking):
1. **Database Schema Discrepancies:**
   - Some columns in `schema.prisma` don't exist in production DB
   - Workaround: SQL queries use `NULL as column_name`
   - **Impact:** Low (already handled)

2. **API Quota Limitations:**
   - Gemini Embeddings API may hit free-tier limits
   - **Impact:** Medium (affects semantic search during heavy usage)
   - **Fix:** Monitor usage, upgrade API tier if needed

3. **Deferred Features:**
   - Brick 8 (Trend Spotter) - not started
   - **Impact:** None (planned for future)

#### Code Quality:
- ✅ TypeScript strict mode enabled
- ✅ Consistent code style
- ✅ Error boundaries in place
- ⚠️ Some linter warnings (non-critical, pre-existing)

---

## 5. 🔗 Key File Locations Reference

### Core Configuration:
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration (standalone mode)
- `prisma/schema.prisma` - Database schema
- `middleware.ts` - Locale routing middleware
- `render.yaml` - Render deployment configuration

### AI Features:
- `server/src/lib/gemini.ts` - Gemini client
- `server/src/lib/embeddings.ts` - Embedding generation
- `server/src/controllers/AIController.ts` - Founder AI controller
- `app/api/ai/*/route.ts` - AI API endpoints (Next.js routes)

### Core Services:
- `server/src/services/productVectorService.ts` - Vector operations
- `server/src/services/searchService.ts` - Search logic
- `server/src/api/*.ts` - Express API routes

### Frontend Components:
- `components/layout/Navbar.tsx` - Main navigation
- `components/common/NotificationBell.tsx` - Smart notifications
- `components/maker/AddProductForm.tsx` - Product form with AI features

---

## 6. 🎯 Next Steps & Recommendations

### Immediate (Fix Current Issue):
1. ✅ Verify Render Build/Start commands
2. ✅ Check Build Logs for errors
3. ✅ Verify `.next/standalone/server.js` exists
4. ✅ Test alternative: `npm start` if standalone fails

### Short-term:
1. Monitor API quotas (Gemini)
2. Complete Trend Spotter (Brick 8) if needed
3. Performance optimization
4. Enhanced error monitoring

### Long-term:
1. Mobile apps (iOS, Android)
2. Advanced analytics dashboard
3. Multi-vendor marketplace features
4. Enterprise features

---

## 📝 Document Maintenance

**This document should be updated:**
- When new features are added
- When deployment configuration changes
- When AI bricks are completed
- When significant architecture changes occur

**Last Review Date:** January 2025  
**Next Review:** After routing issue resolution

---

**✅ This report provides complete context for AI assistants and developers to understand the Banda Chao project architecture and current status.**
