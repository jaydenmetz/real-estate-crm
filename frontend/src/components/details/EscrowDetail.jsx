// frontend/src/components/details/EscrowDetail.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, EffectCoverflow } from 'swiper/modules';

// Import Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-coverflow';
import { styled, keyframes, alpha } from '@mui/material/styles';
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
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Collapse,
  ListItemAvatar,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Select,
  FormControl,
  InputLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TableContainer,
  InputAdornment,
  Switch,
  ButtonGroup,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardActions,
  CardMedia,
  AvatarGroup,
  Fade,
  Grow,
  Zoom,
  Backdrop,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TreeView,
  TreeItem,
} from '@mui/lab';
import {
  ArrowBack,
  Edit,
  Share,
  Print,
  MoreVert,
  Home,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Person,
  Phone,
  Email,
  Description,
  Check,
  Warning,
  Error,
  Timer,
  Assignment,
  Gavel,
  AccountBalance,
  LocalShipping,
  Build,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  TrendingDown,
  Notifications,
  NotificationsActive,
  Flag,
  Upload,
  Download,
  Send,
  Delete,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  Dashboard,
  Assessment,
  BarChart,
  Timeline as TimelineIcon,
  AutoAwesome,
  SmartToy,
  Psychology,
  Speed,
  Security,
  VerifiedUser,
  Task,
  TaskAlt,
  RadioButtonUnchecked,
  RadioButtonChecked,
  Circle,
  FiberManualRecord,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Save,
  SaveAlt,
  CloudUpload,
  CloudDownload,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Key,
  VpnKey,
  Fingerprint,
  Face,
  AccountCircle,
  SupervisedUserCircle,
  Groups,
  Group,
  PersonAdd,
  PersonRemove,
  Settings,
  Tune,
  FilterList,
  Sort,
  Search,
  FindInPage,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  OpenInNew,
  OpenInFull,
  Close,
  Clear,
  Done,
  DoneAll,
  DoneOutline,
  Block,
  ReportProblem,
  Info,
  HelpOutline,
  Help,
  Feedback,
  BugReport,
  Extension,
  Explore,
  Language,
  Translate,
  RecordVoiceOver,
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Headset,
  SupportAgent,
  ContactSupport,
  LiveHelp,
  Forum,
  QuestionAnswer,
  Chat,
  Message,
  Textsms,
  Comment,
  RateReview,
  ThumbUp,
  ThumbDown,
  Star,
  StarBorder,
  StarHalf,
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
  Label,
  LabelImportant,
  NewReleases,
  Announcement,
  Campaign,
  NotificationImportant,
  CircleNotifications,
  DoNotDisturb,
  DoNotDisturbOn,
  RemoveCircle,
  AddCircle,
  AddCircleOutline,
  RemoveCircleOutline,
  HighlightOff,
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber,
  InfoOutlined,
  PriorityHigh,
  Notification,
  Sms,
  MailOutline,
  Drafts,
  Inbox,
  MarkunreadMailbox,
  Forward,
  Reply,
  ReplyAll,
  Flag as FlagIcon,
  OutlinedFlag,
  EmojiFlags,
  Tour,
  Explore as ExploreIcon,
  LocationCity,
  MyLocation,
  Map,
  Layers,
  Traffic,
  Satellite,
  Terrain,
  NearMe,
  GpsFixed,
  GpsNotFixed,
  GpsOff,
  LocationSearching,
  LocationDisabled,
  PinDrop,
  Place,
  AddLocation,
  EditLocation,
  WrongLocation,
  Smartphone,
  Computer,
  Laptop,
  Tablet,
  PhoneAndroid,
  PhoneIphone,
  Watch,
  Tv,
  DesktopWindows,
  LaptopMac,
  LaptopWindows,
  TabletAndroid,
  TabletMac,
  Devices,
  DevicesOther,
  Router,
  Scanner,
  Printer,
  Keyboard,
  Mouse,
  MemoryOutlined,
  SimCard,
  Storage,
  Usb,
  WifiOutlined,
  SignalCellularAlt,
  Battery90,
  BatteryCharging90,
  PowerSettingsNew,
  Power,
  PowerOff,
  FlashOn,
  FlashOff,
  BrightnessHigh,
  BrightnessLow,
  WbSunny,
  NightsStay,
  EventNote,
  EventAvailable,
  EventBusy,
  Event,
  Today,
  DateRange,
  AccessTime,
  AccessAlarm,
  AlarmOn,
  AlarmOff,
  Snooze,
  WatchLater,
  AvTimer,
  HourglassEmpty,
  HourglassFull,
  CalendarMonth,
  CalendarViewDay,
  CalendarViewWeek,
  CalendarViewMonth,
  ViewDay,
  ViewWeek,
  ViewAgenda,
  ViewModule,
  ViewList,
  ViewQuilt,
  ViewStream,
  ViewArray,
  ViewCarousel,
  ViewColumn,
  ViewComfy,
  GridOn,
  GridOff,
  Window,
  WebAsset,
  DeveloperBoard,
  DeveloperMode,
  Widgets,
  Wallpaper,
  Dns,
  Dvr,
  CloudQueue,
  CloudDone,
  CloudOff,
  Folder,
  FolderOpen,
  CreateNewFolder,
  FolderShared,
  FolderSpecial,
  FileCopy,
  ContentCopy,
  ContentCut,
  ContentPaste,
  LibraryBooks,
  LibraryAdd,
  LibraryMusic,
  LibraryAddCheck,
  PhotoLibrary,
  VideoLibrary,
  AudioFile,
  VideoFile,
  Image,
  Photo,
  Panorama,
  PhotoCamera,
  CameraAlt,
  Videocam,
  VideoCall,
  MusicNote,
  MusicOff,
  Audiotrack,
  Headphones,
  Album,
  VolumeDown,
  VolumeMute,
  Equalizer,
  Graphic,
  Movie,
  Theaters,
  OndemandVideo,
  VideoSettings,
  LiveTv,
  PlayCircle,
  PlayCircleFilled,
  PlayCircleOutline,
  PauseCircle,
  PauseCircleFilled,
  PauseCircleOutline,
  StopCircle,
  SkipNext,
  SkipPrevious,
  FastForward,
  FastRewind,
  Replay,
  Repeat,
  RepeatOne,
  Shuffle,
  PlaylistPlay,
  PlaylistAdd,
  Queue,
  QueueMusic,
  LibraryAddOutlined,
  Lightbulb,
  ArrowBackOutlined,
  ArrowForwardOutlined,
  ArrowUpward,
  ArrowDownward,
  ArrowLeft,
  ArrowRight,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FirstPage,
  LastPage,
  NavigateNext,
  NavigateBefore,
  SubdirectoryArrowLeft,
  SubdirectoryArrowRight,
  ArrowDropDown,
  ArrowDropUp,
  UnfoldMore,
  UnfoldLess,
  MoreHoriz,
  MoreVertOutlined,
  Sync,
  SyncAlt,
  SyncProblem,
  SyncDisabled,
  Update,
  Upgrade,
  GetApp,
  Publish,
  CloudSync,
  Loop,
  Autorenew,
  Cached,
  RestoreOutlined,
  Backup,
  RestoreFromTrash,
  DeleteForever,
  DeleteOutline,
  DeleteSweep,
  DriveFileRenameOutline,
  FileCopyOutlined,
  FileDownload,
  FileUpload,
  FileDownloadDone,
  CreateOutlined,
  EditOutlined,
  SaveOutlined,
  SaveAsOutlined,
  FolderOpenOutlined,
  AttachFile,
  AttachEmail,
  Attachment,
  Link as LinkIcon,
  LinkOff,
  Code,
  CodeOff,
  IntegrationInstructions,
  Terminal,
  DataObject,
  DataArray,
  Javascript,
  Css,
  Html,
  Api,
  Http,
  Functions,
  Memory,
  Storage as StorageIcon,
  Cloud,
  CloudCircle,
  Brightness1,
  Tag,
  Archive,
  History,
  BusinessCenter,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { format, formatDistanceToNow, addDays, differenceInDays, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import { escrowsAPI, documentsAPI } from '../../services/api';
import CountUp from 'react-countup';
import {
  AreaChart,
  Area,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';
import DetailPageDebugger from '../common/DetailPageDebugger';
import NetworkMonitor from '../common/NetworkMonitor';
import CopyButton from '../common/CopyButton';
import DetailPageHero from '../common/DetailPageHero';
import networkMonitor from '../../services/networkMonitor';

// Fallback motion component - must be after all imports
const MotionDiv = motion?.div || (({ children, ...props }) => <div {...props}>{children}</div>);

// Database Sync Status Component
const DatabaseSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState({
    loading: true,
    synced: false,
    localCount: 0,
    productionCount: 0,
    lastChecked: null,
    error: null
  });

  const checkDatabaseSync = async () => {
    setSyncStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Check local database (only in development)
      let localCount = 0;
      if (process.env.NODE_ENV === 'development') {
        try {
          const localResponse = await fetch('http://localhost:5050/v1/escrows');
          const localData = await localResponse.json();
          localCount = localData.success ? (localData.data.escrows || []).length : 0;
        } catch (err) {
          console.warn('Could not reach local database:', err);
        }
      }
      
      // Check production database
      let productionCount = 0;
      try {
        const productionResponse = await fetch(`${process.env.REACT_APP_API_URL}/v1/escrows`);
        const productionData = await productionResponse.json();
        productionCount = productionData.success ? (productionData.data.escrows || []).length : 0;
      } catch (err) {
        throw new Error('Could not reach production database');
      }
      
      const synced = localCount === productionCount;
      
      setSyncStatus({
        loading: false,
        synced,
        localCount,
        productionCount,
        lastChecked: new Date().toISOString(),
        error: null
      });
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    checkDatabaseSync();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkDatabaseSync, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSyncStatusColor = () => {
    if (syncStatus.loading) return 'info';
    if (syncStatus.error) return 'warning';
    return syncStatus.synced ? 'success' : 'error';
  };

  const getSyncStatusText = () => {
    if (syncStatus.loading) return 'Checking database sync...';
    if (syncStatus.error) return `Sync check failed: ${syncStatus.error}`;
    if (syncStatus.synced) {
      return `✅ Databases are synced (${syncStatus.productionCount} escrows each)`;
    }
    return `❌ Databases out of sync: Local(${syncStatus.localCount}) vs Production(${syncStatus.productionCount})`;
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: syncStatus.synced ? 'success.light' : 'error.light',
        border: '2px solid',
        borderColor: syncStatus.synced ? 'success.main' : 'error.main'
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Storage />
          <Typography variant="h6">Database Sync Status</Typography>
          <Chip 
            label={getSyncStatusColor() === 'success' ? 'SYNCED' : 'OUT OF SYNC'} 
            color={getSyncStatusColor()}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <IconButton size="small" onClick={checkDatabaseSync} disabled={syncStatus.loading}>
          {syncStatus.loading ? <CircularProgress size={20} /> : <Refresh />}
        </IconButton>
      </Box>
      
      <Typography variant="body2" sx={{ mt: 1 }}>
        {getSyncStatusText()}
      </Typography>
      
      {syncStatus.lastChecked && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Last checked: {new Date(syncStatus.lastChecked).toLocaleTimeString()}
        </Typography>
      )}
      
      {!syncStatus.synced && !syncStatus.loading && !syncStatus.error && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="error.main">
            <strong>Action needed:</strong> Local and production databases have different numbers of escrows. 
            This could indicate data sync issues or missing records.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(103, 58, 183, 0.5); }
  50% { box-shadow: 0 0 40px rgba(103, 58, 183, 0.8); }
  100% { box-shadow: 0 0 20px rgba(103, 58, 183, 0.5); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const rotateGlow = keyframes`
  0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
  100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
`;

// Styled Components
// HeroSection - Replaced with DetailPageHero component

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme?.spacing?.(3) || 24,
  padding: theme?.spacing?.(3) || 24,
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(103, 58, 183, 0.1)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(103, 58, 183, 0.2)',
    border: '1px solid rgba(103, 58, 183, 0.3)',
    '& .metric-icon': {
      transform: 'scale(1.2) rotate(10deg)',
      background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
      color: 'white',
    },
    '& .metric-value': {
      color: theme?.palette?.primary?.main || '#1976d2',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: -100,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(103, 58, 183, 0.1), transparent)',
    animation: `${shimmer} 3s infinite`,
  },
}));

const PropertyCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme?.spacing?.(3) || 24,
  overflow: 'hidden',
  height: 500,
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
  '& .swiper': {
    height: '100%',
  },
  '& .swiper-slide': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  '& .property-overlay': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
    color: 'white',
    padding: theme?.spacing?.(4) || 32,
    zIndex: 10,
  },
}));

