# Quick Check: Can You Access Founder Pages?

## Step 1: Check Your Authentication

Open your browser console (F12) and run:

```javascript
// Check if you're logged in
console.log('Token:', localStorage.getItem('auth_token'));

// Check your user data (after page loads)
// Look in Network tab for /api/v1/users/me response
```

## Step 2: Check Your Role

After logging in, check the Network tab:
1. Navigate to any page
2. Look for request to `/api/v1/users/me`
3. Check the response - what is your `role`?
   - If `role: "USER"` → You need to update your role to `"FOUNDER"`
   - If `role: "FOUNDER"` → Authentication should work

## Step 3: Check Backend Environment

The backend needs `FOUNDER_EMAIL` environment variable set.

**To check on backend server:**
```bash
echo $FOUNDER_EMAIL
```

**To set it:**
```bash
export FOUNDER_EMAIL="your-email@example.com"
```

Or add to `.env` file:
```
FOUNDER_EMAIL=your-email@example.com
```

## Step 4: Quick Fix Options

### Fix 1: Update Database (if you have DB access)
```sql
UPDATE users SET role = 'FOUNDER' WHERE email = 'your-email@example.com';
```

### Fix 2: Use Seed Script (if you can run it)
```bash
cd server
FOUNDER_EMAIL=your-email@example.com npm run seed:founder
```

### Fix 3: Set Environment Variable
Set `FOUNDER_EMAIL` on backend and restart server.

## Step 5: Test Access

1. **Clear your browser cache and cookies** (or logout/login)
2. **Navigate to** `/founder/assistant`
3. **If redirected to login** → Authentication issue
4. **If redirected to home** → Role issue (you're logged in but not FOUNDER)
5. **If you see the founder console** → Success! ✅

## What Error Are You Seeing?

- **"Redirected to /login"** → Not authenticated or token invalid
- **"Redirected to /" (home page)** → Authenticated but role is not FOUNDER
- **"Loading forever"** → AuthContext not loading user data
- **"500 Server Error"** → Backend issue, check server logs

## Still Need Help?

Share:
1. What happens when you try to access `/founder/assistant`?
2. What does `/api/v1/users/me` return? (check Network tab)
3. What is your email address?
4. Is `FOUNDER_EMAIL` set on the backend?

