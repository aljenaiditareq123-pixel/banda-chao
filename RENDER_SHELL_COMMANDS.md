# Render Shell Commands - Verification Guide

## 🎯 Quick Verification Commands

### 1. Check Current Directory
```bash
pwd
ls -la
```

### 2. Check if Gemini Integration File Exists
```bash
ls -la src/lib/gemini.ts
# or
find . -name "gemini.ts" -type f
```

### 3. Check AI Endpoint Code
```bash
grep -n "gemini-1.5-pro" src/api/ai.ts
# or
cat src/api/ai.ts | grep -A 5 "gemini"
```

### 4. Check Founder Sessions Endpoint
```bash
grep -n "founder/sessions" src/api/founder.ts
# or
cat src/api/founder.ts | grep -A 10 "sessions"
```

### 5. Check Package.json for Gemini SDK
```bash
grep -i "generative-ai" package.json
# or
cat package.json | grep -i "google"
```

### 6. Check Environment Variables
```bash
echo $GEMINI_API_KEY
# (Should show the key, or empty if not set)
```

### 7. Check if Build is Up to Date
```bash
ls -la dist/
ls -la dist/api/
ls -la dist/lib/
```

### 8. Check Recent Logs for Errors
```bash
# Check if there are any recent errors
tail -n 50 /var/log/render.log 2>/dev/null || echo "Log file not found"
```

---

## 🔍 Critical Checks

### Check 1: Gemini Model Name
```bash
grep -r "gemini-1.5-flash" src/ dist/ 2>/dev/null
# Should return NOTHING (no old model name)
```

### Check 2: Founder Sessions Error Handling
```bash
grep -A 15 "founder/sessions" src/api/founder.ts | grep -i "P2021\|error\|catch"
# Should show error handling code
```

### Check 3: Verify Build Output
```bash
# Check if dist folder has latest code
ls -lah dist/api/ai.js
ls -lah dist/lib/gemini.js
```

---

## 🔄 Rebuild Commands (If Needed)

### Option 1: Manual Rebuild
```bash
npm run build
# or
npm run build:server
```

### Option 2: Check Build Script
```bash
cat package.json | grep -A 3 '"build"'
```

---

## 📋 Verification Checklist

Run these commands and check:

- [ ] `gemini.ts` file exists in `src/lib/`
- [ ] `ai.ts` uses `gemini-1.5-pro` (not flash)
- [ ] `founder.ts` has error handling for sessions
- [ ] `package.json` has `@google/generative-ai` dependency
- [ ] `GEMINI_API_KEY` environment variable is set
- [ ] `dist/` folder has latest compiled code

---

## 🚨 If Files Are Missing or Old

### Force Rebuild:
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for deployment to complete

---

## 💡 Quick Test Commands

### Test Health Endpoint
```bash
curl http://localhost:10000/api/health
# or
curl https://banda-chao-backend.onrender.com/api/health
```

### Check Node Version
```bash
node --version
npm --version
```

### Check if Server is Running
```bash
ps aux | grep node
# or
netstat -tulpn | grep node
```

---

**Note**: Some commands may require different paths depending on Render's setup.