const TimelineCard = styled(Card)(({ theme }) => ({
  marginBottom: theme?.spacing?.(2) || 16,
  borderRadius: theme?.spacing?.(2) || 16,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(10px)',
    boxShadow: '0 10px 30px rgba(103, 58, 183, 0.15)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme?.spacing?.(3) || 24,
  padding: theme?.spacing?.(1.5, 4) || '12px 32px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme?.spacing?.(3) || 24,
  animation: `${fadeIn} 0.5s ease-out`,
  height: '600px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme?.palette?.primary?.main || '#1976d2', 0.05),
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme?.palette?.primary?.main || '#1976d2', 0.3),
    borderRadius: '4px',
    '&:hover': {
      background: alpha(theme?.palette?.primary?.main || '#1976d2', 0.5),
    },
  },
}));

// Empty state component for tabs with no data
const EmptyState = ({ icon: Icon, title, subtitle, actionText, onAction }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      textAlign: 'center',
      p: 4,
    }}
  >
    <Avatar
      sx={{
        width: 80,
        height: 80,
        bgcolor: alpha(useTheme()?.palette?.primary?.main || '#1976d2', 0.1),
        color: 'primary.main',
        mb: 3,
      }}
    >
      <Icon sx={{ fontSize: 48 }} />
    </Avatar>
    <Typography variant="h6" gutterBottom color="text.secondary">
      {title}
    </Typography>
    <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 400 }}>
      {subtitle}
    </Typography>
    {actionText && onAction && (
      <Button variant="contained" onClick={onAction} startIcon={<Add />}>
        {actionText}
      </Button>
    )}
  </Box>
);

