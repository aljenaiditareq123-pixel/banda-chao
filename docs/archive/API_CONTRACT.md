# 📋 API Contract - Backend Endpoints Required
**Date:** December 2024  
**Purpose:** This document lists all API endpoints that must be implemented in the Express backend for the frontend to work properly.

---

## 🔐 Authentication Required

All endpoints below (except public ones) require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## 1. Video Likes API

### 1.1 Like a Video
**Endpoint:** `POST /api/v1/videos/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Video liked successfully",
  "data": {
    "id": "video-id",
    "likes": 5,
    "liked": true
  }
}
```

### 1.2 Unlike a Video
**Endpoint:** `DELETE /api/v1/videos/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Video unliked successfully",
  "data": {
    "id": "video-id",
    "likes": 4,
    "liked": false
  }
}
```

### 1.3 Check if Video is Liked
**Endpoint:** `GET /api/v1/videos/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "liked": true,
  "likesCount": 5
}
```

---

## 2. Product Likes API

### 2.1 Like a Product
**Endpoint:** `POST /api/v1/products/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Product liked successfully",
  "data": {
    "id": "product-id",
    "likes": 3,
    "liked": true
  }
}
```

### 2.2 Unlike a Product
**Endpoint:** `DELETE /api/v1/products/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Product unliked successfully",
  "data": {
    "id": "product-id",
    "likes": 2,
    "liked": false
  }
}
```

### 2.3 Check if Product is Liked
**Endpoint:** `GET /api/v1/products/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "liked": false,
  "likesCount": 2
}
```

---

## 3. Comments API

### 3.1 Get Comments
**Endpoint:** `GET /api/v1/comments`  
**Auth:** Optional (if authenticated, includes userLiked status)  
**Query Parameters:**
- `videoId` (optional): Filter comments by video ID
- `productId` (optional): Filter comments by product ID

**Response:**
```json
{
  "data": [
    {
      "id": "comment-id",
      "userId": "user-id",
      "videoId": "video-id", // or null
      "productId": "product-id", // or null
      "content": "Great video!",
      "likes": 2,
      "createdAt": "2024-12-01T10:00:00Z",
      "user": {
        "id": "user-id",
        "name": "User Name",
        "profilePicture": "https://example.com/avatar.jpg"
      },
      "userLiked": false // only if authenticated
    }
  ]
}
```

### 3.2 Create Comment
**Endpoint:** `POST /api/v1/comments`  
**Auth:** Required  
**Request Body:**
```json
{
  "videoId": "video-id", // optional
  "productId": "product-id", // optional
  "content": "Great video!"
}
```

**Response:**
```json
{
  "message": "Comment created successfully",
  "data": {
    "id": "comment-id",
    "userId": "user-id",
    "videoId": "video-id",
    "productId": null,
    "content": "Great video!",
    "likes": 0,
    "createdAt": "2024-12-01T10:00:00Z",
    "user": {
      "id": "user-id",
      "name": "User Name",
      "profilePicture": "https://example.com/avatar.jpg"
    }
  }
}
```

### 3.3 Delete Comment
**Endpoint:** `DELETE /api/v1/comments/:id`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

**Note:** Only the comment owner can delete their comment.

### 3.4 Like a Comment
**Endpoint:** `POST /api/v1/comments/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Comment liked successfully",
  "data": {
    "id": "comment-id",
    "likes": 3,
    "liked": true
  }
}
```

### 3.5 Unlike a Comment
**Endpoint:** `DELETE /api/v1/comments/:id/like`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Comment unliked successfully",
  "data": {
    "id": "comment-id",
    "likes": 2,
    "liked": false
  }
}
```

---

## 4. User Profile API

### 4.1 Update User Profile
**Endpoint:** `PUT /api/v1/users/:id`  
**Auth:** Required  
**Request Body:**
```json
{
  "name": "New Name", // optional
  "profilePicture": "https://example.com/avatar.jpg", // optional
  "bio": "User bio text" // optional
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "New Name",
    "profilePicture": "https://example.com/avatar.jpg",
    "bio": "User bio text",
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

**Note:** Users can only update their own profile.

### 4.2 Upload Avatar
**Endpoint:** `POST /api/v1/users/avatar`  
**Auth:** Required  
**Request Body:** `multipart/form-data`
- `avatar`: File (image file)

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://example.com/avatars/user-id-avatar.jpg"
}
```

**Note:** 
- File should be uploaded to cloud storage (AWS S3, Cloudinary, etc.)
- Return the public URL of the uploaded file
- Maximum file size: 5MB
- Allowed formats: JPG, PNG, WebP

---

## 5. Video/Product Deletion API

### 5.1 Delete Video
**Endpoint:** `DELETE /api/v1/videos/:id`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Video deleted successfully"
}
```

