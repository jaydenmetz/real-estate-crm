import { useDashboardData } from '../../../shared/hooks';
import { escrowsService } from '../services/escrows.service';

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
      cacheTime: 600000, // 10 minutes
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

  return {
    ...dashboardData,

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

export default useEscrowsData;
