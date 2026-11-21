import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import posthog, { isPostHogInitialized } from '../posthog';

const AuthContext = createContext();

const identifyUser = (user) => {
  const distinctId = user?.id;

  if (!isPostHogInitialized || (typeof distinctId !== 'string' && typeof distinctId !== 'number')) {
    return;
  }

  const normalizedDistinctId = String(distinctId);
  const previousDistinctId = posthog.get_property('$user_id');

  if (previousDistinctId && previousDistinctId !== normalizedDistinctId) {
    posthog.reset();
  }

  posthog.identify(normalizedDistinctId);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/verify');
      if (response.data.success) {
        identifyUser(response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // If verification fails (no token or invalid), set as not authenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      if (response.data.success) {
        identifyUser(response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Store token in localStorage as backup
        localStorage.setItem('authToken', response.data.token);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (isPostHogInitialized) {
        posthog.reset();
      }
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    changePassword,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

