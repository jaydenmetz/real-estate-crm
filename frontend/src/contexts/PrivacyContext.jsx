import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiInstance from '../services/api.service';

/**
 * Privacy Context for Master Toggle Control
 *
 * Purpose:
 * - Coordinates privacy toggle state between master control (top stat card)
 *   and individual card toggles throughout a dashboard
 * - Enables master toggle to force all cards hidden when master is hidden
 * - Allows individual card control when master is showing
 * - Fetches default privacy preference from user settings
 *
 * Usage:
 * 1. Wrap dashboard with PrivacyProvider
 * 2. Master control uses toggleMaster() and reads masterHidden
 * 3. Individual cards check masterHidden to enforce master override
 *
 * Behavior:
 * - masterHidden = true  → All cards forced hidden (individual toggles disabled)
 * - masterHidden = false → Individual cards can toggle independently
 * - Default state loaded from user_settings.commission_privacy_default
 *
 * Example:
 * <PrivacyProvider entityType="escrows">
 *   <EscrowsDashboard />
 * </PrivacyProvider>
 */

export const PrivacyContext = createContext(null);

export const PrivacyProvider = ({ children, entityType = 'unknown' }) => {
  // Master toggle state - default loaded from user settings
  const [masterHidden, setMasterHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's default privacy preference
  useEffect(() => {
    const fetchPrivacyDefault = async () => {
      try {
        const response = await apiInstance.get('/users/settings');
        const commissionPrivacyDefault = response.data.data?.commission_privacy_default ?? true;
        setMasterHidden(commissionPrivacyDefault);
      } catch (error) {
        // Silently handle 404 (endpoint not implemented yet) - defaults to true (hidden)
        if (error.message !== 'Endpoint not found') {
          console.error('Failed to fetch privacy preference:', error);
        }
        // Keep default as true (hidden) on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacyDefault();
  }, []);

  // Toggle master state (called by top stat card)
  const toggleMaster = useCallback(() => {
    setMasterHidden(prev => !prev);
  }, []);

  const value = {
    masterHidden,
    toggleMaster,
    entityType,
    isLoading,
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
};

/**
 * Hook to access privacy context
 * @returns {Object} { masterHidden, toggleMaster, entityType }
 * @throws {Error} If used outside PrivacyProvider
 */
export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within PrivacyProvider');
  }
  return context;
};

/**
 * Hook for individual card toggles
 * Combines master state with individual toggle state
 *
 * @param {string} metricKey - Unique key for this metric's toggle
 * @param {Object} toggleStates - Local toggle states object
 * @param {Function} setToggleStates - Function to update toggle states
 * @returns {Object} { shouldMask, handleToggle }
 */
export const usePrivacyToggle = (metricKey, toggleStates, setToggleStates) => {
  const { masterHidden } = usePrivacy();

  // Determine if value should be masked
  // Rule: Mask if master is hidden OR individual toggle is off
  const individualToggle = toggleStates[metricKey] ?? false;
  const shouldMask = masterHidden || !individualToggle;

  // Handle individual toggle (only effective when master is showing)
  const handleToggle = useCallback(() => {
    if (!masterHidden) {
      setToggleStates(prev => ({
        ...prev,
        [metricKey]: !prev[metricKey],
      }));
    }
  }, [masterHidden, metricKey, setToggleStates]);

  return { shouldMask, handleToggle };
};
