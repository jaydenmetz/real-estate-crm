import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Add, Archive, Unarchive } from '@mui/icons-material';
import { DashboardLayout } from '../../shared';
import { useEscrowsData } from './hooks/useEscrowsData';
import { EscrowGrid } from './components/EscrowGrid';
import { EscrowList } from './components/EscrowList';
import { NewEscrowModal } from './components/NewEscrowModal';
import { Box, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';

/**
 * EscrowsDashboard - Refactored using shared components
 * Target: <200 lines (currently ~150 lines)
 * Previous: 1,179 lines (87% reduction)
 */
const EscrowsDashboard = () => {
  const navigate = useNavigate();
  const [showNewModal, setShowNewModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [scopeFilter, setScopeFilter] = useState('team');

  // Use the specialized escrows hook
  const escrowsData = useEscrowsData({
    status: statusFilter,
    scope: scopeFilter
  });

  // Render escrows based on view mode
  const renderContent = () => {
    if (escrowsData.toolbar.viewMode === 'list') {
      return (
        <EscrowList
          escrows={escrowsData.data}
          onEscrowClick={(escrow) => navigate(`/escrows/${escrow.escrow_id}`)}
          onArchive={escrowsData.actions.archive}
          selection={escrowsData.selection}
        />
      );
    }

    return (
      <div className="dashboard-grid">
        <EscrowGrid
          escrows={escrowsData.data}
          onEscrowClick={(escrow) => navigate(`/escrows/${escrow.escrow_id}`)}
          onArchive={escrowsData.actions.archive}
          selection={escrowsData.selection}
        />
      </div>
    );
  };

  // Status filter chips
  const renderStatusFilter = () => (
    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(e, value) => value && setStatusFilter(value)}
        size="small"
      >
        <ToggleButton value="active">
          Active {statusFilter === 'active' && `(${escrowsData.data.length})`}
        </ToggleButton>
        <ToggleButton value="pending">
          Pending
        </ToggleButton>
        <ToggleButton value="closed">
          Closed
        </ToggleButton>
        <ToggleButton value="archived">
          <Archive sx={{ mr: 0.5, fontSize: 16 }} />
          Archived
        </ToggleButton>
      </ToggleButtonGroup>

      <ToggleButtonGroup
        value={scopeFilter}
        exclusive
        onChange={(e, value) => value && setScopeFilter(value)}
        size="small"
        sx={{ ml: 2 }}
      >
        <ToggleButton value="team">Team</ToggleButton>
        <ToggleButton value="my">My Escrows</ToggleButton>
      </ToggleButtonGroup>

      {escrowsData.selection.selected.length > 0 && (
        <Chip
          label={`${escrowsData.selection.selected.length} selected`}
          onDelete={() => escrowsData.selection.onSelectAll(false)}
          color="primary"
          sx={{ ml: 'auto' }}
        />
      )}
    </Box>
  );

  return (
    <>
      <DashboardLayout
        title="Escrows"
        subtitle={`Manage your ${statusFilter} escrows`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Escrows' }
        ]}

        // Statistics cards
        stats={escrowsData.stats}
        statsLoading={escrowsData.isLoading}

        // Toolbar configuration
        toolbar={{
          ...escrowsData.toolbar,
          searchPlaceholder: 'Search by address, client, or MLS...',
          availableModes: ['grid', 'list'],
          actions: [
            {
              label: 'New Escrow',
              icon: <Add />,
              onClick: () => setShowNewModal(true),
              variant: 'contained',
              color: 'primary'
            },
            ...(statusFilter === 'archived' && escrowsData.selection.selected.length > 0 ? [
              {
                label: 'Restore Selected',
                icon: <Unarchive />,
                onClick: () => escrowsData.actions.bulkRestore(escrowsData.selection.selected),
                variant: 'outlined',
                color: 'success'
              },
              {
                label: 'Delete Selected',
                icon: <Archive />,
                onClick: () => {
                  if (window.confirm('Permanently delete selected escrows?')) {
                    escrowsData.actions.bulkDelete(escrowsData.selection.selected);
                  }
                },
                variant: 'outlined',
                color: 'error'
              }
            ] : [])
          ],
          // Custom filters component
          customFilters: renderStatusFilter()
        }}

        // Content
        content={renderContent()}
        contentLoading={escrowsData.isLoading}

        // Pagination
        pagination={escrowsData.pagination}

        // States
        loading={escrowsData.isLoading}
        error={escrowsData.error}
      />

      {/* New Escrow Modal */}
      <NewEscrowModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => {
          setShowNewModal(false);
          escrowsData.refetch();
        }}
      />
    </>
  );
};

export default EscrowsDashboard;
