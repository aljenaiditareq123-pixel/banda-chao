# Banda Chao - Project Overview

## Vision

Banda Chao is a social-commerce platform that connects craftspeople (makers) with visitors and buyers, combining social media features with e-commerce functionality.

## Target Audience

- **Makers**: Craftspeople and artisans who want to showcase their products
- **Buyers**: People who value handmade, authentic products
- **Community**: Users interested in maker stories and content

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context (Auth, Cart, Language, Notifications)
- **Deployment**: Render (Web Service)

### Backend
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (Bearer token + Cookie)
- **Deployment**: Render (Web Service)

### Infrastructure
- **Hosting**: Render
- **Database**: PostgreSQL (Render)
- **CI/CD**: Git push triggers automatic deployment

## Key Features

### 1. User Management
- Email/password authentication
- Google OAuth login
- Role-based access control (USER, FOUNDER)
- User profiles with avatars

### 2. Product System
- Product listings with categories (电子产品, 时尚, 家居, 运动)
- Product detail pages with image galleries
- Shopping cart
- Checkout flow
- Order management

### 3. Maker System
- Maker profiles with bio and story
- Maker products and videos
- Maker discovery and search
- Follow system

### 4. Video System
- Short videos (up to 60 seconds)
- Long videos (up to 10 minutes)
- Video categorization
- Video-player integration

### 5. Social Features
- Social feed (posts, likes, comments)
- Follow/unfollow makers
- Notifications system (in progress)

### 6. Founder Dashboard
- Overview statistics (users, makers, products, videos)
- 7 specialized AI assistants:
  - Founder Panda (strategic decisions)
  - Technical Panda (infrastructure)
  - Security Panda (security & privacy)
  - Commerce Panda (sales & growth)
  - Content Panda (narrative & copywriting)
  - Logistics Panda (operations & fulfillment)
  - Philosopher Architect Panda (architectural oversight & coordination)

### 7. Internationalization
- Support for 3 languages: Chinese (zh), Arabic (ar), English (en)
- RTL support for Arabic
- Locale-aware routing (`/[locale]/...`)
- Language switcher with route preservation

## Architecture

### Folder Structure
```
banda-chao/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Locale-aware routes
│   │   ├── products/        # Product pages
│   │   ├── makers/          # Maker pages
│   │   ├── videos/          # Video pages
│   │   ├── checkout/        # Checkout page
│   │   └── orders/          # Orders page
│   ├── founder/             # Founder dashboard (protected)
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # React components
│   ├── products/           # Product components
│   ├── makers/             # Maker components
│   ├── founder/            # Founder dashboard components
│   └── ui/                 # Reusable UI components
├── contexts/               # React contexts
│   ├── AuthContext.tsx     # Authentication state
│   ├── CartContext.tsx     # Shopping cart state
│   ├── LanguageContext.tsx # i18n state
│   └── NotificationsContext.tsx # Notifications state
├── lib/                    # Utility libraries
│   ├── api-utils.ts        # API URL helpers
│   ├── api.ts              # API client
│   ├── product-utils.ts    # Product helpers
│   └── maker-utils.ts      # Maker helpers
├── server/                 # Backend Express app
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Backend utilities
│   └── prisma/             # Database schema & migrations
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

### API Structure
All backend routes are under `/api/v1`:
- `/api/v1/auth/*` - Authentication
- `/api/v1/users/*` - User management
- `/api/v1/products/*` - Products
- `/api/v1/makers/*` - Makers
- `/api/v1/videos/*` - Videos
- `/api/v1/orders/*` - Orders
- `/api/v1/posts/*` - Social posts
- `/api/v1/comments/*` - Comments

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://banda-chao-frontend.onrender.com
```

### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://banda-chao-frontend.onrender.com
TEST_MODE=false
```

## Deployment

### Render Configuration
The project uses a single `render.yaml` blueprint with two services:

1. **banda-chao-backend**
   - Type: Web Service
   - Root Directory: `server`
   - Build Command: `npm install --include=dev && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `node dist/index.js`

2. **banda-chao-frontend**
   - Type: Web Service
   - Root Directory: `.` (root)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### URLs
- Frontend: `https://banda-chao-frontend.onrender.com`
- Backend: `https://banda-chao-backend.onrender.com`
- API Base: `https://banda-chao-backend.onrender.com/api/v1`

## Current Status

### ✅ Completed Features
- User authentication (email/password, Google OAuth)
- Product listing and details
- Shopping cart and checkout
- Order creation and management
- Maker profiles and discovery
- Video listing and playback
- Social feed (posts, likes, comments)
- Follow system
- Founder dashboard with AI assistants
- Multi-language support (zh, ar, en)
- Responsive design
- Error handling and validation

### 🚧 In Progress
- Notifications system (backend ready, frontend integration pending)
- Payment integration (mock payment currently)
- Advanced analytics

### 📋 Future Enhancements
- Real payment gateway integration
- Advanced maker analytics
- Email notifications
- Push notifications
- Mobile app (PWA enhancement)

## Development Workflow

1. **Local Development**
   ```bash
   # Install dependencies
   npm install
   cd server && npm install
   
   # Set up database
   cd server
   npx prisma migrate dev
   npx prisma db seed
   
   # Run development servers
   npm run dev        # Frontend (port 3000)
   cd server && npm run dev  # Backend (port 5000)
   ```

2. **Code Quality**
   ```bash
   npm run lint      # ESLint
   npm run build     # TypeScript compilation
   ```

3. **Deployment**
   - Push to `main` branch triggers automatic deployment on Render
   - Backend migrations run automatically during build
   - Frontend builds and deploys automatically

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions.

## Documentation

- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - Frontend architecture details
- [BACKEND_API_MAP.md](./BACKEND_API_MAP.md) - Backend API documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

## Support

For issues, questions, or contributions, please refer to the project documentation or create an issue in the repository.

