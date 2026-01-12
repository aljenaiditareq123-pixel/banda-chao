# Banda Chao - Backend API Map

## Base URL

```
https://banda-chao-backend.onrender.com/api/v1
```

## Authentication

All protected endpoints require authentication via:
- **Bearer Token**: `Authorization: Bearer <token>`
- **Cookie**: `auth_token=<token>`

The backend prioritizes Bearer token from `Authorization` header, then falls back to cookie.

### Test Mode

When `TEST_MODE=true` in environment:
- All authentication is bypassed
- Requests are treated as authenticated
- `req.userId = "test-user"`
- `req.userEmail = "test@example.com"`

⚠️ **Never enable TEST_MODE in production!**

## Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response**:
- `201 Created`: `{ token, user: {...} }`
- `400 Bad Request`: Invalid input
- `409 Conflict`: Email already exists

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
- `200 OK`: `{ token, user: {...} }`
- `401 Unauthorized`: Invalid credentials

#### Google OAuth
```http
GET /api/v1/oauth/google
```

**Response**: Redirects to Google OAuth, then callback with token.

---

### Users

#### Get All Users (Authenticated)
```http
GET /api/v1/users?page=1&limit=10
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ data: [...], pagination: { total, page, limit } }`

#### Get Current User (Authenticated)
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ user: {...} }`
- `401 Unauthorized`: Not authenticated

#### Create User
```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response**:
- `201 Created`: User object
- `400 Bad Request`: Invalid input
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Server error

#### Delete User (Authenticated)
```http
DELETE /api/v1/users/:id
Authorization: Bearer <token>
```

**Response**:
- `204 No Content`: Successfully deleted (idempotent)
- `404 Not Found`: User not found
- `409 Conflict`: User has dependencies (orders, posts, etc.)
- `403 Forbidden`: Can only delete own account (unless FOUNDER)

---

### Products

#### Get All Products
```http
GET /api/v1/products?page=1&limit=20&category=电子产品
```

**Response**:
- `200 OK`: `{ data: [...], pagination: {...} }`

#### Get Product by ID
```http
GET /api/v1/products/:id
```

**Response**:
- `200 OK`: `{ data: {...} }`
- `404 Not Found`: Product doesn't exist

#### Create Product (Authenticated)
```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "电子产品",
  "imageUrl": "https://...",
  "externalLink": "https://..."
}
```

**Response**:
- `201 Created`: `{ data: {...} }`

#### Update Product (Authenticated, Owner Only)
```http
PUT /api/v1/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 129.99
}
```

**Response**:
- `200 OK`: `{ data: {...} }`
- `403 Forbidden`: Not the product owner
- `404 Not Found`: Product doesn't exist

#### Delete Product (Authenticated, Owner Only, Idempotent)
```http
DELETE /api/v1/products/:id
Authorization: Bearer <token>
```

**Response**:
- `204 No Content`: Successfully deleted (idempotent: returns 204 even if not found)
- `403 Forbidden`: Not the product owner

---

### Makers

#### Get All Makers
```http
GET /api/v1/makers?search=keyword
```

**Response**:
- `200 OK`: `{ data: [...] }`

#### Get Maker by ID/Slug
```http
GET /api/v1/makers/:id
```

**Response**:
- `200 OK`: `{ data: {...} }`
- `404 Not Found`: Maker doesn't exist

#### Create Maker (Authenticated)
```http
POST /api/v1/makers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Maker Name",
  "bio": "Maker bio",
  "story": "Maker story...",
  "profilePictureUrl": "https://...",
  "coverPictureUrl": "https://..."
}
```

**Response**:
- `201 Created`: `{ maker: {...} }`

#### Get My Maker (Authenticated)
```http
GET /api/v1/makers/me
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ maker: {...} }`
- `404 Not Found`: User doesn't have a maker profile

---

### Videos

#### Get All Videos
```http
GET /api/v1/videos?type=short&limit=20
```

**Query Parameters**:
- `type`: `short` | `long` (optional)
- `limit`: Number of results (default: 20)

**Response**:
- `200 OK`: `{ data: [...], pagination: {...} }`

#### Get Video by ID
```http
GET /api/v1/videos/:id
```

**Response**:
- `200 OK`: `{ data: {...} }`
- `404 Not Found`: Video doesn't exist

