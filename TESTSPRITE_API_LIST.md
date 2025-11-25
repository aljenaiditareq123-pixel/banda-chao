# TestSprite API List - Banda Chao

**Date**: November 24, 2025  
**Purpose**: Complete API list for pre-release testing  
**Base URL**: `https://banda-chao-backend.onrender.com`

---

## 🔴 Critical APIs (Must Test After Fixes)

### 1. Health Check
- **API Name**: `Health Check`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/health`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 200
- **Expected Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "...",
    "uptime": ...
  }
  ```

### 2. Founder Sessions (Fixed - No More 500 Errors)
- **API Name**: `Founder Sessions - Fixed`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/founder/sessions?limit=10`
- **Method**: `GET`
- **Authentication**: Bearer Token (JWT - Founder role)
- **Expected Status**: 200 (NOT 500)
- **Expected Response**:
  ```json
  {
    "success": true,
    "sessions": [],
    "message": "Sessions feature not yet implemented"
  }
  ```
- **Testing Info**: 
  ```
  This endpoint was fixed to return empty array instead of 500 error.
  Should NOT throw Prisma P2021 error about missing founder_sessions table.
  ```

### 3. Founder AI - Gemini 1.5 Pro (Fixed - Real AI)
- **API Name**: `Founder AI - Gemini Integration`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/ai/founder`
- **Method**: `POST`
- **Authentication**: Bearer Token (JWT - Founder role)
- **Request Body**:
  ```json
  {
    "message": "ما هي المؤشرات الحالية للمنصة؟"
  }
  ```
- **Expected Status**: 200 (NOT 500)
- **Expected Response**:
  ```json
  {
    "success": true,
    "reply": "بناءً على المؤشرات الحالية...",
    "timestamp": "2025-11-24T..."
  }
  ```
- **Testing Info**:
  ```
  This endpoint uses real Gemini 1.5 Pro (not gemini-1.5-flash).
  Should NOT throw 404 error about model not found.
  Should return actual AI-generated response in Arabic.
  ```

---

## 🟢 Core Public APIs

### 4. Products List
- **API Name**: `Products List`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/products?page=1&pageSize=20`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 200
- **Expected Response**:
  ```json
  {
    "products": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": ...,
      "totalPages": ...
    }
  }
  ```

### 5. Products List - Empty State
- **API Name**: `Products List - Empty State`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/products?page=1&pageSize=20`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 200
- **Expected Response** (if no products):
  ```json
  {
    "products": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  }
  ```
- **Testing Info**: Frontend should show EmptyState component when products array is empty.

### 6. Product Detail
- **API Name**: `Product Detail`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/products/{productId}`
- **Method**: `GET`
- **Authentication**: None
- **Example**: `https://banda-chao-backend.onrender.com/api/v1/products/d62d6d88-4630-4993-b84a-8cb894690aa6`
- **Expected Status**: 200 or 404

### 7. Makers List
- **API Name**: `Makers List`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/makers?page=1&pageSize=20`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 200

### 8. Maker Detail
- **API Name**: `Maker Detail`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/makers/{makerId}`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 200 or 404

### 9. Videos List
- **API Name**: `Videos List`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/videos?page=1&pageSize=20`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 200

### 10. Video Detail
- **API Name**: `Video Detail`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/videos/{videoId}`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 200 or 404

---

## 🟡 Authentication APIs

### 11. User Registration
- **API Name**: `User Registration`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/auth/register`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }
  ```
- **Expected Status**: 201 or 400 (if validation fails)

### 12. User Login
- **API Name**: `User Login`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "founder@bandachao.com",
    "password": "founder_password"
  }
  ```
- **Expected Status**: 200
- **Expected Response**:
  ```json
  {
    "token": "eyJhbGc...",
    "user": {...}
  }
  ```
- **Testing Info**: Use this token for authenticated endpoints.

### 13. Get Current User
- **API Name**: `Get Current User`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/users/me`
- **Method**: `GET`
- **Authentication**: Bearer Token (JWT)
- **Expected Status**: 200 or 401

---

## 🟠 Founder-Specific APIs

