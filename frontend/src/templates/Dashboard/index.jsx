import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container } from '@mui/material';
import { DashboardHero } from './components/DashboardHero';
import { DashboardStats } from './components/DashboardStats';
import { DashboardNavigation } from './components/DashboardNavigation';
import { DashboardContent } from './components/DashboardContent';
import DashboardStatCard from './components/DashboardStatCard';
import { useDashboardData } from './hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContext';

/**
 * DashboardTemplate - Config-driven dashboard component
 *
 * Usage:
 * import { DashboardTemplate } from '@/templates/Dashboard';
 * import { escrowsConfig } from '@/config/entities/escrows.config';
 *
 * const EscrowsDashboard = () => (
 *   <DashboardTemplate
 *     config={escrowsConfig}
 *     CardComponent={EscrowCard}
 *     NewItemModal={NewEscrowModal}
 *   />
 * );
 */
export const DashboardTemplate = ({
  config,
  CardComponent,
  ListComponent = null, // Optional list view component
  TableComponent = null, // Optional table view component
  NewItemModal,
  customFilters = null,
  customActions = null,
  NavigationComponent = null // Optional custom navigation component
}) => {
  // Auth context for personalized scope options
  const { user } = useAuth();

  // Debug logging
  console.log('[DashboardTemplate] Config received:', config);
  console.log('[DashboardTemplate] Stats config:', config?.dashboard?.stats);

  // Generate scope options from config (can be function or array)
  const scopeOptions = useMemo(() => {
    if (typeof config.dashboard?.getScopeOptions === 'function') {
      return config.dashboard.getScopeOptions(user);
    }
    return config.dashboard?.scopeOptions || [];
  }, [config.dashboard, user]);

  // Modal state
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);

  // Date range states for the hero
  const [dateRangeFilter, setDateRangeFilter] = useState(null); // Default to null (no date filtering)
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // For YTD year selector

  // Calendar and archive state (matching Clients)
  const [showCalendar, setShowCalendar] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [batchRestoring, setBatchRestoring] = useState(false);

  // Archive year filtering
  const [archiveYear, setArchiveYear] = useState('all'); // 'all', 2025, 2024, 2023, etc.

  // Generate year options for archive view (current year back to 5 years ago)
  const archiveYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [{ value: 'all', label: 'All Time' }];
    for (let i = 0; i < 6; i++) {
      const year = currentYear - i;
      years.push({ value: year, label: String(year) });
    }
    return years;
  }, []);

  // Multi-select state
  const [selectedItems, setSelectedItems] = useState([]);

  // Multi-select handlers
  const handleSelectItem = (item) => {
    const itemId = item[config.api?.idField || 'id'];
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleSelectAll = () => {
    // Get the current data based on view
    const currentData = selectedStatus === 'archived' ? (archivedData || []) : (data || []);

    if (selectedItems.length === currentData.length && currentData.length > 0) {
      // All selected - unselect all
      setSelectedItems([]);
    } else {
      // Not all selected - select all
      const allIds = currentData.map(item => item[config.api?.idField || 'id']);
      setSelectedItems(allIds);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedItems.length === 0 || !config.api?.archive) return;

    try {
      await Promise.all(selectedItems.map(id => config.api.archive(id)));
      setSelectedItems([]);
      refetch();
    } catch (error) {
      console.error('Bulk archive failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0 || !config.api?.delete) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${selectedItems.length} item(s)? This cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await Promise.all(selectedItems.map(id => config.api.delete(id)));
      setSelectedItems([]);
      refetch();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedItems.length === 0 || !config.api?.restore) return;

    try {
      await Promise.all(selectedItems.map(id => config.api.restore(id)));
      setSelectedItems([]);
      refetch();
    } catch (error) {
      console.error('Bulk restore failed:', error);
    }
  };

  // Calculate date range based on filter or custom dates (matching Clients)
  const getCalculatedDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    // Use custom dates if both are set
    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      // Use preset range
      switch(dateRangeFilter) {
        case '1D':
          // Today from 12:00 AM to 11:59 PM
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1M':
          // Last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case '1Y':
          // Last 365 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          endDate = now;
          break;
        case 'YTD':
          // Year to date - using selected year
          startDate = new Date(selectedYear, 0, 1);
          // If selected year is current year, end date is today
          // If selected year is past year, end date is Dec 31 of that year
          if (selectedYear === now.getFullYear()) {
            endDate = now;
          } else {
            endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
          }
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
      }
    }

    // Validate dates
    const validStart = startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate : new Date();
    const validEnd = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : new Date();

    // Format label - special case for YTD to show year
    let label;
    if (dateRangeFilter === 'YTD') {
      label = `${selectedYear} YTD`;
    } else {
      label = `${validStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${validEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    return {
      startDate: validStart,
      endDate: validEnd,
      label: label
    };
  };

  // Only calculate date range if user has explicitly selected one (not by default)
  const calculatedDateRange = dateRangeFilter || (customStartDate && customEndDate)
    ? getCalculatedDateRange()
    : null;

  // Dashboard state from config (with calculated date range)
  const {
    data,
    loading,
    error,
    stats,
    selectedStatus,
    setSelectedStatus: setSelectedStatusOriginal,
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
  } = useDashboardData(config, calculatedDateRange);

  // Wrapper for setSelectedStatus that also changes viewMode based on tab's preferredViewMode
  const setSelectedStatus = (newStatus) => {
    // Find the tab config for this status
    const statusTab = config.dashboard?.statusTabs?.find(tab => tab.value === newStatus);

    // If tab has a preferredViewMode, switch to it
    if (statusTab?.preferredViewMode) {
      setViewMode(statusTab.preferredViewMode);
    }

    // Update the status
    setSelectedStatusOriginal(newStatus);
  };

  // Helper to detect preset ranges (matching Clients)
  const detectPresetRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const now = new Date();
    const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Check if it's today
    const isToday = startDate.toDateString() === now.toDateString() &&
                    endDate.toDateString() === now.toDateString();
    if (isToday) return '1D';

    // Check if it's last 30 days
    if (diffDays >= 29 && diffDays <= 31) return '1M';

    // Check if it's last 365 days
    if (diffDays >= 364 && diffDays <= 366) return '1Y';

    // Check if it's YTD
    const ytdStart = new Date(now.getFullYear(), 0, 1);
    const isYTD = Math.abs(startDate - ytdStart) < 86400000; // Within 1 day
    if (isYTD && Math.abs(endDate - now) < 86400000) return 'YTD';

    return null;
  };

  // CRUD handlers
  const handleCreate = async (itemData) => {
    try {
      await config.api.create(itemData);
      await refetch();
      setNewItemModalOpen(false);
    } catch (err) {
      console.error(`Failed to create ${config.entity.name}:`, err);
    }
  };

  const handleUpdate = async (id, updates) => {
    console.log('🟡 DashboardTemplate handleUpdate called:', {
      id,
      updates,
      idType: typeof id,
      updatesType: typeof updates,
      entity: config.entity.name
    });
    try {
      await config.api.update(id, updates);
      await refetch();
    } catch (err) {
      console.error(`Failed to update ${config.entity.name}:`, err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await config.api.delete(id);
      await refetch();
    } catch (err) {
      console.error(`Failed to delete ${config.entity.name}:`, err);
    }
  };

  const handleArchive = async (id) => {
    try {
      await config.api.archive(id);
      await refetch();
    } catch (err) {
      console.error(`Failed to archive ${config.entity.name}:`, err);
    }
  };

  const handleRestore = async (id) => {
    try {
      await config.api.restore(id);
      await refetch();
    } catch (err) {
      console.error(`Failed to restore ${config.entity.name}:`, err);
    }
  };

  // Batch restore handler for archived items
  const handleBatchRestore = async () => {
    if (!selectedItems || selectedItems.length === 0) return;

    setBatchRestoring(true);
    try {
      // Restore all selected items
      await Promise.all(
        selectedItems.map(id => config.api.restore(id))
      );
      await refetch();
      setSelectedItems([]);
    } catch (err) {
      console.error(`Failed to batch restore ${config.entity.namePlural}:`, err);
    } finally {
      setBatchRestoring(false);
    }
  };

  // Batch delete handler for archived items
  const handleBatchDelete = async () => {
    if (!selectedItems || selectedItems.length === 0) return;

    setBatchDeleting(true);
    try {
      // Delete all selected items
      await Promise.all(
        selectedItems.map(id => config.api.delete(id))
      );
      await refetch();
      setSelectedItems([]);
    } catch (err) {
      console.error(`Failed to batch delete ${config.entity.namePlural}:`, err);
    } finally {
      setBatchDeleting(false);
    }
  };

  // Select all archived items handler
  const handleSelectAllArchived = (checked) => {
    if (checked) {
      // Use year-filtered archived data
      const allIds = archivedDataFiltered.map(item => item[config.api.idField]);
      setSelectedArchivedIds(allIds);
    } else {
      setSelectedArchivedIds([]);
    }
  };

  // Get archived data
  // When selectedStatus === 'archived', the backend already returns archived items only
  // So we use rawData directly (which is already filtered by backend)
  const archivedData = useMemo(() => {
    if (selectedStatus === 'archived') {
      // Data from backend is already archived-only
      return Array.isArray(data) ? data : [];
    }
    // For other statuses, filter from filteredData (shouldn't have archived items anyway)
    return filteredData.filter(item =>
      item.is_archived === true ||
      item.isArchived === true ||
      // Fallback for legacy data during migration
      item.deleted_at ||
      item.deletedAt
    );
  }, [data, filteredData, selectedStatus]);

  // Filter archived data by selected year
  const archivedDataFiltered = useMemo(() => {
    if (archiveYear === 'all') {
      return archivedData;
    }

    // Filter by year from archived_at timestamp
    return archivedData.filter(item => {
      const archivedAt = item.archived_at || item.archivedAt || item.deleted_at || item.deletedAt;
      if (!archivedAt) return false;

      const itemYear = new Date(archivedAt).getFullYear();
      return itemYear === archiveYear;
    });
  }, [archivedData, archiveYear]);

  // Update archived count whenever data changes
  useEffect(() => {
    setArchivedCount(archivedData.length);
  }, [archivedData.length]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Card with embedded stats - ClientHeroCard style */}
      <DashboardHero
        config={{
          title: config.entity.labelPlural,
          subtitle: `Manage your ${config.entity.namePlural}`,
          gradient: `linear-gradient(135deg, ${config.entity.colorGradient.start} 0%, ${config.entity.colorGradient.end} 100%)`,
          entitySingular: config.entity.label,
          showAnalyticsButton: config.dashboard.hero.showAnalyticsButton,
          analyticsButtonLabel: config.dashboard.hero.analyticsButtonLabel,
          addButtonLabel: config.dashboard.hero.addButtonLabel,
          showAIAssistant: config.dashboard.hero.showAIAssistant,
          aiAssistantLabel: config.dashboard.hero.aiAssistantLabel,
          aiAssistantDescription: config.dashboard.hero.aiAssistantDescription,
        }}
        stats={stats}
        statsConfig={config.dashboard.stats}
        selectedStatus={selectedStatus}
        onNewItem={config.dashboard.hero.showAddButton ? () => setNewItemModalOpen(true) : null}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        dateRange={calculatedDateRange}
        detectPresetRange={detectPresetRange}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        StatCardComponent={DashboardStatCard}
        allData={data}
      />

        {/* Stats are now embedded in Hero, so no separate stats section needed */}

        {/* Navigation & Filters - Use custom component if provided, otherwise use default */}
        {NavigationComponent ? (
          <NavigationComponent
            config={{
              ...config.dashboard,
              scopeOptions: scopeOptions // Override with generated scope options
            }}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            showCalendar={showCalendar}
            onShowCalendarChange={setShowCalendar}
            archivedCount={archivedCount}
            selectedItems={selectedItems}
            totalCount={data?.length || 0}
            onClearSelection={handleClearSelection}
            onSelectAll={handleSelectAll}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
            onBulkRestore={handleBulkRestore}
            bulkActions={config.dashboard?.bulkActions || []}
          />
        ) : (
          <DashboardNavigation
            config={{
              ...config.dashboard,
              scopeOptions: scopeOptions // Override with generated scope options
            }}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            showCalendar={showCalendar}
            onShowCalendarChange={setShowCalendar}
            archivedCount={archivedCount}
            selectedItems={selectedItems}
            totalCount={selectedStatus === 'archived' ? archivedData?.length || 0 : data?.length || 0}
            onClearSelection={handleClearSelection}
            onSelectAll={handleSelectAll}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
            onBulkRestore={handleBulkRestore}
            bulkActions={config.dashboard?.bulkActions || []}
          />
        )}

        {/* Main Content Grid/List */}
        <DashboardContent
          loading={loading}
          error={error}
          data={filteredData}
          viewMode={viewMode}
          CardComponent={CardComponent}
          ListComponent={ListComponent}
          TableComponent={TableComponent}
          config={config}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onRestore={handleRestore}
          customActions={customActions}
          selectedStatus={selectedStatus}
          archivedData={archivedDataFiltered}
          handleBatchDelete={handleBatchDelete}
          handleBatchRestore={handleBatchRestore}
          batchDeleting={batchDeleting}
          batchRestoring={batchRestoring}
          handleSelectAll={handleSelectAll}
          handleClearSelection={handleClearSelection}
          selectedYear={archiveYear}
          onYearChange={setArchiveYear}
          yearOptions={archiveYearOptions}
          isSelectable={config.dashboard?.enableMultiSelect || false}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
        />

      {/* New Item Modal */}
      {NewItemModal && (
        <NewItemModal
          open={newItemModalOpen}
          onClose={() => setNewItemModalOpen(false)}
          onCreate={handleCreate}
          config={config}
        />
      )}
    </Container>
  );
};

export default DashboardTemplate;
