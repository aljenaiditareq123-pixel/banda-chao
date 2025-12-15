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
  timeout: 30000, // 30 seconds timeout (default)
  withCredentials: true, // Include cookies in requests
});

// Special axios instance for AI endpoints with longer timeout
const aiApiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds (2 minutes) for AI processing
  withCredentials: true,
});

// Shared request interceptor function
const addAuthInterceptor = (client: AxiosInstance) => {
  client.interceptors.request.use(
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
};

// Add auth interceptor to both clients
addAuthInterceptor(apiClient);
addAuthInterceptor(aiApiClient);

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

// Shared response interceptor function
const addResponseInterceptor = (client: AxiosInstance, isAI: boolean = false) => {
  client.interceptors.response.use(
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
          // Only redirect if not already on login/register page or public pages
          const pathname = window.location.pathname;
          const publicPages = ['/login', '/register', '/signup', '/test-payment', '/products', '/makers', '/videos', '/posts', '/about', '/privacy-policy', '/terms-of-service', '/cart', '/checkout'];
          const isPublicPage = publicPages.some(page => pathname.includes(page));
          
          if (!isPublicPage) {
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

      // Retry the request (use the same client that made the original request)
      try {
        const clientToUse = isAI ? aiApiClient : apiClient;
        return await clientToUse(originalRequest);
      } catch (retryError) {
        // If retry fails, reject the error
        return Promise.reject(retryError);
      }
    }
    
    // Special handling for timeout errors in AI requests
    if (isAI && error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('[AI API] Request timeout - Gemini API is taking longer than expected');
      // Enhance error message for timeout
      error.message = 'استغرق الرد وقتاً طويلاً. يرجى المحاولة مرة أخرى أو تبسيط الرسالة.';
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
};

// Add response interceptor to both clients
addResponseInterceptor(apiClient, false);
addResponseInterceptor(aiApiClient, true);

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
    try {
      const response = await apiClient.get('/products', { params });
      return response.data || { products: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('[productsAPI.getAll] Error:', error);
      return { products: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
    }
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
  getApplications: async (params?: { language?: string; country?: string }): Promise<{ success: boolean; applications?: Array<{ id: number; name: string; email: string; country: string; main_platform?: string | null; what_you_sell?: string | null; preferred_lang?: string | null; why_join?: string | null; created_at: Date | string }>; total?: number; error?: string }> => {
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
  getMe: async (): Promise<{ success: boolean; posts?: Array<{ id: string; content: string; images?: string[]; created_at: string; likes: number }>; error?: string }> => {
    try {
      const response = await apiClient.get('/posts/me');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
        : 'Failed to fetch posts';
      return { success: false, error: errorMessage || 'Failed to fetch posts' };
    }
  },
  create: async (data: { content?: string; images?: string[] }): Promise<{ success: boolean; post?: unknown; error?: string }> => {
    try {
      const response = await apiClient.post('/posts', data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to create post';
      return { success: false, error: errorMessage || 'Failed to create post' };
    }
  },
  delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete(`/posts/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
        : 'Failed to delete post';
      return { success: false, error: errorMessage || 'Failed to delete post' };
    }
  },
  uploadImage: async (file: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post('/posts/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to upload image';
      return { success: false, error: errorMessage || 'Failed to upload image' };
    }
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
  create: async (data: { 
    targetType: 'POST' | 'VIDEO' | 'PRODUCT'; 
    targetId: string; 
    content: string;
    reviewVideoUrl?: string;
    reviewRating?: number;
  }) => {
    const response = await apiClient.post('/comments', data);
    return response.data;
  },
};

// ============================================
// Video Upload API
// ============================================

export const videoUploadAPI = {
  uploadReview: async (videoFile: File): Promise<{ success: boolean; videoUrl?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await apiClient.post('/video-upload/review', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for video upload
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string; error?: string } } }).response?.data?.message || 
          (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to upload video';
      return { success: false, error: errorMessage || 'Failed to upload video' };
    }
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
    // Use aiApiClient with longer timeout (120 seconds) for AI processing
    const response = await aiApiClient.post('/ai/assistant', data);
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
    try {
      const response = await apiClient.get('/orders');
      return response.data || { orders: [], stats: { total: 0, paid: 0 } };
    } catch (error) {
      console.error('[ordersAPI.getAll] Error:', error);
      return { orders: [], stats: { total: 0, paid: 0 } };
    }
  },
  calculateShipping: async (data: {
    country: string;
    items?: Array<{ weightInKg?: number; quantity: number }>;
    originCountry?: string; // Optional: defaults to 'CN' if not provided
  }) => {
    const params = new URLSearchParams();
    params.append('country', data.country);
    if (data.items && data.items.length > 0) {
      params.append('items', JSON.stringify(data.items));
    }
    if (data.originCountry) {
      params.append('originCountry', data.originCountry);
    }
    const response = await apiClient.get(`/orders/shipping/calculate?${params.toString()}`);
    return response.data;
  },
  createOrder: async (data: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    shipping: {
      name: string;
      address: string;
      city: string;
      zip: string;
      country: string;
      phone?: string;
    };
    payment?: {
      cardName?: string;
      cardNumber?: string;
      expiry?: string;
      cvc?: string;
    };
    total: number;
  }) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },
};

// ============================================
// Services API
// ============================================

export const servicesAPI = {
  // Get public services (for buyers/homepage) - NO AUTH REQUIRED
  getPublicServices: async (options?: { limit?: number; offset?: number }): Promise<{ success: boolean; services?: Array<{ id: string; title: string; description: string; price: number; type: 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER'; created_at: string; makers?: { id: string; name: string; country?: string; profile_picture_url?: string } }>; error?: string }> => {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await apiClient.get(`/services/public?${params.toString()}`);
      return {
        success: true,
        services: response.data.services || [],
      };
    } catch (error: any) {
      console.error('Error fetching public services:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch services',
      };
    }
  },
  getAll: async (): Promise<{ success: boolean; services?: Array<{ id: string; title: string; description: string; price: number; type: 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER'; created_at: string }>; error?: string }> => {
    try {
      const response = await apiClient.get('/services');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
        : 'Failed to fetch services';
      return { success: false, error: errorMessage || 'Failed to fetch services' };
    }
  },
  create: async (data: {
    title: string;
    description: string;
    price: number;
    type: 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER';
  }): Promise<{ success: boolean; service?: unknown; error?: string }> => {
    try {
      const response = await apiClient.post('/services', data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
        : 'Failed to create service';
      return { success: false, error: errorMessage || 'Failed to create service' };
    }
  },
  update: async (id: string, data: {
    title?: string;
    description?: string;
    price?: number;
    type?: 'DRIVER' | 'AGENT' | 'ARTISAN' | 'TECH' | 'MEDIA' | 'EDUCATION' | 'OTHER';
  }): Promise<{ success: boolean; service?: unknown; error?: string }> => {
    try {
      const response = await apiClient.put(`/services/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
        : 'Failed to update service';
      return { success: false, error: errorMessage || 'Failed to update service' };
    }
  },
  delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete(`/services/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error || (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
        : 'Failed to delete service';
      return { success: false, error: errorMessage || 'Failed to delete service' };
    }
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
// Search API (Semantic Search)
// ============================================

export const searchAPI = {
  search: async (query: string, options?: {
    locale?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    products?: any[];
    total?: number;
    keywords?: string[];
    suggestions?: string[];
    error?: string;
  }> => {
    try {
      const response = await apiClient.post('/search', {
        query,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Search failed',
      };
    }
  },
  getSuggestions: async (query: string, locale: string = 'en'): Promise<{
    success: boolean;
    suggestions?: string[];
    error?: string;
  }> => {
    try {
      const response = await apiClient.get('/search/suggestions', {
        params: { q: query, locale },
      });
      return response.data;
    } catch (error: any) {
      console.error('Suggestions error:', error);
      return {
        success: false,
        suggestions: [],
        error: error.response?.data?.error || error.message,
      };
    }
  },
  getPopular: async (limit: number = 10): Promise<{
    success: boolean;
    searches?: string[];
    error?: string;
  }> => {
    try {
      const response = await apiClient.get('/search/popular', {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('Popular searches error:', error);
      return {
        success: false,
        searches: [],
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

// ============================================
// Chat API (PandaChat - AI Butler)
// ============================================

export const chatAPI = {
  sendMessage: async (message: string, options?: {
    context?: {
      currentProductId?: string;
      recentOrderId?: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
    };
    locale?: string;
  }): Promise<{
    success: boolean;
    message?: string;
    suggestions?: string[];
    action?: {
      type: 'redirect' | 'show_order' | 'show_product';
      data?: any;
    };
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const endpoint = token ? '/chat/message/auth' : '/chat/message';
      
      const response = await apiClient.post(endpoint, {
        message,
        context: options?.context,
        locale: options?.locale || 'en',
      }, {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Chat error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send message',
      };
    }
  },
};

// ============================================
// Viral Growth API (Referral & Clan Buying)
// ============================================

export const viralAPI = {
  getReferralLink: async (): Promise<{
    success: boolean;
    referralLink?: string;
    code?: string;
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.get('/viral/referral-link', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting referral link:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get referral link',
      };
    }
  },
  trackReferral: async (referralCode: string, visitorId?: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const response = await apiClient.post('/viral/track-referral', {
        referralCode,
        visitorId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error tracking referral:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
  getClanStats: async (productId: string): Promise<{
    success: boolean;
    stats?: {
      activeClans: number;
      totalMembers: number;
      averageDiscount: number;
    };
    error?: string;
  }> => {
    try {
      const response = await apiClient.get(`/viral/clan-stats/${productId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting clan stats:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

// ============================================
// Games API (Gamification Center)
// ============================================

export const gamesAPI = {
  performCheckIn: async (): Promise<{
    success: boolean;
    streak?: number;
    pointsEarned?: number;
    totalPoints?: number;
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.post('/games/check-in', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Check-in error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to check in',
      };
    }
  },
  getCheckInStatus: async (): Promise<{
    success: boolean;
    hasCheckedIn?: boolean;
    streak?: number;
    lastCheckIn?: string | null;
    weeklyHistory?: boolean[];
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.get('/games/check-in/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Check-in status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
  spinWheel: async (): Promise<{
    success: boolean;
    result?: {
      prize: string;
      prizeType: 'discount' | 'points' | 'nothing';
      value: number;
      message: string;
    };
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.post('/games/spin-wheel', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Spin wheel error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to spin wheel',
      };
    }
  },
  getStats: async (): Promise<{
    success: boolean;
    points?: number;
    level?: number;
    streak?: number;
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.get('/games/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Game stats error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

// ============================================
// Wallet API (Digital Wallet & Loyalty)
// ============================================

export const walletAPI = {
  getBalance: async (): Promise<{
    success: boolean;
    balance?: number;
    points?: number;
    currency?: string;
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.get('/wallet/balance', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Wallet balance error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get wallet balance',
      };
    }
  },
  convertPoints: async (points: number): Promise<{
    success: boolean;
    balanceAdded?: number;
    pointsDeducted?: number;
    newBalance?: number;
    newPoints?: number;
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.post(
        '/wallet/convert-points',
        { points },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Convert points error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to convert points',
      };
    }
  },
  getTransactions: async (limit?: number, offset?: number): Promise<{
    success: boolean;
    transactions?: Array<{
      id: string;
      type: string;
      amount: number;
      currency: string;
      description: string;
      relatedOrderId?: string;
      createdAt: string;
    }>;
    total?: number;
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await apiClient.get(`/wallet/transactions?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Transaction history error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
  getStats: async (): Promise<{
    success: boolean;
    totalEarned?: number;
    totalSpent?: number;
    totalTransactions?: number;
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.get('/wallet/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Wallet stats error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

// ============================================
// Tracking API (Visual Order Tracking)
// ============================================

export const trackingAPI = {
  getTracking: async (orderId: string, locale: string = 'en'): Promise<{
    success: boolean;
    order?: any;
    timeline?: {
      orderId: string;
      currentStatus: string;
      events: Array<{
        id: string;
        status: string;
        title: string;
        description: string;
        timestamp: Date | string;
        location?: string;
        completed: boolean;
        isCurrent?: boolean;
      }>;
      estimatedArrival?: Date | string;
      trackingNumber?: string;
    };
    error?: string;
  }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await apiClient.get(`/tracking/${orderId}?locale=${locale}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Tracking error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get tracking information',
      };
    }
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
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data || { users: [], total: 0 };
    } catch (error) {
      console.error('[usersAPI.getAll] Error:', error);
      return { users: [], total: 0 };
    }
  },
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
