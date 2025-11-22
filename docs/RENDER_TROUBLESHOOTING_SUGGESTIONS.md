# Render Deployment – Troubleshooting & Suggestions

## ✅ Confirmed Correct (local)
- `server/` only backend deployment
- Local success in `server/`:
  - `npm install --include=dev`
  - `npx prisma generate --schema=./prisma/schema.prisma`
  - `npm run build` (tsc -p tsconfig.json)
  - `node -e "require('./dist/index.js'); console.log('✅ Server started OK for test'); process.exit(0);"`
- Compiled entry: `dist/index.js` (from `src/index.ts`)

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
- `types: ["node"]`, `typeRoots: ["./node_modules/@types", "../node_modules/@types"]`
- `include: ["src/**/*"]`, `exclude: ["node_modules", "dist"]`

### Prisma
- Schema path: `server/prisma/schema.prisma`
- `generator client { provider = "prisma-client-js" }`
- `datasource db { provider = "postgresql" url = env("DATABASE_URL") }`

---

## ⚠️ Render-specific pitfalls to watch
1. **Wrong Root Directory**
   - If not set to `server`, Render runs at repo root and paths become `/opt/render/project/src/server/...` causing MODULE_NOT_FOUND.
2. **Truncated Build Command**
   - UI sometimes wraps the command; ensure the full command is saved (no cut after `&npx pris...`).
3. **Missing env vars**
   - Must set: `DATABASE_URL`, `JWT_SECRET`, optionally `JWT_EXPIRES_IN`
   - Do not print secrets in logs.
4. **Wrong Node version**
   - Use Node 20.x (or 18.x) in the service settings.
5. **Health check mismatch**
   - Our health endpoint: `/api/health`. Set Health Check Path accordingly.
6. **Prisma binary/WASM issues**
   - Fix by ensuring:
     - Install step includes dev deps: `npm install --include=dev`
     - Explicit generate path: `npx prisma generate --schema=./prisma/schema.prisma`
7. **Start script running migrations**
   - Keep production start as `node dist/index.js` (no `db push` in production start).

---

## ✅ Recommended Render Dashboard settings
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

---

## 🔁 Human checklist in Render UI
- [ ] Root Directory is exactly `server`
- [ ] Build Command matches exactly (no truncation)
- [ ] Start Command is `node dist/index.js`
- [ ] Environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
- [ ] Health Check Path = `/api/health`
- [ ] Manual Deploy → Clear build cache & deploy (if needed)

---

## 💡 If it still fails (next steps)
1. Enable more verbose startup logs (already added basic log in `src/index.ts`).
2. Add `/version` endpoint exposing commit SHA (without secrets) to confirm code version.
3. Temporarily disable OAuth routes from mount to isolate failures (if logs point to oauth).
4. Add a minimal test route `/api/ping` returning `{ ok: true }`.
5. If Prisma errors persist, add `binaryTargets` to generator as a last resort:
   ```prisma
   generator client {
     provider = "prisma-client-js"
     binaryTargets = ["native", "debian-openssl-3.0.x"]
   }
   ```

---

## Notes
- The service logs should now include a startup line like:
  ```
  Server starting... { node: 'v20.x', env: 'production', port: 3001 }
  ```
- Avoid printing secrets or full connection strings in logs.



