import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NewEscrowModal from '../forms/NewEscrowModal';
import EscrowCard from '../common/widgets/EscrowCard';
import VirtualizedEscrowList from '../common/VirtualizedEscrowList';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  Grow,
  Slide,
  Skeleton,
  useTheme,
  alpha,
  Stack,
  Collapse,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip as MuiTooltip,
  Tabs,
  Tab,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Home,
  CheckCircle,
  Schedule,
  Add,
  ArrowForward,
  LocationOn,
  CalendarToday,
  Person,
  Timer,
  AccountBalance,
  Handshake,
  Assessment,
  Speed,
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
  ViewModule,
  ViewList,
  ViewAgenda,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  Visibility,
  VisibilityOff,
  Sort,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format as formatDate } from 'date-fns';
import { safeFormatDate, safeParseDate } from '../../utils/safeDateUtils';
import { escrowsAPI } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import networkMonitor from '../../services/networkMonitor.service';
import { useWebSocket } from '../../hooks/useWebSocket';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

// Enhanced animated stat card component with new layout structure
const StatCard = React.memo(({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend, showPrivacy = false, goal }) => {
  const theme = useTheme();
  const [showValue, setShowValue] = useState(false);

  // Mask commission for privacy
  const maskValue = (val) => {
    const absValue = Math.abs(val);
    if (absValue >= 1000000) return '$***,***,***';
    if (absValue >= 100000) return '$***,***';
    if (absValue >= 10000) return '$**,***';
    if (absValue >= 1000) return '$*,***';
    if (absValue >= 100) return '$***';
    if (absValue >= 10) return '$**';
    return '$*';
  };

  // Calculate responsive font size based on digit count
  // Up to 9 digits (999,999,999): Full size
  // 10+ digits: Start scaling down
  const getResponsiveFontSize = () => {
    if (typeof value !== 'number') return 'clamp(1.5rem, 4vw, 2.25rem)';

    const formattedValue = `${prefix}${value.toLocaleString()}${suffix}`;
    const digitCount = formattedValue.replace(/[^0-9]/g, '').length;

    if (digitCount <= 9) {
      // Up to 9 digits: Full size
      return 'clamp(1.5rem, 4vw, 2.25rem)';
    } else if (digitCount === 10) {
      // 10 digits: Slightly smaller
      return 'clamp(1.3rem, 3.5vw, 2rem)';
    } else if (digitCount === 11) {
      // 11 digits: More compact
      return 'clamp(1.1rem, 3vw, 1.75rem)';
    } else {
      // 12+ digits: Most compact
      return 'clamp(1rem, 2.5vw, 1.5rem)';
    }
  };

  // Calculate percentage difference from goal
  const percentageToGoal = goal && typeof value === 'number' && typeof goal === 'number'
    ? ((value / goal - 1) * 100).toFixed(1)
    : null;
  const isAboveGoal = percentageToGoal && parseFloat(percentageToGoal) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.34, 1.56, 0.64, 1]
      }}
    >
      <Card
        elevation={0}
        sx={{
          height: 200, // Fixed height for consistency
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(color, 0.3)}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
            border: `1px solid ${alpha(color, 0.5)}`,
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          {/* Top: Title with enhanced styling */}
          <Box sx={{ mb: 2, minHeight: 40, display: 'flex', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.95)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  px: 2,
                  py: 0.75,
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          {/* Middle: Count on left, Icon on right */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, my: 1, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0, pr: 1 }}>
              {showPrivacy && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowValue(!showValue);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    color: 'rgba(255,255,255,0.8)',
                    flexShrink: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                    },
                  }}
                >
                  {showValue ? (
                    <VisibilityOff sx={{ fontSize: 18 }} />
                  ) : (
                    <Visibility sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              )}
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                  fontSize: getResponsiveFontSize(),
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  overflow: 'visible',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {showPrivacy && !showValue ? (
                  <span>{maskValue(value)}</span>
                ) : typeof value === 'string' ? (
                  // Custom string value (no CountUp animation)
                  <>
                    {prefix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{prefix}</span>}
                    <span>{value}</span>
                    {suffix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{suffix}</span>}
                  </>
                ) : (
                  // Numeric value with CountUp animation
                  <>
                    {prefix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{prefix}</span>}
                    <CountUp
                      end={value}
                      duration={2.5}
                      separator=","
                      decimals={0}
                    />
                    {suffix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{suffix}</span>}
                  </>
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'relative',
                width: 56,
                height: 56,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />
              <Icon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', zIndex: 1 }} />
            </Box>
          </Box>

          {/* Bottom: Goal section with white background */}
          {goal && (
            <Box
              sx={{
                mt: 2,
                mx: -2.5,
                mb: -2.5,
                px: 2.5,
                py: 1,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
                  Goal:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>
                  {prefix}{typeof goal === 'number' ? goal.toLocaleString() : goal}{suffix}
                </Typography>
              </Box>

              {percentageToGoal && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isAboveGoal ? (
                    <TrendingUp sx={{ fontSize: 18, color: '#10b981' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 18, color: '#ef4444' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isAboveGoal ? '#10b981' : '#ef4444',
                      fontSize: '0.875rem',
                    }}
                  >
                    ({isAboveGoal ? '+' : ''}{percentageToGoal}%)
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if value, trend, or showPrivacy changes
  return (
    prevProps.value === nextProps.value &&
    prevProps.trend === nextProps.trend &&
    prevProps.showPrivacy === nextProps.showPrivacy &&
    prevProps.goal === nextProps.goal
  );
});

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Mini contact card component
const MiniContactCard = ({ title, name, initials, color = '#2196f3' }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 0.75,
      borderRadius: 1,
      backgroundColor: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.2)}`,
      minHeight: 32,
    }}
  >
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography 
        variant="caption" 
        sx={{ 
          fontSize: '9px',
          color: 'text.secondary',
          display: 'block',
          lineHeight: 1,
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          fontSize: '10px',
          fontWeight: 600,
          display: 'block',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name || 'Not Assigned'}
      </Typography>
    </Box>
  </Box>
);


const EscrowsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const skipStatsRecalculation = useRef(0); // Counter for pending non-stats updates
  const [escrows, setEscrows] = useState([]);
  const [archivedEscrows, setArchivedEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showNewEscrowModal, setShowNewEscrowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');
  // Load saved view mode from localStorage, default to 'small'
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('escrowsViewMode');
    return saved || 'small';
  });
  const [sortBy, setSortBy] = useState('closing_date'); // Sort field
  const [scope, setScope] = useState(() => {
    const saved = localStorage.getItem('escrowsScope');
    return saved || 'team';
  }); // 'brokerage', 'team', 'user'
  const [animationType, setAnimationType] = useState('spring'); // 'spring', 'stagger', 'parallax', 'blur', 'magnetic'
  const [animationDuration, setAnimationDuration] = useState(1); // 0.5 to 5 seconds
  const [animationIntensity, setAnimationIntensity] = useState(1); // 0.5 to 2 (multiplier for overshoot/bounce)
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState('1M'); // '1D', '1M', '1Y', 'YTD', or null for custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEscrows: 0,
    activeEscrows: 0,
    totalVolume: 0,
    projectedCommission: 0,
    closedThisMonth: 0,
    avgDaysToClose: 0,
    grossCommission: 0,
    myCommission: 0,
    ytdClosed: 0,
    ytdVolume: 0,
    ytdChange: 0,
    monthClosed: 0,
    monthVolume: 0,
    monthChange: 0,
    weekProjected: 0,
    weekVolume: 0,
    weekChange: 0,
    closingThisWeek: 0,
    pendingActions: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('escrowsViewMode', viewMode);
  }, [viewMode]);

  // Save scope to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('escrowsScope', scope);
  }, [scope]);

  // PHASE 6: Refetch escrows when scope or selectedStatus changes
  useEffect(() => {
    fetchEscrows();
  }, [scope, selectedStatus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch(e.key.toLowerCase()) {
        case 'n':
          // N = New escrow
          if (!showNewEscrowModal) {
            setShowNewEscrowModal(true);
          }
          break;
        case 'v':
          // V = Toggle view mode
          setViewMode(prev => prev === 'small' ? 'large' : 'small');
          break;
        case 'escape':
          // ESC = Close modal
          if (showNewEscrowModal) {
            setShowNewEscrowModal(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showNewEscrowModal]);

  useEffect(() => {
    fetchEscrows();
  }, []);

  // Track previous selectedStatus to detect tab changes
  const prevSelectedStatusRef = useRef(selectedStatus);

  useEffect(() => {
    const statusChanged = prevSelectedStatusRef.current !== selectedStatus;
    prevSelectedStatusRef.current = selectedStatus;

    // Always recalculate stats when tab changes (selectedStatus changes)
    // Skip counter only applies to same-tab updates
    if (!statusChanged && skipStatsRecalculation.current > 0) {
      skipStatsRecalculation.current -= 1; // Decrement counter
      // console.log('🛑 Skipping stats recalculation, remaining:', skipStatsRecalculation.current);
      return;
    }

    if (statusChanged) {
      // console.log('🔄 Tab changed to:', selectedStatus, '- recalculating stats');
    } else {
      // console.log('✅ Recalculating stats');
    }

    if (selectedStatus === 'archived') {
      // Calculate stats for archived escrows (should show 0s when empty)
      calculateStats(archivedEscrows, 'archived');
    } else if (escrows.length > 0) {
      calculateStats(escrows, selectedStatus);
    } else {
      // Set all stats to 0 when no escrows
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, escrows, archivedEscrows]);

  // Sync archived count with archived escrows array
  useEffect(() => {
    setArchivedCount(archivedEscrows.length);
  }, [archivedEscrows]);

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

  // WebSocket real-time updates - Selective, surgical updates only
  useEffect(() => {
    if (!isConnected) return;

    // Import websocket service
    const websocketService = require('../../services/websocket.service').default;

    // Subscribe to data updates
    const unsubscribe = websocketService.on('data:update', (data) => {
      // console.log('📡 WebSocket data update received:', data);

      if (data.entityType === 'escrow' && data.action === 'updated') {
        // Surgical update: Only update the specific escrow that changed
        const escrowId = data.entityId;
        // console.log('🔧 Applying surgical update to escrow:', escrowId);

        // Fetch ONLY the updated escrow (not all escrows)
        escrowsAPI.getById(escrowId).then((response) => {
          if (response.success && response.data) {
            const updatedEscrow = response.data;

            // Determine if this update affects stats
            const currentEscrow = escrows.find(e => e.id === escrowId);
            const affectsStats = currentEscrow && (
              currentEscrow.purchase_price !== updatedEscrow.purchase_price ||
              currentEscrow.my_commission !== updatedEscrow.my_commission ||
              currentEscrow.net_commission !== updatedEscrow.net_commission ||
              currentEscrow.gross_commission !== updatedEscrow.gross_commission ||
              currentEscrow.escrow_status !== updatedEscrow.escrow_status ||
              currentEscrow.closing_date !== updatedEscrow.closing_date
            );

            // Set skip flag if update doesn't affect stats
            if (!affectsStats) {
              skipStatsRecalculation.current += 1;
              // console.log('📡 WebSocket: Non-stats update, skip counter set to:', skipStatsRecalculation.current);
            }

            // Update only the specific escrow in the array
            setEscrows((prev) =>
              prev.map((e) => (e.id === escrowId ? { ...e, ...updatedEscrow } : e))
            );

            // If it affects stats, recalculate manually
            if (affectsStats) {
              // console.log('📡 WebSocket: Stats-affecting update, recalculating');
              const updatedEscrows = escrows.map((e) =>
                e.id === escrowId ? { ...e, ...updatedEscrow } : e
              );
              calculateStats(updatedEscrows, selectedStatus);
              generateChartData(updatedEscrows);
            }
          }
        }).catch((error) => {
          console.error('Failed to fetch updated escrow from WebSocket:', error);
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected, escrows, selectedStatus]);

  const fetchEscrows = async (pageNum = 1, appendData = false) => {
    try {
      // Show appropriate loading state
      if (appendData) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
      }

      // console.log(`Fetching escrows... (page ${pageNum})`);

      // Fetch escrows with pagination (50 per page for optimal performance)
      // PHASE 6: Include scope filter (brokerage, team, user)
      // Only include archived if viewing archived status
      const response = await escrowsAPI.getAll({
        includeArchived: selectedStatus === 'archived',
        archived: selectedStatus === 'archived' ? 'true' : undefined,
        page: pageNum,
        limit: 50,
        scope: scope // Pass scope from state
      });
      // console.log('API Response:', response);

      if (response.success) {
        const allData = response.data.escrows || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        // Backend now handles filtering by selectedStatus, so we just use the data as-is
        // If viewing archived, allData will be archived escrows
        // If viewing active/closed/cancelled/all, allData will be non-archived escrows
        const isViewingArchived = selectedStatus === 'archived';

        // console.log(`Page ${pageNum}/${totalPages} - Total: ${totalRecords}, Loaded: ${allData.length}, Status: ${selectedStatus}`);

        // Update state based on whether we're appending or replacing
        if (appendData) {
          if (isViewingArchived) {
            setArchivedEscrows(prev => [...prev, ...allData]);
          } else {
            setEscrows(prev => [...prev, ...allData]);
          }
        } else {
          if (isViewingArchived) {
            setArchivedEscrows(allData);
            setEscrows([]); // Clear active escrows when viewing archived
          } else {
            setEscrows(allData);
            setArchivedEscrows([]); // Clear archived when viewing active
          }
        }

        // Update pagination state
        setCurrentPage(pageNum);
        setHasMorePages(hasMore);
        setTotalCount(totalRecords);
        setArchivedCount(isViewingArchived ? totalRecords : 0);

        // Calculate stats from currently loaded data only
        // This allows instant display without waiting for all pages
        const currentEscrows = isViewingArchived ? [] : (appendData ? [...escrows, ...allData] : allData);
        calculateStats(currentEscrows, selectedStatus);
        generateChartData(currentEscrows);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching escrows:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more escrows (infinite scroll handler)
  const loadMoreEscrows = useCallback(() => {
    if (!loadingMore && hasMorePages) {
      // console.log(`Loading page ${currentPage + 1}...`);
      fetchEscrows(currentPage + 1, true);
    }
  }, [loadingMore, hasMorePages, currentPage]);

  const calculateStats = (escrowData, statusFilter = 'active') => {
    // Safety check for escrowData or if it's archived with no data
    if (!escrowData || !Array.isArray(escrowData) || (statusFilter === 'archived' && escrowData.length === 0)) {
      setStats({
        totalEscrows: 0,
        activeEscrows: 0,
        totalVolume: 0,
        projectedCommission: 0,
        closedThisMonth: 0,
        avgDaysToClose: 0,
        grossCommission: 0,
        myCommission: 0,
        ytdClosed: 0,
        ytdVolume: 0,
        ytdChange: 0,
        monthClosed: 0,
        monthVolume: 0,
        monthChange: 0,
        weekProjected: 0,
        weekVolume: 0,
        weekChange: 0,
        closingThisWeek: 0,
        pendingActions: 0,
      });
      return;
    }
    
    let filteredEscrows = [];
    
    // Filter based on selected status
    switch (statusFilter) {
      case 'active':
        filteredEscrows = escrowData.filter(e => 
          e.escrowStatus === 'Active Under Contract' || 
          e.escrowStatus === 'active under contract' ||
          e.escrowStatus === 'Pending' || 
          e.escrowStatus === 'pending' ||
          e.escrowStatus === 'Active' || 
          e.escrowStatus === 'active'
        );
        break;
      case 'closed':
        filteredEscrows = escrowData.filter(e => 
          e.escrowStatus === 'Closed' || 
          e.escrowStatus === 'closed' ||
          e.escrowStatus === 'Completed' || 
          e.escrowStatus === 'completed'
        );
        break;
      case 'cancelled':
        filteredEscrows = escrowData.filter(e =>
          e.escrowStatus === 'Cancelled' ||
          e.escrowStatus === 'cancelled' ||
          e.escrowStatus === 'Withdrawn' ||
          e.escrowStatus === 'withdrawn' ||
          e.escrowStatus === 'Expired' ||
          e.escrowStatus === 'expired'
        );
        break;
      case 'archived':
        // For archived, just use all the data since it's already filtered
        filteredEscrows = escrowData;
        break;
      default:
        filteredEscrows = escrowData;
    }
    
    // Calculate stats for filtered escrows
    const totalVolume = filteredEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    const myCommission = filteredEscrows.reduce((sum, e) => sum + Number(e.myCommission || 0), 0);
    
    // Calculate gross commission (assuming 5% total commission rate if not specified)
    const grossCommission = filteredEscrows.reduce((sum, e) => {
      const purchasePrice = Number(e.purchasePrice || 0);
      const commissionRate = Number(e.totalCommissionRate || 5) / 100;
      return sum + (purchasePrice * commissionRate);
    }, 0);
    
    // Calculate time-based stats
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // YTD Stats
    const ytdEscrows = escrowData.filter(e => {
      const closeDate = e.actualCoeDate || e.closingDate;
      if (!closeDate) return false;
      const date = new Date(closeDate);
      return date >= startOfYear && (e.escrowStatus === 'Closed' || e.escrowStatus === 'closed');
    });
    const ytdClosed = ytdEscrows.length;
    const ytdVolume = ytdEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    
    // Calculate YTD change (mock data for now, would need last year's data)
    const ytdChange = 15.2; // Mock: 15.2% increase
    
    // Monthly Stats
    const monthEscrows = escrowData.filter(e => {
      const closeDate = e.actualCoeDate || e.closingDate;
      if (!closeDate) return false;
      const date = new Date(closeDate);
      return date >= startOfMonth && (e.escrowStatus === 'Closed' || e.escrowStatus === 'closed');
    });
    const monthClosed = monthEscrows.length;
    const monthVolume = monthEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    const monthChange = -8.5; // Mock: 8.5% decrease from last month
    
    // Weekly Projected Stats
    const weekEscrows = escrowData.filter(e => {
      const closeDate = e.scheduledCoeDate || e.closingDate;
      if (!closeDate) return false;
      const date = new Date(closeDate);
      return date >= startOfWeek && date <= endOfWeek && 
        (e.escrowStatus === 'Active Under Contract' || e.escrowStatus === 'active under contract' ||
         e.escrowStatus === 'Pending' || e.escrowStatus === 'pending');
    });
    const weekProjected = weekEscrows.length;
    const weekVolume = weekEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    const weekChange = 23.8; // Mock: 23.8% increase from last week
    
    // Closing this week count
    const closingThisWeek = weekEscrows.length;
    
    // Pending actions (mock for now)
    const pendingActions = 5;
    
    setStats({
      totalEscrows: filteredEscrows.length,
      activeEscrows: filteredEscrows.length, // For backward compatibility
      totalVolume,
      projectedCommission: myCommission, // For backward compatibility
      closedThisMonth: monthClosed,
      avgDaysToClose: Math.round(filteredEscrows.reduce((sum, e) => sum + (Number(e.daysToClose) || 0), 0) / (filteredEscrows.length || 1)),
      grossCommission,
      myCommission,
      ytdClosed,
      ytdVolume,
      ytdChange,
      monthClosed,
      monthVolume,
      monthChange,
      weekProjected,
      weekVolume,
      weekChange,
      closingThisWeek,
      pendingActions,
    });
  };

  const generateChartData = (escrowData) => {
    // Safety check for escrowData
    if (!escrowData || !Array.isArray(escrowData)) {
      setChartData([]);
      return;
    }
    
    // Generate last 6 months of data
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthEscrows = []; /* Temporarily disabled date filtering
      const monthEscrows = escrowData.filter(e => {
        const escrowDate = safeParseDate(e.acceptanceDate);
        if (!escrowDate) return false;
        return escrowDate.getMonth() === date.getMonth() && escrowDate.getFullYear() === date.getFullYear();
      }); */

      months.push({
        month: monthName,
        escrows: monthEscrows.length,
        volume: monthEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0) / 1000000,
      });
    }
    
    setChartData(months);
  };

  const handleEscrowClick = (escrowId) => {
    // console.log('Escrow clicked - ID:', escrowId);
    navigate(`/escrows/${escrowId}`);
  };

  const handleCreateNew = () => {
    setShowNewEscrowModal(true);
  };

  const handleNewEscrowSuccess = (escrowId) => {
    // Refresh the escrows list
    fetchEscrows();
    // Navigate to the new escrow detail page
    navigate(`/escrows/${escrowId}`);
  };

  const handleChecklistUpdate = async (escrowId, updatedChecklists) => {
    try {
      // Update the checklist via API
      await escrowsAPI.updateChecklist(escrowId, updatedChecklists);

      // Update local state to reflect the change
      setEscrows(prevEscrows =>
        prevEscrows.map(esc =>
          esc.id === escrowId
            ? { ...esc, checklists: updatedChecklists }
            : esc
        )
      );
    } catch (error) {
      console.error('Failed to update checklist:', error);
    }
  };

  const handleArchive = async (escrowId) => {
    try {
      // console.log('🗄️ Archiving escrow:', escrowId);
      const response = await escrowsAPI.archive(escrowId);
      // console.log('🗄️ Archive API response:', response);

      if (response && response.success) {
        // Move escrow from active to archived
        const archivedEscrow = escrows.find(e => e.id === escrowId);
        // console.log('🗄️ Found escrow to archive:', archivedEscrow);

        if (archivedEscrow) {
          // Mark as archived
          archivedEscrow.deleted_at = new Date().toISOString();

          setEscrows(prev => prev.filter(e => e.id !== escrowId));
          setArchivedEscrows(prev => [...prev, archivedEscrow]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active escrows
          const remainingEscrows = escrows.filter(e => e.id !== escrowId);
          calculateStats(remainingEscrows, selectedStatus);
          generateChartData(remainingEscrows);

          // console.log('✅ Escrow archived successfully');
        } else {
          console.error('❌ Escrow not found in active escrows array');
        }
      } else {
        console.error('❌ Archive failed - API returned success: false', response);
      }
    } catch (error) {
      // Safely log error - make sure we're not rendering an object
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('❌ Failed to archive escrow:', errorMessage);
      console.error('Full error object:', error);
    }
  };

  const handleRestore = async (escrowId) => {
    try {
      const response = await escrowsAPI.restore(escrowId);
      if (response.success) {
        // Move escrow from archived to active
        const restoredEscrow = archivedEscrows.find(e => e.id === escrowId);
        if (restoredEscrow) {
          // Remove archived marker
          delete restoredEscrow.deleted_at;
          delete restoredEscrow.deletedAt;

          setArchivedEscrows(prev => prev.filter(e => e.id !== escrowId));
          setEscrows(prev => [...prev, restoredEscrow]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active escrows
          const updatedEscrows = [...escrows, restoredEscrow];
          calculateStats(updatedEscrows, selectedStatus);
          generateChartData(updatedEscrows);
        }
      }
    } catch (error) {
      console.error('Failed to restore escrow:', error);
    }
  };

  const handleUpdateEscrow = async (escrowId, updateData) => {
    try {
      // Normalize field names (convert snake_case to camelCase for consistency)
      const normalizedData = { ...updateData };
      if (updateData.escrow_status !== undefined) {
        normalizedData.escrowStatus = updateData.escrow_status;
      }
      if (updateData.purchase_price !== undefined) {
        normalizedData.purchasePrice = updateData.purchase_price;
      }
      if (updateData.my_commission !== undefined) {
        normalizedData.myCommission = updateData.my_commission;
      }
      if (updateData.closing_date !== undefined) {
        normalizedData.closingDate = updateData.closing_date;
      }
      if (updateData.acceptance_date !== undefined) {
        normalizedData.acceptanceDate = updateData.acceptance_date;
      }

      // Determine if this update affects stats/charts
      const affectsStats = Boolean(
        updateData.purchase_price !== undefined ||
        updateData.my_commission !== undefined ||
        updateData.net_commission !== undefined ||
        updateData.gross_commission !== undefined ||
        updateData.escrow_status !== undefined ||
        updateData.closing_date !== undefined
      );

      // Increment counter to skip next 2 stats recalculations (optimistic + server response)
      if (!affectsStats) {
        skipStatsRecalculation.current += 2; // Will skip both optimistic and server response updates
        // console.log('🚫 Non-stats update detected, skip counter set to:', skipStatsRecalculation.current);
      }

      // Optimistic update - update UI immediately with normalized data
      setEscrows((prev) =>
        prev.map((e) =>
          e.id === escrowId ? { ...e, ...normalizedData } : e
        )
      );

      // Only recalculate stats if the update affects them
      if (affectsStats) {
        // console.log('💰 Stats-affecting update detected:', Object.keys(updateData));
        const optimisticEscrows = escrows.map((e) =>
          e.id === escrowId ? { ...e, ...normalizedData } : e
        );
        calculateStats(optimisticEscrows, selectedStatus);
        generateChartData(optimisticEscrows);
        // console.log('✅ Stats recalculated immediately (optimistic)');
      }

      // Make the API call in the background
      const response = await escrowsAPI.update(escrowId, updateData);

      if (response.success && response.data) {
        // Parse JSONB fields from server response (they come as strings from raw DB row)
        const serverData = { ...response.data };
        if (typeof serverData.people === 'string') {
          try {
            serverData.people = JSON.parse(serverData.people);
          } catch (e) {
            console.error('Failed to parse people JSON:', e);
          }
        }
        if (typeof serverData.checklists === 'string') {
          try {
            serverData.checklists = JSON.parse(serverData.checklists);
          } catch (e) {
            console.error('Failed to parse checklists JSON:', e);
          }
        }
        if (typeof serverData.timeline === 'string') {
          try {
            serverData.timeline = JSON.parse(serverData.timeline);
          } catch (e) {
            console.error('Failed to parse timeline JSON:', e);
          }
        }

        // Update with server response (in case server modified data)
        setEscrows((prev) =>
          prev.map((e) =>
            e.id === escrowId ? { ...e, ...serverData } : e
          )
        );

        // Recalculate stats again with server data if needed
        if (affectsStats) {
          // console.log('💰 Recalculating stats with server response data');
          const finalEscrows = escrows.map((e) =>
            e.id === escrowId ? { ...e, ...response.data } : e
          );
          calculateStats(finalEscrows, selectedStatus);
          generateChartData(finalEscrows);
          // console.log('✅ Stats recalculated with server data');
        }
      } else {
        console.error('Update failed - no success response');
        // Rollback optimistic update on failure
        const response = await escrowsAPI.getAll();
        if (response.success) {
          setEscrows(response.data);
          calculateStats(response.data, selectedStatus);
          generateChartData(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to update escrow:', error);
      // Rollback optimistic update on error
      try {
        const response = await escrowsAPI.getAll();
        if (response.success) {
          setEscrows(response.data);
          calculateStats(response.data, selectedStatus);
          generateChartData(response.data);
        }
      } catch (rollbackError) {
        console.error('Failed to rollback:', rollbackError);
      }
    }
  };

  const handlePermanentDelete = async (escrowId, skipConfirmation = false) => {
    // Check if running in test mode (can be set via window or query param)
    const isTestMode = window.location.search.includes('testMode=true') ||
                       window.__ESCROW_TEST_MODE__ === true ||
                       skipConfirmation === true;

    // Single confirmation dialog unless in test mode
    if (!isTestMode && !window.confirm('Are you sure you want to permanently delete this escrow? This action cannot be undone.')) {
      return;
    }

    try {
      // Check if escrow is already archived
      const escrowToDelete = archivedEscrows.find(e => e.id === escrowId) ||
                             escrows.find(e => e.id === escrowId);

      // If not archived, archive first
      if (escrowToDelete && !escrowToDelete.deleted_at && !escrowToDelete.deletedAt) {
        const archiveResponse = await escrowsAPI.archive(escrowId);
        if (!archiveResponse.success) {
          console.error('Failed to archive escrow before deletion');
          return;
        }
      }

      // Now permanently delete the archived escrow
      const response = await escrowsAPI.delete(escrowId);
      if (response.success) {
        // Remove from both lists
        setArchivedEscrows(prev => prev.filter(e => e.id !== escrowId));
        setEscrows(prev => prev.filter(e => e.id !== escrowId));
        setArchivedCount(prev => Math.max(0, prev - 1));

        // Recalculate stats with remaining active escrows only
        const remainingEscrows = escrows.filter(e => e.id !== escrowId);
        calculateStats(remainingEscrows, selectedStatus);
        generateChartData(remainingEscrows);

        // console.log('Successfully permanently deleted escrow:', escrowId);
      }
    } catch (error) {
      console.error('Failed to permanently delete escrow:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} escrow${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await escrowsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted escrows from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedEscrows(prev => prev.filter(e => !deletedIds.has(e.id)));
        setEscrows(prev => prev.filter(e => !deletedIds.has(e.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active escrows only
        const remainingEscrows = escrows.filter(e => !deletedIds.has(e.id));
        calculateStats(remainingEscrows, selectedStatus);
        generateChartData(remainingEscrows);

        // console.log(`Successfully permanently deleted ${response.data.deletedCount || selectedArchivedIds.length} escrows`);
      }
    } catch (error) {
      console.error('Failed to batch delete escrows:', error);
      alert('Failed to delete escrows. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedEscrows.map(e => e.id));
    } else {
      setSelectedArchivedIds([]);
    }
  };

  const handleSelectEscrow = (escrowId, checked) => {
    if (checked) {
      setSelectedArchivedIds(prev => [...prev, escrowId]);
    } else {
      setSelectedArchivedIds(prev => prev.filter(id => id !== escrowId));
    }
  };

  const handleCalendarOpen = () => {
    setShowCalendar(!showCalendar);
  };

  // Helper to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Check if custom dates match a preset range
  const detectPresetRange = (start, end) => {
    if (!start || !end) return null;

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Normalize the input dates to compare (ignore time)
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    // Check 1D (today)
    if (isSameDay(startDay, today) && isSameDay(endDay, today)) {
      return '1D';
    }

    // Check 1M (last 30 days) - end should be today
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);
    if (isSameDay(startDay, oneMonthAgo) && isSameDay(endDay, today)) {
      return '1M';
    }

    // Check 1Y (last 365 days) - end should be today
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 365);
    if (isSameDay(startDay, oneYearAgo) && isSameDay(endDay, today)) {
      return '1Y';
    }

    // Check YTD (year to date) - end should be today
    const ytdStart = new Date(now.getFullYear(), 0, 1);
    if (isSameDay(startDay, ytdStart) && isSameDay(endDay, today)) {
      return 'YTD';
    }

    return null;
  };

  // Calculate date range based on filter or custom dates
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    // Use custom dates if both are set
    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;

      // Auto-detect if custom dates match a preset
      const matchedPreset = detectPresetRange(startDate, endDate);
      if (matchedPreset && dateRangeFilter !== matchedPreset) {
        setDateRangeFilter(matchedPreset);
      } else if (!matchedPreset && dateRangeFilter !== null) {
        setDateRangeFilter(null);
      }
    } else {
      // Use preset ranges
      switch(dateRangeFilter) {
        case '1D':
          // Today from 12:00 AM to 11:59 PM
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0); // Midnight
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999); // End of day
          break;
        case '1M':
          // Last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case '1Y':
          // Last 365 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          endDate = now;
          break;
        case 'YTD':
          // Year to date
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
      }
    }

    // Validate dates before formatting
    const validStart = startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate : new Date();
    const validEnd = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : new Date();

    return {
      startDate: validStart,
      endDate: validEnd,
      label: `${validStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${validEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    };
  };

  const dateRange = getDateRange();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, maxWidth: '1600px', px: { xs: 2, sm: 3 } }}>

        {/* Hero Section with Stats */}
        <HeroSection>
          {/* Wrapper for header and main content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header Row - Full width above both containers */}
            <Box sx={{
              display: 'flex',
              gap: 3,
              alignItems: 'center',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              mb: 3,
              width: '100%',
            }}>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ flexShrink: 0 }}
              >
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                  Escrows
                </Typography>
              </motion.div>

              {/* Date Controls Container - always show in header, right-aligned */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'nowrap',
                flexShrink: 0,
                marginLeft: 'auto',
              }}>
                  {/* Date Buttons */}
                  <ToggleButtonGroup
                    value={dateRangeFilter}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) {
                        setDateRangeFilter(newValue);
                        setCustomStartDate(null);
                        setCustomEndDate(null);
                      }
                    }}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 1,
                      flexShrink: 0, // Don't shrink
                      flexGrow: 0, // Don't grow
                      height: 36, // Match date picker height
                      '& .MuiToggleButton-root': {
                        color: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'transparent',
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        fontWeight: 600,
                        px: { xs: 1.5, md: 2 },
                        py: 0,
                        height: 36, // Match container height
                        minWidth: 'auto',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          borderColor: 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'transparent',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="1D">1D</ToggleButton>
                    <ToggleButton value="1M">1M</ToggleButton>
                    <ToggleButton value="1Y">1Y</ToggleButton>
                    <ToggleButton value="YTD">YTD</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Date Range Pickers - No Labels */}
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{
                      display: 'flex',
                      gap: 0.5, // Smaller gap
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 1,
                      px: 0.5, // Minimal padding
                      height: 36, // Match date button height
                      border: '1px solid transparent',
                      flexShrink: 0, // Don't shrink
                      flexGrow: 0, // Don't grow
                    }}>
                      <DatePicker
                        open={startDatePickerOpen}
                        onOpen={() => setStartDatePickerOpen(true)}
                        onClose={() => setStartDatePickerOpen(false)}
                        format="MMM d, yyyy" // Format: Sep 4, 2025 (no leading zeros)
                        value={(() => {
                          try {
                            const date = customStartDate || dateRange?.startDate;
                            if (!date) return null;
                            if (typeof date === 'string') {
                              const parsed = new Date(date);
                              if (isNaN(parsed.getTime())) return null;
                              return parsed;
                            }
                            if (!(date instanceof Date)) return null;
                            if (isNaN(date.getTime())) return null;
                            return date;
                          } catch (e) {
                            console.error('DatePicker value error:', e);
                            return null;
                          }
                        })()}
                        onChange={(newDate) => {
                          setCustomStartDate(newDate);
                          if (newDate && customEndDate) {
                            const matched = detectPresetRange(newDate, customEndDate);
                            setDateRangeFilter(matched);
                          } else {
                            setDateRangeFilter(null);
                          }
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            placeholder: 'Start',
                            onClick: () => setStartDatePickerOpen(true),
                            sx: {
                              width: { xs: 105, md: 115 }, // Narrower width
                              '& .MuiInputBase-root': {
                                backgroundColor: 'transparent',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                height: 36, // Slightly smaller height
                                paddingRight: '8px !important', // Override default padding
                              },
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'transparent',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'transparent',
                                },
                              },
                              '& .MuiInputBase-input': {
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: 'rgba(255, 255, 255, 0.9)',
                                padding: '6px 8px', // Reduced padding
                              },
                              // Hide the calendar icon
                              '& .MuiInputAdornment-root': {
                                display: 'none',
                              },
                              '& .MuiInputLabel-root': {
                                display: 'none', // Hide label
                              },
                              '& .MuiOutlinedInput-notchedOutline legend': {
                                display: 'none', // Hide legend space
                              },
                            },
                          },
                          openPickerButton: {
                            sx: { display: 'none' },
                          },
                        }}
                      />
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mx: 0.5, flexShrink: 0 }}>→</Typography>
                      <DatePicker
                        open={endDatePickerOpen}
                        onOpen={() => setEndDatePickerOpen(true)}
                        onClose={() => setEndDatePickerOpen(false)}
                        format="MMM d, yyyy" // Format: Sep 4, 2025 (no leading zeros)
                        value={(() => {
                          try {
                            const date = customEndDate || dateRange?.endDate;
                            if (!date) return null;
                            if (typeof date === 'string') {
                              const parsed = new Date(date);
                              if (isNaN(parsed.getTime())) return null;
                              return parsed;
                            }
                            if (!(date instanceof Date)) return null;
                            if (isNaN(date.getTime())) return null;
                            return date;
                          } catch (e) {
                            console.error('DatePicker value error:', e);
                            return null;
                          }
                        })()}
                        onChange={(newDate) => {
                          setCustomEndDate(newDate);
                          if (customStartDate && newDate) {
                            const matched = detectPresetRange(customStartDate, newDate);
                            setDateRangeFilter(matched);
                          } else {
                            setDateRangeFilter(null);
                          }
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            placeholder: 'End',
                            onClick: () => setEndDatePickerOpen(true),
                            sx: {
                              width: { xs: 105, md: 115 }, // Narrower width
                              '& .MuiInputBase-root': {
                                backgroundColor: 'transparent',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                height: 36, // Slightly smaller height
                                paddingRight: '8px !important', // Override default padding
                              },
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'transparent',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'transparent',
                                },
                              },
                              '& .MuiInputBase-input': {
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: 'rgba(255, 255, 255, 0.9)',
                                padding: '6px 8px', // Reduced padding
                              },
                              // Hide the calendar icon
                              '& .MuiInputAdornment-root': {
                                display: 'none',
                              },
                              '& .MuiInputLabel-root': {
                                display: 'none', // Hide label
                              },
                              '& .MuiOutlinedInput-notchedOutline legend': {
                                display: 'none', // Hide legend space
                              },
                            },
                          },
                          openPickerButton: {
                            sx: { display: 'none' },
                          },
                        }}
                      />
                    </Box>
                  </LocalizationProvider>
                </Box>
            </Box>

            {/* Main Content Row - Left and Right Containers */}
            <Box sx={{
              display: 'flex',
              gap: 3,
              alignItems: 'stretch',
              flexDirection: { xs: 'column', md: 'row' },
              height: '100%',
            }}>
              {/* Left container: Stats Grid */}
              <Box sx={{
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0, // Allow shrinking
              }}>
                {/* Stats Grid - White Cards - Dynamic based on selected tab */}
                <Grid container spacing={2}>
                {(() => {
                  // Calculate cancellation rate from all non-archived escrows
                  const totalAllStatuses = (escrows || []).length;
                  const totalCancelled = (escrows || []).filter(e =>
                    e.escrowStatus?.toLowerCase() === 'cancelled'
                  ).length;
                  const cancellationRate = totalAllStatuses > 0
                    ? ((totalCancelled / totalAllStatuses) * 100).toFixed(1)
                    : 0;

                  // Max archived limit (will be user setting based on subscription)
                  const maxArchivedLimit = 100;

                  switch(selectedStatus) {
                    case 'active':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Home}
                              title="Total Active Escrows"
                              value={stats.totalEscrows || 0}
                              color="#ffffff"
                              delay={0}
                              goal={15}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Escrows This Month"
                              value={stats.monthClosed || 0}
                              color="#ffffff"
                              delay={1}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Total Volume"
                              value={stats.totalVolume || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={5000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Total Commission"
                              value={stats.projectedCommission || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                              goal={150000}
                            />
                          </Grid>
                        </>
                      );

                case 'closed':
                  return (
                    <>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={CheckCircle}
                          title="Total Closed Escrows"
                          value={stats.totalEscrows || 0}
                          color="#ffffff"
                          delay={0}
                          goal={50}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={CalendarToday}
                          title="Closed This Year"
                          value={stats.ytdClosed || 0}
                          color="#ffffff"
                          delay={1}
                          goal={60}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={TrendingUp}
                          title="Total Volume"
                          value={stats.totalVolume || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={2}
                          goal={20000000}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={AttachMoney}
                          title="Total Commission"
                          value={stats.projectedCommission || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={3}
                          showPrivacy={true}
                          goal={600000}
                        />
                      </Grid>
                    </>
                  );

                case 'cancelled':
                  return (
                    <>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={ErrorIcon}
                          title="Total Cancelled Escrows"
                          value={stats.totalEscrows || 0}
                          color="#ffffff"
                          delay={0}
                          goal={5}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={Assessment}
                          title="Cancellation Rate"
                          value={cancellationRate}
                          suffix="%"
                          color="#ffffff"
                          delay={1}
                          goal={10}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={TrendingUp}
                          title="Total Volume"
                          value={stats.totalVolume || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={2}
                          goal={1000000}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={AttachMoney}
                          title="Total Commission"
                          value={stats.projectedCommission || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={3}
                          showPrivacy={true}
                          goal={30000}
                        />
                      </Grid>
                    </>
                  );

                case 'archived':
                  return (
                    <>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={ArchiveIcon}
                          title="Total Archived Escrows"
                          value={archivedCount || 0}
                          color="#ffffff"
                          delay={0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={Storage}
                          title="Max Archived"
                          value={`${archivedCount || 0}/${maxArchivedLimit}`}
                          color="#ffffff"
                          delay={1}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={TrendingUp}
                          title="Total Volume"
                          value={stats.totalVolume || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={2}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={AttachMoney}
                          title="Total Commission"
                          value={stats.projectedCommission || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={3}
                          showPrivacy={true}
                        />
                      </Grid>
                    </>
                  );

                case 'all':
                  return (
                    <>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={Home}
                          title="Total Escrows"
                          value={stats.totalEscrows || 0}
                          color="#ffffff"
                          delay={0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={CheckCircle}
                          title="Active"
                          value={(escrows || []).filter(e => e.escrowStatus?.toLowerCase() === 'active').length}
                          color="#ffffff"
                          delay={1}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={TrendingUp}
                          title="Total Volume"
                          value={stats.totalVolume || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={2}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={AttachMoney}
                          title="Total Commission"
                          value={stats.projectedCommission || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={3}
                          showPrivacy={true}
                        />
                      </Grid>
                    </>
                  );

                default:
                  return (
                    <>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={Home}
                          title="Total Escrows"
                          value={hasMorePages ? `${stats.totalEscrows}+` : stats.totalEscrows || 0}
                          color="#ffffff"
                          delay={0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={CheckCircle}
                          title="Active Escrows"
                          value={stats.activeEscrows || 0}
                          color="#ffffff"
                          delay={1}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={TrendingUp}
                          title="Total Volume"
                          value={stats.totalVolume || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={2}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={6} xl={3}>
                        <StatCard
                          icon={AttachMoney}
                          title="Total Commission"
                          value={stats.projectedCommission || 0}
                          prefix="$"
                          suffix=""
                          color="#ffffff"
                          delay={3}
                          showPrivacy={true}
                        />
                      </Grid>
                    </>
                  );
              }
            })()}
              </Grid>

              {/* Flexible spacer to push buttons to bottom */}
              <Box sx={{ flexGrow: 1, minHeight: '20px' }} />

              {/* Action Buttons Row - Aligned to bottom */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<Add />}
                  onClick={handleCreateNew}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Create New Escrow
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<Assessment />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Transaction Analytics
                </Button>
              </Box>
              </Box>

              {/* Right container: Date Controls (md only) + AI Assistant */}
              <Box sx={{
                width: { xs: '100%', md: '280px', lg: '320px' },
                minWidth: { md: '280px' }, // Ensure minimum width
                flexShrink: 0, // Prevent shrinking
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    aspectRatio: { xs: 'auto', md: '1 / 1' },
                    minHeight: { xs: 250, md: 320 },
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(30, 60, 114, 0.12) 0%, rgba(42, 82, 152, 0.08) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '2px dashed rgba(255, 255, 255, 0.5)',
                      background: 'linear-gradient(135deg, rgba(30, 60, 114, 0.18) 0%, rgba(42, 82, 152, 0.12) 100%)',
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ fontSize: '2rem' }}>🤖</Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontWeight: 700,
                          mb: 1,
                          letterSpacing: '0.02em',
                        }}
                      >
                        AI Escrow Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to automate escrow tasks, send reminders, and manage deadlines.
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.75,
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(5px)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                          }}
                        >
                          Coming Soon
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />
            </Box>
            </Box>
          </Box>
        </HeroSection>

        {/* Conditional Date Controls - Show between hero and tabs when AI Manager wraps below */}
        <Box
          sx={{
            display: { xs: 'flex', sm: 'flex', md: 'none' },
            justifyContent: 'center',
            mb: 3,
            mt: -2,
          }}
        >
          {/* Compact rounded rectangle around date controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              borderRadius: 2,
              px: 2,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Date Range Toggle Buttons */}
            <ToggleButtonGroup
            value={dateRangeFilter}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setDateRangeFilter(newValue);
                setCustomStartDate(null);
                setCustomEndDate(null);
              }
            }}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              flexShrink: 0,
              height: 36,
              '& .MuiToggleButton-root': {
                color: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'transparent',
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                fontWeight: 600,
                px: { xs: 1.5, md: 2 },
                py: 0,
                height: 36,
                minWidth: 'auto',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'transparent',
                },
              },
            }}
          >
            <ToggleButton value="1D">1D</ToggleButton>
            <ToggleButton value="1M">1M</ToggleButton>
            <ToggleButton value="1Y">1Y</ToggleButton>
            <ToggleButton value="YTD">YTD</ToggleButton>
          </ToggleButtonGroup>

          {/* Date Range Pickers */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              px: 0.5,
              height: 36,
              border: '1px solid transparent',
            }}>
              <DatePicker
                open={startDatePickerOpen}
                onOpen={() => setStartDatePickerOpen(true)}
                onClose={() => setStartDatePickerOpen(false)}
                format="MMM d, yyyy"
                value={(() => {
                  try {
                    const date = customStartDate || dateRange?.startDate;
                    if (!date) return null;
                    if (typeof date === 'string') {
                      const parsed = new Date(date);
                      if (isNaN(parsed.getTime())) return null;
                      return parsed;
                    }
                    if (!(date instanceof Date)) return null;
                    if (isNaN(date.getTime())) return null;
                    return date;
                  } catch (e) {
                    console.error('DatePicker value error:', e);
                    return null;
                  }
                })()}
                onChange={(newDate) => {
                  setCustomStartDate(newDate);
                  if (newDate && customEndDate) {
                    const matched = detectPresetRange(newDate, customEndDate);
                    setDateRangeFilter(matched);
                  } else {
                    setDateRangeFilter(null);
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      width: { xs: 105, md: 115 },
                      '& .MuiInputBase-root': {
                        backgroundColor: 'transparent',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        height: 36,
                        paddingRight: '8px !important',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                          borderColor: 'transparent',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'transparent',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.9)',
                        padding: '6px 8px',
                      },
                      '& .MuiInputAdornment-root': {
                        display: 'none',
                      },
                      '& .MuiInputLabel-root': {
                        display: 'none',
                      },
                      '& .MuiOutlinedInput-notchedOutline legend': {
                        display: 'none',
                      },
                    },
                  },
                  openPickerButton: {
                    sx: { display: 'none' },
                  },
                }}
              />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mx: 0.5, flexShrink: 0 }}>→</Typography>
              <DatePicker
                open={endDatePickerOpen}
                onOpen={() => setEndDatePickerOpen(true)}
                onClose={() => setEndDatePickerOpen(false)}
                format="MMM d, yyyy"
                value={(() => {
                  try {
                    const date = customEndDate || dateRange?.endDate;
                    if (!date) return null;
                    if (typeof date === 'string') {
                      const parsed = new Date(date);
                      if (isNaN(parsed.getTime())) return null;
                      return parsed;
                    }
                    if (!(date instanceof Date)) return null;
                    if (isNaN(date.getTime())) return null;
                    return date;
                  } catch (e) {
                    console.error('DatePicker value error:', e);
                    return null;
                  }
                })()}
                onChange={(newDate) => {
                  setCustomEndDate(newDate);
                  if (customStartDate && newDate) {
                    const matched = detectPresetRange(customStartDate, newDate);
                    setDateRangeFilter(matched);
                  } else {
                    setDateRangeFilter(null);
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      width: { xs: 105, md: 115 },
                      '& .MuiInputBase-root': {
                        backgroundColor: 'transparent',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        height: 36,
                        paddingRight: '8px !important',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                          borderColor: 'transparent',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'transparent',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.9)',
                        padding: '6px 8px',
                      },
                      '& .MuiInputAdornment-root': {
                        display: 'none',
                      },
                      '& .MuiInputLabel-root': {
                        display: 'none',
                      },
                      '& .MuiOutlinedInput-notchedOutline legend': {
                        display: 'none',
                      },
                    },
                  },
                  openPickerButton: {
                    sx: { display: 'none' },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
          </Box>
        </Box>

      {/* Navigation Bar with Tabs and Controls */}
      <Box sx={{ mb: 4 }}>
        {/* Tab Bar Container */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Tabs with gray background */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              flex: '0 0 auto',
            }}
          >
            <Tabs
              value={selectedStatus}
              onChange={(e, newValue) => setSelectedStatus(newValue)}
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  minHeight: 48,
                  px: 3,
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: alpha('#1976d2', 0.04),
                  },
                },
                '& .Mui-selected': {
                  fontWeight: 600,
                  color: 'primary.main',
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label="Active Escrows" value="active" />
              <Tab label="Closed Escrows" value="closed" />
              <Tab label="Cancelled Escrows" value="cancelled" />
              <Tab label="All Escrows" value="all" />
            </Tabs>
          </Paper>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right: Controls (no background) */}
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            flexWrap: 'wrap',
            flex: '0 0 auto',
            marginLeft: 'auto',
          }}>
            {/* Scope Dropdown */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 110 }}>
              <Select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                disableUnderline
                renderValue={(value) => {
                  const labels = {
                    brokerage: 'Brokerage',
                    team: 'Team',
                    user: 'User',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.04),
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-select': {
                    paddingRight: '32px !important',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="brokerage">Brokerage</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Dropdown */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disableUnderline
                startAdornment={
                  <Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />
                }
                renderValue={(value) => {
                  const labels = {
                    closing_date: 'Closing Date',
                    created_at: 'Date Created',
                    sale_price: 'Sale Price',
                    property_address: 'Address',
                    escrow_status: 'Status',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.04),
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-select': {
                    paddingRight: '32px !important',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="closing_date">Closing Date</MenuItem>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="sale_price">Sale Price</MenuItem>
                <MenuItem value="property_address">Address</MenuItem>
                <MenuItem value="escrow_status">Status</MenuItem>
              </Select>
              </FormControl>

              {/* View Mode & Calendar Selector */}
              <ToggleButtonGroup
                value={showCalendar ? 'calendar' : viewMode}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    if (newValue === 'calendar') {
                      setShowCalendar(true);
                    } else {
                      setShowCalendar(false);
                      setViewMode(newValue);
                    }
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    height: '32px',
                  },
                }}
              >
                <ToggleButton value="small" title="Grid view (V)">
                  <Box sx={{ display: 'flex', gap: 0.4 }}>
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  </Box>
                </ToggleButton>
                <ToggleButton value="large" title="Full width view (V)">
                  <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </ToggleButton>
                <ToggleButton value="calendar" title="Calendar view">
                  <CalendarToday sx={{ fontSize: 16 }} />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Archive/Trash Icon */}
              <IconButton
                size="small"
                onClick={() => setSelectedStatus('archived')}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: selectedStatus === 'archived' ? 'error.main' : alpha('#000', 0.06),
                  color: selectedStatus === 'archived' ? 'white' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: selectedStatus === 'archived' ? 'error.dark' : alpha('#000', 0.1),
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Badge badgeContent={archivedCount} color="error" max={99}>
                  <DeleteIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Mobile/Tablet Layout - Responsive Design with All Features */}
      <Box sx={{ mb: 4, display: { xs: 'block', md: 'none' } }}>
        {/* Tab Bar - Mobile/Tablet */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Tabs (not full width) */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              flex: '0 0 auto',
            }}
          >
            <Tabs
              value={selectedStatus}
              onChange={(e, newValue) => setSelectedStatus(newValue)}
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  fontWeight: 500,
                  minHeight: { xs: 48, sm: 52 },
                  px: { xs: 1.5, sm: 2.5 },
                },
                '& .Mui-selected': {
                  fontWeight: 600,
                  color: 'primary.main',
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              {/* Show full labels at sm breakpoint, short labels at xs */}
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Active Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Active</Box>
                  </Box>
                }
                value="active"
              />
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Closed Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Closed</Box>
                  </Box>
                }
                value="closed"
              />
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Cancelled Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Cancelled</Box>
                  </Box>
                }
                value="cancelled"
              />
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>All Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>All</Box>
                  </Box>
                }
                value="all"
              />
              {/* Archive Badge for Mobile */}
              <Tab
                label={
                  <Badge badgeContent={archivedCount} color="error" max={99}>
                    <span>Archived</span>
                  </Badge>
                }
                value="archived"
              />
            </Tabs>
          </Paper>

          {/* Right side controls */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: '0 0 auto', marginLeft: 'auto' }}>
            {/* Scope Dropdown - Mobile */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 100 }}>
              <Select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                disableUnderline
                renderValue={(value) => {
                  const labels = {
                    brokerage: 'Brokerage',
                    team: 'Team',
                    user: 'User',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.04),
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-select': {
                    paddingRight: '32px !important',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="brokerage">Brokerage</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Dropdown */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disableUnderline
                startAdornment={
                  <Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />
                }
                renderValue={(value) => {
                  const labels = {
                    closing_date: 'Date',
                    created_at: 'Created',
                    sale_price: 'Price',
                    property_address: 'Address',
                    escrow_status: 'Status',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.04),
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-select': {
                    paddingRight: '32px !important',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                <MenuItem value="closing_date">Closing Date</MenuItem>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="sale_price">Sale Price</MenuItem>
                <MenuItem value="property_address">Address</MenuItem>
                <MenuItem value="escrow_status">Status</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* View Mode & Archive Controls - Mobile/Tablet */}
        <Box
          sx={{
            backgroundColor: alpha('#f5f5f5', 0.4),
            borderRadius: '8px',
            p: 2,
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* View Mode, Calendar, Archive - Mobile */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* View Mode & Calendar Selector */}
            <ToggleButtonGroup
              value={showCalendar ? 'calendar' : viewMode}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  if (newValue === 'calendar') {
                    setShowCalendar(true);
                  } else {
                    setShowCalendar(false);
                    setViewMode(newValue);
                  }
                }
              }}
              size="small"
              aria-label="View mode and calendar selection"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  height: '32px', // Match height across all buttons
                },
              }}
            >
              <ToggleButton
                value="small"
                aria-label="Grid view"
                title="Grid view (V)"
              >
                <Box sx={{ display: 'flex', gap: 0.4 }}>
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </Box>
              </ToggleButton>
              <ToggleButton
                value="large"
                aria-label="Full width view"
                title="Full width view (V)"
              >
                <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
              </ToggleButton>
              <ToggleButton
                value="calendar"
                aria-label="Calendar view"
                title="Calendar view"
              >
                <CalendarToday sx={{ fontSize: 16 }} />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Archive/Trash Icon */}
            <IconButton
              size="small"
              onClick={() => setSelectedStatus('archived')}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: selectedStatus === 'archived' ? 'error.main' : alpha('#000', 0.06),
                color: selectedStatus === 'archived' ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: selectedStatus === 'archived' ? 'error.dark' : alpha('#000', 0.1),
                },
                transition: 'all 0.2s',
              }}
            >
              <Badge badgeContent={archivedCount} color="error" max={99}>
                <DeleteIcon />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Box>

        {/* Enhanced Charts - REMOVED PER USER REQUEST */}
        {/* <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: 250,
                  background: theme => alpha(theme.palette.primary.main, 0.03),
                  border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: theme => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}>
                  Escrow Volume Trend
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => `$${value}M`}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#2196f3"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: 250,
                  background: theme => alpha(theme.palette.success.main, 0.03),
                  border: theme => `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: theme => `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 70%)`,
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}>
                  Monthly Escrow Count
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="escrows"
                      stroke="#4caf50"
                      strokeWidth={3}
                      dot={{ fill: '#4caf50', r: 6, strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid> */}


      {/* Calendar View */}
      {showCalendar ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Escrow Calendar - Key Dates
          </Typography>
          <Grid container spacing={2}>
            {(() => {
              // Generate calendar grid for current month
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const daysInMonth = lastDay.getDate();
              const startingDayOfWeek = firstDay.getDay();

              // Get all escrows with important dates
              const allEscrows = [...escrows, ...archivedEscrows];

              // Organize escrows by date
              const escrowsByDate = {};
              allEscrows.forEach(escrow => {
                const dates = [
                  { date: escrow.openDate, type: 'Open', color: '#4caf50' },
                  { date: escrow.closeDate, type: 'Close', color: '#2196f3' },
                  { date: escrow.inspectionDate, type: 'Inspection', color: '#ff9800' },
                  { date: escrow.appraisalDate, type: 'Appraisal', color: '#9c27b0' },
                ].filter(d => d.date);

                dates.forEach(({ date, type, color }) => {
                  const dateStr = safeFormatDate(date, 'yyyy-MM-dd');
                  if (!escrowsByDate[dateStr]) escrowsByDate[dateStr] = [];
                  escrowsByDate[dateStr].push({ ...escrow, eventType: type, eventColor: color });
                });
              });

              const days = [];

              // Day headers
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
                days.push(
                  <Grid item xs={12 / 7} key={`header-${day}`}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'center', display: 'block' }}>
                      {day}
                    </Typography>
                  </Grid>
                );
              });

              // Empty cells before first day
              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(<Grid item xs={12 / 7} key={`empty-${i}`}><Box sx={{ height: 80 }} /></Grid>);
              }

              // Calendar days
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEscrows = escrowsByDate[dateStr] || [];
                const isToday = day === today.getDate() && month === today.getMonth();

                days.push(
                  <Grid item xs={12 / 7} key={`day-${day}`}>
                    <Paper
                      elevation={isToday ? 3 : 0}
                      onClick={() => {
                        if (dayEscrows.length > 0) {
                          setSelectedDate({ date: dateStr, escrows: dayEscrows });
                          setCalendarDialogOpen(true);
                        }
                      }}
                      sx={{
                        height: 80,
                        p: 1,
                        cursor: dayEscrows.length > 0 ? 'pointer' : 'default',
                        border: theme => `1px solid ${isToday ? theme.palette.primary.main : theme.palette.divider}`,
                        backgroundColor: isToday ? theme => alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                        '&:hover': dayEscrows.length > 0 ? {
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                        } : {},
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {day}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {dayEscrows.slice(0, 2).map((escrow, idx) => (
                          <Chip
                            key={idx}
                            label={escrow.eventType}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: 9,
                              mb: 0.5,
                              backgroundColor: escrow.eventColor,
                              color: 'white',
                              '& .MuiChip-label': { px: 0.5 },
                            }}
                          />
                        ))}
                        {dayEscrows.length > 2 && (
                          <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                            +{dayEscrows.length - 2} more
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              }

              return days;
            })()}
          </Grid>
        </Paper>
      ) : (
        <>
          {/* Escrow Cards with proper dividers and edge alignment */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr', // Mobile: 1 column
              sm: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', // Tablet: 2 columns in small view
              md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', // Medium: 2 columns in small view
              lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr', // Desktop: 4 columns in small view
            },
            gap: 3, // 24px gap
            width: '100%',
            minHeight: '600px', // Prevent scroll jump when switching tabs
          }}>
        <AnimatePresence>
          {(() => {
            // If archived tab is selected, show archived escrows
            if (selectedStatus === 'archived') {
              if (!archivedEscrows || archivedEscrows.length === 0) {
                return (
                  <Paper
                    sx={{
                      p: 6,
                      height: 240,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      background: theme => alpha(theme.palette.warning.main, 0.03),
                      border: theme => `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      gridColumn: '1 / -1',
                    }}
                  >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No archived escrows
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Archived escrows will appear here
                    </Typography>
                  </Paper>
                );
              }

              // Use same display pattern as active escrows (no special grid/compact views)
              return archivedEscrows.map((escrow, index) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  viewMode={viewMode}
                  animationType={animationType}
                  animationDuration={animationDuration}
                  animationIntensity={animationIntensity}
                  index={index}
                  onRestore={handleRestore}
                  onDelete={handlePermanentDelete}
                  isArchived={true}
                  onUpdate={handleUpdateEscrow}
                />
              ));
            }

            // Otherwise show regular escrows filtered by status (exclude archived)
            const filteredEscrows = escrows.filter(e => {
              // Filter out archived escrows (those with deleted_at set)
              // Check both top-level and details.deletedAt
              if (e.deleted_at || e.deletedAt || e.details?.deletedAt) return false;

              switch (selectedStatus) {
                case 'active':
                  return e.escrowStatus === 'Active Under Contract' ||
                         e.escrowStatus === 'active under contract' ||
                         e.escrowStatus === 'Pending' ||
                         e.escrowStatus === 'pending' ||
                         e.escrowStatus === 'Active' ||
                         e.escrowStatus === 'active';
                case 'closed':
                  return e.escrowStatus === 'Closed' ||
                         e.escrowStatus === 'closed' ||
                         e.escrowStatus === 'Completed' ||
                         e.escrowStatus === 'completed';
                case 'cancelled':
                  return e.escrowStatus === 'Cancelled' ||
                         e.escrowStatus === 'cancelled' ||
                         e.escrowStatus === 'Withdrawn' ||
                         e.escrowStatus === 'withdrawn' ||
                         e.escrowStatus === 'Expired' ||
                         e.escrowStatus === 'expired';
                case 'all':
                  return true; // Show all non-archived escrows
                default:
                  return true;
              }
            });

            // Sort escrows based on sortBy state
            const sortedEscrows = [...filteredEscrows].sort((a, b) => {
              let aVal, bVal;

              switch(sortBy) {
                case 'closing_date':
                  aVal = new Date(a.closingDate || a.closing_date || 0);
                  bVal = new Date(b.closingDate || b.closing_date || 0);
                  return bVal - aVal; // Newest first
                case 'created_at':
                  aVal = new Date(a.createdAt || a.created_at || 0);
                  bVal = new Date(b.createdAt || b.created_at || 0);
                  return bVal - aVal; // Newest first
                case 'sale_price':
                  aVal = Number(a.purchasePrice || a.sale_price || 0);
                  bVal = Number(b.purchasePrice || b.sale_price || 0);
                  return bVal - aVal; // Highest first
                case 'property_address':
                  aVal = (a.propertyAddress || a.property_address || '').toLowerCase();
                  bVal = (b.propertyAddress || b.property_address || '').toLowerCase();
                  return aVal.localeCompare(bVal); // A-Z
                case 'escrow_status':
                  aVal = (a.escrowStatus || a.escrow_status || '').toLowerCase();
                  bVal = (b.escrowStatus || b.escrow_status || '').toLowerCase();
                  return aVal.localeCompare(bVal); // A-Z
                default:
                  return 0;
              }
            });

            if (!sortedEscrows || sortedEscrows.length === 0) {
              return (
            <Paper
              sx={{
                p: 6,
                height: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: theme => alpha(theme.palette.primary.main, 0.03),
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                gridColumn: '1 / -1',
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No {selectedStatus} escrows found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStatus === 'active' ? 'Create a new escrow to get started' : `No ${selectedStatus} escrows in the system`}
              </Typography>
            </Paper>
              );
            } else {
              // Use virtualization for large lists (50+ escrows) to improve performance
              // For smaller lists, use regular rendering to maintain grid layout
              const useVirtualization = sortedEscrows.length >= 50;

              if (useVirtualization) {
                // Calculate dynamic height: viewport height minus header/padding (~400px)
                const dynamicHeight = Math.max(600, window.innerHeight - 400);

                return (
                  <Box sx={{ gridColumn: '1 / -1', width: '100%' }}>
                    <VirtualizedEscrowList
                      escrows={sortedEscrows}
                      viewMode={viewMode}
                      animationType={animationType}
                      animationDuration={animationDuration}
                      animationIntensity={animationIntensity}
                      onArchive={handleArchive}
                      onUpdate={handleUpdateEscrow}
                      containerHeight={dynamicHeight}
                    />
                  </Box>
                );
              } else {
                return sortedEscrows.map((escrow, index) => (
                  <EscrowCard
                    key={escrow.id}
                    escrow={escrow}
                    viewMode={viewMode}
                    animationType={animationType}
                    animationDuration={animationDuration}
                    animationIntensity={animationIntensity}
                    index={index}
                    onArchive={handleArchive}
                      onUpdate={handleUpdateEscrow}
                  />
                ));
              }
            }
          })()}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMorePages && !loading && selectedStatus !== 'archived' && (
          <Box sx={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            mb: 2
          }}>
            <Button
              variant="outlined"
              size="large"
              onClick={loadMoreEscrows}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={20} /> : null}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {loadingMore ? 'Loading...' : `Load More (${totalCount - escrows.length} remaining)`}
            </Button>
          </Box>
        )}
      </Box>
        </>
      )}

      {/* Calendar Date Detail Dialog */}
      <Dialog
        open={calendarDialogOpen}
        onClose={() => setCalendarDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDate && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Escrow Events - {safeFormatDate(selectedDate.date, 'MMMM d, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDate.escrows.length} event{selectedDate.escrows.length !== 1 ? 's' : ''} scheduled
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedDate && (
            <List>
              {selectedDate.escrows.map((escrow, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                  onClick={() => {
                    setCalendarDialogOpen(false);
                    handleEscrowClick(escrow.id);
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: escrow.eventColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      {escrow.eventType.charAt(0)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {escrow.address}
                        </Typography>
                        <Chip
                          label={escrow.eventType}
                          size="small"
                          sx={{
                            backgroundColor: escrow.eventColor,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Client: {escrow.clientName || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: ${escrow.salePrice?.toLocaleString() || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {escrow.status}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* New Escrow Modal */}
      <NewEscrowModal
        open={showNewEscrowModal}
        onClose={() => setShowNewEscrowModal(false)}
        onSuccess={handleNewEscrowSuccess}
      />
        {/* Debug Panel - Admin Only */}
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
                      Debug Panel: Escrows Dashboard
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
                    {debugExpanded ? <ExpandLess /> : <ExpandMore />}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNetworkData({
                          stats: networkMonitor.getStats(),
                          requests: networkMonitor.getRequests(),
                          errors: networkMonitor.getErrors()
                        });
                      }}
                      sx={(theme) => ({
                        color: theme.palette.primary.main,
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.1)
                        }
                      })}
                    >
                      <MuiTooltip title="Refresh Network Data">
                        <Refresh />
                      </MuiTooltip>
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
                        escrowsData: {
                          totalEscrows: escrows.length,
                          activeEscrows: escrows.filter(e => e.escrowStatus === 'Active Under Contract' || e.escrowStatus === 'active under contract').length,
                          stats: stats,
                          escrowsSample: escrows.slice(0, 3).map(e => ({
                            id: e.id,
                            propertyAddress: e.propertyAddress,
                            status: e.escrowStatus,
                            salePrice: e.salePrice,
                            acceptanceDate: e.acceptanceDate
                          })),
                          selectedStatus: selectedStatus,
                          viewMode: viewMode
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
                        <Analytics /> Escrows Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Total Escrows</Typography>
                          <Typography variant="h4">{escrows.length}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Active Escrows</Typography>
                          <Typography variant="h4">{stats.activeEscrows}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Total Volume</Typography>
                          <Typography variant="h5">${(stats.totalVolume / 1000000).toFixed(1)}M</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Commission</Typography>
                          <Typography variant="h5">${(stats.projectedCommission / 1000).toFixed(0)}K</Typography>
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

                {/* Recent Escrows */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Storage /> Recent Escrows Data
                      </Typography>
                      <Stack spacing={2}>
                        {escrows.slice(0, 3).map((escrow) => (
                          <Box
                            key={escrow.id}
                            sx={{
                              p: 2,
                              background: 'rgba(0,0,0,0.03)',
                              borderRadius: '8px',
                              fontFamily: 'monospace',
                              fontSize: '0.85rem'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ID: {escrow.id} | Status: {escrow.escrowStatus}
                            </Typography>
                            <Typography variant="body2">
                              {escrow.propertyAddress}
                            </Typography>
                            <Typography variant="body2">
                              Price: ${escrow.salePrice?.toLocaleString() || 0} | COE: {safeFormatDate(escrow.scheduledCoeDate, 'MMM d, yyyy')}
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
      </Container>
    </>
  );
};

export default EscrowsDashboard;