### 14. Founder KPIs
- **API Name**: `Founder KPIs`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/founder/kpis`
- **Method**: `GET`
- **Authentication**: Bearer Token (JWT - Founder role)
- **Expected Status**: 200
- **Expected Response**:
  ```json
  {
    "totalArtisans": ...,
    "totalProducts": ...,
    "totalVideos": ...,
    "totalOrders": ...,
    "totalUsers": ...,
    "newArtisansThisWeek": ...,
    "newOrdersThisWeek": ...
  }
  ```

### 15. Founder AI Assistant (Alternative Endpoint)
- **API Name**: `Founder AI Assistant`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/ai/assistant`
- **Method**: `POST`
- **Authentication**: Bearer Token (JWT - Founder role)
- **Request Body**:
  ```json
  {
    "message": "كيف يمكنني تحسين المنصة؟",
    "conversationId": "founder-{userId}",
    "clearContext": false
  }
  ```
- **Expected Status**: 200

---

## 🔵 Maker APIs

### 16. Maker Onboarding
- **API Name**: `Maker Onboarding`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/makers/onboard`
- **Method**: `POST`
- **Authentication**: Bearer Token (JWT)
- **Request Body**:
  ```json
  {
    "displayName": "Test Maker",
    "bio": "Test bio",
    "country": "UAE",
    "city": "Dubai",
    "languages": ["ar", "en"]
  }
  ```
- **Expected Status**: 201

### 17. Get Current Maker Profile
- **API Name**: `Get Current Maker`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/makers/me`
- **Method**: `GET`
- **Authentication**: Bearer Token (JWT - Maker role)
- **Expected Status**: 200

---

## 🟣 Payment APIs (Test Mode)

### 18. Create Checkout Session
- **API Name**: `Create Checkout Session`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/payments/checkout`
- **Method**: `POST`
- **Authentication**: Bearer Token (JWT)
- **Request Body**:
  ```json
  {
    "productId": "d62d6d88-4630-4993-b84a-8cb894690aa6",
    "quantity": 1
  }
  ```
- **Expected Status**: 200
- **Expected Response**:
  ```json
  {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_..."
  }
  ```
- **Testing Info**: This is in TEST MODE. No real money will be charged.

---

## 🟤 Notification APIs

### 19. Get Notifications
- **API Name**: `Get Notifications`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/notifications?page=1&pageSize=10`
- **Method**: `GET`
- **Authentication**: Bearer Token (JWT)
- **Expected Status**: 200

### 20. Get Unread Count
- **API Name**: `Notifications Unread Count`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/notifications/unread-count`
- **Method**: `GET`
- **Authentication**: Bearer Token (JWT)
- **Expected Status**: 200

---

## ⚫ Error Handling Tests

### 21. 404 Not Found
- **API Name**: `404 Not Found Test`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/nonexistent`
- **Method**: `GET`
- **Authentication**: None
- **Expected Status**: 404
- **Expected Response**:
  ```json
  {
    "success": false,
    "message": "Route not found",
    "code": "NOT_FOUND"
  }
  ```

### 22. Invalid Authentication
- **API Name**: `Invalid Auth Test`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/founder/kpis`
- **Method**: `GET`
- **Authentication**: Bearer Token (Invalid or missing)
- **Expected Status**: 401 or 403

---

## 📋 Testing Scenarios Summary

### Critical Fixes to Verify:
1. ✅ `/api/v1/founder/sessions` returns 200 (not 500)
2. ✅ `/api/v1/ai/founder` returns 200 with Gemini response (not 500)
3. ✅ No more `founder_sessions` table errors
4. ✅ No more `gemini-1.5-flash` errors

### General API Health:
1. ✅ All public endpoints return 200
2. ✅ Pagination works correctly
3. ✅ Authentication works correctly
4. ✅ Error handling returns proper status codes
5. ✅ Empty states handled gracefully

---

## 🔑 Authentication Setup

### For TestSprite:
1. First, call `/api/v1/auth/login` to get JWT token
2. Use that token in "Bearer Token" authentication field
3. Token format: `Bearer {token}`

### Test Credentials (if available):
- Founder email: `aljenaiditareq123@gmail.com` (from env vars)
- Or create test user via registration endpoint

---

## 📝 Extra Testing Information Template

For each API, you can add:

```
Test scenarios:
1. Successful request (200)
2. Invalid parameters (400)
3. Unauthorized access (401/403)
4. Not found (404)
5. Server error handling (500)

Expected behaviors:
- Proper error messages
- Consistent response format
- Correct status codes
```

---

## 🚀 Pre-Release Checklist

Before running tests:
- [ ] Production build rebuilt on Render
- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Seed data loaded (optional)
- [ ] JWT tokens available for authenticated endpoints

---

**Last Updated**: November 24, 2025


