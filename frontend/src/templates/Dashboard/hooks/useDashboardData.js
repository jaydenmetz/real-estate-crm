import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * useDashboardData - Config-driven data fetching and state management
 *
 * @param {Object} config - Entity configuration from config/entities
 * @returns {Object} Dashboard state and handlers
 */
export const useDashboardData = (config) => {
  // State management
  const [selectedStatus, setSelectedStatus] = useState(config.dashboard?.statusTabs?.[0]?.value || 'all');
  const [selectedScope, setSelectedScope] = useState(config.dashboard?.scopeOptions?.[0]?.value || 'all');
  const [viewMode, setViewMode] = useState(config.dashboard?.viewModes?.[0]?.value || 'grid');
  const [dateRange, setDateRange] = useState(
    config.dashboard?.hero?.defaultDateRange
      ? { value: config.dashboard.hero.defaultDateRange, label: config.dashboard.hero.defaultDateRange }
      : { value: '1M', label: '1 Month' }
  );
  const [sortBy, setSortBy] = useState(config.dashboard?.sortOptions?.[0]?.value || 'created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch data using React Query
  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [config.entity.namePlural, selectedStatus, selectedScope, dateRange],
    queryFn: async () => {
      // Build query params
      const params = {};

      // Add filters based on config
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      if (selectedScope !== 'all') {
        params.scope = selectedScope;
      }
      if (dateRange?.value !== 'all') {
        params.dateRange = dateRange.value;
      }

      // Use config's API method if available, otherwise fallback to fetch
      if (config.api.getAll) {
        const result = await config.api.getAll(params);
        return result.data || result;
      } else {
        // Fallback to fetch
        const endpoint = config.api.endpoints.list;
        const queryString = new URLSearchParams(params).toString();
        const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${config.entity.namePlural}`);
        }

        const result = await response.json();
        return result.data || result;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Calculate stats from data
  const stats = useMemo(() => {
    if (!rawData) return {};

    // Ensure rawData is an array
    const dataArray = Array.isArray(rawData) ? rawData : [];

    if (!Array.isArray(rawData)) {
      console.warn('[useDashboardData] rawData is not an array:', rawData);
    }

    const statsData = {};

    // Safety check - ensure stats config exists and is an array
    if (!config.dashboard?.stats || !Array.isArray(config.dashboard.stats)) {
      console.warn('[useDashboardData] config.dashboard.stats is not an array:', config.dashboard?.stats);
      return {};
    }

    // Helper functions for common calculations
    const helpers = {
      // Count items by status
      countByStatus: (status) => {
        return dataArray.filter(item => {
          const itemStatus = item.escrow_status || item.status || item.lead_status || item.appointment_status || item.client_status;
          return itemStatus?.toLowerCase() === status.toLowerCase();
        }).length;
      },

      // Sum numeric field by status
      sumByStatus: (status, field) => {
        return dataArray
          .filter(item => {
            const itemStatus = item.escrow_status || item.status || item.lead_status || item.appointment_status || item.client_status;
            return itemStatus?.toLowerCase() === status.toLowerCase();
          })
          .reduce((sum, item) => sum + (parseFloat(item[field] || 0)), 0);
      },

      // Calculate average of a numeric field
      average: (field, filterFn) => {
        const filtered = filterFn ? dataArray.filter(filterFn) : dataArray;
        if (filtered.length === 0) return 0;
        const sum = filtered.reduce((acc, item) => acc + (parseFloat(item[field] || 0)), 0);
        return sum / filtered.length;
      },

      // Calculate average days between two date fields
      averageDaysBetween: (startField, endField) => {
        const items = dataArray.filter(item => item[startField] && item[endField]);
        if (items.length === 0) return 0;

        const totalDays = items.reduce((acc, item) => {
          const start = new Date(item[startField]);
          const end = new Date(item[endField]);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0);

        return Math.round(totalDays / items.length);
      },
    };

    config.dashboard.stats.forEach(statConfig => {
      // Check if stat should be visible for current status
      if (statConfig.visibleWhen && !statConfig.visibleWhen.includes(selectedStatus)) {
        return;
      }

      // Calculate stat value based on field
      let value = 0;

      if (statConfig.calculation) {
        // Custom calculation function (receives dataArray and helpers)
        value = statConfig.calculation(dataArray, helpers);
      } else if (statConfig.field === 'total') {
        // Total count
        value = dataArray.length || 0;
      } else if (statConfig.field === 'active') {
        // Active count
        value = helpers.countByStatus('active');
      } else if (statConfig.field === 'activeVolume') {
        // Active volume sum
        value = helpers.sumByStatus('active', 'purchase_price');
      } else if (statConfig.field === 'closedVolume') {
        // Closed volume sum
        value = helpers.sumByStatus('closed', 'purchase_price');
      } else if (statConfig.field === 'avgDaysToClose') {
        // Average days to close
        value = helpers.averageDaysBetween('offer_date', 'closing_date');
      } else if (statConfig.aggregation === 'sum') {
        // Sum of field
        value = dataArray.reduce((sum, item) => sum + (parseFloat(item[statConfig.field] || 0)), 0);
      } else if (statConfig.aggregation === 'avg') {
        // Average of field
        value = helpers.average(statConfig.field);
      } else if (statConfig.aggregation === 'count') {
        // Count items with non-null field
        value = dataArray.filter(item => item[statConfig.field]).length;
      } else {
        // Direct field access
        value = dataArray[statConfig.field] || 0;
      }

      // Calculate trend (would need historical data in real implementation)
      const trend = Math.random() > 0.5 ? 'up' : 'down';
      const trendValue = (Math.random() * 20).toFixed(1);

      statsData[statConfig.id] = {
        label: statConfig.label,
        value: value,
        format: statConfig.format || 'number',
        icon: statConfig.icon,
        goal: statConfig.goal,
        showGoal: statConfig.showGoal,
        trend: trend,
        trendValue: trendValue,
      };
    });

    return statsData;
  }, [rawData, selectedStatus, config.dashboard.stats]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!rawData) return [];

    // Ensure rawData is an array before spreading
    const dataArray = Array.isArray(rawData) ? rawData : [];
    let filtered = [...dataArray];

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => {
        const statusField = item.escrow_status || item.status || item.lead_status || item.appointment_status;
        return statusField === selectedStatus;
      });
    }

    // Apply scope filter
    if (selectedScope !== 'all') {
      filtered = filtered.filter(item => {
        // Scope filtering logic depends on entity
        // For now, just return all (would need config-specific logic)
        return true;
      });
    }

    // Apply sorting
    if (sortBy && config.utils?.sortBy) {
      filtered = config.utils.sortBy(filtered, sortBy, sortOrder);
    } else {
      // Default sorting
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const order = sortOrder === 'asc' ? 1 : -1;

        if (typeof aVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }
        return (aVal - bVal) * order;
      });
    }

    return filtered;
  }, [rawData, selectedStatus, selectedScope, sortBy, sortOrder, config.utils]);

  return {
    data: rawData,
    loading: isLoading,
    error,
    stats,
    selectedStatus,
    setSelectedStatus,
    selectedScope,
    setSelectedScope,
    viewMode,
    setViewMode,
    dateRange,
    setDateRange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData,
    refetch,
  };
};

export default useDashboardData;
