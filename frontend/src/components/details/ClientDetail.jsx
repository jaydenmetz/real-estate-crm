// frontend/src/components/details/ClientDetail.jsx

import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
  FormControlLabel,
  Checkbox,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Badge,
  useTheme,
  useMediaQuery,
  Skeleton,
  Collapse,
  Fade,
  Grow,
  Zoom,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  AvatarGroup,
  ImageList,
  ImageListItem,
  Switch,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
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
  Person,
  LocationOn,
  CalendarToday,
  Note,
  AttachMoney,
  TrendingUp,
  History,
  Task,
  CheckCircle,
  Cancel,
  Schedule,
  Star,
  StarBorder,
  Home,
  Business,
  DirectionsCar,
  School,
  FamilyRestroom,
  Description,
  Upload,
  Download,
  Visibility,
  Send,
  MoreVert,
  Add,
  Chat,
  Assignment,
  FolderOpen,
  VideoCameraFront,
  PhoneInTalk,
  EmailOutlined,
  MessageOutlined,
  InsertDriveFile,
  PictureAsPdf,
  Image,
  AccountBalance,
  CreditCard,
  Cake,
  Work,
  LocalOffer,
  SwapHoriz,
  Share,
  Print,
  Favorite,
  FavoriteBorder,
  Message,
  Event,
  Sms,
  VideoCall,
  MeetingRoom,
  ContactMail,
  Badge as BadgeIcon,
  Verified,
  Groups,
  ThumbUp,
  ThumbDown,
  Flag,
  Warning,
  Info,
  Check,
  Close,
  Remove,
  BugReport,
  ExpandMore,
  ExpandLess,
  Storage,
  Refresh,
  Error as ErrorIcon,
  Analytics,
  DataObject,
  NetworkCheck,
  Archive,
  Delete,
  QrCode2,
  Receipt,
  Category,
  Label,
  Bookmark,
  BookmarkBorder,
  NotificationsActive,
  NotificationsOff,
  VolumeUp,
  VolumeOff,
  VisibilityOff,
  Lock,
  LockOpen,
  Security,
  Policy,
  Gavel,
  AccountCircle,
  SupervisorAccount,
  ManageAccounts,
  SupportAgent,
  ContactSupport,
  QuestionAnswer,
  Forum,
  Comment,
  RateReview,
  Feedback,
  BarChart,
  PieChart,
  ShowChart,
  TrendingFlat,
  SignalCellularAlt,
  Speed,
  Timer as TimerIcon,
  Update,
  Cached,
  Sync,
  CloudSync,
  CloudDone,
  CloudOff,
  WifiOff,
  SignalWifiOff,
  Battery20,
  BatteryFull,
  PowerSettingsNew,
  Highlight,
  FlashOn,
  FlashOff,
  WbSunny,
  Brightness2,
  Tonality,
  Palette,
  ColorLens,
  Brush,
  FormatPaint,
  FormatColorFill,
  FormatColorText,
  FormatColorReset,
  Gradient,
  Grain,
  Texture,
  ViewCompact,
  ViewModule,
  ViewList,
  ViewAgenda,
  ViewCarousel,
  ViewColumn,
  ViewQuilt,
  GridOn,
  GridOff,
  Dashboard,
  WidgetsOutlined,
  Extension,
  Puzzle,
  ContentCopy,
  WhatsApp,
  LinkedIn,
  Facebook,
  Twitter,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import networkMonitor from '../../services/networkMonitor.service.service';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { clientsAPI } from '../../services/api.service.service.service';
import { safeFormatDate } from '../../utils/safeDateUtils';
import CountUp from 'react-countup';
import {
  AreaChart,
  Area,
  Bar,
  LineChart,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Treemap,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
  color: 'white',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(21, 101, 192, 0.3)',
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
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    '& .metric-icon': {
      transform: 'scale(1.2) rotate(5deg)',
    },
  },
  '& .metric-icon': {
    transition: 'transform 0.3s ease',
  },
}));

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(21, 101, 192, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0);
  }
