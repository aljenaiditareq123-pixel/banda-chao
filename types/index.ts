// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
}

// Video Types
export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  duration: number; // in seconds
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  type: 'short' | 'long'; // short video or long video
}

// Product Types
export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number | null;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  externalLink?: string;
  maker?: {
    id: string;
    name?: string;
    profilePicture?: string;
  };
}

export interface MakerUserSummary {
  id: string;
  name: string | null;
  email: string;
  profilePicture?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface Maker {
  id: string;
  userId: string;
  slug: string;
  name: string;
  bio?: string | null;
  story?: string | null;
  profilePictureUrl?: string | null;
  coverPictureUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: MakerUserSummary;
  // Legacy fields for backward compatibility
  coverImage?: string;
  profilePicture?: string;
  location?: string;
  tagline?: string;
  socialLinks?: Record<string, string>;
}

// Comment Types
export interface Comment {
  id: string;
  userId: string;
  videoId?: string;
  productId?: string;
  content: string;
  likes: number;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
  userLiked?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string; // 'post_like' | 'follow' | 'message' | 'order_status'
  title: string;
  body?: string | null;
  data?: any; // JSON data (postId, orderId, senderId, etc.)
  isRead: boolean;
  createdAt: string;
}
