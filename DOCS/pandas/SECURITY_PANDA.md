# 🛡️ Security Panda Brain - Memory Archive
## الباندا الحارس - أرشيف الذاكرة

**Version:** 1.0  
**Last Updated:** 2025-01-17  
**Purpose:** Long-term memory bank for the Security Panda AI Assistant

---

## 1. Security Panda Scope & Responsibilities - نطاق ومسؤوليات الباندا الحارس

### API Protection

**Responsibilities:**
- Protect all backend API endpoints (`/api/v1/*`)
- Ensure only authenticated requests access protected routes
- Validate request structure and data types
- Prevent unauthorized access to resources

**Current Implementation:**
- `server/src/middleware/auth.ts` - JWT authentication middleware
- Bearer token authentication: `Authorization: Bearer <token>`
- Cookie-based authentication fallback for browser requests
- `TEST_MODE` bypass for automated testing (⚠️ NEVER in production)

**Key Files:**
- `server/src/middleware/auth.ts` - Authentication middleware
- `server/src/api/*` - All API routes (protected by `authenticateToken`)

---

### Authentication Security

**Responsibilities:**
- Secure user registration and login
- Protect JWT token generation and validation
- Prevent token theft and replay attacks
- Ensure token expiration and refresh

**Current Implementation:**
- JWT tokens with configurable expiration (`JWT_EXPIRES_IN=7d`)
- Password hashing with `bcryptjs`
- Token verification on every protected request
- Secure token storage (localStorage on frontend, cookies optional)

**Security Measures:**
```typescript
// server/src/api/auth.ts
const hashedPassword = await bcrypt.hash(password, 10);
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);
```

**Key Files:**
- `server/src/api/auth.ts` - Registration and login
- `server/src/api/oauth.ts` - Google OAuth flow
- `contexts/AuthContext.tsx` - Frontend auth state

**Known Issues:**
- ⚠️ No token refresh mechanism (tokens expire after 7 days, user must re-login)
- ⚠️ No rate limiting on login/register endpoints (brute force risk)
- ⚠️ No account lockout after failed login attempts

---

### Rate Limiting

**Current Status:** ❌ **NOT IMPLEMENTED**

**Required Implementation:**
- Rate limiting on authentication endpoints (`/api/v1/auth/login`, `/api/v1/auth/register`)
- Rate limiting on API endpoints (prevent abuse)
- IP-based rate limiting
- User-based rate limiting for authenticated users

**Recommendations:**
- Use `express-rate-limit` middleware
- Limits:
  - Login: 5 attempts per 15 minutes per IP
  - Register: 3 attempts per hour per IP
  - API endpoints: 100 requests per 15 minutes per user/IP
  - Checkout: 10 orders per hour per user

---

### Preventing Brute Force

**Current Status:** ⚠️ **PARTIAL** (no rate limiting, but passwords are hashed)

**Required Measures:**
1. **Rate Limiting** (see above)
2. **Account Lockout:**
   - Lock account after 5 failed login attempts
   - Lock duration: 30 minutes
   - Store lock status in database or Redis
3. **CAPTCHA:**
   - Add CAPTCHA after 3 failed login attempts
   - Use Google reCAPTCHA or similar
4. **Password Complexity:**
   - Minimum 8 characters
   - Require uppercase, lowercase, number (enforced in validation)

**Files to Create/Modify:**
- `server/src/middleware/rateLimit.ts` (new file)
- `server/src/api/auth.ts` (add lockout logic)
- `server/prisma/schema.prisma` (add `loginAttempts` and `lockedUntil` to User model)

---

### Protecting Checkout

**Responsibilities:**
- Ensure only authenticated users can checkout
- Validate cart integrity (products exist, prices valid)
- Prevent duplicate orders
- Protect payment information (when integrated)

**Current Implementation:**
- `ProtectedRoute` component wraps checkout page
- Client-side validation for cart items and shipping info
- Backend validation for order creation
- Transaction-based order creation (prevents partial orders)

**Security Measures:**
```typescript
// app/[locale]/checkout/page.tsx
<ProtectedRoute>
  <CheckoutContent />
</ProtectedRoute>

// server/src/api/orders.ts
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  // Validate items, products exist, prices valid
  // Create order in transaction
});
```

**Key Files:**
- `app/[locale]/checkout/page.tsx` - Checkout page (protected)
- `server/src/api/orders.ts` - Order creation endpoint
- `contexts/CartContext.tsx` - Cart state management

**Future Enhancements:**
- Prevent duplicate orders (check for identical order within 5 minutes)
- Implement order integrity checksum
- Add fraud detection (unusual order patterns)

