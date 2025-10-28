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

  // Grid layout matching ClientContent exactly
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr',
            lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr',
          },
          gap: 3,
          width: '100%',
        }}
      >
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
                          <CardComponent
                            {...{ [config.entity.name]: item }}
                            viewMode={viewMode}
                            index={index}
                            isArchived={true}
                            onUpdate={onUpdate ? (updates) => onUpdate(itemId, updates) : undefined}
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
                  <CardComponent
                    {...{ [config.entity.name]: item }}
                    viewMode={viewMode}
                    index={index}
                    isArchived={false}
                    onUpdate={onUpdate ? (updates) => onUpdate(itemId, updates) : undefined}
                    onDelete={onDelete ? () => onDelete(itemId) : undefined}
                    onArchive={onArchive ? () => onArchive(itemId) : undefined}
                    customActions={customActions}
                    animationType="spring"
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
