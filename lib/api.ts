import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Log API URL to help debug (always log in browser)
if (typeof window !== 'undefined') {
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
  updateUser: (id: string, data: { name?: string; profilePicture?: string }) =>
    api.put(`/users/${id}`, data),
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
  getProducts: (category?: string) =>
    api.get('/products', { params: { category } }),
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
};

// Search API
export const searchAPI = {
  search: (query: string, type?: 'videos' | 'products' | 'users') =>
    api.get('/search', { params: { q: query, type } }),
};

export default api;

