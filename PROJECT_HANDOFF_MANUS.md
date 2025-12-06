# Banda Chao Project Handoff Document
## For AI Project Manager: Manus

**Date:** December 2025  
**Project Status:** Beta Launch - Active Monitoring Phase  
**Production URL:** https://banda-chao.vercel.app  
**Backend URL:** https://banda-chao-backend.onrender.com

---

## 1. Project Repository & Branching Strategy

### Primary Git Repository
- **URL:** `https://github.com/aljenaiditareq123-pixel/banda-chao.git`
- **Type:** GitHub Repository
- **Visibility:** Private (assumed based on project nature)

### Current Branching Model

**Production Branch:**
- **`main`** - This is the primary production branch
- **Deployed to:** Vercel (Frontend) and Render (Backend)
- **Status:** Currently active and deployed

**Branch Structure:**
```
main (production)
├── remotes/origin/main (deployed to production)
└── Feature branches (historical, mostly merged):
    ├── cursor/implement-arabic-localization-and-rtl-support-*
    ├── cursor/organize-banda-chao-documents-*
    └── cursor/remove-placeholder-banda-chao-*
```

**Current Deployment:**
- **Frontend (Vercel):** `main` branch → `https://banda-chao.vercel.app`
- **Backend (Render):** `main` branch → `https://banda-chao-backend.onrender.com`

**Branching Strategy:**
- **Simple Model:** Currently using `main` as the primary branch
- **No separate staging branch** - Direct deployment from `main`
- **Feature branches:** Created as needed (typically prefixed with `cursor/` or `feat/`)
- **Recommendation:** Consider implementing `develop` branch for staging in future

---

## 2. Access & Credentials

### Required Platform Access

#### A. Vercel (Frontend Hosting)
- **URL:** https://vercel.com
- **Project:** banda-chao
- **Access Needed:**
  - View deployments and logs
  - Check analytics and performance metrics
  - Manage environment variables
  - View build logs and errors
- **Credentials:** Contact project owner (Tariq Al-Janaidi) for Vercel team access

#### B. Render (Backend Hosting)
- **URL:** https://render.com
- **Service:** banda-chao-backend
- **Access Needed:**
  - View service status and logs
  - Check database connection status
  - Monitor resource usage (CPU, Memory)
  - View deployment logs
- **Credentials:** Contact project owner for Render dashboard access

#### C. PostgreSQL Database
- **Hosting:** Render (PostgreSQL service)
- **Access Method:**
  - Through Render dashboard (web interface)
  - Direct connection via connection string (stored in Render environment variables)
- **Credentials:** Database connection string stored in Render environment variables
- **Note:** Direct database access should be requested from project owner

#### D. GitHub Repository
- **URL:** `https://github.com/aljenaiditareq123-pixel/banda-chao`
- **Access Needed:**
  - Read/Write access to repository
  - Ability to create branches and pull requests
  - View issues and project management
- **Credentials:** GitHub personal access token or SSH key (request from project owner)

### Secure Credential Sharing Procedure

**Recommended Approach:**
1. **Use 1Password, LastPass, or similar password manager**
   - Store all credentials in a shared vault
   - Grant access to project team members only

2. **Environment Variables:**
   - Frontend (Vercel): Access via Vercel Dashboard → Project Settings → Environment Variables
   - Backend (Render): Access via Render Dashboard → Service → Environment

3. **Database Access:**
   - Connection string stored in Render environment variables
   - Never commit credentials to Git
   - Use `.env.example` files for documentation

4. **API Keys:**
   - Stripe keys: Stored in environment variables
   - Google Cloud Storage: Stored in environment variables
   - Gemini AI: Stored in environment variables
   - Sentry: Stored in environment variables

**Security Best Practices:**
- ✅ Never commit `.env` files to Git
- ✅ Use `.env.example` for documentation
- ✅ Rotate credentials periodically
- ✅ Use least-privilege access principles
- ✅ Enable 2FA on all platform accounts

---

## 3. Monitoring & Reporting Workflow

### Current Monitoring Setup

#### A. Application Health Monitoring

**Founder Dashboards:**
1. **Monitoring Dashboard:**
   - **URL:** `https://banda-chao.vercel.app/founder/monitoring`
   - **Purpose:** Real-time KPIs and Beta launch metrics
   - **Key Metrics:**
     - Beta applications count
     - New artisans registered
     - Conversion rate (Beta → Artisans)
     - New applications this week
     - Total products, videos, orders, users

