# 🔧 Quick Fix: Founder Login Issue

## Problem
Prisma schema validation error: `The column users.level does not exist`

## Solution: Use Raw SQL Script

### Step 1: Navigate to Project Root in Render Shell

```bash
cd ~/project/src
```

### Step 2: Run the SQL-based Fix Script

```bash
npx tsx scripts/fix-founder-sql.ts
```

This script:
- ✅ Uses **raw SQL** to bypass Prisma schema validation
- ✅ Creates/updates `founder@bandachao.com` with password `founder123`
- ✅ Sets role to `FOUNDER`
- ✅ Works even if schema and database are out of sync

---

## Alternative: One-Line SQL Command

If you prefer a quick one-liner, you can use this (but you'll need to hash the password first):

```bash
cd ~/project/src/.next/standalone && node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$executeRaw\`UPDATE users SET role = 'FOUNDER'::\"UserRole\", updated_at = NOW() WHERE email = 'founder@bandachao.com'\`.then(() => { console.log('✅ DONE: User is now FOUNDER'); prisma.\$disconnect(); }).catch(e => { console.error('Error:', e.message); prisma.\$disconnect(); });"
```

**But the script is recommended** because it also handles password hashing and account creation if the user doesn't exist.

---

## After Running the Script

Login with:
```
Email: founder@bandachao.com
Password: founder123
```

URL: https://banda-chao.onrender.com/ar/login

---

**Status:** Script pushed to GitHub. Run it in Render Shell to fix the login issue.
