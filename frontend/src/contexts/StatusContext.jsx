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

import React, { createContext, useContext, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStatuses, getStatusCategories } from '../services/statuses.service';

export const StatusContext = createContext(null);

/**
 * Status Provider Component
 * Fetches status configuration from database and provides to children
 * Uses React Query for automatic caching and deduplication
 *
 * @param {ReactNode} children - Child components
 * @param {string} entityType - escrows, listings, clients, leads, appointments
 */
export const StatusProvider = ({ children, entityType }) => {
  // Fetch statuses with React Query (automatic caching!)
  const {
    data: statuses = [],
    isLoading: statusesLoading,
    error: statusesError,
    refetch: refetchStatuses
  } = useQuery({
    queryKey: ['statuses', entityType],
    queryFn: () => getStatuses(entityType),
    enabled: !!entityType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch categories with React Query (automatic caching!)
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['statusCategories', entityType],
    queryFn: () => getStatusCategories(entityType),
    enabled: !!entityType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const loading = statusesLoading || categoriesLoading;
  const error = statusesError || categoriesError;

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
    refetchStatuses();
    refetchCategories();
  }, [refetchStatuses, refetchCategories]);

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
