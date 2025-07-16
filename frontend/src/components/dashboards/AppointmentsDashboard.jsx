// frontend/src/components/dashboards/AppointmentsDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
  LinearProgress,
  CircularProgress,
  Fade,
  Grow,
  Zoom,
  Stack,
  ButtonGroup,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  CardActions,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  AvatarGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  TrendingUp,
  TrendingDown,
  Event,
  RemoveRedEye,
  FavoriteBorder,
  Favorite,
  DateRange,
  CameraAlt,
  LocationOn,
  LocalFireDepartment,
  Whatshot,
  NewReleases,
  AutoAwesome,
  Star,
  AttachMoney,
  Schedule,
  Groups,
  Assessment,
  Check,
  Close,
  MoreVert,
  Search,
  Sort,
  ViewList,
  ViewModule,
  Share,
  Print,
  Home,
  Group,
  Cancel,
  CheckCircle,
  Person,
  Email,
  Phone,
  Message,
  Timer,
  History,
  Timeline,
  ShowChart,
  Speed,
  Category,
  QrCode2,
  CloudUpload,
  Notifications,
  EmojiEvents,
  CalendarMonth,
  Today,
  CalendarToday,
  AccessTime,
  Alarm,
  AlarmOn,
  AlarmOff,
  NotificationsActive,
  VideoCall,
  MeetingRoom,
  Business,
  DirectionsCar,
  Map,
  Navigation,
  LocationCity,
  MyLocation,
  PinDrop,
  Place,
  Room,
  Explore,
  NearMe,
  PersonPin,
  LocationSearching,
  AddLocation,
  EditLocation,
  WrongLocation,
  GpsFixed,
  GpsNotFixed,
  GpsOff,
  Sync,
  SyncAlt,
  Cached,
  Refresh,
  Update,
  EventRepeat,
  EventAvailable,
  EventBusy,
  EventNote,
  MoreTime,
  AccessAlarm,
  AlarmAdd,
  Snooze,
  WatchLater,
  HourglassEmpty,
  HourglassFull,
  TimerOff,
  Timelapse,
  AccessTimeFilled,
  ScheduleSend,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import AppointmentForm from '../forms/AppointmentForm';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from 'recharts';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F57C00 0%, #FFB74D 100%)',
  color: 'white',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(245, 124, 0, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
}));

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(245, 124, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 124, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 124, 0, 0);
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const AppointmentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    '& .appointment-avatar': {
      transform: 'scale(1.1)',
    },
    '& .action-buttons': {
      opacity: 1,
    },
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  fontWeight: 600,
  ...(status === 'Scheduled' && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  }),
  ...(status === 'Completed' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === 'Cancelled' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  }),
  ...(status === 'No Show' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
}));

const MetricBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.background.paper,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const CalendarWrapper = styled(Box)(({ theme }) => ({
  '& .fc': {
    fontFamily: theme.typography.fontFamily,
  },
  '& .fc-toolbar-title': {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  '& .fc-button': {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      borderColor: theme.palette.primary.dark,
    },
  },
  '& .fc-event': {
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
  },
  '& .fc-daygrid-event': {
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5),
  },
}));

const AppointmentsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    status: [],
    location: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
  const [reminderSettings, setReminderSettings] = useState({
    email: true,
    sms: true,
    push: false,
  });
  
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Filter map for tabs
  const filterMap = ['all', 'today', 'upcoming', 'completed', 'cancelled'];
  const currentFilter = filterMap[tabValue];

  // Fetch appointments data
  const { data: appointmentsData, isLoading } = useQuery(
    ['appointments', currentFilter, selectedFilters, searchTerm, sortBy],
    async () => {
      try {
        const params = {};
        if (currentFilter !== 'all') {
          if (currentFilter === 'today') {
            params.date = new Date().toISOString().split('T')[0];
          } else {
            params.status = currentFilter;
          }
        }
        
        const response = await appointmentsAPI.getAll(params);
        
        if (response.data) {
          let appointments = Array.isArray(response.data) ? response.data : response.data.data || [];
          
          // Apply local filters
          if (searchTerm) {
            appointments = appointments.filter(apt => 
              apt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              apt.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              apt.clients?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
            );
          }
          
          // Apply advanced filters
          if (selectedFilters.type.length > 0) {
            appointments = appointments.filter(apt => 
              selectedFilters.type.includes(apt.appointmentType)
            );
          }
          
          // Sort appointments
          appointments.sort((a, b) => {
            switch (sortBy) {
              case 'date':
                return new Date(b.date + ' ' + b.startTime) - new Date(a.date + ' ' + a.startTime);
              case 'title':
                return (a.title || '').localeCompare(b.title || '');
              case 'type':
                return (a.appointmentType || '').localeCompare(b.appointmentType || '');
              default:
                return 0;
            }
          });
          
          return appointments;
        }
        return [];
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return getMockData();
      }
    },
    {
      refetchInterval: 30000,
      retry: 1,
    }
  );

  // Mock data fallback
  const getMockData = () => [
    {
      id: '1',
      title: 'Property Tour - 456 Oak Ave',
      date: '2024-01-20',
      startTime: '10:00',
      endTime: '11:00',
      appointmentType: 'Property Showing',
      status: 'Scheduled',
      location: { 
        address: '456 Oak Ave, San Diego, CA',
        coordinates: { lat: 32.7157, lng: -117.1611 }
      },
      clients: ['Michael & Sarah Thompson'],
      property: {
        id: 1,
        address: '456 Oak Ave',
        price: 1150000,
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
      },
      notes: 'Clients are very interested in this property',
      reminder: true,
    },
    {
      id: '2',
      title: 'Buyer Consultation',
      date: '2024-01-20',
      startTime: '14:00',
      endTime: '15:30',
      appointmentType: 'Buyer Consultation',
      status: 'Scheduled',
      location: { 
        address: 'Office - 123 Main St',
        coordinates: { lat: 32.7157, lng: -117.1611 }
      },
      clients: ['Emily Davis'],
      notes: 'First-time buyer, needs pre-approval guidance',
      reminder: true,
    },
    {
      id: '3',
      title: 'Listing Presentation',
      date: '2024-01-21',
      startTime: '16:00',
      endTime: '17:00',
      appointmentType: 'Listing Presentation',
      status: 'Scheduled',
      location: { 
        address: '789 Pine St, La Jolla, CA',
        coordinates: { lat: 32.8328, lng: -117.2713 }
      },
      clients: ['Robert Johnson'],
      notes: 'Prepare CMA and marketing plan',
      reminder: true,
    },
  ];

  const appointments = appointmentsData || [];

  // Calculate statistics
  const stats = {
    todayCount: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    upcomingCount: appointments.filter(a => a.status === 'Scheduled' && new Date(a.date) > new Date()).length,
    completedCount: appointments.filter(a => a.status === 'Completed').length,
    canceledCount: appointments.filter(a => a.status === 'Cancelled').length,
  };

  // Chart data
  const appointmentTypeData = [
    { name: 'Property Showing', value: appointments.filter(a => a.appointmentType === 'Property Showing').length, color: '#F57C00' },
    { name: 'Buyer Consultation', value: appointments.filter(a => a.appointmentType === 'Buyer Consultation').length, color: '#FF9800' },
    { name: 'Listing Presentation', value: appointments.filter(a => a.appointmentType === 'Listing Presentation').length, color: '#FFB74D' },
    { name: 'Other', value: appointments.filter(a => !['Property Showing', 'Buyer Consultation', 'Listing Presentation'].includes(a.appointmentType)).length, color: '#FFCC80' },
  ];

  const weeklyData = [
    { day: 'Mon', appointments: 3 },
    { day: 'Tue', appointments: 5 },
    { day: 'Wed', appointments: 4 },
    { day: 'Thu', appointments: 6 },
    { day: 'Fri', appointments: 8 },
    { day: 'Sat', appointments: 12 },
    { day: 'Sun', appointments: 2 },
  ];

  // Calendar events
  const calendarEvents = appointments.map(apt => ({
    id: apt.id,
    title: apt.title,
    start: `${apt.date}T${apt.startTime}`,
    end: apt.endTime ? `${apt.date}T${apt.endTime}` : undefined,
    backgroundColor: getEventColor(apt.status),
    extendedProps: {
      type: apt.appointmentType,
      clients: apt.clients,
      location: apt.location,
      status: apt.status,
    },
  }));

  function getEventColor(status) {
    switch (status) {
      case 'Scheduled': return theme.palette.primary.main;
      case 'Completed': return theme.palette.success.main;
      case 'Cancelled': return theme.palette.error.main;
      case 'No Show': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Property Showing': return <Home />;
      case 'Buyer Consultation': return <Groups />;
      case 'Listing Presentation': return <Business />;
      case 'Open House': return <MeetingRoom />;
      case 'Closing': return <CheckCircle />;
      default: return <Event />;
    }
  };

  const handleEventClick = (info) => {
    navigate(`/appointments/${info.event.id}`);
  };

  const handleDateClick = (info) => {
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'export':
        enqueueSnackbar('Exporting appointments...', { variant: 'info' });
        break;
      case 'sync':
        enqueueSnackbar('Syncing with calendar...', { variant: 'info' });
        break;
      case 'reminders':
        enqueueSnackbar('Sending reminders...', { variant: 'info' });
        break;
    }
    setActionsAnchorEl(null);
  };

  const renderCalendarView = () => (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <CalendarWrapper>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          editable={true}
          droppable={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          slotMinTime="07:00"
          slotMaxTime="20:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '18:00',
          }}
        />
      </CalendarWrapper>
    </Paper>
  );

  const renderListView = () => (
    <Grid container spacing={3}>
      <AnimatePresence>
        {appointments.map((appointment, index) => (
          <Grid item xs={12} sm={6} md={4} key={appointment.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AppointmentCard>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      className="appointment-avatar"
                      sx={{
                        width: 50,
                        height: 50,
                        mr: 2,
                        bgcolor: 'primary.main',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      {getTypeIcon(appointment.appointmentType)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {appointment.title}
                      </Typography>
                      <StatusChip
                        size="small"
                        label={appointment.status}
                        status={appointment.status}
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {safeFormatDate(appointment.date, 'MMMM d, yyyy')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {appointment.startTime} - {appointment.endTime || 'TBD'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" noWrap>
                        {appointment.location?.address || 'No location'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {appointment.clients?.join(', ') || 'No clients'}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  {appointment.property && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        src={appointment.property.image}
                        variant="rounded"
                        sx={{ width: 50, height: 50 }}
                      >
                        <Home />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {appointment.property.address}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          ${(appointment.property.price / 1000).toFixed(0)}K
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <Box
                    className="action-buttons"
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mt: 2,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<RemoveRedEye />}
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </AppointmentCard>
            </motion.div>
          </Grid>
        ))}
      </AnimatePresence>
    </Grid>
  );

  const columns = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
            {getTypeIcon(params.row.appointmentType)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.appointmentType}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'date',
      headerName: 'Date & Time',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {safeFormatDate(params.value, 'MMM d, yyyy')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.startTime} - {params.row.endTime || 'TBD'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      renderCell: (params) => params.value?.address || 'No location',
    },
    {
      field: 'clients',
      headerName: 'Clients',
      width: 200,
      renderCell: (params) => (
        <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
          {(params.value || []).map((client, idx) => (
            <Tooltip key={idx} title={client}>
              <Avatar sx={{ width: 30, height: 30 }}>
                {client[0]}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip label={params.value} status={params.value} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => navigate(`/appointments/${params.row.id}`)}
          >
            <RemoveRedEye />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedAppointment(params.row);
              setOpenForm(true);
            }}
          >
            <Edit />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <HeroSection>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Appointment Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                Schedule, track, and manage all your appointments in one place
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => setOpenForm(true)}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  Schedule Appointment
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Sync />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Sync Calendar
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricBox>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      <CountUp end={stats.todayCount} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      <CountUp end={stats.upcomingCount} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      <CountUp end={stats.completedCount} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                      <CountUp end={stats.canceledCount} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cancelled
                    </Typography>
                  </MetricBox>
                </Grid>
              </Grid>
            </motion.div>
          </Grid>
        </Grid>
      </HeroSection>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <StatsCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Weekly Appointments
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip />
                  <Bar dataKey="appointments" fill="#F57C00" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Appointment Types
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={appointmentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appointmentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {appointmentTypeData.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search appointments..."
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
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="calendar">
                  <CalendarMonth />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="table">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              >
                Filters
              </Button>
              
              <IconButton onClick={(e) => setActionsAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
        
        <Collapse in={showAdvancedFilters}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    multiple
                    value={selectedFilters.type}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, type: e.target.value })}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {['Property Showing', 'Buyer Consultation', 'Listing Presentation', 'Open House', 'Closing'].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={selectedFilters.status}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value })}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {['Scheduled', 'Completed', 'Cancelled', 'No Show'].map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${appointments.length})`} />
          <Tab label={`Today (${stats.todayCount})`} />
          <Tab label={`Upcoming (${stats.upcomingCount})`} />
          <Tab label={`Completed (${stats.completedCount})`} />
          <Tab label={`Cancelled (${stats.canceledCount})`} />
        </Tabs>
      </Paper>

      {/* Content Area */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : viewMode === 'calendar' ? (
        renderCalendarView()
      ) : viewMode === 'list' ? (
        renderListView()
      ) : (
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={appointments}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          />
        </Paper>
      )}

      {/* Reminder Settings Dialog */}
      <Dialog
        open={false}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reminder Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={reminderSettings.email}
                  onChange={(e) => setReminderSettings({ ...reminderSettings, email: e.target.checked })}
                />
              }
              label="Email Reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={reminderSettings.sms}
                  onChange={(e) => setReminderSettings({ ...reminderSettings, sms: e.target.checked })}
                />
              }
              label="SMS Reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={reminderSettings.push}
                  onChange={(e) => setReminderSettings({ ...reminderSettings, push: e.target.checked })}
                />
              }
              label="Push Notifications"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {}}>Cancel</Button>
          <Button variant="contained" onClick={() => enqueueSnackbar('Settings saved', { variant: 'success' })}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          Advanced Filters
        </MenuItem>
        <MenuItem onClick={() => setSelectedFilters({ type: [], status: [], location: [] })}>
          Clear Filters
        </MenuItem>
      </Menu>

      {/* Actions Menu */}
      <Menu
        anchorEl={actionsAnchorEl}
        open={Boolean(actionsAnchorEl)}
        onClose={() => setActionsAnchorEl(null)}
      >
        <MenuItem onClick={() => handleBulkAction('export')}>
          <Download sx={{ mr: 1 }} /> Export Calendar
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('sync')}>
          <Sync sx={{ mr: 1 }} /> Sync with Google
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('reminders')}>
          <NotificationsActive sx={{ mr: 1 }} /> Send Reminders
        </MenuItem>
        <MenuItem onClick={() => enqueueSnackbar('Opening settings...', { variant: 'info' })}>
          <Schedule sx={{ mr: 1 }} /> Reminder Settings
        </MenuItem>
      </Menu>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Appointment actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="New Appointment"
          onClick={() => setOpenForm(true)}
        />
        <SpeedDialAction
          icon={<VideoCall />}
          tooltipTitle="Schedule Video Call"
          onClick={() => {
            setSelectedAppointment({ isVideoCall: true });
            setOpenForm(true);
          }}
        />
        <SpeedDialAction
          icon={<EventRepeat />}
          tooltipTitle="Recurring Appointment"
          onClick={() => {
            setSelectedAppointment({ isRecurring: true });
            setOpenForm(true);
          }}
        />
        <SpeedDialAction
          icon={<Groups />}
          tooltipTitle="Group Appointment"
          onClick={() => {
            setSelectedAppointment({ isGroupAppointment: true });
            setOpenForm(true);
          }}
        />
      </SpeedDial>

      {/* Appointment Form Dialog */}
      <AppointmentForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={() => {
          queryClient.invalidateQueries('appointments');
          enqueueSnackbar(selectedAppointment ? 'Appointment updated successfully' : 'Appointment scheduled successfully', { variant: 'success' });
        }}
      />
    </Container>
  );
};

export default AppointmentsDashboard;