// frontend/src/components/details/EscrowDetail.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, EffectCoverflow } from 'swiper/modules';

// Import the new stunning widgets
import PeopleWidget from '../escrow-detail/widgets/PeopleWidget';
import TimelineWidget from '../escrow-detail/widgets/TimelineWidget';
import FinancialsWidget from '../escrow-detail/widgets/FinancialsWidget';
import ChecklistWidget from '../escrow-detail/widgets/ChecklistWidget';

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
  MonetizationOn,
  AssignmentTurnedIn,
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
  Bed,
  SquareFoot,
  Landscape,
  DirectionsCar,
  Pool,
  Bathtub,
  Stairs,
  InsertDriveFile,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { format, formatDistanceToNow, addDays, differenceInDays, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { escrowsAPI, documentsAPI } from '../../services/api.service';
import CountUp from 'react-countup';
import { formatPriceShort } from '../../utils/formatters';
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
import ChartErrorBoundary from '../common/ChartErrorBoundary';
import NetworkMonitorSimple from '../common/NetworkMonitorSimple';
import EnhancedDatabaseMonitor from '../common/EnhancedDatabaseMonitor';
import DebugCard from '../common/DebugCard';
import networkMonitor from '../../services/networkMonitor.service';
import CopyButton from '../common/CopyButton';
import DetailPageHero from '../common/DetailPageHero';
import DebugCard from '../common/DebugCard';
import ZillowPreview from '../common/ZillowPreview';
import { formatEntityId } from '../../utils/entityIdUtils';
import StunningPropertyDisplay from './StunningPropertyDisplay';
import AllDataViewer from './AllDataViewer';

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

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const liquidMorph = keyframes`
  0% {
    border-radius: 20px;
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  50% {
    border-radius: 24px;
    transform: scale(1.02);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
  100% {
    border-radius: 20px;
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const expandAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

const colorShift = keyframes`
  0% { filter: hue-rotate(0deg) saturate(1); }
  50% { filter: hue-rotate(20deg) saturate(1.2); }
  100% { filter: hue-rotate(0deg) saturate(1); }
`;

const waveAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

// Styled Components
// HeroSection - Replaced with DetailPageHero component

// Safe date formatting helper
const safeFormat = (dateValue, formatString) => {
  if (!dateValue) return 'N/A';
  try {
    // Handle both string and Date object inputs
    let date;
    if (typeof dateValue === 'string') {
      // Try to parse ISO string first
      date = parseISO(dateValue);
      // If invalid, try regular Date constructor
      if (!isValid(date)) {
        date = new Date(dateValue);
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return 'N/A';
    }
    
    // Check if date is valid
    if (!isValid(date)) {
      return 'N/A';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

// Helper function to format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return 'Not set';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper function to clean escrow IDs that have extra zeros

const EditableField = ({ field, value, onSave, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    console.log(`EditableField[${field}] value changed:`, value);
    setEditValue(value || '');
  }, [value, field]);
  
  const handleSave = async () => {
    console.log('EditableField handleSave called:', {
      field,
      originalValue: value,
      editValue,
      hasChanged: value !== editValue
    });
    setIsSaving(true);
    await onSave(field, editValue);
    setIsSaving(false);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
        {type === 'date' ? (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={editValue ? new Date(editValue) : null}
              onChange={(newValue) => setEditValue(newValue?.toISOString())}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  size="small" 
                  sx={{ flexGrow: 1 }}
                  autoFocus
                />
              )}
            />
          </LocalizationProvider>
        ) : (
          <TextField
            size="small"
            value={editValue}
            onChange={(e) => {
              console.log('EditableField onChange:', {
                field,
                newValue: e.target.value,
                previousValue: editValue
              });
              setEditValue(e.target.value);
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            sx={{ flexGrow: 1 }}
            type={type}
          />
        )}
        <IconButton 
          size="small" 
          color="success" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <CircularProgress size={16} /> : <Check fontSize="small" />}
        </IconButton>
        <IconButton size="small" color="error" onClick={handleCancel}>
          <Close fontSize="small" />
        </IconButton>
      </Stack>
    );
  }
  
  const displayValue = () => {
    if (!value) return 'Not set';
    if (type === 'date') return safeFormat(value, 'MMM dd, yyyy');
    return value;
  };
  
  return (
    <Box 
      onClick={() => setIsEditing(true)}
      sx={{ 
        cursor: 'pointer',
        flex: 1,
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        transition: 'all 0.2s',
        border: '1px solid transparent',
        '&:hover': { 
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
        }
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          color: !value ? 'text.secondary' : 'text.primary',
          fontStyle: !value ? 'italic' : 'normal'
        }}
      >
        {displayValue()}
      </Typography>
    </Box>
  );
};

const LiquidWidget = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  height: '100%',
  minHeight: 280,
  borderRadius: theme.spacing(2.5),
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transformOrigin: 'center center',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  transform: 'translateZ(0)',
  willChange: 'transform, box-shadow',
  
  // No animation by default to prevent spinning
  
  // Gradient overlay for depth
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  },
  
  // Expanding circle on click
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  '&:hover': {
    transform: 'translateY(-2px) translateZ(0)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
    borderRadius: theme.spacing(3),
    // Disable animation on hover to prevent spinning
    animation: 'none',
    // Add a subtle glow effect
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  
  '&:active': {
    transform: 'translateY(-2px) translateZ(0)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
    
    '&::after': {
      width: '120%',
      height: '120%',
      opacity: 0,
    },
  },
}));

const DataTooltip = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) scale(0)',
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  width: '90vw',
  maxWidth: 1200,
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  zIndex: 1301,
  opacity: 0,
  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  maxHeight: '85vh',
  overflowY: 'auto',
  pointerEvents: 'none',
  '&.show': {
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: 1,
    pointerEvents: 'auto',
  },
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.light,
    borderRadius: 4,
  },
}));

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
    transition: 'transform 0.3s ease',
  },
  '& a:hover img': {
    transform: 'scale(1.05)',
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
  
  // Log the ID we're using
  console.log('EscrowDetail - Using ID from route:', id);


  // State
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [checklistExpanded, setChecklistExpanded] = useState({});
  const [agentDetailOpen, setAgentDetailOpen] = useState(null);
  const [openWidget, setOpenWidget] = useState(null);
  const [widgetAnimationClass, setWidgetAnimationClass] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [activityFilter, setActivityFilter] = useState('all');
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('detailed'); // Always use detailed view
  const [editMode, setEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [chartError, setChartError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tabValue, setTabValue] = useState(0); // For two-tab interface
  const [expandedWidget, setExpandedWidget] = useState(null); // For expanding widgets
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Transform database escrow to expected format with new API structure
  const transformDetailedEscrow = (dbData) => {
    if (!dbData) return mockEscrowData;
    
    // Handle different response formats
    const escrowData = dbData.data || dbData;
    
    // Check if this is the new restructured format
    const hasNewStructure = escrowData.details && escrowData['property-details'];
    
    // Extract data based on structure
    const details = hasNewStructure ? escrowData.details : escrowData;
    const propertyDetails = hasNewStructure ? escrowData['property-details'] : (escrowData.propertyDetails || escrowData['property-details'] || {});
    const people = escrowData.people || {};
    const timeline = escrowData.timeline || {};
    const financials = escrowData.financials || {};
    
    // Handle checklists - new structure has separate checklist objects
    const checklists = hasNewStructure ? {
      loan: escrowData['checklist-loan'] || {},
      house: escrowData['checklist-house'] || {},
      admin: escrowData['checklist-admin'] || {}
    } : (escrowData.checklists || escrowData['checklist-loan'] ? {
      loan: escrowData['checklist-loan'] || {},
      house: escrowData['checklist-house'] || {},
      admin: escrowData['checklist-admin'] || {}
    } : {});
    
    return {
      // Core fields from top level (matching list view)
      id: formatEntityId(escrowData.id || details.id, 'escrow'),
      escrowNumber: details.escrowNumber || details.displayId || escrowData.escrowNumber || `ESC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      displayId: details.escrowNumber || details.displayId || escrowData.escrowNumber,
      propertyAddress: details.propertyAddress || escrowData.propertyAddress || propertyDetails.address,
      propertyImage: details.propertyImage || escrowData.propertyImage || propertyDetails.propertyImage,
      zillowUrl: details.zillowUrl || escrowData.zillow_url || escrowData.zillowUrl,
      zillow_url: details.zillowUrl || escrowData.zillow_url || escrowData.zillowUrl,
      status: details.escrowStatus || escrowData.escrowStatus || 'Active',
      escrowStatus: details.escrowStatus || escrowData.escrowStatus || 'Active',
      purchasePrice: details.purchasePrice || financials.purchasePrice || escrowData.purchasePrice,
      myCommission: details.myCommission || financials.agentSplit || financials.myCommission || escrowData.myCommission,
      clients: escrowData.clients || [],
      scheduledCoeDate: details.scheduledCoeDate || timeline.coeDate || escrowData.scheduledCoeDate,
      daysToClose: details.daysToClose || escrowData.daysToClose,
      checklistProgress: details.checklistProgress || escrowData.checklistProgress,
      lastActivity: details.lastActivity || escrowData.lastActivity,
      upcomingDeadlines: details.upcomingDeadlines || escrowData.upcomingDeadlines,
      
      // Property details for top section
      property: {
        address: propertyDetails.address || escrowData.propertyAddress,
        type: propertyDetails.propertyType || 'Single Family',
        sqft: propertyDetails.squareFeet || 0,
        bedrooms: propertyDetails.bedrooms || 0,
        bathrooms: propertyDetails.bathrooms || 0,
        yearBuilt: propertyDetails.yearBuilt || null,
        lotSize: propertyDetails.lotSizeSqft || null,
        images: propertyDetails.images || [escrowData.propertyImage],
        // Additional property info
        city: propertyDetails.city,
        state: propertyDetails.state,
        zipCode: propertyDetails.zipCode,
        county: propertyDetails.county,
        pool: propertyDetails.pool,
        garageSpaces: propertyDetails.garageSpaces,
        stories: propertyDetails.stories,
        mlsNumber: propertyDetails.mlsNumber,
        listPrice: propertyDetails.listPrice,
        pricePerSqft: propertyDetails.pricePerSqft,
      },
      
      // Dates from timeline
      acceptanceDate: timeline.acceptanceDate,
      estimatedCloseDate: escrowData.scheduledCoeDate || timeline.closingDate,
      closeOfEscrowDate: timeline.closingDate,
      escrowOpenedDate: timeline.escrowOpenedDate,
      
      // Financial info
      listPrice: propertyDetails.listPrice || escrowData.purchasePrice,
      downPayment: financials.downPayment || 0,
      loanAmount: financials.loanAmount || 0,
      earnestMoneyDeposit: financials.earnestMoneyDeposit || 0,
      
      // Commission info from financials
      commission: {
        totalCommission: financials.grossCommission || 0,
        myCommission: financials.agentCommission || escrowData.myCommission || 0,
        rate: (financials.baseCommission / escrowData.purchasePrice * 100) || 3,
        split: financials.splitPercentage || 70,
        agentNet: financials.agentNet || 0,
        franchiseFees: financials.franchiseFees || 0,
      },
      
      // People/Participants
      buyers: people.buyer ? [people.buyer] : [],
      sellers: people.seller ? [people.seller] : [],
      buyer: people.buyer || null,
      seller: people.seller || null,
      buyerAgent: people.buyerAgent || null,
      listingAgent: people.sellerAgent || null,
      
      // Transaction team from people object
      escrowCompany: people.transactionTeam?.escrowCompany || '',
      titleCompany: people.transactionTeam?.titleCompany || '',
      lender: people.lender?.name || '',
      escrowOfficer: people.escrowOfficer || {
        name: '',
        email: '',
        phone: '',
      },
      loanOfficer: people.loanOfficer || null,
      transactionCoordinator: people.transactionTeam?.transactionCoordinator || '',
      
      // Tab data
      checklist: checklists || {},
      'checklist-loan': checklists.loan || escrowData['checklist-loan'] || {},
      'checklist-house': checklists.house || escrowData['checklist-house'] || {},
      'checklist-admin': checklists.admin || escrowData['checklist-admin'] || {},
      checklists: checklists || {},
      documents: escrowData.documents || [],
      timeline: timeline || {},
      activities: [],
      financials: financials || {},
      people: people || {},
      propertyDetails: {
        ...propertyDetails,
        zillowUrl: escrowData.zillow_url || escrowData.zillowUrl,
        zillow_url: escrowData.zillow_url || escrowData.zillowUrl,
      }
    };
  };

  // Effect to reset animation when widget closes
  useEffect(() => {
    if (!openWidget) {
      setWidgetAnimationClass('');
    }
  }, [openWidget]);
  
  // Fetch escrow data
  const { data: rawData, isLoading, isError, error, refetch } = useQuery(
    ['escrow', id],
    () => {
      console.log('Fetching escrow with ID:', id);
      return escrowsAPI.getOne(id);
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
      staleTime: 0, // Consider data stale immediately
      cacheTime: 5000, // Keep in cache for 5 seconds to allow updates
      refetchOnMount: 'always', // Always refetch when component mounts
      refetchOnWindowFocus: false, // Don't refetch on window focus
      enabled: mounted, // Only fetch when component is mounted
      onSuccess: (data) => {
        console.log('Escrow fetch successful, raw response:', data);
        if (data && data.data) {
          console.log('API Response Structure:', {
            hasData: !!data.data,
            dataKeys: Object.keys(data.data || {}),
            purchasePrice: data.data.purchasePrice,
            purchase_price: data.data.purchase_price,
            myCommission: data.data.myCommission,
            net_commission: data.data.net_commission,
            down_payment: data.data.down_payment,
            downPayment: data.data.downPayment
          });
        }
      },
      onError: (error) => {
        console.error('Escrow fetch failed:', error);
      }
    }
  );

  // Transform the data - use useMemo to ensure it updates when rawData changes
  const escrow = useMemo(() => {
    console.log('=== ESCROW TRANSFORMATION ===');
    console.log('Raw data:', rawData);
    console.log('Raw data timestamp:', new Date().toISOString());
    console.log('Component mounted state:', mounted);
    
    if (!rawData) {
      console.log('No raw data available, returning mock data');
      return mockEscrowData;
    }
    
    const transformed = transformDetailedEscrow(rawData);
    
    console.log('Transformed data:', transformed);
    console.log('Buyer name in transformed:', transformed?.people?.buyer?.name);
    console.log('Seller name in transformed:', transformed?.people?.seller?.name);
    console.log('=== END TRANSFORMATION ===');
    
    return transformed;
  }, [rawData, mounted]);
  
  // Additional debug for financial fields
  if (rawData && rawData.data) {
    console.log('Financial data debug:', {
      raw_purchasePrice: rawData.data.purchasePrice,
      raw_purchase_price: rawData.data.purchase_price,
      transformed_purchasePrice: escrow.purchasePrice,
      raw_myCommission: rawData.data.myCommission,
      raw_netCommission: rawData.data.netCommission,
      raw_net_commission: rawData.data.net_commission,
      transformed_myCommission: escrow.commission?.myCommission
    });
  }

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

  // Calculate progress for each widget
  const widgetProgress = {
    people: 0,
    checklist: progress, // Use overall checklist progress
    timeline: 0,
    financials: 0,
    documents: 0
  };

  // People progress - check if key people are assigned
  if (escrow.people) {
    const peopleFields = [
      escrow.people?.buyer?.name,
      escrow.people?.buyer?.email,
      escrow.people?.seller?.name,
      escrow.people?.seller?.email,
      escrow.people?.buyerAgent?.name,
      escrow.people?.listingAgent?.name
    ];
    const filledPeople = peopleFields.filter(field => field && field !== 'Not set').length;
    widgetProgress.people = Math.round((filledPeople / peopleFields.length) * 100);
  }

  // Timeline progress - check key dates
  if (escrow.timeline) {
    const keyDates = ['acceptanceDate', 'inspectionDate', 'appraisalDate', 
                     'loanApprovalDate', 'closingDate'];
    const setDates = keyDates.filter(date => escrow.timeline[date]).length;
    widgetProgress.timeline = Math.round((setDates / keyDates.length) * 100);
  }

  // Financials progress - check key financial fields
  if (escrow.financials) {
    const keyFields = ['purchasePrice', 'downPayment', 'loanAmount', 
                      'earnestMoney', 'myCommissionRate'];
    const filledFields = keyFields.filter(field => 
      escrow.financials[field] !== null && escrow.financials[field] !== undefined
    ).length;
    widgetProgress.financials = Math.round((filledFields / keyFields.length) * 100);
  }

  // Documents progress - based on document count
  if (escrow.documents) {
    const minRequiredDocs = 5; // Minimum expected documents
    widgetProgress.documents = Math.min(100, Math.round((escrow.documents.length / minRequiredDocs) * 100));
  }

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleFieldUpdate = async (section, field, value) => {
    console.log('handleFieldUpdate called:', { section, field, value });
    try {
      // Use the ID as provided in the route
      const escrowId = id;
      console.log('handleFieldUpdate - Using escrow ID:', escrowId);
      
      let payload = {};
      
      if (section === 'people') {
        const [role, fieldName] = field.split('.');
        payload = {
          people: {
            ...escrow.people,
            [role]: {
              ...escrow.people?.[role],
              [fieldName]: value
            }
          }
        };
      } else if (section === 'financials') {
        // Handle nested financials fields
        const fieldParts = field.split('.');
        if (fieldParts.length > 1) {
          payload = {
            financials: {
              ...escrow.financials,
              [fieldParts[0]]: {
                ...escrow.financials?.[fieldParts[0]],
                [fieldParts[1]]: value
              }
            }
          };
        } else {
          payload = {
            financials: {
              ...escrow.financials,
              [field]: value
            }
          };
        }
      } else if (section === 'timeline') {
        payload = {
          timeline: {
            ...escrow.timeline,
            [field]: value
          }
        };
      }
      
      // Use the appropriate endpoint based on the section being updated
      let endpoint = `https://api.jaydenmetz.com/v1/escrows/${escrowId}`;
      let requestBody = payload;
      
      // For people and checklists, use specific endpoints that expect the full object
      if (section === 'people') {
        endpoint = `https://api.jaydenmetz.com/v1/escrows/${escrowId}/people`;
        // Send the entire people object with the update applied
        const [role, fieldName] = field.split('.');
        requestBody = {
          ...escrow.people,
          [role]: {
            ...escrow.people[role],
            [fieldName]: value
          }
        };
        console.log('People update payload:', requestBody);
      } else if (section === 'checklists') {
        endpoint = `https://api.jaydenmetz.com/v1/escrows/${escrowId}/checklists`;
        // Send the entire checklists object with the update
        requestBody = escrow.checklists;
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Update response:', data);
        
        // Success - close editing mode immediately
        setEditingField(null);
        setEditValues({});
        
        // Force immediate refetch to get fresh data
        console.log('Starting refetch...');
        
        // Use the actual ID from the route params, not the formatted one
        const queryKey = ['escrow', id];
        console.log('Invalidating query with key:', queryKey);
        
        // Invalidate and remove from cache completely
        await queryClient.invalidateQueries(queryKey);
        await queryClient.removeQueries(queryKey);
        
        // Then refetch immediately
        const refetchResult = await refetch();
        console.log('Refetch completed:', refetchResult);
        
        // Force React to re-render by setting a dummy state
        setMounted(false);
        setTimeout(() => setMounted(true), 50);
        
        console.log('Field updated successfully and data refreshed');
      } else {
        console.error('Failed to update field:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating field:', error);
      throw error; // Re-throw to let EditableField know the save failed
    }
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

  // Helper functions for two-tab interface
  const calculateTimelineProgress = (timeline) => {
    if (!timeline) return 0;
    const totalDates = Object.keys(timeline).length;
    const completedDates = Object.values(timeline).filter(date => date).length;
    return totalDates > 0 ? Math.round((completedDates / totalDates) * 100) : 0;
  };

  const calculateChecklistProgress = (checklist) => {
    if (!checklist) return 0;
    const total = Object.keys(checklist).length;
    const completed = Object.values(checklist).filter(v => v === true).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  // TabPanel component for tab content
  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    );
  };
  
  const handleWidgetClick = async (widgetName) => {
    // If clicking the same widget, close it
    if (openWidget === widgetName) {
      setWidgetAnimationClass(''); // Remove show class first
      setTimeout(() => {
        setOpenWidget(null);
      }, 300); // Wait for animation to complete
      return;
    }
    
    // Open the widget
    setOpenWidget(widgetName);
    setWidgetAnimationClass(''); // Reset animation class
    
    // Trigger animation after a small delay to ensure the element is rendered
    setTimeout(() => {
      setWidgetAnimationClass('show');
    }, 10);
    
    // Use the ID as provided
    const escrowId = id;
    
    // Fetch fresh data from API
    try {
      const response = await fetch(`https://api.jaydenmetz.com/v1/escrows/${escrowId}`);
      if (response.ok) {
        const data = await response.json();
        // Update the escrow data in the query cache - use route ID for cache key
        queryClient.setQueryData(['escrow', id], (oldData) => ({
          ...oldData,
          ...data
        }));
      }
    } catch (error) {
      console.error('Error fetching escrow data:', error);
    }
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

  // Handle loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Handle error state
  if (isError || !escrow) {
    return (
      <Container maxWidth="xl">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading escrow details
          </Typography>
          <Typography color="text.secondary">
            {error?.message || 'Escrow not found'}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/escrows')}
          >
            Back to Escrows
          </Button>
        </Paper>
      </Container>
    );
  }

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
                variant="contained"
                size="small"
                color="success"
                onClick={() => {
                  console.log('Manual refetch triggered');
                  refetch();
                }}
                startIcon={<Refresh />}
              >
                Force Refresh
              </Button>
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
                  escrowId: formatEntityId(id, 'escrow'),
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
                  fullEscrowObject: {
                    ...escrow,
                    id: formatEntityId(escrow.id, 'escrow')
                  },
                  // Key fields summary
                  summary: {
                    id: formatEntityId(escrow.id, 'escrow'),
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
                  endpoint: `/escrows/${formatEntityId(id, 'escrow')}`,
                  baseURL: process.env.REACT_APP_API_URL,
                  environment: process.env.NODE_ENV,
                  queryKey: ['escrow', formatEntityId(id, 'escrow')],
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
                  localStorage: typeof localStorage !== 'undefined' ? {
                    hasUser: !!localStorage.getItem('user'),
                    hasToken: !!localStorage.getItem('token'),
                    userObject: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
                  } : { note: 'localStorage not available' },
                  sessionStorage: typeof sessionStorage !== 'undefined' ? {
                    keys: Object.keys(sessionStorage)
                  } : { note: 'sessionStorage not available' },
                  cookies: (typeof document !== 'undefined' && document.cookie) || 'No cookies'
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
      {user?.username === 'admin' && escrow && (
        <Collapse in={debugExpanded}>
          <Box sx={{ mb: 3 }}>
            {/* Update Tracking Debug Panel */}
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                🔍 Inline Edit Debug Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Current Data State
                  </Typography>
                  <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    <div>Escrow ID: {id}</div>
                    <div>Display ID: {escrow.escrowNumber}</div>
                    <div>Buyer Name: {escrow.people?.buyer?.name || 'Not set'}</div>
                    <div>Seller Name: {escrow.people?.seller?.name || 'Not set'}</div>
                    <div>Last Activity: {escrow.lastActivity}</div>
                    <div>Cache Key: ['escrow', '{id}']</div>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    API Endpoints Used
                  </Typography>
                  <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    <div>GET: /v1/escrows/{id}</div>
                    <div>PUT: /v1/escrows/{id}/people</div>
                    <div>PUT: /v1/escrows/{id}/checklists</div>
                    <div>PUT: /v1/escrows/{id} (other fields)</div>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Update Flow Status
                  </Typography>
                  <Box sx={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                    {`1. Click edit (pencil icon) → Field becomes editable
2. Change value → Local state updates
3. Click save (green check) → Shows loading spinner
4. PUT request sent to: ${escrow.escrowNumber ? 'display_id endpoint' : 'UUID endpoint'}
5. On success → Edit mode closes
6. queryClient.invalidateQueries(['escrow', '${id}'])
7. refetch() called → GET /v1/escrows/${id}
8. useMemo recalculates escrow object
9. UI should update with new value

Raw Data Available: ${rawData ? 'YES' : 'NO'}
Transformed Data Available: ${escrow ? 'YES' : 'NO'}
Is Loading: ${isLoading ? 'YES' : 'NO'}
Has Error: ${isError ? 'YES' : 'NO'}`}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Full Debug Data (Copy This)
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, backgroundColor: '#fafafa' }}>
                    <pre style={{ fontSize: '11px', overflow: 'auto', maxHeight: '200px' }}>
{JSON.stringify({
  timestamp: new Date().toISOString(),
  escrowId: id,
  displayId: escrow.escrowNumber,
  currentData: {
    buyer: escrow.people?.buyer,
    seller: escrow.people?.seller,
    buyerAgent: escrow.people?.buyerAgent,
    listingAgent: escrow.people?.listingAgent
  },
  apiEndpoints: {
    base: 'https://api.jaydenmetz.com/v1',
    getEscrow: `/escrows/${id}`,
    updatePeople: `/escrows/${id}/people`,
    updateChecklists: `/escrows/${id}/checklists`
  },
  reactQueryState: {
    cacheKey: ['escrow', id],
    isLoading,
    isError,
    isFetching: false,
    dataUpdatedAt: rawData?._updatedAt || 'unknown'
  },
  lastUpdateFlow: 'Check console logs for detailed flow',
  browserInfo: {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }
}, null, 2)}
                    </pre>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <CopyButton 
                        text={JSON.stringify({
                          timestamp: new Date().toISOString(),
                          escrowId: id,
                          displayId: escrow.escrowNumber,
                          currentData: {
                            buyer: escrow.people?.buyer,
                            seller: escrow.people?.seller,
                            buyerAgent: escrow.people?.buyerAgent,
                            listingAgent: escrow.people?.listingAgent
                          },
                          apiEndpoints: {
                            base: 'https://api.jaydenmetz.com/v1',
                            getEscrow: `/escrows/${id}`,
                            updatePeople: `/escrows/${id}/people`,
                            updateChecklists: `/escrows/${id}/checklists`
                          },
                          reactQueryState: {
                            cacheKey: ['escrow', id],
                            isLoading,
                            isError,
                            isFetching: false,
                            dataUpdatedAt: rawData?._updatedAt || 'unknown'
                          },
                          lastUpdateFlow: 'Check console logs for detailed flow',
                          browserInfo: {
                            userAgent: navigator.userAgent,
                            timestamp: new Date().toISOString()
                          }
                        }, null, 2)}
                        size="small"
                        variant="contained"
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Enhanced debug components with more data */}
            <EnhancedDatabaseMonitor />
            <NetworkMonitorSimple />
            <DebugCard 
              pageName="Escrow Detail"
              id={id}
              isLoading={isLoading}
              isError={isError}
              error={error}
              data={escrow}
              additionalInfo={{
                displayId: escrow?.displayId,
                numericId: escrow?.numeric_id,
                hasDisplayId: !!escrow?.displayId,
                apiEndpoint: `/escrows/${id}`,
                queryKey: ['escrow', id],
                propertyAddress: escrow?.propertyAddress,
                escrowStatus: escrow?.escrowStatus,
                purchasePrice: escrow?.purchasePrice,
                checklistProgress: escrow?.checklistProgress,
                daysToClose: escrow?.daysToClose,
                parties: {
                  buyers: escrow?.buyers?.length || 0,
                  sellers: escrow?.sellers?.length || 0,
                  agents: {
                    buyer: escrow?.buyerAgent,
                    listing: escrow?.listingAgent
                  }
                },
                timeline: {
                  acceptance: escrow?.acceptanceDate,
                  scheduled: escrow?.scheduledCoeDate,
                  estimated: escrow?.estimatedCloseDate
                }
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
        <Typography color="text.primary">{escrow.propertyAddress || escrow.property?.address || 'Property'}</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <DetailPageHero
        type="escrow"
        title={escrow.propertyAddress}
        subtitle={`Escrow ${escrow.escrowNumber}`}
        status={escrow.escrowStatus}
        statusLabel={escrow.escrowStatus?.toUpperCase() || 'ACTIVE'}
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
            <Typography sx={{ color: 'white' }}>{escrow.propertyAddress}</Typography>
          </Breadcrumbs>
        }
        infoCards={[]}
      />

      {/* Stunning Property Display */}
      <StunningPropertyDisplay escrow={escrow} />

      {/* Two-Tab Interface: Dashboard & Data Editor */}
      <Paper 
        sx={{ 
          mt: 3, 
          mb: 3,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(30, 30, 30, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)',
            '& .MuiTabs-indicator': {
              height: 3,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            }
          }}
        >
          <Tab 
            icon={<Dashboard />} 
            iconPosition="start" 
            label="Dashboard" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<Edit />} 
            iconPosition="start" 
            label="Data Editor" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Dashboard Tab - Widget View with Stunning Visuals */}
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* People Widget with Circular Avatar Layout */}
            <Grid item xs={12} md={6}>
              <PeopleWidget 
                data={escrow?.people}
                expanded={expandedWidget === 'people'}
                onExpand={() => setExpandedWidget(expandedWidget === 'people' ? null : 'people')}
                onUpdate={(type, key, value) => {
                  // Handle update
                  console.log('Update people:', type, key, value);
                }}
              />
            </Grid>

            {/* Timeline Widget with Animated Progress */}
            <Grid item xs={12} md={6}>
              <TimelineWidget
                data={escrow?.timeline}
                expanded={expandedWidget === 'timeline'}
                onExpand={() => setExpandedWidget(expandedWidget === 'timeline' ? null : 'timeline')}
                onUpdate={(key, value) => {
                  // Handle update
                  console.log('Update timeline:', key, value);
                }}
              />
            </Grid>

            {/* Financials Widget with Charts */}
            <Grid item xs={12}>
              <FinancialsWidget
                data={escrow?.financials || escrow}
                expanded={expandedWidget === 'financials'}
                onExpand={() => setExpandedWidget(expandedWidget === 'financials' ? null : 'financials')}
                onUpdate={(key, value) => {
                  // Handle update
                  console.log('Update financials:', key, value);
                }}
              />
            </Grid>

            {/* Checklist Widgets with Progress Indicators */}
            {['loan', 'house', 'admin'].map((type) => {
              // Try both old and new API structure
              const checklistData = escrow?.checklists?.[type] || escrow?.[`checklist-${type}`] || {};
              return (
                <Grid item xs={12} md={4} key={type}>
                  <ChecklistWidget
                    type={type}
                    data={checklistData}
                    expanded={expandedWidget === `checklist-${type}`}
                    onExpand={() => setExpandedWidget(expandedWidget === `checklist-${type}` ? null : `checklist-${type}`)}
                    onUpdate={(checklistType, key, value) => {
                      // Handle checklist update
                      console.log('Update checklist:', checklistType, key, value);
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Data Editor Tab */}
          <AllDataViewer escrowData={escrow} onUpdate={refetch} />
        </TabPanel>
      </Paper>

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
                  <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
                    <ChartErrorBoundary>
                      {mounted && typeof window !== 'undefined' && aiActivityData && aiActivityData.length > 0 ? (
                        <div style={{ width: '100%', height: '100%' }}>
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
                        </div>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Typography color="text.secondary">Loading chart data...</Typography>
                        </Box>
                      )}
                    </ChartErrorBoundary>
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
                                {formatPriceShort(escrow.marketData?.medianPrice || 0)}
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
      ) : null}

      {/* Widgets Section */}
      <Box sx={{ mt: 4, pb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Escrow Details
        </Typography>
        
        {/* Backdrop for tooltips */}
        <Grid container spacing={5} sx={{ overflow: 'visible' }}>
          {/* Property Details Widget */}
          <Grid item xs={12} md={6} sx={{ overflow: 'visible' }}>
            <LiquidWidget 
              sx={{ 
                background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
              }}
              onClick={() => handleWidgetClick('property')}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Home sx={{ color: 'success.main' }} />
                  Property Details
                </Typography>
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  handleWidgetClick('property');
                }}>
                  <MoreVert />
                </IconButton>
              </Stack>
              
              <Stack spacing={2}>
                {/* Property Address */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600, mb: 1 }}>Address & Location</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body2" fontWeight={500}>{escrow.propertyAddress || 'Not set'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">City</Typography>
                      <Typography variant="body2">{escrow.property?.city || 'Not set'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">State/ZIP</Typography>
                      <Typography variant="body2">{escrow.property?.state || 'CA'} {escrow.property?.zipCode || ''}</Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Divider />
                
                {/* Property Info */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600, mb: 1 }}>Property Information</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Typography variant="body2">{escrow.property?.type || 'Single Family'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">MLS #</Typography>
                      <Typography variant="body2">{escrow.property?.mlsNumber || 'Not set'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">APN</Typography>
                      <Typography variant="body2">{escrow.property?.apn || 'Not set'}</Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Divider />
                
                {/* Property Value */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 600, mb: 1 }}>Valuation</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Purchase Price</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(escrow.financials?.purchasePrice || escrow.purchasePrice)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">List Price</Typography>
                      <Typography variant="body2">{formatCurrency(escrow.property?.listPrice)}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
              
              <Button 
                fullWidth 
                variant="contained" 
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(0,0,0,0.1)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleWidgetClick('property');
                }}
              >
                View All Details
              </Button>
            </LiquidWidget>
          </Grid>
          
          {/* People Widget */}
          <Grid item xs={12} md={6} sx={{ overflow: 'visible' }}>
            <LiquidWidget 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
              onClick={() => handleWidgetClick('people')}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Groups sx={{ color: 'primary.main' }} />
                  People
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {widgetProgress.people}%
                </Typography>
              </Stack>
              
              <LinearProgress 
                variant="determinate" 
                value={widgetProgress.people} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  mb: 3,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                  }
                }}
              />
              
              <Stack spacing={2.5}>
                {/* Buyer Info */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>Buyer</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body2" fontWeight={500}>{escrow.people?.buyer?.name || 'Not set'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body2">{escrow.people?.buyer?.phone || 'Not set'}</Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Divider />
                
                {/* Seller Info */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'secondary.main', fontWeight: 600, mb: 1 }}>Seller</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body2" fontWeight={500}>{escrow.people?.seller?.name || 'Not set'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body2">{escrow.people?.seller?.phone || 'Not set'}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
              
              
            </LiquidWidget>
          </Grid>
          
          {/* Checklist Widget */}
          <Grid item xs={12} md={6} sx={{ overflow: 'visible' }}>
            <LiquidWidget 
              sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              }}
              onClick={() => handleWidgetClick('checklist')}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  Checklists
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {widgetProgress.checklist}%
                </Typography>
              </Stack>
              
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5, 
                  mb: 2,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                  }
                }}
              />
              
              <Stack spacing={1}>
                {/* Display categories dynamically */}
                {(escrow.checklists || escrow.checklist) ? (
                  Object.entries(escrow.checklists || escrow.checklist).map(([category, items]) => (
                    <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">{category}</Typography>
                      <Chip 
                        label={`${Object.values(items).filter(v => v).length}/${Object.keys(items).length}`} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      />
                    </Box>
                  ))
                ) : (
                  <>
                    {/* Default empty state */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Pre-Contract</Typography>
                      <Chip label="0/0" size="small" sx={{ bgcolor: 'rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Contract to Close</Typography>
                      <Chip label="0/0" size="small" sx={{ bgcolor: 'rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Closing</Typography>
                      <Chip label="0/0" size="small" sx={{ bgcolor: 'rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    </Box>
                  </>
                )}
              </Stack>
              
              <Button 
                fullWidth 
                variant="contained" 
                sx={{ 
                  mt: 2, 
                  bgcolor: 'rgba(0,0,0,0.1)',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                  }
                }}
              >
                View All Checklists
              </Button>
              
              
            </LiquidWidget>
          </Grid>
          
          {/* Timeline Widget */}
          <Grid item xs={12} md={6} sx={{ overflow: 'visible' }}>
            <LiquidWidget 
              sx={{ 
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              }}
              onClick={() => handleWidgetClick('timeline')}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventNote sx={{ color: 'primary.main' }} />
                  Timeline
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {widgetProgress.timeline}%
                </Typography>
              </Stack>
              
              <LinearProgress 
                variant="determinate" 
                value={widgetProgress.timeline} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  mb: 3,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                  }
                }}
              />
              
              <Stack spacing={1.5}>
                {/* Closing Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Closing Date</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {escrow.timeline?.closingDate ? safeFormat(escrow.timeline.closingDate, 'MMM dd, yyyy') : 'Not set'}
                  </Typography>
                </Box>
                
                {/* Acceptance Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Acceptance</Typography>
                  <Typography variant="body2">
                    {escrow.timeline?.acceptanceDate ? safeFormat(escrow.timeline.acceptanceDate, 'MMM dd, yyyy') : 'Not set'}
                  </Typography>
                </Box>
                
                {/* Inspection Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Inspection</Typography>
                  <Typography variant="body2">
                    {escrow.timeline?.inspectionDate ? safeFormat(escrow.timeline.inspectionDate, 'MMM dd, yyyy') : 'Not set'}
                  </Typography>
                </Box>
                
                {/* Appraisal Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Appraisal</Typography>
                  <Typography variant="body2">
                    {escrow.timeline?.appraisalDate ? safeFormat(escrow.timeline.appraisalDate, 'MMM dd, yyyy') : 'Not set'}
                  </Typography>
                </Box>
                
                {/* Loan Approval */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Loan Approval</Typography>
                  <Typography variant="body2">
                    {escrow.timeline?.loanApprovalDate ? safeFormat(escrow.timeline.loanApprovalDate, 'MMM dd, yyyy') : 'Not set'}
                  </Typography>
                </Box>
              </Stack>
              
              
            </LiquidWidget>
          </Grid>
          
          {/* Financials Widget */}
          <Grid item xs={12} md={6} sx={{ overflow: 'visible' }}>
            <LiquidWidget 
              sx={{ 
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              }}
              onClick={() => handleWidgetClick('financials')}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney sx={{ color: 'warning.dark' }} />
                  Financials
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {widgetProgress.financials}%
                </Typography>
              </Stack>
              
              <LinearProgress 
                variant="determinate" 
                value={widgetProgress.financials} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  mb: 2,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'warning.main',
                    borderRadius: 4,
                  }
                }}
              />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Purchase Price
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${(escrow.financials?.purchasePrice || 0).toLocaleString()}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Commission Rate</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {escrow.financials?.myCommissionRate || 2.5}%
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Gross Commission</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    ${(escrow.financials?.grossCommission || 0).toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Split ({escrow.financials?.splitPercentage || 60}%)</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    ${(escrow.financials?.myCommissionAfterSplit || 0).toLocaleString()}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight="bold">Net Commission</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ${(escrow.financials?.myNetCommission || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
              
              
            </LiquidWidget>
          </Grid>
          
          {/* Documents Widget */}
          <Grid item xs={12} md={6} sx={{ overflow: 'visible' }}>
            <LiquidWidget 
              sx={{ 
                background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
              }}
              onClick={() => handleWidgetClick('documents')}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description sx={{ color: 'info.main' }} />
                  Documents
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {widgetProgress.documents}%
                </Typography>
              </Stack>
              
              <LinearProgress 
                variant="determinate" 
                value={widgetProgress.documents} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4, 
                  mb: 2,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'info.main',
                    borderRadius: 4,
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Total Files</Typography>
                <Chip 
                  label={`${(escrow.documents || []).length} files`} 
                  size="small"
                  color="info"
                />
              </Box>
              
              <Stack spacing={1}>
                {(escrow.documents || []).length > 0 ? (
                  escrow.documents.slice(0, 4).map((doc) => (
                    <Paper 
                      key={doc.id} 
                      sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <InsertDriveFile sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.size} • {safeFormat(doc.uploadedAt, 'MMM dd')}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <Download fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <InsertDriveFile sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No documents uploaded yet
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2 }}
                      onClick={handleDocumentUpload}
                    >
                      Upload First Document
                    </Button>
                  </Box>
                )}
              </Stack>
              
              {(escrow.documents || []).length > 4 && (
                <Button fullWidth size="small" sx={{ mt: 2 }}>
                  View All Documents
                </Button>
              )}
              
              
            </LiquidWidget>
          </Grid>
        </Grid>
      </Box>

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

      {/* All Popups rendered in portal */}
      {createPortal(
        <>
          {/* People Popup */}
          {openWidget === 'people' && escrow && (
            <>
              <Backdrop 
                open={true} 
                onClick={() => {
                  setWidgetAnimationClass('');
                  setTimeout(() => setOpenWidget(null), 300);
                }}
                sx={{ zIndex: 1200 }}
              />
              <DataTooltip 
                className={widgetAnimationClass}
                key={`people-popup-${escrow.people?.buyer?.name}-${escrow.people?.seller?.name}`}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    All People & Contacts
                  </Typography>
                  <IconButton onClick={() => {
                    setWidgetAnimationClass('');
                    setTimeout(() => setOpenWidget(null), 300);
                  }} size="small">
                    <Close />
                  </IconButton>
                </Stack>
                
                <Stack spacing={2} sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
                  {/* Primary Parties Section */}
                  <Box>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>Primary Parties</Typography>
                    
                    {/* Buyer Details */}
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Buyer</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="buyer.name" 
                              value={escrow.people?.buyer?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="buyer.email" 
                              value={escrow.people?.buyer?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="buyer.phone" 
                              value={escrow.people?.buyer?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Address:</Typography>
                            <EditableField 
                              field="buyer.address" 
                              value={escrow.people?.buyer?.address} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Company:</Typography>
                            <EditableField 
                              field="buyer.company" 
                              value={escrow.people?.buyer?.company} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Seller Details */}
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Seller</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="seller.name" 
                              value={escrow.people?.seller?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="seller.email" 
                              value={escrow.people?.seller?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="seller.phone" 
                              value={escrow.people?.seller?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Address:</Typography>
                            <EditableField 
                              field="seller.address" 
                              value={escrow.people?.seller?.address} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  
                  <Divider />
                  
                  {/* Agents & Brokers Section */}
                  <Box>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>Agents & Brokers</Typography>
                    
                    {/* Buyer Agent */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Buyer's Agent</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="buyerAgent.name" 
                              value={escrow.people?.buyerAgent?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="buyerAgent.email" 
                              value={escrow.people?.buyerAgent?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="buyerAgent.phone" 
                              value={escrow.people?.buyerAgent?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>License:</Typography>
                            <EditableField 
                              field="buyerAgent.license" 
                              value={escrow.people?.buyerAgent?.license} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Brokerage:</Typography>
                            <EditableField 
                              field="buyerAgent.brokerage" 
                              value={escrow.people?.buyerAgent?.brokerage} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Listing Agent */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Listing Agent</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="listingAgent.name" 
                              value={escrow.people?.listingAgent?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="listingAgent.email" 
                              value={escrow.people?.listingAgent?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="listingAgent.phone" 
                              value={escrow.people?.listingAgent?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>License:</Typography>
                            <EditableField 
                              field="listingAgent.license" 
                              value={escrow.people?.listingAgent?.license} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Brokerage:</Typography>
                            <EditableField 
                              field="listingAgent.brokerage" 
                              value={escrow.people?.listingAgent?.brokerage} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  
                  <Divider />
                  
                  {/* Transaction Services Section */}
                  <Box>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>Transaction Services</Typography>
                    
                    {/* Escrow Officer */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Escrow Officer</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="escrowOfficer.name" 
                              value={escrow.people?.escrowOfficer?.name || escrow.people?.transactionTeam?.escrowOfficer?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="escrowOfficer.email" 
                              value={escrow.people?.escrowOfficer?.email || escrow.people?.transactionTeam?.escrowOfficer?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="escrowOfficer.phone" 
                              value={escrow.people?.escrowOfficer?.phone || escrow.people?.transactionTeam?.escrowOfficer?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Company:</Typography>
                            <EditableField 
                              field="escrowOfficer.company" 
                              value={escrow.people?.escrowOfficer?.company || escrow.people?.transactionTeam?.escrowOfficer?.company} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Title Officer */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Title Officer</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="titleOfficer.name" 
                              value={escrow.people?.titleOfficer?.name || escrow.people?.transactionTeam?.titleCompany?.contact} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="titleOfficer.email" 
                              value={escrow.people?.titleOfficer?.email || escrow.people?.transactionTeam?.titleCompany?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="titleOfficer.phone" 
                              value={escrow.people?.titleOfficer?.phone || escrow.people?.transactionTeam?.titleCompany?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Company:</Typography>
                            <EditableField 
                              field="titleOfficer.company" 
                              value={escrow.people?.titleOfficer?.company || escrow.people?.transactionTeam?.titleCompany?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Lender/Loan Officer */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Lender / Loan Officer</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="loanOfficer.name" 
                              value={escrow.people?.loanOfficer?.name || escrow.people?.transactionTeam?.lenderContact?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="loanOfficer.email" 
                              value={escrow.people?.loanOfficer?.email || escrow.people?.transactionTeam?.lenderContact?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="loanOfficer.phone" 
                              value={escrow.people?.loanOfficer?.phone || escrow.people?.transactionTeam?.lenderContact?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Company:</Typography>
                            <EditableField 
                              field="loanOfficer.company" 
                              value={escrow.people?.loanOfficer?.company || escrow.people?.transactionTeam?.lenderContact?.company} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  
                  <Divider />
                  
                  {/* Inspectors & Services Section */}
                  <Box>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>Inspectors & Services</Typography>
                    
                    {/* Home Inspector */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Home Inspector</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="homeInspector.name" 
                              value={escrow.people?.homeInspector?.name || escrow.people?.transactionTeam?.inspector?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="homeInspector.email" 
                              value={escrow.people?.homeInspector?.email || escrow.people?.transactionTeam?.inspector?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="homeInspector.phone" 
                              value={escrow.people?.homeInspector?.phone || escrow.people?.transactionTeam?.inspector?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Company:</Typography>
                            <EditableField 
                              field="homeInspector.company" 
                              value={escrow.people?.homeInspector?.company || escrow.people?.transactionTeam?.inspector?.company} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Appraiser */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Appraiser</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="appraiser.name" 
                              value={escrow.people?.appraiser?.name || escrow.people?.transactionTeam?.appraiser?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="appraiser.email" 
                              value={escrow.people?.appraiser?.email || escrow.people?.transactionTeam?.appraiser?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="appraiser.phone" 
                              value={escrow.people?.appraiser?.phone || escrow.people?.transactionTeam?.appraiser?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Company:</Typography>
                            <EditableField 
                              field="appraiser.company" 
                              value={escrow.people?.appraiser?.company || escrow.people?.transactionTeam?.appraiser?.company} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                    
                    {/* Additional Inspectors if needed */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Other Inspectors</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            Termite, Roof, Pool, and other specialty inspectors can be added here
                          </Typography>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  
                  <Divider />
                  
                  {/* Support Team Section */}
                  <Box>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>Support Team</Typography>
                    
                    {/* Transaction Coordinator */}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1" fontWeight={600}>Transaction Coordinator</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Name:</Typography>
                            <EditableField 
                              field="transactionCoordinator.name" 
                              value={escrow.people?.transactionCoordinator?.name} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Email:</Typography>
                            <EditableField 
                              field="transactionCoordinator.email" 
                              value={escrow.people?.transactionCoordinator?.email} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="email"
                            />
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" sx={{ minWidth: 100, color: 'text.secondary' }}>Phone:</Typography>
                            <EditableField 
                              field="transactionCoordinator.phone" 
                              value={escrow.people?.transactionCoordinator?.phone} 
                              onSave={(field, value) => handleFieldUpdate('people', field, value)}
                              type="tel"
                            />
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  
                </Stack>
              </DataTooltip>
            </>
          )}
          
          {/* Checklist Popup */}
          {openWidget === 'checklist' && escrow && (
            <>
              <Backdrop 
                open={true} 
                onClick={() => {
                  setWidgetAnimationClass('');
                  setTimeout(() => setOpenWidget(null), 300);
                }}
                sx={{ zIndex: 1200 }}
              />
              <DataTooltip className={widgetAnimationClass} sx={{ color: 'text.primary' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    All Checklists
                  </Typography>
                  <IconButton onClick={() => {
                    setWidgetAnimationClass('');
                    setTimeout(() => setOpenWidget(null), 300);
                  }} size="small">
                    <Close />
                  </IconButton>
                </Stack>
                
                <Stack spacing={3}>
                  {/* Check both checklists (plural) and checklist (singular) for compatibility */}
                  {(escrow.checklists || escrow.checklist) ? (
                    Object.entries(escrow.checklists || escrow.checklist).map(([category, items]) => {
                      // Format category name
                      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
                      
                      // Define custom labels for specific fields
                      const fieldLabels = {
                        // Loan fields
                        'le': 'LE (Loan Estimate)',
                        'lockedRate': 'Rate Locked',
                        'appraisalOrdered': 'Appraisal Ordered',
                        'appraisalReceived': 'Appraisal Received',
                        'clearToClose': 'Clear to Close',
                        'cd': 'CD (Closing Disclosure)',
                        'loanDocsSigned': 'Loan Docs Signed',
                        'cashToClosePaid': 'Cash to Close Paid',
                        'loanFunded': 'Loan Funded',
                        // House fields
                        'homeInspectionOrdered': 'Home Inspection Ordered',
                        'emd': 'EMD (Earnest Money Deposit)',
                        'solarTransferInitiated': 'Solar Transfer Initiated',
                        'avid': 'AVID',
                        'homeInspectionReceived': 'Home Inspection Received',
                        'sellerDisclosures': 'Seller Disclosures',
                        'rr': 'RR (Repair Request)',
                        'recorded': 'Recorded',
                        // Admin fields
                        'mlsStatusUpdate': 'MLS Status Update',
                        'tcEmail': 'TC Email',
                        'tcGlideInvite': 'TC Glide Invite',
                        'addContactsToPhone': 'Add Contacts to Phone',
                        'addContactsToNotion': 'Add Contacts to Notion'
                      };
                      
                      return (
                        <Box key={category}>
                          <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ mb: 2 }}>
                            {categoryLabel}
                          </Typography>
                          <Stack spacing={1.5}>
                            {Object.entries(items).map(([task, completed]) => {
                              // Use custom label if available, otherwise format the field name
                              const taskLabel = fieldLabels[task] || task
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase())
                                .trim();
                              
                              return (
                                <Box key={task} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {completed ? (
                                      <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                                    ) : (
                                      <Box sx={{ width: 20, height: 20, border: '2px solid', borderColor: 'divider', borderRadius: '50%' }} />
                                    )}
                                    <Typography variant="body2" sx={{ textDecoration: completed ? 'line-through' : 'none' }}>
                                      {taskLabel}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {completed ? 'Complete' : 'Pending'}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Stack>
                          {category !== Object.keys(escrow.checklists || escrow.checklist).slice(-1)[0] && (
                            <Divider sx={{ mt: 2 }} />
                          )}
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No checklist items available
                    </Typography>
                  )}
                </Stack>
              </DataTooltip>
            </>
          )}
          
          {/* Property Details Popup */}
          {openWidget === 'property' && escrow && (
            <>
              <Backdrop 
                open={true} 
                onClick={() => {
                  setWidgetAnimationClass('');
                  setTimeout(() => setOpenWidget(null), 300);
                }}
                sx={{ zIndex: 1200 }}
              />
              <DataTooltip className={widgetAnimationClass} sx={{ color: 'text.primary' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Complete Property Details
                  </Typography>
                  <IconButton onClick={() => {
                    setWidgetAnimationClass('');
                    setTimeout(() => setOpenWidget(null), 300);
                  }} size="small">
                    <Close />
                  </IconButton>
                </Stack>
                
                <Stack spacing={3} sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {/* Address Section */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Address & Location</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Street Address:</Typography>
                        <EditableField 
                          field="propertyAddress" 
                          value={escrow.propertyAddress} 
                          onSave={(field, value) => handleFieldUpdate('main', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>City:</Typography>
                        <EditableField 
                          field="property.city" 
                          value={escrow.property?.city} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>State:</Typography>
                        <EditableField 
                          field="property.state" 
                          value={escrow.property?.state} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>ZIP Code:</Typography>
                        <EditableField 
                          field="property.zipCode" 
                          value={escrow.property?.zipCode} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>County:</Typography>
                        <EditableField 
                          field="property.county" 
                          value={escrow.property?.county} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                    </Stack>
                  </Box>
                  
                  <Divider />
                  
                  {/* Property Details */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Property Information</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Property Type:</Typography>
                        <EditableField 
                          field="property.type" 
                          value={escrow.property?.type} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Bedrooms:</Typography>
                        <EditableField 
                          field="property.bedrooms" 
                          value={escrow.property?.bedrooms} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Bathrooms:</Typography>
                        <EditableField 
                          field="property.bathrooms" 
                          value={escrow.property?.bathrooms} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Square Feet:</Typography>
                        <EditableField 
                          field="property.sqft" 
                          value={escrow.property?.sqft} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Lot Size (sqft):</Typography>
                        <EditableField 
                          field="property.lotSize" 
                          value={escrow.property?.lotSize} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Year Built:</Typography>
                        <EditableField 
                          field="property.yearBuilt" 
                          value={escrow.property?.yearBuilt} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>HOA Fees:</Typography>
                        <EditableField 
                          field="property.hoaFees" 
                          value={escrow.property?.hoaFees} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                  
                  <Divider />
                  
                  {/* Property Identifiers */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Property Identifiers</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>MLS Number:</Typography>
                        <EditableField 
                          field="property.mlsNumber" 
                          value={escrow.property?.mlsNumber} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>APN:</Typography>
                        <EditableField 
                          field="property.apn" 
                          value={escrow.property?.apn} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Tax ID:</Typography>
                        <EditableField 
                          field="property.taxId" 
                          value={escrow.property?.taxId} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                    </Stack>
                  </Box>
                  
                  <Divider />
                  
                  {/* Valuation & Pricing */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Valuation & Pricing</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Purchase Price:</Typography>
                        <EditableField 
                          field="financials.purchasePrice" 
                          value={escrow.financials?.purchasePrice || escrow.purchasePrice} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>List Price:</Typography>
                        <EditableField 
                          field="property.listPrice" 
                          value={escrow.property?.listPrice} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Appraised Value:</Typography>
                        <EditableField 
                          field="property.appraisedValue" 
                          value={escrow.property?.appraisedValue} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Property Tax:</Typography>
                        <EditableField 
                          field="property.propertyTax" 
                          value={escrow.property?.propertyTax} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                  
                  <Divider />
                  
                  {/* Additional Details */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Additional Details</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Zillow URL:</Typography>
                        <EditableField 
                          field="zillow_url" 
                          value={escrow.zillowUrl} 
                          onSave={(field, value) => handleFieldUpdate('main', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>School District:</Typography>
                        <EditableField 
                          field="property.schoolDistrict" 
                          value={escrow.property?.schoolDistrict} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Subdivision:</Typography>
                        <EditableField 
                          field="property.subdivision" 
                          value={escrow.property?.subdivision} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>View Type:</Typography>
                        <EditableField 
                          field="property.viewType" 
                          value={escrow.property?.viewType} 
                          onSave={(field, value) => handleFieldUpdate('property', field, value)}
                          type="text"
                        />
                      </Stack>
                    </Stack>
                  </Box>
                  
                  {(!escrow.property || Object.keys(escrow.property).length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Click on any field to edit and add property details
                    </Typography>
                  )}
                </Stack>
              </DataTooltip>
            </>
          )}
          
          {/* Timeline Popup */}
          {openWidget === 'timeline' && escrow && (
            <>
              <Backdrop 
                open={true} 
                onClick={() => {
                  setWidgetAnimationClass('');
                  setTimeout(() => setOpenWidget(null), 300);
                }}
                sx={{ zIndex: 1200 }}
              />
              <DataTooltip className={widgetAnimationClass} sx={{ color: 'text.primary' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Complete Timeline Details
                  </Typography>
                  <IconButton onClick={() => {
                    setWidgetAnimationClass('');
                    setTimeout(() => setOpenWidget(null), 300);
                  }} size="small">
                    <Close />
                  </IconButton>
                </Stack>
                
                <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {escrow.timeline && Object.entries(escrow.timeline).map(([key, date]) => {
                    if (!date) return null;
                    return (
                      <Stack key={key} direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 200, color: 'text.secondary' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/Date$/, '').trim()}:
                        </Typography>
                        <EditableField 
                          field={`timeline.${key}`} 
                          value={date} 
                          onSave={(field, value) => handleFieldUpdate('timeline', field, value)}
                          type="date"
                        />
                      </Stack>
                    );
                  })}
                  
                  {(!escrow.timeline || Object.keys(escrow.timeline).length === 0 || 
                    Object.values(escrow.timeline).every(v => !v)) && (
                    <Typography variant="body2" color="text.secondary">
                      No timeline dates set
                    </Typography>
                  )}
                </Stack>
              </DataTooltip>
            </>
          )}
          
          {/* Financials Popup */}
          {openWidget === 'financials' && escrow && (
            <>
              <Backdrop 
                open={true} 
                onClick={() => {
                  setWidgetAnimationClass('');
                  setTimeout(() => setOpenWidget(null), 300);
                }}
                sx={{ zIndex: 1200 }}
              />
              <DataTooltip className={widgetAnimationClass} sx={{ color: 'text.primary' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Complete Financial Details
                  </Typography>
                  <IconButton onClick={() => {
                    setWidgetAnimationClass('');
                    setTimeout(() => setOpenWidget(null), 300);
                  }} size="small">
                    <Close />
                  </IconButton>
                </Stack>
                
                <Stack spacing={2}>
                  {/* Purchase Details */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Purchase Details</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Purchase Price:</Typography>
                        <EditableField 
                          field="financials.purchasePrice" 
                          value={escrow.financials?.purchasePrice} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Down Payment:</Typography>
                        <EditableField 
                          field="financials.downPayment" 
                          value={escrow.financials?.downPayment} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Loan Amount:</Typography>
                        <EditableField 
                          field="financials.loanAmount" 
                          value={escrow.financials?.loanAmount} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Earnest Money:</Typography>
                        <EditableField 
                          field="financials.earnestMoney" 
                          value={escrow.financials?.earnestMoney} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                  
                  <Divider />
                  
                  {/* Commission Details */}
                  <Box>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Commission Details</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>My Commission Rate:</Typography>
                        <EditableField 
                          field="financials.myCommissionRate" 
                          value={escrow.financials?.myCommissionRate} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={(value) => value ? `${value}%` : 'Not set'}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>Total Commission:</Typography>
                        <EditableField 
                          field="financials.totalCommission" 
                          value={escrow.financials?.totalCommission} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>My Net Commission:</Typography>
                        <EditableField 
                          field="financials.myNetCommission" 
                          value={escrow.financials?.myNetCommission} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" sx={{ minWidth: 150, color: 'text.secondary' }}>YTD GCI After:</Typography>
                        <EditableField 
                          field="financials.ytdGciAfterTransaction" 
                          value={escrow.financials?.ytdGciAfterTransaction} 
                          onSave={(field, value) => handleFieldUpdate('financials', field, value)}
                          type="number"
                          formatter={formatCurrency}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </DataTooltip>
            </>
          )}
          
          {/* Documents Popup */}
          {openWidget === 'documents' && escrow && (
            <>
              <Backdrop 
                open={true} 
                onClick={() => {
                  setWidgetAnimationClass('');
                  setTimeout(() => setOpenWidget(null), 300);
                }}
                sx={{ zIndex: 1200 }}
              />
              <DataTooltip className={widgetAnimationClass} sx={{ color: 'text.primary' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    All Documents
                  </Typography>
                  <IconButton onClick={() => {
                    setWidgetAnimationClass('');
                    setTimeout(() => setOpenWidget(null), 300);
                  }} size="small">
                    <Close />
                  </IconButton>
                </Stack>
                
                <Stack spacing={2}>
                  {escrow.documents && escrow.documents.length > 0 ? (
                    escrow.documents.map((doc) => (
                      <Paper key={doc.id} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Description sx={{ color: 'primary.main' }} />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={500}>
                              {doc.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.documentType} • {doc.size} • Uploaded by {doc.uploadedBy} on {safeFormat(doc.uploadedAt, 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                          <IconButton size="small">
                            <CloudDownload />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Description sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No documents uploaded yet
                      </Typography>
                      <Button variant="outlined" startIcon={<CloudUpload />}>
                        Upload Documents
                      </Button>
                    </Box>
                  )}
                </Stack>
              </DataTooltip>
            </>
          )}
        </>,
        document.body
      )}

      {/* Debug Panel for Admin */}
      {false /* TEMPORARILY DISABLED TO DEBUG STYLE ERROR */ && escrow && (
        <DebugCard
          pageTitle={`Debug Panel: Escrow Detail - ${escrow.displayId || id}`}
        user={user}
        apiRequests={[
          {
            url: `/api/v1/escrows/${id}`,
            method: 'GET',
            status: 200,
            duration: (networkMonitor && networkMonitor.getStats && networkMonitor.getStats().avgDuration) || 0,
            timestamp: new Date().toISOString(),
            response: escrow
          },
          {
            url: `/api/v1/escrows/${id}/timeline`,
            method: 'GET',
            status: 200,
            duration: 50,
            timestamp: new Date().toISOString(),
            response: escrow.timeline || []
          },
          {
            url: `/api/v1/escrows/${id}/documents`,
            method: 'GET',
            status: 200,
            duration: 45,
            timestamp: new Date().toISOString(),
            response: escrow.documents || []
          },
          {
            url: `/api/v1/escrows/${id}/clients`,
            method: 'GET',
            status: 200,
            duration: 40,
            timestamp: new Date().toISOString(),
            response: escrow.clients || []
          }
        ]}
        databases={[
          {
            name: 'PostgreSQL - Escrows',
            recordCount: 1,
            lastSync: new Date().toISOString(),
            status: 'connected',
            sampleData: {
              id: escrow.id,
              displayId: escrow.displayId,
              address: escrow.address,
              status: escrow.status
            }
          },
          {
            name: 'PostgreSQL - Documents',
            recordCount: escrow.documents?.length || 0,
            lastSync: new Date().toISOString(),
            status: 'connected'
          },
          {
            name: 'PostgreSQL - Timeline',
            recordCount: escrow.timeline?.length || 0,
            lastSync: new Date().toISOString(),
            status: 'connected'
          },
          {
            name: 'PostgreSQL - Clients',
            recordCount: escrow.clients?.length || 0,
            lastSync: new Date().toISOString(),
            status: 'connected'
          }
        ]}
        customData={{
          escrowDetails: {
            id: escrow.id,
            displayId: escrow.displayId,
            status: escrow.status,
            purchasePrice: escrow.purchasePrice,
            commission: escrow.myCommission,
            daysToClose: escrow.daysToClose,
            progress: progress
          },
          pageState: {
            activeTab,
            viewMode,
            editMode,
            documentDialogOpen
          },
          propertyInfo: escrow.property,
          financialSummary: {
            downPayment: escrow.downPayment,
            loanAmount: escrow.loanAmount,
            closingCosts: escrow.closingCosts,
            monthlyPayment: escrow.monthlyPayment
          },
          aiAgents: escrow.aiAgents || []
        }}
      />
      )}
    </Container>
  );
};

export default EscrowDetail;