# 🎨 Social Panda Brain - Memory Archive
## باندا المحتوى - أرشيف الذاكرة

**Version:** 1.0  
**Last Updated:** 2025-01-17  
**Purpose:** Long-term memory bank for the Social Panda AI Assistant

---

## 1. Social Panda Responsibilities - مسؤوليات باندا المحتوى

### Social Feed Logic - منطق Feed الاجتماعي

**Current Implementation:**

**Feed Structure:**
- Chronological feed (newest first)
- Displays posts from all users
- Includes: content, author, date, likes, comments

**Feed Endpoint:**
```typescript
// GET /api/v1/posts
router.get('/', authenticateToken, async (req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      user: {
        select: { id: true, name: true, profilePicture: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(posts);
});
```

**Frontend Display:**
- `app/feed/page.tsx` - Feed page (Client Component)
- Displays posts in vertical list
- Shows author, content, images, likes, comments
- "Load More" button for pagination

**Current Features:**
- ✅ Display all posts
- ✅ Show author information
- ✅ Display likes and comments count
- ✅ Load more posts (pagination)
- ⚠️ No algorithm-based ranking (chronological only)
- ⚠️ No personalized feed (shows all posts)

**Key Files:**
- `server/src/api/posts.ts` - Posts API
- `app/feed/page.tsx` - Feed page
- `components/Comments.tsx` - Comments component
- `components/LikeButton.tsx` - Like button component

---

### Posts, Likes, Comments - المنشورات، الإعجابات، التعليقات

#### Posts (المنشورات)

**Post Structure:**
```typescript
interface Post {
  id: string;
  content: string;
  images: string[];  // Array of image URLs
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;  // Author information
}
```