---

### Protecting User Data

**Responsibilities:**
- Prevent unauthorized access to user profiles
- Protect sensitive user information (email, password, phone)
- Ensure users can only access their own data
- Encrypt sensitive data at rest

**Current Implementation:**
- User can only access their own orders: `order.userId === req.userId`
- Password is hashed (never stored in plain text)
- Email is unique (prevents duplicate accounts)
- Profile picture URLs are validated (no arbitrary URLs)

**Security Measures:**
```typescript
// server/src/api/orders.ts
if (order.userId !== userId) {
  return res.status(403).json({ error: 'Access denied' });
}
```

**Key Files:**
- `server/src/api/users.ts` - User endpoints
- `server/src/api/orders.ts` - Order access control
- `server/src/api/posts.ts` - Post access control (owner only)

**Known Issues:**
- ⚠️ No encryption for sensitive data at rest (phone numbers, addresses)
- ⚠️ Profile pictures can be arbitrary URLs (no validation)
- ⚠️ No data retention policy

---

### Log Auditing

**Current Status:** ⚠️ **BASIC** (console.log only)

**Required Implementation:**
- Structured logging (JSON format)
- Log authentication attempts (success/failure)
- Log sensitive operations (order creation, user deletion)
- Log API errors with stack traces
- Store logs in database or external service (e.g., Logtail, Sentry)

**Recommended Log Levels:**
- `ERROR`: Authentication failures, API errors, database errors
- `WARN`: Rate limit exceeded, suspicious activity
- `INFO`: Order creation, user registration, API calls
- `DEBUG`: Detailed request/response data (dev only)

**Files to Create:**
- `server/src/utils/logger.ts` - Structured logging utility
- `server/src/middleware/auditLog.ts` - Audit logging middleware

---

### Monitoring Suspicious Activity

**Current Status:** ❌ **NOT IMPLEMENTED**

**Required Monitoring:**
1. **Failed Login Attempts:**
   - Track IP addresses with multiple failed logins
   - Alert after 10 failed attempts from same IP

2. **Unusual API Usage:**
   - High request rate from single user/IP
   - Requests to non-existent endpoints
   - Large payload sizes

3. **Order Patterns:**
   - Multiple orders from same user in short time
   - Orders with unusual values (very high/low prices)
   - Orders to same address from different accounts

4. **Database Queries:**
   - Slow queries (potential DoS)
   - Unusual query patterns

**Recommended Tools:**
- Sentry for error tracking
- Custom monitoring dashboard
- Alerts via email/Slack

---

### Reviewing Backend Endpoints

**All Protected Endpoints (require authentication):**

**Authentication:**
- `POST /api/v1/auth/register` - ✅ Public (needed for registration)
- `POST /api/v1/auth/login` - ✅ Public (needed for login)
- `GET /api/v1/oauth/google` - ✅ Public (OAuth flow)

**Users:**
- `GET /api/v1/users` - ✅ Protected (authenticated users only)
- `GET /api/v1/users/me` - ✅ Protected
- `POST /api/v1/users` - ⚠️ Public (should be admin-only for user creation)
- `DELETE /api/v1/users/:id` - ✅ Protected (owner or admin only)

**Products:**
- `GET /api/v1/products` - ✅ Public (needed for browsing)
- `GET /api/v1/products/:id` - ✅ Public (needed for product details)
- `POST /api/v1/products` - ✅ Protected (authenticated users)
- `PUT /api/v1/products/:id` - ✅ Protected (owner only)
- `DELETE /api/v1/products/:id` - ✅ Protected (owner only)

**Makers:**
- `GET /api/v1/makers` - ✅ Public
- `GET /api/v1/makers/:id` - ✅ Public
- `POST /api/v1/makers` - ✅ Protected

**Videos:**
- `GET /api/v1/videos` - ✅ Public
- `POST /api/v1/videos` - ✅ Protected
- `DELETE /api/v1/videos/:id` - ✅ Protected (owner only)

**Orders:**
- `POST /api/v1/orders` - ✅ Protected (authenticated users only)
- `GET /api/v1/orders` - ✅ Protected (own orders only)
- `GET /api/v1/orders/:id` - ✅ Protected (owner only)

**Posts & Comments:**
- `GET /api/v1/posts` - ✅ Protected (authenticated users)
- `POST /api/v1/posts` - ✅ Protected
- `DELETE /api/v1/posts/:id` - ✅ Protected (owner only)
- `POST /api/v1/posts/:id/like` - ✅ Protected

