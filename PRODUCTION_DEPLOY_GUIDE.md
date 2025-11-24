# Production Deployment Guide - Banda Chao

**تاريخ الإنشاء**: ديسمبر 2024  
**الهدف**: دليل شامل لنشر Banda Chao في الإنتاج

---

## 🚀 Overview

هذا الدليل يغطي نشر Banda Chao على:
- **Backend**: Render, Railway, أو AWS
- **Frontend**: Vercel أو Render
- **Database**: PostgreSQL (Render, Supabase, أو AWS RDS)

---

## 📋 Pre-Deployment Checklist

قبل البدء، تأكد من:
- [ ] جميع الاختبارات تمر (`npm test`)
- [ ] Build يعمل بدون أخطاء (`npm run build`)
- [ ] Environment variables جاهزة
- [ ] Database migrations جاهزة
- [ ] Stripe keys (Test أو Live) جاهزة
- [ ] Domain names جاهزة (إن لزم)

---

## 🐳 Docker Deployment

### Backend Docker

**Build:**
```bash
cd server
docker build -t banda-chao-backend .
```

**Run:**
```bash
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e STRIPE_SECRET_KEY="..." \
  -e FRONTEND_URL="https://banda-chao.vercel.app" \
  banda-chao-backend
```

**Docker Compose (Optional):**
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=banda_chao
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Frontend Docker

**Build:**
```bash
docker build -t banda-chao-frontend .
```

**Run:**
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="https://banda-chao-backend.onrender.com" \
  banda-chao-frontend
```

---

## 🌐 Render Deployment

### Backend on Render

1. **Create Web Service:**
   - Connect GitHub repository
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://banda-chao.vercel.app
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLIC_KEY=pk_live_...
   STRIPE_MODE=live
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **PostgreSQL Database:**
   - Create PostgreSQL database on Render
   - Copy connection string to `DATABASE_URL`

4. **Run Migrations:**
   ```bash
   # In Render shell or locally
   cd server
   npm run db:migrate
   ```

5. **Webhook Setup:**
   - In Stripe Dashboard, add webhook endpoint
   - URL: `https://your-backend.onrender.com/api/v1/payments/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

### Frontend on Render

1. **Create Static Site:**
   - Connect GitHub repository
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`

2. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
   NODE_ENV=production
   ```

---

## ▲ Vercel Deployment

### Frontend on Vercel

1. **Import Project:**
   - Connect GitHub repository
   - Framework Preset: Next.js
   - Root Directory: `.` (root)

2. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
   ```

3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy:**
   - Vercel will auto-deploy on push to main branch

---

## 🗄️ Database Setup

### Initial Setup

1. **Create Database:**
   - Render PostgreSQL
   - Supabase
   - AWS RDS

2. **Run Migrations:**
   ```bash
   cd server
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```

3. **Seed (Optional):**
   ```bash
   DATABASE_URL="postgresql://..." npm run db:seed
   ```

### Production Migrations

```bash
# In production, use migrate deploy (no prompts)
npx prisma migrate deploy
```

---

## 🔒 Security Checklist

- [ ] `JWT_SECRET` قوي وعشوائي (32+ حرف)
- [ ] `STRIPE_SECRET_KEY` من Stripe Live (ليس Test)
- [ ] CORS مضبوط على FRONTEND_URL فقط
- [ ] HTTPS مفعّل
- [ ] Helmet مفعّل
- [ ] Rate limiting مفعّل
- [ ] Error messages لا تكشف معلومات حساسة
- [ ] Database credentials آمنة
- [ ] Webhook secret صحيح

---

## 📊 Monitoring

### Health Checks

- **Backend**: `GET /api/health`
- **Frontend**: Root page should load

### Logging

- Render: Built-in logs
- Vercel: Built-in logs
- Consider: Sentry, LogRocket for production

### Performance

- Monitor API response times
- Monitor database query performance
- Monitor Socket.IO connections

---

## 🔄 CI/CD (Future)

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd server && npm ci && npm run build
      # Deploy to Render/Railway

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build
      # Deploy to Vercel
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection:**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check firewall rules

2. **CORS Errors:**
   - Verify FRONTEND_URL matches actual frontend URL
   - Check CORS configuration in backend

3. **Build Failures:**
   - Check Node version (18+)
   - Verify all dependencies installed
   - Check TypeScript errors

4. **Socket.IO Issues:**
   - Verify Socket.IO path is correct
   - Check CORS for Socket.IO
   - Verify authentication token

---

## 📝 Post-Deployment

1. **Verify:**
   - [ ] Home page loads
   - [ ] API endpoints respond
   - [ ] Authentication works
   - [ ] Payments work (if Live Mode)
   - [ ] Socket.IO connects
   - [ ] Notifications work

2. **Monitor:**
   - [ ] Error rates
   - [ ] Response times
   - [ ] Database performance
   - [ ] User activity

3. **Backup:**
   - [ ] Database backups configured
   - [ ] Environment variables backed up
   - [ ] Code in version control

---

## 🔗 Useful Links

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Prisma Deploy**: https://www.prisma.io/docs/guides/deployment

---

**آخر تحديث**: ديسمبر 2024

