# TestSprite Deep Analysis & Comprehensive Fix Plan

## 📊 Executive Summary

**Test Results:** 6 Passed / 5 Failed (Frontend) | 0/0 Backend (Not Tested)

**Status:** Many critical issues remain unresolved despite previous fixes. This document provides a comprehensive mapping of every failure to specific code locations and actionable fixes.

---

## 🔴 CRITICAL FAILURES - Detailed Analysis & Fixes

### 1. **Authentication-Protected Checkout Flow → FAILED**

**TestSprite Report Reference:** Pages 5–7  
**Current Status:** ❌ FAILED  
**Impact:** Users cannot complete checkout after login

#### Root Cause Analysis

1. **Checkout page is NOT protected** (`app/[locale]/checkout/page.tsx`)
   - Line 21: No `ProtectedRoute` wrapper
   - Users can access `/checkout` without authentication
   - After login, redirect to checkout may not work correctly

2. **No redirect after login for checkout flow**
   - `app/login/page.tsx` (line 73): Redirects FOUNDER to `/founder/assistant`
   - Line 76: Redirects regular users to `/${language}`
   - **Missing:** Check for `?redirect=/checkout` query parameter

3. **Cart context may not persist after login**
   - Checkout uses `useCart()` from `contexts/CartContext`
   - Cart may be empty if not properly initialized after auth

#### Files to Fix

1. **`app/[locale]/checkout/page.tsx`** - Add authentication protection
2. **`app/login/page.tsx`** - Add redirect query parameter handling
3. **`app/register/page.tsx`** - Add redirect query parameter handling
4. **`contexts/CartContext.tsx`** - Verify cart persistence across auth state changes

#### Proposed Fixes

**Fix 1.1: Wrap checkout in ProtectedRoute**
```tsx
// app/[locale]/checkout/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LocaleCheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = params;
  
  return (
    <ProtectedRoute>
      {/* Existing checkout content */}
    </ProtectedRoute>
  );
}
```

**Fix 1.2: Add redirect parameter handling to login**
```tsx
// app/login/page.tsx
const searchParams = useSearchParams();
const redirect = searchParams.get('redirect') || `/${language || 'ar'}`;

// After successful login:
if (loggedInUser && loggedInUser.role === 'FOUNDER') {
  router.push('/founder/assistant');
} else if (loggedInUser) {
  router.push(redirect); // Use redirect parameter
}
```

**Fix 1.3: Add checkout redirect to cart actions**
```tsx
// When user clicks "Proceed to Checkout" from cart
// If not logged in, redirect to /login?redirect=/checkout
```

**Priority:** 🔴 **CRITICAL** (Blocks core e-commerce functionality)

---

### 2. **API Error & Retry Handling → FAILED**

**TestSprite Report Reference:** Pages 8–10  
**Current Status:** ❌ FAILED  
**Impact:** Login returned 404, error boundaries not handled properly

#### Root Cause Analysis

1. **404 errors during login/register** (`lib/api.ts`)
   - Lines 141-147: `authAPI` endpoints exist but may fail
   - Line 127-134: 404 errors are logged but not handled gracefully
   - No retry logic for network failures

2. **Error boundaries exist but not used consistently**
   - `app/error.tsx` exists (line 1-41) but only catches unhandled errors
   - `components/ErrorBoundary.tsx` exists but not used in all routes
   - No route-specific error boundaries for `/login`, `/register`, `/checkout`

3. **API interceptor doesn't handle all error cases**
   - Lines 94-138: Only handles 401 and 404
   - Missing: Network errors, timeout errors, 500 errors
   - No exponential backoff retry mechanism

#### Files to Fix

1. **`lib/api.ts`** - Add retry logic and better error handling
2. **`app/[locale]/error.tsx`** - Create locale-specific error boundary
3. **`app/login/page.tsx`** - Better error UI for API failures
4. **`app/register/page.tsx`** - Better error UI for API failures

#### Proposed Fixes

