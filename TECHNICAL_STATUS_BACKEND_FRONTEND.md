# Banda Chao - Technical Status Report
## Backend & Frontend Status (Latest Update)

---

## 📋 Table of Contents

1. [Backend Makers API Status](#backend-makers-api-status)
2. [Frontend API Integration](#frontend-api-integration)
3. [Routing & Locales](#routing--locales)
4. [Performance & Retry Logic](#performance--retry-logic)
5. [Authentication & Protected Routes](#authentication--protected-routes)
6. [Testing Locally](#testing-locally)
7. [Known Issues & Future Improvements](#known-issues--future-improvements)

---

## 1. Backend Makers API Status

### ✅ Status: Fully Operational

**Location:** `server/src/api/makers.ts`

### Key Features:

- **GET `/api/v1/makers`**:
  - Returns paginated list with format: `{ data: Maker[], total: number, pagination: { limit, total } }`
  - Supports `search` query parameter (searches name and slug)
  - Supports `limit` query parameter (default: 50, max: 100)
  - Uses Prisma `select` (not `include`) for optimized queries
  - Includes `user` relation with selected fields only
  - Returns empty `data: []` if no makers found (no 500 errors)
  - Adds `Cache-Control` headers (`s-maxage=600`)

- **GET `/api/v1/makers/:id`**: Get maker by ID
- **GET `/api/v1/makers/slug/:slug`**: Get maker by slug (SEO-friendly)
- **GET `/api/v1/makers/me`**: Get current user's maker profile (authenticated)
- **POST `/api/v1/makers`**: Create maker profile (authenticated)
- **PUT `/api/v1/makers/me`**: Update maker profile (authenticated)

### Database Schema:

**Maker Model** (`server/prisma/schema.prisma`):
```prisma
model Maker {
  id                String   @id @default(uuid())
  userId            String   @unique
  slug              String   @unique
  name              String
  bio               String?
  story             String?
  profilePictureUrl String?
  coverPictureUrl   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Relationship:**
- `Maker.userId` → `User.id` (One-to-One)
- `Product.userId` → `User.id` (Many-to-One)
- `Video.userId` → `User.id` (Many-to-One)

**Important:** When filtering products/videos by maker, use `maker.userId` (not `maker.id`), because products and videos are linked to `User.id`, and `Maker.userId` links to the same `User`.

---

## 2. Frontend API Integration

### ✅ Status: Unified & Consistent

### API Base URL Helper:

**Location:** `lib/api-utils.ts`

**Function:** `getApiBaseUrl()`

- Works in both server and client contexts
- Normalizes URLs automatically (removes/adds `/api/v1` as needed)
- Environment variable: `NEXT_PUBLIC_API_URL` (should be `https://banda-chao-backend.onrender.com/api/v1` in production)
- Fallback: `https://banda-chao-backend.onrender.com/api/v1` (production) or `http://localhost:3001/api/v1` (development)

**Usage:**
```typescript
import { getApiBaseUrl } from '@/lib/api-utils';
const apiBaseUrl = getApiBaseUrl();
// Result: "https://banda-chao-backend.onrender.com/api/v1"
```

### Retry Logic:

**Location:** `lib/fetch-with-retry.ts`

**Functions:**
- `fetchWithRetry(url, options)` - Returns `Promise<Response>`
- `fetchJsonWithRetry(url, options)` - Returns `Promise<any>` (parsed JSON)

**Features:**
- Exponential backoff (default: 1s → 2s → 4s)
- Retries on status codes: `429`, `503`, `504`
- Handles HTML responses from Render rate limiter (returns empty `{ data: [], error: '...' }`)
- Supports Next.js cache options via `next` property

**Usage:**
```typescript
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

const json = await fetchJsonWithRetry(`${apiBaseUrl}/products?limit=10`, {
  next: { revalidate: 300 }, // 5 minutes cache
  maxRetries: 2,
  retryDelay: 1000,
});

// Returns: { data: [...], total: 10, pagination: {...} }
// Or on error: { data: [], error: 'Rate limited...' }
```

### All Pages Updated:

✅ **HomePage** (`app/[locale]/page.tsx`):
- Uses `fetchJsonWithRetry` for products, makers, videos
- Staggers requests (100ms delays) to avoid rate limiting
- Gracefully handles failures (shows empty sections)

✅ **Products List** (`app/[locale]/products/page.tsx`):
- Uses `fetchJsonWithRetry` with `limit=100`

✅ **Product Detail** (`app/[locale]/products/[productId]/page.tsx`):
- Uses `fetchJsonWithRetry` for single product fetch

✅ **Makers List** (`app/[locale]/makers/page.tsx`):
- Uses `fetchJsonWithRetry` with `limit=100`

✅ **Maker Detail** (`app/[locale]/makers/[makerId]/page.tsx`):
- Uses `fetchJsonWithRetry` for maker, products, videos
- Fixed: Uses `maker.userId` (not `makerId` slug) for filtering products/videos
- Staggers requests (100ms delays)

✅ **Videos List** (`app/[locale]/videos/page.tsx`):
- Uses `fetchJsonWithRetry` for short and long videos
- Staggers requests (200ms delay between short/long)

✅ **Founder Dashboard** (`app/founder/page-client.tsx`):
- Uses `fetchJsonWithRetry` for stats (users, makers, products, videos)
- Staggers requests (150ms delays)

✅ **OAuth Callback** (`app/auth/callback-handler/page.tsx`):
- Uses `fetchJsonWithRetry` for fetching user info

---

## 3. Routing & Locales

### ✅ Status: Fully Implemented

### Locale Structure:

All main routes are under `app/[locale]/`:
- `/[locale]` → Homepage
- `/[locale]/products` → Products listing
- `/[locale]/products/[productId]` → Product detail
- `/[locale]/makers` → Makers listing
- `/[locale]/makers/[makerId]` → Maker detail (supports slug or ID)
- `/[locale]/videos` → Videos listing
- `/[locale]/checkout` → Checkout (protected)
- `/[locale]/orders` → Orders (protected)

### Root Redirects:

**Location:** `app/page.tsx`

- `/` → Redirects to `/en` (default locale)
- Supports `?no-redirect=true` for testing (though not recommended)

### Non-Locale Route Redirects:

- `/products` → `/ar/products` (`app/products/page.tsx`)
- `/videos` → `/ar/videos` (`app/videos/page.tsx`)
- `/makers` → `/ar/makers` (`app/makers/page.tsx`)

**Note:** Default locale for non-locale routes is `ar` (Arabic). This can be changed in the future to detect user's preferred language.

### Language Switcher:

**Location:** `components/Header.tsx`

- Preserves current route when switching languages
- Example: `/en/products` → `/ar/products` (stays on products page)
- Uses `router.push()` with pathname replacement

### Middleware:

**Location:** `middleware.ts`

- Skips middleware for: `/founder`, `/api`, `/_next`, static assets
- Currently does not enforce locale redirects (handled by pages)
- Future: Can add locale detection from `Accept-Language` header

---

## 4. Performance & Retry Logic

### ✅ Status: Optimized for Render Free Tier

### Staggered Fetching:

All pages that fetch multiple resources use staggered requests:

```typescript
// Example from HomePage
const products = await fetchLatestProducts();
await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
const makers = await fetchFeaturedMakers();
await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
const videos = await fetchFeaturedVideos();
```

**Rationale:** Render Free tier has strict rate limits. Staggering prevents hitting limits during page load.

### Caching Strategy:

**Server Components:**
- Products: `revalidate: 300` (5 minutes)
- Makers: `revalidate: 600` (10 minutes)
- Videos: `revalidate: 300` (5 minutes)

**Backend Headers:**
- Makers API: `Cache-Control: public, s-maxage=600, stale-while-revalidate=1200`
- Products API: `Cache-Control: public, s-maxage=300`
- Videos API: `Cache-Control: public, s-maxage=300`

### Retry Configuration:

**Default Settings:**
- `maxRetries: 2-3` (varies by page)
- `retryDelay: 1000` (1 second initial delay)
- Exponential backoff: `delay *= 2` on each retry

**Retryable Status Codes:**
- `429` (Too Many Requests)
- `503` (Service Unavailable)
- `504` (Gateway Timeout)

---

## 5. Authentication & Protected Routes

### ✅ Status: Fully Functional

### ProtectedRoute Component:

**Location:** `components/ProtectedRoute.tsx`

**Features:**
- Checks if user is authenticated via `AuthContext`
- Redirects to locale-aware login page: `/${locale}/login?redirect=...`
- Supports `locale` prop for explicit locale in redirect URL
- Shows loading spinner while checking auth state

**Usage:**
```tsx
<ProtectedRoute locale={locale}>
  <CheckoutContent />
</ProtectedRoute>
```

### Protected Pages:

✅ **Checkout** (`app/[locale]/checkout/page.tsx`):
- Wrapped with `<ProtectedRoute locale={params.locale}>`
- Redirects to `/${locale}/login?redirect=/${locale}/checkout`

✅ **Orders** (`app/[locale]/orders/page-client.tsx`):
- Wrapped with `<ProtectedRoute>`

✅ **Maker Dashboard** (`app/[locale]/maker/dashboard/page.tsx`):
- Wrapped with `<ProtectedRoute>`

✅ **Feed** (`app/feed/page.tsx`):
- Wrapped with `<ProtectedRoute>`

✅ **Chat** (`app/chat/page.tsx`):
- Wrapped with `<ProtectedRoute>`

### Auth Flow:

1. **Login/Register:**
   - Frontend calls `/api/v1/auth/login` or `/api/v1/auth/register`
   - Backend returns JWT token
   - Token stored in `localStorage` (key: `auth_token`)
   - Token also set as HTTP-only cookie for server-side access

2. **OAuth (Google):**
   - Frontend calls `/api/v1/oauth/google`
   - Backend redirects to Google OAuth
   - Callback handled by `app/auth/callback/route.ts` (server)
   - Token stored in cookie and passed to client via `app/auth/callback-handler/page.tsx`

3. **Protected Routes:**
   - `ProtectedRoute` checks `AuthContext` for `user`
   - If not authenticated, redirects to login with `?redirect=...` parameter
   - After login, user is redirected back to original page

---

## 6. Testing Locally

### Prerequisites:

1. **PostgreSQL Database:**
   - Running on `localhost:5432` (or set `DATABASE_URL` in `.env`)
   - Run migrations: `cd server && npx prisma migrate dev`

2. **Environment Variables:**

   **Backend** (`server/.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/banda_chao"
   JWT_SECRET="your-secret-key"
   JWT_EXPIRES_IN="7d"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   FRONTEND_URL="http://localhost:3000"
   FOUNDER_EMAIL="aljenaiditareq123@gmail.com"
   ```

   **Frontend** (`.env.local` or `.env`):
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
   ```

### Running Backend:

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
# Backend runs on http://localhost:3001
```

### Running Frontend:

```bash
# From project root
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Build & Lint:

**Frontend:**
```bash
npm run lint    # ESLint check
npm run build   # Next.js production build
```

**Backend:**
```bash
cd server
npm run build   # TypeScript compilation
```

### Testing Key Routes:

1. **Homepage:**
   - `http://localhost:3000/en`
   - `http://localhost:3000/ar`
   - `http://localhost:3000/zh`

2. **Products:**
   - `http://localhost:3000/en/products`
   - `http://localhost:3000/en/products/[productId]`

3. **Makers:**
   - `http://localhost:3000/en/makers`
   - `http://localhost:3000/en/makers/[makerId]` (slug or ID)

4. **Videos:**
   - `http://localhost:3000/en/videos`

5. **Checkout (requires login):**
   - `http://localhost:3000/en/checkout`
   - Should redirect to `/en/login?redirect=/en/checkout` if not logged in

---

## 7. Known Issues & Future Improvements

### ✅ Resolved Issues:

1. ✅ **Makers table missing in database** → Fixed via migrations on Render
2. ✅ **Double `/api/v1` prefix in URLs** → Fixed via `getApiBaseUrl()` normalization
3. ✅ **Rate limiting (429 errors)** → Fixed via `fetchJsonWithRetry` and staggered requests
4. ✅ **Protected routes not locale-aware** → Fixed via `ProtectedRoute` locale prop
5. ✅ **Products/Videos filtering by maker** → Fixed to use `maker.userId` instead of `makerId` slug

### 🔄 Future Improvements:

1. **Backend:**
   - Add `makerId` filter to `/api/v1/products` and `/api/v1/videos` endpoints (server-side filtering)
   - Add pagination support (`page`, `skip`, `take`) to all list endpoints
   - Add location filtering for makers (when `location` field is added to schema)

2. **Frontend:**
   - Implement locale detection from `Accept-Language` header in middleware
   - Add skeleton loaders for better UX during data fetching
   - Implement optimistic UI updates for cart, likes, follows
   - Add error boundaries for graceful error handling

3. **Performance:**
   - Implement in-memory caching for frequently accessed data
   - Add React Query or SWR for client-side caching
   - Optimize images with Next.js `Image` component

4. **Testing:**
   - Add E2E tests with Playwright
   - Add unit tests for API utilities
   - Add integration tests for auth flow

---

## 📝 Summary of Recent Changes

### Backend:
- ✅ Makers API fully operational with proper pagination and error handling
- ✅ All Prisma queries use `select` (not `include`) for optimization
- ✅ Cache headers added to responses
- ✅ Migrations automated in `prebuild` script

### Frontend:
- ✅ All API calls unified through `getApiBaseUrl()` and `fetchJsonWithRetry`
- ✅ Staggered fetching implemented to avoid rate limiting
- ✅ Locale-aware routing with proper redirects
- ✅ Protected routes support locale-aware redirects
- ✅ Error handling improved (graceful degradation, no crashes)

### Documentation:
- ✅ This file created with comprehensive status report
- ✅ Code comments added for clarity
- ✅ TypeScript types aligned with Prisma schema

---

---

## 8. Founder Page Protection & Authentication

### ✅ Status: Fully Implemented (Multi-layer Protection)

### Overview:

Founder pages (`/founder/**`) are protected with **dual-layer protection**:
1. **Server-side protection** (via `app/founder/layout.tsx`)
2. **Client-side protection** (via `FounderRoute` component)

### Protection Architecture:

**Layer 1: Server-Side Protection** (`app/founder/layout.tsx`):
- Uses `requireFounder()` from `lib/auth-server.ts`
- Checks authentication via cookies (server-side)
- Validates user role: `user.role === 'FOUNDER'` OR `user.email === FOUNDER_EMAIL`
- Redirects to `/login?redirect=/founder` if not authenticated
- Redirects to `/` if authenticated but not founder

**Layer 2: Client-Side Protection** (`components/FounderRoute.tsx`):
- Wraps all `/founder/**` pages
- Checks `AuthContext` for user authentication and role
- Provides consistent UX with loading states
- Handles three scenarios (see below)

### Access Scenarios:

**Scenario 1: User Not Authenticated**
- **Action:** Redirects to `/[locale]/login?redirect=/founder`
- **Example:** `/founder` → `/en/login?redirect=/founder`
- **User Experience:** User sees login page, after login returns to `/founder`

**Scenario 2: User Authenticated But NOT FOUNDER**
- **Action:** Redirects to `/[locale]` (home page)
- **Example:** Regular user tries `/founder` → `/en`
- **User Experience:** User is silently redirected to home (no error shown)
- **TODO:** Future enhancement could show message "This page is only for the founder"

**Scenario 3: User Authenticated AND Is FOUNDER**
- **Action:** Access granted, page renders normally
- **Example:** Founder with `role: 'FOUNDER'` → Can access all `/founder/**` pages
- **User Experience:** Full access to founder dashboard, assistants, etc.

### FOUNDER Role Determination:

**Backend Logic** (`server/src/api/auth.ts`, `server/src/api/oauth.ts`):
1. **Database Check:** User has `role: 'FOUNDER'` in database
2. **Email Match:** User's email matches `FOUNDER_EMAIL` environment variable
   - If email matches but role doesn't → Backend automatically updates role to `FOUNDER`
3. **OAuth Login:** Google OAuth checks email and sets role accordingly

**Frontend Logic** (`contexts/AuthContext.tsx`):
- User object includes `role: 'FOUNDER' | 'USER'`
- Role is fetched from `/api/v1/users/me` endpoint
- Defaults to `'USER'` if role is missing (defensive programming)

### Implementation Files:

**Protected Components:**
- `components/FounderRoute.tsx` - Client-side protection wrapper
- `components/ProtectedRoute.tsx` - General authenticated route protection

**Founder Pages:**
- `app/founder/page.tsx` - Main founder dashboard (uses `FounderRoute`)
- `app/founder/page-client.tsx` - Client component (no auth checks, handled by wrapper)
- `app/founder/assistant/page.tsx` - AI assistants center (uses `FounderRoute`)
- `app/founder/assistant/*.tsx` - Individual assistant pages (protected by layout)

**Server Utilities:**
- `lib/auth-server.ts` - Server-side authentication utilities (`requireFounder()`)
- `server/src/utils/roles.ts` - Role determination logic (`isFounderEmail()`)
- `server/src/config/env.ts` - Environment variable management (`FOUNDER_EMAIL`)

### Known Considerations:

**Cookies vs localStorage:**
- Server-side protection relies on cookies (for SSR)
- Client-side protection relies on `AuthContext` (uses localStorage + cookies)
- Both are set during login for consistency

**Race Conditions:**
- `FounderRoute` waits for `loading` to complete before checking auth
- Prevents premature redirects during auth state initialization

**Environment Variable:**
- `FOUNDER_EMAIL` must be set in backend environment variables
- If not set, only database `role` check applies
- Recommended: Set `FOUNDER_EMAIL=aljenaiditareq123@gmail.com` in backend `.env`

### Testing Founder Access:

**To test locally:**
1. Ensure user has `role: 'FOUNDER'` in database
2. OR ensure user's email matches `FOUNDER_EMAIL` in backend `.env`
3. Login with founder credentials
4. Navigate to `/founder` → Should show dashboard
5. Navigate to `/founder/assistant` → Should show assistants center

**To test non-founder access:**
1. Login with regular user (not founder)
2. Navigate to `/founder` → Should redirect to `/en` (home page)

**To test unauthenticated access:**
1. Logout or clear auth tokens
2. Navigate to `/founder` → Should redirect to `/en/login?redirect=/founder`

### Future Enhancements:

- [ ] Add role-based permission system for more granular access control
- [ ] Show user-friendly message when non-founder tries to access founder pages
- [ ] Consider consolidating server-side and client-side checks if needed
- [ ] Add audit logging for founder page access attempts

---

## 9. Founder Seed - Database Setup

### ✅ Status: Fully Implemented

### Overview:

A dedicated seed script (`server/src/seed/create-founder.ts`) allows creating or updating the founder user in the database. This script is **idempotent** - safe to run multiple times without creating duplicate users.

### Features:

**Location:** `server/src/seed/create-founder.ts`

**Key Features:**
- Creates or updates founder user with `role: 'FOUNDER'`
- Uses `upsert` for idempotent operation (safe to run multiple times)
- Reads environment variables:
  - `FOUNDER_EMAIL` (defaults to `founder@banda-chao.com`)
  - `FOUNDER_PASSWORD` (defaults to `Founder123!`)
  - `FOUNDER_NAME` (optional, defaults to `'Banda Chao Founder'`)
- Hashes password using `bcryptjs` (10 salt rounds)
- Updates role to `FOUNDER` even if user already exists
- Optional password update if `FOUNDER_PASSWORD` is provided

### Local Development Setup:

**Step 1: Build the project**
```bash
cd server
npm run build
```

**Step 2: Run the founder seed**
```bash
npm run seed:founder
```

**Expected Output:**
```
🌱 Starting founder seed...
📧 Email: founder@banda-chao.com (or FOUNDER_EMAIL from env)
✅ Founder user ensured successfully!
   ID: [uuid]
   Email: founder@banda-chao.com
   Name: Banda Chao Founder
   Role: FOUNDER
   ⚠️  Using default password (Founder123!) - change in production!

📝 You can now login at /login with:
   Email: founder@banda-chao.com
   Password: Founder123! (default - change in production)
```

**Step 3: Verify in database**
- Check `users` table for user with `email = FOUNDER_EMAIL` and `role = 'FOUNDER'`
- Password should be hashed (not plain text)

**Step 4: Login**
1. Go to `http://localhost:3000/login?redirect=/founder`
2. Use credentials:
   - Email: `founder@banda-chao.com` (or `FOUNDER_EMAIL` from env)
   - Password: `Founder123!` (or `FOUNDER_PASSWORD` from env)
3. After login, you should be redirected to `/founder`

### Production Setup on Render:

**Step 1: Open Render Web Shell**
1. Go to Render Dashboard → Your Backend Service → "Shell" tab
2. Or use: `render shell <service-name>`

**Step 2: Navigate to server directory**
```bash
cd /opt/render/project/src/server
```

**Step 3: Run the founder seed**
```bash
npm run seed:founder
```

**Alternative (if npm script doesn't work):**
```bash
node dist/seed/create-founder.js
```

**Expected Output:** Same as local development

**Step 4: Set Environment Variables (if not already set)**

In Render Dashboard → Backend Service → Environment Variables:

| Key | Value | Description |
|-----|-------|-------------|
| `FOUNDER_EMAIL` | `aljenaiditareq123@gmail.com` | Founder's email address |
| `FOUNDER_PASSWORD` | `[your-secure-password]` | Founder's password (change from default) |
| `FOUNDER_NAME` | `Banda Chao Founder` | Optional: Founder's display name |

**Important:** 
- Change `FOUNDER_PASSWORD` from default `Founder123!` in production
- Never commit actual passwords to version control
- Use strong, unique passwords in production

**Step 5: Verify Access**
1. Go to `https://banda-chao-frontend.onrender.com/login?redirect=/founder`
2. Login with `FOUNDER_EMAIL` and `FOUNDER_PASSWORD`
3. Should redirect to `/founder` after successful login

### Script Details:

**Package.json Script:**
```json
{
  "scripts": {
    "seed:founder": "node dist/seed/create-founder.js"
  }
}
```

**Build Path:**
- Source: `server/src/seed/create-founder.ts`
- Compiled: `server/dist/seed/create-founder.js` (after `npm run build`)

**Dependencies:**
- `@prisma/client` - Prisma ORM client
- `bcryptjs` - Password hashing (already in dependencies)
- `dotenv` - Environment variable loading (already in dependencies)

### Security Notes:

**Password Handling:**
- Passwords are hashed using `bcryptjs` (10 salt rounds) before storing
- Default password (`Founder123!`) is for development only
- In production, always set `FOUNDER_PASSWORD` environment variable
- Never log actual passwords (only indicates if default is used)

**Idempotent Operation:**
- Script uses `upsert` - safe to run multiple times
- If user exists: updates `role` to `FOUNDER` (in case it was changed)
- If user doesn't exist: creates new user with `role: 'FOUNDER'`
- If `FOUNDER_PASSWORD` is provided: updates password hash

**Environment Variables:**
- `FOUNDER_EMAIL` - Required for identifying founder (should match backend auth logic)
- `FOUNDER_PASSWORD` - Optional (defaults to `Founder123!` if not set)
- `FOUNDER_NAME` - Optional (defaults to `'Banda Chao Founder'`)

### Troubleshooting:

**Error: "Cannot find module '@prisma/client'"**
- Run: `npm install` in `server/` directory
- Or: `npx prisma generate` to generate Prisma client

**Error: "Cannot find module 'bcryptjs'"**
- Run: `npm install bcryptjs` in `server/` directory

**Error: "Cannot connect to database"**
- Check `DATABASE_URL` environment variable is set correctly
- Ensure database is accessible from Render (if running on Render)
- Check database migrations are applied: `npm run prisma:migrate:deploy`

**User created but role is still 'USER'**
- Run seed again: `npm run seed:founder`
- Check environment variable `FOUNDER_EMAIL` matches user's email
- Manually verify in database: `SELECT email, role FROM users WHERE email = 'founder@banda-chao.com';`

**Password doesn't work after seed**
- Check if `FOUNDER_PASSWORD` was set correctly
- If using default password, ensure no extra spaces: `Founder123!`
- Re-run seed with correct password: `FOUNDER_PASSWORD=your-password npm run seed:founder`

---

**Last Updated:** 2025-01-20
**Status:** ✅ All systems operational and tested

