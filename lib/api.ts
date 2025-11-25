<<<<<<< HEAD
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiUrl } from './api-utils';

// Use centralized API URL utility to prevent double prefix
const API_URL = getApiUrl();

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second
const RETRY_STATUS_CODES = [429, 503, 504]; // Status codes to retry on

/**
 * Retry logic for axios requests
 */
async function retryRequest(
  requestFn: () => Promise<any>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<any> {
  try {
    return await requestFn();
  } catch (error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;

    // Only retry on specific status codes
    if (retries > 0 && status && RETRY_STATUS_CODES.includes(status)) {
      // Calculate exponential backoff
      const currentDelay = delay * Math.pow(2, MAX_RETRIES - retries);

      // Log retry attempt (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[axios-retry] Retrying request after ${status} error. Attempts remaining: ${retries}. Delay: ${currentDelay}ms`
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Retry the request
      return retryRequest(requestFn, retries - 1, delay);
    }

    // If not retryable or out of retries, throw the error
    throw error;
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
=======
import axios from 'axios';

// Safe function to get API base URL (works in both server and client)
const getApiBaseUrl = (): string => {
  // Helper to normalize URL (remove trailing slash, ensure /api/v1 is appended correctly)
  const normalizeUrl = (url: string): string => {
    // Remove trailing slash
    url = url.replace(/\/$/, '');
    // If URL already ends with /api/v1, return as is
    if (url.endsWith('/api/v1')) {
      return url;
    }
    // If URL ends with /api, append /v1
    if (url.endsWith('/api')) {
      return `${url}/v1`;
    }
    // Otherwise, append /api/v1
    return `${url}/api/v1`;
  };

  // Server-side: use environment variable or fallback
  if (typeof window === 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
    }
    // In development, server can connect to localhost:3001
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001/api/v1';
    }
    return 'https://banda-chao.onrender.com/api/v1';
  }

  // Client-side: use environment variable, localhost check, or fallback
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  }

  // Safe check for window.location (only in browser, and only if window is defined)
  try {
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      return 'http://localhost:3001/api/v1';
    }
  } catch (e) {
    // window.location may not be available - use development fallback
  }

  // Default fallback for client-side development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api/v1';
  }

  return 'https://banda-chao.onrender.com/api/v1';
};

// Create API base URL (safe for both server and client)
const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
// This is safe to create in both server and client contexts
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available (only in client-side)
// This interceptor is safe because it checks for window before accessing localStorage
api.interceptors.request.use(
  (config) => {
    // Only access localStorage in client-side
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // localStorage may not be available (private browsing, etc.)
        // Silently fail - request will proceed without token
      }
    }
    // If FormData is being sent, let axios set Content-Type automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
>>>>>>> dda36a71131520c8b820410d3f4341ee1b66fdf0
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Handle 401 - Unauthorized
    if (status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Retry logic for rate limiting and server errors
    if (
      status &&
      RETRY_STATUS_CODES.includes(status) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Calculate exponential backoff delay
      const retryCount = (originalRequest._retryCount || 0) + 1;
      originalRequest._retryCount = retryCount;
      const delay = RETRY_DELAY * Math.pow(2, retryCount - 1);

      // Log retry attempt (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[axios-retry] Retrying request after ${status} error. Attempt: ${retryCount}/${MAX_RETRIES}. Delay: ${delay}ms`
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      try {
        return await apiClient(originalRequest);
      } catch (retryError) {
        // If retry fails, check if we should retry again
        const retryStatus = (retryError as AxiosError).response?.status;
        if (retryCount < MAX_RETRIES && retryStatus && RETRY_STATUS_CODES.includes(retryStatus)) {
          // Continue retrying
          return apiClient.interceptors.response.handlers[0].rejected!(retryError);
        }
        return Promise.reject(retryError);
      }
    }

=======
// Handle response errors (only log and redirect in client-side)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors in client-side
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const url = error.config?.url;
      const baseURL = error.config?.baseURL;
      
      // Log error details (excluding sensitive data)
      console.error('❌ API Error:', {
        url,
        status,
        message: error.message,
        // Only log error response data if it's not sensitive
        data: error.response?.data && typeof error.response.data === 'object' 
          ? Object.fromEntries(
              Object.entries(error.response.data).filter(
                ([key]) => !['password', 'token', 'secret', 'key', 'authorization'].includes(key.toLowerCase())
              )
            )
          : error.response?.data,
      });

      // Handle 401 errors - clear token and redirect to login (client-side only)
      if (status === 401) {
        try {
          localStorage.removeItem('auth_token');
          // Only redirect if not already on login/register page
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        } catch (e) {
          // localStorage may not be available - ignore
        }
      }

      // Handle 404 errors - provide better error message
      if (status === 404) {
        // Log 404 for debugging
        console.error('404 Not Found:', {
          endpoint: url,
          baseURL,
          suggestion: 'Check if the endpoint path is correct and the backend server is running',
        });
      }
    }
