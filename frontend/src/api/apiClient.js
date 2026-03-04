import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

// Menu API
export const menuAPI = {
  getAll: (params) => apiClient.get('/menu', { params }),
  getById: (id) => apiClient.get(`/menu/${id}`),
  purchase: (id) => apiClient.post(`/menu/${id}/purchase`),
  create: (data) => apiClient.post('/menu', data),
  update: (id, data) => apiClient.put(`/menu/${id}`, data),
  delete: (id) => apiClient.delete(`/menu/${id}`),
  toggleAvailability: (id, available) => 
    apiClient.patch(`/menu/${id}/availability`, { available }),
};

// Credits API
export const creditsAPI = {
  getBalance: () => apiClient.get('/credits/balance'),
  getTransactions: (params) => apiClient.get('/credits/transactions', { params }),
  addCredits: (data) => apiClient.post('/credits/add', data),
};

// Cart API
export const cartAPI = {
  get: () => apiClient.get('/cart'),
  addItem: (menuItemId, quantity = 1) => apiClient.post('/cart/add', { menuItemId, quantity }),
  updateItem: (menuItemId, quantity) => apiClient.patch('/cart/update', { menuItemId, quantity }),
  removeItem: (menuItemId) => apiClient.delete(`/cart/remove/${menuItemId}`),
  clear: () => apiClient.delete('/cart/clear'),
  checkout: (notes = '') => apiClient.post('/cart/checkout', { notes }),
};

// Orders API
export const ordersAPI = {
  getMyOrders: (params) => apiClient.get('/orders/my', { params }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  cancelOrder: (id) => apiClient.patch(`/orders/${id}/cancel`),
  // Admin endpoints
  getAll: (params) => apiClient.get('/orders', { params }),
  updateStatus: (id, status, notes) => apiClient.patch(`/orders/${id}/status`, { status, notes }),
};

// Users API
export const usersAPI = {
  getAll: (params) => apiClient.get('/users', { params }),
  getProfile: () => apiClient.get('/users/profile'),
};

// Admin API
export const adminAPI = {
  getStats: () => apiClient.get('/admin/stats'),
  getRevenue: () => apiClient.get('/admin/revenue'),
};

// Notifications API
export const notificationsAPI = {
  getMy: () => apiClient.get('/notifications/my'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

export default apiClient;
