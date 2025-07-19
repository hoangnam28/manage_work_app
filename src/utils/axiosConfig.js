import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://192.84.105.173:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);

const onRefreshed = (token) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const onRefreshError = (error) => {
  refreshSubscribers.forEach(cb => cb(null, error));
  refreshSubscribers = [];
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  
  toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
  
  setTimeout(() => {
    window.location.href = '/';
  }, 1500);
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error('Lỗi kết nối mạng, vui lòng kiểm tra internet');
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            subscribeTokenRefresh((newToken, refreshError) => {
              if (refreshError) {
                reject(refreshError);
              } else {
                resolve(newToken);
              }
            });
          });
          
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        isRefreshing = false;
        onRefreshError(new Error('No refresh token available'));
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
        
        if (!accessToken) {
          throw new Error('No access token received from refresh');
        }

        // Update stored tokens
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update headers for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Notify all waiting requests
        onRefreshed(accessToken);
        isRefreshing = false;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        isRefreshing = false;
        onRefreshError(refreshError);
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    switch (error.response?.status) {
      case 400:
        toast.error(error.response.data?.message || 'Dữ liệu không hợp lệ');
        break;
      case 403:
        toast.error('Bạn không có quyền thực hiện thao tác này');
        break;
      case 404:
        toast.error('Không tìm thấy dữ liệu yêu cầu');
        break;
      case 409:
        toast.error(error.response.data?.message || 'Dữ liệu đã tồn tại');
        break;
      case 422:
        toast.error(error.response.data?.message || 'Dữ liệu không đúng định dạng');
        break;
      case 429:
        toast.error('Quá nhiều yêu cầu, vui lòng thử lại sau');
        break;
      case 500:
        toast.error('Lỗi máy chủ, vui lòng thử lại sau');
        break;
      case 502:
      case 503:
      case 504:
        toast.error('Máy chủ tạm thời không khả dụng, vui lòng thử lại sau');
        break;
      default:
        if (error.response?.status >= 500) {
          toast.error('Lỗi máy chủ, vui lòng thử lại sau');
        } else if (!error.response.data?.message) {
          toast.error('Có lỗi xảy ra, vui lòng thử lại');
        }
        break;
    }

    return Promise.reject(error);
  }
);

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(token && refreshToken);
};

// Helper function to get current user info
export const getCurrentUser = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
};

// Helper function to manually logout
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  delete axiosInstance.defaults.headers.common['Authorization'];
  window.location.href = '/';
};

export default axiosInstance;