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

  // Dashboard state from config
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
  } = useDashboardData(config);

  // Modal state
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);

  // Date range states for the hero
  const [dateRangeFilter, setDateRangeFilter] = useState('1M');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  // Calendar and archive state (matching Clients)
  const [showCalendar, setShowCalendar] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);

  // LocalStorage persistence for viewMode and scope
  const [persistedViewMode, setPersistedViewMode] = useState(() => {
    const saved = localStorage.getItem(`${config.entity.namePlural}ViewMode`);
    return saved || 'large';
  });

  const [persistedScope, setPersistedScope] = useState(() => {
    const saved = localStorage.getItem(`${config.entity.namePlural}Scope`);
    return saved || 'team';
  });

  // Save viewMode to localStorage
  useEffect(() => {
    localStorage.setItem(`${config.entity.namePlural}ViewMode`, viewMode);
  }, [viewMode, config.entity.namePlural]);

  // Save scope to localStorage
  useEffect(() => {
    localStorage.setItem(`${config.entity.namePlural}Scope`, selectedScope);
  }, [selectedScope, config.entity.namePlural]);

  // Helper to detect preset ranges
  const detectPresetRange = (startDate, endDate) => {
    // Simple implementation - would need to match actual date logic
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          dateRange={dateRange}
          detectPresetRange={detectPresetRange}
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
        />
      </Box>

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
