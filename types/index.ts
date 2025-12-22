export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  externalLink?: string;
  userId: string;
  price: number;
  currency?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  // C2M (Copy to Manufacture) Fields
  isPreOrder?: boolean; // True if this is a pre-order product
  targetQuantity?: number; // Target number of orders to start manufacturing
  currentOrders?: number; // Current number of pre-orders
  campaignEndDate?: string | Date; // Campaign end date
  manufactureStatus?: string; // PENDING, COLLECTING, IN_MANUFACTURE, SHIPPED
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  type: 'short' | 'long';
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  role: 'FOUNDER' | 'MAKER' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  videoId?: string;
  productId?: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}



