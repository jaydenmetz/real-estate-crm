/**
 * AppointmentContent.jsx - Main content area displaying appointments grid/list
 *
 * Contains:
 * - Loading spinner
 * - Appointments grid (responsive, changes with viewMode)
 * - Archived appointments view with checkboxes
 * - Batch delete controls for archived
 * - Load More pagination button
 * - Empty states for no appointments
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
import AppointmentCard from '../../../common/widgets/AppointmentCard';

const AppointmentContent = ({
  loading,
  selectedStatus,
  viewMode,
  sortedAppointments, // Pre-sorted and filtered from parent
  archivedAppointments,
  handleAppointmentClick,
  handleArchive,
  handleRestore,
  handleUpdateAppointment,
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
      {/* Appointments Grid */}
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
              if (!archivedAppointments || archivedAppointments.length === 0) {
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
                      No archived appointments
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Archived appointments will appear here
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
                      checked={selectedArchivedIds.length === archivedAppointments.length && archivedAppointments.length > 0}
                      indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedAppointments.length}
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
                        Delete {selectedArchivedIds.length} Appointment{selectedArchivedIds.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </Box>

                  {archivedAppointments.map((appointment, index) => {
                    const isSelected = selectedArchivedIds.includes(appointment.id);

                    return (
                      <Box key={appointment.id} sx={{ position: 'relative' }}>
                        {/* Selection checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArchivedIds(prev => [...prev, appointment.id]);
                            } else {
                              setSelectedArchivedIds(prev => prev.filter(id => id !== appointment.id));
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
                            onClick={() => handleAppointmentClick(appointment.id)}
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
                                {appointment.propertyAddress || appointment.property_address || 'No Address'}
                              </Typography>
                              <Typography variant="h5" color="primary" gutterBottom>
                                ${(appointment.listPrice || appointment.list_price || 0).toLocaleString()}
                              </Typography>
                              <Stack spacing={1}>
                                <Chip
                                  label="Archived"
                                  size="small"
                                  color="warning"
                                />
                                <Typography variant="body2" color="textSecondary">
                                  MLS: {appointment.mlsNumber || appointment.mls_number || 'N/A'}
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

            // Regular appointments view (already filtered and sorted from parent)
            if (!sortedAppointments || sortedAppointments.length === 0) {
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
                    No {selectedStatus} appointments found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedStatus === 'active' ? 'Create a new appointment to get started' : `No ${selectedStatus} appointments in the system`}
                  </Typography>
                </Paper>
              );
            } else {
              return sortedAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AppointmentCard
                    appointment={appointment}
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
            {loadingMore ? 'Loading...' : `Load More (${totalCount - sortedAppointments.length} remaining)`}
          </Button>
        </Box>
      )}
    </>
  );
};

export default AppointmentContent;
