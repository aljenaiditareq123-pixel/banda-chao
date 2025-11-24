# دليل النشر - Banda Chao

## إعدادات الإنتاج

### Environment Variables

#### Frontend (.env.local أو Vercel Environment Variables)
```env
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
```

#### Backend (.env أو Render Environment Variables)
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# JWT
JWT_SECRET=your-very-secure-secret-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://banda-chao.vercel.app

# AI (Optional - for future integration)
# GEMINI_API_KEY=your-gemini-api-key
# OPENAI_API_KEY=your-openai-api-key
```

### Security Checklist

- [ ] تغيير `JWT_SECRET` إلى قيمة آمنة عشوائية
- [ ] استخدام HTTPS في الإنتاج
- [ ] إعداد CORS بشكل صحيح
- [ ] تفعيل rate limiting
- [ ] إعداد cloud storage للملفات (S3, Cloudinary)
- [ ] إعداد monitoring و logging
- [ ] نسخ احتياطي لقاعدة البيانات

### Database Migration

**قبل النشر:**
```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

**ملاحظة**: تأكد من أن DATABASE_URL صحيح في بيئة الإنتاج.

### النشر على Render (Backend)

1. ربط GitHub repository
2. إعداد Environment Variables (راجع أعلاه)
3. Build Command: `cd server && npm install && npm run build`
4. Start Command: `cd server && npm start`
5. Health Check: `/api/health`

### النشر على Vercel (Frontend)

1. ربط GitHub repository
2. إعداد Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL الـ backend
3. Build Command: `npm run build`
4. Framework Preset: Next.js

### File Storage

في الإنتاج، يجب استخدام cloud storage بدلاً من الملفات المحلية:
- AWS S3
- Cloudinary
- Google Cloud Storage

### Monitoring

- إعداد error tracking (Sentry)
- إعداد performance monitoring
- إعداد uptime monitoring

---

## ⚠️ Before Deploying to Production

**Important**: قبل النشر في الإنتاج، تأكد من مراجعة `PRE_PRODUCTION_CHECKLIST.md` بالكامل.

يتضمن الـ Checklist:
- Environment variables
- Database setup
- Security checklist
- Build & deploy verification
- Testing verification
- Performance checks

---

## Database & Seeding

### Migration Commands

```bash
cd server

# Create new migration
npm run db:migrate

# Generate Prisma Client
npm run db:generate

# Reset database (development only)
npm run db:reset
```

### Seeding

```bash
cd server

# Run seed script
npm run db:seed
```

**Seed Data Includes:**
- 1 Founder user (founder@bandachao.com / founder123)
- 5 Maker users with profiles
- 5-10 Products per maker
- 3-5 Videos per maker
- Sample posts and comments

---

## Security Considerations (Phase 3)

### ✅ Security Features Implemented:

1. **Helmet**
   - Security headers enabled
   - Cross-Origin Resource Policy configured
   - XSS protection, content security policy

2. **CORS**
   - Production: Only FRONTEND_URL allowed
   - Development: localhost + Vercel allowed
   - Credentials enabled

3. **Rate Limiting**
   - Auth endpoints: 50 requests per 15 minutes
   - AI endpoints: 30 requests per 15 minutes
   - Per IP address

4. **JWT_SECRET**
   - Must be strong random string in production
   - Never commit to git
   - Use environment variable

5. **Error Handling**
   - Database errors hidden from clients
   - Sensitive information filtered
   - Detailed errors only in development

6. **Input Validation**
   - Zod validation on all inputs
   - Type checking
   - Length limits enforced

---

## Render Deployment (Backend)

### Environment Variables:
```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://banda-chao.vercel.app
```

### Build Settings:
- **Build Command**: `cd server && npm install && npm run build`
- **Start Command**: `cd server && npm start`
- **Health Check**: `/api/health`

### Database:
- Run migrations: `npm run db:migrate`
- Run seed (optional): `npm run db:seed`

---

## Vercel Deployment (Frontend)

### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
```

### Build Settings:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Notes:
- Ensure `NEXT_PUBLIC_API_URL` points to your backend
- Frontend will automatically use this for all API calls

