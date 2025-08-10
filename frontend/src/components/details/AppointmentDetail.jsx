import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Menu,
  MenuItem,
  Stack,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import DebugCard from '../common/DebugCard';
import DetailPageErrorBoundary from '../common/DetailPageErrorBoundary';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Edit,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  AccessTime,
  CheckCircle,
  Cancel,
  Schedule,
  VideoCall,
  Home,
  Business,
  People,
  Assignment,
  Description,
  Notifications,
  MoreVert,
  Map,
  DirectionsCar,
  Star,
  StarBorder,
  Send,
  Add,
  BugReport,
  ExpandMore,
  ExpandLess,
  Storage,
  Refresh,
  Error as ErrorIcon,
  Analytics,
  DataObject,
  NetworkCheck,
  Info,
  Warning,
} from '@mui/icons-material';
import { format, formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import networkMonitor from '../../services/networkMonitor';
import api from '../../services/api';

// Safe date parsing helper
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // If it's already a Date object, return it
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // Try to parse the date string
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// Safe date formatting helper
const safeFormatDate = (dateValue, formatString, fallback = 'N/A') => {
  const date = safeParseDate(dateValue);
  if (!date) return fallback;
  
  try {
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

// Safe formatDistanceToNow helper
const safeFormatDistanceToNow = (dateValue, options = {}, fallback = 'N/A') => {
  const date = safeParseDate(dateValue);
  if (!date) return fallback;
  
  try {
    return formatDistanceToNow(date, options);
  } catch (error) {
    console.error('Error formatting distance to now:', error);
    return fallback;
  }
};

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [checklistItems, setChecklistItems] = useState({});
  const [attendees, setAttendees] = useState([]);
  const [relatedProperty, setRelatedProperty] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });

  // Debug logging
  console.log('[AppointmentDetail] Component mounted');
  console.log('[AppointmentDetail] ID received:', id);
  console.log('[AppointmentDetail] Window location:', window.location.href);

  // Auto-refresh network data when debug panel is expanded
  useEffect(() => {
    if (debugExpanded) {
      const interval = setInterval(() => {
        setNetworkData({
          stats: networkMonitor.getStats(),
          requests: networkMonitor.getRequests(),
          errors: networkMonitor.getErrors()
        });
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [debugExpanded]);

  // Mock data for development
  const mockAppointments = {
    '1': {
      id: 1,
      title: 'Buyer Consultation',
      date: '2024-01-20',
      start_time: '10:00:00',
      end_time: '11:00:00',
      appointment_type: 'Buyer Consultation',
      status: 'Scheduled',
      location: { 
        address: '123 Main St, Bakersfield, CA 93301',
        parking_info: 'Free parking available in front',
        coordinates: { lat: 35.3733, lng: -119.0187 }
      },
      virtual_meeting_link: null,
      property_address: '456 Oak Ave, Bakersfield, CA 93301',
      outcome: null,
      notes: {
        preparation: 'Review client preferences and budget requirements',
        agenda: [
          'Discuss buyer needs and preferences',
          'Review financing options',
          'Set up property search criteria',
          'Schedule property tours'
        ],
        materials_needed: [
          'Buyer agreement forms',
          'Market analysis reports',
          'Financing calculator',
          'Area maps'
        ]
      },
      attendees: [
        { id: 1, name: 'John Doe', email: 'john.doe@email.com', phone: '(555) 123-4567', confirmed: true, type: 'client' },
        { id: 2, name: 'Agent Name', email: 'agent@realty.com', phone: '(555) 987-6543', confirmed: true, type: 'agent' }
      ],
      reminders: [
        { time_before: '24 hours', type: 'Email', recipients: ['All Attendees'] },
        { time_before: '1 hour', type: 'SMS', recipients: ['John Doe'] }
      ],
      checklist: {},
      activities: [
        {
          id: 1,
          type: 'created',
          description: 'Appointment created',
          timestamp: '2024-01-10T14:30:00',
          user: 'System'
        },
        {
          id: 2,
          type: 'updated',
          description: 'Location updated',
          timestamp: '2024-01-11T09:15:00',
          user: 'Agent'
        },
        {
          id: 3,
          type: 'reminder',
          description: 'Reminder sent to all attendees',
          timestamp: '2024-01-19T10:00:00',
          user: 'System'
        }
      ]
    },
    '2': {
      id: 2,
      title: 'Property Showing - 456 Oak Ave',
      date: '2024-01-16',
      start_time: '14:00:00',
      end_time: '16:00:00',
      appointment_type: 'Property Showing',
      status: 'Scheduled',
      location: { 
        address: '456 Oak Ave, Bakersfield, CA 93301',
        parking_info: 'Driveway parking available',
        coordinates: { lat: 35.3733, lng: -119.0187 }
      },
      virtual_meeting_link: 'https://zoom.us/j/123456789',
      property_address: '456 Oak Ave, Bakersfield, CA 93301',
      outcome: null,
      notes: {
        preparation: 'Property is vacant, lockbox code: 1234',
        agenda: [
          'Tour all rooms and features',
          'Discuss property history',
          'Review comparable sales',
          'Address client questions'
        ],
        materials_needed: [
          'Property feature sheet',
          'Comparable sales report',
          'Disclosure documents',
          'Feedback form'
        ]
      },
      attendees: [
        { id: 3, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '(555) 234-5678', confirmed: true, type: 'client' },
        { id: 2, name: 'Agent Name', email: 'agent@realty.com', phone: '(555) 987-6543', confirmed: true, type: 'agent' }
      ],
      reminders: [
        { time_before: '24 hours', type: 'Email', recipients: ['All Attendees'] },
        { time_before: '2 hours', type: 'SMS', recipients: ['Jane Smith'] }
      ],
      checklist: {},
      activities: []
    }
  };

  const mockAnalytics = {
    related_appointments: [
      { id: 3, title: 'Follow-up Meeting', date: '2024-01-20', status: 'Scheduled' },
      { id: 4, title: 'Property Tour #2', date: '2024-01-18', status: 'Scheduled' }
    ]
  };

  useEffect(() => {
    fetchAppointmentDetails();
    fetchAnalytics();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response.data);
      setChecklistItems(response.data.checklist || {});
      setAttendees(response.data.attendees || []);
      
      if (response.data.property_address) {
        fetchRelatedProperty(response.data.property_address);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setError(err);
      
      // Use mock data as fallback
      const mockAppointment = mockAppointments[id];
      if (mockAppointment) {
        setAppointment(mockAppointment);
        setChecklistItems(mockAppointment.checklist || {});
        setAttendees(mockAppointment.attendees || []);
      }
      
      setLoading(false);
    }
  };

  const fetchRelatedProperty = async (address) => {
    try {
      const response = await api.get(`/properties/search?address=${encodeURIComponent(address)}`);
      if (response.data && response.data.length > 0) {
        setRelatedProperty(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching related property:', error);
      // Mock property data
      setRelatedProperty({
        id: 1,
        address: address,
        price: '$475,000',
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2500,
        yearBuilt: 2015
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/appointments/${id}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(mockAnalytics);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChecklistToggle = async (category, item) => {
    const updatedChecklist = {
      ...checklistItems,
      [category]: {
        ...checklistItems[category],
        [item]: !checklistItems[category]?.[item]
      }
    };
    
    setChecklistItems(updatedChecklist);
    
    try {
      await api.put(`/appointments/${id}/checklist`, { checklist: updatedChecklist });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Scheduled': 'primary',
      'Confirmed': 'success',
      'In Progress': 'warning',
      'Completed': 'default',
      'Cancelled': 'error',
      'No Show': 'error'
    };
    return statusColors[status] || 'default';
  };

  const getAppointmentTypeIcon = (type) => {
    const icons = {
      'Property Showing': <Home />,
      'Listing Presentation': <Business />,
      'Buyer Consultation': <People />,
      'Open House': <Home />,
      'Closing': <Assignment />,
      'Inspection': <CheckCircle />,
      'Virtual Meeting': <VideoCall />,
    };
    return icons[type] || <CalendarToday />;
  };

  const getTimeUntilAppointment = () => {
    if (!appointment) return null;
    const appointmentDate = safeParseDate(`${appointment.date}T${appointment.start_time}`);
    if (!appointmentDate) return null;
    const now = new Date();
    const isPastAppointment = isPast(appointmentDate);
    const minutesUntil = differenceInMinutes(appointmentDate, now);
    
    return {
      isPast: isPastAppointment,
      minutesUntil,
      timeString: safeFormatDistanceToNow(appointmentDate, { addSuffix: true })
    };
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    // Add note logic here
    console.log('Adding note:', newNote);
    setNewNote('');
  };

  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container>
        <Alert severity="error">Appointment not found</Alert>
      </Container>
    );
  }

  const timeUntil = getTimeUntilAppointment();
  const startTime = safeParseDate(`2000-01-01T${appointment.start_time}`);
  const endTime = safeParseDate(`2000-01-01T${appointment.end_time}`);
  const duration = appointment.start_time && appointment.end_time && startTime && endTime ? 
    differenceInMinutes(endTime, startTime) : 0;

  return (
    <Container maxWidth="xl">
      {/* Stunning Debug Interface - Admin Only */}
      {user?.username === 'admin' && (
        <Box sx={{ mb: 4, mt: 2 }}>
          {/* Summary Debug Card */}
          <Card 
            sx={(theme) => ({
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.08)} 50%, 
                ${alpha(theme.palette.error.main, 0.08)} 100%
              )`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: '16px',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 33%, 
                  ${theme.palette.error.main} 66%, 
                  ${theme.palette.warning.main} 100%
                )`,
              }
            })}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={(theme) => ({
                      p: 1.5,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                    })}
                  >
                    <BugReport />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                    Debug Panel: Appointment Detail
                  </Typography>
                  <Chip 
                    label={process.env.NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟢 LOCAL'} 
                    sx={{
                      background: process.env.NODE_ENV === 'production' 
                        ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)'
                        : 'linear-gradient(45deg, #00b894, #00cec9)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip 
                    label="Admin Only" 
                    sx={{
                      background: 'linear-gradient(45deg, #fdcb6e, #e17055)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setDebugExpanded(!debugExpanded)}
                    startIcon={debugExpanded ? <ExpandLess /> : <ExpandMore />}
                    sx={(theme) => ({
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.1)
                      }
                    })}
                  >
                    {debugExpanded ? 'Hide' : 'Show'} Debug Details
                  </Button>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      // Update network data from network monitor
                      setNetworkData({
                        stats: networkMonitor.getStats(),
                        requests: networkMonitor.getRequests(),
                        errors: networkMonitor.getErrors()
                      });
                      console.log('[AppointmentDetail] Network data refreshed');
                    }}
                    sx={(theme) => ({
                      color: theme.palette.primary.main,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1)
                      }
                    })}
                  >
                    <Tooltip title="Refresh Network Data">
                      <Refresh />
                    </Tooltip>
                  </IconButton>
                  <CopyButton 
                    text={JSON.stringify({
                      pageInfo: {
                        url: window.location.href,
                        timestamp: new Date().toISOString(),
                        user: user?.username,
                        appointmentId: id,
                        userAgent: navigator.userAgent,
                        screenResolution: `${window.screen.width}x${window.screen.height}`
                      },
                      appointmentData: appointment ? {
                        id: appointment.id,
                        title: appointment.title,
                        type: appointment.appointment_type,
                        status: appointment.status,
                        date: appointment.date,
                        startTime: appointment.start_time,
                        endTime: appointment.end_time,
                        duration: duration,
                        timeUntil: timeUntil,
                        location: appointment.location,
                        attendeeCount: attendees.length,
                        notes: appointment.notes
                      } : null,
                      loadingState: {
                        isLoading: loading,
                        isError: !!error,
                        hasData: !!appointment,
                        errorMessage: error
                      },
                      networkActivity: {
                        stats: networkData.stats,
                        recentRequests: networkData.requests.slice(-5),
                        errorCount: networkData.stats.errors,
                        allRequests: networkData.requests,
                        allErrors: networkData.errors
                      },
                      browserInfo: {
                        location: window.location,
                        localStorage: {
                          hasUser: !!localStorage.getItem('user'),
                          userKeys: Object.keys(localStorage)
                        }
                      }
                    }, null, 2)}
                    label="📋 Copy Debug Summary"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2, #667eea)',
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Detailed Debug Panel */}
          <Collapse in={debugExpanded}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Appointment Statistics */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Analytics /> Appointment Statistics
                    </Typography>
                    {appointment && (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Type</Typography>
                          <Typography variant="h6">{appointment.appointment_type}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Typography variant="h6">{appointment.status}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Duration</Typography>
                          <Typography variant="h6">{duration} min</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Attendees</Typography>
                          <Typography variant="h6">{attendees.length}</Typography>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                </Card>
              </Grid>

              {/* API & Network Info */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 169, 244, 0.1))',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NetworkCheck /> Network & API Status
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">API Endpoint</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {process.env.REACT_APP_API_URL || 'Not configured'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Environment</Typography>
                        <Chip 
                          label={process.env.NODE_ENV} 
                          size="small" 
                          color={process.env.NODE_ENV === 'production' ? 'error' : 'success'}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Network Requests</Typography>
                        <Typography variant="body2">{networkData.stats.total}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Network Errors</Typography>
                        <Typography variant="body2" color={networkData.stats.errors > 0 ? 'error' : 'inherit'}>
                          {networkData.stats.errors}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Error Rate</Typography>
                        <Typography variant="body2" color={networkData.stats.errorRate > 10 ? 'error' : 'inherit'}>
                          {networkData.stats.errorRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Avg Response Time</Typography>
                        <Typography variant="body2">
                          {networkData.stats.avgDuration.toFixed(0)}ms
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* Appointment Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Storage /> Appointment Details
                    </Typography>
                    {appointment && (
                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(0,0,0,0.03)', 
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ID: {appointment.id} | {appointment.status}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {appointment.title}
                        </Typography>
                        <Typography variant="body2">
                          Date: {safeFormatDate(appointment.date, 'PPP')}
                        </Typography>
                        <Typography variant="body2">
                          Time: {appointment.start_time} - {appointment.end_time}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Location: {appointment.location?.address || 'Not specified'}
                        </Typography>
                        <Typography variant="body2">
                          Time Until: {timeUntil}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Grid>

              {/* Network Activity Log */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(171, 71, 188, 0.1))',
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NetworkCheck /> Network Activity Log
                      <Chip 
                        label={`${networkData.requests.length} requests`} 
                        size="small" 
                        sx={{ ml: 'auto' }}
                      />
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <Stack spacing={1}>
                        {networkData.requests.slice(-10).reverse().map((req, index) => (
                          <Box 
                            key={req.id || index}
                            sx={{ 
                              p: 1.5, 
                              background: req.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              border: `1px solid ${req.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {req.method} {req.statusCode || 'PENDING'}
                              </Typography>
                              <Typography variant="caption">
                                {req.duration ? `${req.duration}ms` : 'pending...'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ 
                              display: 'block', 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }}>
                              {req.url}
                            </Typography>
                            {req.error && (
                              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                Error: {req.error}
                              </Typography>
                            )}
                          </Box>
                        ))}
                        {networkData.requests.length === 0 && (
                          <Typography variant="caption" color="text.secondary" align="center">
                            No network requests yet. Refresh to see latest activity.
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      )}

      <DebugCard 
        pageName="AppointmentDetail"
        id={id}
        isLoading={loading}
        isError={!!error}
        error={error}
        data={appointment}
        additionalInfo={{
          activeTab,
          hasAppointmentData: !!appointment,
          usingMockData: !!error && !!appointment,
          attendeeCount: attendees.length,
          hasRelatedProperty: !!relatedProperty
        }}
      />
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/appointments')}
          sx={{ textDecoration: 'none' }}
        >
          Appointments
        </Link>
        <Typography color="textPrimary">{appointment.title}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              {getAppointmentTypeIcon(appointment.appointment_type)}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>{appointment.title}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
                <Chip
                  label={appointment.appointment_type}
                  variant="outlined"
                  size="small"
                  icon={getAppointmentTypeIcon(appointment.appointment_type)}
                />
                {appointment.virtual_meeting_link && (
                  <Chip
                    label="Virtual Meeting"
                    color="secondary"
                    size="small"
                    icon={<VideoCall />}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2">
                    {safeFormatDate(appointment.date, 'EEEE, MMMM d, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2">
                    {safeFormatDate(`2000-01-01T${appointment.start_time}`, 'h:mm a')} - 
                    {safeFormatDate(`2000-01-01T${appointment.end_time}`, 'h:mm a')}
                    ({duration} minutes)
                  </Typography>
                </Box>
                {appointment.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">{appointment.location.address}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Edit Appointment</MenuItem>
              <MenuItem onClick={handleMenuClose}>Reschedule</MenuItem>
              <MenuItem onClick={handleMenuClose}>Send Reminder</MenuItem>
              <MenuItem onClick={handleMenuClose}>Convert to Virtual</MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                Cancel Appointment
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Time Until Alert */}
        {timeUntil && !timeUntil.isPast && appointment.status === 'Scheduled' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule />
              <Typography variant="body2">
                This appointment is {timeUntil.timeString}
              </Typography>
            </Box>
          </Alert>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Attendees" />
          <Tab label="Checklist" />
          <Tab label="Notes & Activity" />
          <Tab label="Related" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Location Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Location Details</Typography>
                <List>
                  {appointment.virtual_meeting_link ? (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <VideoCall color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Virtual Meeting"
                          secondary={
                            <Link href={appointment.virtual_meeting_link} target="_blank">
                              Join Meeting
                            </Link>
                          }
                        />
                      </ListItem>
                    </>
                  ) : (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Meeting Location"
                          secondary={appointment.location?.address}
                        />
                      </ListItem>
                      {appointment.location?.parking_info && (
                        <ListItem>
                          <ListItemIcon>
                            <DirectionsCar color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Parking"
                            secondary={appointment.location.parking_info}
                          />
                        </ListItem>
                      )}
                    </>
                  )}
                  {appointment.property_address && (
                    <ListItem>
                      <ListItemIcon>
                        <Home color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Property Address"
                        secondary={appointment.property_address}
                      />
                    </ListItem>
                  )}
                </List>
                {appointment.location?.coordinates && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Map />}
                      fullWidth
                      onClick={() => {
                        const { lat, lng } = appointment.location.coordinates;
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                      }}
                    >
                      Get Directions
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Property Details Card */}
          {relatedProperty && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Property Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Price</Typography>
                      <Typography variant="body1">{relatedProperty.price}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Beds/Baths</Typography>
                      <Typography variant="body1">
                        {relatedProperty.bedrooms} / {relatedProperty.bathrooms}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Square Feet</Typography>
                      <Typography variant="body1">{relatedProperty.sqft} sqft</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Year Built</Typography>
                      <Typography variant="body1">{relatedProperty.yearBuilt}</Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/listings/${relatedProperty.id}`)}
                    >
                      View Full Listing
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Preparation Notes */}
          {appointment.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Preparation Notes</Typography>
                  <Typography variant="body2" paragraph>
                    {appointment.notes.preparation}
                  </Typography>
                  
                  {appointment.notes.agenda && appointment.notes.agenda.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Agenda
                      </Typography>
                      <List dense>
                        {appointment.notes.agenda.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircle fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                  
                  {appointment.notes.materials_needed && appointment.notes.materials_needed.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Materials Needed
                      </Typography>
                      <List dense>
                        {appointment.notes.materials_needed.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Description fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Attendees ({attendees.length})</Typography>
                  <Button variant="outlined" size="small" startIcon={<Add />}>
                    Add Attendee
                  </Button>
                </Box>
                <List>
                  {attendees.map((attendee, index) => (
                    <React.Fragment key={attendee.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: attendee.type === 'client' ? 'primary.main' : 'secondary.main' }}>
                            {attendee.name.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {attendee.name}
                              <Chip
                                label={attendee.type}
                                size="small"
                                variant="outlined"
                              />
                              {attendee.confirmed && (
                                <Chip
                                  label="Confirmed"
                                  size="small"
                                  color="success"
                                  icon={<CheckCircle />}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Email fontSize="small" />
                                <Typography variant="caption">{attendee.email}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Phone fontSize="small" />
                                <Typography variant="caption">{attendee.phone}</Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <Box>
                          <IconButton size="small">
                            <Email />
                          </IconButton>
                          <IconButton size="small">
                            <Phone />
                          </IconButton>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Reminders */}
          {appointment.reminders && appointment.reminders.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Reminders Set</Typography>
                  <List>
                    {appointment.reminders.map((reminder, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Notifications color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${reminder.time_before} before`}
                          secondary={`${reminder.type} to ${reminder.recipients.join(', ')}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Pre-Appointment</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.preAppointment?.appointment_confirmed || false}
                        onChange={() => handleChecklistToggle('preAppointment', 'appointment_confirmed')}
                      />
                    }
                    label="Appointment Confirmed"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.preAppointment?.location_sent || false}
                        onChange={() => handleChecklistToggle('preAppointment', 'location_sent')}
                      />
                    }
                    label="Location/Directions Sent"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.preAppointment?.documents_prepared || false}
                        onChange={() => handleChecklistToggle('preAppointment', 'documents_prepared')}
                      />
                    }
                    label="Documents Prepared"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.preAppointment?.reminder_sent || false}
                        onChange={() => handleChecklistToggle('preAppointment', 'reminder_sent')}
                      />
                    }
                    label="Reminder Sent"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>During Appointment</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.duringAppointment?.arrived_on_time || false}
                        onChange={() => handleChecklistToggle('duringAppointment', 'arrived_on_time')}
                      />
                    }
                    label="Arrived On Time"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.duringAppointment?.presentation_complete || false}
                        onChange={() => handleChecklistToggle('duringAppointment', 'presentation_complete')}
                      />
                    }
                    label="Presentation Complete"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.duringAppointment?.questions_answered || false}
                        onChange={() => handleChecklistToggle('duringAppointment', 'questions_answered')}
                      />
                    }
                    label="Questions Answered"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.duringAppointment?.next_steps_discussed || false}
                        onChange={() => handleChecklistToggle('duringAppointment', 'next_steps_discussed')}
                      />
                    }
                    label="Next Steps Discussed"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Post-Appointment</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.postAppointment?.thank_you_sent || false}
                        onChange={() => handleChecklistToggle('postAppointment', 'thank_you_sent')}
                      />
                    }
                    label="Thank You Sent"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.postAppointment?.notes_updated || false}
                        onChange={() => handleChecklistToggle('postAppointment', 'notes_updated')}
                      />
                    }
                    label="Notes Updated"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.postAppointment?.followup_scheduled || false}
                        onChange={() => handleChecklistToggle('postAppointment', 'followup_scheduled')}
                      />
                    }
                    label="Follow-up Scheduled"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklistItems.postAppointment?.crm_updated || false}
                        onChange={() => handleChecklistToggle('postAppointment', 'crm_updated')}
                      />
                    }
                    label="CRM Updated"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Activity Timeline */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Activity Timeline</Typography>
                {appointment.activities && appointment.activities.length > 0 ? (
                  <Timeline>
                    {appointment.activities.map((activity, index) => (
                      <TimelineItem key={activity.id}>
                        <TimelineOppositeContent color="textSecondary">
                          {safeFormatDate(activity.timestamp, 'MMM d, h:mm a')}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color={
                            activity.type === 'created' ? 'primary' : 
                            activity.type === 'updated' ? 'secondary' : 
                            'grey'
                          } />
                          {index < appointment.activities.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" component="span">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            by {activity.user}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No activities recorded yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Add Note */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Add Note</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Send />}
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          {/* Related Appointments */}
          {analytics?.related_appointments && analytics.related_appointments.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Related Appointments</Typography>
                  <List>
                    {analytics.related_appointments.map((apt) => (
                      <ListItem
                        key={apt.id}
                        button
                        onClick={() => navigate(`/appointments/${apt.id}`)}
                      >
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary={apt.title}
                          secondary={safeFormatDate(apt.date, 'MMMM d, yyyy')}
                        />
                        <Chip
                          label={apt.status}
                          size="small"
                          color={getStatusColor(apt.status)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Quick Actions */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Send />}
          onClick={() => console.log('Send reminder')}
        >
          Send Reminder
        </Button>
      </Box>
    </Container>
  );
}

const AppointmentDetailWithErrorBoundary = () => (
  <DetailPageErrorBoundary pageName="AppointmentDetail">
    <AppointmentDetail />
  </DetailPageErrorBoundary>
);

export default AppointmentDetailWithErrorBoundary;