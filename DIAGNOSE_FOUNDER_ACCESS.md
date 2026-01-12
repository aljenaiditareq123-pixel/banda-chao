# Diagnosing Founder Access Issues

## Understanding the Authentication Flow

The founder pages use **TWO layers** of authentication:

1. **Server-side** (`app/founder/layout.tsx`):
   - Calls `requireFounder()` which checks:
     - User must have `role === 'FOUNDER'` in database **OR**
     - User email must match `FOUNDER_EMAIL` environment variable

2. **Client-side** (`components/FounderRoute.tsx`):
   - Checks `user.role === 'FOUNDER'` from AuthContext
   - If not founder, redirects to home page

## Common Issues

### Issue 1: User Role Not Set to FOUNDER
**Symptom**: User is authenticated but redirected to home page when accessing `/founder/*`

**Solution**: 
1. Check if your email matches `FOUNDER_EMAIL` environment variable on backend
2. If email matches but role is still `USER`, update the database:
   ```sql
   UPDATE users SET role = 'FOUNDER' WHERE email = 'your-email@example.com';
   ```

### Issue 2: FOUNDER_EMAIL Not Set
**Symptom**: Backend warning in logs: "⚠️ FOUNDER_EMAIL is not set"

**Solution**: 
- Set `FOUNDER_EMAIL` environment variable on backend to your email
- Example: `FOUNDER_EMAIL=your-email@example.com`

### Issue 3: Token Not Being Sent
**Symptom**: Redirected to login page even when logged in

**Check**:
- Open browser DevTools → Application → Cookies
- Look for `auth_token` cookie
- Check localStorage for `auth_token` key

### Issue 4: AuthContext Not Loading User
**Symptom**: Loading spinner shows indefinitely

**Check**:
- Open browser DevTools → Network tab
- Look for `/api/v1/users/me` request
- Check if it returns 401 (unauthorized) or 200 (success)

## Quick Diagnostic Steps

1. **Check Your Current User Data**:
   - Login to the app
   - Open browser console
   - Run: `localStorage.getItem('auth_token')`
   - Should return a JWT token

2. **Check Backend Response**:
   - Open browser DevTools → Network
   - Navigate to `/founder/assistant`
   - Look for `/api/v1/users/me` request
   - Check the response - does `role` equal `"FOUNDER"`?

3. **Check Server-Side Auth**:
   - Check backend logs for `requireFounder()` calls
   - Should see if authentication succeeds or fails

## How to Fix Founder Access

### Option 1: Set FOUNDER_EMAIL Environment Variable (Recommended)

On your backend server, set:
```bash
FOUNDER_EMAIL=your-actual-email@example.com
```

Then restart the backend server.

### Option 2: Update Database Directly

Connect to your database and run:
```sql
UPDATE users SET role = 'FOUNDER' WHERE email = 'your-email@example.com';
```

### Option 3: Use the Seed Script

If you have access to run backend scripts:
```bash
cd server
npm run seed:founder
```

This will create/update the founder user based on `FOUNDER_EMAIL`.

## Testing

After fixing, test by:
1. Logout and login again (to refresh token)
2. Navigate to `/founder/assistant`
3. Should see the founder console without redirect

## Still Having Issues?

If you're still blocked, check:
1. Browser console for errors
2. Network tab for failed API calls
3. Backend logs for authentication errors
4. Verify token is valid and not expired

