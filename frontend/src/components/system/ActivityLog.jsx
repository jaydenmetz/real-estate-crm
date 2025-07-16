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
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Card,
  CardContent,
  Tooltip,
  Badge,
  Grid,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  MoreVert,
  Home,
  Person,
  Event,
  Description,
  TrendingUp,
  Business,
  Edit,
  Delete,
  Add,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Download,
  Timeline,
  Assessment,
  Email,
  Phone,
  Message,
  Visibility,
} from '@mui/icons-material';
import { format, formatDistanceToNow, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const ActivityLog = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Mock activity data
  const mockActivities = [
    {
      id: 1,
      type: 'escrow',
      action: 'created',
      title: 'New Escrow Created',
      description: 'Created escrow for 123 Main St, Anytown, CA',
      user: 'Jayden Metz',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      entityId: 'ESC-2025-001',
      entityType: 'escrow',
      metadata: {
        address: '123 Main St, Anytown, CA',
        price: '$485,000',
        parties: 'Henderson → Smith',
      },
    },
    {
      id: 2,
      type: 'lead',
      action: 'converted',
      title: 'Lead Converted to Client',
      description: 'Sarah Chen converted from lead to active client',
      user: 'AI Agent - Alex',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      entityId: 'CL-2025-156',
      entityType: 'client',
      metadata: {
        leadScore: 92,
        conversionTime: '3 days',
      },
    },
    {
      id: 3,
      type: 'appointment',
      action: 'scheduled',
      title: 'Appointment Scheduled',
      description: 'Property showing scheduled with Johnson Family',
      user: 'Jayden Metz',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      entityId: 'APT-2025-042',
      entityType: 'appointment',
      metadata: {
        date: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy'),
        time: '2:00 PM',
        location: '456 Oak Ave',
      },
    },
    {
      id: 4,
      type: 'listing',
      action: 'updated',
      title: 'Listing Price Reduced',
      description: 'Price reduced for 789 Pine St from $565,000 to $549,000',
      user: 'Jayden Metz',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      entityId: 'MLS123456',
      entityType: 'listing',
      metadata: {
        oldPrice: '$565,000',
        newPrice: '$549,000',
        reduction: '$16,000 (2.8%)',
      },
    },
    {
      id: 5,
      type: 'client',
      action: 'note',
      title: 'Client Note Added',
      description: 'Added follow-up note for Martinez Family',
      user: 'AI Agent - Alex',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      entityId: 'CL-2025-089',
      entityType: 'client',
      metadata: {
        note: 'Interested in viewing properties in Westside neighborhood',
      },
    },
    {
      id: 6,
      type: 'email',
      action: 'sent',
      title: 'Marketing Email Sent',
      description: 'Monthly newsletter sent to 156 subscribers',
      user: 'System',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      entityId: 'EM-2025-015',
      entityType: 'email',
      metadata: {
        recipients: 156,
        openRate: '42%',
        clickRate: '12%',
      },
    },
    {
      id: 7,
      type: 'escrow',
      action: 'milestone',
      title: 'Inspection Completed',
      description: 'Home inspection completed for 456 Oak Ave',
      user: 'Jayden Metz',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      entityId: 'ESC-2025-002',
      entityType: 'escrow',
      metadata: {
        result: 'Passed with minor issues',
        nextStep: 'Appraisal scheduled',
      },
    },
    {
      id: 8,
      type: 'system',
      action: 'integration',
      title: 'MLS Data Synced',
      description: 'Successfully synced 23 new listings from MLS',
      user: 'System',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      entityId: 'SYNC-2025-142',
      entityType: 'system',
      metadata: {
        newListings: 23,
        updated: 45,
        errors: 0,
      },
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type, action) => {
    const iconMap = {
      escrow: <Business />,
      listing: <Home />,
      client: <Person />,
      lead: <TrendingUp />,
      appointment: <Event />,
      email: <Email />,
      phone: <Phone />,
      message: <Message />,
      system: <Assessment />,
    };
    return iconMap[type] || <Info />;
  };

  const getActivityColor = (action) => {
    const colorMap = {
      created: 'success',
      updated: 'info',
      deleted: 'error',
      completed: 'success',
      scheduled: 'primary',
      cancelled: 'error',
      sent: 'info',
      converted: 'success',
      milestone: 'warning',
      integration: 'default',
      note: 'default',
    };
    return colorMap[action] || 'default';
  };

  const formatTimestamp = (timestamp) => {
    // Validate timestamp
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      return 'Unknown time';
    }
    
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM dd, yyyy h:mm a');
    }
  };

  const handleMenuClick = (event, activity) => {
    setAnchorEl(event.currentTarget);
    setSelectedActivity(activity);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActivity(null);
  };

  const handleViewDetails = () => {
    if (selectedActivity) {
      const routeMap = {
        escrow: `/escrows/${selectedActivity.entityId}`,
        listing: `/listings/${selectedActivity.entityId}`,
        client: `/clients/${selectedActivity.entityId}`,
        appointment: `/appointments/${selectedActivity.entityId}`,
        lead: `/leads/${selectedActivity.entityId}`,
      };
      const route = routeMap[selectedActivity.entityType];
      if (route) {
        navigate(route);
      }
    }
    handleMenuClose();
  };

  const handleExport = () => {
    enqueueSnackbar('Activity log exported successfully', { variant: 'success' });
    handleMenuClose();
  };

  const filteredActivities = activities.filter(activity => {
    // Filter by search term
    if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by type
    if (filterType !== 'all' && activity.type !== filterType) {
      return false;
    }

    // Filter by date
    if (filterDate !== 'all') {
      const activityDate = startOfDay(activity.timestamp);
      const now = new Date();
      
      switch (filterDate) {
        case 'today':
          if (!isToday(activity.timestamp)) return false;
          break;
        case 'yesterday':
          if (!isYesterday(activity.timestamp)) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (activity.timestamp < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (activity.timestamp < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    if (!activity.timestamp || isNaN(new Date(activity.timestamp).getTime())) {
      return groups;
    }
    const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  const activityStats = {
    total: activities.length,
    today: activities.filter(a => a.timestamp && !isNaN(new Date(a.timestamp).getTime()) && isToday(new Date(a.timestamp))).length,
    byType: activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {}),
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Activity Log
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<Download />}
            variant="outlined"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            startIcon={<Refresh />}
            variant="outlined"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Activities
              </Typography>
              <Typography variant="h4">
                {activityStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Today's Activities
              </Typography>
              <Typography variant="h4">
                {activityStats.today}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Since midnight
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Most Active
              </Typography>
              <Typography variant="h6">
                {Object.entries(activityStats.byType)
                  .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity type
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4">
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Including AI agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search activities..."
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
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="escrow">Escrows</MenuItem>
                <MenuItem value="listing">Listings</MenuItem>
                <MenuItem value="client">Clients</MenuItem>
                <MenuItem value="lead">Leads</MenuItem>
                <MenuItem value="appointment">Appointments</MenuItem>
                <MenuItem value="email">Emails</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Date</InputLabel>
              <Select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Activity List */}
      <Paper>
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <Box key={date}>
            <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {isToday(new Date(date)) ? 'Today' :
                 isYesterday(new Date(date)) ? 'Yesterday' :
                 format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
            <List>
              {dateActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Badge
                        badgeContent={
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: `${getActivityColor(activity.action)}.main`,
                              borderRadius: '50%',
                            }}
                          />
                        }
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar sx={{ bgcolor: `${getActivityColor(activity.action)}.light` }}>
                          {getActivityIcon(activity.type, activity.action)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {activity.title}
                          </Typography>
                          <Chip
                            label={activity.type}
                            size="small"
                            variant="outlined"
                          />
                          {activity.user.includes('AI Agent') && (
                            <Chip
                              label="AI"
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          {activity.metadata && (
                            <Box sx={{ mt: 1 }}>
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {activity.user} • {formatTimestamp(activity.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuClick(e, activity)}
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < dateActivities.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ))}
        
        {filteredActivities.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No activities found matching your filters
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Delete Entry
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ActivityLog;