>>>>>>> dda36a71131520c8b820410d3f4341ee1b66fdf0
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
// ============================================
// Auth API
// ============================================

export const authAPI = {
  register: async (data: { email: string; password: string; name: string; role?: string }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// ============================================
// Makers API
// ============================================

export const makersAPI = {
  getAll: async (params?: { page?: number; limit?: number; country?: string; language?: string; search?: string }) => {
    const response = await apiClient.get('/makers', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/makers/${id}`);
    return response.data;
  },
  getMe: async (): Promise<{ success: boolean; maker?: any }> => {
    try {
      const response = await apiClient.get('/makers/me');
      return {
        success: true,
        maker: response.data.maker || response.data,
      };
    } catch (error) {
      return { success: false };
    }
  },
  getMeProducts: async (): Promise<{ success: boolean; products?: any[] }> => {
    try {
      const response = await apiClient.get('/makers/me/products');
      return {
        success: true,
        products: response.data.products || response.data || [],
      };
    } catch (error) {
      return { success: false, products: [] };
    }
  },
  getMeVideos: async (): Promise<{ success: boolean; videos?: any[] }> => {
    try {
      const response = await apiClient.get('/makers/me/videos');
      return {
        success: true,
        videos: response.data.videos || response.data || [],
      };
    } catch (error) {
      return { success: false, videos: [] };
    }
  },
  createOrUpdate: async (data: {
    displayName: string;
    bio?: string;
    country?: string;
    city?: string;
    languages?: string[];
    socialLinks?: any;
  }) => {
    const response = await apiClient.post('/makers', data);
    return response.data;
  },
};

// ============================================
// Products API
// ============================================

export const productsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    makerId?: string;
    search?: string;
  }) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  getByMaker: async (makerId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/products/makers/${makerId}`, { params });
    return response.data;
  },
};

// ============================================
// Videos API
// ============================================

export const videosAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: 'SHORT' | 'LONG';
    language?: string;
    makerId?: string;
    search?: string;
  }) => {
    const response = await apiClient.get('/videos', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },
  getByMaker: async (makerId: string, params?: { page?: number; limit?: number; type?: 'SHORT' | 'LONG' }) => {
    const response = await apiClient.get(`/videos/makers/${makerId}`, { params });
    return response.data;
  },
};

// ============================================
// Posts API
// ============================================

