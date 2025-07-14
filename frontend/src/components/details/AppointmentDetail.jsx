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
} from '@mui/material';
import DetailPageDebugger from '../common/DetailPageDebugger';
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
} from '@mui/icons-material';
import { format, formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns';
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

  // Debug logging
  console.log('[AppointmentDetail] Component mounted');
  console.log('[AppointmentDetail] ID received:', id);
  console.log('[AppointmentDetail] Window location:', window.location.href);

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
      <DetailPageDebugger 
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