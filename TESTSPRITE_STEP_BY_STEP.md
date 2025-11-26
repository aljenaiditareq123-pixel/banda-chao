# TestSprite Step-by-Step Setup

## ✅ Current Status
- **Health Check** API added ✅
- Ready to add critical APIs

---

## 🎯 Step 1: Add Founder Sessions API (CRITICAL)

### Click "+ Add API" button

**Fill in the form:**

1. **API name:**
   ```
   Founder Sessions - Fixed
   ```

2. **API endpoint / URL:**
   ```
   https://banda-chao-backend.onrender.com/api/v1/founder/sessions?limit=10
   ```

3. **Authentication Type:**
   - Select: **"Bearer - Secure token-based authentication"**
   - You'll need to add JWT token later (after login)

4. **Extra testing information (Optional):**
   ```
   CRITICAL FIX TEST:
   - Should return 200 OK (NOT 500)
   - Expected: { success: true, sessions: [] }
   - This was fixed to prevent Prisma P2021 errors
   - Must use Bearer Token authentication
   ```

---

## 🎯 Step 2: Add Founder AI API (CRITICAL)

### Click "+ Add API" button again

**Fill in the form:**

1. **API name:**
   ```
   Founder AI - Gemini 1.5 Pro
   ```

2. **API endpoint / URL:**
   ```
   https://banda-chao-backend.onrender.com/api/v1/ai/founder
   ```

3. **Authentication Type:**
   - Select: **"Bearer - Secure token-based authentication"**

4. **Extra testing information (Optional):**
   ```
   CRITICAL FIX TEST:
   - Method: POST
   - Should return 200 OK (NOT 500)
   - Uses gemini-1.5-pro model
   - Request Body: { "message": "ما هي المؤشرات الحالية؟" }
   - Expected: { success: true, reply: "Arabic AI response...", timestamp: "..." }
   - Must use Bearer Token authentication
   ```

---

## 🎯 Step 3: Add Public APIs (No Auth Needed)

### API 3: Products List
- **API name:** `Products List`
- **Endpoint:** `https://banda-chao-backend.onrender.com/api/v1/products?page=1&pageSize=20`
- **Authentication:** `None`

### API 4: Makers List
- **API name:** `Makers List`
- **Endpoint:** `https://banda-chao-backend.onrender.com/api/v1/makers?page=1&pageSize=20`
- **Authentication:** `None`

### API 5: User Login (To Get JWT Token)
- **API name:** `User Login`
- **Endpoint:** `https://banda-chao-backend.onrender.com/api/v1/auth/login`
- **Authentication:** `None`
- **Extra info:**
  ```
  Method: POST
  Request Body: { "email": "founder@bandachao.com", "password": "..." }
  Use response token for Bearer authentication in other tests
  ```

---

## 🔑 How to Get JWT Token for Bearer Authentication

### Option 1: Use Login API in TestSprite
1. Add "User Login" API (see Step 3)
2. Run it with credentials
3. Copy the `token` from response
4. Use it in Bearer Token field for other APIs

### Option 2: Use Existing Token
If you have a token from previous tests, use it directly.

### Option 3: Get Token Manually
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"founder@bandachao.com","password":"your_password"}'
```

---

## 📋 Recommended API Order

### Priority 1 (Critical - Test First):
1. ✅ Health Check (Already added)
2. ⬜ Founder Sessions - Fixed
3. ⬜ Founder AI - Gemini 1.5 Pro

### Priority 2 (Important):
4. ⬜ User Login (to get tokens)
5. ⬜ Products List
6. ⬜ Makers List

### Priority 3 (Optional):
7. ⬜ Founder KPIs
8. ⬜ Notifications
9. ⬜ Payment Checkout

---

## 🚀 After Adding APIs

1. **Click "Next →"** button
2. TestSprite will generate test cases
3. You can review and modify tests
4. Run the tests
5. Check results

---

## ⚠️ Important Notes

### For Bearer Token APIs:
- You MUST have a valid JWT token
- Token format: `Bearer {token}` (TestSprite adds "Bearer" automatically)
- Token expires in 7 days (default JWT_EXPIRES_IN)

### For POST APIs:
- TestSprite will ask for Request Body
- Add JSON body in the test configuration
- Example for Founder AI:
  ```json
  {
    "message": "ما هي المؤشرات الحالية؟"
  }
  ```

---

## ✅ Quick Checklist

Before clicking "Next":
- [ ] Health Check added ✅
- [ ] Founder Sessions added (with Bearer auth)
- [ ] Founder AI added (with Bearer auth)
- [ ] User Login added (to get tokens)
- [ ] At least 2-3 public APIs added

---

**Ready to proceed?** Click "Next →" after adding the critical APIs!



