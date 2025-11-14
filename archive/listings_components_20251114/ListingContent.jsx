/**
 * ListingContent.jsx - Main content area displaying listings grid/list
 *
 * Contains:
 * - Loading spinner
 * - Listings grid (responsive, changes with viewMode)
 * - Archived listings view with checkboxes
 * - Batch delete controls for archived
 * - Load More pagination button
 * - Empty states for no listings
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Checkbox,
  Button,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  DeleteForever as DeleteForeverIcon,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ListingCard } from '../../../common/view-modes/card';

const ListingContent = ({
  loading,
  selectedStatus,
  viewMode,
  sortedListings, // Pre-sorted and filtered from parent
  archivedListings,
  handleListingClick,
  handleArchive,
  handleRestore,
  handleUpdateListing,
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
      {/* Listings Grid */}
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
              if (!archivedListings || archivedListings.length === 0) {
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
                      No archived listings
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Archived listings will appear here
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
                      checked={selectedArchivedIds.length === archivedListings.length && archivedListings.length > 0}
                      indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedListings.length}
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
                        Delete {selectedArchivedIds.length} Listing{selectedArchivedIds.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </Box>

                  {archivedListings.map((listing, index) => {
                    const isSelected = selectedArchivedIds.includes(listing.id);

                    return (
                      <Box key={listing.id} sx={{ position: 'relative' }}>
                        {/* Selection checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArchivedIds(prev => [...prev, listing.id]);
                            } else {
                              setSelectedArchivedIds(prev => prev.filter(id => id !== listing.id));
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 1,
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: alpha('#fff', 0.9),
                            },
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card
                            onClick={() => handleListingClick(listing.id)}
                            sx={{
                              cursor: 'pointer',
                              height: '100%',
                              minHeight: 200,
                              opacity: 0.7,
                              '&:hover': {
                                opacity: 1,
                                transform: 'translateY(-4px)',
                                boxShadow: 6,
                              },
                              transition: 'all 0.3s',
                              border: '2px solid',
                              borderColor: isSelected ? 'error.main' : 'transparent',
                            }}
                          >
                            <CardContent sx={{ pt: 5 }}>
                              <Typography variant="h6" gutterBottom>
                                {listing.propertyAddress || listing.property_address || 'No Address'}
                              </Typography>
                              <Typography variant="h5" color="primary" gutterBottom>
                                ${(listing.listPrice || listing.list_price || 0).toLocaleString()}
                              </Typography>
                              <Stack spacing={1}>
                                <Chip
                                  label="Archived"
                                  size="small"
                                  color="warning"
                                />
                                <Typography variant="body2" color="textSecondary">
                                  MLS: {listing.mlsNumber || listing.mls_number || 'N/A'}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Box>
                    );
                  })}
                </>
              );
            }

            // Regular listings view (already filtered and sorted from parent)
            if (!sortedListings || sortedListings.length === 0) {
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
                    No {selectedStatus} listings found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedStatus === 'active' ? 'Create a new listing to get started' : `No ${selectedStatus} listings in the system`}
                  </Typography>
                </Paper>
              );
            } else {
              return sortedListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListingCard
                    listing={listing}
                    viewMode={viewMode}
                    index={index}
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
            startIcon={loadingMore ? <CircularProgress size={20} /> : <Refresh />}
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {loadingMore ? 'Loading...' : `Load More (${totalCount - sortedListings.length} remaining)`}
          </Button>
        </Box>
      )}
    </>
  );
};

export default ListingContent;