**Post Operations:**
- `GET /api/v1/posts` - List all posts (feed)
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts` - Create post (authenticated)
- `PUT /api/v1/posts/:id` - Update post (owner only)
- `DELETE /api/v1/posts/:id` - Delete post (owner only, idempotent)

**Current Validation:**
- Content is required (not empty)
- Images array is optional
- User must be authenticated to create

**Future Enhancements:**
- Rich text support (markdown, links)
- Video posts
- Post scheduling
- Post drafts

---

#### Likes (الإعجابات)

**Like Structure:**
```prisma
model PostLike {
  id     String @id @default(uuid())
  postId String @map("post_id")
  userId String @map("user_id")
  
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([postId, userId])  // One like per user per post
  @@map("post_likes")
}
```

**Like Operations:**
- `POST /api/v1/posts/:id/like` - Like/unlike post (idempotent)
- `DELETE /api/v1/posts/:id/like` - Unlike post (idempotent)

**Current Implementation:**
```typescript
// POST /api/v1/posts/:id/like
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  const postId = req.params.id;
  const userId = req.userId!;
  
  // Check if already liked
  const existingLike = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } }
  });
  
  if (existingLike) {
    // Unlike (delete)
    await prisma.postLike.delete({
      where: { id: existingLike.id }
    });
    return res.json({ liked: false });
  } else {
    // Like (create)
    await prisma.postLike.create({
      data: { postId, userId }
    });
    return res.json({ liked: true });
  }
});
```

**Current Features:**
- ✅ Like/unlike toggle (idempotent)
- ✅ One like per user per post
- ✅ Like count displayed on posts
- ⚠️ No notification when post is liked (future)

---

#### Comments (التعليقات)

**Comment Structure:**
```prisma
model Comment {
  id        String   @id @default(uuid())
  content   String
  postId    String   @map("post_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  commentLikes CommentLike[]
  
  @@map("comments")
}
```

**Comment Operations:**
- `GET /api/v1/posts/:postId/comments` - List comments for post
- `POST /api/v1/posts/:postId/comments` - Create comment (authenticated)
- `DELETE /api/v1/comments/:id` - Delete comment (owner only, idempotent)

**Current Implementation:**
```typescript
// POST /api/v1/posts/:postId/comments
router.post('/:postId/comments', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.userId!;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  
  const comment = await prisma.comment.create({
    data: { postId, userId, content: content.trim() },
    include: {
      user: {
        select: { id: true, name: true, profilePicture: true }
      }
    }
  });
  
  res.status(201).json({ data: comment });
});
```

**Current Features:**
- ✅ Create comments on posts
- ✅ Delete own comments
- ✅ Display comment author and content
- ✅ Comment count displayed on posts
- ⚠️ No nested comments (replies) yet
- ⚠️ No comment likes yet (model exists but endpoint missing)

**Future Enhancements:**
- Nested comments (reply to comments)
- Comment likes (model exists, endpoint needed)
- Comment editing
- Comment mentions (@username)

---

### User Interaction - تفاعل المستخدمين

**Current Interaction Types:**

**1. Posts:**
- View posts in feed
- Create own posts
- Edit own posts
- Delete own posts

**2. Likes:**
- Like/unlike posts
- Like count visible

**3. Comments:**
- Comment on posts
- View comments on posts
- Delete own comments

**4. Follow System:**
- Follow/unfollow users (makers)
- View followers/following
- Follow status displayed on profiles

**Future Interactions:**
- Share posts (copy link, share to social media)
- Save posts (bookmark)
- Report posts (moderation)
- Tag users in posts (@mentions)
- Reply to comments
- Like comments

---

### Community Moderation - إدارة المجتمع

**Current Status:** ❌ **NOT IMPLEMENTED**

**Required Moderation Features:**

**1. Content Reporting:**
- Report posts/comments as inappropriate
- Report reasons: spam, harassment, inappropriate content
- Store reports in database

**2. Moderation Dashboard:**
- View reported content
- Review and take action (delete, warn, ban)
- Ban users (temporary/permanent)

**3. Automated Moderation:**
- Keyword filtering (profanity, spam)
- Image content detection (inappropriate images)
- Rate limiting (prevent spam posting)

**4. Community Guidelines:**
- Display guidelines on registration
- Link to guidelines in footer
- Enforce guidelines in moderation

**Implementation Plan:**
```prisma
model Report {
  id          String   @id @default(uuid())
  reportedBy  String   @map("reported_by")  // User ID
  reportedContentId String @map("reported_content_id")  // Post/Comment ID
  contentType String   @map("content_type")  // 'post' | 'comment'
  reason      String   // 'spam' | 'harassment' | 'inappropriate'
  status      String   @default('pending')  // 'pending' | 'reviewed' | 'resolved'
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@map("reports")
}

