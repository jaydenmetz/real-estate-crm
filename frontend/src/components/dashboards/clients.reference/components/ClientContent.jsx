/**
 * ClientContent.jsx - Main content area displaying clients grid/list
 *
 * Contains:
 * - Loading spinner
 * - Clients grid (responsive, changes with viewMode)
 * - Archived clients view with checkboxes
 * - Batch delete controls for archived
 * - Load More pagination button
 * - Empty states for no clients
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
import ClientCard from '../../../common/widgets/ClientCard';

const ClientContent = ({
  loading,
  selectedStatus,
  viewMode,
  sortedClients, // Pre-sorted and filtered from parent
  archivedClients,
  loadingMore,
  hasMorePages,
  handleLoadMore,
  selectedArchivedIds,
  setSelectedArchivedIds,
  handleBatchDelete,
  batchDeleting,
  handleSelectAll,
  totalCount,
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
      {/* Clients Grid */}
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
              if (!archivedClients || archivedClients.length === 0) {
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
                      No archived clients
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Archived clients will appear here
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
                      checked={selectedArchivedIds.length === archivedClients.length && archivedClients.length > 0}
                      indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedClients.length}
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
                        Delete {selectedArchivedIds.length} Client{selectedArchivedIds.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </Box>

                  {archivedClients.map((client, index) => {
                    const isSelected = selectedArchivedIds.includes(client.id);

                    return (
                      <Box key={client.id} sx={{ position: 'relative' }}>
                        {/* Selection checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArchivedIds(prev => [...prev, client.id]);
                            } else {
                              setSelectedArchivedIds(prev => prev.filter(id => id !== client.id));
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
                          <ClientCard
                            client={client}
                            viewMode={viewMode}
                            index={index}
                            isArchived={true}
                          />
                        </motion.div>
                      </Box>
                    );
                  })}
                </>
              );
            }

            // Regular clients view (already filtered and sorted from parent)
            if (!sortedClients || sortedClients.length === 0) {
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
                    No {selectedStatus} clients found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedStatus === 'active' ? 'Add a new client to get started' : `No ${selectedStatus} clients in the system`}
                  </Typography>
                </Paper>
              );
            } else {
              return sortedClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ClientCard
                    client={client}
                    viewMode={viewMode}
                    index={index}
                    isArchived={false}
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
            {loadingMore ? 'Loading...' : `Load More (${totalCount - sortedClients.length} remaining)`}
          </Button>
        </Box>
      )}
    </>
  );
};

export default ClientContent;