2. **Founder Dashboard:**
   - **URL:** `https://banda-chao.vercel.app/founder/dashboard`
   - **Purpose:** Comprehensive KPIs and platform overview
   - **Key Metrics:**
     - Total artisans, products, videos, orders, users
     - New artisans/orders this week
     - Total beta applications
     - New beta applications this week

3. **Founder Assistant (AI Panda):**
   - **URL:** `https://banda-chao.vercel.app/founder/assistant`
   - **Purpose:** AI-powered consultation and coordination
   - **Features:**
     - Coordinate AI Staff team
     - Analyze KPIs
     - Provide strategic recommendations
     - Generate reports

#### B. Error Tracking & Logging

**Sentry Integration:**
- **Status:** ✅ Configured (Frontend: `@sentry/nextjs`, Backend: `@sentry/node`)
- **Frontend Config:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- **Backend Config:** Integrated in `server/src/index.ts`
- **Access:** Sentry dashboard (credentials in environment variables)
- **Documentation:** See `SENTRY_SETUP_INSTRUCTIONS.md`

**Application Logging:**
- **Backend:** Console logging (structured logging recommended for future)
- **Frontend:** Console logging + Sentry error tracking
- **Recommendation:** Consider implementing structured logging (Winston/Pino) for backend

#### C. Performance Monitoring

**Vercel Analytics:**
- **Status:** Available via Vercel Dashboard
- **Metrics:** Page views, performance, Web Vitals
- **Access:** Vercel Dashboard → Analytics

**Render Monitoring:**
- **Status:** Available via Render Dashboard
- **Metrics:** CPU, Memory, Request count, Response times
- **Access:** Render Dashboard → Service → Metrics

**Database Monitoring:**
- **Status:** Available via Render Dashboard
- **Metrics:** Connection count, Query performance
- **Access:** Render Dashboard → PostgreSQL Service → Metrics

### Reporting Workflow

#### Daily Monitoring Checklist

**Morning (9:00 AM):**
- [ ] Check Founder Dashboard KPIs
- [ ] Review error logs (Sentry)
- [ ] Check backend service status (Render)
- [ ] Review beta applications count
- [ ] Check deployment status (Vercel)

**Afternoon (1:00 PM):**
- [ ] Review user activity metrics
- [ ] Check API response times
- [ ] Review new feedback/errors
- [ ] Monitor conversion rates

**Evening (6:00 PM):**
- [ ] Daily summary report
- [ ] Update priority list
- [ ] Prepare for next day

#### Weekly Reporting

**Report Template:** See `BETA_LAUNCH_MONITORING_PLAN.md`

**Key Sections:**
1. Executive Summary (KPIs)
2. Highlights (What worked well)
3. Challenges (Issues encountered)
4. Recommended Improvements
5. Next Steps

#### Issue Reporting Process

**For Critical Issues:**
1. **Immediate Action:**
   - Check Sentry for error details
   - Review Render logs
   - Check Vercel deployment logs
   - Document issue in GitHub Issues

2. **GitHub Issues:**
   - Create issue with label: `bug`, `critical`, or `monitoring`
   - Include: Error message, steps to reproduce, logs
   - Assign to appropriate team member

3. **Communication:**
   - Notify project owner immediately
   - Update status in monitoring dashboard
   - Document resolution steps

**For Non-Critical Issues:**
1. Document in GitHub Issues
2. Add to backlog
3. Prioritize based on impact

### Key Metrics to Monitor (Beta Launch Stage)

**Growth Metrics:**
- Beta applications (target: 50+ in first week)
- New artisans registered (target: 10+ in first week)
- New users registered
- New products added
- New posts created

**Engagement Metrics:**
- Conversion rate (Beta → Artisans, target: 20%+)
- Active users (daily/weekly)
- Post interactions (likes, comments)
- Product views

**Technical Metrics:**
- API response time (target: < 500ms)
- Error rate (target: < 1%)
- Uptime (target: 99%+)
- Database query performance

**Commerce Metrics:**
- Cart abandonment rate
- Checkout conversion rate
- Average order value
- Total orders

**Documentation:**
- `BETA_LAUNCH_MONITORING_PLAN.md` - Complete monitoring plan
- `BETA_DAY_1_AI_STAFF_MISSIONS.md` - Day 1 mission plan

---

## 4. Development & Deployment (CI/CD)

### Current CI/CD Pipeline

