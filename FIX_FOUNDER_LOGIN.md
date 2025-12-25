# 🔐 Fix Founder Login - Quick Solution

## Problem

Login failed with `founder@bandachao.com` / `founder123` - "Invalid email or password" error.

## Solution

Run this command in **Render Shell** to create/update the founder account with known credentials:

### Step 1: Open Render Shell

1. Go to Render Dashboard → `banda-chao` service
2. Click "Shell" in the left sidebar
3. Wait for shell to connect

### Step 2: Run the Fix Script

```bash
cd server && npx tsx scripts/fix-founder-credentials.ts
```

This script will:
- ✅ Check if `founder@bandachao.com` exists
- ✅ If exists: Update password to `founder123` and set role to `FOUNDER`
- ✅ If not exists: Create new account with email `founder@bandachao.com`, password `founder123`, and role `FOUNDER`

### Step 3: Login

After the script completes, login with:

```
Email: founder@bandachao.com
Password: founder123
```

Login URL: `https://banda-chao.onrender.com/ar/login`

---

## Alternative: If You Already Have an Account

If you registered with `aljenaiditareq123@gmail.com` or any other email, you can promote that account to FOUNDER:

```bash
cd server && npx tsx scripts/promote-founder.ts
```

This will update `aljenaiditareq123@gmail.com` to FOUNDER role (but won't change the password).

---

## Quick Command Reference

### Create/Update Founder Account:
```bash
cd server && npx tsx scripts/fix-founder-credentials.ts
```

### Promote Existing Account to Founder:
```bash
cd server && npx tsx scripts/promote-founder.ts
```

---

## Expected Output

You should see:
```
✅ User found. Updating password and role...
   Current Role: [current role]
✅ User updated successfully!
   Email: founder@bandachao.com
   Password: founder123
   Role: FOUNDER

🎉 You can now login with:
   Email: founder@bandachao.com
   Password: founder123
```

---

**Status:** Script ready. Run in Render Shell to fix login issue.
