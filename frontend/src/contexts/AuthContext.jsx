import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  // Verify token on mount and when returning to app
  useEffect(() => {
    const verifyAuth = async () => {
      // Skip if no token
      if (!authService.token) {
        setLoading(false);
        return;
      }

      try {
        const result = await authService.verify();
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear auth state
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    // Re-verify when window regains focus (user returns to tab)
    const handleFocus = () => {
      if (authService.isAuthenticated()) {
        verifyAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Login function
  const login = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (preferences) => {
    const result = await authService.updatePreferences(preferences);
    if (result.success) {
      setUser(prevUser => ({
        ...prevUser,
        preferences: result.preferences
      }));
    }
    return result;
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profile) => {
    const result = await authService.updateProfile(profile);
    if (result.success) {
      setUser(prevUser => ({
        ...prevUser,
        profile: result.profile
      }));
    }
    return result;
  }, []);

  // Get user preference
  const getPreference = useCallback((key, defaultValue = null) => {
    return user?.preferences?.[key] ?? defaultValue;
  }, [user]);

  // Check if user has role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Get error display mode based on user preferences
  const getErrorDisplayMode = useCallback(() => {
    return getPreference('errorDisplay', 'friendly');
  }, [getPreference]);

  // Check if should show debug info
  const shouldShowDebugInfo = useCallback(() => {
    return getPreference('showDebugInfo', false);
  }, [getPreference]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updatePreferences,
    updateProfile,
    getPreference,
    hasRole,
    isAdmin,
    getErrorDisplayMode,
    shouldShowDebugInfo,
    apiKey: user?.apiKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};