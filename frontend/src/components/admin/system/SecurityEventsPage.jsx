import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Grid,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Search,
  Refresh,
  Security,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Lock,
  LockOpen,
  Key,
  Login,
  Logout,
  Shield,
  FilterList,
  Download,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import { api } from '../../../services/api.service';

const SecurityEventsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 50 });
  const [stats, setStats] = useState(null);

  // Fetch security events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filterType !== 'all') params.event_type = filterType;
      if (filterSeverity !== 'all') params.severity = filterSeverity;

      const response = await api.get('/security-events', { params });

      if (response.data.success) {
        setEvents(response.data.data.events || []);
        setStats(response.data.data.stats || null);
      } else {
        throw new Error(response.data.error?.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching security events:', error);
      enqueueSnackbar(error.message || 'Failed to load security events', { variant: 'error' });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [pagination, filterType, filterSeverity]);

  // Filter events by search term
  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.email?.toLowerCase().includes(searchLower) ||
      event.message?.toLowerCase().includes(searchLower) ||
      event.ip_address?.toLowerCase().includes(searchLower) ||
      event.event_type?.toLowerCase().includes(searchLower)
    );
  });

  // Get icon for event type
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'login_success':
        return <Login color="success" />;
      case 'login_failed':
        return <Warning color="error" />;
      case 'account_locked':
        return <Lock color="error" />;
      case 'lockout_attempt_while_locked':
        return <Shield color="error" />;
      case 'token_refresh':
        return <Refresh color="info" />;
      case 'api_key_created':
        return <Key color="primary" />;
      case 'api_key_used':
        return <Key color="info" />;
      default:
        return <Security color="action" />;
    }
  };

  // Get color for severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get chip color for event type
  const getEventTypeColor = (eventType) => {
    if (eventType.includes('failed') || eventType.includes('locked')) return 'error';
    if (eventType.includes('success') || eventType.includes('created')) return 'success';
    return 'default';
  };

  // Format event type for display
  const formatEventType = (eventType) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Export events as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-events-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    enqueueSnackbar('Security events exported', { variant: 'success' });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security fontSize="large" />
          Security Events
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and monitor authentication and security-related events
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Events (24h)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.total_24h || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Failed Logins (24h)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {stats.failed_logins_24h || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Successful Logins (24h)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {stats.successful_logins_24h || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Account Lockouts (24h)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {stats.lockouts_24h || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by email, IP, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={filterType}
              label="Event Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="login_success">Login Success</MenuItem>
              <MenuItem value="login_failed">Login Failed</MenuItem>
              <MenuItem value="account_locked">Account Locked</MenuItem>
              <MenuItem value="token_refresh">Token Refresh</MenuItem>
              <MenuItem value="api_key_created">API Key Created</MenuItem>
              <MenuItem value="api_key_used">API Key Used</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={filterSeverity}
              label="Severity"
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchEvents}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Stack>
      </Paper>

      {/* Events List */}
      <Paper sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredEvents.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Security sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              No security events found
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: event.success ? 'success.light' : 'error.light',
                      }}
                    >
                      {getEventIcon(event.event_type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {formatEventType(event.event_type)}
                        </Typography>
                        <Chip
                          label={event.severity}
                          size="small"
                          color={getSeverityColor(event.severity)}
                        />
                        {event.success !== null && (
                          <Chip
                            label={event.success ? 'Success' : 'Failed'}
                            size="small"
                            color={event.success ? 'success' : 'error'}
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.primary">
                          {event.message}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          {event.email && (
                            <Typography variant="caption" color="text.secondary">
                              User: {event.email}
                            </Typography>
                          )}
                          {event.ip_address && (
                            <Typography variant="caption" color="text.secondary">
                              IP: {event.ip_address}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Pagination Info */}
      {!loading && filteredEvents.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SecurityEventsPage;