**Fix 2.1: Add retry logic to API client**
```tsx
// lib/api.ts
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retryRequest = async (
  fn: () => Promise<any>,
  retries = MAX_RETRIES
): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    // Don't retry on 4xx errors (client errors)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      throw error;
    }
    
    // Retry on network errors or 5xx errors
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// Wrap API calls with retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ... existing error handling ...
    
    // Add retry for network/5xx errors
    if (!error.response || error.response.status >= 500) {
      const config = error.config;
      if (!config._retry && config._retryCount < MAX_RETRIES) {
        config._retry = true;
        config._retryCount = (config._retryCount || 0) + 1;
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_DELAY * config._retryCount)
        );
        return api(config);
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Fix 2.2: Create locale-specific error boundary**
```tsx
// app/[locale]/error.tsx
'use client';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-red-600 mb-4">⚠️</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ</h2>
        <p className="text-gray-600 mb-8">
          {error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition mr-4"
        >
          إعادة المحاولة
        </button>
        <a
          href="/"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          العودة للصفحة الرئيسية
        </a>
      </div>
    </div>
  );
}
```

**Fix 2.3: Improve login error messages**
```tsx
// app/login/page.tsx
// Add more specific error handling
catch (loginError: any) {
  const status = loginError.response?.status;
  let errorMessage = 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى';
  
  if (status === 404) {
    errorMessage = 'خادم الواجهة الخلفية غير متاح. يرجى المحاولة لاحقاً.';
  } else if (status === 401) {
    errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  } else if (status >= 500) {
    errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
  } else if (!loginError.response) {
    errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
  }
  
  setError(errorMessage);
}
```

**Priority:** 🔴 **CRITICAL** (Affects user experience and reliability)

---

### 3. **Main Navigation & Routing → FAILED**

**TestSprite Report Reference:** Pages 11–13  
**Current Status:** ❌ FAILED  
**Impact:** Top navigation items load empty pages

#### Root Cause Analysis

1. **Navigation links in Header.tsx** (`components/Header.tsx`)
   - Line 50: `/feed` link doesn't include locale (`/${language}/feed` should exist)
   - Line 53: `/${language}/orders` - verify route exists
   - Line 59: `/founder` - should be `/founder/assistant` or `/founder/dashboard`
   - Missing locale prefixes on some routes

2. **Non-locale route `/products` still exists** (`app/products/page.tsx`)
   - Line 1-13: Old client component still uses legacy pattern
   - Should redirect to `/[locale]/products` or be removed

3. **Some routes may not have proper server-side data fetching**
   - Empty pages suggest data fetching failures
   - Need to verify all locale routes fetch data correctly

#### Files to Fix

1. **`components/Header.tsx`** - Fix all navigation links
2. **`app/products/page.tsx`** - Add redirect to locale route
3. **`app/[locale]/feed/page.tsx`** - Verify exists, if not create it
4. **`app/[locale]/orders/page.tsx`** - Verify data fetching works

#### Proposed Fixes

**Fix 3.1: Fix navigation links in Header**
```tsx
// components/Header.tsx
// Line 50: Fix feed link
<Link href={`/${language}/feed`} className="...">
  {t('feed') || 'الخلاصة'}
</Link>

// Line 59: Fix founder link
{user?.role === "FOUNDER" && (
  <Link href={`/${language}/founder/assistant`} className="...">
    {t('founderConsole') || 'المؤسس'}
  </Link>
)}
```

**Fix 3.2: Redirect non-locale products route**
```tsx
// app/products/page.tsx
import { redirect } from 'next/navigation';

export default function ProductsPage() {
  // Default to 'ar' locale, or detect from user preference
  redirect('/ar/products');
}
```

**Fix 3.3: Verify and create missing routes**
- Check if `app/[locale]/feed/page.tsx` exists
- If not, create it with proper data fetching
- Verify `app/[locale]/orders/page.tsx` loads orders correctly

**Priority:** 🔴 **CRITICAL** (Broken navigation is user-facing issue)

---

### 4. **Responsive Layout Across Breakpoints → FAILED**

**TestSprite Report Reference:** Pages 14–16  
**Current Status:** ❌ FAILED  
**Impact:** Login endpoint missing breaks responsiveness tests

#### Root Cause Analysis

1. **Responsive test failures may be due to login 404 errors**
   - If login fails at mobile breakpoints, responsive tests fail
   - Error states may not be responsive-friendly

2. **Mobile navigation may have issues**
   - `components/Header.tsx` has mobile menu (line 16: `mobileMenuOpen`)
   - Need to verify mobile menu works on all breakpoints

3. **Checkout form may not be responsive**
   - `app/[locale]/checkout/page.tsx` uses grid layout
   - Need to verify mobile view works correctly

#### Files to Fix

1. **`app/login/page.tsx`** - Ensure responsive design
2. **`app/register/page.tsx`** - Ensure responsive design
3. **`app/[locale]/checkout/page.tsx`** - Verify mobile layout
4. **`components/Header.tsx`** - Test mobile menu

#### Proposed Fixes

**Fix 4.1: Ensure login page is responsive**
- Already uses responsive classes, but verify error messages display correctly on mobile
- Add mobile-specific styling if needed

**Fix 4.2: Fix responsive checkout layout**
```tsx
// app/[locale]/checkout/page.tsx
// Line 65: Grid should stack on mobile
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
  {/* This should already work, but verify */}
