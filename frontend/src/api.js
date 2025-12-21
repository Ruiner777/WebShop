import axios from 'axios';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Важно для работы с сессиями Django
});

// Интерцептор для добавления токена аутентификации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен недействителен, удаляем его
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// API методы
export const categoriesAPI = {
  getAll: () => api.get('/v1/categories/'),
  getBySlug: (slug) => api.get(`/v1/categories/${slug}/`),
  create: (data) => api.post('/v1/categories/', data),
  update: (slug, data) => api.put(`/v1/categories/${slug}/`, data),
  delete: (slug) => api.delete(`/v1/categories/${slug}/`),
};

export const productsAPI = {
  getAll: (params) => api.get('/v1/products/', { params }),
  getBySlug: (slug) => api.get(`/v1/products/${slug}/`),
  getAvailable: () => api.get('/v1/products/available/'),
  create: (data) => api.post('/v1/products/', data),
  update: (slug, data) => api.put(`/v1/products/${slug}/`, data),
  delete: (slug) => api.delete(`/v1/products/${slug}/`),
};

export const usersAPI = {
  getAll: () => api.get('/v1/users/'),
  getMe: () => api.get('/v1/users/me/'),
  create: (data) => api.post('/v1/users/', data),
  update: (id, data) => api.put(`/v1/users/${id}/`, data),
  delete: (id) => api.delete(`/v1/users/${id}/`),
};

export const ordersAPI = {
  getAll: () => api.get('/v1/orders/'),
  getById: (id) => api.get(`/v1/orders/${id}/`),
  create: (data) => api.post('/v1/orders/', data),
  update: (id, data) => api.put(`/v1/orders/${id}/`, data),
  delete: (id) => api.delete(`/v1/orders/${id}/`),
};

export const authAPI = {
  register: (data) => api.post('/v1/auth/register/', data),
  login: (data) => api.post('/v1/auth/login/', data),
  logout: () => api.post('/v1/auth/logout/'),
  getProfile: () => api.get('/v1/auth/profile/'),
  updateProfile: (data) => {
    // Если data - FormData, не устанавливаем Content-Type, браузер установит его автоматически с boundary
    if (data instanceof FormData) {
      return api.put('/v1/auth/profile/', data)
    }
    return api.put('/v1/auth/profile/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  changePassword: (data) => api.post('/v1/auth/password_change/', data),
  // Для обратной совместимости
  getToken: (username, password) => 
    api.post('/v1/auth-token/', { username, password }),
};

export const cartAPI = {
  getCart: () => api.get('/v1/cart/'),
  addItem: (productId, quantity = 1, overrideQuantity = false) => 
    api.post('/v1/cart/add_item/', { 
      product_id: productId, 
      quantity, 
      override_quantity: overrideQuantity 
    }),
  updateQuantity: (productId, quantity) => 
    api.post('/v1/cart/update_quantity/', { 
      product_id: productId, 
      quantity 
    }),
  removeItem: (productId) => 
    api.post('/v1/cart/remove_item/', { product_id: productId }),
  getQuantity: () => api.get('/v1/cart/get_quantity/'),
  clear: () => api.post('/v1/cart/clear/'),
};

export default api;



