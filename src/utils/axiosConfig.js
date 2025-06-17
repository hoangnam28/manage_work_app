import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://192.84.105.173:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

let isRefreshing = false;
let refreshSubscribers = [];

// Function to add new subscribers
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);

// Function to notify all subscribers with new token
const onRefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

// Function to handle refresh failure
const onRefreshError = (error) => {
  refreshSubscribers = [];
  // Redirect to login and clear all stored tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  window.location.href = '/login';
};

axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        try {
          const token = await new Promise(resolve => subscribeTokenRefresh(resolve));
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        onRefreshError(new Error('No refresh token'));
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post('/auth/refresh-token', {
          refreshToken: refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Notify all subscribers about the new token
        onRefreshed(accessToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshError(refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