#### Frontend (Vercel)
- **Platform:** Vercel
- **Deployment:** Automatic on push to `main` branch
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Environment:** Production (automatic)
- **Status:** ✅ Active

**Deployment Process:**
1. Push to `main` branch
2. Vercel automatically detects changes
3. Runs `npm install` and `npm run build`
4. Deploys to production
5. Updates `https://banda-chao.vercel.app`

#### Backend (Render)
- **Platform:** Render
- **Deployment:** Automatic on push to `main` branch
- **Build Command:** `npm run build` (in `server/` directory)
- **Start Command:** `npm start`
- **Environment:** Production
- **Status:** ✅ Active

**Deployment Process:**
1. Push to `main` branch
2. Render detects changes
3. Runs `npm install` in `server/` directory
4. Runs `npm run build` (includes Prisma migrations)
5. Runs `npm start`
6. Updates `https://banda-chao-backend.onrender.com`

**Post-Build Steps (Backend):**
- Prisma migrations: `npx prisma migrate deploy`
- Prisma generate: `npx prisma generate`
- Database seeding (if needed): `npm run db:quick-seed`

### Local Development Setup

#### Prerequisites
- **Node.js:** 18+ (recommended: 20.x)
- **PostgreSQL:** 14+ (or use Render database)
- **npm** or **yarn**
- **Git**

#### Installation Steps

**1. Clone Repository:**
```bash
git clone https://github.com/aljenaiditareq123-pixel/banda-chao.git
cd banda-chao
```

**2. Install Frontend Dependencies:**
```bash
npm install
```

**3. Install Backend Dependencies:**
```bash
cd server
npm install
cd ..
```

**4. Environment Variables Setup:**

**Frontend (`.env.local` in root):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
# Or for production testing:
# NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
```

**Backend (`server/.env`):**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/banda_chao?schema=public"
# Or use Render database URL

# JWT
JWT_SECRET="your-secret-key-change-in-production"

# CORS
CORS_ORIGIN=http://localhost:3000

# CSRF
CSRF_SECRET="your-csrf-secret"

# Google Cloud Storage (for file uploads)
GCS_BUCKET_NAME="your-bucket-name"
GCS_PROJECT_ID="your-project-id"
GCS_KEY_FILE="path/to/keyfile.json"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Sentry (optional for local)
SENTRY_DSN="your-sentry-dsn"
```

**5. Database Setup:**
```bash
cd server
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database with test data
npm run db:seed
```

**6. Run Development Servers:**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Backend runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

### Key Development Commands

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # TypeScript type checking
npm run lint         # ESLint
npm test             # Run tests
```

**Backend:**
```bash
cd server
npm run dev          # Start development server (with watch)
npm run build        # Build for production
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm test             # Run tests
```

### Environment Variables Reference

**Required for Local Development:**

**Frontend (`.env.local`):**
- `NEXT_PUBLIC_API_URL` - Backend API URL

**Backend (`server/.env`):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origin
- `CSRF_SECRET` - CSRF token secret

**Optional (for full functionality):**
- `GCS_BUCKET_NAME` - Google Cloud Storage bucket
- `GCS_PROJECT_ID` - GCS project ID
- `GCS_KEY_FILE` - Path to GCS service account key
- `GEMINI_API_KEY` - Google Gemini API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `SENTRY_DSN` - Sentry DSN for error tracking

**Note:** Actual values should be requested securely from the project owner.

### Testing

**Current Test Setup:**
- **Frontend:** Vitest + Playwright (E2E)
- **Backend:** Vitest + Supertest
- **Status:** Test infrastructure exists, but coverage needs improvement

**Run Tests:**
```bash
# Frontend
npm test