`;

const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'active' ? theme.palette.success.main : theme.palette.grey[400],
    color: theme.palette.common.white,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'active' ? `${pulseAnimation} 1.4s infinite` : 'none',
      content: '""',
    },
  },
}));

const ActivityCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  borderRadius: theme.spacing(2),
  '&:hover': {
    transform: 'translateX(5px)',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const PropertyCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [taskDialog, setTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'medium' });
  const [communicationDialog, setCommunicationDialog] = useState(false);
  const [communicationType, setCommunicationType] = useState('email');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });
  const [propertyImages, setPropertyImages] = useState([
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  ]);

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

  // Debug logging
  console.log('[ClientDetail] Component mounted');
  console.log('[ClientDetail] ID received:', id);

  // Fetch client details
  const { data: client, isLoading, error, isError } = useQuery(
    ['client', id],
    async () => {
      try {
        const res = await clientsAPI.getById(id);
        return res.data || res;
      } catch (err) {
        console.error('Error fetching client:', err);
        return mockClient;
      }
    },
    { 
      refetchInterval: 30000,
      retry: 1
    }
  );

  // Mock data for demonstration
  const mockClient = {
    id: id,
    name: 'Michael & Sarah Thompson',
    email: 'michael.thompson@email.com',
    phone: '(555) 234-5678',
    alternatePhone: '(555) 234-5679',
    status: 'Active',
    type: 'Buyer',
    source: 'Referral',
    assignedAgent: 'You',
    createdAt: '2023-06-15',
    lastContact: '2024-01-18',
    birthday: '1985-03-15',
    anniversary: '2010-06-20',
    occupation: 'Software Engineer / Teacher',
    address: '789 Oak Street, San Diego, CA 92103',
    budget: '$800,000 - $1,200,000',
    preApproved: true,
    lender: 'Wells Fargo',
    preferredContactMethod: 'Email',
    timeZone: 'PST',
    notes: 'Looking for 4BR home in good school district. Both work from home occasionally.',
    tags: ['VIP', 'Cash Buyer', 'Repeat Client', 'Pre-approved'],
    starred: true,
    lifetimeValue: 45000,
    totalTransactions: 3,
    referrals: 5,
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=michael',
    properties: {
      owned: [
        {
          id: 1,
          address: '789 Oak Street, San Diego, CA 92103',
          type: 'Single Family',
          purchaseDate: '2018-07-15',
          purchasePrice: 650000,
          currentValue: 850000,
          status: 'Primary Residence',
          image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'
        }
      ],
      interested: [
        {
          id: 2,
          address: '456 Maple Drive, La Jolla, CA 92037',
          type: 'Single Family',
          listPrice: 1150000,
          status: 'Scheduled Showing',
          notes: 'Love the location, concerned about price',
          image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
        },
        {
          id: 3,
          address: '321 Beach Blvd, Carlsbad, CA 92008',
          type: 'Condo',
          listPrice: 875000,
          status: 'Viewed',
          notes: 'Backup option',
          image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400'
        }
      ]
    },
    appointments: [
      {
        id: 1,
        title: 'Property Tour - La Jolla',
        date: '2024-01-20',
        time: '2:00 PM',
        type: 'Property Showing',
        status: 'Scheduled'
      },
      {
        id: 2,
        title: 'Market Update Meeting',
        date: '2024-01-25',
        time: '10:00 AM',
        type: 'Consultation',
        status: 'Scheduled'
      }
    ],
    communications: [
      {
        id: 1,
        type: 'email',
        subject: 'New Listings Matching Your Criteria',
        date: '2024-01-17T14:30:00',
        direction: 'outbound',
        status: 'sent',
        preview: 'Hi Michael and Sarah, I found 3 new properties that match your criteria...'
      },
      {
        id: 2,
        type: 'call',
        subject: 'Follow up on La Jolla property',
        date: '2024-01-16T10:15:00',
        direction: 'inbound',
        duration: '15 min',
        notes: 'Discussed financing options and scheduling a tour'
      },
      {
        id: 3,
        type: 'text',
        subject: 'Confirmation for Saturday showing',
        date: '2024-01-15T16:45:00',
        direction: 'outbound',
        status: 'delivered'
      }
    ],
    documents: [
      {
        id: 1,
        name: 'Pre-approval Letter.pdf',
        type: 'pdf',
        size: '245 KB',
        uploadDate: '2024-01-10',
        category: 'Financial'
      },
      {
        id: 2,
        name: 'Buyer Preferences Worksheet.docx',
        type: 'doc',
        size: '128 KB',
        uploadDate: '2024-01-05',
        category: 'Preferences'
      },
      {
        id: 3,
        name: 'Market Analysis Report.pdf',
        type: 'pdf',
        size: '1.2 MB',
        uploadDate: '2024-01-15',
        category: 'Reports'
      }
    ],
    activities: [
      {
        id: 1,
        type: 'client_created',
        description: 'Client profile created',
        timestamp: '2023-06-15T09:00:00',
        user: 'System'
      },
      {
        id: 2,
        type: 'property_viewed',
        description: 'Viewed property at 321 Beach Blvd',
        timestamp: '2024-01-14T15:30:00',
        user: 'You'
      },
      {
        id: 3,
        type: 'document_uploaded',
        description: 'Uploaded Pre-approval Letter',
        timestamp: '2024-01-10T11:20:00',
        user: 'You'
      },
      {
        id: 4,
        type: 'appointment_scheduled',
        description: 'Scheduled property tour for La Jolla',
        timestamp: '2024-01-17T16:00:00',
        user: 'You'
      }
    ],
    preferences: {
      propertyType: ['Single Family', 'Townhouse'],
      bedrooms: '4+',
      bathrooms: '3+',
      sqft: '2,500+',
      lot: '7,000+ sqft',
      features: ['Home Office', 'Pool', 'Updated Kitchen', '2-Car Garage'],
      neighborhoods: ['La Jolla', 'Carmel Valley', 'Del Mar'],
      schools: ['Great Schools Rating 8+'],
      maxHOA: '$300/month',
      moveInDate: '3-6 months',
      dealBreakers: ['Busy street', 'Major repairs needed', 'No backyard']
    }
  };

  const displayClient = client || mockClient;

  // Chart data
  const transactionHistory = [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 425 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
    { month: 'Aug', value: 550 },
  ];

  const communicationStats = [
    { name: 'Emails', value: 45, color: '#1565C0' },
    { name: 'Calls', value: 23, color: '#42A5F5' },
    { name: 'Texts', value: 18, color: '#90CAF9' },
    { name: 'Meetings', value: 8, color: '#BBDEFB' },
  ];

  const activityTimeline = [
    { date: '2024-01-10', type: 'email', title: 'Sent property listings', icon: <Email /> },
    { date: '2024-01-08', type: 'call', title: 'Discussed financing options', icon: <Phone /> },
    { date: '2024-01-05', type: 'meeting', title: 'Property viewing - 456 Oak Ave', icon: <MeetingRoom /> },
    { date: '2024-01-02', type: 'note', title: 'Added preference notes', icon: <Note /> },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'warning';
      case 'Archived': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Buyer': return <Home />;
      case 'Seller': return <Business />;
      case 'Both': return <SwapHoriz />;
      case 'Investor': return <TrendingUp />;
      default: return <Person />;
    }
  };

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'email': return <EmailOutlined />;
      case 'call': return <PhoneInTalk />;
      case 'text': return <MessageOutlined />;
      case 'video': return <VideoCameraFront />;
      case 'meeting': return <Business />;
      default: return <Chat />;
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'pdf': return <PictureAsPdf />;
      case 'doc':
      case 'docx': return <Description />;
      case 'xls':
      case 'xlsx': return <Description />;
      case 'img':
      case 'jpg':
      case 'png': return <Image />;
      default: return <InsertDriveFile />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'client_created': return <Person />;
      case 'property_viewed': return <Home />;
      case 'document_uploaded': return <Upload />;
      case 'appointment_scheduled': return <CalendarToday />;
      case 'communication_sent': return <Send />;
      case 'note_added': return <Note />;
      case 'status_changed': return <TrendingUp />;
      default: return <History />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await clientsAPI.addNote(id, { content: newNote });
      queryClient.invalidateQueries(['client', id]);
      setNewNote('');
      setNoteDialog(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleShare = (platform) => {
    console.log(`Sharing via ${platform}...`);
    setShareDialogOpen(false);
  };

  const speedDialActions = [
    { icon: <Email />, name: 'Send Email', action: () => setCommunicationDialog(true) },
    { icon: <Phone />, name: 'Log Call', action: () => console.log('Call logging') },
    { icon: <Event />, name: 'Schedule Meeting', action: () => console.log('Meeting scheduler') },
    { icon: <Note />, name: 'Add Note', action: () => setNoteDialog(true) },
    { icon: <Assignment />, name: 'Create Task', action: () => setTaskDialog(true) },
  ];

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3, borderRadius: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={3} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => navigate('/clients')}>
            Back to Clients
          </Button>
        }>
          Failed to load client details. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Stunning Debug Interface - Admin Only */}
      {user?.username === 'admin' && (
        <Box sx={{ mb: 4 }}>
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
                    Debug Panel: Client Detail
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
                      console.log('[ClientDetail] Network data refreshed');
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
                        clientId: id,
                        userAgent: navigator.userAgent,
                        screenResolution: `${window.screen.width}x${window.screen.height}`
                      },
                      clientData: displayClient ? {
                        id: displayClient.id,
                        name: displayClient.name,
                        type: displayClient.type,
                        status: displayClient.status,
                        email: displayClient.email,
                        phone: displayClient.phone,
                        lifetimeValue: displayClient.lifetimeValue,
                        dateAdded: displayClient.dateAdded,
                        lastContactDate: displayClient.lastContactDate,
                        propertyPreferences: displayClient.propertyPreferences
                      } : null,
                      loadingState: {
                        isLoading,
                        isError,
                        hasData: !!client,
                        usingMockData: !client && !!displayClient
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
              {/* Client Statistics */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Analytics /> Client Statistics
                    </Typography>
                    {displayClient && (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Client Type</Typography>
                          <Typography variant="h5">{displayClient.type}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Typography variant="h5">{displayClient.status}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Lifetime Value</Typography>
                          <Typography variant="h5">${displayClient.lifetimeValue?.toLocaleString() || 0}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Interest Level</Typography>
                          <Typography variant="h5">{displayClient.interestLevel || 'Medium'}</Typography>
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

              {/* Client Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Storage /> Client Details
                    </Typography>
                    {displayClient && (
                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(0,0,0,0.03)', 
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ID: {displayClient.id} | Rating: {displayClient.rating}/5
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {displayClient.name}
                        </Typography>
                        <Typography variant="body2">
                          {displayClient.email} | {displayClient.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Added: {new Date(displayClient.dateAdded).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          Last Contact: {new Date(displayClient.lastContactDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          Budget: ${displayClient.propertyPreferences?.minBudget?.toLocaleString() || 0} - ${displayClient.propertyPreferences?.maxBudget?.toLocaleString() || 0}
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
        pageName="ClientDetail"
        id={id}
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={displayClient}
        additionalInfo={{
          activeTab,
          hasClientData: !!client,
          usingMockData: !client && !!displayClient
        }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/dashboard')}
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Home sx={{ mr: 0.5, fontSize: 20, verticalAlign: 'middle' }} />
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/clients')}
          sx={{ textDecoration: 'none', color: 'inherit' }}
        >
          Clients
        </Link>
        <Typography color="primary">{displayClient.name}</Typography>
      </Breadcrumbs>

      {/* Hero Section with Property Images Carousel */}
      <HeroSection>
        <Box sx={{ position: 'relative', height: '100%' }}>
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              opacity: 0.2,
              borderRadius: theme.spacing(3),
            }}
          >
            {propertyImages.map((image, index) => (
              <SwiperSlide key={index}>
                <Box
                  sx={{
                    height: '400px',
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          
          <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <StatusBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    status={displayClient.status === 'Active' ? 'active' : 'inactive'}
                  >
                    <Avatar
                      src={displayClient.avatar}
                      sx={{
                        width: 100,
                        height: 100,
                        border: '4px solid white',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {displayClient.name?.[0]}
                    </Avatar>
                  </StatusBadge>
                  <Box sx={{ ml: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {displayClient.name}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        label={displayClient.type}
                        icon={getTypeIcon(displayClient.type)}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      <Rating value={displayClient.rating || 0} readOnly sx={{ 
                        '& .MuiRating-iconFilled': { color: 'white' },
                        '& .MuiRating-iconEmpty': { color: 'rgba(255, 255, 255, 0.4)' }
                      }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Client since {safeFormatDate(displayClient.createdAt, 'MMM yyyy')}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<Email />}
                    onClick={() => setCommunicationDialog(true)}
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'grey.100' },
                    }}
                  >
                    Send Email
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Phone />}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Call Client
                  </Button>
                  <IconButton
                    onClick={handleMenuClick}
                    sx={{ color: 'white' }}
                  >
                    <MoreVert />
                  </IconButton>
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
                    <MetricCard elevation={0}>
                      <AttachMoney className="metric-icon" sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        $<CountUp end={displayClient.lifetimeValue / 1000} duration={2} />K
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lifetime Value
                      </Typography>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard elevation={0}>
                      <Assignment className="metric-icon" sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        <CountUp end={displayClient.totalTransactions} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Transactions
                      </Typography>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard elevation={0}>
                      <Groups className="metric-icon" sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        <CountUp end={displayClient.referrals} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Referrals
                      </Typography>
                    </MetricCard>
                  </Grid>
                  <Grid item xs={6}>
                    <MetricCard elevation={0}>
                      <Schedule className="metric-icon" sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {displayClient.lastContact ? 
                          Math.floor((new Date() - new Date(displayClient.lastContact)) / (1000 * 60 * 60 * 24)) 
                          : 0
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Days Since Contact
                      </Typography>
                    </MetricCard>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </HeroSection>

      {/* Quick Info Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{displayClient.email}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{displayClient.phone}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{displayClient.address}</Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Personal Details
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Cake color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Birthday</Typography>
                    <Typography variant="body1">{safeFormatDate(displayClient.birthday, 'MMMM d')}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Work color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Occupation</Typography>
                    <Typography variant="body1">{displayClient.occupation}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Business color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Company</Typography>
                    <Typography variant="body1">{displayClient.company || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Preferences
              </Typography>
              <Stack spacing={1}>
                <Chip
                  icon={<ContactMail />}
                  label={`Preferred: ${displayClient.preferredContactMethod}`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<Home />}
                  label={`Type: ${displayClient.preferences?.propertyType?.join(', ') || 'Any'}`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<AttachMoney />}
                  label={`Budget: ${displayClient.budget}`}
                  variant="outlined"
                  size="small"
                />
              </Stack>
              <Box sx={{ mt: 2 }}>
                {displayClient.tags?.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    color={tag === 'VIP' ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<Dashboard />} iconPosition="start" />
          <Tab label="Properties" icon={<Home />} iconPosition="start" />
          <Tab label="Communications" icon={<Message />} iconPosition="start" />
          <Tab label="Appointments" icon={<CalendarToday />} iconPosition="start" />
          <Tab label="Documents" icon={<Folder />} iconPosition="start" />
          <Tab label="Analytics" icon={<Analytics />} iconPosition="start" />
          <Tab label="Activity" icon={<History />} iconPosition="start" />
          <Tab label="Notes" icon={<Note />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Overview Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Transaction History
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transactionHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1565C0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1565C0"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              <List>
                {displayClient.properties?.owned?.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar src={transaction.image} variant="rounded">
                          <Home />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={transaction.address}
                        secondary={`${transaction.type} • Purchased ${safeFormatDate(transaction.purchaseDate, 'MMMM d, yyyy')}`}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary">
                          ${(transaction.purchasePrice / 1000).toFixed(0)}K
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Now: ${(transaction.currentValue / 1000).toFixed(0)}K
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < displayClient.properties.owned.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Communication Stats
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={communicationStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {communicationStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {communicationStats.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Timeline>
                {displayClient.activities?.slice(0, 4).map((activity, index) => (
                  <TimelineItem key={activity.id}>
                    <TimelineOppositeContent color="textSecondary" sx={{ maxWidth: '120px', flex: 0.3 }}>
                      {safeFormatDate(activity.timestamp, 'MMM d')}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary">
                        {getActivityIcon(activity.type)}
                      </TimelineDot>
                      {index < displayClient.activities.slice(0, 4).length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        by {activity.user}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Properties Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Properties of Interest
            </Typography>
            <Grid container spacing={3}>
              {displayClient.properties?.interested?.map((property) => (
                <Grid item xs={12} md={6} lg={4} key={property.id}>
                  <PropertyCard>
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${property.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                        }}
                      >
                        ${(property.listPrice / 1000).toFixed(0)}K
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {property.address}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={property.type} size="small" />
                        <Chip 
                          label={property.status} 
                          size="small"
                          color={property.status === 'Scheduled Showing' ? 'primary' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {property.notes}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Visibility />}>
                        View Details
                      </Button>
                      <Button size="small" startIcon={<CalendarToday />}>
                        Schedule
                      </Button>
                    </CardActions>
                  </PropertyCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Property Preferences
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Property Types
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {displayClient.preferences?.propertyType?.map((type) => (
                        <Chip key={type} label={type} />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Desired Features
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {displayClient.preferences?.features?.map((feature) => (
                        <Chip key={feature} label={feature} variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Preferred Neighborhoods
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {displayClient.preferences?.neighborhoods?.map((neighborhood) => (
                        <Chip key={neighborhood} label={neighborhood} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Deal Breakers
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {displayClient.preferences?.dealBreakers?.map((item) => (
                        <Chip key={item} label={item} color="error" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Communications Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Communication History
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setCommunicationDialog(true)}
                >
                  New Communication
                </Button>
              </Box>
              <List>
                {activityTimeline.map((activity, index) => (
                  <ActivityCard key={index}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {activity.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {safeFormatDate(activity.date, 'MMMM d, yyyy - h:mm a')}
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </ActivityCard>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => {
                    setCommunicationType('email');
                    setCommunicationDialog(true);
                  }}
                >
                  Send Email
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Phone />}
                  onClick={() => {
                    setCommunicationType('call');
                    setCommunicationDialog(true);
                  }}
                >
                  Log Call
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Sms />}
                  onClick={() => {
                    setCommunicationType('sms');
                    setCommunicationDialog(true);
                  }}
                >
                  Send SMS
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VideoCall />}
                  onClick={() => console.log('Video call')}
                >
                  Schedule Video Call
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* More Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setEditMode(!editMode); handleMenuClose(); }}>
          <ListItemIcon><Edit /></ListItemIcon>
          Edit Client
        </MenuItem>
        <MenuItem onClick={() => { setShareDialogOpen(true); handleMenuClose(); }}>
          <ListItemIcon><Share /></ListItemIcon>
          Share Contact
        </MenuItem>
        <MenuItem onClick={() => { console.log('Print'); handleMenuClose(); }}>
          <ListItemIcon><Print /></ListItemIcon>
          Print Details
        </MenuItem>
        <MenuItem onClick={() => { console.log('Generate QR'); handleMenuClose(); }}>
          <ListItemIcon><QrCode2 /></ListItemIcon>
          Generate QR
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { console.log('Archive'); handleMenuClose(); }}>
          <ListItemIcon><Archive /></ListItemIcon>
          Archive Client
        </MenuItem>
      </Menu>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Enter your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained" disabled={!newNote.trim()}>
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Contact</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Email />}
              onClick={() => handleShare('Email')}
            >
              Share via Email
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Sms />}
              onClick={() => handleShare('SMS')}
            >
              Share via SMS
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShareDialogOpen(false);
              }}
            >
              Copy Link
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Client actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>
    </Container>
  );
};

const ClientDetailWithErrorBoundary = () => (
  <DetailPageErrorBoundary pageName="ClientDetail">
    <ClientDetail />
  </DetailPageErrorBoundary>
);

export default ClientDetailWithErrorBoundary;