export const postsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: 'TEXT' | 'IMAGE' | 'VIDEO';
    makerId?: string;
  }) => {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },
  getComments: async (postId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/posts/${postId}/comments`, { params });
    return response.data;
  },
};

// ============================================
// Comments API
// ============================================

export const commentsAPI = {
  getByTarget: async (targetType: 'POST' | 'VIDEO' | 'PRODUCT', targetId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/comments', {
      params: { targetType, targetId, ...params },
    });
    return response.data;
  },
  create: async (data: { targetType: 'POST' | 'VIDEO' | 'PRODUCT'; targetId: string; content: string }) => {
    const response = await apiClient.post('/comments', data);
    return response.data;
  },
};

// ============================================
// Notifications API
// ============================================

export const notificationsAPI = {
  getAll: async (params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

    const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
    return response.data;
  },
  markAsRead: async (notificationId: string) => {
    const response = await apiClient.post('/notifications/read', { notificationId });
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/read', { markAllAsRead: true });
    return response.data;
  },
};

// ============================================
// Payments API
// ============================================

export const paymentsAPI = {
  createCheckout: async (data: { productId: string; quantity: number; currency?: string }) => {
    const response = await apiClient.post('/payments/checkout', data);
    return response.data;
  },
};

// ============================================
// AI API
// ============================================

export const aiAPI = {
  assistant: async (data: { 
    assistant?: string; 
    message: string; 
    conversationId?: string; 
    clearContext?: boolean;
  }) => {
    const response = await apiClient.post('/ai/assistant', data);
    return response.data;
  },
  pricingSuggestion: async (data: {
    productName: string;
    description?: string;
    category?: string;
    cost?: number;
    currency?: string;
  }) => {
    const response = await apiClient.post('/ai/pricing-suggestion', data);
    return response.data;
  },
  contentHelper: async (data: {
    productName: string;
    category?: string;
    keyFeatures?: string[];
  }) => {
    const response = await apiClient.post('/ai/content-helper', data);
    return response.data;
  },
};

// ============================================
// Orders API
// ============================================

export const ordersAPI = {
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my');
    return response.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },
};

// ============================================
// Founder API
// ============================================

export const founderAPI = {
  getKPIs: async () => {
    const response = await apiClient.get('/founder/kpis');
    return response.data;
  },
  getSessions: async (limit?: number) => {
    const response = await apiClient.get('/founder/sessions', { params: { limit } });
    return response.data;
  },
};

// ============================================
// Users API
// ============================================

export const usersAPI = {
  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, data: { name?: string; bio?: string }) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/users/avatar', formData, {
=======
// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Users API
export const usersAPI = {
  getMe: () => {
    return api.get('/users/me').catch((error) => {
      throw error;
    });
  },
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: { name?: string; profilePicture?: string; bio?: string }) => 
    api.put(`/users/${id}`, data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
>>>>>>> dda36a71131520c8b820410d3f4341ee1b66fdf0
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
<<<<<<< HEAD
    return response.data;
  },
};

export default apiClient;
=======
  },
};

// Messages API
export const messagesAPI = {
  sendMessage: (data: { receiverId: string; content: string }) =>
    api.post('/messages', data),
  getChatHistory: (userId1: string, userId2: string) =>
    api.get(`/messages/${userId1}/${userId2}`),
  getConversations: () => api.get('/messages/conversations'),
};

// Posts API
export const postsAPI = {
  getPosts: () => api.get('/posts'),
  getPost: (id: string) => api.get(`/posts/${id}`),
  createPost: (data: { content: string; images?: string[] }) =>
    api.post('/posts', data),
  updatePost: (id: string, data: { content?: string; images?: string[] }) =>
    api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
};

// Products API
export const productsAPI = {
  getProducts: (category?: string, params?: { minPrice?: number; maxPrice?: number; makerIds?: string; limit?: number }) =>
    api.get('/products', { 
      params: { 
        ...(category && { category }),
        ...(params?.minPrice !== undefined && { minPrice: params.minPrice }),
        ...(params?.maxPrice !== undefined && { maxPrice: params.maxPrice }),
        ...(params?.makerIds && { makerIds: params.makerIds }),
        ...(params?.limit !== undefined && { limit: params.limit }),
      } 
    }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: {
    name: string;
    description: string;
    imageUrl?: string;
    externalLink: string;
    price?: number;
    category?: string;
  }) => api.post('/products', data),
  updateProduct: (id: string, data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    externalLink?: string;
    price?: number;
    category?: string;
  }) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  likeProduct: (id: string) => api.post(`/products/${id}/like`),
  unlikeProduct: (id: string) => api.delete(`/products/${id}/like`),
  checkProductLike: (id: string) => api.get(`/products/${id}/like`),
};

// Videos API
export const videosAPI = {
  getVideos: (type?: string, page?: number, limit?: number) =>
    api.get('/videos', { params: { type, page, limit } }),
  getVideo: (id: string) => api.get(`/videos/${id}`),
  createVideo: (data: {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    type: 'short' | 'long';
    productIds?: string[];
  }) => api.post('/videos', data),
  updateVideo: (id: string, data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    type?: 'short' | 'long';
  }) => api.put(`/videos/${id}`, data),
  deleteVideo: (id: string) => api.delete(`/videos/${id}`),
  likeVideo: (id: string) => api.post(`/videos/${id}/like`),
  unlikeVideo: (id: string) => api.delete(`/videos/${id}/like`),
  checkVideoLike: (id: string) => api.get(`/videos/${id}/like`),
};

// Comments API
export const commentsAPI = {
  getComments: (videoId?: string, productId?: string) =>
    api.get('/comments', {
      params: {
        ...(videoId && { videoId }),
        ...(productId && { productId }),
      },
    }),
  createComment: (data: {
    videoId?: string;
    productId?: string;
    content: string;
  }) => api.post('/comments', data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
  likeComment: (id: string) => api.post(`/comments/${id}/like`),
  unlikeComment: (id: string) => api.delete(`/comments/${id}/like`),
};

// Search API
export const searchAPI = {
  search: (query: string, type?: 'videos' | 'products' | 'users') =>
    api.get('/search', { params: { q: query, type } }),
};

// Orders API
export const ordersAPI = {
  createOrder: (data: {
    items: Array<{ productId: string; quantity: number }>;
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    shippingPhone?: string;
  }) => api.post('/orders', data),
  
  getOrders: () => api.get('/orders'),
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
};

// Payments API
export const paymentsAPI = {
  createCheckoutSession: (items: Array<{ productId: string; quantity: number }>) =>
    api.post('/payments/create-checkout-session', { items }),
};

// Founder Analytics API (FOUNDER only)
export const founderAPI = {
  getAnalytics: () => api.get('/founder/analytics'),
  getKPIs: () => api.get('/founder/kpis'),
};

// Moderation API (FOUNDER only)
export const moderationAPI = {
  getReports: (params?: { resolved?: boolean; targetType?: string; limit?: number; offset?: number }) =>
    api.get('/moderation/reports', { params }),
  resolveReport: (reportId: string, resolved?: boolean) =>
    api.post('/moderation/resolve', { reportId, resolved }),
  hideContent: (targetId: string, targetType: string, hidden?: boolean) =>
    api.post('/moderation/hide', { targetId, targetType, hidden }),
};

// Posts Likes API
export const postsLikesAPI = {
  getLikeStatus: (postId: string) => api.get(`/posts/${postId}/like`),
  like: (postId: string) => api.post(`/posts/${postId}/like`),
  unlike: (postId: string) => api.delete(`/posts/${postId}/like`),
};

// Follow API
export const followAPI = {
  follow: (userId: string) => api.post(`/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId: string) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId: string) => api.get(`/users/${userId}/following`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: { page?: number; pageSize?: number }) =>
    api.get('/notifications', {
      params: {
        ...(params?.page && { page: params.page }),
        ...(params?.pageSize && { pageSize: params.pageSize }),
      },
    }),
  
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  markAsRead: (options: { ids?: string[]; all?: boolean }) =>
    api.post('/notifications/mark-read', {
      ...(options.all === true ? { all: true } : {}),
      ...(options.ids && options.ids.length > 0 ? { ids: options.ids } : {}),
    }),
};

