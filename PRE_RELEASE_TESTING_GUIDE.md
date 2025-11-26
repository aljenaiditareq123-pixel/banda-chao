# Pre-Release Testing Guide - Banda Chao

**Date**: November 24, 2025  
**Status**: Pre-Release Testing Phase  
**Purpose**: Comprehensive testing checklist before production launch

---

## 🎯 Testing Objectives

1. Verify all critical fixes are working
2. Ensure no 500 errors from old code
3. Validate Gemini 1.5 Pro integration
4. Test all core user flows
5. Verify authentication and authorization
6. Check error handling and edge cases

---

## 🔴 Critical Tests (Must Pass)

### 1. Founder Sessions Fix ✅
**Endpoint**: `GET /api/v1/founder/sessions?limit=10`  
**Expected**: 200 OK with empty array  
**Should NOT**: Return 500 error about missing table

**Test Steps**:
1. Get Founder JWT token from login
2. Call endpoint with Bearer token
3. Verify response: `{ success: true, sessions: [] }`
4. Check logs: No Prisma P2021 errors

---

### 2. Founder AI - Gemini Integration ✅
**Endpoint**: `POST /api/v1/ai/founder`  
**Expected**: 200 OK with real Gemini response  
**Should NOT**: Return 500 error about model not found

**Test Steps**:
1. Get Founder JWT token
2. POST request with message in Arabic
3. Verify response contains `reply` field with Arabic text
4. Check logs: No `gemini-1.5-flash` or `v1beta` errors
5. Verify response is from Gemini 1.5 Pro (not keyword-based)

**Test Message**:
```json
{
  "message": "ما هي المؤشرات الحالية للمنصة؟"
}
```

---

## 🟢 Core Functionality Tests

### 3. Health Check
- **Endpoint**: `GET /api/health`
- **Expected**: 200 OK
- **Verify**: Server is running

### 4. Products API
- **List**: `GET /api/v1/products?page=1&pageSize=20`
- **Detail**: `GET /api/v1/products/{id}`
- **Expected**: 200 OK with data or empty array
- **Verify**: Pagination works, empty state handled

### 5. Makers API
- **List**: `GET /api/v1/makers?page=1&pageSize=20`
- **Detail**: `GET /api/v1/makers/{id}`
- **Expected**: 200 OK with data

### 6. Videos API
- **List**: `GET /api/v1/videos?page=1&pageSize=20`
- **Detail**: `GET /api/v1/videos/{id}`
- **Expected**: 200 OK with data

---

## 🟡 Authentication Tests

### 7. User Registration
- **Endpoint**: `POST /api/v1/auth/register`
- **Test**: Valid registration → 201
- **Test**: Invalid email → 400
- **Test**: Weak password → 400

### 8. User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Test**: Valid credentials → 200 with token
- **Test**: Invalid credentials → 401
- **Test**: Missing fields → 400

### 9. Protected Routes
- **Test**: Access without token → 401
- **Test**: Access with invalid token → 401
- **Test**: Access with valid token → 200

---

## 🔵 Founder-Specific Tests

### 10. Founder KPIs
- **Endpoint**: `GET /api/v1/founder/kpis`
- **Authentication**: Bearer Token (Founder role)
- **Expected**: 200 with KPI data
- **Verify**: All counts are numbers

### 11. Founder AI Assistant (Alternative)
- **Endpoint**: `POST /api/v1/ai/assistant`
- **Authentication**: Bearer Token (Founder role)
- **Expected**: 200 with response

---

## 🟣 Payment Tests (Test Mode)

### 12. Create Checkout Session
- **Endpoint**: `POST /api/v1/payments/checkout`
- **Authentication**: Bearer Token
- **Request**: `{ productId, quantity }`
- **Expected**: 200 with Stripe checkout URL
- **Verify**: TEST MODE only (no real charges)

---

## 🟤 Notification Tests

### 13. Get Notifications
- **Endpoint**: `GET /api/v1/notifications?page=1&pageSize=10`
- **Authentication**: Bearer Token
- **Expected**: 200 with notifications array

### 14. Unread Count
- **Endpoint**: `GET /api/v1/notifications/unread-count`
- **Authentication**: Bearer Token
- **Expected**: 200 with count number

---

## ⚫ Error Handling Tests

### 15. 404 Not Found
- **Endpoint**: `GET /api/v1/nonexistent`
- **Expected**: 404 with error message
- **Verify**: Proper error format

### 16. Invalid Input
- **Test**: Empty required fields → 400
- **Test**: Invalid data types → 400
- **Test**: Malformed JSON → 400

### 17. Unauthorized Access
- **Test**: Protected route without token → 401
- **Test**: Wrong role access → 403

---

## 📊 Test Results Tracking

### Expected Pass Rates:
- **Critical Tests**: 100% (2/2)
- **Core Functionality**: 90%+ (6/7)
- **Authentication**: 100% (3/3)
- **Founder Features**: 100% (2/2)
- **Payment**: 100% (1/1)
- **Notifications**: 100% (2/2)
- **Error Handling**: 100% (3/3)

**Overall Target**: 95%+ pass rate

---

## 🔑 Authentication Setup for Tests

### Step 1: Get JWT Token
```bash
POST /api/v1/auth/login
{
  "email": "founder@bandachao.com",
  "password": "founder_password"
}
```

### Step 2: Use Token
- Format: `Bearer {token}`
- Add to Authorization header
- Token expires in 7 days (JWT_EXPIRES_IN)

---

## 📝 TestSprite Configuration

### Base URL:
```
https://banda-chao-backend.onrender.com
```

### Priority APIs to Add:
1. Health Check (No auth)
2. Founder Sessions (Bearer Token) - **CRITICAL**
3. Founder AI (Bearer Token) - **CRITICAL**
4. Products List (No auth)
5. Makers List (No auth)
6. User Login (No auth - to get tokens)
7. Founder KPIs (Bearer Token)

---

## ✅ Pre-Release Checklist

### Before Testing:
- [ ] Production build rebuilt on Render
- [ ] Environment variables verified
- [ ] Database migrations applied
- [ ] Seed data loaded (optional)
- [ ] GEMINI_API_KEY set correctly
- [ ] JWT_SECRET set correctly

### During Testing:
- [ ] All critical tests pass
- [ ] No 500 errors in logs
- [ ] No Prisma errors
- [ ] No Gemini API errors
- [ ] Authentication works
- [ ] Pagination works
- [ ] Error handling works

### After Testing:
- [ ] Review test results
- [ ] Fix any failing tests
- [ ] Document known issues
- [ ] Update TODO_BANDA_CHAO.md
- [ ] Prepare release notes

---

## 🚨 Known Issues to Watch

1. **Founder Sessions**: Should return empty array (not 500)
2. **Founder AI**: Should use Gemini 1.5 Pro (not flash)
3. **Production Build**: May contain old files until rebuild

---

## 📈 Success Criteria

**Ready for Release When**:
- ✅ All critical tests pass (100%)
- ✅ No 500 errors in production logs
- ✅ Gemini integration working
- ✅ Authentication working
- ✅ Core APIs responding correctly
- ✅ Error handling proper

---

**Last Updated**: November 24, 2025