</div>
```

**Priority:** 🟡 **IMPORTANT** (Affects mobile user experience)

---

### 5. **Registration Page Flow → FAILED**

**TestSprite Report Reference:** Pages 17–20  
**Current Status:** ❌ FAILED  
**Impact:** Valid registration attempt ends with 404

#### Root Cause Analysis

1. **Registration endpoint may return 404**
   - `lib/api.ts` line 142-143: `authAPI.register` calls `/auth/register`
   - Backend endpoint exists (from search results: `server/src/api/auth.ts` line 10)
   - But URL construction may be wrong

2. **No error handling for registration failures**
   - Need to check `app/register/page.tsx` error handling

3. **Redirect after registration may fail**
   - After successful registration, user should be logged in and redirected
   - May not handle errors during post-registration login

#### Files to Fix

1. **`app/register/page.tsx`** - Add better error handling
2. **`lib/api.ts`** - Verify registration endpoint URL
3. **`contexts/AuthContext.tsx`** - Verify registration flow

#### Proposed Fixes

**Fix 5.1: Improve registration error handling**
```tsx
// app/register/page.tsx
// Add similar error handling as login (Fix 2.3)
catch (registerError: any) {
  const status = registerError.response?.status;
  let errorMessage = 'فشل التسجيل، يرجى المحاولة مرة أخرى';
  
  if (status === 404) {
    errorMessage = 'خادم الواجهة الخلفية غير متاح. يرجى المحاولة لاحقاً.';
  } else if (status === 400) {
    const backendError = registerError.response?.data?.error;
    if (backendError?.includes('already exists')) {
      errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
    } else {
      errorMessage = backendError || 'بيانات غير صحيحة. يرجى التحقق من المعلومات.';
    }
  } else if (status >= 500) {
    errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
  } else if (!registerError.response) {
    errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
  }
  
  setError(errorMessage);
}
```

**Fix 5.2: Verify registration endpoint**
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Test registration endpoint: `POST /api/v1/auth/register`

**Priority:** 🔴 **CRITICAL** (Blocks new user registration)

---

## 🟡 OUTSTANDING ISSUES - Detailed Fixes

### 6. **Homepage "makers" Call Returns 404**

**Status:** ⚠️ UNRESOLVED  
**Impact:** Homepage fails to load makers section

#### Root Cause Analysis

1. **Inconsistent API URL construction** (`app/[locale]/page.tsx`)
   - Line 34: Uses `${BACKEND_BASE_URL}/api/v1/makers`
   - `BACKEND_BASE_URL` comes from `lib/product-utils.ts` line 5-6
   - May not normalize URL correctly like `lib/api.ts` does

2. **No fallback if makers endpoint doesn't exist**
   - Line 32-49: Fetches makers but doesn't handle missing endpoint gracefully

#### Files to Fix

1. **`app/[locale]/page.tsx`** - Use consistent URL helper
2. **`lib/product-utils.ts`** - Ensure URL normalization matches `lib/api.ts`

#### Proposed Fixes

**Fix 6.1: Use consistent API URL helper**
```tsx
// app/[locale]/page.tsx
// Create a server-side API URL helper
function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') 
    ?? 'https://banda-chao-backend.onrender.com';
  
  // Remove /api/v1 if already present to avoid double appending
  if (baseUrl.endsWith('/api/v1')) {
    return baseUrl;
  }
  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}/v1`;
  }
  return `${baseUrl}/api/v1`;
}

async function fetchFeaturedMakers(): Promise<Maker[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/makers`, {
      next: { revalidate: 120 },
    });
    
    if (!response.ok) {
      // Log but don't throw - return empty array
      console.error(`[HomePage] Failed to fetch makers: ${response.status}`);
      return [];
    }
    
    // ... rest of function
  } catch (error) {
    console.error('[HomePage] Failed to load makers from backend:', error);
    return []; // Return empty array instead of throwing
  }
}
```

**Fix 6.2: Centralize API URL helper**
```tsx
// lib/api-utils.ts (NEW FILE)
export function getApiBaseUrl(): string {
  const normalizeUrl = (url: string): string => {
    url = url.replace(/\/$/, '');
    if (url.endsWith('/api/v1')) return url;
    if (url.endsWith('/api')) return `${url}/v1`;
    return `${url}/api/v1`;
  };

  if (typeof window === 'undefined') {
    // Server-side
    if (process.env.NEXT_PUBLIC_API_URL) {
      return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
    }
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001/api/v1';
    }
    return 'https://banda-chao-backend.onrender.com/api/v1';
  }

  // Client-side
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  }
  
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api/v1';
  }
  
  return 'https://banda-chao-backend.onrender.com/api/v1';
}
```

**Priority:** 🟡 **IMPORTANT** (Affects homepage content)

---

### 7. **Non-Locale Route `/products` Still Uses Old Code**

**Status:** ⚠️ UNRESOLVED  
**Impact:** Confusion, potential SEO issues, duplicate content

#### Root Cause Analysis

1. **`app/products/page.tsx` exists** (line 1-13)
   - Uses old client-side pattern with `Providers`
   - Should redirect to `/[locale]/products`

#### Files to Fix

1. **`app/products/page.tsx`** - Replace with redirect

#### Proposed Fixes

**Fix 7.1: Replace with redirect**
```tsx
// app/products/page.tsx
import { redirect } from 'next/navigation';

