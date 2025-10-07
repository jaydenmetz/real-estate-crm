import { useState, useEffect, useCallback } from 'react';
import { escrowsAPI } from '../services/api.service';

/**
 * Custom hook for managing escrow data fetching and state
 * Extracted from EscrowsDashboard.jsx for reusability
 *
 * @param {Object} options - Configuration options
 * @param {string} options.status - Filter by status ('active', 'archived', 'all')
 * @param {boolean} options.autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} - Escrows data and control functions
 */
export function useEscrows(options = {}) {
  const { status = 'active', autoFetch = true } = options;

  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch escrows from API
   */
  const fetchEscrows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await escrowsAPI.getAll();

      if (response && response.data) {
        // Filter based on status
        let filteredEscrows = response.data;

        if (status === 'active') {
          filteredEscrows = response.data.filter(e => !e.deleted_at);
        } else if (status === 'archived') {
          filteredEscrows = response.data.filter(e => e.deleted_at);
        }
        // 'all' returns everything

        setEscrows(filteredEscrows);
      }
    } catch (err) {
      console.error('Error fetching escrows:', err);
      setError(err.message || 'Failed to fetch escrows');
      setEscrows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  /**
   * Refresh escrows data
   */
  const refetch = useCallback(() => {
    fetchEscrows();
  }, [fetchEscrows]);

  /**
   * Auto-fetch on mount and when status changes
   */
  useEffect(() => {
    if (autoFetch) {
      fetchEscrows();
    }
  }, [autoFetch, fetchEscrows]);

  return {
    escrows,
    loading,
    error,
    refetch,
    setEscrows, // For manual updates (like after delete)
  };
}
