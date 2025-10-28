import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { DashboardHero } from './components/DashboardHero';
import { DashboardStats } from './components/DashboardStats';
import { DashboardNavigation } from './components/DashboardNavigation';
import { DashboardContent } from './components/DashboardContent';
import DashboardStatCard from './components/DashboardStatCard';
import { useDashboardData } from './hooks/useDashboardData';

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
  NewItemModal,
  customFilters = null,
  customActions = null
}) => {
  // Debug logging
  console.log('[DashboardTemplate] Config received:', config);
  console.log('[DashboardTemplate] Stats config:', config?.dashboard?.stats);

  // Modal state
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);

  // Date range states for the hero
  const [dateRangeFilter, setDateRangeFilter] = useState('1M');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // For YTD year selector

  // Calendar and archive state (matching Clients)
  const [showCalendar, setShowCalendar] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // LocalStorage persistence for viewMode and scope
  const [persistedViewMode, setPersistedViewMode] = useState(() => {
    const saved = localStorage.getItem(`${config.entity.namePlural}ViewMode`);
    return saved || 'large';
  });

  const [persistedScope, setPersistedScope] = useState(() => {
    const saved = localStorage.getItem(`${config.entity.namePlural}Scope`);
    return saved || 'team';
  });

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

  const calculatedDateRange = getCalculatedDateRange();

  // Dashboard state from config (with calculated date range)
  const {
    data,
    loading,
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
  } = useDashboardData(config, calculatedDateRange);

  // Save viewMode to localStorage (after hook declaration)
  useEffect(() => {
    localStorage.setItem(`${config.entity.namePlural}ViewMode`, viewMode);
  }, [viewMode, config.entity.namePlural]);

  // Save scope to localStorage (after hook declaration)
  useEffect(() => {
    localStorage.setItem(`${config.entity.namePlural}Scope`, selectedScope);
  }, [selectedScope, config.entity.namePlural]);

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

  // Batch delete handler for archived items
  const handleBatchDelete = async () => {
    if (!selectedArchivedIds || selectedArchivedIds.length === 0) return;

    setBatchDeleting(true);
    try {
      // Delete all selected items
      await Promise.all(
        selectedArchivedIds.map(id => config.api.delete(id))
      );
      await refetch();
      setSelectedArchivedIds([]);
    } catch (err) {
      console.error(`Failed to batch delete ${config.entity.namePlural}:`, err);
    } finally {
      setBatchDeleting(false);
    }
  };

  // Select all handler
  const handleSelectAll = (checked) => {
    if (checked) {
      const archivedItems = filteredData.filter(item => item.deleted_at || item.deletedAt);
      const allIds = archivedItems.map(item => item[config.api.idField]);
      setSelectedArchivedIds(allIds);
    } else {
      setSelectedArchivedIds([]);
    }
  };

  // Get archived data
  const archivedData = filteredData.filter(item => item.deleted_at || item.deletedAt);

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
      />

        {/* Stats are now embedded in Hero, so no separate stats section needed */}

        {/* Navigation & Filters */}
        <DashboardNavigation
          config={config.dashboard}
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
        />

        {/* Main Content Grid/List */}
        <DashboardContent
          loading={loading}
          error={error}
          data={filteredData}
          viewMode={viewMode}
          CardComponent={CardComponent}
          config={config}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onRestore={handleRestore}
          customActions={customActions}
          selectedStatus={selectedStatus}
          archivedData={archivedData}
          selectedArchivedIds={selectedArchivedIds}
          setSelectedArchivedIds={setSelectedArchivedIds}
          handleBatchDelete={handleBatchDelete}
          batchDeleting={batchDeleting}
          handleSelectAll={handleSelectAll}
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
