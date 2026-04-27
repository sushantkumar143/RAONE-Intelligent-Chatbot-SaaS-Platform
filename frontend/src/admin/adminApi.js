import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin JWT token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('raone_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('raone_admin_token');
      localStorage.removeItem('raone_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const adminAuthAPI = {
  login: (data) => adminApi.post('/auth/admin-login', data),
};

export const adminDashboardAPI = {
  getStats: () => adminApi.get('/admin/stats'),
  getUsers: () => adminApi.get('/admin/users'),
  getCompanies: () => adminApi.get('/admin/companies'),
  getCompanyDetail: (id) => adminApi.get(`/admin/companies/${id}`),
  getCompanyAnalytics: (id) => adminApi.get(`/admin/companies/${id}/analytics`),
  toggleUserActive: (id) => adminApi.patch(`/admin/users/${id}/toggle-active`),
  toggleBlacklist: (id) => adminApi.patch(`/admin/companies/${id}/toggle-blacklist`),
  changePlan: (id, plan) => adminApi.patch(`/admin/companies/${id}/change-plan?plan=${plan}`),
};

export default adminApi;
