import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api/v1`;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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
};

// ============================================
// Users API (existing)
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default apiClient;
