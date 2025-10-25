import { useState, useCallback, useEffect } from 'react';
import { useDashboardData } from '../../../shared/hooks/useDashboardData';
import { MODULE_SINGULARService } from '../services/MODULE_SINGULARService';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { toast } from 'react-toastify';

/**
 * MODULE_TITLE Dashboard Hook
 *
 * Manages all state and business logic for the MODULE_TITLE dashboard including:
 * - Data fetching and caching
 * - Search and filtering
 * - CRUD operations
 * - Modal state
 * - Selection state
 * - Real-time updates via WebSocket
 * - Export functionality
 *
 * @param {Object} options - Configuration options
 * @param {string} options.defaultViewMode - Initial view mode ('grid', 'list', 'table', 'calendar')
 * @param {Object} options.defaultFilters - Initial filter values
 * @returns {Object} Dashboard state and actions
 */
export const useMODULE_NAMEDashboard = (options = {}) => {
  const {
    defaultViewMode = 'grid',
    defaultFilters = {}
  } = options;

  // Modal state
  const [modals, setModals] = useState({
    newModal: false,
    editModal: false,
    filtersModal: false,
    selectedItem: null
  });

  // Selection state
  const [selectedItems, setSelectedItems] = useState([]);

  // Dashboard data hook (handles pagination, search, filters, view mode)
  const dashboardData = useDashboardData(
    (params) => MODULE_SINGULARService.getAll(params),
    {
      queryKey: ['MODULE_PLURAL'],
      defaultFilters,
      defaultViewMode,
      persistFilters: true,
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket('MODULE_PLURAL', {
    onMessage: (event) => {
      // Handle real-time updates
      if (event.type === 'MODULE_SINGULAR_created' || event.type === 'MODULE_SINGULAR_updated' || event.type === 'MODULE_SINGULAR_deleted') {
        // Refetch data to show changes
        dashboardData.refetch();

        // Show notification
        const actions = {
          MODULE_SINGULAR_created: 'created',
          MODULE_SINGULAR_updated: 'updated',
          MODULE_SINGULAR_deleted: 'deleted'
        };
        toast.info(`MODULE_NAME ${actions[event.type]}`, { autoClose: 2000 });
      }
    }
  });

  // Clear selection when items change
  useEffect(() => {
    setSelectedItems([]);
  }, [dashboardData.items]);

  // Modal actions
  const openNewModal = useCallback(() => {
    setModals(prev => ({ ...prev, newModal: true, selectedItem: null }));
  }, []);

  const closeNewModal = useCallback(() => {
    setModals(prev => ({ ...prev, newModal: false }));
  }, []);

  const openEditModal = useCallback((item) => {
    setModals(prev => ({ ...prev, editModal: true, selectedItem: item }));
  }, []);

  const closeEditModal = useCallback(() => {
    setModals(prev => ({ ...prev, editModal: false, selectedItem: null }));
  }, []);

  const openFiltersModal = useCallback(() => {
    setModals(prev => ({ ...prev, filtersModal: true }));
  }, []);

  const closeFiltersModal = useCallback(() => {
    setModals(prev => ({ ...prev, filtersModal: false }));
  }, []);

  // CRUD operations
  const handleCreate = useCallback(async (data) => {
    try {
      await MODULE_SINGULARService.create(data);
      toast.success('MODULE_NAME created successfully');
      closeNewModal();
      dashboardData.refetch();
    } catch (error) {
      console.error('Error creating MODULE_SINGULAR:', error);
      toast.error(error.message || 'Failed to create MODULE_SINGULAR');
      throw error;
    }
  }, [dashboardData]);

  const handleUpdate = useCallback(async (id, data) => {
    try {
      await MODULE_SINGULARService.update(id, data);
      toast.success('MODULE_NAME updated successfully');
      closeEditModal();
      dashboardData.refetch();
    } catch (error) {
      console.error('Error updating MODULE_SINGULAR:', error);
      toast.error(error.message || 'Failed to update MODULE_SINGULAR');
      throw error;
    }
  }, [dashboardData]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this MODULE_SINGULAR?')) {
      return;
    }

    try {
      await MODULE_SINGULARService.delete(id);
      toast.success('MODULE_NAME deleted successfully');
      dashboardData.refetch();

      // Remove from selection if selected
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    } catch (error) {
      console.error('Error deleting MODULE_SINGULAR:', error);
      toast.error(error.message || 'Failed to delete MODULE_SINGULAR');
      throw error;
    }
  }, [dashboardData]);

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} MODULE_PLURAL?`)) {
      return;
    }

    try {
      await Promise.all(selectedItems.map(id => MODULE_SINGULARService.delete(id)));
      toast.success(`${selectedItems.length} MODULE_PLURAL deleted successfully`);
      setSelectedItems([]);
      dashboardData.refetch();
    } catch (error) {
      console.error('Error deleting MODULE_PLURAL:', error);
      toast.error(error.message || 'Failed to delete MODULE_PLURAL');
      throw error;
    }
  }, [selectedItems, dashboardData]);

  // Selection actions
  const handleSelectItem = useCallback((id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedItems(dashboardData.items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [dashboardData.items]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Export functionality
  const handleExport = useCallback(async () => {
    try {
      const blob = await MODULE_SINGULARService.export({
        ...dashboardData.filters,
        search: dashboardData.searchTerm
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MODULE_PLURAL_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting MODULE_PLURAL:', error);
      toast.error(error.message || 'Failed to export MODULE_PLURAL');
    }
  }, [dashboardData.filters, dashboardData.searchTerm]);

  return {
    // Data
    items: dashboardData.items,
    stats: dashboardData.stats,
    loading: dashboardData.loading,
    error: dashboardData.error,

    // Pagination
    pagination: {
      page: dashboardData.page,
      totalPages: dashboardData.totalPages,
      totalItems: dashboardData.totalItems,
      itemsPerPage: dashboardData.itemsPerPage,
      onPageChange: dashboardData.setPage,
      onItemsPerPageChange: dashboardData.setItemsPerPage
    },

    // Search & Filters
    searchTerm: dashboardData.searchTerm,
    setSearchTerm: dashboardData.setSearchTerm,
    filters: dashboardData.filters,
    setFilters: dashboardData.setFilters,

    // View Mode
    viewMode: dashboardData.viewMode,
    setViewMode: dashboardData.setViewMode,

    // Modals
    modals,
    openNewModal,
    closeNewModal,
    openEditModal,
    closeEditModal,
    openFiltersModal,
    closeFiltersModal,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleExport,
    handleBulkDelete,

    // Selection
    selectedItems,
    handleSelectItem,
    handleSelectAll,
    clearSelection,

    // WebSocket
    isConnected,

    // Utilities
    refetch: dashboardData.refetch
  };
};