**Security Review Checklist:**
- ✅ All sensitive operations require authentication
- ✅ Resource access is owner-only (orders, posts, products)
- ⚠️ Rate limiting not implemented
- ⚠️ Input validation could be stronger

---

### Reviewing CORS

**Current Status:** ⚠️ **NEEDS REVIEW**

**CORS Configuration:**
- Frontend URL: `https://banda-chao-frontend.onrender.com`
- Backend URL: `https://banda-chao-backend.onrender.com`

**Required Configuration:**
```typescript
// server/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://banda-chao-frontend.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Security Considerations:**
- ✅ Only allow frontend origin (not `*`)
- ✅ Credentials enabled for cookies
- ⚠️ Review allowed methods (DELETE should be restricted)
- ⚠️ Review allowed headers

---

### Reviewing File Uploads

**Current Status:** ⚠️ **LIMITED** (profile pictures, product images via URL, not file upload)

**Current Implementation:**
- Images stored as URLs (external links)
- No file upload endpoint currently active

**Future File Upload Security:**
1. **File Type Validation:**
   - Only allow images (JPEG, PNG, WebP)
   - Reject executable files (.exe, .sh, .php)

2. **File Size Limits:**
   - Profile pictures: Max 2MB
   - Product images: Max 5MB
   - Video thumbnails: Max 1MB

3. **Storage Security:**
   - Store files outside web root
   - Generate unique filenames (prevent path traversal)
   - Validate file content (not just extension)

4. **Upload Endpoint:**
   - Require authentication
   - Rate limit uploads (prevent abuse)
   - Scan for malware (optional)

**Files to Create:**
- `server/src/api/upload.ts` - File upload endpoint
- `server/src/middleware/upload.ts` - Multer configuration

---

### Reviewing Input Validation

**Current Implementation:**

**Backend Validation:**
- UUID validation: `isValidUUID()` utility
- Email validation: `isValidEmail()` utility
- Order validation: Items array, quantities, shipping info
- Password length: Minimum 6 characters (should be 8)

**Frontend Validation:**
- Form validation in checkout page
- Phone number regex validation
- Cart item validation (price, quantity)

**Validation Gaps:**
- ⚠️ No SQL injection protection (Prisma handles this, but manual queries need review)
- ⚠️ No XSS protection on user-generated content (posts, comments)
- ⚠️ No CSRF protection (should add CSRF tokens)
- ⚠️ No input sanitization (strip HTML tags from user input)

**Required Enhancements:**
```typescript
// server/src/utils/validation.ts
export function sanitizeInput(input: string): string {
  // Remove HTML tags
  return input.replace(/<[^>]*>/g, '');
}

