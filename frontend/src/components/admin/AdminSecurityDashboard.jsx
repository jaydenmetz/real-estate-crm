import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha
} from '@mui/material';
import {
  Shield,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
  Person,
  LocationOn,
  Security,
  Download,
  Delete,
  Visibility
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../../services/api.service';

const AdminSecurityDashboard = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch critical events (admin only) (React Query v5)
  const { data: criticalEvents, isLoading: loadingCritical } = useQuery({
    queryKey: ['critical-events'],
    queryFn: async () => {
      const response = await api.get('/security-events/critical?daysBack=7');
      return response.data.data;
    },
  });

  // Fetch all event statistics (React Query v5)
  const { data: allStats, isLoading: loadingStats } = useQuery({
    queryKey: ['all-security-stats'],
    queryFn: async () => {
      const response = await api.get('/security-events/stats?daysBack=30');
      return response.data.data;
    },
  });

  // Export user events
  const exportMutation = useMutation(
    async (userId) => {
      const response = await api.get(`/gdpr/security-events/export?userId=${userId}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `security-events-${userId}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return response.data;
    },
    {
      onSuccess: () => {
        setExportDialogOpen(false);
      }
    }
  );

  // Delete user events
  const deleteMutation = useMutation(
    async (userId) => {
      const response = await api.delete(`/gdpr/security-events/user/${userId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('critical-events');
        queryClient.invalidateQueries('all-security-stats');
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      }
    }
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loadingCritical || loadingStats) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Shield color="error" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            System Security Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor security events across all users
          </Typography>
        </Box>
      </Stack>

      {/* Statistics Grid */}
      {allStats?.stats && allStats.stats.length > 0 && (
        <Grid container spacing={3} mb={3}>
          {allStats.stats.map((stat) => (
            <Grid item xs={12} sm={6} md={4} key={stat.event_category}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                    {stat.event_category.replace('_', ' ')}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" my={1}>
                    {stat.total_events}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      icon={<CheckCircle />}
                      label={`${stat.successful_events} success`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    {parseInt(stat.failed_events) > 0 && (
                      <Chip
                        icon={<ErrorIcon />}
                        label={`${stat.failed_events} failed`}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  {parseInt(stat.critical_events) > 0 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {stat.critical_events} critical events
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Critical Events Alert */}
      {criticalEvents && criticalEvents.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }} icon={<Warning />}>
          <Typography variant="subtitle2" fontWeight="bold">
            {criticalEvents.length} Critical Security Events in Last 7 Days
          </Typography>
          <Typography variant="body2">
            Review and take action on critical security events below
          </Typography>
        </Alert>
      )}

      {/* Critical Events Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Critical Events (Last 7 Days)
          </Typography>
          {criticalEvents && criticalEvents.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {criticalEvents.map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ErrorIcon color="error" fontSize="small" />
                          <Typography variant="body2">
                            {event.event_type.replace(/_/g, ' ')}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Person fontSize="small" />
                          <Typography variant="body2">
                            {event.email || event.username || 'Unknown'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOn fontSize="small" />
                          <Typography variant="body2" fontFamily="monospace">
                            {event.ip_address || 'N/A'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error">
                          {event.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Export User Events">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(event.user_id);
                                setExportDialogOpen(true);
                              }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View User Events">
                            <IconButton size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">
              No critical events in the last 7 days
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Security Events</DialogTitle>
        <DialogContent>
          <Typography>
            Export all security events for user ID: {selectedUser}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            This will download a CSV file with all security events for this user.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => exportMutation.mutate(selectedUser)}
            disabled={exportMutation.isLoading}
          >
            {exportMutation.isLoading ? 'Exporting...' : 'Export CSV'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Security Events</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Delete all security events for user ID: {selectedUser}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            This is typically used for GDPR compliance (right to erasure).
            Consider exporting the data first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteMutation.mutate(selectedUser)}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete Events'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSecurityDashboard;