// Default to Arabic locale, could be enhanced to detect user preference
export default function ProductsPage() {
  redirect('/ar/products');
}
```

**Priority:** 🟡 **IMPORTANT** (Clean up legacy routes)

---

### 8. **ProductFilters Makes Client-Side API Calls**

**Status:** ⚠️ INEFFICIENT (Not in TestSprite, but architectural issue)  
**Impact:** Unnecessary API calls, slower page loads

#### Root Cause Analysis

1. **`components/products/ProductFilters.tsx`** (lines 36-67)
   - Makes API call on mount to fetch filter options
   - Should receive data from server component instead

#### Files to Fix

1. **`components/products/ProductFilters.tsx`** - Accept data as props
2. **`app/[locale]/products/page.tsx`** - Fetch filter options on server

#### Proposed Fixes

**Fix 8.1: Pass filter data from server**
```tsx
// app/[locale]/products/page.tsx
async function fetchFilterOptions() {
  try {
    const response = await fetch(PRODUCTS_ENDPOINT, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return { categories: [], makers: [] };
    
    const json = await response.json();
    const products = Array.isArray(json.data) ? json.data : [];
    
    const categories = Array.from(new Set(
      products.map((p: any) => p.category).filter(Boolean)
    )) as string[];
    
    const makers = Array.from(new Set(
      products
        .map((p: any) => ({
          id: p.maker?.id || p.userId,
          name: p.maker?.name || p.user?.name || 'Unknown',
        }))
        .filter((m: any) => m.id && m.name !== 'Unknown')
    )) as Array<{ id: string; name: string }>;
    
    return { categories, makers };
  } catch (error) {
    console.error('[ProductsPage] Failed to load filter options:', error);
    return { categories: [], makers: [] };
  }
}

export default async function LocaleProductsPage({ params }: LocaleProductsPageProps) {
  const { locale } = params;
  const [products, filterOptions] = await Promise.all([
    fetchAllProducts(),
    fetchFilterOptions(),
  ]);

  return (
    <ProductListClient 
      locale={locale} 
      products={products}
      filterOptions={filterOptions}
    />
  );
}
```

```tsx
// components/products/ProductFilters.tsx
interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  availableCategories?: string[]; // NEW
  availableMakers?: Array<{ id: string; name: string }>; // NEW
}