model Ban {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  reason      String
  expiresAt   DateTime? @map("expires_at")  // Null = permanent
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@map("bans")
}
```

---

### Detecting Spam - اكتشاف البريد العشوائي

**Current Status:** ❌ **NOT IMPLEMENTED**

**Spam Detection Methods:**

**1. Rate Limiting:**
- Limit posts per user (e.g., 10 posts per hour)
- Limit comments per user (e.g., 50 comments per hour)
- Limit likes per user (e.g., 100 likes per hour)

**2. Content Analysis:**
- Keyword filtering (spam keywords)
- Duplicate content detection (same post multiple times)
- Link analysis (suspicious URLs)

**3. User Behavior:**
- New accounts with high activity
- Accounts following many users but no followers
- Accounts posting only links

**4. CAPTCHA:**
- CAPTCHA for new accounts
- CAPTCHA after suspicious activity

**Implementation:**
```typescript
// server/src/middleware/spamDetection.ts
export async function detectSpam(userId: string, content: string): Promise<boolean> {
  // Check rate limits
  const postCount = await getPostCountLastHour(userId);
  if (postCount > 10) return true;
  
  // Check for spam keywords
  const spamKeywords = ['buy now', 'click here', 'make money'];
  if (spamKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
    return true;
  }
  
  // Check for duplicate content
  const recentPosts = await getRecentPosts(userId);
  if (recentPosts.some(post => post.content === content)) {
    return true;
  }
  
  return false;
}
```

---

### Encouraging Engagement - تشجيع التفاعل

**Current Engagement Features:**
- Like posts
- Comment on posts
- Follow users
- View feed

**Engagement Metrics to Track:**
- Posts created per user
- Likes per post
- Comments per post
- Followers per user
- Active users per day/week/month

**Future Engagement Features:**

**1. Notifications:**
- Notify when post is liked
- Notify when post is commented
- Notify when user is followed
- Notify when mentioned in post/comment

**2. Engagement Incentives:**
- Badges for active users
- Featured posts (high engagement)
- Trending posts section
- User of the week/month

**3. Social Features:**
- Share posts to social media
- Embed posts on external sites
- Post scheduling
- Post analytics for makers

---

### Reviewing /feed Page UX - مراجعة تجربة مستخدم صفحة Feed

**Current Feed UX:**

**Strengths:**
- ✅ Clean, readable layout
- ✅ Author information displayed
- ✅ Like and comment buttons visible
- ✅ Images displayed (if present)
- ✅ Load more button for pagination

**Improvements Needed:**
- ⚠️ No infinite scroll (uses "Load More" button)
- ⚠️ No post filtering (all posts shown)
- ⚠️ No post sorting options (newest only)
- ⚠️ No post search
- ⚠️ No post categories/tags

**Recommended UX Improvements:**

**1. Infinite Scroll:**
```typescript
// Replace "Load More" with infinite scroll
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && hasMore) {
    loadMorePosts();
  }
});
```

**2. Filtering:**
- Filter by user (followed users only)
- Filter by post type (text, image, video)
- Filter by date (today, this week, this month)

**3. Sorting:**
- Newest first (current)
- Most liked
- Most commented
- Trending (algorithm-based)

**4. Search:**
- Search posts by content
- Search posts by author
- Search posts by hashtags (if implemented)

---

### Reviewing /api/v1/posts & /api/v1/comments - مراجعة واجهات برمجة المنشورات والتعليقات

#### Posts API Review

**Current Endpoints:**

**GET /api/v1/posts**
- ✅ Returns all posts
- ✅ Includes author information
- ✅ Ordered by newest first
- ⚠️ No pagination (returns all posts)
- ⚠️ No filtering options
- ⚠️ No search

**Recommended Enhancements:**
```typescript
// GET /api/v1/posts?page=1&limit=20&filter=following&sort=trending
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const filter = req.query.filter as string; // 'all' | 'following'
  const sort = req.query.sort as string; // 'newest' | 'trending' | 'most_liked'
  
  // Build query based on filter and sort
  // Return paginated results
});
```

**POST /api/v1/posts**
- ✅ Requires authentication
- ✅ Validates content
- ✅ Creates post
- ⚠️ No spam detection
- ⚠️ No content moderation

**PUT /api/v1/posts/:id**
- ✅ Owner only
- ✅ Updates post
- ⚠️ No edit history tracking

**DELETE /api/v1/posts/:id**
- ✅ Owner only
- ✅ Idempotent (returns 204 even if not found)
- ⚠️ No soft delete (hard delete)

---

#### Comments API Review

**Current Endpoints:**

**GET /api/v1/posts/:postId/comments**
- ✅ Returns all comments for post
- ✅ Includes author information
- ⚠️ No pagination
- ⚠️ No sorting (chronological only)
- ⚠️ No nested comments (replies)

**Recommended Enhancements:**
```typescript
// GET /api/v1/posts/:postId/comments?page=1&limit=50&sort=newest|most_liked
// Support nested comments (replies)
interface Comment {
  id: string;
  content: string;
  replies?: Comment[];  // Nested comments
  replyToId?: string;   // Parent comment ID
}
```

**POST /api/v1/posts/:postId/comments**
- ✅ Requires authentication
- ✅ Validates content
- ✅ Creates comment
- ⚠️ No spam detection
- ⚠️ No mentions support (@username)

**DELETE /api/v1/comments/:id**
- ✅ Owner only
- ✅ Idempotent
- ⚠️ No soft delete

---

### Analyzing Active Users - تحليل المستخدمين النشطين

**Current Metrics:**
- Total users (from database count)
- Users with posts (can query)
- Users with orders (can query)

**Required Analytics:**

**1. Daily Active Users (DAU):**
```typescript
// Users who logged in today
const dau = await prisma.user.count({
  where: {
    lastLoginAt: {
      gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  }
});
```

**2. Weekly Active Users (WAU):**
```typescript
// Users active in last 7 days
const wau = await prisma.user.count({
  where: {
    lastLoginAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  }
});
```

**3. Monthly Active Users (MAU):**
```typescript
// Users active in last 30 days
const mau = await prisma.user.count({
  where: {
    lastLoginAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }
});
```

**4. Engagement Metrics:**
- Posts per user (average)
- Likes per user (average)
- Comments per user (average)
- Followers per user (average)

**5. User Retention:**
- Day 1 retention (users who return next day)
- Week 1 retention
- Month 1 retention

**Implementation:**
```typescript
// server/src/api/analytics/users.ts
router.get('/analytics/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  // Check if user is FOUNDER or ADMIN
  if (req.user?.role !== 'FOUNDER') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const dau = await getDailyActiveUsers();
  const wau = await getWeeklyActiveUsers();
  const mau = await getMonthlyActiveUsers();
  
  res.json({
    dau,
    wau,
    mau,
    engagement: {
      avgPostsPerUser: await getAvgPostsPerUser(),
      avgLikesPerUser: await getAvgLikesPerUser(),
      avgCommentsPerUser: await getAvgCommentsPerUser(),
    }
  });
});
```

---

### Suggesting Content Ideas - اقتراح أفكار المحتوى

**Current Status:** ❌ **NOT IMPLEMENTED** (Manual process)

**Future AI-Powered Content Suggestions:**

**1. Post Ideas for Makers:**
- "Show your workspace" posts
- "Behind the scenes" posts
- "Product in use" posts
- "Meet the maker" posts

**2. Content Templates:**
- Pre-written post templates
- Image suggestions
- Hashtag suggestions

**3. Optimal Posting Times:**
- Analyze when followers are most active
- Suggest best times to post
- Schedule posts for optimal engagement

**4. Trending Topics:**
- Analyze trending hashtags
- Suggest relevant topics
- Connect makers with trending content

**Implementation:**
```typescript
// server/src/services/contentSuggestions.ts
export async function getContentSuggestions(userId: string): Promise<string[]> {
  // Analyze user's posts
  // Analyze follower activity
  // Suggest content ideas
  return [
    'Share a behind-the-scenes photo of your workshop',
    'Post a tutorial video showing how you make your products',
    'Ask your followers what product they want to see next',
  ];
}
```

---

### Understanding User Behavior - فهم سلوك المستخدم

**Behavioral Patterns to Track:**

**1. Engagement Patterns:**
- When users are most active (time of day, day of week)
- Which posts get most engagement
- Which users generate most engagement

**2. Content Preferences:**
- Preferred post types (text, image, video)
- Preferred content topics
- Preferred makers to follow

**3. Navigation Patterns:**
- Most visited pages
- Path users take through the app
- Drop-off points (where users leave)

**4. Interaction Patterns:**
- Like-to-comment ratio
- Follow-to-engagement ratio
- Share frequency

**Tools:**
- Google Analytics (if integrated)
- Custom analytics dashboard
- Database queries for user behavior

---

### Coordinating with Founder Panda to Grow the Community - التنسيق مع الباندا المؤسس لنمو المجتمع

**Collaboration Areas:**

**1. Community Growth Strategy:**
- Work with Founder Panda to define growth targets
- Suggest features to increase engagement
- Analyze what's working and what's not

**2. Content Strategy:**
- Identify content gaps
- Suggest content campaigns
- Analyze content performance

**3. User Retention:**
- Identify users at risk of churning
- Suggest re-engagement campaigns
- Analyze retention patterns

**4. Feature Prioritization:**
- Suggest features based on user behavior
- Prioritize features that increase engagement
- Test new features with small user groups

**Communication Flow:**
```
Social Panda → Founder Panda:
- Weekly engagement report
- Content performance analysis
- Feature suggestions
- Community health metrics
```

---

## 2. What Social Panda Oversees - ما يشرف عليه باندا المحتوى

### Frontend Pages & Components

**Feed Page:**
- `app/feed/page.tsx` - Main feed page

**Post Components:**
- `components/Comments.tsx` - Comments display and creation
- `components/LikeButton.tsx` - Like/unlike functionality
- Post display components (in feed page)

**Profile Pages:**
- User profiles (posts display)
- Maker profiles (posts display)

---

### Backend API Endpoints

**Posts API:**
- `GET /api/v1/posts` - List posts
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts` - Create post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `POST /api/v1/posts/:id/like` - Like/unlike post
- `DELETE /api/v1/posts/:id/like` - Unlike post