**Note:** Only the video owner can delete their video.

### 5.2 Delete Product
**Endpoint:** `DELETE /api/v1/products/:id`  
**Auth:** Required  
**Request Body:** None  
**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

**Note:** Only the product owner can delete their product.

---

## 6. Error Responses

All endpoints should return appropriate error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred on the server"
}
```

---

## 7. Database Schema Recommendations

### Likes Table
```sql
CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE TABLE product_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (
    (video_id IS NOT NULL AND product_id IS NULL) OR
    (video_id IS NULL AND product_id IS NOT NULL)
  )
);
```

### Users Table (update)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
```

---

## 8. Implementation Notes

### 8.1 Like/Unlike Logic
- When a user likes an item, create a record in the likes table
- When a user unlikes an item, delete the record from the likes table
- Use `UNIQUE` constraint to prevent duplicate likes
- Update the `likes` count on the video/product/comment table

### 8.2 Comments Logic
- Comments can be associated with either a video OR a product (not both)
- When deleting a video/product, cascade delete all associated comments
- When deleting a comment, cascade delete all associated comment likes

### 8.3 Avatar Upload
- Use a cloud storage service (AWS S3, Cloudinary, etc.)
- Generate unique file names to prevent conflicts
- Validate file type and size on the server
- Return the public URL of the uploaded file

### 8.4 Authorization
- Users can only update/delete their own resources
- Check user ID from JWT token against resource owner ID
- Return 403 Forbidden if user doesn't have permission

---

## 9. Testing

### 9.1 Test Cases
1. ✅ Like a video (authenticated user)
2. ✅ Unlike a video (authenticated user)
3. ✅ Check if video is liked (authenticated user)
4. ✅ Like a product (authenticated user)
5. ✅ Unlike a product (authenticated user)
6. ✅ Check if product is liked (authenticated user)
7. ✅ Get comments for a video (public)
8. ✅ Get comments for a product (public)
9. ✅ Create a comment (authenticated user)
10. ✅ Delete a comment (owner only)
11. ✅ Like a comment (authenticated user)
12. ✅ Unlike a comment (authenticated user)
13. ✅ Update user profile (owner only)
14. ✅ Upload avatar (authenticated user)
15. ✅ Delete video (owner only)
16. ✅ Delete product (owner only)

### 9.2 Error Cases
1. ✅ Like without authentication (401)
2. ✅ Delete comment not owned by user (403)
3. ✅ Delete video not owned by user (403)
4. ✅ Update profile of another user (403)
5. ✅ Upload invalid file type (400)
6. ✅ Upload file too large (400)
7. ✅ Like non-existent video (404)
8. ✅ Comment on non-existent video (404)

---

## 10. Summary

### Endpoints to Implement:
1. ✅ `POST /api/v1/videos/:id/like` - Like a video
2. ✅ `DELETE /api/v1/videos/:id/like` - Unlike a video
3. ✅ `GET /api/v1/videos/:id/like` - Check if video is liked
4. ✅ `POST /api/v1/products/:id/like` - Like a product
5. ✅ `DELETE /api/v1/products/:id/like` - Unlike a product
6. ✅ `GET /api/v1/products/:id/like` - Check if product is liked
7. ✅ `GET /api/v1/comments` - Get comments
8. ✅ `POST /api/v1/comments` - Create a comment
9. ✅ `DELETE /api/v1/comments/:id` - Delete a comment
10. ✅ `POST /api/v1/comments/:id/like` - Like a comment
11. ✅ `DELETE /api/v1/comments/:id/like` - Unlike a comment
12. ✅ `PUT /api/v1/users/:id` - Update user profile (add bio support)
13. ✅ `POST /api/v1/users/avatar` - Upload avatar
14. ✅ `DELETE /api/v1/videos/:id` - Delete video (already exists, verify authorization)
15. ✅ `DELETE /api/v1/products/:id` - Delete product (already exists, verify authorization)

---

**Note:** This contract assumes the backend is using Express.js with Prisma ORM and PostgreSQL database. Adjust the implementation details based on your actual backend stack.

