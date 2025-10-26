/**
 * EscrowContent.jsx - Main content area displaying escrows grid/list
 *
 * Contains:
 * - Loading spinner
 * - Escrows grid (responsive, changes with viewMode)
 * - Archived escrows view with checkboxes
 * - Batch delete controls for archived
 * - Load More pagination button
 * - Empty states for no escrows
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  Button,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import EscrowCard from '../../../common/widgets/EscrowCard';

const EscrowContent = ({
  loading,
  selectedStatus,
  viewMode,
  sortedEscrows, // Pre-sorted and filtered from parent
  archivedEscrows,
  loadingMore,
  hasMorePages,
  handleLoadMore,
  selectedArchivedIds,
  setSelectedArchivedIds,
  handleBatchDelete,
  batchDeleting,
  handleSelectAll,
  totalCount,
  onArchive,
  onRestore,
  onDelete,
  onUpdate,
}) => {
  // Show loading spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Escrows Grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr',
          md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr',
          lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr',
        },
        gap: 3,
        width: '100%',
      }}>
        <AnimatePresence>
          {(() => {
            // Handle archived view separately
            if (selectedStatus === 'archived') {
              if (!archivedEscrows || archivedEscrows.length === 0) {
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
                      background: theme => alpha(theme.palette.warning.main, 0.03),
                      border: theme => `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      gridColumn: '1 / -1',
                    }}
                  >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No archived escrows
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Archived escrows will appear here
                    </Typography>
                  </Paper>
                );
              }

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
                      checked={selectedArchivedIds.length === archivedEscrows.length && archivedEscrows.length > 0}
                      indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedEscrows.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <Typography variant="body2">
                      {selectedArchivedIds.length > 0
                        ? `${selectedArchivedIds.length} selected`
                        : 'Select all'}
                    </Typography>
                    {selectedArchivedIds.length > 0 && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={batchDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
                        onClick={handleBatchDelete}
                        disabled={batchDeleting}
                      >
                        Delete {selectedArchivedIds.length} Escrow{selectedArchivedIds.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </Box>

                  {archivedEscrows.map((escrow, index) => {
                    const isSelected = selectedArchivedIds.includes(escrow.escrow_id);

                    return (
                      <Box key={escrow.escrow_id} sx={{ position: 'relative' }}>
                        {/* Selection checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArchivedIds(prev => [...prev, escrow.escrow_id]);
                            } else {
                              setSelectedArchivedIds(prev => prev.filter(id => id !== escrow.escrow_id));
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
                          <EscrowCard
                            escrow={escrow}
                            viewMode={viewMode}
                            index={index}
                            onArchive={onArchive}
                            onRestore={onRestore}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            animationType="spring"
                          />
                        </motion.div>
                      </Box>
                    );
                  })}
                </>
              );
            }

            // Regular escrows view (already filtered and sorted from parent)
            if (!sortedEscrows || sortedEscrows.length === 0) {
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
                    background: theme => alpha(theme.palette.primary.main, 0.03),
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    gridColumn: '1 / -1',
                  }}
                >
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No {selectedStatus} escrows found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedStatus === 'active' ? 'Add a new escrow to get started' : `No ${selectedStatus} escrows in the system`}
                  </Typography>
                </Paper>
              );
            } else {
              return sortedEscrows.map((escrow, index) => (
                <motion.div
                  key={escrow.escrow_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <EscrowCard
                    escrow={escrow}
                    viewMode={viewMode}
                    index={index}
                    onArchive={onArchive}
                    onRestore={onRestore}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    animationType="spring"
                  />
                </motion.div>
              ));
            }
          })()}
        </AnimatePresence>
      </Box>

      {/* Load More Button */}
      {hasMorePages && !loading && selectedStatus !== 'archived' && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          mb: 2
        }}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleLoadMore}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} /> : null}
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loadingMore ? 'Loading...' : `Load More (${totalCount - sortedEscrows.length} remaining)`}
          </Button>
        </Box>
      )}
    </>
  );
};

export default EscrowContent;