const ProcessStep = styled(Box)(({ theme }) => ({
  padding: theme?.spacing?.(3) || 24,
  borderRadius: theme?.spacing?.(2) || 16,
  background: alpha(theme?.palette?.primary?.main || '#1976d2', 0.05),
  border: `2px solid ${alpha(theme?.palette?.primary?.main || '#1976d2', 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme?.palette?.primary?.main || '#1976d2', 0.1),
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(103, 58, 183, 0.1)',
  },
}));

const DocumentItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme?.spacing?.(2) || 16,
  marginBottom: theme?.spacing?.(1) || 8,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme?.palette?.primary?.main || '#1976d2', 0.05),
    transform: 'translateX(8px)',
  },
}));

const AIAgentCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme?.spacing?.(3) || 24,
  borderRadius: theme?.spacing?.(2) || 16,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(103, 58, 183, 0.1)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(103, 58, 183, 0.15)',
    '& .agent-avatar': {
      transform: 'scale(1.1)',
    },
  },
  '&.active': {
    border: '2px solid #4CAF50',
    background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)',
  },
}));

const ActivityCard = styled(Card)(({ theme }) => ({
  padding: theme?.spacing?.(2) || 16,
  marginBottom: theme?.spacing?.(2) || 16,
  borderRadius: theme?.spacing?.(2) || 16,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    borderColor: theme?.palette?.primary?.main || '#1976d2',
  },
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  padding: theme?.spacing?.(3) || 24,
  textAlign: 'center',
  borderRadius: theme?.spacing?.(2) || 16,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(103, 58, 183, 0.2)',
    borderColor: theme?.palette?.primary?.main || '#1976d2',
    '& .action-icon': {
      transform: 'scale(1.2) rotate(10deg)',
      color: theme.palette.primary.main,
    },
  },
}));

const MetricChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: theme?.spacing?.(2) || 16,
  padding: theme?.spacing?.(0.5, 1) || '4px 8px',
  background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
  color: 'white',
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme?.spacing?.(3) || 24,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(103, 58, 183, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 8px 32px 0 rgba(103, 58, 183, 0.2)',
  },
}));

const MarketCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme?.spacing?.(3) || 24,
  borderRadius: theme?.spacing?.(2) || 16,
  background: 'white',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #673AB7 0%, #512DA8 100%)',
  },
}));

// Mock data combining both dashboard and detail views
const mockEscrowData = {
  // From Detail View
  id: 1,
  address: '789 Oak Avenue, San Francisco, CA 94110',
  status: 'active',
  price: 1250000,
  escrowNumber: 'ESC-2024-001',
  openDate: '2024-01-15',
  estimatedCloseDate: '2024-02-15',
  actualCloseDate: null,
  type: 'Purchase',
  
  // Property details
  property: {
    type: 'Single Family',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    yearBuilt: 2018,
    lot: '0.25 acres',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
    ],
  },
  
  // Parties
  buyer: {
    name: 'John & Jane Smith',
    email: 'smiths@email.com',
    phone: '(555) 123-4567',
    agent: 'Sarah Johnson',
    agentPhone: '(555) 234-5678',
    agentEmail: 'sarah@realty.com',
  },
  seller: {
    name: 'Robert Brown',
    email: 'rbrown@email.com',
    phone: '(555) 345-6789',
    agent: 'Mike Davis',
    agentPhone: '(555) 456-7890',
    agentEmail: 'mike@realty.com',
  },
  
  // Financial
  purchasePrice: 1250000,
  downPayment: 250000,
  loanAmount: 1000000,
  earnestMoney: 25000,
  commission: 75000,
  commissionSplit: {
    listing: 37500,
    selling: 37500,
  },
  
  // Timeline & Tasks
  timeline: [
    { date: '2024-01-15', event: 'Escrow Opened', status: 'completed', icon: <CheckCircle /> },
    { date: '2024-01-18', event: 'Initial Deposit Received', status: 'completed', icon: <AttachMoney /> },
    { date: '2024-01-22', event: 'Inspection Period Begins', status: 'completed', icon: <Build /> },
    { date: '2024-01-25', event: 'Inspection Completed', status: 'completed', icon: <Task /> },
    { date: '2024-01-28', event: 'Loan Application Submitted', status: 'completed', icon: <AccountBalance /> },
    { date: '2024-02-01', event: 'Appraisal Scheduled', status: 'in-progress', icon: <Assessment /> },
    { date: '2024-02-05', event: 'Loan Approval', status: 'pending', icon: <VerifiedUser /> },
    { date: '2024-02-10', event: 'Final Walkthrough', status: 'pending', icon: <Visibility /> },
    { date: '2024-02-15', event: 'Closing Date', status: 'pending', icon: <Gavel /> },
  ],
  
  // Documents
  documents: [
    { id: 1, name: 'Purchase Agreement', type: 'Contract', uploadDate: '2024-01-15', status: 'Signed', size: '2.4 MB' },
    { id: 2, name: 'Disclosure Package', type: 'Disclosure', uploadDate: '2024-01-16', status: 'Reviewed', size: '5.8 MB' },
    { id: 3, name: 'Inspection Report', type: 'Report', uploadDate: '2024-01-25', status: 'Complete', size: '8.2 MB' },
    { id: 4, name: 'Loan Application', type: 'Financial', uploadDate: '2024-01-28', status: 'Submitted', size: '3.1 MB' },
    { id: 5, name: 'Title Report', type: 'Title', uploadDate: '2024-01-30', status: 'Under Review', size: '4.5 MB' },
  ],
  
  // Checklist
  checklist: {
    'Pre-Contract': {
      'Property listed': true,
      'Marketing materials prepared': true,
      'Showings scheduled': true,
      'Offers received': true,
      'Offer accepted': true,
    },
    'Contract to Close': {
      'Escrow opened': true,
      'Earnest money deposited': true,
      'Inspection scheduled': true,
      'Inspection completed': true,
      'Repairs negotiated': false,
      'Loan application': true,
      'Appraisal ordered': false,
      'Title search': false,
      'Insurance obtained': false,
      'Final walkthrough': false,
    },
    'Closing': {
      'Documents prepared': false,
      'Funds confirmed': false,
      'Documents signed': false,
      'Keys transferred': false,
      'Commission paid': false,
    },
  },
  
  // From Dashboard View - AI Agents
  aiAgents: [
    {
      id: 1,
      name: 'Document Analyzer',
      type: 'document',
      status: 'active',
      confidence: 98,
      lastAction: 'Analyzed purchase agreement for completeness',
      icon: <Description />,
      tasksCompleted: 145,
      efficiency: 99.2,
    },
    {
      id: 2,
      name: 'Timeline Monitor',
      type: 'timeline',
      status: 'active',
      confidence: 95,
      lastAction: 'Sent reminder for upcoming appraisal',
      icon: <Schedule />,
      tasksCompleted: 89,
      efficiency: 97.5,
    },
    {
      id: 3,
      name: 'Compliance Guard',
      type: 'compliance',
      status: 'idle',
      confidence: 100,
      lastAction: 'All current requirements met',
      icon: <VerifiedUser />,
      tasksCompleted: 67,
      efficiency: 100,
    },
    {
      id: 4,
      name: 'Communication Hub',
      type: 'communication',
      status: 'active',
      confidence: 92,
      lastAction: 'Coordinating appraisal appointment',
      icon: <Forum />,
      tasksCompleted: 234,
      efficiency: 94.8,
    },
  ],
  
  // Activity feed
  recentActivity: [
    {
      id: 1,
      type: 'document',
      action: 'Title report uploaded',
      user: 'Title Company',
      timestamp: '2 hours ago',
      priority: 'medium',
    },
    {
      id: 2,
      type: 'ai',
      action: 'AI detected potential timeline delay in loan processing',
      user: 'Timeline Monitor',
      timestamp: '3 hours ago',
      priority: 'high',
    },
    {
      id: 3,
      type: 'communication',
      action: 'Buyer agent confirmed appraisal appointment',
      user: 'Sarah Johnson',
      timestamp: '5 hours ago',
      priority: 'low',
    },
    {
      id: 4,
      type: 'task',
      action: 'Inspection contingency removed',
      user: 'John Smith',
      timestamp: '1 day ago',
      priority: 'medium',
    },
  ],
  
  // Market analytics
  marketData: {
    avgDaysOnMarket: 28,
    medianPrice: 1150000,
    pricePerSqft: 446,
    inventoryLevel: 'Low',
    demandLevel: 'High',
    similarSales: [
      { address: '456 Pine St', price: 1180000, soldDate: '2024-01-10', daysOnMarket: 15 },
      { address: '123 Elm Ave', price: 1225000, soldDate: '2024-01-05', daysOnMarket: 22 },
      { address: '789 Maple Dr', price: 1195000, soldDate: '2023-12-28', daysOnMarket: 31 },
    ],
  },
};

// Chart data
const performanceData = [
  { name: 'Documents', completed: 80, pending: 20 },
  { name: 'Tasks', completed: 65, pending: 35 },
  { name: 'Communications', completed: 90, pending: 10 },
  { name: 'Compliance', completed: 100, pending: 0 },
];

const timelineProgressData = [
  { name: 'Overall Progress', value: 72, fill: '#673AB7' },
];

const aiActivityData = [
  { time: '00:00', documents: 5, communications: 8, tasks: 3 },
  { time: '04:00', documents: 3, communications: 2, tasks: 1 },
  { time: '08:00', documents: 12, communications: 25, tasks: 15 },
  { time: '12:00', documents: 8, communications: 20, tasks: 10 },
  { time: '16:00', documents: 15, communications: 30, tasks: 18 },
  { time: '20:00', documents: 6, communications: 12, tasks: 5 },
];

const EscrowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme?.breakpoints?.down?.('sm') || '(max-width:600px)');
  const queryClient = useQueryClient();

  // Safe date formatting helper
  const safeFormat = (dateValue, formatString) => {
    if (!dateValue) return 'N/A';
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
      if (!isValid(date)) return 'N/A';
      return format(date, formatString);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'N/A';
    }
  };

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [checklistExpanded, setChecklistExpanded] = useState({});
  const [agentDetailOpen, setAgentDetailOpen] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all');
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('detailed'); // Always use detailed view
  const [selectedImage, setSelectedImage] = useState(0);

  // Transform database escrow to expected format
  const transformDetailedEscrow = (dbData) => {
    if (!dbData) return mockEscrowData;
    
    // Handle different response formats
    const escrowData = dbData.data || dbData;
    
    return {
      id: escrowData.id,
      escrowNumber: escrowData.display_id || escrowData.displayId || escrowData.escrowNumber || escrowData.id,
      displayId: escrowData.display_id || escrowData.displayId || escrowData.escrowNumber,
      propertyAddress: escrowData.property_address || escrowData.propertyAddress,
      property: {
        address: escrowData.property_address || escrowData.propertyAddress,
        type: escrowData.property_type || escrowData.propertyType || 'Single Family',
        sqft: escrowData.propertyDetails?.sqft || 0,
        bedrooms: escrowData.propertyDetails?.bedrooms || 0,
        bathrooms: escrowData.propertyDetails?.bathrooms || 0,
        yearBuilt: escrowData.propertyDetails?.yearBuilt || null,
        lotSize: escrowData.propertyDetails?.lotSize || null,
        images: [escrowData.propertyImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      },
      status: escrowData.escrow_status || escrowData.escrowStatus || 'Active',
      listPrice: parseFloat(escrowData.purchase_price) || 0,
      purchasePrice: parseFloat(escrowData.purchase_price) || 0,
      downPayment: parseFloat(escrowData.down_payment) || 0,
      loanAmount: parseFloat(escrowData.loan_amount) || 0,
      earnestMoneyDeposit: parseFloat(escrowData.earnest_money_deposit) || 0,
      estimatedCloseDate: escrowData.scheduledCoeDate || escrowData.closing_date || escrowData.closingDate,
      acceptanceDate: escrowData.acceptanceDate || escrowData.acceptance_date,
      closeOfEscrowDate: escrowData.scheduledCoeDate || escrowData.closing_date || escrowData.closingDate,
      
      // Commission info
      commission: {
        totalCommission: parseFloat(escrowData.gross_commission) || 0,
        myCommission: parseFloat(escrowData.gross_commission || 0) * 0.5,
        rate: parseFloat(escrowData.commission_percentage) || 3,
        split: 50,
      },
      
      // Participants
      buyers: escrowData.buyers || [],
      sellers: escrowData.sellers || [],
      buyerAgent: escrowData.buyer_agent || null,
      listingAgent: escrowData.listing_agent || null,
      
      // Other data
      checklist: escrowData.checklist || [],
      documents: escrowData.documents || [],
      timeline: escrowData.timeline || [],
      activities: escrowData.timeline || [],
      
      // Defaults for missing fields
      escrowCompany: 'First American Title',
      titleCompany: 'Chicago Title',
      lender: 'Wells Fargo Home Mortgage',
      escrowOfficer: {
        name: 'Lisa Wilson',
        email: 'lisa.wilson@firstamerican.com',
        phone: '(619) 555-0999',
      },
    };
  };

  // Fetch escrow data
  const { data: rawData, isLoading, isError, error } = useQuery(
    ['escrow', id],
    () => escrowsAPI.getOne(id),
    {
      refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    }
  );

  // Transform the data
  const escrow = transformDetailedEscrow(rawData);

  // Calculate metrics
  const daysToClose = (() => {
    try {
      if (!escrow.estimatedCloseDate) return 0;
      const closeDate = typeof escrow.estimatedCloseDate === 'string' 
        ? parseISO(escrow.estimatedCloseDate) 
        : escrow.estimatedCloseDate;
      if (!isValid(closeDate)) return 0;
      return Math.max(0, differenceInDays(closeDate, new Date()));
    } catch (error) {
      console.warn('Error calculating days to close:', error);
      return 0;
    }
  })();
  
  const totalTasks = escrow.checklist 
    ? Object.values(escrow.checklist).reduce(
        (acc, section) => acc + Object.keys(section).length,
        0
      )
    : 0;
  
  const completedTasks = escrow.checklist
    ? Object.values(escrow.checklist).reduce(
        (acc, section) => acc + (section ? Object.values(section).filter(Boolean).length : 0),
        0
      )
    : 0;
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDocumentUpload = () => {
    setDocumentDialogOpen(true);
  };

  const handleChecklistToggle = (section) => {
    setChecklistExpanded(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAgentClick = (agentId) => {
    setAgentDetailOpen(agentDetailOpen === agentId ? null : agentId);
  };

  const handleActivityFilter = (filter) => {
    setActivityFilter(filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'primary';
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'delayed': return 'error';
      default: return 'default';
    }
  };

  const getTimelineIcon = (eventType) => {
    const icons = {
      'document': <Description />,
      'financial': <AttachMoney />,
      'inspection': <Build />,
      'approval': <VerifiedUser />,
      'closing': <Gavel />,
      'communication': <Forum />,
    };
    return icons[eventType] || <Event />;
  };

  return (
    <Container maxWidth="xl">
      {/* PRIMARY DEBUG SECTION - Only for System Admin */}
      {user?.username === 'admin' && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: 'warning.light',
            border: '2px solid',
            borderColor: 'warning.main'
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <BugReport />
              <Typography variant="h6">Complete Debug Summary</Typography>
              <Chip 
                label={process.env.NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟢 LOCAL'} 
                size="small" 
                color={process.env.NODE_ENV === 'production' ? 'error' : 'success'}
                sx={{ fontWeight: 'bold' }}
              />
              <Chip label="Admin Only" size="small" color="warning" />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDebugExpanded(!debugExpanded)}
                startIcon={debugExpanded ? <ExpandLess /> : <ExpandMore />}
              >
                {debugExpanded ? 'Hide' : 'Show'} Detailed Debug
              </Button>
              <CopyButton 
              text={JSON.stringify({
                pageInfo: {
                  url: window.location.href,
                  timestamp: new Date().toISOString(),
                  user: user?.username,
                  escrowId: id,
                  displayId: escrow?.displayId,
                  userAgent: navigator.userAgent,
                  screenResolution: `${window.screen.width}x${window.screen.height}`
                },
                loadingState: {
                  isLoading,
                  isError,
                  hasData: !!escrow,
                  errorMessage: error?.message,
                  rawDataReceived: !!error?.response?.data
                },
                escrowData: escrow ? {
                  // Full escrow object for debugging
                  fullEscrowObject: escrow,
                  // Key fields summary
                  summary: {
                    id: escrow.id,
                    displayId: escrow.displayId,
                    status: escrow.escrowStatus,
                    propertyAddress: escrow.propertyAddress,
                    purchasePrice: escrow.purchasePrice,
                    clientNames: escrow.clientNames,
                    scheduledCoeDate: escrow.scheduledCoeDate,
                    hasDocuments: !!(escrow.documents?.length),
                    documentsCount: escrow.documents?.length || 0,
                    hasActivities: !!(escrow.recentActivity?.length),
                    activitiesCount: escrow.recentActivity?.length || 0,
                    hasAIAgents: !!(escrow.aiAgents?.length),
                    aiAgentsCount: escrow.aiAgents?.length || 0,
                    hasChecklist: !!escrow.checklist,
                    checklistSections: escrow.checklist ? Object.keys(escrow.checklist).length : 0
                  }
                } : null,
                apiInfo: {
                  endpoint: `/escrows/${id}`,
                  baseURL: process.env.REACT_APP_API_URL,
                  environment: process.env.NODE_ENV,
                  queryKey: ['escrow', id],
                  lastFetch: new Date().toISOString()
                },
                debugComponents: {
                  networkMonitorActive: true,
                  detailPageDebuggerActive: true,
                  userIsSystemAdmin: user?.username === 'admin',
                  componentsRendered: ['NetworkMonitor', 'DetailPageDebugger', 'ComprehensiveDebugSummary', 'DatabaseSyncStatus']
                },
                networkActivity: (() => {
                  try {
                    if (!networkMonitor || typeof networkMonitor.getStats !== 'function') {
                      return {
                        note: "Network monitor not available",
                        stats: { total: 0, errors: 0 },
                        recentRequests: [],
                        allErrors: [],
                        totalRequests: 0,
                        errorCount: 0,
                        lastActivity: new Date().toISOString()
                      };
                    }
                    const stats = networkMonitor.getStats();
                    return {
                      note: "Network activity data from NetworkMonitor - all API requests and responses",
                      stats: stats,
                      recentRequests: networkMonitor.getRequests().slice(0, 5).map(req => ({
                        id: req.id,
                        method: req.method,
                        url: req.url,
                        status: req.statusCode,
                        success: req.success,
                        duration: req.duration,
                        timestamp: req.timestamp,
                        error: req.error
                      })),
                      allErrors: networkMonitor.getErrors().map(req => ({
                        method: req.method,
                        url: req.url,
                        error: req.error,
                        timestamp: req.timestamp
                      })),
                      totalRequests: stats.total,
                      errorCount: stats.errors,
                      lastActivity: new Date().toISOString()
                    };
                  } catch (error) {
                    console.error('Error accessing networkMonitor:', error);
                    return {
                      note: "Error accessing network monitor",
                      error: error.message,
                      stats: { total: 0, errors: 0 },
                      recentRequests: [],
                      allErrors: [],
                      totalRequests: 0,
                      errorCount: 0,
                      lastActivity: new Date().toISOString()
                    };
                  }
                })(),
                databaseSync: {
                  note: "Database sync status from DatabaseSyncStatus component - local vs production comparison",
                  warning: debugExpanded ? "Expand the debug section to see current sync status" : "Database sync status available in expanded debug section",
                  localOutOfDate: "As reported by user - local database is out of date compared to production"
                },
                browserInfo: {
                  location: window.location,
                  localStorage: {
                    hasUser: !!localStorage.getItem('user'),
                    hasToken: !!localStorage.getItem('token'),
                    userObject: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
                  },
                  sessionStorage: {
                    keys: Object.keys(sessionStorage)
                  },
                  cookies: document.cookie || 'No cookies'
                },
                additionalDebugInfo: {
                  reactQueryCache: "Check React Query DevTools for cache state",
                  componentState: {
                    debugExpanded,
                    activityFilter,
                    checklistExpanded,
                    documentDialogOpen: !!selectedDocument
                  },
                  performanceMetrics: {
                    pageLoadTime: performance.now(),
                    memoryUsage: performance.memory ? {
                      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                    } : 'Not available'
                  }
                }
              }, null, 2)}
              label="📋 COPY EVERYTHING FOR TROUBLESHOOTING"
              size="large"
              variant="contained"
            />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Expand to see additional debug data
          </Typography>
        </Paper>
      )}

      {/* DETAILED DEBUG PANELS - Collapsible */}
      {user?.username === 'admin' && (
        <Collapse in={debugExpanded}>
          <Box sx={{ mb: 3 }}>
            {/* Database Sync Status */}
            <DatabaseSyncStatus />
            <NetworkMonitor />
            <DetailPageDebugger 
              pageName="Escrow Detail"
              id={id}
              isLoading={isLoading}
              isError={isError}
              error={error}
              data={escrow}
              additionalInfo={{
                displayId: escrow?.displayId,
                hasDisplayId: !!escrow?.displayId,
                apiEndpoint: `/escrows/${id}`,
                queryKey: ['escrow', id]
              }}
            />
          </Box>
        </Collapse>
      )}
      
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Dashboard sx={{ mr: 0.5, fontSize: 20 }} />
          Dashboard
        </Link>
        <Link 
          color="inherit" 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/escrows');
          }}
        >
          Escrows
        </Link>
        <Typography color="text.primary">{escrow.address}</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <DetailPageHero
        type="escrow"
        title={escrow.address}
        subtitle={`Escrow ${escrow.displayId || escrow.escrowNumber}`}
        status={escrow.status}
        statusLabel={(escrow.status || 'UNKNOWN').toUpperCase()}
        icon={Home}
        starred={escrow.starred}
        onStarToggle={() => console.log('Toggle star')}
        onEdit={() => setEditMode(true)}
        onShare={() => console.log('Share')}
        onPrint={() => window.print()}
        aiAssistant={true}
        breadcrumbs={
          <Breadcrumbs sx={{ color: 'rgba(255,255,255,0.8)' }}>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/escrows')}
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              Escrows
            </Link>
            <Typography sx={{ color: 'white' }}>{escrow.address}</Typography>
          </Breadcrumbs>
        }
        infoCards={[
          {
            icon: <AttachMoney sx={{ fontSize: 24 }} />,
            label: 'Purchase Price',
            value: `$${(escrow.price || 0).toLocaleString()}`
          },
          {
            icon: <CalendarToday sx={{ fontSize: 24 }} />,
            label: 'Days to Close',
            value: daysToClose
          },
          {
            icon: <Speed sx={{ fontSize: 24 }} />,
            label: 'Progress',
            value: `${progress}%`
          },
          {
            icon: <Person sx={{ fontSize: 24 }} />,
            label: 'Buyer',
            value: escrow.buyer?.name || 'TBD'
          },
          {
            icon: <Person sx={{ fontSize: 24 }} />,
            label: 'Seller',
            value: escrow.seller?.name || 'TBD'
          },
          {
            icon: <Groups sx={{ fontSize: 24 }} />,
            label: 'Agents',
            value: `${escrow.buyer?.agent || 'TBD'} / ${escrow.seller?.agent || 'TBD'}`
          }
        ]}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <PropertyCard elevation={8}>
            {(escrow.property?.images || []).length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                effect="fade"
                onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                style={{ width: '100%', height: '100%' }}
              >
                {(escrow.property?.images || []).map((image, index) => (
                  <SwiperSlide key={index}>
                    <img src={image} alt={`Property ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                <Typography variant="h6" color="text.secondary">No Images Available</Typography>
              </Box>
            )}
            <Box className="property-overlay">
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="h4" fontWeight="bold">
                    {escrow.property?.bedrooms || 0}
                  </Typography>
                  <Typography variant="body2">Beds</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h4" fontWeight="bold">
                    {escrow.property?.bathrooms || 0}
                  </Typography>
                  <Typography variant="body2">Baths</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h4" fontWeight="bold">
                    {(((escrow.property && escrow.property.sqft) || 0) / 1000).toFixed(1)}k
                  </Typography>
                  <Typography variant="body2">Sq Ft</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h4" fontWeight="bold">
                    {escrow.property?.yearBuilt || 'N/A'}
                  </Typography>
                  <Typography variant="body2">Built</Typography>
                </Grid>
              </Grid>
            </Box>
          </PropertyCard>
        </MotionDiv>
      </DetailPageHero>

      {/* Enhanced Stats Section - Combines Overview & Property Data */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Financial Stats Row */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    ${(escrow.purchasePrice / 1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Price
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'primary.light', opacity: 0.3 }} />
              </Stack>
            </StatsCard>
          </MotionDiv>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsCard>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    ${(escrow.myCommission / 1000).toFixed(1)}k
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    My Commission
                  </Typography>
                </Box>
                <MonetizationOn sx={{ fontSize: 40, color: 'secondary.light', opacity: 0.3 }} />
              </Stack>
            </StatsCard>
          </MotionDiv>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatsCard>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info">
                    {progress}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                </Box>
                <AssignmentTurnedIn sx={{ fontSize: 40, color: 'info.light', opacity: 0.3 }} />
              </Stack>
            </StatsCard>
          </MotionDiv>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatsCard>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success">
                    {escrow.daysToClose}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days to Close
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: 'success.light', opacity: 0.3 }} />
              </Stack>
            </StatsCard>
          </MotionDiv>
        </Grid>

        {/* Property Details Row */}
        <Grid item xs={12}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.03) 0%, rgba(63, 81, 181, 0.03) 100%)',
              border: '1px solid rgba(103, 58, 183, 0.1)'
            }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Property Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Home sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="500">
                      {escrow.property?.type || 'Single Family'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Bed sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">Beds/Baths</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="500">
                      {escrow.property?.bedrooms || 4} / {escrow.property?.bathrooms || 3}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SquareFoot sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">Sq. Feet</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="500">
                      {((escrow.property?.sqft || 2847).toLocaleString())}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarMonth sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">Year Built</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="500">
                      {escrow.property?.yearBuilt || 2015}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Landscape sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">Lot Size</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight="500">
                      {escrow.property?.lot || '7,500 sqft'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </MotionDiv>
        </Grid>

        {/* Financial Breakdown Row */}
        <Grid item xs={12}>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(0, 150, 136, 0.03) 0%, rgba(76, 175, 80, 0.03) 100%)',
              border: '1px solid rgba(0, 150, 136, 0.1)'
            }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Transaction Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Down Payment</Typography>
                    <Typography variant="h5" fontWeight="600" color="primary">
                      ${(escrow.downPayment || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(((escrow.downPayment || 0) / (escrow.purchasePrice || 1)) * 100)}% of purchase price
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Loan Amount</Typography>
                    <Typography variant="h5" fontWeight="600" color="secondary">
                      ${(escrow.loanAmount || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {escrow.lender || 'Wells Fargo Home Mortgage'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Closing Costs</Typography>
                    <Typography variant="h5" fontWeight="600" color="info">
                      ${(escrow.closingCosts || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Estimated buyer costs
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">Monthly Payment</Typography>
                    <Typography variant="h5" fontWeight="600" color="success">
                      ${(escrow.monthlyPayment || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Principal & Interest
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </MotionDiv>
        </Grid>
      </Grid>

      {/* Main Content - Conditional Rendering based on viewMode */}
      {viewMode === 'overview' ? (
        // AI Overview Mode (Dashboard View)
        <Fade in={viewMode === 'overview'}>
          <Box>
            <Grid container spacing={3}>
              {/* AI Agents Section */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="600">
                      AI Agent Activity
                    </Typography>
                    <ToggleButtonGroup
                      value="real-time"
                      exclusive
                      size="small"
                    >
                      <ToggleButton value="real-time">Real-time</ToggleButton>
                      <ToggleButton value="24h">24h</ToggleButton>
                      <ToggleButton value="7d">7 days</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {(escrow.aiAgents || []).map((agent) => (
                      <Grid item xs={12} sm={6} key={agent.id}>
                        <AIAgentCard 
                          className={agent.status === 'active' ? 'active' : ''}
                          onClick={() => handleAgentClick(agent.id)}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              className="agent-avatar"
                              sx={{ 
                                bgcolor: agent.status === 'active' ? 'success.main' : 'grey.400',
                                width: 48,
                                height: 48,
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {agent.icon}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {agent.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {agent.lastAction}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip 
                                  label={`${agent.confidence}% confidence`} 
                                  size="small"
                                  color={agent.confidence > 90 ? 'success' : 'warning'}
                                />
                                <Chip 
                                  label={`${agent.tasksCompleted} tasks`} 
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>
                          </Stack>
                          
                          <Collapse in={agentDetailOpen === agent.id}>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Efficiency Rate
                                </Typography>
                                <Typography variant="h6">
                                  {agent.efficiency}%
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Status
                                </Typography>
                                <Typography variant="h6">
                                  {agent.status}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Collapse>
                        </AIAgentCard>
                      </Grid>
                    ))}
                  </Grid>

                  {/* AI Activity Chart */}
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={aiActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="documents" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="communications" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                        <Area type="monotone" dataKey="tasks" stackId="1" stroke="#ffc658" fill="#ffc658" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* Activity Feed */}
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="600">
                      Recent Activity
                    </Typography>
                    <IconButton size="small">
                      <FilterList />
                    </IconButton>
                  </Stack>

                  <Stack spacing={2}>
                    {(escrow.recentActivity || []).map((activity) => (
                      <ActivityCard key={activity.id}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar 
                            sx={{ 
                              bgcolor: activity.priority === 'high' ? 'error.main' : 
                                      activity.priority === 'medium' ? 'warning.main' : 'info.main',
                              width: 36,
                              height: 36,
                            }}
                          >
                            {getTimelineIcon(activity.type)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle2">
                              {activity.action}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {activity.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                • {activity.timestamp}
                              </Typography>
                            </Stack>
                          </Box>
                          {activity.priority === 'high' && (
                            <Chip label="High" size="small" color="error" />
                          )}
                        </Stack>
                      </ActivityCard>
                    ))}
                  </Stack>

                  <Button 
                    fullWidth 
                    variant="text" 
                    sx={{ mt: 2 }}
                    startIcon={<History />}
                  >
                    View All Activity
                  </Button>
                </Paper>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4} md={2}>
                      <QuickActionCard>
                        <IconButton className="action-icon" color="primary" size="large">
                          <Upload />
                        </IconButton>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Upload Document
                        </Typography>
                      </QuickActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <QuickActionCard>
                        <IconButton className="action-icon" color="primary" size="large">
                          <Message />
                        </IconButton>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Send Message
                        </Typography>
                      </QuickActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <QuickActionCard>
                        <IconButton className="action-icon" color="primary" size="large">
                          <Task />
                        </IconButton>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Create Task
                        </Typography>
                      </QuickActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <QuickActionCard>
                        <IconButton className="action-icon" color="primary" size="large">
                          <CalendarToday />
                        </IconButton>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Schedule Event
                        </Typography>
                      </QuickActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <QuickActionCard>
                        <IconButton className="action-icon" color="primary" size="large">
                          <Assessment />
                        </IconButton>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          View Report
                        </Typography>
                      </QuickActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                      <QuickActionCard>
                        <IconButton className="action-icon" color="primary" size="large">
                          <Notifications />
                        </IconButton>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Set Reminder
                        </Typography>
                      </QuickActionCard>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Market Analytics */}
              <Grid item xs={12}>
                <MarketCard>
                  <CardContent>
                    <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                      Market Analytics
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="primary" fontWeight="bold">
                                {escrow.marketData?.avgDaysOnMarket || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Avg Days on Market
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="primary" fontWeight="bold">
                                ${((escrow.marketData?.medianPrice || 0) / 1000).toFixed(0)}k
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Median Price
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="primary" fontWeight="bold">
                                ${escrow.marketData?.pricePerSqft || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Price per Sq Ft
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box textAlign="center">
                              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                  {escrow.marketData?.demandLevel || 'N/A'}
                                </Typography>
                                <TrendingUp color="success" />
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                Demand Level
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Recent Comparable Sales
                        </Typography>
                        <List dense>
                          {(escrow.marketData?.similarSales || []).map((sale, idx) => (
                            <ListItem key={idx} disableGutters>
                              <ListItemText
                                primary={sale.address}
                                secondary={`$${(sale.price || 0).toLocaleString()} • ${sale.daysOnMarket} days`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MarketCard>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      ) : (
        // Detailed View Mode (Traditional Tabs)
        <Fade in={viewMode === 'detailed'}>
          <Box>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Tab label="Timeline" icon={<TimelineIcon />} iconPosition="start" />
                <Tab label="Documents" icon={<Description />} iconPosition="start" />
                <Tab label="Financials" icon={<AttachMoney />} iconPosition="start" />
                <Tab label="Tasks" icon={<Task />} iconPosition="start" />
                <Tab label="Parties" icon={<Groups />} iconPosition="start" />
                <Tab label="Activity" icon={<History />} iconPosition="start" />
                <Tab label="AI Overview" icon={<AutoAwesome />} iconPosition="start" />
              </Tabs>

              {/* Tab Panels */}
              {/* Timeline Tab - Index 0 */}
              <TabPanel hidden={activeTab !== 0}>
                {(escrow.timeline || []).length > 0 ? (
                  <Timeline position="alternate">
                    {escrow.timeline.map((event, index) => (
                      <TimelineItem key={index}>
                        <TimelineOppositeContent color="text.secondary">
                          {safeFormat(event.date, 'MMM dd, yyyy')}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot 
                            color={
                              event.status === 'completed' ? 'success' :
                              event.status === 'in-progress' ? 'warning' : 'grey'
                            }
                          >
                            {event.icon}
                          </TimelineDot>
                          {index < escrow.timeline.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <TimelineCard elevation={2}>
                            <CardContent>
                              <Typography variant="h6" component="span">
                                {event.event}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {event.status}
                              </Typography>
                            </CardContent>
                          </TimelineCard>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <EmptyState
                    icon={TimelineIcon}
                    title="No Timeline Events Yet"
                    subtitle="Timeline events will appear here as the escrow progresses. Add your first milestone to start tracking the escrow journey."
                    actionText="Add First Event"
                    onAction={() => console.log('Add timeline event')}
                  />
                )}
              </TabPanel>

              {/* Documents Tab - Index 1 */}
              <TabPanel hidden={activeTab !== 1}>
                {(escrow.documents || []).length > 0 ? (
                  <>
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Documents ({escrow.documents.length})</Typography>
                        <Button
                          variant="contained"
                          startIcon={<Upload />}
                          onClick={handleDocumentUpload}
                        >
                          Upload Document
                        </Button>
                      </Stack>
                    </Stack>

                    <List>
                      {escrow.documents.map((doc) => (
                    <DocumentItem key={doc.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Description />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={
                          <Stack direction="row" spacing={2}>
                            <Typography variant="caption">{doc.type}</Typography>
                            <Typography variant="caption">•</Typography>
                            <Typography variant="caption">{doc.size}</Typography>
                            <Typography variant="caption">•</Typography>
                            <Typography variant="caption">
                              {safeFormat(doc.uploadDate, 'MMM dd, yyyy')}
                            </Typography>
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={doc.status} 
                            size="small"
                            color={doc.status === 'Signed' ? 'success' : 'warning'}
                          />
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Download />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </DocumentItem>
                  ))}
                    </List>
                  </>
                ) : (
                  <EmptyState
                    icon={Description}
                    title="No Documents Yet"
                    subtitle="Upload important escrow documents like purchase agreements, inspection reports, and disclosures to keep everything organized in one place."
                    actionText="Upload First Document"
                    onAction={handleDocumentUpload}
                  />
                )}
              </TabPanel>

              {/* Financials Tab - Index 2 */}
              <TabPanel hidden={activeTab !== 2}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Financial Summary
                        </Typography>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell>Purchase Price</TableCell>
                              <TableCell align="right">
                                <Typography variant="h5">
                                  ${(escrow.purchasePrice || 0).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Down Payment (20%)</TableCell>
                              <TableCell align="right">
                                ${(escrow.downPayment || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Loan Amount</TableCell>
                              <TableCell align="right">
                                ${(escrow.loanAmount || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Earnest Money Deposit</TableCell>
                              <TableCell align="right">
                                ${(escrow.earnestMoney || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                            <Divider />
                            <TableRow>
                              <TableCell>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  Total Commission (6%)
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle1" fontWeight="medium">
                                  ${(escrow.commission || 0).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ pl: 4 }}>Listing Agent (3%)</TableCell>
                              <TableCell align="right">
                                ${((escrow.commissionSplit && escrow.commissionSplit.listing) || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ pl: 4 }}>Selling Agent (3%)</TableCell>
                              <TableCell align="right">
                                ${((escrow.commissionSplit && escrow.commissionSplit.selling) || 0).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tasks Tab - Index 3 */}
              <TabPanel hidden={activeTab !== 3}>
                <Stack spacing={3}>
                  {escrow.checklist && Object.entries(escrow.checklist).map(([section, tasks]) => (
                    <ProcessStep key={section}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleChecklistToggle(section)}
                      >
                        <Typography variant="h6">{section}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label={`${tasks ? Object.values(tasks).filter(Boolean).length : 0}/${tasks ? Object.keys(tasks).length : 0}`}
                            size="small"
                            color="primary"
                          />
                          <IconButton size="small">
                            {checklistExpanded[section] ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Stack>
                      </Stack>
                      
                      <Collapse in={checklistExpanded[section] !== false}>
                        <Box sx={{ mt: 2 }}>
                          <FormGroup>
                            {Object.entries(tasks).map(([task, completed]) => (
                              <FormControlLabel
                                key={task}
                                control={
                                  <Checkbox
                                    checked={completed}
                                    color="primary"
                                    icon={<RadioButtonUnchecked />}
                                    checkedIcon={<CheckCircle />}
                                  />
                                }
                                label={task}
                                sx={{
                                  '& .MuiFormControlLabel-label': {
                                    textDecoration: completed ? 'line-through' : 'none',
                                    color: completed ? 'text.secondary' : 'text.primary',
                                  },
                                }}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      </Collapse>
                    </ProcessStep>
                  ))}
                </Stack>
              </TabPanel>

              {/* Parties Tab - Index 4 */}
              <TabPanel hidden={activeTab !== 4}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Buyer Information
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Person />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.buyer?.name || 'TBD'}
                              secondary="Buyer"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Email />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.buyer?.email || 'TBD'}
                              secondary="Email"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.buyer?.phone || 'TBD'}
                              secondary="Phone"
                            />
                          </ListItem>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <BusinessCenter />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.buyer?.agent || 'TBD'}
                              secondary="Buyer's Agent"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.buyer?.agentPhone || 'TBD'}
                              secondary="Agent Phone"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Seller Information
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Person />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.seller?.name || 'TBD'}
                              secondary="Seller"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Email />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.seller?.email || 'TBD'}
                              secondary="Email"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.seller?.phone || 'TBD'}
                              secondary="Phone"
                            />
                          </ListItem>
                          <Divider />
                          <ListItem>
                            <ListItemIcon>
                              <BusinessCenter />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.seller?.agent || 'TBD'}
                              secondary="Seller's Agent"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone />
                            </ListItemIcon>
                            <ListItemText
                              primary={escrow.seller?.agentPhone || 'TBD'}
                              secondary="Agent Phone"
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>


              {/* Activity Tab - Index 5 */}
              <TabPanel hidden={activeTab !== 5}>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <ToggleButtonGroup
                    value={activityFilter}
                    exclusive
                    onChange={(e, newFilter) => handleActivityFilter(newFilter)}
                    size="small"
                  >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="documents">Documents</ToggleButton>
                    <ToggleButton value="communications">Communications</ToggleButton>
                    <ToggleButton value="tasks">Tasks</ToggleButton>
                    <ToggleButton value="ai">AI Actions</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>

                <Stack spacing={2}>
                  {(escrow.recentActivity || [])
                    .filter(activity => activityFilter === 'all' || activity.type === activityFilter)
                    .map((activity) => (
                      <ActivityCard key={activity.id}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar 
                            sx={{ 
                              bgcolor: activity.priority === 'high' ? 'error.main' : 
                                      activity.priority === 'medium' ? 'warning.main' : 'info.main',
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getTimelineIcon(activity.type)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1">
                              {activity.action}
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                {activity.user}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.timestamp}
                              </Typography>
                            </Stack>
                          </Box>
                          {activity.priority === 'high' && (
                            <Chip label="High Priority" size="small" color="error" />
                          )}
                        </Stack>
                      </ActivityCard>
                    ))}
                </Stack>
              </TabPanel>

              {/* AI Overview Tab - Index 6 */}
              <TabPanel hidden={activeTab !== 6}>
                <Grid container spacing={3}>
                  {/* AI Agents Section */}
                  <Grid item xs={12} lg={8}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h5" fontWeight="600">
                          AI Agent Activity
                        </Typography>
                        <ToggleButtonGroup
                          value="real-time"
                          exclusive
                          size="small"
                        >
                          <ToggleButton value="real-time">Real-time</ToggleButton>
                          <ToggleButton value="24h">24h</ToggleButton>
                          <ToggleButton value="7d">7 days</ToggleButton>
                        </ToggleButtonGroup>
                      </Stack>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {(escrow.aiAgents || []).map((agent) => (
                          <Grid item xs={12} sm={6} key={agent.id}>
                            <AIAgentCard 
                              className={agent.status === 'active' ? 'active' : ''}
                              onClick={() => handleAgentClick(agent.id)}
                            >
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar 
                                  sx={{ 
                                    bgcolor: agent.status === 'active' ? 'success.main' : 'grey.500',
                                    width: 40,
                                    height: 40
                                  }}
                                >
                                  <Tooltip title={agent.type}>
                                    {agent.icon}
                                  </Tooltip>
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="subtitle2" fontWeight="600">
                                    {agent.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {agent.currentTask}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={agent.status}
                                  size="small"
                                  color={agent.status === 'active' ? 'success' : 'default'}
                                  variant={agent.status === 'active' ? 'filled' : 'outlined'}
                                />
                              </Stack>
                              {agent.status === 'active' && (
                                <LinearProgress 
                                  variant="determinate" 
                                  value={agent.progress} 
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </AIAgentCard>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Task Queue */}
                      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                        Task Queue
                      </Typography>
                      <List>
                        {(escrow.taskQueue || []).map((task, index) => (
                          <ListItem key={task.id}>
                            <ListItemIcon>
                              <Circle 
                                color={task.priority === 'high' ? 'error' : 
                                       task.priority === 'medium' ? 'warning' : 'success'} 
                                sx={{ fontSize: 12 }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={task.title}
                              secondary={`${task.agent} • Est. ${task.estimatedTime}`}
                            />
                            <Chip label={task.status} size="small" />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>

                  {/* AI Insights Section */}
                  <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                      {/* Insights Card */}
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <Lightbulb color="warning" />
                            <Typography variant="h6">AI Insights</Typography>
                          </Stack>
                          <Stack spacing={2}>
                            {(escrow.aiInsights || []).map((insight, index) => (
                              <Alert 
                                key={index}
                                severity={insight.type}
                                icon={<AutoAwesome />}
                              >
                                {insight.message}
                              </Alert>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Automation Stats */}
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Automation Impact
                          </Typography>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Tasks Automated
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {escrow.automationStats?.tasksAutomated || 0}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Time Saved
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {escrow.automationStats?.timeSaved || '0 hours'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Accuracy Rate
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {escrow.automationStats?.accuracy || '0%'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>

                      {/* Next Actions */}
                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Recommended Actions
                          </Typography>
                          <Stack spacing={1}>
                            {(escrow.recommendedActions || []).map((action, index) => (
                              <Button
                                key={index}
                                variant="outlined"
                                fullWidth
                                startIcon={action.icon}
                                onClick={() => handleActionClick(action)}
                                sx={{ justifyContent: 'flex-start' }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </TabPanel>
            </Paper>

            {/* Bottom Stats Cards */}
            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <StatsCard>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" className="metric-value">
                          ${((escrow.commission || 0) / 1000).toFixed(1)}k
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expected Commission
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#4CAF50', 0.1),
                          color: 'success.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <AttachMoney />
                      </Avatar>
                    </Stack>
                  </StatsCard>
                </MotionDiv>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <StatsCard>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" className="metric-value">
                          {escrow.tasks?.filter(t => t.status === 'completed').length || 0}/{escrow.tasks?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tasks Completed
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#2196F3', 0.1),
                          color: 'primary.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Task />
                      </Avatar>
                    </Stack>
                  </StatsCard>
                </MotionDiv>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <StatsCard>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" className="metric-value">
                          {escrow.messages?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Messages
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#9C27B0', 0.1),
                          color: 'secondary.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Message />
                      </Avatar>
                    </Stack>
                  </StatsCard>
                </MotionDiv>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <StatsCard>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h4" fontWeight="bold" className="metric-value">
                          {escrow.inspections?.filter(i => i.status === 'passed').length || 0}/{escrow.inspections?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Inspections Passed
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha('#FF9800', 0.1),
                          color: 'warning.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Assignment />
                      </Avatar>
                    </Stack>
                  </StatsCard>
                </MotionDiv>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}

      {/* Floating Speed Dial */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Upload />}
          tooltipTitle="Upload Document"
          onClick={handleDocumentUpload}
        />
        <SpeedDialAction
          icon={<Message />}
          tooltipTitle="Send Message"
        />
        <SpeedDialAction
          icon={<Task />}
          tooltipTitle="Create Task"
        />
        <SpeedDialAction
          icon={<Print />}
          tooltipTitle="Print Report"
        />
      </SpeedDial>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Summary</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Archive fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
      </Menu>

      {/* Document Upload Dialog */}
      <Dialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Document Name"
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select label="Document Type">
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="disclosure">Disclosure</MenuItem>
                <MenuItem value="report">Report</MenuItem>
                <MenuItem value="financial">Financial</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ py: 3 }}
            >
              Choose File
              <input type="file" hidden />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDocumentDialogOpen(false)}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EscrowDetail;