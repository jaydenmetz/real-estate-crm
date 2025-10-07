import { useState, useCallback } from 'react';

/**
 * Custom hook for managing escrow filter state
 * Extracted from EscrowsDashboard.jsx for reusability
 *
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - Filter state and control functions
 */
export function useEscrowFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    selectedStatus: 'active',
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialFilters,
  });

  /**
   * Update a single filter value
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Reset filters to initial values
   */
  const resetFilters = useCallback(() => {
    setFilters({
      selectedStatus: 'active',
      searchQuery: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      ...initialFilters,
    });
  }, [initialFilters]);

  /**
   * Filter escrows based on current filter state
   */
  const filterEscrows = useCallback((escrows) => {
    let filtered = [...escrows];

    // Filter by status
    if (filters.selectedStatus && filters.selectedStatus !== 'all') {
      filtered = filtered.filter(e => {
        if (filters.selectedStatus === 'active') return !e.deleted_at;
        if (filters.selectedStatus === 'archived') return e.deleted_at;
        return e.escrow_status === filters.selectedStatus;
      });
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.property_address?.toLowerCase().includes(query) ||
        e.buyer_name?.toLowerCase().includes(query) ||
        e.seller_name?.toLowerCase().includes(query) ||
        e.escrow_number?.toLowerCase().includes(query)
      );
    }

    // Sort escrows
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy];
      const bVal = b[filters.sortBy];

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    filterEscrows,
  };
}
