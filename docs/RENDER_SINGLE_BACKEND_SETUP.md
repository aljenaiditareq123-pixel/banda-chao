# Render – Single Backend Service Setup (Nuclear Fix)

This guide removes the “two services for one repo” problem and stabilizes deploys.

## Root Cause (why deploys were inconsistent)
- More than one Render Web Service pointed to the same repo with different settings (Root Directory, Build/Start). Sometimes the “good” service deployed; other times the misconfigured service deployed → errors like:
  - `Cannot find module '/opt/render/project/src/server/dist/index.js'`
  - Prisma WASM/client not found.

## Final Target State
- Only ONE backend service for this repo.
- That service uses:
  - Root Directory: `server`
  - Build Command:
    ```bash
    npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build
    ```
  - Start Command:
    ```bash
    node dist/index.js
    ```
  - Health Check Path: `/api/health`
  - Node Version: `20.x`
  - Env vars (set in dashboard, not in repo):
    - `DATABASE_URL` (Render Postgres)
    - `JWT_SECRET` (strong secret)
    - `NODE_ENV=production`
    - `FRONTEND_URL=https://banda-chao.vercel.app`

## What the repo declares
- Entry point: `src/index.ts` → compiled to `dist/index.js`.
- `server/package.json` scripts:
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
- `server/tsconfig.json` (key options): `rootDir: "./src"`, `outDir: "./dist"`, `module: "commonjs"`, `target: "ES2020"`, `types: ["node"]`, `skipLibCheck: true`.
- Health endpoint exists at `/api/health` and is lightweight.
- Safe startup log added (does not print secrets).
- `render.yaml` at repo root defines exactly one web service with the settings above.

## Human Checklist in Render Dashboard
1. Suspend/Delete any extra backend services using this repo. Keep only one (e.g., `banda-chao-backend`).
2. In the remaining service Settings → Build & Deploy:
   - Root Directory = `server`
   - Build Command =
     ```bash
     npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build
     ```
   - Start Command = `node dist/index.js`
   - Node Version = `20.x`
   - Health Check Path = `/api/health`
3. Environment Variables:
   - `DATABASE_URL` = value from your `banda-chao-db`
   - `JWT_SECRET` = strong secret
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://banda-chao.vercel.app`
4. Manual Deploy → Clear build cache & deploy.
5. Confirm logs show:
   - `> tsc -p tsconfig.json`
   - `Build successful`
   - `Server starting... { node: 'v20.x', env: 'production', port: 3001 }`
6. Test:
   - `https://<render-service>.onrender.com/api/health` returns `{ status: "ok" }`.

## Vercel Frontend
- Set `NEXT_PUBLIC_API_URL` to:
  ```text
  https://<render-backend-service-name>.onrender.com
  ```
  (The frontend appends `/api/...` internally.)

## If Something Still Fails
- Re-check Root Directory = `server`.
- Ensure Build/Start commands are not truncated (use `&&` not `&`). Paste them again if needed.
- Verify env vars are actually set (especially `DATABASE_URL`, `JWT_SECRET`).
- Look for the startup log `Server starting...` in Render logs.
- Use Manual Deploy → Clear build cache.

## Local Sanity (should succeed)
```bash
cd /Users/tarqahmdaljnydy/Documents/banda-chao/server
npm install --include=dev
npx prisma generate --schema=./prisma/schema.prisma
npm run build
node -e \"require('./dist/index.js'); console.log('✅ Server started OK for test'); process.exit(0);\"
```

# Render – Single Backend Service Setup (Nuclear Fix)

This guide ends the recurring deploy issues by enforcing ONE backend service for the repo `banda-chao`.

## Root cause (suspected)
Multiple Render backend services were pointing to the same repo with different Root Directory / Build Command settings. Sometimes the correct one builds; other times the wrong one deploys, causing errors like:
- `Cannot find module '/opt/render/project/src/server/dist/index.js'`
- Prisma WASM / client not found

## Final target state
One backend service only. That service is configured to build and start from `server/`.

### Backend layout (repo)
- Monorepo
  - Frontend (Next.js): repo root
  - Backend (Express + Prisma + TS): `server/`
- Entry point: `server/src/index.ts` → `server/dist/index.js`
- Health endpoint: `/api/health`

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
- `rootDir: "./src"`
- `outDir: "./dist"`
- `module: "commonjs"`, `target: "ES2020"`
- `skipLibCheck: true`, `esModuleInterop: true`
- `types: ["node"]`

### Prisma
- Schema: `server/prisma/schema.prisma`
- `generator client { provider = "prisma-client-js" }`
- `datasource db { provider = "postgresql" url = env("DATABASE_URL") }`

---

## Render Dashboard – exact settings (use these)
- **Root Directory:** `server`
- **Build Command:**
  ```bash
  npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build
  ```
- **Start Command:**
  ```bash
  node dist/index.js
  ```
- **Node Version:** `20.x`
- **Health Check Path:** `/api/health`
- **Environment Variables:**
  - `DATABASE_URL` (from Render Postgres `banda-chao-db`)
  - `JWT_SECRET` (strong secret)
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://banda-chao.vercel.app`

> Do NOT add `cd server` anywhere when Root Directory is set to `server`.
> Do NOT use `npm start` for Start Command in production.

---

## Single-backend checklist (Render UI)
1. Suspend/Delete any extra backend services pointing to this repo. Keep only one (e.g., `banda-chao-backend` or `banda-chao`).
2. Open the remaining backend service:
   - Set Root Directory = `server`
   - Paste the exact Build Command above (ensure it is not truncated and uses `&&`)
   - Set Start Command = `node dist/index.js`
   - Set Node = `20.x`
   - Set Health Check Path = `/api/health`
   - Set env vars: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `FRONTEND_URL`
3. Manual Deploy → Clear build cache & deploy.
4. Verify logs show:
   - `tsc -p tsconfig.json`
   - `Build successful`
   - `Server starting... { node: 'v20.x', env: 'production', port: 3001 }`
5. Test the health endpoint:
   - `https://<render-service>.onrender.com/api/health`

---

## Vercel frontend configuration
Set:
```
NEXT_PUBLIC_API_URL=https://<render-backend-service-name>.onrender.com
```
Note: Frontend code appends `/api/...` internally.

---

## If something still fails
- Re-check Root Directory is exactly `server`.
- Re-check Build / Start commands: use `&&` (not `&`), no `cd` prefixes.
- Ensure `DATABASE_URL` and `JWT_SECRET` are set.
- In logs, look for the startup line: `Server starting... { ... }`.
- Use “Clear build cache & deploy” again.
- As a last resort for Prisma runtime issues, add `binaryTargets = ["native", "debian-openssl-3.0.x"]` to the Prisma generator and redeploy.

---

## Local sanity commands (for verification)
```bash
cd /Users/tarqahmdaljnydy/Documents/banda-chao/server
npm install --include=dev
npx prisma generate --schema=./prisma/schema.prisma
npm run build
node -e "require('./dist/index.js'); console.log('✅ Server started OK for test'); process.exit(0);"
```
If these pass locally, Render should work with the dashboard settings above.
