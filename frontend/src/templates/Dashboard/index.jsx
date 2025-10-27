import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { DashboardHero } from './components/DashboardHero';
import { DashboardStats } from './components/DashboardStats';
import { DashboardNavigation } from './components/DashboardNavigation';
import { DashboardContent } from './components/DashboardContent';
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
        {/* Hero Card */}
        <DashboardHero
          config={{
            title: config.entity.labelPlural,
            subtitle: `Manage your ${config.entity.namePlural}`,
            gradient: `linear-gradient(135deg, ${config.entity.colorGradient.start} 0%, ${config.entity.colorGradient.end} 100%)`,
            entitySingular: config.entity.label,
            showDateRange: config.dashboard.hero.dateRangeFilters?.length > 0,
            showScope: config.dashboard.scopeOptions?.length > 0,
          }}
          onNewItem={config.dashboard.hero.showAddButton ? () => setNewItemModalOpen(true) : null}
          dateRange={dateRange}
          scope={selectedScope}
        />

        {/* Stats Cards */}
        {config.dashboard?.stats && Array.isArray(config.dashboard.stats) && config.dashboard.stats.length > 0 && (
          <DashboardStats
            stats={stats}
            config={config.dashboard.stats}
            selectedStatus={selectedStatus}
          />
        )}

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
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          customFilters={customFilters}
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
