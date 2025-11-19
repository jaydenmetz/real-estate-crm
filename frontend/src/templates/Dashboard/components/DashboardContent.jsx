import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  alpha,
} from '@mui/material';
import {
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DashboardContent - Config-driven content grid/list with animations
 * Supports archive view with checkboxes matching Clients dashboard
 */
export const DashboardContent = ({
  loading,
  error,
  data,
  viewMode,
  CardComponent,
  ListComponent = null, // Optional list view component
  TableComponent = null, // Optional table view component
  config,
  onUpdate,
  onDelete,
  onArchive,
  onRestore,
  customActions,
  // Archive view props
  selectedStatus,
  archivedData,
  selectedArchivedIds,
  setSelectedArchivedIds,
  handleBatchDelete,
  batchDeleting,
  handleSelectAll,
  // Multi-select props
  isSelectable = false,
  selectedItems = [],
  onSelectItem,
}) => {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 4 }}>
        Failed to load {config.entity.namePlural}: {error.message}
      </Alert>
    );
  }

  // Check if we're in archive view
  const isArchiveView = selectedStatus === 'archived';
  const displayData = isArchiveView ? archivedData : data;

  // Empty state
  if (!displayData || displayData.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          height: 240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: theme => alpha(
            isArchiveView ? theme.palette.warning.main : theme.palette.primary.main,
            0.03
          ),
          border: theme => `1px solid ${alpha(
            isArchiveView ? theme.palette.warning.main : theme.palette.primary.main,
            0.1
          )}`,
        }}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {isArchiveView ? `No archived ${config.entity.namePlural}` : `No ${selectedStatus} ${config.entity.namePlural} found`}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {isArchiveView
            ? `Archived ${config.entity.namePlural} will appear here`
            : config.dashboard.hero.showAddButton
            ? `Click "New ${config.entity.label}" to get started`
            : 'Try adjusting your filters'}
        </Typography>
      </Paper>
    );
  }

  // Determine which component to use based on viewMode
  const getComponent = () => {
    // Use provided view components if available
    if (viewMode === 'list' && ListComponent) return ListComponent;
    if (viewMode === 'table' && TableComponent) return TableComponent;
    // Default: use CardComponent (grid view)
    return CardComponent;
  };

  const Component = getComponent();

  // Table view needs headers
  const renderTableHeaders = () => {
    if (viewMode !== 'table' || !TableComponent) return null;

    // Define headers based on entity type
    const headersByEntity = {
      escrow: [
        'Property', 'Status', 'Price', 'Commission',
        'Acceptance', 'Close', 'Progress', 'Actions'
      ],
      listing: [
        'Property', 'Status', 'List Price', 'Commission',
        'MLS#', 'Beds/Baths', 'Days/Listed', 'Actions'
      ]
    };

    const headers = headersByEntity[config.entity.name] || [
      'Item', 'Status', 'Actions'
    ];

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr 80px',
          gap: 2,
          px: 2,
          py: 1,
          mb: 1,
          borderBottom: `2px solid ${alpha('#000', 0.1)}`,
        }}
      >
        {headers.map((header, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              textAlign: header === 'Progress' ? 'center' : 'left'
            }}
          >
            {header}
          </Typography>
        ))}
      </Box>
    );
  };

  // Grid layout with responsive columns and calculated gap
  // This ensures the rightmost card aligns with the hero section edge
  // and gaps are evenly distributed with a minimum threshold
  const getGridStyles = () => {
    if (viewMode === 'table') {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 1,
        width: '100%',
      };
    }

    if (viewMode === 'card') {
      // Responsive grid with fixed 320px cards, left-justified layout
      // Cards wrap naturally with consistent spacing regardless of row count
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, 320px)', // All cards fixed at 320px
        justifyContent: 'start', // Left-justify cards (not centered)
        gap: {
          xs: 2, // 16px on mobile
          sm: 2, // 16px on small
          md: 2.5, // 20px on medium
          lg: 3, // 24px on large
          xl: 3, // 24px on xl
        },
        width: '100%',
      };
    }

    // Default (list view)
    return {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '5px',
      width: '100%',
    };
  };

  return (
    <>
      {renderTableHeaders()}

      <Box sx={getGridStyles()}>
        <AnimatePresence>
          {(() => {
            // Archive view with checkboxes
            if (isArchiveView) {
              return (
                <>
                  {/* Batch Delete Controls */}
                  <Box sx={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: alpha('#ff9800', 0.1),
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha('#ff9800', 0.3),
                  }}>
                    <Checkbox
                      checked={selectedArchivedIds?.length === archivedData?.length && archivedData?.length > 0}
                      indeterminate={selectedArchivedIds?.length > 0 && selectedArchivedIds?.length < archivedData?.length}
                      onChange={(e) => handleSelectAll?.(e.target.checked)}
                    />
                    <Typography variant="body2">
                      {selectedArchivedIds?.length > 0
                        ? `${selectedArchivedIds.length} selected`
                        : 'Select all'}
                    </Typography>
                    {selectedArchivedIds?.length > 0 && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={batchDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
                        onClick={handleBatchDelete}
                        disabled={batchDeleting}
                      >
                        Delete {selectedArchivedIds.length} {config.entity.label}{selectedArchivedIds.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </Box>

                  {archivedData.map((item, index) => {
                    const itemId = item[config.api.idField];
                    const isSelected = selectedArchivedIds?.includes(itemId);

                    return (
                      <Box key={itemId} sx={{ position: 'relative' }}>
                        {/* Selection checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArchivedIds?.(prev => [...prev, itemId]);
                            } else {
                              setSelectedArchivedIds?.(prev => prev.filter(id => id !== itemId));
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 10,
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          style={{ opacity: isSelected ? 0.7 : 1 }}
                        >
                          <Component
                            {...{ [config.entity.name]: item }}
                            viewMode={viewMode}
                            index={index}
                            isArchived={true}
                            onUpdate={onUpdate ? (id, updates) => onUpdate(id, updates) : undefined}
                            onDelete={onDelete ? () => onDelete(itemId) : undefined}
                            onRestore={onRestore ? () => onRestore(itemId) : undefined}
                            customActions={customActions}
                            animationType="spring"
                          />
                        </motion.div>
                      </Box>
                    );
                  })}
                </>
              );
            }

            // Regular view (not archived)
            return displayData.map((item, index) => {
              const itemId = item[config.api.idField];
              const isSelected = selectedItems.includes(itemId);

              return (
                <motion.div
                  key={itemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                >
                  <Component
                    {...{ [config.entity.name]: item }}
                    onClick={() => {
                      // Navigate to detail page
                      window.location.href = `/${config.entity.namePlural}/${itemId}`;
                    }}
                    viewMode={viewMode}
                    index={index}
                    isArchived={false}
                    onUpdate={onUpdate ? (id, updates) => onUpdate(id, updates) : undefined}
                    onDelete={onDelete ? () => onDelete(itemId) : undefined}
                    onArchive={onArchive ? () => onArchive(itemId) : undefined}
                    customActions={customActions}
                    animationType="spring"
                    isSelectable={isSelectable}
                    isSelected={isSelected}
                    onSelect={onSelectItem}
                  />
                </motion.div>
              );
            });
          })()}
        </AnimatePresence>
      </Box>
    </>
  );
};
