import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Security,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error,
  Warning,
  Info,
  Shield,
  Timeline,
  Assessment
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../../services/api.service';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const SecurityDashboard = () => {
  const theme = useTheme();
  const [expandedRow, setExpandedRow] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch recent security events (React Query v5)
  const { data: recentEvents, isLoading: loadingRecent } = useQuery({
    queryKey: ['security-events-recent'],
    queryFn: async () => {
      const response = await api.get('/security-events/recent');
      return response.data.data;
    },
  });

  // Fetch security stats (React Query v5)
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['security-events-stats'],
    queryFn: async () => {
      const response = await api.get('/security-events/stats?daysBack=30');
      return response.data.data;
    },
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <Error fontSize="small" />;
      case 'error':
        return <Error fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'info':
        return <Info fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getEventTypeLabel = (eventType) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'authentication':
        return theme.palette.primary.main;
      case 'authorization':
        return theme.palette.secondary.main;
      case 'api_key':
        return theme.palette.info.main;
      case 'account':
        return theme.palette.warning.main;
      case 'suspicious':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loadingRecent || loadingStats) {
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
        <Shield color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Security Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor your account security events and login history
          </Typography>
        </Box>
      </Stack>

      {/* Statistics Cards */}
      {statsData?.stats && statsData.stats.length > 0 && (
        <Stack direction="row" spacing={2} mb={3}>
          {statsData.stats.map((stat) => (
            <Card
              key={stat.event_category}
              sx={{
                flex: 1,
                borderLeft: `4px solid ${getCategoryColor(stat.event_category)}`
              }}
            >
              <CardContent>
                <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                  {stat.event_category.replace('_', ' ')}
                </Typography>
                <Typography variant="h4" fontWeight="bold" my={1}>
                  {stat.total_events}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`${stat.successful_events} success`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  {parseInt(stat.failed_events) > 0 && (
                    <Chip
                      label={`${stat.failed_events} failed`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Alert for failed events */}
      {statsData?.stats?.some(s => parseInt(s.failed_events) > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<Warning />}>
          You have failed authentication attempts in the last 30 days. Review your security events below.
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<Timeline />} label="Recent Activity" iconPosition="start" />
          <Tab icon={<Assessment />} label="All Events" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Recent Activity Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}></TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentEvents?.slice(0, 10).map((event) => (
                <React.Fragment key={event.id}>
                  <TableRow
                    hover
                    sx={{
                      cursor: 'pointer',
                      bgcolor: expandedRow === event.id ? alpha(theme.palette.primary.main, 0.05) : 'inherit'
                    }}
                    onClick={() => setExpandedRow(expandedRow === event.id ? null : event.id)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {expandedRow === event.id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getSeverityIcon(event.severity)}
                        <Typography variant="body2">
                          {getEventTypeLabel(event.event_type)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.event_category.replace('_', ' ')}
                        size="small"
                        sx={{
                          bgcolor: alpha(getCategoryColor(event.event_category), 0.1),
                          color: getCategoryColor(event.event_category),
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={format(new Date(event.created_at), 'PPpp')}>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(event.created_at), 'MMM d, h:mm a')}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {event.ip_address || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {event.success ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Success"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          icon={<Error />}
                          label="Failed"
                          size="small"
                          color="error"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedRow === event.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Event Details
                          </Typography>
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="body2" color="text.secondary" width={120}>
                                Message:
                              </Typography>
                              <Typography variant="body2">
                                {event.message || 'No message'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="body2" color="text.secondary" width={120}>
                                User Agent:
                              </Typography>
                              <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                                {event.user_agent || 'N/A'}
                              </Typography>
                            </Stack>
                            {event.request_path && (
                              <Stack direction="row" spacing={2}>
                                <Typography variant="body2" color="text.secondary" width={120}>
                                  Request:
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                  {event.request_method} {event.request_path}
                                </Typography>
                              </Stack>
                            )}
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <Stack direction="row" spacing={2}>
                                <Typography variant="body2" color="text.secondary" width={120}>
                                  Metadata:
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                                  {JSON.stringify(event.metadata, null, 2)}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* All Events Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentEvents?.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>{getEventTypeLabel(event.event_type)}</TableCell>
                  <TableCell>
                    <Chip
                      label={event.severity}
                      size="small"
                      color={getSeverityColor(event.severity)}
                    />
                  </TableCell>
                  <TableCell>{format(new Date(event.created_at), 'PPp')}</TableCell>
                  <TableCell>
                    {event.success ? (
                      <CheckCircle fontSize="small" color="success" />
                    ) : (
                      <Error fontSize="small" color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
};

export default SecurityDashboard;