# Backend
cd server
npm test
```

---

## 5. Next Steps (Phase 1: Social Features + Shopping Cart UI)

### Current Status

**Completed Features:**
- ✅ Basic product listing and detail pages
- ✅ Shopping cart context (`contexts/CartContext.tsx`)
- ✅ Cart drawer component (`components/CartDrawer.tsx`)
- ✅ Cart page (`app/[locale]/cart/page-client.tsx`)
- ✅ Checkout page (`app/[locale]/checkout/page-client.tsx`)
- ✅ Basic posts API (`server/src/api/posts.ts`)
- ✅ Post creation form (`components/social/CreatePostForm.tsx`)
- ✅ Post card component (`components/social/PostCard.tsx`)
- ✅ Image upload for posts (`POST /api/v1/posts/upload-image`)
- ✅ Like functionality for posts

**Partially Implemented:**
- ⚠️ Posts feed (needs enhancement)
- ⚠️ Comments system (basic implementation exists)
- ⚠️ Social interactions (likes work, comments need improvement)

### Phase 1 Development Plan

#### A. Posts Feature Enhancement

**Location:** `app/[locale]/social` or `app/[locale]/feed`

**Tasks:**
1. **Create Posts Feed Page:**
   - File: `app/[locale]/feed/page-client.tsx`
   - Features:
     - Infinite scroll or pagination
     - Filter by maker
     - Sort by date/popularity
     - Real-time updates (optional)

2. **Enhance Post Interactions:**
   - Improve comments UI (`components/shared/CommentsSection.tsx`)
   - Add share functionality
   - Add save/bookmark feature
   - Improve like animation

3. **Post Detail Page:**
   - File: `app/[locale]/posts/[id]/page-client.tsx`
   - Features:
     - Full post view
     - All comments
     - Related posts
     - Maker profile link

**Backend Requirements:**
- ✅ Posts API exists (`server/src/api/posts.ts`)
- ✅ Comments API exists (`server/src/api/comments.ts`)
- ⚠️ May need pagination improvements
- ⚠️ May need filtering/sorting enhancements

#### B. Shopping Cart UI Enhancement

**Current Implementation:**
- ✅ Cart context (`contexts/CartContext.tsx`)
- ✅ Cart drawer (`components/CartDrawer.tsx`)
- ✅ Cart page (`app/[locale]/cart/page-client.tsx`)
- ✅ Checkout page (`app/[locale]/checkout/page-client.tsx`)

**Enhancement Tasks:**
1. **Improve Cart Drawer:**
   - Better animations
   - Product image optimization
   - Quantity controls refinement
   - Empty state improvement

2. **Enhance Cart Page:**
   - Better mobile responsiveness
   - Product recommendations
   - Save for later functionality
   - Coupon code input

3. **Checkout Flow:**
   - Multi-step checkout
   - Address autocomplete
   - Payment method selection
   - Order confirmation page

**Backend Requirements:**
- ✅ Orders API exists (`server/src/api/orders.ts`)
- ✅ Stripe integration exists
- ⚠️ May need order status tracking
- ⚠️ May need shipping calculation

### Development Workflow for Phase 1

**1. Create Feature Branch:**
```bash
git checkout -b feat/phase1-social-cart
```

**2. Development Order:**
- Start with Posts Feed (foundation)
- Enhance Post Interactions
- Improve Shopping Cart UI
- Test integration
- Deploy to production

**3. File Structure:**
```
app/[locale]/
├── feed/                    # New: Posts feed page
│   └── page-client.tsx
├── posts/                   # New: Post detail pages
│   └── [id]/
│       └── page-client.tsx
├── cart/                     # Existing: Enhance
│   └── page-client.tsx
└── checkout/                 # Existing: Enhance
    └── page-client.tsx

components/
├── social/                    # Existing: Enhance
│   ├── CreatePostForm.tsx
│   ├── PostCard.tsx
│   └── PostsFeed.tsx         # New
└── cart/                      # New: Cart components
    ├── CartItem.tsx
    └── CheckoutSteps.tsx
```

**4. Testing:**
- Test posts feed with real data
- Test cart flow end-to-end
- Test checkout with Stripe test mode
- Test mobile responsiveness

**5. Deployment:**
- Merge to `main` branch
- Vercel auto-deploys frontend
- Render auto-deploys backend
- Monitor for errors

### Documentation References

**For Phase 1 Development:**
- `PHASE1_IMPLEMENTATION_SUMMARY.md` - Previous Phase 1 work
- `README.md` - General project documentation
- `DEVELOPER_GUIDE.md` - Development guidelines

**For Future Tasks:**
- `FUTURE_TASKS/UX_PSYCHOLOGIST_IMPLEMENTATION.md` - UX Analyst implementation plan

---

## 6. Project Structure Overview

### Key Directories

```
banda-chao/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Localized routes (ar, en, zh)
│   │   ├── products/        # Product pages
│   │   ├── makers/          # Maker pages
│   │   ├── videos/          # Video pages
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   └── beta/            # Beta landing page
│   └── founder/             # Founder-only pages
│       ├── dashboard/       # Main dashboard
│       ├── monitoring/      # Monitoring dashboard
│       ├── beta/            # Beta applications
│       └── assistant/       # AI assistant
├── components/               # React components
│   ├── founder/             # Founder components
│   ├── social/              # Social features
│   ├── layout/              # Layout components
│   └── shared/              # Shared components
├── contexts/                 # React contexts
│   ├── CartContext.tsx      # Shopping cart state
│   └── LanguageContext.tsx  # Language/i18n
├── hooks/                   # Custom hooks
│   ├── useAuth.ts           # Authentication
│   └── useFounderKpis.ts    # Founder KPIs
├── lib/                     # Utilities
│   └── api.ts               # API client
├── types/                   # TypeScript types
│   ├── founder.ts           # Founder types
│   └── index.ts             # General types
└── server/                  # Backend server
    ├── src/
    │   ├── api/             # API routes
    │   ├── middleware/      # Express middleware
    │   ├── lib/             # Utilities
    │   └── utils/           # Helpers
    └── prisma/              # Prisma schema
