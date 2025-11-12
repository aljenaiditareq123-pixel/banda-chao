# Security Panda Knowledge Base
# مساعد الأمن - قاعدة المعرفة الأمنية

## Security Overview - نظرة عامة على الأمن

This document contains security-related information for the Panda Chao platform.
⚠️ **IMPORTANT:** This file should be kept secure and never committed to public repositories.

## API Keys & Secrets - المفاتيح والأسرار

⚠️ **SECURITY WARNING:** This file contains sensitive information. Never commit to public repositories.

### Frontend Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://gtnyspavjsoolvnphihs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnlzcGF2anNvb2x2bnBoaWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjcxNDAsImV4cCI6MjA3NzMwMzE0MH0.kKpUYPuRdJOBd39S9w_bvb-Zc7w5qyYj07UtLy-V5BU
GEMINI_API_KEY=AIzaSyCuatmWcdw2FMOCM3YgKeBr34_oJMdHBK0
```

**Note:** The actual values are stored in `.env.local` file (not in Git).

### Backend Environment Variables (Render)
- `DATABASE_URL` - PostgreSQL connection string (from Render PostgreSQL)
- `JWT_SECRET` - JWT signing secret (generated with `openssl rand -base64 32`)
- `JWT_EXPIRES_IN` - Token expiration (default: `7d`)
- `STRIPE_SECRET_KEY` - Stripe API secret key (from Stripe Dashboard)
- `FRONTEND_URL` - Frontend URL for CORS: `https://banda-chao.vercel.app`
- `NODE_ENV` - Environment: `production`
- `SEED_SECRET` - Secret for seed API: `banda-chao-seed-2025` (example)

### Deployment URLs - روابط النشر
- **Frontend (Vercel):** `https://banda-chao.vercel.app`
- **Backend (Render):** `https://banda-chao-backend.onrender.com`
- **API Base:** `https://banda-chao-backend.onrender.com/api/v1`
- **Health Check:** `https://banda-chao-backend.onrender.com/api/health`

### Database Access
- **Type:** PostgreSQL
- **Provider:** Render PostgreSQL
- **Connection:** Via `DATABASE_URL` environment variable
- **ORM:** Prisma

## Security Best Practices - أفضل الممارسات الأمنية

### 1. Environment Variables
- ✅ Never commit `.env.local` to Git
- ✅ Use `.gitignore` to exclude sensitive files
- ✅ Use `NEXT_PUBLIC_` prefix only for client-side safe variables
- ✅ Keep API keys in environment variables, not in code

### 2. API Security
- ✅ Validate all API requests
- ✅ Use HTTPS for all API calls
- ✅ Implement rate limiting
- ✅ Use JWT for authentication
- ✅ Validate user permissions

### 3. Database Security
- ✅ Use parameterized queries (Prisma handles this)
- ✅ Never expose database credentials
- ✅ Use connection pooling
- ✅ Regular backups

### 4. Frontend Security
- ✅ Sanitize user input
- ✅ Use Content Security Policy (CSP)
- ✅ Implement CSRF protection
- ✅ Secure cookies (httpOnly, secure flags)

## Authentication - المصادقة

### JWT Tokens
- Stored in `localStorage` (client-side)
- Sent with API requests via Authorization header
- Expiration: 7 days (configurable)
- Secret: Stored in backend environment variables

### User Authentication Flow
1. User logs in via `/auth/login`
2. Backend validates credentials
3. Backend issues JWT token
4. Frontend stores token in `localStorage`
5. Token sent with subsequent API requests

## Payment Security - أمن المدفوعات

### Stripe Integration
- ✅ Server-side payment processing
- ✅ Never expose Stripe secret key to client
- ✅ Use Stripe Checkout for secure payment flow
- ✅ Webhook verification for order confirmation

### Payment Flow
1. User adds items to cart
2. User proceeds to checkout
3. Frontend calls `/api/v1/orders/create-checkout-session`
4. Backend creates Stripe Checkout session
5. User redirected to Stripe for payment
6. Stripe redirects back to success/cancel page

## Data Protection - حماية البيانات

### User Data
- ✅ Encrypted passwords (hashed, never stored in plain text)
- ✅ Personal information protected
- ✅ GDPR considerations for EU users

### API Data
- ✅ Rate limiting to prevent abuse
- ✅ Input validation
- ✅ Output sanitization

## Deployment Security - أمن النشر

### Vercel (Frontend)
- ✅ Environment variables secured in dashboard
- ✅ HTTPS enforced
- ✅ Automatic security updates

### Render (Backend)
- ✅ Environment variables secured in dashboard
- ✅ Database credentials protected
- ✅ Private network for database connection

## Security Checklist - قائمة التحقق الأمنية

- [x] Environment variables not in code
- [x] API keys secured
- [x] HTTPS everywhere
- [x] JWT authentication implemented
- [x] Input validation
- [x] SQL injection prevention (Prisma)
- [x] XSS protection
- [x] CSRF protection
- [x] Secure cookies
- [x] Rate limiting (to be implemented)

## Incident Response - الاستجابة للحوادث

### If API Key is Compromised
1. Immediately revoke the key in service dashboard
2. Generate new key
3. Update environment variables
4. Redeploy application
5. Monitor for unauthorized access

### If Database is Compromised
1. Immediately change database password
2. Review access logs
3. Rotate all credentials
4. Restore from backup if needed
5. Notify affected users if necessary

## Security Notes - ملاحظات أمنية

- All passwords should be hashed using bcrypt
- API keys should be rotated periodically
- Monitor for suspicious activity
- Keep dependencies updated
- Regular security audits recommended

