import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';

/**
 * useDashboardData - Standardized hook for dashboard data management
 * Handles pagination, filtering, searching, and view modes
 */
export const useDashboardData = (fetchFunction, options = {}) => {
  const {
    queryKey,
    defaultFilters = {},
    defaultViewMode = 'grid',
    defaultRowsPerPage = 20,
    persistFilters = true,
    staleTime = 30000,
    cacheTime = 600000,
    refetchOnWindowFocus = false,
    onSuccess,
    onError
  } = options;

  // State management with optional persistence
  const [filters, setFilters] = persistFilters
    ? useLocalStorage(`${queryKey}-filters`, defaultFilters)
    : useState(defaultFilters);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [selectedItems, setSelectedItems] = useState([]);

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build query parameters
  const queryParams = useMemo(() => ({
    ...filters,
    search: debouncedSearchTerm,
    page,
    limit: rowsPerPage,
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc'
  }), [filters, debouncedSearchTerm, page, rowsPerPage]);

  // React Query setup
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isRefetching
  } = useQuery(
    [queryKey, queryParams],
    () => fetchFunction(queryParams),
    {
      keepPreviousData: true,
      staleTime,
      cacheTime,
      refetchOnWindowFocus,
      onSuccess: (data) => {
        if (onSuccess) onSuccess(data);
      },
      onError: (error) => {
        console.error(`Dashboard data error for ${queryKey}:`, error);
        if (onError) onError(error);
      }
    }
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setSelectedItems([]);
  }, [filters, debouncedSearchTerm]);

  // Handler functions
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, [setFilters]);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleSort = useCallback((field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, [setFilters]);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedItems(data?.items?.map(item => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  }, [data?.items]);

  const handleSelectItem = useCallback((itemId, checked) => {
    setSelectedItems(prev =>
      checked
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  }, []);

  const handleBulkAction = useCallback(async (action, callback) => {
    if (selectedItems.length === 0) return;

    try {
      await callback(selectedItems);
      setSelectedItems([]);
      refetch();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [selectedItems, refetch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchTerm('');
    setPage(1);
  }, [defaultFilters, setFilters]);

  // Export current view data
  const exportData = useCallback(() => {
    const dataToExport = data?.items || [];
    const csv = convertToCSV(dataToExport);
    downloadCSV(csv, `${queryKey}-export.csv`);
  }, [data?.items, queryKey]);

  return {
    // Data
    data: data?.items || [],
    stats: data?.stats || [],

    // Pagination
    pagination: {
      page,
      totalPages: data?.totalPages || 1,
      totalItems: data?.totalItems || 0,
      rowsPerPage,
      onPageChange: setPage,
      onRowsPerPageChange: (value) => {
        setRowsPerPage(value);
        setPage(1);
      }
    },

    // Toolbar
    toolbar: {
      viewMode,
      onViewModeChange: setViewMode,
      searchTerm,
      onSearchChange: handleSearchChange,
      filters,
      onFilterChange: handleFilterChange,
      onSort: handleSort,
      onRefresh: refetch,
      onClearFilters: clearFilters,
      onExport: exportData,
      selectedCount: selectedItems.length,
      emptyMessage: 'No data found',
      emptyAction: null
    },

    // Selection
    selection: {
      selected: selectedItems,
      onSelectAll: handleSelectAll,
      onSelectItem: handleSelectItem,
      onBulkAction: handleBulkAction
    },

    // States
    isLoading,
    isFetching,
    isRefetching,
    error,

    // Actions
    refetch,
    clearFilters,
    exportData
  };
};

// Helper functions
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row =>
    headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export default useDashboardData;
