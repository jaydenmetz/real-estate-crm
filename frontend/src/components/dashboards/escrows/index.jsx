import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useEscrowsData } from '../../../features/escrows/hooks/useEscrowsData';
import { EscrowGrid } from '../../../features/escrows/components/EscrowGrid';
import { EscrowList } from '../../../features/escrows/components/EscrowList';
import { NewEscrowModal } from '../../../features/escrows/components/NewEscrowModal';
import EscrowHeroCard from './components/EscrowHeroCard';
import EscrowNavigation from './components/EscrowNavigation';
import { detectPresetRange, filterEscrows, sortEscrows } from './utils/escrowUtils';

const EscrowsDashboard = () => {
  const navigate = useNavigate();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('escrowsViewMode');
    return saved || 'grid';
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [scope, setScope] = useState(() => {
    const saved = localStorage.getItem('escrowsScope');
    return saved || 'team';
  });

  // Date range filter state
  const [dateRangeFilter, setDateRangeFilter] = useState('1M');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('escrowsViewMode', viewMode);
  }, [viewMode]);

  // Save scope to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('escrowsScope', scope);
  }, [scope]);

  // Calculate date range based on filter or custom dates
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    // Use custom dates if both are set
    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;

      // Auto-detect if custom dates match a preset
      const matchedPreset = detectPresetRange(startDate, endDate);
      if (matchedPreset && dateRangeFilter !== matchedPreset) {
        setDateRangeFilter(matchedPreset);
      } else if (!matchedPreset && dateRangeFilter !== null) {
        setDateRangeFilter(null);
      }
    } else {
      // Use preset range
      switch(dateRangeFilter) {
        case '1D':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1M':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case '1Y':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          endDate = now;
          break;
        case 'YTD':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
      }
    }

    const validStart = startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate : new Date();
    const validEnd = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : new Date();

    return {
      startDate: validStart,
      endDate: validEnd,
      label: `${validStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${validEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    };
  };

  const dateRange = getDateRange();

  // Use the specialized escrows hook
  const escrowsData = useEscrowsData({
    status: selectedStatus,
    scope: scope
  });

  const { data: escrows, stats, isLoading, error, refetch } = escrowsData;

  // Filter and sort escrows for display
  const filteredEscrows = filterEscrows(escrows || [], selectedStatus);
  const sortedEscrows = sortEscrows(filteredEscrows, sortBy);

  if (isLoading && !escrows) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section with Stats */}
        <EscrowHeroCard
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          dateRange={dateRange}
          detectPresetRange={detectPresetRange}
          selectedStatus={selectedStatus}
          stats={stats || {}}
          archivedCount={escrows?.filter(e => e.deleted_at || e.deletedAt).length || 0}
          setNewEscrowModalOpen={setShowNewModal}
        />

        {/* Navigation Bar */}
        <EscrowNavigation
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          scope={scope}
          setScope={setScope}
          archivedCount={escrows?.filter(e => e.deleted_at || e.deletedAt).length || 0}
        />

        {/* Main Content */}
        <Box>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={4} textAlign="center">
              <Typography color="error">{error}</Typography>
            </Box>
          ) : viewMode === 'list' ? (
            <EscrowList
              escrows={sortedEscrows}
              onEscrowClick={(escrow) => navigate(`/escrows/${escrow.escrow_id}`)}
              onArchive={(escrow) => {
                // Handle archive
                refetch();
              }}
              selection={escrowsData.selection}
            />
          ) : (
            <EscrowGrid
              escrows={sortedEscrows}
              onEscrowClick={(escrow) => navigate(`/escrows/${escrow.escrow_id}`)}
              onArchive={async (id) => {
                await escrowsData.actions.archive(id);
                refetch();
              }}
              onRestore={async (id) => {
                await escrowsData.actions.restore(id);
                refetch();
              }}
              onDelete={async (id) => {
                await escrowsData.actions.delete(id);
                refetch();
              }}
              onUpdate={async (id, updates) => {
                // TODO: Add update action to escrowsData
                console.log('Updating escrow:', id, updates);
                refetch();
              }}
              selection={escrowsData.selection}
              isArchived={selectedStatus === 'archived'}
              viewMode={viewMode}
            />
          )}
        </Box>

        {/* New Escrow Modal */}
        <NewEscrowModal
          open={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false);
            refetch();
          }}
        />
      </Container>
    </>
  );
};

export default EscrowsDashboard;
