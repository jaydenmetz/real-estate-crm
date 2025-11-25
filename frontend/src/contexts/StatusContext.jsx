/**
 * Status Context - Database-Driven Status Configuration
 *
 * Fetches and provides status configurations from the database
 * Replaces hardcoded status values with flexible, team-specific configurations
 *
 * Usage:
 * 1. Wrap dashboard with <StatusProvider entityType="escrows">
 * 2. Access via const { statuses, categories, loading } = useStatus()
 * 3. Components automatically use database-driven statuses
 *
 * Features:
 * - Team-specific status customization
 * - Automatic fallback to system defaults
 * - Real-time status updates
 * - Status transition validation
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStatuses, getStatusCategories } from '../services/statuses.service';

export const StatusContext = createContext(null);

/**
 * Status Provider Component
 * Fetches status configuration from database and provides to children
 *
 * @param {ReactNode} children - Child components
 * @param {string} entityType - escrows, listings, clients, leads, appointments
 */
export const StatusProvider = ({ children, entityType }) => {
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch statuses and categories from database
  const fetchStatusConfig = useCallback(async () => {
    if (!entityType) {
      setError('Entity type is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch both statuses and categories in parallel
      const [statusData, categoryData] = await Promise.all([
        getStatuses(entityType),
        getStatusCategories(entityType),
      ]);

      console.log('StatusContext: Fetched data from API:', {
        entityType,
        statusCount: statusData?.length || 0,
        categoryCount: categoryData?.length || 0,
        categories: categoryData,
      });

      setStatuses(statusData || []);
      setCategories(categoryData || []);
    } catch (err) {
      console.error(`Failed to fetch status config for ${entityType}:`, err);
      setError(err.message || 'Failed to load status configuration');

      // Set empty arrays as fallback
      setStatuses([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  // Fetch on mount and when entityType changes
  useEffect(() => {
    fetchStatusConfig();
  }, [fetchStatusConfig]);

  // Helper: Get status by key
  const getStatusByKey = useCallback((statusKey) => {
    return statuses.find(s => s.status_key === statusKey);
  }, [statuses]);

  // Helper: Get category by key
  const getCategoryByKey = useCallback((categoryKey) => {
    return categories.find(c => c.category_key === categoryKey);
  }, [categories]);

  // Helper: Get statuses for a category
  const getStatusesForCategory = useCallback((categoryKey) => {
    const category = categories.find(c => c.category_key === categoryKey);
    return category?.statuses || [];
  }, [categories]);

  // Helper: Check if status belongs to category
  const isStatusInCategory = useCallback((statusKey, categoryKey) => {
    const category = categories.find(c => c.category_key === categoryKey);
    if (!category) return false;
    return category.statuses?.some(s => s.status_key === statusKey) || false;
  }, [categories]);

  // Refresh status configuration (for real-time updates)
  const refresh = useCallback(() => {
    fetchStatusConfig();
  }, [fetchStatusConfig]);

  const value = {
    // Data
    statuses,
    categories,
    entityType,

    // State
    loading,
    error,

    // Helpers
    getStatusByKey,
    getCategoryByKey,
    getStatusesForCategory,
    isStatusInCategory,

    // Actions
    refresh,
  };

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  );
};

/**
 * Hook to access status context
 * Must be used within StatusProvider
 *
 * @returns {Object} Status context value
 * @throws {Error} If used outside StatusProvider
 */
export const useStatus = () => {
  const context = useContext(StatusContext);

  if (!context) {
    throw new Error('useStatus must be used within a StatusProvider');
  }

  return context;
};

export default StatusContext;
