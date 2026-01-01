# 🔍 How to Get DATABASE_URL from Render
# كيفية الحصول على DATABASE_URL من Render

---

## 📍 الخطوات

### Step 1: Open Render Dashboard

1. **Go to:** https://dashboard.render.com
2. **Login** to your account

---

### Step 2: Find Your Database Service

1. **From Dashboard:** Look for your **PostgreSQL Database** service
   - Usually named: `banda-chao-db` or similar
   - Or search for services with type "PostgreSQL"

2. **Click on** the database service

---

### Step 3: Get Connection String

1. **In the database service page:**
   - Look for **"Connections"** tab or **"Info"** tab
   - Or scroll down to find connection information

2. **You'll see:**
   - **Internal Database URL** (for services on Render)
   - **External Database URL** (for local connections)

3. **Copy the URL:**
   - Format: `postgresql://user:password@host:port/database`
   - Example: `postgresql://banda_chao_user:abc123@dpg-xxxxx-a.oregon-postgres.render.com:5432/banda_chao_db`

---

### Step 4: Use the URL

**Option 1: Run script with DATABASE_URL:**
```bash
DATABASE_URL="postgresql://user:password@host:port/database" npx tsx scripts/seed-admin.ts
```

**Option 2: Add to .env file:**
```bash
# Create or edit .env file
echo 'DATABASE_URL="postgresql://user:password@host:port/database"' >> .env

# Then run script
npx tsx scripts/seed-admin.ts
```

---

## 🔑 Quick Copy-Paste

**After getting DATABASE_URL from Render:**

1. **Copy the URL** from Render Dashboard
2. **Run:**
   ```bash
   DATABASE_URL="[paste-your-url-here]" npx tsx scripts/seed-admin.ts
   ```

---

**Get your DATABASE_URL from Render and run the script! 🔍**

