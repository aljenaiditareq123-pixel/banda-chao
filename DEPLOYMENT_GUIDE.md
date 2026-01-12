# Banda Chao - Deployment Guide

## Overview

Banda Chao is deployed on Render using a Blueprint (`render.yaml`) that defines two services:
1. **Backend Service** (Express + Prisma + PostgreSQL)
2. **Frontend Service** (Next.js 14)

## Prerequisites

1. Render account
2. GitHub repository connected to Render
3. PostgreSQL database on Render
4. Environment variables configured

## Render Configuration

### Blueprint File (`render.yaml`)

The project uses a single `render.yaml` at the root:

```yaml
services:
  # Backend Service
  - type: web
    name: banda-chao-backend
    env: node
    plan: free
    rootDir: server
    buildCommand: npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm run build
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_VERSION
        value: 20.11.0
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: FRONTEND_URL
        sync: false
      - key: TEST_MODE
        value: false

  # Frontend Service
  - type: web
    name: banda-chao-frontend
    env: node
    plan: free
    rootDir: ./
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_VERSION
        value: 20.11.0
      - key: NEXT_PUBLIC_API_URL
        value: https://banda-chao-backend.onrender.com/api/v1
```

## Deployment Steps

### 1. Initial Setup

1. Push code to GitHub
2. Go to Render Dashboard → New → Blueprint
3. Connect your GitHub repository
4. Select the repository
5. Render will detect `render.yaml` automatically
6. Click "Apply" to create both services

### 2. Environment Variables

#### Backend Service (`banda-chao-backend`)

Set these in Render Dashboard → Environment:

- `DATABASE_URL`: PostgreSQL connection string from Render
- `JWT_SECRET`: Random secret string (generate with `openssl rand -base64 32`)
- `FRONTEND_URL`: `https://banda-chao-frontend.onrender.com`
- `TEST_MODE`: `false` (only `true` during automated testing)

#### Frontend Service (`banda-chao-frontend`)

- `NEXT_PUBLIC_API_URL`: `https://banda-chao-backend.onrender.com/api/v1`

### 3. Database Setup

1. Create PostgreSQL database on Render
2. Copy connection string to `DATABASE_URL` in backend service
3. Database migrations run automatically during backend build
4. Seed database (optional):
   ```bash
   # Via Render Shell
   cd server
   npx prisma db seed
   ```

### 4. Verify Deployment

#### Backend Health Check
```bash
curl https://banda-chao-backend.onrender.com/api/v1/products
```

#### Frontend Check
Visit: `https://banda-chao-frontend.onrender.com`

## URLs After Deployment

- **Frontend**: `https://banda-chao-frontend.onrender.com`
- **Backend**: `https://banda-chao-backend.onrender.com`
- **API Base**: `https://banda-chao-backend.onrender.com/api/v1`

## Build Process

### Backend Build
1. Install dependencies (`npm install --include=dev`)
2. Generate Prisma client (`npx prisma generate`)
3. Run migrations (`npx prisma migrate deploy`)
4. Build TypeScript (`npm run build`)

### Frontend Build
1. Install dependencies (`npm install`)
2. Build Next.js app (`npm run build`)
3. Start production server (`npm start`)

## Database Migrations

Migrations run automatically during backend deployment via:
```
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

**Manual Migration** (if needed):
1. Open Render Shell for backend service
2. Run:
   ```bash
   cd server
   npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT token signing |
| `JWT_EXPIRES_IN` | ❌ | Token expiration (default: `7d`) |
| `FRONTEND_URL` | ❌ | Frontend URL for CORS |
| `TEST_MODE` | ❌ | Enable test mode (default: `false`) |
| `NODE_ENV` | ✅ | `production` |
| `NODE_VERSION` | ✅ | `20.11.0` |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NODE_ENV` | ✅ | `production` |
| `NODE_VERSION` | ✅ | `20.11.0` |

## Troubleshooting

### Build Failures

1. **Backend Build Fails**:
   - Check `DATABASE_URL` is set correctly
   - Verify Prisma schema is valid
   - Check Node version matches (20.11.0)

2. **Frontend Build Fails**:
   - Verify `NEXT_PUBLIC_API_URL` is set
   - Check TypeScript errors (`npm run build` locally)
   - Ensure all dependencies are in `package.json`

### Runtime Issues

1. **Backend 500 Errors**:
   - Check Render logs
   - Verify database connection
   - Ensure migrations ran successfully

2. **Frontend API Errors**:
   - Verify `NEXT_PUBLIC_API_URL` points to backend
   - Check CORS settings on backend
   - Ensure backend is running

### Database Issues

1. **Migration Errors**:
   - Check `render.yaml` includes `prisma migrate deploy`
   - Verify database URL is correct
   - Check Prisma schema syntax

2. **Connection Errors**:
   - Verify `DATABASE_URL` format
   - Check database is running on Render
   - Ensure database allows connections from Render IPs

## Monitoring

### Render Logs

- **Backend Logs**: Render Dashboard → `banda-chao-backend` → Logs
- **Frontend Logs**: Render Dashboard → `banda-chao-frontend` → Logs

### Health Checks

Monitor these endpoints:
- Backend: `GET /api/v1/products`
- Frontend: `GET /`

## CI/CD

Deployment is automatic on `git push origin main`:
1. Render detects changes
2. Triggers build for affected services
3. Runs tests (if configured)
4. Deploys to production

## Rollback

To rollback:
1. Go to Render Dashboard → Service → Manual Deploy
2. Select previous successful deployment
3. Click "Deploy"

## Security Checklist

- ✅ `TEST_MODE=false` in production
- ✅ Strong `JWT_SECRET` (32+ characters)
- ✅ `NODE_ENV=production`
- ✅ CORS configured correctly
- ✅ Database credentials secured
- ✅ Environment variables not exposed to client

## Post-Deployment

1. **Verify Frontend**:
   - Visit frontend URL
   - Test login/register
   - Browse products/makers/videos

2. **Verify Backend**:
   - Test API endpoints
   - Check database connectivity
   - Verify authentication works

3. **Seed Data** (optional):
   ```bash
   # Via Render Shell
   cd server
   npx prisma db seed
   ```

4. **Update TestSprite**:
   - Update frontend URL in TestSprite
   - Update backend URL if needed
   - Run test suite

