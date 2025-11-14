import axios from 'axios';

// Use environment variable with fallback to production URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'https://banda-chao-backend.onrender.com/api/v1';

// Log API URL to help debug (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🔗 NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET');
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If FormData is being sent, let axios set Content-Type automatically with boundary
    // Don't manually set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    if (typeof window !== 'undefined') {
      console.error('❌ API Error:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Users API
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: { name?: string; profilePicture?: string; bio?: string }) =>
    api.put(`/users/${id}`, data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    // Axios automatically sets Content-Type to multipart/form-data when FormData is used
    // The interceptor handles removing Content-Type header if FormData is detected
    return api.post('/users/avatar', formData);
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
  getProducts: (category?: string, params?: { minPrice?: number; maxPrice?: number; makerIds?: string }) =>
    api.get('/products', { 
      params: { 
        ...(category && { category }),
        ...(params?.minPrice !== undefined && { minPrice: params.minPrice }),
        ...(params?.maxPrice !== undefined && { maxPrice: params.maxPrice }),
        ...(params?.makerIds && { makerIds: params.makerIds }),
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

export default api;

export interface CheckoutSessionRequestItem {
  productId: string;
  quantity: number;
}

export const checkoutAPI = {
  createCheckoutSession: async (items: CheckoutSessionRequestItem[]) => {
    const response = await api.post('/orders/create-checkout-session', { items });
    return response.data as { url: string };
  },
};