#### Create Video (Authenticated)
```http
POST /api/v1/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Video Title",
  "description": "Video description",
  "videoUrl": "https://...",
  "thumbnailUrl": "https://...",
  "duration": 120,
  "type": "short"
}
```

**Response**:
- `201 Created`: `{ data: {...} }`

#### Delete Video (Authenticated, Owner Only, Idempotent)
```http
DELETE /api/v1/videos/:id
Authorization: Bearer <token>
```

**Response**:
- `204 No Content`: Successfully deleted (idempotent)

---

### Orders

#### Create Order (Authenticated)
```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "productId": "product-id", "quantity": 2 }
  ],
  "shippingName": "John Doe",
  "shippingAddress": "123 Main St, City",
  "shippingCity": "City",
  "shippingCountry": "Country",
  "shippingPhone": "+1234567890"
}
```

**Response**:
- `201 Created`: `{ data: { id, ...order details } }`
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### Get User's Orders (Authenticated)
```http
GET /api/v1/orders
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ data: [...] }`

#### Get Order by ID (Authenticated, Owner Only)
```http
GET /api/v1/orders/:id
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ data: {...} }`
- `404 Not Found`: Order doesn't exist
- `403 Forbidden`: Not the order owner

---

### Posts

#### Get All Posts
```http
GET /api/v1/posts?page=1&limit=20
```

**Response**:
- `200 OK`: `{ data: [...], pagination: {...} }`

#### Create Post (Authenticated)
```http
POST /api/v1/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Post content",
  "images": ["https://..."]
}
```

**Response**:
- `201 Created`: `{ data: {...} }`

#### Like/Unlike Post (Authenticated, Idempotent)
```http
POST /api/v1/posts/:id/like
DELETE /api/v1/posts/:id/like
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ liked: true/false }`
- `404 Not Found`: Post doesn't exist

#### Delete Post (Authenticated, Owner Only, Idempotent)
```http
DELETE /api/v1/posts/:id
Authorization: Bearer <token>
```

**Response**:
- `204 No Content`: Successfully deleted (idempotent)

---

### Comments

#### Get Comments for Post
```http
GET /api/v1/posts/:postId/comments
```

**Response**:
- `200 OK`: `{ data: [...] }`

#### Create Comment (Authenticated)
```http
POST /api/v1/posts/:postId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Comment text"
}
```

**Response**:
- `201 Created`: `{ data: {...} }`

#### Delete Comment (Authenticated, Owner Only, Idempotent)
```http
DELETE /api/v1/comments/:id
Authorization: Bearer <token>
```

**Response**:
- `204 No Content`: Successfully deleted (idempotent)

---

### Follow

#### Follow User (Authenticated, Idempotent)
```http
POST /api/v1/users/:id/follow
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ following: true }`
- `400 Bad Request`: Cannot follow yourself
- `404 Not Found`: User doesn't exist

#### Unfollow User (Authenticated, Idempotent)
```http
DELETE /api/v1/users/:id/follow
Authorization: Bearer <token>
```

**Response**:
- `200 OK`: `{ following: false }`
- `404 Not Found`: User doesn't exist

#### Get Followers
```http
GET /api/v1/users/:id/followers
```

**Response**:
- `200 OK`: `{ data: [...] }`

#### Get Following
```http
GET /api/v1/users/:id/following
```

**Response**:
- `200 OK`: `{ data: [...] }`

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

## HTTP Status Codes

- `200 OK` - Success (GET, PUT)
- `201 Created` - Resource created (POST)
- `204 No Content` - Success with no body (DELETE, idempotent)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Conflicting data (duplicate, dependencies)
- `500 Internal Server Error` - Server error

## Idempotent Operations

The following DELETE operations are idempotent:
- `DELETE /api/v1/users/:id` - Returns 204 even if user doesn't exist
- `DELETE /api/v1/products/:id` - Returns 204 even if product doesn't exist
- `DELETE /api/v1/videos/:id` - Returns 204 even if video doesn't exist
- `DELETE /api/v1/posts/:id` - Returns 204 even if post doesn't exist
- `DELETE /api/v1/comments/:id` - Returns 204 even if comment doesn't exist

This ensures safe retries in case of network issues.

## Pagination

Endpoints that support pagination:

- `GET /api/v1/users?page=1&limit=10`
- `GET /api/v1/products?page=1&limit=20`
- `GET /api/v1/videos?page=1&limit=20`
- `GET /api/v1/posts?page=1&limit=20`

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

