# TestSprite Quick Setup Guide

## 📝 What to Fill in Each Field

### Current API Entry (Base URL - Needs to be Changed)

**❌ Current Setup (Incorrect)**:
- API name: "Banda Chao Frontend Test9"
- Endpoint: `https://banda-chao-backend.onrender.com` (Base URL only - not a real endpoint)

**✅ What You Should Do**:

---

## Option 1: Add Specific Endpoints Now (Recommended)

### For Each API, Fill In:

#### 1. **API Name**
```
Health Check
```
(Use a descriptive name for each endpoint)

#### 2. **API endpoint / URL**
```
https://banda-chao-backend.onrender.com/api/health
```
(Full URL including the specific endpoint path)

#### 3. **Authentication Type**
- For public APIs: Select **"None - No authentication required"**
- For protected APIs: Select **"Bearer Token"** and add JWT token

#### 4. **Extra testing information (Optional)**
```
Test scenarios:
1. Should return 200 OK
2. Should respond quickly (< 1 second)
3. Should return valid JSON
```

---

## Option 2: Click "Next" Now (Then Add APIs Later)

**If you want to proceed quickly**:
1. ✅ You can click **"Next →"** button now
2. ✅ You'll be able to add more APIs in the next steps
3. ✅ Or come back to add specific endpoints later

**But remember**: The current entry with just base URL won't work as a real API test.

---

## 🎯 Recommended: Add These 3 Critical APIs First

### API 1: Health Check
- **API Name**: `Health Check`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/health`
- **Method**: `GET` (if there's a method selector)
- **Authentication**: `None`
- **Extra Info**: 
  ```
  Critical test: Should return 200 OK.
  This verifies the server is running.
  ```

### API 2: Founder Sessions (Fixed)
- **API Name**: `Founder Sessions - Fixed`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/founder/sessions?limit=10`
- **Method**: `GET`
- **Authentication**: `Bearer Token`
  - Token: (You'll need to get this from `/api/v1/auth/login` first)
- **Extra Info**:
  ```
  CRITICAL FIX: Should return 200 (not 500).
  Expected: { success: true, sessions: [] }
  This was fixed to prevent Prisma P2021 errors.
  ```

### API 3: Founder AI - Gemini
- **API Name**: `Founder AI - Gemini 1.5 Pro`
- **Endpoint**: `https://banda-chao-backend.onrender.com/api/v1/ai/founder`
- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Request Body** (if there's a body field):
  ```json
  {
    "message": "ما هي المؤشرات الحالية؟"
  }
  ```
- **Extra Info**:
  ```
  CRITICAL FIX: Should return 200 with Gemini response (not 500).
  Uses gemini-1.5-pro model.
  Should return Arabic AI response.
  ```

---

## 🚀 Quick Decision Guide

### Click "Next" Now If:
- ✅ You want to see the next steps first
- ✅ You'll add APIs later in the workflow
- ✅ You're just exploring the interface

### Add APIs Now If:
- ✅ You want to test specific endpoints immediately
- ✅ You have JWT tokens ready
- ✅ You want to verify the critical fixes work

---

## 💡 My Recommendation

**Click "Next" for now**, because:
1. You can always go back and add more APIs
2. The current entry (base URL) isn't a real endpoint anyway
3. You'll see the full testing workflow first
4. Then you can add proper endpoints with full details

**But first**, either:
- **Delete** the current "Banda Chao Frontend Test9" entry (trash icon)
- **Or** change it to a real endpoint like `/api/health`

---

## 📋 After Clicking "Next"

You'll likely see options to:
- Configure test scenarios
- Set up authentication globally
- Add more APIs
- Run the tests

Then you can add all the APIs from `TESTSPRITE_API_LIST.md` with proper details.

---

**Bottom Line**: You can click "Next" now, but remember to add real endpoints (not just base URL) before running tests!


