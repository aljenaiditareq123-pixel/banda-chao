# 🔐 Authentication Flow & Founder Access Report
## Complete Guide to Accessing Founder Pages in Production

**Date:** 2025-11-15  
**Production URL:** https://banda-chao.vercel.app  
**Backend URL:** https://banda-chao-backend.onrender.com

---

## 📋 Executive Summary

The authentication system uses:
- **JWT tokens** stored in `localStorage` (key: `auth_token`)
- **Bearer token** authentication via `Authorization` header
- **Role-based access control** (FOUNDER vs USER)
- **Client-side AuthContext** for user state management
- **Backend Express middleware** for token verification

---

## A) Exact Login Steps

### Step 1: Navigate to Login Page

**URL:** `https://banda-chao.vercel.app/login`

**Expected Behavior:**
- Login form appears with:
  - Email input field
  - Password input field
  - "تسجيل الدخول" (Login) button
  - Google OAuth button (optional)

---

### Step 2: Enter Credentials

**Email Format:**
- Standard email format: `user@example.com`
- No special requirements
- Case-insensitive

**Password Format:**
- Minimum 6 characters
- No special character requirements
- Plain text (hashed on backend)

**Example Credentials (for Founder):**
- Email: `aljenaiditareq123@gmail.com` (or your founder email)
- Password: (your registered password)

---

### Step 3: Submit Login Form

**What Happens:**
1. Frontend calls: `POST /api/v1/auth/login`
   - URL: `https://banda-chao-backend.onrender.com/api/v1/auth/login`
   - Body: `{ email, password }`
   - Headers: `Content-Type: application/json`

2. Backend validates credentials:
   - Checks if user exists in database
   - Verifies password hash using bcrypt
   - Retrieves user role from database (`user.role` field)

3. Backend returns:
   ```json
   {
     "message": "Login successful",
     "user": {
       "id": "...",
       "email": "...",
       "name": "...",
       "profilePicture": null,
       "role": "FOUNDER",  // ← Critical: Must be "FOUNDER"
       "createdAt": "..."
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // JWT token
   }
   ```

4. Frontend (`AuthContext.login()`):
   - Stores token in `localStorage.setItem('auth_token', token)`
   - Updates `user` state with user data (including `role`)
   - Sets `token` state

5. Redirect logic (`app/login/page.tsx`):
   ```typescript
   if (loggedInUser.role === 'FOUNDER') {
     router.push('/founder/assistant');  // ← Redirects to assistant
   } else {
     router.push('/');  // ← Regular users go to home
   }
   ```

---

### Step 4: Token Storage

**Location:** `localStorage` (browser storage)

**Key:** `auth_token`