export default function ProductFilters({ 
  onFilterChange, 
  initialFilters,
  availableCategories = [], // NEW - from props
  availableMakers = [], // NEW - from props
}: ProductFiltersProps) {
  // Remove useEffect and fetchFilterOptions
  // Use availableCategories and availableMakers from props instead
}
```

**Priority:** 🟢 **MEDIUM** (Performance optimization)

---

## 🟢 ARCHITECTURAL IMPROVEMENTS

### 9. **Centralized Error Handling**

**Recommendation:** Use Next.js 13+ error boundaries more consistently

#### Proposed Changes

1. **Create route-specific error boundaries**
   - `app/[locale]/error.tsx` - Locale-specific errors
   - `app/[locale]/checkout/error.tsx` - Checkout-specific errors
   - `app/[locale]/products/error.tsx` - Products-specific errors

2. **Create API error utility**
   ```tsx
   // lib/api-error-handler.ts
   export function getErrorMessage(error: any): string {
     if (!error.response) {
       return 'Network error. Please check your internet connection.';
     }
     
     const status = error.response.status;
     const message = error.response.data?.error || error.response.data?.message;
     
     switch (status) {
       case 400:
         return message || 'Invalid request. Please check your input.';
       case 401:
         return 'Unauthorized. Please log in.';
       case 404:
         return 'Resource not found.';
       case 500:
         return 'Server error. Please try again later.';
       default:
         return message || 'An error occurred. Please try again.';
     }
   }
   ```

**Priority:** 🟢 **MEDIUM** (Code quality)

---

### 10. **Remove Legacy Non-Locale Routes**

**Recommendation:** Fully migrate to locale-based routing

#### Proposed Changes

1. **Audit all non-locale routes**
   ```bash
   # Find all routes not under [locale]
   find app -type f -name "page.tsx" | grep -v "\[locale\]"
   ```

2. **Create redirect middleware or individual redirects**
   - `/products` → `/[locale]/products`
   - `/videos` → `/[locale]/videos`
   - etc.

3. **Update all internal links to use locale prefix**

**Priority:** 🟢 **MEDIUM** (Code cleanup)

---

### 11. **Backend Test Coverage Plan**

**Status:** ❌ 0/0 tests (Critical gap)

#### Proposed Testing Strategy

1. **Unit Tests** (Jest/Vitest)
   - API route handlers
   - Middleware functions
   - Database utilities
   - Auth utilities

2. **Integration Tests** (Supertest)
   - Full API endpoints
   - Database operations
   - Authentication flows
   - Authorization checks

3. **Test Coverage Goals**
   - Critical paths: 80%+
   - All routes: 60%+
   - Error handling: 70%+

4. **Recommended Test Structure**
   ```
   server/
     src/
       __tests__/
         unit/
           api/
             auth.test.ts
             products.test.ts
           middleware/
             auth.test.ts
         integration/
           api/
             auth-flow.test.ts
             products-flow.test.ts
   ```

**Priority:** 🟡 **IMPORTANT** (Quality assurance)

---

## 📋 PRIORITIZED FIX LIST

### 🔴 CRITICAL (Must Fix Now)

1. ✅ **Fix checkout authentication protection** - `app/[locale]/checkout/page.tsx`
2. ✅ **Add redirect parameter to login/register** - `app/login/page.tsx`, `app/register/page.tsx`
3. ✅ **Fix navigation links in Header** - `components/Header.tsx`
4. ✅ **Redirect non-locale products route** - `app/products/page.tsx`
5. ✅ **Improve API error handling and retry logic** - `lib/api.ts`
6. ✅ **Fix registration 404 errors** - `app/register/page.tsx`

### 🟡 IMPORTANT (Fix Soon)

7. ✅ **Fix homepage makers 404** - `app/[locale]/page.tsx`
8. ✅ **Create locale-specific error boundaries** - `app/[locale]/error.tsx`
9. ✅ **Centralize API URL helper** - `lib/api-utils.ts` (new file)
10. ✅ **Verify all navigation routes exist** - Create missing routes

### 🟢 MEDIUM (Nice to Have)

11. ✅ **Remove ProductFilters client-side API calls** - Server-side data fetching
12. ✅ **Create API error utility** - `lib/api-error-handler.ts`
13. ✅ **Audit and clean up legacy routes** - Remove or redirect

### 🔵 LOW (Future Improvements)

14. ✅ **Backend test coverage plan** - Set up testing infrastructure
15. ✅ **Performance optimization** - Image optimization, caching
16. ✅ **SEO improvements** - Meta tags, sitemap

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Immediate)
- [ ] Fix checkout authentication
- [ ] Fix login/register redirects
- [ ] Fix navigation links
- [ ] Fix API error handling

### Phase 2: Important Fixes (This Week)
- [ ] Fix homepage makers 404
- [ ] Create error boundaries
- [ ] Centralize API utilities

### Phase 3: Medium Priority (Next Sprint)
- [ ] Optimize ProductFilters
- [ ] Clean up legacy routes
- [ ] Set up backend testing

---

## 📝 NOTES

- All fixes should be tested locally before deployment
- Verify environment variables are set in Vercel
- Run TestSprite again after fixes to verify improvements
- Consider adding automated tests to prevent regressions

---

## 🔗 Related Files Reference

### Core Files to Modify
- `app/[locale]/checkout/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `components/Header.tsx`
- `lib/api.ts`
- `app/[locale]/page.tsx`
- `app/products/page.tsx`

### New Files to Create
- `lib/api-utils.ts` - Centralized API URL helper
- `lib/api-error-handler.ts` - Error message utility
- `app/[locale]/error.tsx` - Locale error boundary

### Files to Verify/Test
- `app/[locale]/feed/page.tsx` - Verify exists
- `app/[locale]/orders/page.tsx` - Verify data fetching
- All navigation routes - Verify accessibility

