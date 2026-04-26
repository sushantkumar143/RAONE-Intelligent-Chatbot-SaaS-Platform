import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('raone_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('raone_token');
      localStorage.removeItem('raone_user');
      localStorage.removeItem('raone_company');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ── Company API ─────────────────────────────────────
export const companyAPI = {
  getCurrent: () => api.get('/companies/current'),
  update: (data) => api.patch('/companies/current', data),
  getStats: () => api.get('/companies/current/stats'),
};

// ── API Keys API ────────────────────────────────────
export const apiKeysAPI = {
  create: (data) => api.post('/api-keys', data),
  list: () => api.get('/api-keys'),
  revoke: (id) => api.delete(`/api-keys/${id}`),
};

// ── Knowledge API ───────────────────────────────────
export const knowledgeAPI = {
  upload: (formData) => api.post('/knowledge/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  scrapeUrl: (data) => api.post('/knowledge/scrape', data),
  addText: (data) => api.post('/knowledge/text', data),
  list: () => api.get('/knowledge/sources'),
  delete: (id) => api.delete(`/knowledge/sources/${id}`),
};

// ── Chat API ────────────────────────────────────────
export const chatAPI = {
  send: (data) => api.post('/chat', data),
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),
};

// ── Analytics API ───────────────────────────────────
export const analyticsAPI = {
  getStats: () => api.get('/analytics'),
  getUsageWidget: () => api.get('/analytics/usage-widget'),
};

export default api;