**Value:** JWT token string (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**Persistence:**
- Survives page refreshes
- Survives browser restarts
- Cleared on logout or 401 error

**How to Verify:**
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Select "Local Storage" → `https://banda-chao.vercel.app`
4. Look for key: `auth_token`
5. Value should be a long JWT string

---

### Step 5: Expected Behavior After Login

**For FOUNDER users:**
- ✅ Redirected to: `/founder/assistant`
- ✅ `AuthContext` loads user data via `GET /api/v1/users/me`
- ✅ User state includes: `{ role: 'FOUNDER', ... }`
- ✅ Can access all `/founder/*` routes

**For regular users:**
- ✅ Redirected to: `/` (homepage)
- ✅ Cannot access `/founder/*` routes (redirected to `/`)

---

## B) Confirm Founder Access

### How to Verify Backend Returns `role = 'FOUNDER'`

#### Method 1: Check Login Response

**After successful login, check browser console:**

```javascript
// In browser console (F12 → Console tab)
localStorage.getItem('auth_token')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Decode JWT (optional - for debugging)
// Use jwt.io or decode in console
```

**Check Network Tab:**
1. Open DevTools → Network tab
2. Find request: `POST /api/v1/auth/login`
3. Check Response:
   ```json
   {
     "user": {
       "role": "FOUNDER"  // ← Must be "FOUNDER"
     }
   }
   ```

---

#### Method 2: Check `/users/me` Response

**After login, `AuthContext` automatically calls:**

**Request:**
```
GET https://banda-chao-backend.onrender.com/api/v1/users/me
Headers:
  Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "aljenaiditareq123@gmail.com",
  "name": "...",
  "profilePicture": null,
  "bio": null,
  "role": "FOUNDER",  // ← Critical: Must be "FOUNDER"
  "createdAt": "...",
  "updatedAt": "..."
}
```

**How to Verify:**
1. Open DevTools → Network tab
2. Find request: `GET /api/v1/users/me`
3. Check Response → `role` field
4. Should be: `"FOUNDER"`

---

#### Method 3: Check AuthContext State

**In browser console:**
```javascript
// React DevTools (if installed)
// Or check component state in DevTools

// The user object should have:
{
  role: "FOUNDER"  // ← Must be "FOUNDER"
}
```

---

### What `/users/me` Should Return

**Endpoint:** `GET /api/v1/users/me`

**Authentication:** Required (Bearer token in `Authorization` header)

**Backend Code (`server/src/api/users.ts`):**
```typescript
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      profilePicture: true,
      bio: true,
      role: true,  // ← Retrieved from database
      createdAt: true,
      updatedAt: true
    }
  });

  // Use role from database (fallback to calculation if missing)
  const role = user.role || getUserRoleFromEmail(user.email);

  res.json({
    ...user,
    role  // ← Must be "FOUNDER" for founder access
  });
});
```

**Critical Points:**
- `role` comes from database `User.role` field
- Fallback: `getUserRoleFromEmail()` if role is missing
- Must be `"FOUNDER"` (string, uppercase) for founder access

---

### How AuthContext Updates

**Flow:**
1. **On Mount (`useEffect`):**
   - Checks `localStorage.getItem('auth_token')`
   - If token exists → calls `fetchUser()`
   - `fetchUser()` → `GET /api/v1/users/me`
   - Updates `user` state with response

2. **After Login:**
   - `login()` function:
     - Calls `POST /api/v1/auth/login`
     - Receives `{ user, token }`
     - Stores token: `localStorage.setItem('auth_token', token)`
     - Updates state: `setUser(loggedInUser)`, `setToken(authToken)`
     - Returns `loggedInUser` (used for redirect)

3. **Token in Requests:**
   - Axios interceptor (`lib/api.ts`):
     ```typescript
     api.interceptors.request.use((config) => {
       const token = localStorage.getItem('auth_token');
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     });
     ```

---

## C) How to Enter the Founder Page in Production

### Direct Access URLs

**1. Founder Landing Page:**
```
https://banda-chao.vercel.app/founder
```

**2. Founder Assistant Hub:**
```
https://banda-chao.vercel.app/founder/assistant
```

**3. Individual Assistant Pages:**
```
https://banda-chao.vercel.app/founder/assistant/founder-brain
https://banda-chao.vercel.app/founder/assistant/technical-brain
https://banda-chao.vercel.app/founder/assistant/security-brain
https://banda-chao.vercel.app/founder/assistant/marketing-brain
https://banda-chao.vercel.app/founder/assistant/content-brain
https://banda-chao.vercel.app/founder/assistant/logistics-brain
```

---

### Required Conditions

**1. Must be logged in:**
- Token must exist in `localStorage` (`auth_token`)
- Token must be valid (not expired)
- Backend must accept token (valid JWT signature)

**2. Must have FOUNDER role:**
- `user.role === 'FOUNDER'` (exact string match)
- Role must come from database (not calculated)

**3. No query parameters needed:**
- URLs work as-is
- No special headers required
- No cookies needed (uses localStorage)

---

### Access Flow

**When you visit `/founder` or `/founder/assistant/*`:**

1. **Page loads** → `useAuth()` hook runs
2. **AuthContext checks:**
   - `loading` state (initially `true`)
   - `user` state (initially `null`)
3. **If token exists:**
   - Calls `GET /api/v1/users/me`
   - Updates `user` state
4. **Page component checks (`useEffect`):**
   ```typescript
   if (loading) return;  // Show loading spinner
   
   if (!user) {
     router.replace('/login');  // ← Redirect if not logged in
     return;
   }
   
   if (user.role !== 'FOUNDER') {
     router.replace('/');  // ← Redirect if not FOUNDER
     return;
   }
   ```
5. **If all checks pass:**
   - Page renders normally
   - Founder content is displayed

---

## D) Fixes if Access is Blocked

### Issue 1: Redirects to `/login`

**Symptoms:**
- Visiting `/founder` → redirects to `/login`
- No error message shown

**Possible Causes:**
1. **No token in localStorage:**
   - Token was never stored
   - Token was cleared
   - Browser cleared localStorage

2. **Token is invalid/expired:**
   - Token expired (default: 7 days)
   - Token signature invalid
   - Backend JWT_SECRET mismatch

3. **Backend `/users/me` returns 401:**
   - Token not sent in request
   - Token format wrong
   - Backend rejects token

**How to Fix:**

**Step 1: Check localStorage**
```javascript
// In browser console
localStorage.getItem('auth_token')
// Should return a JWT string, not null
```

**If null:**
- Log in again at `/login`
- Check that login succeeds
- Verify token is stored after login

**Step 2: Check Network Request**
- Open DevTools → Network tab
- Visit `/founder`
- Find request: `GET /api/v1/users/me`
- Check:
  - **Request Headers:** Should include `Authorization: Bearer <token>`
  - **Response Status:** Should be `200`, not `401`

**Step 3: Verify Backend URL**
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Should be: `https://banda-chao-backend.onrender.com` (no trailing slash, no `/api/v1`)
- If wrong → Update in Vercel dashboard → Redeploy

**Step 4: Clear and Re-login**
```javascript
// In browser console
localStorage.clear();
// Then go to /login and log in again
```

---

### Issue 2: `user.role` Returns `"USER"` Instead of `"FOUNDER"`

**Symptoms:**
- Login succeeds
- But visiting `/founder` → redirects to `/`
- Console shows: `user.role === "USER"`

**Possible Causes:**
1. **Database role is not set:**
   - User record in database has `role = 'USER'` (default)
   - Or `role = null` (falls back to calculation)

2. **Email-based role calculation fails:**
   - `getUserRoleFromEmail()` doesn't recognize founder email
   - Email format doesn't match founder pattern

**How to Fix:**

**Step 1: Verify Database Role**
- Connect to PostgreSQL database
- Run query:
  ```sql
  SELECT id, email, role FROM "users" WHERE email = 'aljenaiditareq123@gmail.com';
  ```
- Check `role` column:
  - Should be: `'FOUNDER'` (enum value)
  - If `'USER'` or `NULL` → Update it

**Step 2: Update User Role in Database**
```sql
UPDATE "users" 
SET role = 'FOUNDER' 
WHERE email = 'aljenaiditareq123@gmail.com';
```

**Or use Prisma script:**
```typescript
// server/scripts/update-founder-role.ts
import { prisma } from '../src/utils/prisma';

async function updateFounderRole() {
  const email = 'aljenaiditareq123@gmail.com';
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'FOUNDER' }
  });
  
  console.log('✅ Updated user role:', user);
}

updateFounderRole();
```

**Step 3: Verify After Update**
- Log out and log in again
- Check `/users/me` response → `role` should be `"FOUNDER"`
- Try accessing `/founder` → should work

---

### Issue 3: Cookies Not Stored / Token Not Sent

**Symptoms:**
- Login succeeds
- But `/users/me` returns 401
- Network tab shows: `Authorization` header missing

**Possible Causes:**
1. **Axios interceptor not working:**
   - `localStorage` not accessible
   - Interceptor code has error

2. **CORS issues:**
   - Backend doesn't allow `Authorization` header
   - Frontend domain not in CORS whitelist

3. **Environment variable wrong:**
   - `NEXT_PUBLIC_API_URL` points to wrong backend
   - Backend URL mismatch

**How to Fix:**

**Step 1: Check Axios Interceptor**
- Open `lib/api.ts`
- Verify interceptor code:
  ```typescript
  api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
  ```

**Step 2: Check CORS Configuration**
- Backend (`server/src/index.ts`) should allow:
  ```typescript
  app.use(cors({
    origin: [
      'https://banda-chao.vercel.app',
      'http://localhost:3000'
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```

**Step 3: Verify Environment Variable**
- In Vercel dashboard:
  - Go to Project → Settings → Environment Variables
  - Check `NEXT_PUBLIC_API_URL`
  - Should be: `https://banda-chao-backend.onrender.com`
  - **NOT:** `https://banda-chao-backend.onrender.com/api/v1` (no `/api/v1`)
  - **NOT:** `http://localhost:3001` (production should use Render)

**Step 4: Test Token Manually**
```javascript
// In browser console
const token = localStorage.getItem('auth_token');
fetch('https://banda-chao-backend.onrender.com/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(console.log);
// Should return user object with role: "FOUNDER"
```

---

### Issue 4: Backend URL Mismatch

**Symptoms:**
- All API calls fail
- Network errors (CORS, 404, etc.)
- `NEXT_PUBLIC_API_URL` not set correctly

**How to Fix:**

**Step 1: Check Vercel Environment Variables**
1. Go to: https://vercel.com/dashboard
2. Select project: `banda-chao`
3. Go to: Settings → Environment Variables
4. Check `NEXT_PUBLIC_API_URL`:
   - **Correct:** `https://banda-chao-backend.onrender.com`
   - **Wrong:** `https://banda-chao-backend.onrender.com/api/v1` (has `/api/v1`)
   - **Wrong:** `http://localhost:3001` (localhost)

**Step 2: Update if Wrong**
1. Click "Edit" on `NEXT_PUBLIC_API_URL`
2. Set value to: `https://banda-chao-backend.onrender.com`
3. **Important:** No trailing slash, no `/api/v1`
4. Save
5. **Redeploy** the project (or wait for auto-redeploy)

**Step 3: Verify After Redeploy**
- Check build logs in Vercel
- Should show: `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com`
- Test login → should work

---

## 🔍 Debugging Checklist

### Before Accessing Founder Pages:

- [ ] **Logged in?** Check `localStorage.getItem('auth_token')` → Should return JWT string
- [ ] **Token valid?** Check Network tab → `GET /users/me` → Should return 200, not 401
- [ ] **Role correct?** Check `/users/me` response → `role` should be `"FOUNDER"`
- [ ] **Backend URL correct?** Check `NEXT_PUBLIC_API_URL` in Vercel → Should be Render URL
- [ ] **CORS working?** Check Network tab → No CORS errors in console
- [ ] **AuthContext loaded?** Check React DevTools → `user` state should have `role: "FOUNDER"`

---

## 📝 Summary

**To access Founder pages:**

1. **Login at:** `https://banda-chao.vercel.app/login`
2. **Use founder email/password**
3. **Verify:** `localStorage.getItem('auth_token')` exists
4. **Verify:** `GET /users/me` returns `role: "FOUNDER"`
5. **Access:** `https://banda-chao.vercel.app/founder` or `/founder/assistant/*`

**If blocked:**
- Check token in localStorage
- Check `/users/me` response
- Check database role
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Clear localStorage and re-login

---

**Last Updated:** 2025-11-15

