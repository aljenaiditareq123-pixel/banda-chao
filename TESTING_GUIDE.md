# Banda Chao - Testing Guide

## Overview

This guide covers testing strategies and TestSprite integration for the Banda Chao platform.

## TestSprite Configuration

### Frontend Testing URL
```
https://banda-chao-frontend.onrender.com
```

### Backend Testing URL
```
https://banda-chao-backend.onrender.com
```

### Test Credentials
- Email: `user1@bandachao.com`
- Password: `password123`

## TestSprite Setup

### Test Mode
The backend supports a `TEST_MODE` environment variable to skip authentication for automated tests.

```env
TEST_MODE=true
```

When `TEST_MODE=true`:
- All authentication middleware is bypassed
- Requests are treated as authenticated
- `req.userId = "test-user"`
- `req.userEmail = "test@example.com"`

⚠️ **Important**: Always disable `TEST_MODE` in production!

## Key Routes for Testing

### Frontend Routes
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/[locale]/products` - Products listing
- `/[locale]/products/[id]` - Product details
- `/[locale]/makers` - Makers listing
- `/[locale]/makers/[id]` - Maker profile
- `/[locale]/videos` - Videos listing
- `/[locale]/checkout` - Checkout (protected)
- `/[locale]/orders` - Orders list (protected)
- `/founder` - Founder dashboard (FOUNDER only)
- `/founder/assistant` - AI Assistants center (FOUNDER only)

### Backend API Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/users` - List users (authenticated)
- `POST /api/v1/users` - Create user
- `DELETE /api/v1/users/:id` - Delete user (authenticated, idempotent)
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/orders` - Create order (authenticated)
- `GET /api/v1/orders` - List user's orders (authenticated)
- `GET /api/v1/makers` - List makers
- `GET /api/v1/videos` - List videos

## Running Tests

### Frontend Tests
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Lint
```bash
npm run lint
```

### Build Verification
```bash
npm run build
```

## TestSprite Expectations

### HTTP Status Codes
- `200` - Success (GET)
- `201` - Created (POST)
- `204` - No Content (DELETE - successful deletion, idempotent)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate/conflicting data)

### Response Formats
- Success: `{ data: {...} }` or direct object
- Error: `{ error: "...", message: "..." }`
- Pagination: `{ data: [...], pagination: { total, page, limit } }`

## Test Markers

For automated testing, the frontend includes specific markers:

- `#login-success-marker` - Visible on login page after successful login (3 seconds)
- `#login-success-redirect-marker` - Present on redirected page when logged in (hidden, always in DOM)
- `#login-error-marker` - Visible on login page when login fails

## Manual QA Checklist

1. **Authentication Flow**
   - ✅ Login with valid credentials
   - ✅ Login with invalid credentials (error message)
   - ✅ Register new user
   - ✅ Logout

2. **Product Flow**
   - ✅ Browse products
   - ✅ Filter by category
   - ✅ View product details
   - ✅ Add to cart
   - ✅ View cart
   - ✅ Checkout (protected)
   - ✅ Complete order

3. **Maker Flow**
   - ✅ Browse makers
   - ✅ Search makers
   - ✅ View maker profile
   - ✅ View maker products/videos

4. **Video Flow**
   - ✅ Browse videos (all/short/long)
   - ✅ View video details
   - ✅ Play/pause videos

5. **Language Switching**
   - ✅ Switch between zh/ar/en
   - ✅ Route preservation when switching
   - ✅ RTL support for Arabic

6. **Founder Dashboard**
   - ✅ Access founder dashboard (FOUNDER only)
   - ✅ View overview stats
   - ✅ Navigate between assistants
   - ✅ Use AI assistants

## Known Issues & Limitations

- Payment integration is mock (no real payment processing)
- Some features may require backend deployment for full testing
- Test mode should only be enabled during automated testing