// Makers API
export const makersAPI = {
  getMakers: (params?: { search?: string }) =>
    api.get('/makers', {
      params: {
        ...(params?.search ? { search: params.search } : {}),
      },
    }),

  getMakerById: (id: string) => api.get(`/makers/${id}`),

  getMakerBySlug: (slug: string) => api.get(`/makers/slug/${slug}`),

  getMyMaker: () => api.get('/makers/me'),

  createMaker: (payload: {
    name: string;
    slug?: string;
    bio?: string;
    story?: string;
    profilePictureUrl?: string;
    coverPictureUrl?: string;
  }) => api.post('/makers', payload),

  updateMyMaker: (payload: {
    name?: string;
    slug?: string;
    bio?: string;
    story?: string;
    profilePictureUrl?: string;
    coverPictureUrl?: string;
  }) => api.put('/makers/me', payload),
};

export default api;

export interface CheckoutSessionRequestItem {
  productId: string;
  quantity: number;
}

// Legacy checkout API (for payment gateway integration if needed)
export const checkoutAPI = {
  createCheckoutSession: async (items: CheckoutSessionRequestItem[]) => {
    // For now, this can redirect to order creation
    // In the future, integrate with payment gateway (Stripe, PayPal, etc.)
    const response = await api.post('/orders/create-checkout-session', { items });
    return response.data as { url: string };
  },
};

>>>>>>> dda36a71131520c8b820410d3f4341ee1b66fdf0
