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
  Slider,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  PersonAdd,
  CheckCircle,
  Add,
  Assessment,
  Phone,
  Email,
  Star,
  Cancel,
  Delete as DeleteIcon,
  Sort,
  CalendarToday,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  Storage,
  Refresh,
  NetworkCheck,
  ExpandMore,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { leadsAPI } from '../../services/api.service';
import NewLeadModal from '../forms/NewLeadModal';
import { useAuth } from '../../contexts/AuthContext';
import networkMonitor from '../../services/networkMonitor.service';
import { useWebSocket } from '../../hooks/useWebSocket';
import LeadCard from '../common/widgets/LeadCard';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #9333EA 0%, #A855F7 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(147, 51, 234, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

// Enhanced animated stat card component with goals and progress
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend, goal }) => {
  const theme = useTheme();

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
                {typeof value === 'string' ? (
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

const LeadsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const [leads, setLeads] = useState([]);
  const [archivedLeads, setArchivedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('new');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('leadsViewMode') || 'large');
  const [sortBy, setSortBy] = useState('created_at');
  const [scope, setScope] = useState(() => {
    const saved = localStorage.getItem('leadsScope');
    return saved || 'team';
  }); // 'brokerage', 'team', 'user'
  const [animationType, setAnimationType] = useState('spring');
  const [animationDuration, setAnimationDuration] = useState(1);
  const [animationIntensity, setAnimationIntensity] = useState(1);
  const [dateRangeFilter, setDateRangeFilter] = useState('1M'); // '1D', '1M', '1Y', 'YTD', or null for custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    thisWeek: 0,
    thisMonth: 0,
    responseRate: 0,
    qualifiedLeads: 0,
    qualificationRate: 0,
    avgQualificationTime: 0,
    hotLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    avgConversionTime: 0,
    totalValue: 0,
    lostLeads: 0,
    lostRate: 0,
    lostValue: 0,
    topLostReason: '',
    activeLeads: 0,
    avgLeadValue: 0,
  });

  useEffect(() => { localStorage.setItem('leadsViewMode', viewMode); }, [viewMode]);

  // Save scope to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('leadsScope', scope);
  }, [scope]);

  // PHASE 6: Refetch leads when scope changes
  useEffect(() => {
    fetchLeads();
  }, [scope]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Check for Cmd/Ctrl modifiers
      const isModKey = e.metaKey || e.ctrlKey;

      if (isModKey) {
        switch(e.key.toLowerCase()) {
          case 'k':
            // Cmd/Ctrl+K = Create new lead
            e.preventDefault();
            if (!newLeadModalOpen) {
              setNewLeadModalOpen(true);
            }
            break;
          case 'f':
            // Cmd/Ctrl+F = Focus search (if search input exists)
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
            if (searchInput) {
              searchInput.focus();
            }
            break;
          case 'r':
            // Cmd/Ctrl+R = Refresh leads
            e.preventDefault();
            fetchLeads();
            break;
          case 'a':
            // Cmd/Ctrl+A = Toggle select all (archived view only)
            if (selectedStatus === 'archived') {
              e.preventDefault();
              if (selectedArchivedIds.length === archivedLeads.length) {
                setSelectedArchivedIds([]);
              } else {
                setSelectedArchivedIds(archivedLeads.map(l => l.id));
              }
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [newLeadModalOpen, selectedStatus, selectedArchivedIds, archivedLeads]);

  useEffect(() => { fetchLeads(); }, []);

  useEffect(() => {
    if (selectedStatus === 'archived') {
      calculateStats(archivedLeads, 'archived');
    } else if (leads.length > 0) {
      calculateStats(leads, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, leads, archivedLeads, dateRangeFilter, customStartDate, customEndDate]);

  // Sync archived count with archived leads array
  useEffect(() => {
    setArchivedCount(archivedLeads.length);
  }, [archivedLeads]);

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

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    // Import websocket service
    const websocketService = require('../../services/websocket.service').default;

    // Subscribe to data updates
    const unsubscribe = websocketService.on('data:update', (data) => {
      console.log('📡 WebSocket data update received:', data);

      // Only refetch if it's a lead update
      if (data.entityType === 'lead') {
        console.log('🔄 Refetching leads due to real-time update');
        fetchLeads();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  const fetchLeads = async (pageNum = 1, appendData = false) => {
    try {
      // Show appropriate loading state
      if (appendData) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Fetch leads with pagination (50 per page for optimal performance)
      // PHASE 6: Include scope filter (brokerage, team, user)
      const response = await leadsAPI.getAll({
        includeArchived: true,
        page: pageNum,
        limit: 50,
        scope: scope // Pass scope from state
      });

      console.log('API Response:', response);

      if (response.success) {
        const allData = response.data.leads || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        // Separate active and archived leads based on deleted_at field
        const leadData = allData.filter(lead => !lead.deleted_at && !lead.deletedAt);
        const archivedData = allData.filter(lead => lead.deleted_at || lead.deletedAt);

        console.log(`Page ${pageNum}/${totalPages} - Total: ${totalRecords}, Loaded: ${allData.length}, Active: ${leadData.length}, Archived: ${archivedData.length}`);

        // Update state based on whether we're appending or replacing
        if (appendData) {
          setLeads(prev => [...prev, ...leadData]);
          setArchivedLeads(prev => [...prev, ...archivedData]);
        } else {
          setLeads(leadData);
          setArchivedLeads(archivedData);
        }

        // Update pagination state
        setCurrentPage(pageNum);
        setHasMorePages(hasMore);
        setTotalCount(totalRecords);
        setArchivedCount(archivedData.length);

        // Calculate stats from currently loaded data only
        const currentLeads = appendData ? [...leads, ...leadData] : leadData;
        calculateStats(currentLeads, selectedStatus);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching leads:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreLeads = useCallback(() => {
    if (!loadingMore && hasMorePages) {
      console.log(`Loading page ${currentPage + 1}...`);
      fetchLeads(currentPage + 1, true);
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
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1M':
          // Last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1Y':
          // Last 365 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'YTD':
          // Year to date
          startDate = new Date(now.getFullYear(), 0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          return null;
      }
    }

    return { startDate, endDate };
  };

  const calculateStats = (data, statusFilter) => {
    if (!data || !Array.isArray(data)) {
      setStats({
        totalLeads: 0, newLeads: 0, thisWeek: 0, thisMonth: 0, responseRate: 0,
        qualifiedLeads: 0, qualificationRate: 0, avgQualificationTime: 0, hotLeads: 0,
        convertedLeads: 0, conversionRate: 0, avgConversionTime: 0, totalValue: 0,
        lostLeads: 0, lostRate: 0, lostValue: 0, topLostReason: '',
        activeLeads: 0, avgLeadValue: 0
      });
      return;
    }

    // Apply date range filtering to all data
    const dateRange = getDateRange();
    let dateFilteredData = data;
    if (dateRange) {
      dateFilteredData = data.filter(lead => {
        const createdDate = new Date(lead.createdAt || lead.created_at || 0);
        return createdDate >= dateRange.startDate && createdDate <= dateRange.endDate;
      });
    }

    // Filter by status
    let filtered = dateFilteredData.filter(l => {
      const status = (l.leadStatus || l.lead_status || '').toLowerCase();
      if (statusFilter === 'new') return status === 'new';
      if (statusFilter === 'qualified') return status === 'qualified';
      if (statusFilter === 'converted') return status === 'converted';
      if (statusFilter === 'lost') return status === 'lost';
      return true; // 'all' shows everything
    });

    // Calculate time-based stats for "new" leads
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'new');
    const thisWeek = newLeadsData.filter(l => {
      const createdDate = new Date(l.createdAt || l.created_at || 0);
      return createdDate >= startOfWeek;
    }).length;
    const thisMonth = newLeadsData.filter(l => {
      const createdDate = new Date(l.createdAt || l.created_at || 0);
      return createdDate >= startOfMonth;
    }).length;

    // Calculate response rate (mock data - would need actual response tracking)
    const responseRate = newLeadsData.length > 0 ? Math.round((thisWeek / newLeadsData.length) * 100) : 0;

    // Qualified leads stats
    const qualifiedLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'qualified');
    const qualificationRate = dateFilteredData.length > 0 ? Math.round((qualifiedLeadsData.length / dateFilteredData.length) * 100) : 0;
    const avgQualificationTime = 3; // Mock: 3 days average
    const hotLeads = qualifiedLeadsData.filter(l => (l.leadScore || l.lead_score || 0) >= 80).length;

    // Converted leads stats
    const convertedLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'converted');
    const conversionRate = dateFilteredData.length > 0 ? Math.round((convertedLeadsData.length / dateFilteredData.length) * 100) : 0;
    const avgConversionTime = 14; // Mock: 14 days average
    const totalValue = convertedLeadsData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);

    // Lost leads stats
    const lostLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'lost');
    const lostRate = dateFilteredData.length > 0 ? Math.round((lostLeadsData.length / dateFilteredData.length) * 100) : 0;
    const lostValue = lostLeadsData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);
    const topLostReason = 'Price too high'; // Mock data

    // All leads stats
    const activeLeads = dateFilteredData.filter(l => {
      const status = (l.leadStatus || l.lead_status || '').toLowerCase();
      return status !== 'lost' && status !== 'converted';
    }).length;
    const avgLeadValue = dateFilteredData.length > 0
      ? Math.round(dateFilteredData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0) / dateFilteredData.length)
      : 0;

    setStats({
      totalLeads: filtered.length,
      newLeads: newLeadsData.length,
      thisWeek,
      thisMonth,
      responseRate,
      qualifiedLeads: qualifiedLeadsData.length,
      qualificationRate,
      avgQualificationTime,
      hotLeads,
      convertedLeads: convertedLeadsData.length,
      conversionRate,
      avgConversionTime,
      totalValue,
      lostLeads: lostLeadsData.length,
      lostRate,
      lostValue,
      topLostReason,
      activeLeads,
      avgLeadValue,
    });
  };

  // Batch delete handler for archived leads
  const handleBatchDelete = async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} lead${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await leadsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted leads from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedLeads(prev => prev.filter(l => !deletedIds.has(l.id)));
        setLeads(prev => prev.filter(l => !deletedIds.has(l.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active leads only
        const remainingLeads = leads.filter(l => !deletedIds.has(l.id));
        calculateStats(remainingLeads, selectedStatus);

        console.log(`✅ Batch deleted ${count} lead${count > 1 ? 's' : ''}`);
      } else {
        console.error('Batch delete failed:', response.error);
        alert('Failed to delete leads. Please try again.');
      }
    } catch (error) {
      console.error('Error during batch delete:', error);
      alert('An error occurred while deleting leads. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedLeads.map(l => l.id));
    } else {
      setSelectedArchivedIds([]);
    }
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      setSelectedArchivedIds(prev => [...prev, leadId]);
    } else {
      setSelectedArchivedIds(prev => prev.filter(id => id !== leadId));
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress size={60} /></Box>;

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
                  Leads
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
                            const date = customStartDate || getDateRange()?.startDate;
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
                      <DatePicker
                        open={endDatePickerOpen}
                        onOpen={() => setEndDatePickerOpen(true)}
                        onClose={() => setEndDatePickerOpen(false)}
                        format="MMM d, yyyy"
                        value={(() => {
                          try {
                            const date = customEndDate || getDateRange()?.endDate;
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
                    case 'new':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={PersonAdd}
                              title="Total New Leads"
                              value={stats.newLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Phone}
                              title="This Week"
                              value={stats.thisWeek || 0}
                              color="#ffffff"
                              delay={1}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Email}
                              title="This Month"
                              value={stats.thisMonth || 0}
                              color="#ffffff"
                              delay={2}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Response Rate"
                              value={stats.responseRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={3}
                              goal={80}
                            />
                          </Grid>
                        </>
                      );

                    case 'qualified':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Total Qualified"
                              value={stats.qualifiedLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={25}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Qualification Rate"
                              value={stats.qualificationRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Avg Qualification Time"
                              value={stats.avgQualificationTime || 0}
                              suffix=" days"
                              color="#ffffff"
                              delay={2}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Star}
                              title="Hot Leads"
                              value={stats.hotLeads || 0}
                              color="#ffffff"
                              delay={3}
                              goal={10}
                            />
                          </Grid>
                        </>
                      );

                    case 'converted':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Total Converted"
                              value={stats.convertedLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={15}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Conversion Rate"
                              value={stats.conversionRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Avg Conversion Time"
                              value={stats.avgConversionTime || 0}
                              suffix=" days"
                              color="#ffffff"
                              delay={2}
                              goal={21}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Total Value"
                              value={stats.totalValue || 0}
                              prefix="$"
                              color="#ffffff"
                              delay={3}
                              goal={500000}
                            />
                          </Grid>
                        </>
                      );

                    case 'lost':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Cancel}
                              title="Total Lost"
                              value={stats.lostLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingDown}
                              title="Lost Rate"
                              value={stats.lostRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={20}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Lost Value"
                              value={stats.lostValue || 0}
                              prefix="$"
                              color="#ffffff"
                              delay={2}
                              goal={100000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Top Lost Reason"
                              value={stats.topLostReason || 'N/A'}
                              color="#ffffff"
                              delay={3}
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
                              title="Total Archived Leads"
                              value={archivedCount || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Storage}
                              title="Max Archived"
                              value={archivedCount || 0}
                              suffix=" / 500"
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Qualified Leads"
                              value={stats.qualifiedLeads || 0}
                              color="#ffffff"
                              delay={2}
                              goal={25}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Cancel}
                              title="Lost Leads"
                              value={stats.lostLeads || 0}
                              color="#ffffff"
                              delay={3}
                              goal={10}
                            />
                          </Grid>
                        </>
                      );

                    case 'all':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={PersonAdd}
                              title="Total Leads"
                              value={stats.totalLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Active Leads"
                              value={stats.activeLeads || 0}
                              color="#ffffff"
                              delay={1}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Conversion Rate"
                              value={stats.conversionRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={2}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Avg Lead Value"
                              value={stats.avgLeadValue || 0}
                              prefix="$"
                              color="#ffffff"
                              delay={3}
                              goal={25000}
                            />
                          </Grid>
                        </>
                      );

                    default:
                      return null;
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
                  onClick={() => setNewLeadModalOpen(true)}
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
                  Add New Lead
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
                  Lead Analytics
                </Button>
              </Box>
              </Box>

              {/* Right container: AI Lead Manager Card */}
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
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
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
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.18) 0%, rgba(168, 85, 247, 0.12) 100%)',
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
                          fontWeight: 700,
                          mb: 1.5,
                          color: 'white',
                          fontSize: '1.25rem',
                        }}
                      >
                        AI Lead Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.85)',
                          mb: 2.5,
                          lineHeight: 1.6,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to qualify leads, send follow-ups, and track conversion rates.
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        Coming Soon
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
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
              background: 'linear-gradient(135deg, #9333EA 0%, #A855F7 100%)',
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
                    const date = customStartDate || getDateRange()?.startDate;
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
                    const date = customEndDate || getDateRange()?.endDate;
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
                <Tab label="New Leads" value="new" />
                <Tab label="Qualified" value="qualified" />
                <Tab label="Converted" value="converted" />
                <Tab label="Lost" value="lost" />
                <Tab label="All Leads" value="all" />
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
                      created_at: 'Date Created',
                      last_contact: 'Last Contact',
                      source: 'Source',
                      score: 'Score',
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
                  <MenuItem value="created_at">Date Created</MenuItem>
                  <MenuItem value="last_contact">Last Contact</MenuItem>
                  <MenuItem value="source">Source</MenuItem>
                  <MenuItem value="score">Score</MenuItem>
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
                <Tab label="New" value="new" />
                <Tab label="Qualified" value="qualified" />
                <Tab label="Converted" value="converted" />
                <Tab label="Lost" value="lost" />
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
              {/* Sort and View Controls */}
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Scope Dropdown */}
                <FormControl
                  size="small"
                  variant="outlined"
                  sx={{
                    flex: '0 1 auto',
                    minWidth: 100,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 2,
                    },
                  }}
                >
                  <Select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    renderValue={(value) => {
                      const labels = {
                        brokerage: 'Brokerage',
                        team: 'Team',
                        user: 'User',
                      };
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {labels[value]}
                          </Typography>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="brokerage">Brokerage</MenuItem>
                    <MenuItem value="team">Team</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </FormControl>

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
                        created_at: 'Date Created',
                        last_contact: 'Last Contact',
                        source: 'Source',
                        score: 'Score',
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
                    <MenuItem value="created_at">Date Created</MenuItem>
                    <MenuItem value="last_contact">Last Contact</MenuItem>
                    <MenuItem value="source">Source</MenuItem>
                    <MenuItem value="score">Score</MenuItem>
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

        {/* Lead Cards Grid */}
        {selectedStatus === 'archived' ? (
          /* Archived View with Batch Delete */
          <Box>
            {archivedLeads.length > 0 && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                p: 2,
                backgroundColor: alpha('#ff9800', 0.1),
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#ff9800', 0.3),
              }}>
                <Checkbox
                  checked={selectedArchivedIds.length === archivedLeads.length}
                  indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedLeads.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <Typography variant="body2">
                  {selectedArchivedIds.length > 0
                    ? `${selectedArchivedIds.length} selected`
                    : 'Select all'}
                </Typography>
                {selectedArchivedIds.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={batchDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
                    onClick={handleBatchDelete}
                    disabled={batchDeleting}
                  >
                    Delete {selectedArchivedIds.length} Lead{selectedArchivedIds.length > 1 ? 's' : ''}
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr' }, gap: 3, width: '100%' }}>
              <AnimatePresence>
                {archivedLeads.length === 0 ? (
                  <Paper sx={{ p: 6, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: t => alpha(t.palette.warning.main, 0.03), border: t => `1px solid ${alpha(t.palette.warning.main, 0.1)}`, gridColumn: '1 / -1' }}>
                    <Typography variant="h6" color="textSecondary">No archived leads</Typography>
                    <Typography variant="body2" color="textSecondary">Archived leads will appear here</Typography>
                  </Paper>
                ) : (
                  archivedLeads.map((lead, index) => {
                    const isSelected = selectedArchivedIds.includes(lead.id);
                    return (
                      <Box key={lead.id} sx={{ position: 'relative' }}>
                        {/* Selection checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 2,
                            backgroundColor: 'white',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: alpha('#fff', 0.9),
                            },
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card
                            onClick={(e) => {
                              if (!e.target.closest('.MuiCheckbox-root')) {
                                navigate(`/leads/${lead.id}`);
                              }
                            }}
                            sx={{
                              cursor: 'pointer',
                              height: '100%',
                              minHeight: 200,
                              opacity: 0.7,
                              border: isSelected ? `2px solid ${alpha('#ff9800', 0.5)}` : '1px solid transparent',
                              '&:hover': {
                                opacity: 1,
                                transform: 'translateY(-4px)',
                                boxShadow: 6
                              },
                              transition: 'all 0.3s'
                            }}
                          >
                            <CardContent sx={{ pt: 5 }}>
                              <Typography variant="h6" gutterBottom>
                                {`${lead.firstName || lead.first_name || ''} ${lead.lastName || lead.last_name || ''}`}
                              </Typography>
                              <Stack spacing={1}>
                                <Chip
                                  label="Archived"
                                  size="small"
                                  color="warning"
                                />
                                <Chip
                                  label={lead.leadStatus || lead.lead_status || 'Unknown'}
                                  size="small"
                                  variant="outlined"
                                />
                                <Typography variant="body2" color="textSecondary">
                                  Source: {lead.leadSource || lead.lead_source || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Score: {lead.leadScore || lead.lead_score || 0}/100
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Box>
                    );
                  })
                )}
              </AnimatePresence>
            </Box>
          </Box>
        ) : (
          /* Active Leads View */
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr' }, gap: 3, width: '100%' }}>
              <AnimatePresence>
                {(() => {
                  const filtered = leads.filter(l => {
                    const status = (l.leadStatus || l.lead_status || '').toLowerCase();
                    if (selectedStatus === 'new') return status === 'new';
                    if (selectedStatus === 'qualified') return status === 'qualified';
                    if (selectedStatus === 'converted') return status === 'converted';
                    if (selectedStatus === 'lost') return status === 'lost';
                    return true; // 'all'
                  });
                  const sorted = [...filtered].sort((a, b) => {
                    if (sortBy === 'created_at') return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
                    if (sortBy === 'last_contact') return new Date(b.lastContact || b.last_contact || 0) - new Date(a.lastContact || a.last_contact || 0);
                    if (sortBy === 'lead_source') return (a.leadSource || a.lead_source || '').localeCompare(b.leadSource || b.lead_source || '');
                    if (sortBy === 'lead_score') return Number(b.leadScore || b.lead_score || 0) - Number(a.leadScore || a.lead_score || 0);
                    if (sortBy === 'lead_status') return (a.leadStatus || a.lead_status || '').localeCompare(b.leadStatus || b.lead_status || '');
                    return 0;
                  });
                  if (sorted.length === 0) return (
                    <Paper sx={{ p: 6, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: t => alpha(t.palette.primary.main, 0.03), border: t => `1px solid ${alpha(t.palette.primary.main, 0.1)}`, gridColumn: '1 / -1' }}>
                      <Typography variant="h6" color="textSecondary">No {selectedStatus} leads found</Typography>
                      <Typography variant="body2" color="textSecondary">{selectedStatus === 'new' ? 'Add a new lead to get started' : `No ${selectedStatus} leads in the system`}</Typography>
                    </Paper>
                  );
                  return sorted.map((l, i) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <LeadCard
                        lead={l}
                        viewMode={viewMode}
                        index={i}
                      />
                    </motion.div>
                  ));
                })()}
              </AnimatePresence>
            </Box>

            {/* Load More Button */}
            {hasMorePages && selectedStatus !== 'archived' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={loadMoreLeads}
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
                  {loadingMore ? 'Loading...' : `Load More (${totalCount - leads.length} remaining)`}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* New Lead Modal */}
        <NewLeadModal
          open={newLeadModalOpen}
          onClose={() => setNewLeadModalOpen(false)}
          onSuccess={(newLeadId) => {
            setNewLeadModalOpen(false);
            fetchLeads();
          }}
        />
      </Container>
    </>
  );
};

export default LeadsDashboard;
