# Banda Chao - Frontend Architecture

## Overview

The Banda Chao frontend is built with Next.js 14 using the App Router, TypeScript, and Tailwind CSS.

## Architecture Patterns

### Server Components vs Client Components

**Server Components** (default):
- Used for data fetching and initial page rendering
- No JavaScript sent to client
- Access to backend directly
- Examples: `app/[locale]/products/page.tsx`, `app/[locale]/makers/page.tsx`

**Client Components** (`'use client'`):
- Used for interactivity (hooks, state, events)
- Interactive UI: forms, modals, filters
- Examples: `components/products/ProductListClient.tsx`, `app/login/page.tsx`

### Data Fetching Strategy

**Server-Side Fetching**:
```tsx
// app/[locale]/products/page.tsx
async function fetchAllProducts(): Promise<Product[]> {
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/products`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });
  return response.json();
}
```

**Client-Side Fetching**:
```tsx
// components/products/ProductListClient.tsx
const fetchProducts = async () => {
  const response = await productsAPI.getProducts();
  setProducts(response.data?.data || []);
};
```

## Key Components

### Layout System

```
app/layout.tsx (Root Layout)
  └── app/[locale]/layout.tsx (Locale Layout)
        └── Providers (Auth, Language, Cart, Notifications)
              └── Header + Footer
                    └── Page Content
```

### Component Hierarchy

**Page Components** (`app/[locale]/*/page.tsx`):
- Server components that fetch data
- Pass data to client components
- Handle routing and params

**Client Components** (`components/*/*Client.tsx`):
- Handle user interactions
- Manage local state
- Use hooks (useState, useEffect, etc.)

**UI Components** (`components/ui/*`):
- Reusable, presentational components
- LoadingSpinner, EmptyState, ErrorState

**Context Providers** (`contexts/*.tsx`):
- Global state management
- AuthContext, CartContext, LanguageContext, NotificationsContext

## API Integration

### Centralized API Utilities

**`lib/api-utils.ts`**:
```tsx
export function getApiBaseUrl(): string {
  // Returns NEXT_PUBLIC_API_URL or fallback
  // Handles both server and client environments
}
```

**`lib/api.ts`**:
```tsx
// Axios-based API client with interceptors
// Handles authentication tokens automatically
// Provides typed API methods (productsAPI, makersAPI, etc.)
```

### Usage Pattern

**Server Components**:
```tsx
import { getApiBaseUrl } from '@/lib/api-utils';

const apiBaseUrl = getApiBaseUrl();
const response = await fetch(`${apiBaseUrl}/products`);
```

**Client Components**:
```tsx
import { productsAPI } from '@/lib/api';

const response = await productsAPI.getProducts();
```

## Routing

### Locale-Aware Routing

All public routes are under `/[locale]`:
- `/[locale]/products` - Products listing
- `/[locale]/products/[id]` - Product details
- `/[locale]/makers` - Makers listing
- `/[locale]/videos` - Videos listing
- `/[locale]/checkout` - Checkout (protected)

### Non-Locale Routes

- `/login` - Login page
- `/register` - Registration page
- `/founder/*` - Founder dashboard (protected, FOUNDER only)

### Route Protection

**ProtectedRoute Component**:
```tsx
<ProtectedRoute>
  <CheckoutContent />
</ProtectedRoute>
```

Redirects to `/login` if user is not authenticated.

## State Management

### Context API

1. **AuthContext**: User authentication state
   - `user`, `loading`, `login()`, `logout()`, `register()`

2. **CartContext**: Shopping cart state
   - `items`, `addToCart()`, `removeFromCart()`, `clearCart()`

3. **LanguageContext**: i18n state
   - `language`, `setLanguage()`, `t()` (translate function)

4. **NotificationsContext**: Notifications state
   - `notifications`, `addNotification()`, `markAsRead()`

### Local Storage

- Cart: `banda-chao-cart`
- Language: `language`
- Auth token: `auth_token`

## Styling

### Tailwind CSS

- Utility-first approach
- Responsive design with breakpoints (sm, md, lg, xl)
- Custom colors defined in `tailwind.config.ts`

### RTL Support

- Automatic RTL for Arabic via `LanguageDirection` component
- Sets `dir="rtl"` on `<html>` when language is Arabic

## Performance Optimizations

### Image Handling

- Error states with placeholders
- Lazy loading for images (onError handlers)
- Graceful fallbacks for broken images

### Code Splitting

- Next.js automatic code splitting
- Dynamic imports for heavy components
- Server components reduce client bundle size

### Caching

- ISR (Incremental Static Regeneration) for product/maker pages
- `next: { revalidate: 60 }` for data fetching
- Browser caching for static assets

## Accessibility

### ARIA Labels

- Navigation: `aria-label="Main navigation"`
- Buttons: `aria-label="Switch to Chinese"`
- Images: `alt` text for all images

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order is logical
- Focus states visible

### Screen Readers

- Semantic HTML (`<nav>`, `<header>`, `<main>`, `<aside>`)
- ARIA attributes where needed
- Hidden elements use `aria-hidden="true"`

## Error Handling

### Error Boundaries

- `app/error.tsx` - Global error boundary
- `app/[locale]/error.tsx` - Locale-specific error boundary
- `components/ErrorBoundary.tsx` - Component-level error boundary

### API Error Handling

```tsx
try {
  const response = await productsAPI.getProducts();
} catch (error: any) {
  // Handle specific error codes
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 404) {
    // Show not found message
  }
}
```

## Internationalization

### Translation System

**LanguageContext** provides:
- `language`: Current language ('zh' | 'ar' | 'en')
- `setLanguage(lang)`: Change language
- `t(key)`: Translate function

**Usage**:
```tsx
const { t } = useLanguage();
return <h1>{t('home') || 'Home'}</h1>;
```

### Locale-Aware Formatting

```tsx
// Currency formatting
new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'zh-CN', {
  style: 'currency',
  currency: 'CNY',
}).format(price);

// Date formatting
new Date().toLocaleDateString('ar-SA', {
  year: 'numeric',
  month: 'long',
});
```

## Build & Deployment

### Build Process

```bash
npm run build
```

Stages:
1. Type checking (TypeScript)
2. Linting (ESLint)
3. Next.js compilation
4. Static page generation
5. Bundle optimization

### Output

- `.next/` - Build output
- Static pages (HTML)
- Server components (RSC)
- Client bundles (JS/CSS)

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (exposed to client)
- Other env vars are server-only

## Best Practices

1. **Always use `getApiBaseUrl()`** for API calls
2. **Never hard-code** `/api/v1` prefix
3. **Use Server Components** for data fetching when possible
4. **Client Components** only when needed (hooks, interactivity)
5. **Handle errors gracefully** with fallbacks
6. **Provide loading states** for async operations
7. **Use TypeScript** types consistently
8. **Test with multiple languages** (zh, ar, en)
9. **Ensure RTL works** for Arabic
10. **Accessibility first** - ARIA labels, keyboard navigation

