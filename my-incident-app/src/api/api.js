import axios from 'axios';

const API_URL = 'http://localhost:4000/api';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true //  для  cookies
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

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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


const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    
    const { status, data } = error.response;
    const errorMessage = data.error || data.message || 'Произошла ошибка';
    
    console.error(`API Error [${status}]:`, {
      message: errorMessage,
      path: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString()
    });

    return {
      code: status,
      message: `${status}: ${errorMessage}`
    };
  } else if (error.request) {

    console.error('Network Error:', error.request);
    return {
      code: 503,
      message: '503: Сервис недоступен - проверьте подключение'
    };
  } else {
    console.error('Request Error:', error.message);
    return {
      code: 400,
      message: `400: ${error.message || 'Ошибка конфигурации запроса'}`
    };
  }
};

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
