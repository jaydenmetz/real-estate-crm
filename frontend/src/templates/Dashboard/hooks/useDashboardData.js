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
  const [selectedStatus, setSelectedStatus] = useState(config.dashboard.statusTabs?.[0]?.value || 'all');
  const [selectedScope, setSelectedScope] = useState(config.dashboard.scopeOptions?.[0]?.value || 'all');
  const [viewMode, setViewMode] = useState(config.dashboard.viewModes?.[0]?.value || 'grid');
  const [dateRange, setDateRange] = useState(
    config.dashboard.hero.defaultDateRange
      ? { value: config.dashboard.hero.defaultDateRange, label: config.dashboard.hero.defaultDateRange }
      : { value: '1M', label: '1 Month' }
  );
  const [sortBy, setSortBy] = useState(config.dashboard.sortOptions?.[0]?.value || 'created_at');
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
      // Use config's API endpoint
      const endpoint = config.api.endpoints.list;
      const params = new URLSearchParams();

      // Add filters based on config
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (selectedScope !== 'all') {
        params.append('scope', selectedScope);
      }
      if (dateRange?.value !== 'all') {
        params.append('dateRange', dateRange.value);
      }

      const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;

      // Call the API using config's fetch method
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
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Calculate stats from data
  const stats = useMemo(() => {
    if (!rawData) return {};

    const statsData = {};

    config.dashboard.stats.forEach(statConfig => {
      // Check if stat should be visible for current status
      if (statConfig.visibleWhen && !statConfig.visibleWhen.includes(selectedStatus)) {
        return;
      }

      // Calculate stat value based on field
      let value = 0;

      if (statConfig.field === 'total') {
        value = rawData.length || 0;
      } else if (statConfig.field === 'activeVolume' || statConfig.field === 'closedVolume') {
        // Sum up numeric fields (e.g., purchase prices)
        const statusFilter = statConfig.field === 'activeVolume' ? 'active' : 'closed';
        value = rawData
          .filter(item => item.escrow_status === statusFilter || item.status === statusFilter)
          .reduce((sum, item) => sum + (parseFloat(item.purchase_price || item.value || 0)), 0);
      } else if (statConfig.calculation) {
        // Custom calculation function
        value = statConfig.calculation(rawData);
      } else {
        // Direct field access
        value = rawData[statConfig.field] || 0;
      }

      // Calculate trend (simple: compare to previous period - would need historical data in real implementation)
      const trend = Math.random() > 0.5 ? 'up' : 'down'; // Mock trend
      const trendValue = (Math.random() * 20).toFixed(1); // Mock trend percentage

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

    let filtered = [...rawData];

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
    if (sortBy && config.utils.sortBy) {
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