```

### Important Files

**Configuration:**
- `package.json` - Frontend dependencies
- `server/package.json` - Backend dependencies
- `tsconfig.json` - TypeScript config
- `next.config.js` - Next.js config
- `tailwind.config.js` - Tailwind CSS config

**Documentation:**
- `README.md` - Main documentation
- `BETA_LAUNCH_MONITORING_PLAN.md` - Monitoring plan
- `BETA_DAY_1_AI_STAFF_MISSIONS.md` - Day 1 missions
- `PROJECT_FULL_ENGINEERING_AUDIT_DEC_2025.md` - Engineering audit

---

## 7. Quick Start Checklist

### For Immediate Monitoring

1. **Access Dashboards:**
   - [ ] Open `https://banda-chao.vercel.app/founder/monitoring`
   - [ ] Open `https://banda-chao.vercel.app/founder/dashboard`
   - [ ] Check current KPIs

2. **Check Service Status:**
   - [ ] Vercel: Check deployment status
   - [ ] Render: Check backend service status
   - [ ] Sentry: Check for new errors

3. **Review Recent Activity:**
   - [ ] Check beta applications count
   - [ ] Review new user registrations
   - [ ] Check for any critical errors

### For Development Setup

1. **Clone and Setup:**
   - [ ] Clone repository
   - [ ] Install dependencies (frontend + backend)
   - [ ] Set up environment variables
   - [ ] Run database migrations

2. **Start Development:**
   - [ ] Start backend server (`cd server && npm run dev`)
   - [ ] Start frontend server (`npm run dev`)
   - [ ] Verify both servers running

3. **Test Local Access:**
   - [ ] Frontend: `http://localhost:3000`
   - [ ] Backend API: `http://localhost:3001/api/v1`
   - [ ] Founder Dashboard: `http://localhost:3000/founder`

---

## 8. Contact & Support

### Project Owner
- **Name:** Tariq Al-Janaidi
- **Role:** Founder
- **Contact:** Request access credentials from project owner

### Key Resources
- **GitHub Issues:** For bug reports and feature requests
- **Founder Assistant:** AI-powered consultation at `/founder/assistant`
- **Documentation:** See various `.md` files in repository root

---

## 9. Important Notes

### Security
- ✅ JWT authentication implemented
- ✅ CSRF protection enabled
- ✅ CORS configured
- ✅ Environment variables for secrets
- ⚠️ Rate limiting implemented (basic)
- ⚠️ Input validation needs enhancement

### Performance
- ✅ Prisma queries optimized (using `select` instead of `include`)
- ✅ API response times monitored
- ⚠️ Caching not yet implemented (recommended for future)
- ⚠️ CDN not configured (recommended for static assets)

### Known Limitations
- Local file storage (should migrate to cloud storage)
- No Redis caching layer
- Limited test coverage
- Some hardcoded values need environment variables

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Active Beta Launch Phase

---

## Next Actions for Manus

1. **Immediate (Today):**
   - Review this document thoroughly
   - Request access credentials from project owner
   - Set up local development environment
   - Access monitoring dashboards

2. **This Week:**
   - Monitor Beta launch metrics daily
   - Review and understand codebase structure
   - Plan Phase 1 development tasks
   - Set up issue tracking workflow

3. **Next Week:**
   - Begin Phase 1 development
   - Implement Posts Feed page
   - Enhance Shopping Cart UI
   - Test and deploy incrementally

**Welcome to the Banda Chao project! 🚀**