**Comments API:**
- `GET /api/v1/posts/:postId/comments` - List comments
- `POST /api/v1/posts/:postId/comments` - Create comment
- `DELETE /api/v1/comments/:id` - Delete comment

**Follow API:**
- `POST /api/v1/users/:id/follow` - Follow user
- `DELETE /api/v1/users/:id/follow` - Unfollow user
- `GET /api/v1/users/:id/followers` - Get followers
- `GET /api/v1/users/:id/following` - Get following

---

### Database Models

**Posts:**
- `Post` model (content, images, userId)
- `PostLike` model (postId, userId)

**Comments:**
- `Comment` model (content, postId, userId)
- `CommentLike` model (commentId, userId)

**Follow:**
- `Follow` model (followerId, followingId)

**Future Models:**
- `Report` model (content moderation)
- `Ban` model (user bans)
- `Hashtag` model (for hashtags)

---

### Business Logic

**Feed Algorithm:**
- Currently chronological (newest first)
- Future: Algorithm-based (engagement, relevance)

**Engagement Tracking:**
- Like counts
- Comment counts
- Share counts (future)

**Moderation:**
- Content reporting (future)
- Spam detection (future)
- Automated moderation (future)

---

## 3. Future Enhancements - التحسينات المستقبلية

### Phase 1: Enhanced Engagement (Short-term)

