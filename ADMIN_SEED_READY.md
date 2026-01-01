# ✅ Admin User Seed Script - Ready
# سكريبت إنشاء مستخدم Admin - جاهز

---

## ✅ Script Created

**File:** `scripts/seed-admin.ts`

**Features:**
- ✅ Creates admin user with email: `admin@bandachao.com`
- ✅ Password: `password123` (hashed with bcrypt)
- ✅ Role: `ADMIN`
- ✅ Name: `Admin`
- ✅ Updates existing user if email already exists
- ✅ Verifies user creation/update

---

## 🚀 How to Run

### Step 1: Get DATABASE_URL from Render

**See:** `GET_DATABASE_URL_FROM_RENDER.md` for detailed steps

**Quick Steps:**
1. Go to https://dashboard.render.com
2. Open your **PostgreSQL Database** service
3. Go to **"Connections"** or **"Info"** tab
4. Copy **"Internal Database URL"** or **"External Database URL"**

---

### Step 2: Run the Script

**Option 1: With DATABASE_URL inline:**
```bash
DATABASE_URL="postgresql://user:password@host:port/database" npx tsx scripts/seed-admin.ts
```

**Option 2: Add to .env file:**
```bash
# Add to .env file
echo 'DATABASE_URL="postgresql://user:password@host:port/database"' >> .env

# Then run
npx tsx scripts/seed-admin.ts
```

---

## 📋 Admin User Details

**After running the script, you can login with:**
- **Email:** `admin@bandachao.com`
- **Password:** `password123`
- **Role:** `ADMIN`

---

## ⚠️ Important Notes

1. **Change Password:** After first login, change the password immediately!
2. **Security:** The default password `password123` is weak - change it ASAP
3. **Database:** Make sure you're using the **production DATABASE_URL** from Render

---

## 🔍 What the Script Does

1. **Checks** if user with email `admin@bandachao.com` exists
2. **If exists:** Updates password and role to ADMIN
3. **If not exists:** Creates new user with ADMIN role
4. **Hashes password** using bcrypt (same as registration)
5. **Verifies** user was created/updated successfully

---

## ✅ Script Status

- ✅ Script created: `scripts/seed-admin.ts`
- ✅ Uses bcrypt for password hashing (matches auth.ts)
- ✅ Handles existing users (updates instead of failing)
- ✅ Verifies creation/update
- ⏳ **Waiting for DATABASE_URL** from Render

---

**Get your DATABASE_URL from Render and run the script! 🚀**

