import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = React.useCallback(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const userInfo = localStorage.getItem('userInfo');
      
      if (token && userInfo) {
        setUser(JSON.parse(userInfo));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await axiosInstance.post('/auth/refresh', { refreshToken });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data.accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};