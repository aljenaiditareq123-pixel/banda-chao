# Production Seeding Guide

## Overview

This document explains how to seed the production database with demo data (users, products, videos, etc.) for testing purposes.

## Seeding Endpoint

The backend provides a seeding endpoint at:

```
POST /api/v1/seed
```

## Prerequisites

1. **Backend Server**: The backend must be running and accessible.
2. **Secret Key**: You need the `SEED_SECRET` environment variable value from the backend server.
3. **Database Access**: The backend must have write access to the database.

## How to Seed Production

### Step 1: Get the Secret Key

The secret key is stored in the backend's environment variables as `SEED_SECRET`. Contact the backend administrator or check the backend deployment configuration (Render, Heroku, etc.).

**Default secret** (if not set): `change-this-secret-key-in-production`

⚠️ **Security Note**: The secret should be changed in production to prevent unauthorized seeding.

### Step 2: Call the Seeding Endpoint

Use any HTTP client (curl, Postman, or a simple script) to call the endpoint:

#### Using cURL:

```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "YOUR_SEED_SECRET_HERE"}'
```

#### Using JavaScript/Node.js:

```javascript
const response = await fetch('https://banda-chao-backend.onrender.com/api/v1/seed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    secret: 'YOUR_SEED_SECRET_HERE'
  })
});

const data = await response.json();
console.log(data);
```

#### Using Postman:

1. Set method to `POST`
2. URL: `https://banda-chao-backend.onrender.com/api/v1/seed`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "secret": "YOUR_SEED_SECRET_HERE"
   }
   ```

### Step 3: Verify Seeding

After successful seeding, you should see:

- **5 Users** created (user1@bandachao.com through user5@bandachao.com)
- **Multiple Products** created for each user
- **Multiple Videos** (short and long) created
- **Posts** created
- **Sample Orders** created

You can verify by:

1. **Check Products Page**: Visit `/products` - you should see multiple products
2. **Check Videos Page**: Visit `/videos` - you should see videos in both "short" and "long" tabs
3. **Check Users**: Try logging in with one of the seeded users:
   - Email: `user1@bandachao.com`
   - Password: `password123`

## What Gets Seeded

The seed script creates:

- **5 Users**: user1@bandachao.com through user5@bandachao.com (all with password: `password123`)
- **Products**: Multiple products per user with images, prices, categories
- **Videos**: Mix of short and long videos
- **Posts**: Sample social media posts
- **Orders**: Sample order history

## Important Notes

1. **Data Clearing**: The seed script **clears all existing data** before seeding:
   - All messages
   - All posts
   - All videos
   - All products
   - All users

   ⚠️ **Warning**: Do NOT run seeding on a production database with real user data unless you intend to wipe it.

2. **Idempotency**: You can run the seed script multiple times - it will clear and recreate data each time.

3. **Environment Variables**: Make sure the backend has the correct `SEED_SECRET` environment variable set.

## Troubleshooting

### Error: "Secret key is required"
- Make sure you're sending the `secret` field in the request body.

### Error: "Invalid secret key"
- The secret you provided doesn't match the backend's `SEED_SECRET` environment variable.
- Contact the backend administrator to get the correct secret.

### Error: 404 Not Found
- Check that the backend URL is correct.
- Verify the endpoint path: `/api/v1/seed`

### Error: 500 Internal Server Error
- Check backend logs for database connection issues.
- Verify that the database is accessible from the backend server.

## Alternative: Manual Product Creation

If you prefer not to use the seed script, you can manually create products:

1. **Register a new user** via `/register`
2. **Login** to get an auth token
3. **Create products** via `POST /api/v1/products` with the auth token
4. **Create videos** via `POST /api/v1/videos` with the auth token

## Security Recommendations

1. **Change the default secret** in production:
   ```env
   SEED_SECRET=your-strong-random-secret-here
   ```

2. **Restrict access** to the seed endpoint in production (e.g., IP whitelist, additional authentication).

3. **Use seed script only in staging/test environments**, not production with real user data.




