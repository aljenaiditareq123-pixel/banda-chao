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

**Last Updated:** 2025-01-20
**Status:** ✅ All systems operational and tested

