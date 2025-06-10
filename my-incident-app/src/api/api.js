// src/api/api.js

const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Важно для работы с cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если это запрос на обновление токена, сразу отклоняем ошибку
    if (originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    // Если ошибка не 401 или запрос уже был повторен, отклоняем ошибку
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Если обновление токена уже идет, добавляем запрос в очередь
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Error handling utility
const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const errorMessage = data.error || data.message || 'Произошла ошибка';
    
    // Log error on server
    console.error(`API Error [${status}]:`, {
      message: errorMessage,
      path: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString()
    });

    // Return error object with code and message
    return {
      code: status,
      message: errorMessage
    };
  } else if (error.request) {
    // Request made but no response received
    console.error('Network Error:', error.request);
    return {
      code: 'NETWORK_ERROR',
      message: 'Ошибка сети - проверьте подключение'
    };
  } else {
    // Error in request configuration
    console.error('Request Error:', error.message);
    return {
      code: 'REQUEST_ERROR',
      message: error.message || 'Ошибка конфигурации запроса'
    };
  }
};

// API endpoints with error handling
export const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      const handledError = handleApiError(error);
      console.error('Login error:', handledError);
      throw handledError;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const handledError = handleApiError(error);
      console.error('Register error:', handledError);
      throw handledError;
    }
  },
  refresh: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      const handledError = handleApiError(error);
      console.error('Refresh error:', handledError);
      throw handledError;
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      const handledError = handleApiError(error);
      console.error('Logout error:', handledError);
      throw handledError;
    }
  }
};

export const incidentsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/incidents/extended');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/incidents', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/incidents/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export const reportsApi = {
  create: async (data) => {
    try {
      const response = await api.post('/reports', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export const flightsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/flights');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/flights/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/flights', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/flights/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/flights/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default api;
