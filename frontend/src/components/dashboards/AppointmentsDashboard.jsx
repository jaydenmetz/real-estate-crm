import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  CircularProgress,
  alpha,
  Stack,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  IconButton,
  Badge,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Slider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  Event,
  CalendarToday,
  CheckCircle,
  Add,
  Assessment,
  Cancel,
  Schedule,
  Visibility,
  VisibilityOff,
  Delete as DeleteIcon,
  Sort,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { appointmentsAPI } from '../../services/api.service';
import NewAppointmentModal from '../forms/NewAppointmentModal';
import { useAuth } from '../../contexts/AuthContext';
import networkMonitor from '../../services/networkMonitor.service';
import { useWebSocket } from '../../hooks/useWebSocket';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #F57C00 0%, #FFB74D 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(245, 124, 0, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

// Enhanced animated stat card component with new layout structure
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend, showPrivacy = false, goal }) => {
  const theme = useTheme();
  const [showValue, setShowValue] = useState(false);

  // Mask value for privacy
  const maskValue = (val) => {
    return '***';
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, my: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
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
                  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
};

const AppointmentsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const [appointments, setAppointments] = useState([]);
  const [archivedAppointments, setArchivedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('appointmentsViewMode') || 'small');
  const [sortBy, setSortBy] = useState('appointment_date');
  const [dateRangeFilter, setDateRangeFilter] = useState('1M');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false);
  const [animationType, setAnimationType] = useState('spring');
  const [animationDuration, setAnimationDuration] = useState(1);
  const [animationIntensity, setAnimationIntensity] = useState(1);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });
  const [stats, setStats] = useState({
    totalUpcoming: 0,
    thisWeek: 0,
    thisMonth: 0,
    noShowRate: 0,
    totalCompleted: 0,
    completedThisMonth: 0,
    successRate: 0,
    avgDuration: 0,
    totalCancelled: 0,
    cancellationRate: 0,
    lastMinuteCancellations: 0,
    rescheduled: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completionRate: 0,
    avgPerWeek: 0,
  });

  const maxArchivedLimit = 500;

  useEffect(() => { localStorage.setItem('appointmentsViewMode', viewMode); }, [viewMode]);
  useEffect(() => { fetchAppointments(); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Check for Cmd/Ctrl key combinations
      if ((e.metaKey || e.ctrlKey)) {
        switch(e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            setNewAppointmentModalOpen(true);
            break;
          case 'f':
            e.preventDefault();
            // Focus search (if exists)
            break;
          case 'r':
            e.preventDefault();
            fetchAppointments();
            break;
          case 'a':
            e.preventDefault();
            if (selectedStatus === 'archived') {
              handleSelectAll(selectedArchivedIds.length !== archivedAppointments.length);
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedStatus, selectedArchivedIds, archivedAppointments]);

  useEffect(() => {
    if (selectedStatus === 'archived') {
      calculateStats(archivedAppointments, 'archived');
    } else if (appointments.length > 0) {
      calculateStats(appointments, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, appointments, archivedAppointments, customStartDate, customEndDate, dateRangeFilter]);

  // Sync archived count with archived appointments array
  useEffect(() => {
    setArchivedCount(archivedAppointments.length);
  }, [archivedAppointments]);

  // Auto-refresh network data
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData({
        stats: networkMonitor.getStats(),
        requests: networkMonitor.getRequests(),
        errors: networkMonitor.getErrors()
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    // Import websocket service
    const websocketService = require('../../services/websocket.service').default;

    // Subscribe to data updates
    const unsubscribe = websocketService.on('data:update', (data) => {
      console.log('📡 WebSocket data update received:', data);

      // Only refetch if it's an appointment update
      if (data.entityType === 'appointment') {
        console.log('🔄 Refetching appointments due to real-time update');
        fetchAppointments();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  const fetchAppointments = async (pageNum = 1, appendData = false) => {
    try {
      // Show appropriate loading state
      if (appendData) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
      }

      console.log(`Fetching appointments... (page ${pageNum})`);

      // Fetch appointments with pagination (50 per page for optimal performance)
      const response = await appointmentsAPI.getAll({
        includeArchived: true,
        page: pageNum,
        limit: 50
      });
      console.log('API Response:', response);

      if (response.success) {
        const allData = response.data.appointments || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        // Separate active and archived appointments based on deleted_at field
        const appointmentData = allData.filter(appt => !appt.deleted_at && !appt.deletedAt);
        const archivedData = allData.filter(appt => appt.deleted_at || appt.deletedAt);

        console.log(`Page ${pageNum}/${totalPages} - Total: ${totalRecords}, Loaded: ${allData.length}, Active: ${appointmentData.length}, Archived: ${archivedData.length}`);

        // Update state based on whether we're appending or replacing
        if (appendData) {
          setAppointments(prev => [...prev, ...appointmentData]);
          setArchivedAppointments(prev => [...prev, ...archivedData]);
        } else {
          setAppointments(appointmentData);
          setArchivedAppointments(archivedData);
        }

        // Update pagination state
        setCurrentPage(pageNum);
        setHasMorePages(hasMore);
        setTotalCount(totalRecords);
        setArchivedCount(archivedData.length);

        // Calculate stats from currently loaded data only
        const currentAppointments = appendData ? [...appointments, ...appointmentData] : appointmentData;
        calculateStats(currentAppointments, selectedStatus);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more appointments (infinite scroll handler)
  const loadMoreAppointments = useCallback(() => {
    if (!loadingMore && hasMorePages) {
      console.log(`Loading page ${currentPage + 1}...`);
      fetchAppointments(currentPage + 1, true);
    }
  }, [loadingMore, hasMorePages, currentPage]);

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

  const calculateStats = (data, statusFilter) => {
    if (!data || !Array.isArray(data)) {
      setStats({
        totalUpcoming: 0, thisWeek: 0, thisMonth: 0, noShowRate: 0,
        totalCompleted: 0, completedThisMonth: 0, successRate: 0, avgDuration: 0,
        totalCancelled: 0, cancellationRate: 0, lastMinuteCancellations: 0, rescheduled: 0,
        totalAppointments: 0, upcomingAppointments: 0, completionRate: 0, avgPerWeek: 0,
      });
      return;
    }

    const now = new Date();
    const { startDate, endDate } = dateRange;

    // Filter by date range
    const dateFiltered = data.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= startDate && apptDate <= endDate;
    });

    // Filter by status
    let filtered = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      const status = (a.appointmentStatus || a.appointment_status || '').toLowerCase();

      if (statusFilter === 'upcoming') return apptDate >= now && status !== 'cancelled';
      if (statusFilter === 'completed') return status === 'completed';
      if (statusFilter === 'cancelled') return status === 'cancelled';
      return true; // 'all'
    });

    const totalAll = dateFiltered.length;
    const totalCompleted = dateFiltered.filter(a => (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'completed').length;
    const totalCancelled = dateFiltered.filter(a => (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'cancelled').length;
    const totalUpcoming = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= now && (a.appointmentStatus || a.appointment_status || '').toLowerCase() !== 'cancelled';
    }).length;

    // Week calculation
    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setDate(now.getDate() + 7);
    const thisWeek = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= now && apptDate <= oneWeekFromNow;
    }).length;

    // Month calculation
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setDate(now.getDate() + 30);
    const thisMonth = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= now && apptDate <= oneMonthFromNow;
    }).length;

    const completedThisMonth = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      return (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'completed' && apptDate >= monthAgo && apptDate <= now;
    }).length;

    // Calculate rates
    const noShowRate = totalAll > 0 ? ((totalCancelled / totalAll) * 100).toFixed(1) : 0;
    const successRate = totalAll > 0 ? ((totalCompleted / totalAll) * 100).toFixed(1) : 0;
    const cancellationRate = totalAll > 0 ? ((totalCancelled / totalAll) * 100).toFixed(1) : 0;
    const completionRate = totalAll > 0 ? ((totalCompleted / totalAll) * 100).toFixed(1) : 0;

    // Last minute cancellations (within 24 hours)
    const lastMinuteCancellations = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      const cancelledWithin24h = now - apptDate < 86400000; // 24 hours in ms
      return (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'cancelled' && cancelledWithin24h;
    }).length;

    // Avg duration (mock calculation)
    const avgDuration = 45; // minutes

    // Avg per week
    const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const avgPerWeek = daysDiff > 0 ? Math.round((totalAll / daysDiff) * 7) : 0;

    setStats({
      // Upcoming stats
      totalUpcoming: totalUpcoming,
      thisWeek: thisWeek,
      thisMonth: thisMonth,
      noShowRate: noShowRate,
      // Completed stats
      totalCompleted: totalCompleted,
      completedThisMonth: completedThisMonth,
      successRate: successRate,
      avgDuration: avgDuration,
      // Cancelled stats
      totalCancelled: totalCancelled,
      cancellationRate: cancellationRate,
      lastMinuteCancellations: lastMinuteCancellations,
      rescheduled: Math.floor(totalCancelled * 0.6), // Mock 60% rescheduled
      // All stats
      totalAppointments: filtered.length,
      upcomingAppointments: totalUpcoming,
      completionRate: completionRate,
      avgPerWeek: avgPerWeek,
    });
  };

  const handleArchive = async (appointmentId) => {
    try {
      const response = await appointmentsAPI.archive(appointmentId);
      if (response && response.success) {
        // Move appointment from active to archived
        const archivedAppointment = appointments.find(a => a.id === appointmentId);
        if (archivedAppointment) {
          // Mark as archived
          archivedAppointment.deleted_at = new Date().toISOString();

          setAppointments(prev => prev.filter(a => a.id !== appointmentId));
          setArchivedAppointments(prev => [...prev, archivedAppointment]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active appointments
          const remainingAppointments = appointments.filter(a => a.id !== appointmentId);
          calculateStats(remainingAppointments, selectedStatus);
        }
      } else {
        console.error('Archive failed - no success response');
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to archive appointment:', errorMessage);
    }
  };

  const handleRestore = async (appointmentId) => {
    try {
      const response = await appointmentsAPI.restore(appointmentId);
      if (response.success) {
        // Move appointment from archived to active
        const restoredAppointment = archivedAppointments.find(a => a.id === appointmentId);
        if (restoredAppointment) {
          // Remove archived marker
          delete restoredAppointment.deleted_at;
          delete restoredAppointment.deletedAt;

          setArchivedAppointments(prev => prev.filter(a => a.id !== appointmentId));
          setAppointments(prev => [...prev, restoredAppointment]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active appointments
          const updatedAppointments = [...appointments, restoredAppointment];
          calculateStats(updatedAppointments, selectedStatus);
        }
      }
    } catch (error) {
      console.error('Failed to restore appointment:', error);
    }
  };

  const handlePermanentDelete = async (appointmentId, skipConfirmation = false) => {
    // Check if running in test mode
    const isTestMode = window.location.search.includes('testMode=true') ||
                       window.__APPOINTMENT_TEST_MODE__ === true ||
                       skipConfirmation === true;

    // Single confirmation dialog unless in test mode
    if (!isTestMode && !window.confirm('Are you sure you want to permanently delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      // Check if appointment is already archived
      const appointmentToDelete = archivedAppointments.find(a => a.id === appointmentId) ||
                                  appointments.find(a => a.id === appointmentId);

      // If not archived, archive first
      if (appointmentToDelete && !appointmentToDelete.deleted_at && !appointmentToDelete.deletedAt) {
        const archiveResponse = await appointmentsAPI.archive(appointmentId);
        if (!archiveResponse.success) {
          console.error('Failed to archive appointment before deletion');
          return;
        }
      }

      // Now permanently delete the archived appointment
      const response = await appointmentsAPI.delete(appointmentId);
      if (response.success) {
        // Remove from both lists
        setArchivedAppointments(prev => prev.filter(a => a.id !== appointmentId));
        setAppointments(prev => prev.filter(a => a.id !== appointmentId));
        setArchivedCount(prev => Math.max(0, prev - 1));

        // Recalculate stats with remaining active appointments only
        const remainingAppointments = appointments.filter(a => a.id !== appointmentId);
        calculateStats(remainingAppointments, selectedStatus);

        console.log('Successfully permanently deleted appointment:', appointmentId);
      }
    } catch (error) {
      console.error('Failed to permanently delete appointment:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} appointment${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await appointmentsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted appointments from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedAppointments(prev => prev.filter(a => !deletedIds.has(a.id)));
        setAppointments(prev => prev.filter(a => !deletedIds.has(a.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active appointments only
        const remainingAppointments = appointments.filter(a => !deletedIds.has(a.id));
        calculateStats(remainingAppointments, selectedStatus);

        console.log(`Successfully permanently deleted ${response.data.deletedCount || selectedArchivedIds.length} appointments`);
      }
    } catch (error) {
      console.error('Failed to batch delete appointments:', error);
      alert('Failed to delete appointments. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedAppointments.map(a => a.id));
    } else {
      setSelectedArchivedIds([]);
    }
  };

  const handleSelectAppointment = (appointmentId, checked) => {
    if (checked) {
      setSelectedArchivedIds(prev => [...prev, appointmentId]);
    } else {
      setSelectedArchivedIds(prev => prev.filter(id => id !== appointmentId));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

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
                  Appointments
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
                      flexShrink: 0,
                      flexGrow: 0,
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

                  {/* Date Range Pickers - No Labels */}
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
                      flexShrink: 0,
                      flexGrow: 0,
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
                            placeholder: 'Start',
                            onClick: () => setStartDatePickerOpen(true),
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
                            placeholder: 'End',
                            onClick: () => setEndDatePickerOpen(true),
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
                minWidth: 0,
              }}>
                {/* Stats Grid - White Cards - Dynamic based on selected tab */}
                <Grid container spacing={2}>
                {(() => {
                  switch(selectedStatus) {
                    case 'upcoming':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Event}
                              title="Total Upcoming"
                              value={stats.totalUpcoming || 0}
                              color="#ffffff"
                              delay={0}
                              goal={20}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="This Week"
                              value={stats.thisWeek || 0}
                              color="#ffffff"
                              delay={1}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="This Month"
                              value={stats.thisMonth || 0}
                              color="#ffffff"
                              delay={2}
                              goal={15}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="No-Show Rate"
                              value={stats.noShowRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={3}
                              goal={5}
                            />
                          </Grid>
                        </>
                      );

                    case 'completed':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Total Completed"
                              value={stats.totalCompleted || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Completed This Month"
                              value={stats.completedThisMonth || 0}
                              color="#ffffff"
                              delay={1}
                              goal={25}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Success Rate"
                              value={stats.successRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={2}
                              goal={95}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Avg Duration"
                              value={stats.avgDuration || 0}
                              suffix=" min"
                              color="#ffffff"
                              delay={3}
                              goal={60}
                            />
                          </Grid>
                        </>
                      );

                    case 'cancelled':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Cancel}
                              title="Total Cancelled"
                              value={stats.totalCancelled || 0}
                              color="#ffffff"
                              delay={0}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Cancellation Rate"
                              value={stats.cancellationRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={15}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Last-Minute Cancellations"
                              value={stats.lastMinuteCancellations || 0}
                              color="#ffffff"
                              delay={2}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Event}
                              title="Rescheduled"
                              value={stats.rescheduled || 0}
                              color="#ffffff"
                              delay={3}
                              goal={8}
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
                              title="Total Archived Appointments"
                              value={archivedCount || 0}
                              color="#ffffff"
                              delay={0}
                              goal={maxArchivedLimit}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Max Archived"
                              value={archivedCount || 0}
                              suffix={` / ${maxArchivedLimit}`}
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Cancel}
                              title="Cancelled Appointments"
                              value={stats.totalCancelled || 0}
                              color="#ffffff"
                              delay={2}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="No-Shows"
                              value={stats.lastMinuteCancellations || 0}
                              color="#ffffff"
                              delay={3}
                            />
                          </Grid>
                        </>
                      );

                    case 'all':
                    default:
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Event}
                              title="Total Appointments"
                              value={stats.totalAppointments || 0}
                              color="#ffffff"
                              delay={0}
                              goal={150}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Upcoming Appointments"
                              value={stats.upcomingAppointments || 0}
                              color="#ffffff"
                              delay={1}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Completion Rate"
                              value={stats.completionRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={2}
                              goal={90}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Avg Per Week"
                              value={stats.avgPerWeek || 0}
                              color="#ffffff"
                              delay={3}
                              goal={10}
                            />
                          </Grid>
                        </>
                      );
                  }
                })()}
                </Grid>

              {/* Action Buttons Row - Aligned to bottom */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<Add />}
                  onClick={() => setNewAppointmentModalOpen(true)}
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
                  Schedule Appointment
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
                  Appointment Analytics
                </Button>
              </Box>
              </Box>

              {/* Right container: AI Assistant */}
              <Box sx={{
                width: { xs: '100%', md: '280px', lg: '320px' },
                minWidth: { md: '280px' },
                flexShrink: 0,
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
                    background: 'linear-gradient(135deg, rgba(122, 62, 0, 0.12) 0%, rgba(163, 93, 0, 0.08) 100%)',
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
                      background: 'linear-gradient(135deg, rgba(122, 62, 0, 0.18) 0%, rgba(163, 93, 0, 0.12) 100%)',
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
                        AI Appointment Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to schedule appointments, send reminders, and manage your calendar.
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
            display: { xs: 'none', sm: 'none', md: 'flex', lg: 'none', xl: 'none' },
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            mt: -2,
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
                color: 'rgba(0, 0, 0, 0.7)',
                borderColor: 'rgba(0, 0, 0, 0.12)',
                fontSize: '0.875rem',
                fontWeight: 600,
                px: 2,
                py: 0,
                height: 36,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
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
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
                    sx: { width: 115 }
                  }
                }}
              />
              <Typography sx={{ mx: 0.5, color: 'text.secondary' }}>→</Typography>
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
                    sx: { width: 115 }
                  }
                }}
              />
            </Box>
          </LocalizationProvider>
        </Box>

        {/* Navigation Bar with Tabs and Controls */}
        <Box sx={{ mb: 4 }}>
          {/* Desktop Layout */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'flex-start',
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
                <Tab label="Upcoming" value="upcoming" />
                <Tab label="Completed" value="completed" />
                <Tab label="Cancelled" value="cancelled" />
                <Tab label="All Appointments" value="all" />
              </Tabs>
            </Paper>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Right: Controls */}
            <Box sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
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
                      appointment_date: 'Appointment Date',
                      created_at: 'Date Created',
                      client_name: 'Client Name',
                      appointment_type: 'Type',
                      status: 'Status',
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
                  <MenuItem value="appointment_date">Appointment Date</MenuItem>
                  <MenuItem value="created_at">Date Created</MenuItem>
                  <MenuItem value="client_name">Client Name</MenuItem>
                  <MenuItem value="appointment_type">Type</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
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
                  backgroundColor: selectedStatus === 'archived' ? 'warning.main' : alpha('#000', 0.06),
                  color: selectedStatus === 'archived' ? 'white' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: selectedStatus === 'archived' ? 'warning.dark' : alpha('#000', 0.1),
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

          {/* Mobile/Tablet Layout */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {/* Tab Bar - Mobile/Tablet */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '8px 8px 0 0',
                borderBottom: '1px solid',
                borderColor: 'divider',
                mb: 0,
              }}
            >
              <Tabs
                value={selectedStatus}
                onChange={(e, newValue) => setSelectedStatus(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    fontWeight: 500,
                    minHeight: { xs: 48, sm: 52 },
                    px: { xs: 2, sm: 2.5 },
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
                <Tab label="Upcoming" value="upcoming" />
                <Tab label="Completed" value="completed" />
                <Tab label="Cancelled" value="cancelled" />
                <Tab label="All" value="all" />
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

            {/* Mobile/Tablet Filter Controls */}
            <Box
              sx={{
                backgroundColor: alpha('#f5f5f5', 0.4),
                borderRadius: '0 0 8px 8px',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Mobile Date Controls */}
              <Box sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                {/* Date Preset Buttons */}
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
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '& .MuiToggleButton-root': {
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      px: 1.5,
                      py: 0.5,
                      height: 32,
                      minWidth: 'auto',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
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
                    backgroundColor: 'white',
                    borderRadius: 1,
                    px: 0.5,
                    height: 32,
                  }}>
                    <DatePicker
                      open={startDatePickerOpen}
                      onOpen={() => setStartDatePickerOpen(true)}
                      onClose={() => setStartDatePickerOpen(false)}
                      format="MMM d"
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
                            width: 90,
                            '& .MuiInputBase-root': {
                              backgroundColor: 'transparent',
                              height: 32,
                              paddingRight: '8px !important',
                            },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'transparent' },
                              '&:hover fieldset': { borderColor: 'transparent' },
                              '&.Mui-focused fieldset': { borderColor: 'transparent' },
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'center',
                              padding: '4px 8px',
                            },
                            '& .MuiInputAdornment-root': { display: 'none' },
                            '& .MuiInputLabel-root': { display: 'none' },
                            '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
                          },
                        },
                        openPickerButton: { sx: { display: 'none' } },
                      }}
                    />
                    <Typography sx={{ color: 'text.secondary', mx: 0.5, fontSize: '0.875rem' }}>→</Typography>
                    <DatePicker
                      open={endDatePickerOpen}
                      onOpen={() => setEndDatePickerOpen(true)}
                      onClose={() => setEndDatePickerOpen(false)}
                      format="MMM d"
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
                            width: 90,
                            '& .MuiInputBase-root': {
                              backgroundColor: 'transparent',
                              height: 32,
                              paddingRight: '8px !important',
                            },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: 'transparent' },
                              '&:hover fieldset': { borderColor: 'transparent' },
                              '&.Mui-focused fieldset': { borderColor: 'transparent' },
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'center',
                              padding: '4px 8px',
                            },
                            '& .MuiInputAdornment-root': { display: 'none' },
                            '& .MuiInputLabel-root': { display: 'none' },
                            '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
                          },
                        },
                        openPickerButton: { sx: { display: 'none' } },
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </Box>

              {/* Sort and View Controls */}
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Sort Dropdown */}
                <FormControl
                  size="small"
                  variant="outlined"
                  sx={{
                    flex: '1 1 auto',
                    maxWidth: { xs: '60%', sm: '200px' },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2,
                    },
                  }}
                >
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={<Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />}
                    renderValue={(value) => {
                      const labels = {
                        appointment_date: 'Appointment Date',
                        created_at: 'Date Created',
                        client_name: 'Client Name',
                        appointment_type: 'Type',
                        status: 'Status',
                      };
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            Sort: {labels[value]}
                          </Typography>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="appointment_date">Appointment Date</MenuItem>
                    <MenuItem value="created_at">Date Created</MenuItem>
                    <MenuItem value="client_name">Client Name</MenuItem>
                    <MenuItem value="appointment_type">Type</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>

                {/* View Mode & Calendar - Mobile */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                        height: '32px',
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
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Appointments Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr' }, gap: 3, width: '100%' }}>
          <AnimatePresence>
            {(() => {
              const now = new Date();
              const { startDate, endDate } = dateRange;

              // Filter by date range first
              const dateFiltered = appointments.filter(a => {
                const apptDate = new Date(a.appointmentDate || a.appointment_date);
                return apptDate >= startDate && apptDate <= endDate;
              });

              // Then filter by status
              const filtered = dateFiltered.filter(a => {
                const apptDate = new Date(a.appointmentDate || a.appointment_date);
                const status = (a.appointmentStatus || a.appointment_status || '').toLowerCase();

                if (selectedStatus === 'upcoming') return apptDate >= now && status !== 'cancelled';
                if (selectedStatus === 'completed') return status === 'completed';
                if (selectedStatus === 'cancelled') return status === 'cancelled';
                return true; // 'all'
              });

              const sorted = [...filtered].sort((a, b) => {
                if (sortBy === 'appointment_date') return new Date(b.appointmentDate || b.appointment_date) - new Date(a.appointmentDate || a.appointment_date);
                if (sortBy === 'created_at') return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
                if (sortBy === 'client_name') return (a.clientName || '').localeCompare(b.clientName || '');
                if (sortBy === 'appointment_type') return (a.appointmentType || '').localeCompare(b.appointmentType || '');
                if (sortBy === 'appointment_status') return (a.appointmentStatus || '').localeCompare(b.appointmentStatus || '');
                return 0;
              });

              if (sorted.length === 0) return <Paper sx={{ p: 6, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: t => alpha(t.palette.primary.main, 0.03), border: t => `1px solid ${alpha(t.palette.primary.main, 0.1)}`, gridColumn: '1 / -1' }}><Typography variant="h6" color="textSecondary">No {selectedStatus} appointments found</Typography></Paper>;

              return sorted.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card
                    onClick={() => navigate(`/appointments/${a.id}`)}
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      minHeight: 200,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{a.appointmentType || 'Appointment'}</Typography>
                      <Stack spacing={1}>
                        <Chip
                          label={a.appointmentStatus || 'Unknown'}
                          size="small"
                          color={
                            (a.appointmentStatus || '').toLowerCase() === 'completed' ? 'success' :
                            (a.appointmentStatus || '').toLowerCase() === 'cancelled' ? 'error' :
                            'primary'
                          }
                        />
                        <Typography variant="body2" color="textSecondary">
                          Client: {a.clientName || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Date: {new Date(a.appointmentDate || a.appointment_date).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ));
            })()}
          </AnimatePresence>
        </Box>

        {/* New Appointment Modal */}
        <NewAppointmentModal
          open={newAppointmentModalOpen}
          onClose={() => setNewAppointmentModalOpen(false)}
          onSuccess={(newAppointmentId) => {
            setNewAppointmentModalOpen(false);
            fetchAppointments();
          }}
        />
      </Container>
    </>
  );
};

export default AppointmentsDashboard;
