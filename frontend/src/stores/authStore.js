import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('raone_user') || 'null'),
  company: JSON.parse(localStorage.getItem('raone_company') || 'null'),
  token: localStorage.getItem('raone_token') || null,
  isAuthenticated: !!localStorage.getItem('raone_token'),
  isLoading: false,
  error: null,

  setAuth: (user, company, token) => {
    localStorage.setItem('raone_token', token);
    localStorage.setItem('raone_user', JSON.stringify(user));
    localStorage.setItem('raone_company', JSON.stringify(company));
    set({
      user,
      company,
      token,
      isAuthenticated: true,
      error: null,
    });
  },

  updateUser: (user) => {
    localStorage.setItem('raone_user', JSON.stringify(user));
    set({ user });
  },

  updateCompany: (company) => {
    localStorage.setItem('raone_company', JSON.stringify(company));
    set({ company });
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.signup(data);
      const { access_token, user, company } = response.data;
      get().setAuth(user, company, access_token);
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Signup failed';
      set({ error: message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user, company } = response.data;
      get().setAuth(user, company, access_token);
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      set({ error: message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  googleLogin: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.googleLogin({ token: credential });
      const { access_token, user, company } = response.data;
      get().setAuth(user, company, access_token);
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Google Login failed';
      set({ error: message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      get().updateUser(response.data);
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Profile update failed';
      set({ error: message, isLoading: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('raone_token');
    localStorage.removeItem('raone_user');
    localStorage.removeItem('raone_company');
    set({
      user: null,
      company: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
