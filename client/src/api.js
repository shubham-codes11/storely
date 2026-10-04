const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'An error occurred with your request');
    error.errors = data.errors || {};
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me'),
  updatePassword: (passwords) => request('/auth/update-password', { method: 'PUT', body: passwords }),

  // Stores & Ratings
  getStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/stores${query ? `?${query}` : ''}`);
  },
  getStore: (id) => request(`/stores/${id}`),
  submitRating: (storeId, { rating, comment }) =>
    request(`/stores/${storeId}/rating`, {
      method: 'POST',
      body: { rating, comment },
    }),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  getAdminUser: (id) => request(`/admin/users/${id}`),
  createUser: (userData) => request('/admin/users', { method: 'POST', body: userData }),
  getAdminStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/stores${query ? `?${query}` : ''}`);
  },
  createStore: (storeData) => request('/admin/stores', { method: 'POST', body: storeData }),

  // Store Owner
  getStoreOwnerDashboard: () => request('/store-owner/dashboard'),
};

export default api;