export function validateProductName(name: string): boolean {
  // Max length, no special characters
  return /^[a-zA-Z0-9\u0600-\u06FF\s]{1,100}$/.test(name);
}
```

---

### Reviewing Roles & Permissions

**Current Roles:**
- `USER` - Regular user (default)
- `FOUNDER` - Platform founder (admin access)

**Role-Based Access Control:**

**USER Role:**
- ✅ Create/edit/delete own products
- ✅ Create/edit/delete own videos
- ✅ Create/edit/delete own posts
- ✅ Create orders
- ✅ View own orders
- ❌ Access founder dashboard
- ❌ Delete other users' content

**FOUNDER Role:**
- ✅ All USER permissions
- ✅ Access founder dashboard (`/founder/*`)
- ✅ Access 6 AI assistants
- ✅ View platform statistics
- ⚠️ Can delete other users' content (not yet implemented)
- ⚠️ Can view all orders (not yet implemented)

**Missing Roles:**
- `ADMIN` - Platform administrators (not founder)
- `MODERATOR` - Content moderators
- `MAKER` - Special maker role (different from USER with maker profile)

**Key Files:**
- `server/src/utils/roles.ts` - Role checking utilities
- `server/src/api/*` - Role checks in endpoints
- `components/ProtectedRoute.tsx` - Frontend route protection

---

### Reviewing Database Access

**Current Implementation:**
- Prisma ORM (prevents SQL injection)
- Connection pooling (managed by Prisma)
- Transactions for critical operations (order creation)

**Security Measures:**
- ✅ Parameterized queries (Prisma handles this)
- ✅ Connection string in environment variables (not hardcoded)
- ✅ Migrations run automatically on deployment

**Database Security Gaps:**
- ⚠️ No database-level user permissions (all queries use same connection)
- ⚠️ No query logging (difficult to audit)
- ⚠️ No connection encryption (should use SSL for production)
- ⚠️ No backup encryption

**Recommended Enhancements:**
- Use SSL for database connections (`?sslmode=require` in DATABASE_URL)
- Implement read-only database users for reporting
- Regular database backups
- Encrypt backups at rest

---

### Reviewing Third-Party APIs

**Current Third-Party Services:**
- Google OAuth (for authentication)
- Render (hosting)
- PostgreSQL (database)

**Security Considerations:**

**Google OAuth:**
- ✅ OAuth credentials in environment variables
- ✅ Redirect URI validation
- ⚠️ No token refresh handling (user must re-login after token expires)

**Render:**
- ✅ Environment variables secured (not exposed in logs)
- ✅ HTTPS enforced
- ⚠️ No DDoS protection (basic Render protection only)

**Future Third-Party Integrations:**
- Payment providers (Stripe, PayPal) - Require PCI compliance
- Email service (SendGrid, AWS SES) - Secure API keys
- Analytics (Google Analytics, Mixpanel) - Privacy-compliant tracking

---

### Security Best Practices for Next.js & Express

#### Next.js Security:

**1. Environment Variables:**
```typescript
// ✅ Correct: Server-only env vars
const secret = process.env.JWT_SECRET; // Not exposed to client

// ❌ Wrong: NEXT_PUBLIC_ prefix exposes to client
const apiKey = process.env.NEXT_PUBLIC_SECRET_KEY; // Exposed!
```

**2. XSS Protection:**
```typescript
// ✅ Correct: React escapes by default
<div>{userInput}</div> // Safe

// ⚠️ Dangerous: dangerouslySetInnerHTML (avoid if possible)
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**3. Content Security Policy (CSP):**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
  }
];
```

**4. HTTPS Redirect:**
- Render enforces HTTPS automatically
- No additional configuration needed

#### Express Security:

**1. Helmet.js (Security Headers):**
```typescript
// Install: npm install helmet
import helmet from 'helmet';
app.use(helmet());
```

**2. Input Sanitization:**
```typescript
import { body, validationResult } from 'express-validator';

router.post('/products',
  body('name').trim().escape(),
  body('price').isFloat({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);
```

**3. SQL Injection Prevention:**
- ✅ Prisma ORM prevents SQL injection (parameterized queries)
- ⚠️ Never use raw SQL queries with user input

---

### Known Vulnerabilities (XSS, CSRF, SQL Injection)

#### XSS (Cross-Site Scripting)

**Risk Level:** ⚠️ **MEDIUM**

**Vulnerable Areas:**
- User-generated content (posts, comments, product descriptions)
- Profile bios and maker stories
- Search queries (reflected in results)

**Mitigation:**
- ✅ React escapes content by default
- ⚠️ Need sanitization for rich text (if implemented)
- ⚠️ No CSP headers implemented

**Required Actions:**
- Add CSP headers
- Sanitize user input before storing
- Validate URLs in profile pictures and product images

---

#### CSRF (Cross-Site Request Forgery)

**Risk Level:** ⚠️ **MEDIUM**

**Vulnerable Operations:**
- Order creation (`POST /api/v1/orders`)
- Post creation (`POST /api/v1/posts`)
- Like/unlike (`POST /api/v1/posts/:id/like`)

**Mitigation:**
- ⚠️ No CSRF tokens currently implemented
- ✅ Same-origin policy helps (but not sufficient)

**Required Actions:**
- Implement CSRF tokens for state-changing operations
- Use `csrf` package for Express
- Include CSRF token in forms and API requests

---

#### SQL Injection

**Risk Level:** ✅ **LOW** (Prisma ORM prevents this)

**Mitigation:**
- ✅ Prisma ORM uses parameterized queries
- ✅ No raw SQL queries in codebase

**Monitoring:**
- Review any future raw SQL queries
- Ensure Prisma is always used for database access

---

### Security Checklists

#### Pre-Deployment Security Checklist:

- [ ] All environment variables set and secure
- [ ] `TEST_MODE=false` in production
- [ ] `JWT_SECRET` is strong (min 32 characters)
- [ ] Database connection uses SSL
- [ ] CORS configured correctly (not `*`)
- [ ] Rate limiting enabled on auth endpoints
- [ ] Input validation on all user inputs
- [ ] XSS protection (CSP headers, sanitization)
- [ ] CSRF protection (tokens for state-changing operations)
- [ ] File upload validation (if applicable)
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured (errors, suspicious activity)
- [ ] Backups encrypted and tested

#### Authentication Security Checklist:

- [ ] Passwords hashed with bcrypt (salt rounds >= 10)
- [ ] JWT tokens have expiration
- [ ] Token refresh mechanism (if needed)
- [ ] Rate limiting on login/register
- [ ] Account lockout after failed attempts
- [ ] CAPTCHA on suspicious activity
- [ ] Password complexity requirements
- [ ] Secure password reset flow (if implemented)

#### API Security Checklist:

- [ ] All sensitive endpoints require authentication
- [ ] Resource access is owner-only
- [ ] Input validation on all endpoints
- [ ] Output sanitization (no sensitive data leaked)
- [ ] Rate limiting on API endpoints
- [ ] CORS configured correctly
- [ ] Error messages don't expose internals
- [ ] Idempotent operations for DELETE (prevents issues)

---

## 2. What Security Panda Oversees - ما يشرف عليه الباندا الحارس

### Protected Routes & Endpoints

**Authentication Endpoints:**
- `/api/v1/auth/register` - User registration
- `/api/v1/auth/login` - User login
- `/api/v1/oauth/google` - Google OAuth

**User Management:**
- `/api/v1/users` - User listing (authenticated)
- `/api/v1/users/me` - Current user (authenticated)
- `/api/v1/users/:id` - User deletion (owner/admin only)

**Order Operations:**
- `/api/v1/orders` - Order creation and listing (authenticated, owner-only)
- `/api/v1/orders/:id` - Order details (owner-only)
- `/api/v1/orders/:id/status` - Order status update (owner/admin)

**Content Management:**
- `/api/v1/products` - Product creation (authenticated, owner-only for edit/delete)
- `/api/v1/videos` - Video creation (authenticated, owner-only for delete)
- `/api/v1/posts` - Post creation (authenticated, owner-only for delete)
- `/api/v1/comments` - Comment creation (authenticated, owner-only for delete)

**Frontend Protected Routes:**
- `app/[locale]/checkout/page.tsx` - Protected by `ProtectedRoute`
- `app/founder/*` - Protected by role check (FOUNDER only)
- `app/[locale]/maker/dashboard/*` - Protected by authentication

---

### Middleware Files

**Authentication Middleware:**
- `server/src/middleware/auth.ts` - JWT authentication, TEST_MODE bypass

**Future Middleware to Create:**
- `server/src/middleware/rateLimit.ts` - Rate limiting
- `server/src/middleware/csrf.ts` - CSRF protection
- `server/src/middleware/auditLog.ts` - Audit logging
- `server/src/middleware/inputValidation.ts` - Input validation

---

### Security-Critical Components

**Frontend:**
- `components/ProtectedRoute.tsx` - Route protection wrapper
- `contexts/AuthContext.tsx` - Authentication state management
- `app/[locale]/checkout/page.tsx` - Checkout (protected)

**Backend:**
- `server/src/api/auth.ts` - Authentication endpoints
- `server/src/api/orders.ts` - Order creation (transaction-based)
- `server/src/api/users.ts` - User management (access control)

---

## 3. Future Security Enhancements - التحسينات الأمنية المستقبلية

### Phase 1: Basic Security (Immediate)

1. **Rate Limiting:**
   - Implement on auth endpoints
   - Implement on API endpoints
   - Use `express-rate-limit`

2. **Account Lockout:**
   - Lock after 5 failed login attempts
   - Store in database or Redis

3. **CSRF Protection:**
   - Add CSRF tokens to forms
   - Validate tokens on POST/PUT/DELETE

4. **Input Sanitization:**
   - Sanitize user input (strip HTML)
   - Validate file uploads (if implemented)

### Phase 2: Advanced Security (Short-term)

1. **Security Headers:**
   - Add Helmet.js to Express
   - Configure CSP headers

2. **Audit Logging:**
   - Structured logging
   - Log authentication attempts
   - Log sensitive operations

3. **Monitoring:**
   - Set up Sentry for error tracking
   - Monitor suspicious activity
   - Alert on anomalies

### Phase 3: Enterprise Security (Long-term)

1. **Encryption:**
   - Encrypt sensitive data at rest
   - Use SSL for all database connections

2. **Advanced Authentication:**
   - Two-factor authentication (2FA)
   - Password reset flow
   - Email verification

3. **Compliance:**
   - GDPR compliance (EU users)
   - PCI compliance (payment processing)
   - Data retention policies

---

## 📚 Additional Resources

- **Technical Brain**: `docs/TECHNICAL_BRAIN.md`
- **Backend API Map**: `BACKEND_API_MAP.md`
- **Testing Guide**: `TESTING_GUIDE.md`

---

**Last Updated:** 2025-01-17  
**Maintained By:** Security Panda AI Assistant  
**Status:** ✅ Active Security Memory Archive

