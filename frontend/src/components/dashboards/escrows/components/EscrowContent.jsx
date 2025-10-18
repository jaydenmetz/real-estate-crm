import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  alpha,
} from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import EscrowCard from '../../../common/widgets/EscrowCard';
import VirtualizedEscrowList from '../../../common/VirtualizedEscrowList';
import { Home } from '@mui/icons-material';

/**
 * EscrowContent - Main content area for displaying escrows
 *
 * This component handles:
 * - Calendar view rendering
 * - Escrow cards grid/list display
 * - Archive/filter/sort logic
 * - Empty states
 * - Load more pagination
 * - Calendar date detail dialog
 *
 * Extracted from EscrowsDashboard.jsx during Phase 5 refactoring
 * @since 1.0.5
 */
const EscrowContent = ({
  showCalendar,
  calendarDate,
  escrowsByDate,
  escrows,
  archivedEscrows,
  selectedStatus,
  sortBy,
  viewMode,
  animationType,
  animationDuration,
  animationIntensity,
  hasMorePages,
  loading,
  loadingMore,
  totalCount,
  calendarDialogOpen,
  setCalendarDialogOpen,
  selectedDate,
  setSelectedDate,
  handleArchive,
  handleRestore,
  handlePermanentDelete,
  handleUpdateEscrow,
  handleEscrowClick,
  loadMoreEscrows,
  safeFormatDate,
}) => {
  // Calendar view rendering logic
  if (showCalendar) {
    const today = new Date();
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    return (
      <>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
          <Grid container spacing={1}>
            {(() => {
              const days = [];

              // Day headers
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
                days.push(
                  <Grid item xs={12 / 7} key={`header-${day}`}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'center', display: 'block' }}>
                      {day}
                    </Typography>
                  </Grid>
                );
              });

              // Empty cells before first day
              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(<Grid item xs={12 / 7} key={`empty-${i}`}><Box sx={{ height: 80 }} /></Grid>);
              }

              // Calendar days
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEscrows = escrowsByDate[dateStr] || [];
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                days.push(
                  <Grid item xs={12 / 7} key={`day-${day}`}>
                    <Paper
                      elevation={isToday ? 3 : 0}
                      onClick={() => {
                        if (dayEscrows.length > 0) {
                          setSelectedDate({ date: dateStr, escrows: dayEscrows });
                          setCalendarDialogOpen(true);
                        }
                      }}
                      sx={{
                        height: 80,
                        p: 1,
                        cursor: dayEscrows.length > 0 ? 'pointer' : 'default',
                        border: theme => `1px solid ${isToday ? theme.palette.primary.main : theme.palette.divider}`,
                        backgroundColor: isToday ? theme => alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                        '&:hover': dayEscrows.length > 0 ? {
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                        } : {},
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {day}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {dayEscrows.slice(0, 2).map((escrow, idx) => (
                          <Chip
                            key={idx}
                            label={escrow.eventType}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: 9,
                              mb: 0.5,
                              backgroundColor: escrow.eventColor,
                              color: 'white',
                              '& .MuiChip-label': { px: 0.5 },
                            }}
                          />
                        ))}
                        {dayEscrows.length > 2 && (
                          <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                            +{dayEscrows.length - 2} more
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              }

              return days;
            })()}
          </Grid>
        </Paper>

        {/* Calendar Date Detail Dialog */}
        <Dialog
          open={calendarDialogOpen}
          onClose={() => setCalendarDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedDate && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Escrow Events - {safeFormatDate(selectedDate.date, 'MMMM d, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDate.escrows.length} event{selectedDate.escrows.length !== 1 ? 's' : ''} scheduled
                </Typography>
              </Box>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedDate && (
              <List>
                {selectedDate.escrows.map((escrow, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      border: theme => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                    onClick={() => {
                      setCalendarDialogOpen(false);
                      handleEscrowClick(escrow.id);
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: escrow.eventColor,
                          mr: 2,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Home sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {escrow.propertyAddress}
                          </Typography>
                          <Chip
                            label={escrow.eventType}
                            size="small"
                            sx={{
                              backgroundColor: escrow.eventColor,
                              color: 'white',
                              height: 20,
                              fontSize: 11,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Client: {escrow.clientName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Price: ${escrow.salePrice?.toLocaleString() || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status: {escrow.status}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalendarDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Regular escrow cards view
  return (
    <>
      {/* Escrow Cards with proper dividers and edge alignment */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr', // Mobile: 1 column
          sm: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', // Tablet: 2 columns in small view
          md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', // Medium: 2 columns in small view
          lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr', // Desktop: 4 columns in small view
        },
        gap: 3, // 24px gap
        width: '100%',
        minHeight: '600px', // Prevent scroll jump when switching tabs
      }}>
        <AnimatePresence>
          {(() => {
            // If archived tab is selected, show archived escrows
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

              // Use same display pattern as active escrows (no special grid/compact views)
              return archivedEscrows.map((escrow, index) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  viewMode={viewMode}
                  animationType={animationType}
                  animationDuration={animationDuration}
                  animationIntensity={animationIntensity}
                  index={index}
                  onRestore={handleRestore}
                  onDelete={handlePermanentDelete}
                  isArchived={true}
                  onUpdate={handleUpdateEscrow}
                />
              ));
            }

            // Otherwise show regular escrows filtered by status (exclude archived)
            const filteredEscrows = escrows.filter(e => {
              // Filter out archived escrows (those with deleted_at set)
              // Check both top-level and details.deletedAt
              if (e.deleted_at || e.deletedAt || e.details?.deletedAt) return false;

              switch (selectedStatus) {
                case 'active':
                  return e.escrowStatus === 'Active Under Contract' ||
                         e.escrowStatus === 'active under contract' ||
                         e.escrowStatus === 'Pending' ||
                         e.escrowStatus === 'pending' ||
                         e.escrowStatus === 'Active' ||
                         e.escrowStatus === 'active';
                case 'closed':
                  return e.escrowStatus === 'Closed' ||
                         e.escrowStatus === 'closed' ||
                         e.escrowStatus === 'Completed' ||
                         e.escrowStatus === 'completed';
                case 'cancelled':
                  return e.escrowStatus === 'Cancelled' ||
                         e.escrowStatus === 'cancelled' ||
                         e.escrowStatus === 'Withdrawn' ||
                         e.escrowStatus === 'withdrawn' ||
                         e.escrowStatus === 'Expired' ||
                         e.escrowStatus === 'expired';
                case 'all':
                  return true; // Show all non-archived escrows
                default:
                  return true;
              }
            });

            // Sort escrows based on sortBy state
            const sortedEscrows = [...filteredEscrows].sort((a, b) => {
              let aVal, bVal;

              switch(sortBy) {
                case 'closing_date':
                  aVal = new Date(a.closingDate || a.closing_date || 0);
                  bVal = new Date(b.closingDate || b.closing_date || 0);
                  return bVal - aVal; // Newest first
                case 'created_at':
                  aVal = new Date(a.createdAt || a.created_at || 0);
                  bVal = new Date(b.createdAt || b.created_at || 0);
                  return bVal - aVal; // Newest first
                case 'sale_price':
                  aVal = Number(a.purchasePrice || a.sale_price || 0);
                  bVal = Number(b.purchasePrice || b.sale_price || 0);
                  return bVal - aVal; // Highest first
                case 'property_address':
                  aVal = (a.propertyAddress || a.property_address || '').toLowerCase();
                  bVal = (b.propertyAddress || b.property_address || '').toLowerCase();
                  return aVal.localeCompare(bVal); // A-Z
                case 'escrow_status':
                  aVal = (a.escrowStatus || a.escrow_status || '').toLowerCase();
                  bVal = (b.escrowStatus || b.escrow_status || '').toLowerCase();
                  return aVal.localeCompare(bVal); // A-Z
                default:
                  return 0;
              }
            });

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
                    {selectedStatus === 'active' ? 'Create a new escrow to get started' : `No ${selectedStatus} escrows in the system`}
                  </Typography>
                </Paper>
              );
            } else {
              // Use virtualization for large lists (50+ escrows) to improve performance
              // For smaller lists, use regular rendering to maintain grid layout
              const useVirtualization = sortedEscrows.length >= 50;

              if (useVirtualization) {
                // Calculate dynamic height: viewport height minus header/padding (~400px)
                const dynamicHeight = Math.max(600, window.innerHeight - 400);

                return (
                  <Box sx={{ gridColumn: '1 / -1', width: '100%' }}>
                    <VirtualizedEscrowList
                      escrows={sortedEscrows}
                      viewMode={viewMode}
                      animationType={animationType}
                      animationDuration={animationDuration}
                      animationIntensity={animationIntensity}
                      onArchive={handleArchive}
                      onUpdate={handleUpdateEscrow}
                      containerHeight={dynamicHeight}
                    />
                  </Box>
                );
              } else {
                return sortedEscrows.map((escrow, index) => (
                  <EscrowCard
                    key={escrow.id}
                    escrow={escrow}
                    viewMode={viewMode}
                    animationType={animationType}
                    animationDuration={animationDuration}
                    animationIntensity={animationIntensity}
                    index={index}
                    onArchive={handleArchive}
                    onUpdate={handleUpdateEscrow}
                  />
                ));
              }
            }
          })()}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMorePages && !loading && selectedStatus !== 'archived' && (
          <Box sx={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            mb: 2
          }}>
            <Button
              variant="outlined"
              size="large"
              onClick={loadMoreEscrows}
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
              {loadingMore ? 'Loading...' : `Load More (${totalCount - escrows.length} remaining)`}
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default EscrowContent;