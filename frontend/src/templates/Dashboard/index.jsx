import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container } from '@mui/material';
import { DashboardHero } from './components/DashboardHero';
import { DashboardStats } from './components/DashboardStats';
import { DashboardNavigation } from './components/DashboardNavigation';
import { DashboardContent } from './components/DashboardContent';
import DashboardStatCard from '../../components/common/ui/DashboardStatCard';
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
  NavigationComponent = null, // Optional custom navigation component
  HeroComponent = null // Optional custom hero component (e.g., carousel wrapper)
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

  // Helper function: Get default date range for a category tab
  const getDefaultDateRange = (status) => {
    // Extract category key from status (format: "active:status1,status2" or just "active")
    const categoryKey = status?.includes(':') ? status.split(':')[0] : status;

    // Check localStorage first (user's last selection for this category)
    const savedFilter = localStorage.getItem(`${config.entity.namePlural}DateFilter_${categoryKey}`);
    if (savedFilter && savedFilter !== 'null') return savedFilter;

    // Category-specific defaults (if no saved preference)
    // Using category_key from database: active, won, lost, all
    const lowerCategory = categoryKey?.toLowerCase();
    if (lowerCategory === 'active') return '1D'; // 1 Day for Active
    if (lowerCategory === 'won' || lowerCategory === 'closed') return '1Y'; // 1 Year for Closed/Won
    if (lowerCategory === 'lost' || lowerCategory === 'cancelled') return '1Y'; // 1 Year for Cancelled/Lost
    if (lowerCategory === 'all') return null; // All tab = no date filtering
    return null; // Default = no filtering
  };

  // Date range states for the hero
  // Initialize with correct default based on initial status tab (matching useDashboardData logic)
  const [dateRangeFilter, setDateRangeFilter] = useState(() => {
    // Determine initial status the same way useDashboardData does
    const saved = localStorage.getItem(`${config.entity.namePlural}Status`);
    const validStatuses = config.dashboard?.statusTabs?.map(tab => tab.value) || [];
    const savedTabName = saved?.includes(':') ? saved.split(':')[0] : saved;
    const isValidStatus = saved && validStatuses.includes(savedTabName);
    const initialStatus = isValidStatus
      ? saved
      : (config.dashboard?.defaultStatus || config.dashboard?.statusTabs?.[0]?.value || 'All');

    // Get default date range for initial status
    return getDefaultDateRange(initialStatus);
  });
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // For YTD year selector

  // Calendar and archive state (matching Clients)
  const [showCalendar, setShowCalendar] = useState(false);
  const [showArchived, setShowArchived] = useState(false); // Archive toggle filter
  const [archivedCount, setArchivedCount] = useState(0);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [batchRestoring, setBatchRestoring] = useState(false);

  // Track last viewed timestamps for archived items per status (for badge counts)
  const [lastViewedArchived, setLastViewedArchived] = useState(() => {
    const saved = localStorage.getItem(`${config.entity.namePlural}LastViewedArchived`);
    return saved ? JSON.parse(saved) : {};
  });

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
    const currentData = data || [];

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

  // Memoize calculated date range to prevent infinite re-renders
  // This is critical - without memoization, new Date objects are created every render,
  // causing React Query to refetch infinitely
  const calculatedDateRange = useMemo(() => {
    // Only calculate if user has explicitly selected a date range
    if (!dateRangeFilter && !(customStartDate && customEndDate)) {
      return null;
    }

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
  }, [dateRangeFilter, customStartDate, customEndDate, selectedYear]);

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
  } = useDashboardData(config, calculatedDateRange, showArchived);

  // Wrapper for setSelectedStatus that also changes viewMode based on tab's preferredViewMode or defaultViewMode object
  const setSelectedStatus = (newStatus) => {
    // Find the tab config for this status
    const statusTab = config.dashboard?.statusTabs?.find(tab => tab.value === newStatus);

    // Check if tab has a preferredViewMode (legacy)
    if (statusTab?.preferredViewMode) {
      setViewMode(statusTab.preferredViewMode);
    }
    // Or check if defaultViewMode is an object with per-tab defaults
    else if (config.dashboard?.defaultViewMode && typeof config.dashboard.defaultViewMode === 'object') {
      const tabDefaultView = config.dashboard.defaultViewMode[newStatus];
      if (tabDefaultView) {
        setViewMode(tabDefaultView);
      }
    }

    // Update the status
    setSelectedStatusOriginal(newStatus);
  };

  // Initialize date range when component mounts or status changes
  useEffect(() => {
    const defaultRange = getDefaultDateRange(selectedStatus);
    setDateRangeFilter(defaultRange);
    // Clear custom dates when switching status tabs
    setCustomStartDate(null);
    setCustomEndDate(null);
    // Reset archive view when switching tabs (always start with non-archived view)
    setShowArchived(false);
  }, [selectedStatus, config.entity.namePlural]);

  // Save date range preference to localStorage when it changes
  useEffect(() => {
    // Extract category key for localStorage (not the full "active:status1,status2")
    const categoryKey = selectedStatus?.includes(':') ? selectedStatus.split(':')[0] : selectedStatus;
    if (dateRangeFilter) {
      localStorage.setItem(
        `${config.entity.namePlural}DateFilter_${categoryKey}`,
        dateRangeFilter
      );
    } else {
      // Remove from localStorage if filter is cleared
      localStorage.removeItem(`${config.entity.namePlural}DateFilter_${categoryKey}`);
    }
  }, [dateRangeFilter, selectedStatus, config.entity.namePlural]);

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
    console.log('🟡 [DashboardTemplate] handleUpdate called:', {
      id,
      updates,
      idType: typeof id,
      updatesType: typeof updates,
      entity: config.entity.name
    });
    try {
      const result = await config.api.update(id, updates);
      console.log('✅ [DashboardTemplate] API update successful:', result);

      console.log('🔄 [DashboardTemplate] Calling refetch...');
      const refetchResult = await refetch();
      console.log('✅ [DashboardTemplate] Refetch completed:', {
        dataLength: refetchResult?.data?.length,
        firstItem: refetchResult?.data?.[0]
      });
    } catch (err) {
      console.error(`❌ [DashboardTemplate] Failed to update ${config.entity.name}:`, err);
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

  // Handle archive toggle - acknowledge viewed when opening archive view
  const handleShowArchivedChange = (newShowArchived) => {
    setShowArchived(newShowArchived);

    // If opening archive view, mark current status as acknowledged
    if (newShowArchived) {
      const updated = {
        ...lastViewedArchived,
        [selectedStatus]: Date.now(),
      };
      setLastViewedArchived(updated);
      localStorage.setItem(`${config.entity.namePlural}LastViewedArchived`, JSON.stringify(updated));
    }
  };

  // Get archived data count for archive button badge
  // Filter from filteredData to get archived items (for badge count only)
  const archivedData = useMemo(() => {
    return filteredData.filter(item =>
      item.is_archived === true ||
      item.isArchived === true ||
      // Fallback for legacy data during migration
      item.deleted_at ||
      item.deletedAt
    );
  }, [filteredData]);

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

  // Calculate unacknowledged archived count for current status only
  useEffect(() => {
    // Get last viewed timestamp for current status
    const lastViewed = lastViewedArchived[selectedStatus] || 0;

    // Count archived items for current status that were archived after last viewed
    const unacknowledgedCount = archivedData.filter(item => {
      // Check if item matches current status
      const itemStatus = item.escrow_status || item.status || item.lead_status || item.appointment_status || item.client_status;
      const matchesStatus = selectedStatus === 'All' || itemStatus?.toLowerCase() === selectedStatus.toLowerCase();

      if (!matchesStatus) return false;

      // Check if archived after last viewed
      const archivedAt = item.archived_at || item.archivedAt || item.deleted_at || item.deletedAt;
      if (!archivedAt) return false;

      const archivedTimestamp = new Date(archivedAt).getTime();
      return archivedTimestamp > lastViewed;
    }).length;

    setArchivedCount(unacknowledgedCount);
  }, [archivedData, selectedStatus, lastViewedArchived]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Card with embedded stats - ClientHeroCard style */}
      {/* Render custom hero component if provided, otherwise render default DashboardHero */}
      {HeroComponent ? (
        <HeroComponent
          config={{
            title: config.entity.labelPlural,
            subtitle: `Manage your ${config.entity.namePlural}`,
            gradient: `linear-gradient(135deg, ${config.entity.colorGradient.start} 0%, ${config.entity.colorGradient.end} 100%)`,
            entitySingular: config.entity.label,
            showAnalyticsButton: config.dashboard.hero.showAnalyticsButton,
            analyticsButtonLabel: config.dashboard.hero.analyticsButtonLabel,
            addButtonLabel: config.dashboard.hero.addButtonLabel,
            showAIAssistant: config.dashboard.hero.showAIAssistant,
            aiAssistantWidget: config.dashboard.hero.aiAssistantWidget,
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
          allData={filteredData}
          // Hero layout mode props
          heroLayoutMode={config.dashboard.hero.layoutMode || 'cards'}
          sphereData={config.dashboard.hero.sphereData}
          onSphereClick={config.dashboard.hero.onSphereClick}
          aiCoachConfig={config.dashboard.hero.aiCoachConfig}
        />
      ) : (
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
            aiAssistantWidget: config.dashboard.hero.aiAssistantWidget,
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
          allData={filteredData}
          // Hero layout mode props
          heroLayoutMode={config.dashboard.hero.layoutMode || 'cards'}
          sphereData={config.dashboard.hero.sphereData}
          onSphereClick={config.dashboard.hero.onSphereClick}
          aiCoachConfig={config.dashboard.hero.aiCoachConfig}
        />
      )}

        {/* Stats are now embedded in Hero, so no separate stats section needed */}

        {/* Navigation & Filters - Use custom component if provided, otherwise use default */}
        {NavigationComponent ? (
          <NavigationComponent
            config={{
              ...config.dashboard,
              entity: config.entity, // Include entity for dropdown navigation
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
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            showCalendar={showCalendar}
            onShowCalendarChange={setShowCalendar}
            showArchived={showArchived}
            onShowArchivedChange={handleShowArchivedChange}
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
              entity: config.entity, // Include entity for dropdown navigation
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
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            showCalendar={showCalendar}
            onShowCalendarChange={setShowCalendar}
            showArchived={showArchived}
            onShowArchivedChange={handleShowArchivedChange}
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
          showArchived={showArchived}
          selectedYear={archiveYear}
          onYearChange={setArchiveYear}
          yearOptions={archiveYearOptions}
          isSelectable={config.dashboard?.enableMultiSelect || false}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          dateRangeFilter={dateRangeFilter}
          customStartDate={calculatedDateRange?.startDate || customStartDate}
          customEndDate={calculatedDateRange?.endDate || customEndDate}
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
