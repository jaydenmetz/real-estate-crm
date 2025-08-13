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
  const [loading, setLoading] = useState(false); // Don't block on load
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  // Verify token on mount and when returning to app
  useEffect(() => {
    const verifyAuth = async () => {
      // Check if user is authenticated
      const isAuth = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      // Update state immediately with stored values
      setIsAuthenticated(isAuth);
      setUser(currentUser);
      
      // Only verify with server if we have auth
      if (isAuth) {
        try {
          const result = await authService.verify();
          if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
          }
          // Don't clear auth on verify failure - let the service handle it
        } catch (error) {
          console.warn('Auth verification failed, keeping cached auth:', error);
        }
      }
      
      setLoading(false);
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