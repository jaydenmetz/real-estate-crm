import React from 'react';
import { useDashboardData } from '../../../shared/hooks';
import { escrowsService } from '../services/escrows.service';
import { Home, TrendingUp, AttachMoney, CheckCircle } from '@mui/icons-material';

/**
 * useEscrowsData - Specialized hook for escrows dashboard
 * Extends useDashboardData with escrow-specific functionality
 */
export const useEscrowsData = (options = {}) => {
  const {
    status = 'active',
    scope = 'team',
    ...otherOptions
  } = options;

  // Use the shared useDashboardData hook with escrows-specific configuration
  const dashboardData = useDashboardData(
    (params) => {
      // Add escrow-specific parameters
      const escrowParams = {
        ...params,
        status,
        scope
      };
      return escrowsService.getAll(escrowParams);
    },
    {
      queryKey: ['escrows', status, scope],
      defaultFilters: {
        status,
        scope,
        sortBy: 'closing_date',
        sortOrder: 'asc'
      },
      defaultViewMode: 'grid',
      defaultRowsPerPage: 20,
      persistFilters: true,
      staleTime: 30000, // 30 seconds
      gcTime: 600000, // 10 minutes (renamed from cacheTime in v5)
      ...otherOptions
    }
  );

  // Add escrow-specific actions
  const handleArchive = async (id) => {
    try {
      await escrowsService.archive(id);
      dashboardData.refetch();
    } catch (error) {
      console.error('Error archiving escrow:', error);
      throw error;
    }
  };

  const handleRestore = async (id) => {
    try {
      await escrowsService.restore(id);
      dashboardData.refetch();
    } catch (error) {
      console.error('Error restoring escrow:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      await escrowsService.delete(id);
      dashboardData.refetch();
    } catch (error) {
      console.error('Error deleting escrow:', error);
      throw error;
    }
  };

  const handleBulkArchive = async (ids) => {
    try {
      await Promise.all(ids.map(id => escrowsService.archive(id)));
      dashboardData.refetch();
    } catch (error) {
      console.error('Error bulk archiving escrows:', error);
      throw error;
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await escrowsService.bulkDelete(ids);
      dashboardData.refetch();
    } catch (error) {
      console.error('Error bulk deleting escrows:', error);
      throw error;
    }
  };

  // Transform backend stats into stat card format
  const transformedStats = dashboardData.stats ? transformStats(dashboardData.stats) : [];

  // Debug: Log the stats to see what we're getting
  if (dashboardData.stats) {
    console.log('Raw backend stats:', dashboardData.stats);
    console.log('Transformed stats:', transformedStats);
  }

  return {
    ...dashboardData,
    stats: transformedStats,

    // Escrow-specific actions
    actions: {
      archive: handleArchive,
      restore: handleRestore,
      delete: handleDelete,
      bulkArchive: handleBulkArchive,
      bulkDelete: handleBulkDelete
    },

    // Additional escrow-specific data
    status,
    scope
  };
};

/**
 * Transform backend stats into stat card format for DashboardLayout
 */
function transformStats(backendStats) {
  if (Array.isArray(backendStats)) {
    return backendStats; // Already in stat card format
  }

  // Transform backend stats object into stat cards
  return [
    {
      id: 'total',
      label: 'Total Escrows',
      value: backendStats.total || 0,
      format: 'number',
      icon: <Home />,
      color: 'primary.main'
    },
    {
      id: 'active',
      label: 'Active Escrows',
      value: backendStats.active || 0,
      format: 'number',
      change: backendStats.activePercentage || null,
      icon: <TrendingUp />,
      color: 'success.main'
    },
    {
      id: 'activeVolume',
      label: 'Active Volume',
      value: backendStats.activeVolume || 0,
      format: 'currency',
      icon: <AttachMoney />,
      color: 'info.main'
    },
    {
      id: 'closedVolume',
      label: 'Closed Volume',
      value: backendStats.closedVolume || 0,
      format: 'currency',
      icon: <CheckCircle />,
      color: 'warning.main'
    }
  ];
}

export default useEscrowsData;
