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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
    const status = error.response?.status;

    // Handle 401 - Unauthorized
    if (status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
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
        // If retry fails, reject the error
        return Promise.reject(retryError);
      }
    }

    // Log error details (excluding sensitive data) - only in client-side
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const url = error.config?.url;
      const baseURL = error.config?.baseURL;
      
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

      // Handle 404 errors - provide better error message
      if (status === 404) {
        console.error('404 Not Found:', {
          endpoint: url,
          baseURL,
          suggestion: 'Check if the endpoint path is correct and the backend server is running',
        });
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default apiClient;
