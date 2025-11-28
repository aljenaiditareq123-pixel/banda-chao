# 🔧 Render Build Commands Configuration
## Build Commands for Render Services

**استخدم هذه الأوامر في إعدادات Render Dashboard**

---

## 🖥️ Backend Service (banda-chao-backend)

### Build Command:
```bash
npm install && npm run build
```

### Start Command:
```bash
npm start
```

### Environment:
- **Node Version:** 20.x or higher
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

---

## 🎨 Frontend Service (banda-chao-frontend)

### Build Command:
```bash
npm install && npm run build
```

### Start Command:
```bash
npm start
```

### Environment:
- **Node Version:** 20.x or higher
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

---

## 📝 Notes

- Render will automatically run `npm install` before build
- Make sure `package.json` has correct `build` and `start` scripts
- Backend uses `node dist/index.js` for production
- Frontend uses `next start` for production

---

## ✅ Verification

After deployment, verify:
1. Backend logs show "Server running on port..."
2. Frontend logs show "Ready on http://localhost:3000"
3. Both services are "Live" in Render Dashboard

---

**📅 Created:** $(date)

