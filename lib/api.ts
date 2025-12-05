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
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add auth token and CSRF token
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Get CSRF token from cookie
        let csrfToken = getCookie('csrf-token');
        
        // If no CSRF token and this is not a GET request, try to get one
        if (!csrfToken && config.method !== 'get' && config.method !== 'GET') {
          // For AI endpoints, CSRF is not required (they're excluded)
          // But we still try to get token for other endpoints
          const isAIEndpoint = config.url?.startsWith('/ai/');
          if (!isAIEndpoint) {
            try {
              // Try to get CSRF token from API
              const tokenResponse = await fetch(`${API_URL}/api/v1/csrf-token`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
              });
              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                csrfToken = tokenData.csrfToken || getCookie('csrf-token');
              }
            } catch (err) {
              // Silently fail - CSRF token fetch failed
              console.warn('[API] Failed to fetch CSRF token:', err);
            }
          }
        }
        
        // Add CSRF token to header (even if null, for AI endpoints it will be skipped)
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
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

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

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
          const pathname = window.location.pathname;
          if (!pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/signup')) {
            // Extract locale from current path (e.g., /ar/... or /en/... or /zh/...)
            const localeMatch = pathname.match(/^\/(ar|en|zh)/);
            const locale = localeMatch ? localeMatch[1] : 'en'; // Default to 'en' if no locale found
            window.location.href = `/${locale}/login`;
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
    const response = await apiClient.post('/auth/login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies
    });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout', {}, {
      withCredentials: true, // Include cookies
    });
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
    wechatLink?: string;
    instagramLink?: string;
    twitterLink?: string;
    facebookLink?: string;
    paypalLink?: string;
    phone?: string;
  }) => {
    const response = await apiClient.post('/makers', data);
    return response.data;
  },
};

// ============================================
// Products API
// ============================================

export interface CreateProductData {
  name: string;
  description: string;
  price?: number;
  currency?: string;
  category?: string;
  external_link?: string;
  stock?: number;
  image?: File;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  external_link?: string;
  stock?: number;
  image?: File;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  category_id?: string;
  makerId?: string;
  search?: string;
  search_term?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'created_at' | 'createdAt' | 'price' | 'name';
  sort_order?: 'asc' | 'desc';
}

export const productsAPI = {
  getAll: async (params?: GetProductsParams) => {
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
  create: async (data: CreateProductData): Promise<{ success: boolean; product?: unknown; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (data.price !== undefined) formData.append('price', data.price.toString());
      if (data.currency) formData.append('currency', data.currency);
      if (data.category) formData.append('category', data.category);
      if (data.external_link) formData.append('external_link', data.external_link);
      if (data.stock !== undefined) formData.append('stock', data.stock.toString());
      if (data.image) formData.append('image', data.image);

      const response = await apiClient.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to create product';
      return { success: false, error: errorMessage || 'Failed to create product' };
    }
  },
  update: async (id: string, data: UpdateProductData): Promise<{ success: boolean; product?: unknown; error?: string }> => {
    try {
      const formData = new FormData();
      if (data.name !== undefined) formData.append('name', data.name);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.price !== undefined) formData.append('price', data.price.toString());
      if (data.currency) formData.append('currency', data.currency);
      if (data.category !== undefined) formData.append('category', data.category || '');
      if (data.external_link !== undefined) formData.append('external_link', data.external_link);
      if (data.stock !== undefined) formData.append('stock', data.stock.toString());
      if (data.image) formData.append('image', data.image);

      const response = await apiClient.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to update product';
      return { success: false, error: errorMessage || 'Failed to update product' };
    }
  },
  delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to delete product';
      return { success: false, error: errorMessage || 'Failed to delete product' };
    }
  },
};

// ============================================
// Beta API
// ============================================

export const betaAPI = {
  submitApplication: async (data: {
    name: string;
    email: string;
    country: string;
    mainPlatform?: string;
    whatYouSell?: string;
    preferredLang?: string;
    whyJoin?: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const response = await apiClient.post('/beta/applications', data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to submit application';
      return { success: false, error: errorMessage || 'Failed to submit application' };
    }
  },
  getApplications: async (params?: { language?: string; country?: string }): Promise<{ success: boolean; applications?: unknown[]; total?: number; error?: string }> => {
    try {
      const response = await apiClient.get('/beta/applications', { params });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to fetch applications';
      return { success: false, error: errorMessage || 'Failed to fetch applications' };
    }
  },
};

// ============================================
// Videos API
// ============================================

export const videosAPI = {
  upload: async (formData: FormData) => {
    const response = await apiClient.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
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
  create: async (data: { content: string; images?: string[] }) => {
    const response = await apiClient.post('/posts', data);
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
// Likes API
// ============================================

export const likesAPI = {
  toggle: async (data: { targetType: 'POST' | 'PRODUCT' | 'VIDEO' | 'COMMENT'; targetId: string }) => {
    const response = await apiClient.post('/likes/toggle', data);
    return response.data;
  },
  getStatus: async (targetType: 'POST' | 'PRODUCT' | 'VIDEO' | 'COMMENT', targetId: string) => {
    const response = await apiClient.get('/likes/status', {
      params: { targetType, targetId },
    });
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
// Operations API (Banda Ops)
// ============================================

export const opsAPI = {
  getBriefing: async () => {
    const response = await apiClient.get('/ops/briefing');
    return response.data;
  },
  getLowStockProducts: async (threshold?: number) => {
    const response = await apiClient.get('/ops/inventory/low-stock', { params: { threshold } });
    return response.data;
  },
  getDailySalesStats: async (date?: string) => {
    const response = await apiClient.get('/ops/sales/daily', { params: { date } });
    return response.data;
  },
  getSystemHealth: async () => {
    const response = await apiClient.get('/ops/health');
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
