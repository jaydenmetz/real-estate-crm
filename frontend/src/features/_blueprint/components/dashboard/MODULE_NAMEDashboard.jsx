import React, { useState } from 'react';
import { Box } from '@mui/material';
import DashboardLayout from '../../../../shared/components/dashboard/DashboardLayout';
import DashboardToolbar from '../../../../shared/components/dashboard/DashboardToolbar';
import DashboardPagination from '../../../../shared/components/dashboard/DashboardPagination';
import MODULE_NAMEGrid from './MODULE_NAMEGrid';
import MODULE_NAMEList from './MODULE_NAMEList';
import MODULE_NAMETable from './MODULE_NAMETable';
import MODULE_NAMECalendar from './MODULE_NAMECalendar';
import NewMODULE_NAMEModal from '../modals/NewMODULE_NAMEModal';
import EditMODULE_NAMEModal from '../modals/EditMODULE_NAMEModal';
import MODULE_NAMEFiltersModal from '../modals/MODULE_NAMEFiltersModal';
import { useMODULE_NAMEDashboard } from '../../hooks/useMODULE_NAMEDashboard';
import { Add, FileDownload } from '@mui/icons-material';

/**
 * MODULE_TITLE Dashboard Component
 *
 * Main dashboard for managing MODULE_PLURAL with support for:
 * - Grid, List, Table, and Calendar views
 * - Search and filtering
 * - CRUD operations
 * - Bulk actions
 * - Export functionality
 * - Real-time updates
 */
const MODULE_NAMEDashboard = () => {
  // Dashboard hook with all business logic
  const {
    // Data
    items,
    stats,
    loading,
    error,

    // Pagination
    pagination,

    // Search & Filters
    searchTerm,
    setSearchTerm,
    filters,

    // View Mode
    viewMode,
    setViewMode,

    // Modals
    modals,
    openNewModal,
    closeNewModal,
    openEditModal,
    closeEditModal,
    openFiltersModal,
    closeFiltersModal,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleExport,
    handleBulkDelete,

    // Selection
    selectedItems,
    handleSelectItem,
    handleSelectAll,
    clearSelection
  } = useMODULE_NAMEDashboard();

  // Render content based on view mode
  const renderContent = () => {
    if (loading && !items.length) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          Loading MODULE_PLURAL...
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, color: 'error.main' }}>
          Error loading MODULE_PLURAL: {error.message}
        </Box>
      );
    }

    if (!items.length) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, color: 'text.secondary' }}>
          No MODULE_PLURAL found. Click "Add MODULE_NAME" to create your first one.
        </Box>
      );
    }

    const commonProps = {
      items,
      loading,
      selectedItems,
      onSelectItem: handleSelectItem,
      onEdit: openEditModal,
      onDelete: handleDelete
    };

    switch (viewMode) {
      case 'grid':
        return <MODULE_NAMEGrid {...commonProps} />;
      case 'list':
        return <MODULE_NAMEList {...commonProps} />;
      case 'table':
        return <MODULE_NAMETable {...commonProps} onSelectAll={handleSelectAll} />;
      case 'calendar':
        return <MODULE_NAMECalendar {...commonProps} />;
      default:
        return <MODULE_NAMEGrid {...commonProps} />;
    }
  };

  return (
    <>
      <DashboardLayout
        title="MODULE_TITLE"
        subtitle={`Manage your ${stats.totalCount || 0} MODULE_PLURAL`}
        stats={stats}
        loading={loading}
      >
        {/* Toolbar */}
        <DashboardToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterClick={openFiltersModal}
          availableModes={['grid', 'list', 'table', 'calendar']}
          searchPlaceholder="Search MODULE_PLURAL..."
          loading={loading}
          actions={[
            {
              label: 'Export',
              icon: <FileDownload />,
              onClick: handleExport,
              variant: 'outlined',
              disabled: !items.length
            },
            {
              label: 'Add MODULE_NAME',
              icon: <Add />,
              onClick: openNewModal,
              variant: 'contained'
            }
          ]}
        />

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <Box sx={{
            mb: 2,
            p: 2,
            bgcolor: 'primary.light',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ color: 'primary.contrastText' }}>
              {selectedItems.length} MODULE_PLURAL selected
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <button onClick={handleBulkDelete} style={{
                padding: '8px 16px',
                background: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Delete Selected
              </button>
              <button onClick={clearSelection} style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid white',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}>
                Clear Selection
              </button>
            </Box>
          </Box>
        )}

        {/* Main Content */}
        {renderContent()}

        {/* Pagination */}
        {items.length > 0 && (
          <DashboardPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={pagination.onItemsPerPageChange}
            loading={loading}
          />
        )}
      </DashboardLayout>

      {/* Modals */}
      <NewMODULE_NAMEModal
        open={modals.newModal}
        onClose={closeNewModal}
        onSubmit={handleCreate}
      />

      <EditMODULE_NAMEModal
        open={modals.editModal}
        onClose={closeEditModal}
        MODULE_SINGULAR={modals.selectedItem}
        onSubmit={handleUpdate}
      />

      <MODULE_NAMEFiltersModal
        open={modals.filtersModal}
        onClose={closeFiltersModal}
        filters={filters}
        onApply={(newFilters) => {
          // Filter application is handled by the hook
          closeFiltersModal();
        }}
      />
    </>
  );
};

export default MODULE_NAMEDashboard;
