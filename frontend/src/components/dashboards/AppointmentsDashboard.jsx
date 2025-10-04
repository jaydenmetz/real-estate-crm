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
  BugReport,
  ExpandMore,
  ExpandLess,
  Storage,
  Error as ErrorIcon,
  Analytics,
  DataObject,
  NetworkCheck,
  Info,
  Warning,
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
import { appointmentsAPI } from '../../services/api.service';
import AppointmentForm from '../forms/AppointmentForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import networkMonitor from '../../services/networkMonitor.service';
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
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });
  
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      {/* Stunning Debug Interface - Admin Only */}
      {user?.username === 'admin' && (
        <Box sx={{ mb: 4 }}>
          {/* Summary Debug Card */}
          <Card
            onClick={() => setDebugExpanded(!debugExpanded)}
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
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                transform: 'translateY(-2px)',
              },
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
                    Debug Panel: Appointments Dashboard
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
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Update network data from network monitor
                      setNetworkData({
                        stats: networkMonitor.getStats(),
                        requests: networkMonitor.getRequests(),
                        errors: networkMonitor.getErrors()
                      });
                      enqueueSnackbar('Network data refreshed', { variant: 'info' });
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
                        userAgent: navigator.userAgent,
                        screenResolution: `${window.screen.width}x${window.screen.height}`
                      },
                      dashboardData: {
                        totalAppointments: appointments.length,
                        stats: {
                          todayAppointments: appointments.filter(a => {
                            const appointmentDate = new Date(a.date);
                            const today = new Date();
                            return appointmentDate.toDateString() === today.toDateString();
                          }).length,
                          upcomingAppointments: appointments.filter(a => a.status === 'scheduled').length,
                          completedAppointments: appointments.filter(a => a.status === 'completed').length,
                          cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length
                        },
                        appointmentsSample: appointments.slice(0, 3).map(a => ({
                          id: a.id,
                          title: a.title,
                          type: a.appointmentType,
                          date: a.date,
                          time: a.time,
                          status: a.status,
                          attendees: a.attendees
                        })),
                        filters: {
                          currentTab: tabValue,
                          searchTerm,
                          sortBy,
                          selectedFilters,
                          viewMode
                        }
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
              {/* Dashboard Statistics */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Analytics /> Dashboard Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Total Appointments</Typography>
                        <Typography variant="h4">{appointments.length}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Today's Appointments</Typography>
                        <Typography variant="h4">{appointments.filter(a => {
                          const appointmentDate = new Date(a.date);
                          const today = new Date();
                          return appointmentDate.toDateString() === today.toDateString();
                        }).length}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Upcoming</Typography>
                        <Typography variant="h5">{appointments.filter(a => a.status === 'scheduled').length}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                        <Typography variant="h5">
                          {appointments.length > 0 
                            ? ((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100).toFixed(0)
                            : 0}%
                        </Typography>
                      </Grid>
                    </Grid>
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

              {/* Recent Appointments */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Storage /> Recent Appointments Data
                    </Typography>
                    <Stack spacing={2}>
                      {appointments.slice(0, 3).map((appointment) => (
                        <Box 
                          key={appointment.id}
                          sx={{ 
                            p: 2, 
                            background: 'rgba(0,0,0,0.03)', 
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ID: {appointment.id} | Status: {appointment.status}
                          </Typography>
                          <Typography variant="body2">
                            {appointment.title} ({appointment.appointmentType})
                          </Typography>
                          <Typography variant="body2">
                            {appointment.date} at {appointment.time} | {appointment.attendees.length} attendees
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
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

      {/* Hero Section with Stats */}
      <HeroSection>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Appointment Management
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Schedule, track, and manage all your appointments in one place
          </Typography>
        </motion.div>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2.5,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Today
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp end={stats.todayCount || 0} duration={2} separator="," />
                  </Typography>
                </Box>
                <Today sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
              {/* Mini chart */}
              <Box sx={{ height: 40, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      stroke="#ffffff"
                      fill="url(#colorToday)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2.5,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Upcoming
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp end={stats.upcomingCount || 0} duration={2} separator="," />
                  </Typography>
                </Box>
                <EventAvailable sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
              {/* Mini chart */}
              <Box sx={{ height: 40, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#ffffff"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2.5,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Completed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp end={stats.completedCount || 0} duration={2} separator="," />
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
              {/* Mini chart */}
              <Box sx={{ height: 40, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <Bar dataKey="appointments" fill="rgba(255,255,255,0.6)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2.5,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Cancelled
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <CountUp end={stats.canceledCount || 0} duration={2} separator="," />
                  </Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, opacity: 0.6 }} />
              </Box>
              {/* Mini chart */}
              <Box sx={{ height: 40, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      stroke="#ffffff"
                      fill="url(#colorCancelled)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            Schedule Appointment
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Sync />}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Sync Calendar
          </Button>
        </Box>
      </HeroSection>

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