1. **Notifications:**
   - Notify when post is liked
   - Notify when post is commented
   - Notify when user is followed

2. **Post Improvements:**
   - Rich text support
   - Video posts
   - Post editing

3. **Comment Improvements:**
   - Nested comments (replies)
   - Comment likes
   - Comment mentions

### Phase 2: Algorithm & Discovery (Medium-term)

1. **Feed Algorithm:**
   - Algorithm-based ranking
   - Personalized feed
   - Trending posts

2. **Discovery:**
   - Search posts
   - Hashtags
   - Explore page

3. **Analytics:**
   - Post analytics for makers
   - Engagement metrics
   - User behavior tracking

### Phase 3: Community & Moderation (Long-term)

1. **Moderation:**
   - Content reporting
   - Moderation dashboard
   - Automated moderation

2. **Community Features:**
   - Groups/Communities
   - Events & Workshops
   - Challenges & Contests

3. **Social Features:**
   - Share to social media
   - Embed posts
   - Post scheduling

---

## 📚 Additional Resources

- **Technical Brain**: `docs/TECHNICAL_BRAIN.md`
- **Backend API Map**: `BACKEND_API_MAP.md`
- **Founder Brain**: `docs/FOUNDER_BRAIN.md`

---

**Last Updated:** 2025-01-17  
**Maintained By:** Social Panda AI Assistant  
**Status:** ✅ Active Social Memory Archive

