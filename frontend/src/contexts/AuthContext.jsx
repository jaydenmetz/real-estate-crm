import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/auth.service';
import * as Sentry from '@sentry/react';

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

  // Track last verification time to prevent excessive API calls
  const lastVerifyRef = useRef(0);
  const VERIFY_COOLDOWN = 5 * 60 * 1000; // 5 minutes between verifications
  const FOCUS_DEBOUNCE = 30 * 1000; // 30 seconds minimum between focus verifications

  // Verify token on mount and when returning to app
  useEffect(() => {
    const verifyAuth = async (force = false) => {
      // Check cooldown unless forced
      const now = Date.now();
      if (!force && now - lastVerifyRef.current < VERIFY_COOLDOWN) {
        // Skip verification if we recently verified
        return;
      }

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
            lastVerifyRef.current = now; // Update last verify time on success

            // Set Sentry user context
            if (result.user) {
              Sentry.setUser({
                id: result.user.id,
                email: result.user.email,
                username: result.user.username,
                ip_address: '{{auto}}',
              });
              Sentry.setContext('user_details', {
                role: result.user.role,
                team: result.user.teamName,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
              });
            }
          }
          // Don't clear auth on verify failure - let the service handle it
        } catch (error) {
          // Silently fail - don't spam console with verification failures
          // The user is still logged in with cached credentials
        }
      } else {
        // Clear Sentry context if not authenticated
        Sentry.setUser(null);
        Sentry.setContext('user_details', null);
      }

      setLoading(false);
    };

    // Initial verification
    verifyAuth(true);

    // Re-verify when window regains focus (but not too often)
    let focusTimeout;
    const handleFocus = () => {
      // Clear any pending timeout
      if (focusTimeout) clearTimeout(focusTimeout);

      // Debounce focus events to prevent rapid-fire verifications
      focusTimeout = setTimeout(() => {
        const now = Date.now();
        if (authService.isAuthenticated() && now - lastVerifyRef.current >= FOCUS_DEBOUNCE) {
          verifyAuth();
        }
      }, 1000); // Wait 1 second after focus before verifying
    };

    // Only verify on visibility change (tab switch), not regular focus
    const handleVisibilityChange = () => {
      if (!document.hidden && authService.isAuthenticated()) {
        const now = Date.now();
        if (now - lastVerifyRef.current >= VERIFY_COOLDOWN) {
          verifyAuth();
        }
      }
    };

    // Use visibility API instead of focus for better control
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic verification every 15 minutes while active
    const intervalId = setInterval(() => {
      if (!document.hidden && authService.isAuthenticated()) {
        verifyAuth();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (focusTimeout) clearTimeout(focusTimeout);
      clearInterval(intervalId);
    };
  }, []);

  // Login function
  const login = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    // Set Sentry user context for better error tracking
    if (userData) {
      Sentry.setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        ip_address: '{{auto}}', // Sentry will capture IP automatically
      });

      // Set additional context
      Sentry.setContext('user_details', {
        role: userData.role,
        team: userData.teamName,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);

      // Clear Sentry user context
      Sentry.setUser(null);
      Sentry.setContext('user_details', null);
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