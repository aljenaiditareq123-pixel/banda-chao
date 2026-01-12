# Render Backend – Final Setup (Single Service, Production‑Ready)

This document locks the backend to ONE Render service and provides exact settings to end recurring deploy issues.

## Root Cause
- Multiple Render Web Services pointed to the same repo with different Root Directory / Build commands → sometimes the wrong service deployed and failed with:
  - `Cannot find module '/opt/render/project/src/server/dist/index.js'`
  - Prisma Client/WASM not found

## Final Target State
- Only ONE backend service for this repo.
- Service name (suggested): `banda-chao-backend`.
- Root Directory: `server`
- Node: `20.x` (e.g., 20.11.0)
- Health Check Path: `/api/health`

### Build & Start (paste exactly)
**Build Command**
```bash
npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build
```

**Start Command**
```bash
node dist/index.js
```

### Environment Variables (Dashboard)
- `DATABASE_URL` → from Render Postgres service (`banda-chao-db`)
- `JWT_SECRET` → strong secret
- `NODE_ENV` → `production`
- `FRONTEND_URL` → `https://banda-chao.vercel.app`
- (optional) `NODE_VERSION` → `20.11.0`

---

## Repo State (already configured)

### Entry Point
- `server/src/index.ts` → compiled to `server/dist/index.js`
- Includes safe startup log and a lightweight health endpoint mounted at `/api/health`

### server/package.json (scripts)
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "start:dev": "npx prisma db push --accept-data-loss && node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### server/tsconfig.json (key options)
- `"rootDir": "./src"`
- `"outDir": "./dist"`
- `"module": "commonjs"`, `"target": "ES2020"`
- `"types": ["node"]`
- `"typeRoots": ["./node_modules/@types","../node_modules/@types"]`

### Prisma
- Schema at `server/prisma/schema.prisma`
- `datasource db` uses `env("DATABASE_URL")`
- Generate done explicitly in Build Command

### render.yaml (root)
- Declares a single web service using the exact Build/Start commands above with `rootDir: server` and `NODE_VERSION` set.

---

## Render Dashboard – Step‑by‑Step
1) Services: keep ONE backend service only. Suspend/Delete any extra backend services pointing to this repo.
2) In the remaining service (e.g., `banda-chao-backend`) → Settings → Build & Deploy
   - `Root Directory` = `server`
   - `Build Command` = (see above)
   - `Start Command` = `node dist/index.js`
   - `Node Version` = `20.x`
   - `Health Check Path` = `/api/health`
3) Settings → Environment
   - Add/verify `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`
4) Manual Deploy → `Clear build cache & deploy`
5) Logs should show:
   - `> tsc -p tsconfig.json`
   - `Build successful`
   - `Server starting... { node: 'v20.x', env: 'production', port: 3001 }`
6) Test: `https://<service>.onrender.com/api/health` → `{ "status": "ok" }`

---

## Vercel Frontend
- In the production project (e.g., `banda-chao-d95a`):
  - `NEXT_PUBLIC_API_URL = https://<render-service>.onrender.com`
  - Redeploy Production.
  - Verify in DevTools → Network that API calls target the Render domain above.

---

## Local Production‑like Sanity Check
```bash
cd server
rm -rf node_modules dist
npm install --include=dev
npx prisma generate --schema=./prisma/schema.prisma
npm run build
node -e "require('./dist/index.js'); console.log('✅ Server started OK for test'); process.exit(0);"
```
All commands should succeed and `dist/index.js` must exist.

---

## If Something Still Fails
- Re-check `Root Directory = server`.
- Ensure Build Command is NOT truncated (use `&&`, not `&`).
- Validate env vars (especially `DATABASE_URL` and `JWT_SECRET`).
- Clear build cache and redeploy.
- Look for `Server starting...` in logs; absence usually indicates wrong Start Command or build didn’t produce `dist/`.






