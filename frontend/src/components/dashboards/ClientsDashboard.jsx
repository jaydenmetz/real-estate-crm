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
  IconButton,
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
  Badge,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  CheckCircle,
  Add,
  Assessment,
  PersonAdd,
  Visibility,
  VisibilityOff,
  Schedule,
  CalendarToday,
  Delete as DeleteIcon,
  Sort,
  Archive as ArchiveIcon,
  Storage,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { clientsAPI } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';
import NewClientModal from '../forms/NewClientModal';
import networkMonitor from '../../services/networkMonitor.service';
import { useWebSocket } from '../../hooks/useWebSocket';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(8, 145, 178, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

// Enhanced animated stat card component with goal support and privacy toggle
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend, showPrivacy = false, goal }) => {
  const theme = useTheme();
  const [showValue, setShowValue] = useState(false);

  // Mask value for privacy
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

const ClientsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const [clients, setClients] = useState([]);
  const [archivedClients, setArchivedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('clientsViewMode');
    return saved || 'small';
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [animationType, setAnimationType] = useState('spring');
  const [animationDuration, setAnimationDuration] = useState(1);
  const [animationIntensity, setAnimationIntensity] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Date range filter state
  const [dateRangeFilter, setDateRangeFilter] = useState('1M'); // '1D', '1M', '1Y', 'YTD', or null for custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);

  // Network monitoring state
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
  });

  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    totalClientValue: 0,
    avgClientLifetime: 0,
    convertedLeads: 0,
    conversionRate: 0,
    potentialValue: 0,
    avgConversionTime: 0,
    totalInactive: 0,
    inactiveRate: 0,
    lostValue: 0,
    avgDaysInactive: 0,
    totalPortfolioValue: 0,
    avgTransactionsPerClient: 0,
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('clientsViewMode', viewMode);
  }, [viewMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl + K: Create new client
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setNewClientModalOpen(true);
        return;
      }

      // Cmd/Ctrl + F: Focus search (not implemented yet, but reserved)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        // Future: focus search input
        return;
      }

      // Cmd/Ctrl + R: Refresh clients
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        fetchClients();
        return;
      }

      // Cmd/Ctrl + A: Toggle select all (archived view only)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && selectedStatus === 'archived') {
        e.preventDefault();
        const allSelected = selectedArchivedIds.length === archivedClients.length;
        handleSelectAll(!allSelected);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [newClientModalOpen, selectedStatus, selectedArchivedIds.length, archivedClients.length]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'archived') {
      // Calculate stats for archived clients
      calculateStats(archivedClients, 'archived');
    } else if (clients.length > 0) {
      calculateStats(clients, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, clients, archivedClients, dateRangeFilter, customStartDate, customEndDate]);

  // Sync archived count with archived clients array
  useEffect(() => {
    setArchivedCount(archivedClients.length);
  }, [archivedClients]);

  // Network monitoring polling
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData({
        stats: networkMonitor.getStats(),
        requests: networkMonitor.getRequests(),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const websocketService = require('../../services/websocket.service').default;

    const unsubscribe = websocketService.on('data:update', (data) => {
      console.log('📡 WebSocket data update received:', data);

      if (data.entityType === 'client') {
        console.log('🔄 Refetching clients due to real-time update');
        fetchClients();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  const fetchClients = async (pageNum = 1, appendData = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      console.log('Fetching clients...');

      // Fetch clients with pagination (50 per page for optimal performance)
      const response = await clientsAPI.getAll({
        includeArchived: true,
        page: pageNum,
        limit: 50
      });
      console.log('API Response:', response);

      if (response.success) {
        const allData = response.data.clients || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        // Separate active and archived clients based on deleted_at field
        const clientData = allData.filter(client => !client.deleted_at && !client.deletedAt);
        const archivedData = allData.filter(client => client.deleted_at || client.deletedAt);

        console.log(`Page ${pageNum}/${totalPages} - Total: ${totalRecords}, Loaded: ${allData.length}, Active: ${clientData.length}, Archived: ${archivedData.length}`);

        // Update state based on whether we're appending or replacing
        if (appendData) {
          setClients(prev => [...prev, ...clientData]);
          setArchivedClients(prev => [...prev, ...archivedData]);
        } else {
          setClients(clientData);
          setArchivedClients(archivedData);
        }

        // Update pagination state
        setCurrentPage(pageNum);
        setHasMorePages(hasMore);
        setTotalCount(totalRecords);
        setArchivedCount(archivedData.length);

        // Calculate stats from currently loaded data only
        const currentClients = appendData ? [...clients, ...clientData] : clientData;
        calculateStats(currentClients, selectedStatus);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching clients:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreClients = useCallback(() => {
    if (!loadingMore && hasMorePages) {
      console.log(`Loading page ${currentPage + 1}...`);
      fetchClients(currentPage + 1, true);
    }
  }, [loadingMore, hasMorePages, currentPage]);

  // Check if custom dates match a preset range
  const detectPresetRange = (start, end) => {
    if (!start || !end) return null;

    const now = new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if it's today (1D)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    if (start.getTime() === todayStart.getTime() && end.getTime() === todayEnd.getTime()) {
      return '1D';
    }

    // Check if it's last 30 days (1M)
    if (diffDays >= 29 && diffDays <= 31) {
      return '1M';
    }

    // Check if it's last 365 days (1Y)
    if (diffDays >= 364 && diffDays <= 366) {
      return '1Y';
    }

    // Check if it's year to date (YTD)
    const ytdStart = new Date(now.getFullYear(), 0, 1);
    if (start.getTime() === ytdStart.getTime() && end.getDate() === now.getDate()) {
      return 'YTD';
    }

    return null; // Custom range
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
      // Use preset range
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

  const calculateStats = (clientData, statusFilter = 'active') => {
    if (!clientData || !Array.isArray(clientData)) {
      setStats({
        totalClients: 0,
        activeClients: 0,
        newThisMonth: 0,
        totalClientValue: 0,
        avgClientLifetime: 0,
        convertedLeads: 0,
        conversionRate: 0,
        potentialValue: 0,
        avgConversionTime: 0,
        totalInactive: 0,
        inactiveRate: 0,
        lostValue: 0,
        avgDaysInactive: 0,
        totalPortfolioValue: 0,
        avgTransactionsPerClient: 0,
      });
      return;
    }

    // Get date range for filtering
    const { startDate, endDate } = getDateRange();

    // Filter clients by date range (based on created_at)
    const dateFilteredClients = clientData.filter(c => {
      const createdDate = new Date(c.createdAt || c.created_at);
      return createdDate >= startDate && createdDate <= endDate;
    });

    let filteredClients = [];

    // Filter based on selected status
    switch (statusFilter) {
      case 'active':
        filteredClients = dateFilteredClients.filter(c =>
          c.clientStatus === 'Active' || c.client_status === 'Active' ||
          c.clientStatus === 'active' || c.client_status === 'active'
        );
        break;
      case 'lead':
        filteredClients = dateFilteredClients.filter(c =>
          c.clientStatus === 'Lead' || c.client_status === 'Lead' ||
          c.clientStatus === 'lead' || c.client_status === 'lead'
        );
        break;
      case 'inactive':
        filteredClients = dateFilteredClients.filter(c =>
          c.clientStatus === 'Inactive' || c.client_status === 'Inactive' ||
          c.clientStatus === 'inactive' || c.client_status === 'inactive'
        );
        break;
      default:
        filteredClients = dateFilteredClients;
    }

    // Calculate stats based on status
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Active clients stats
    const activeClients = clientData.filter(c =>
      c.clientStatus === 'Active' || c.client_status === 'Active' ||
      c.clientStatus === 'active' || c.client_status === 'active'
    );
    const newThisMonth = activeClients.filter(c => {
      const createdDate = new Date(c.createdAt || c.created_at);
      return createdDate >= startOfMonth;
    }).length;
    const totalClientValue = filteredClients.reduce((sum, c) => sum + Number(c.totalValue || c.total_value || 0), 0);
    const avgClientLifetime = filteredClients.length > 0 ? totalClientValue / filteredClients.length : 0;

    // Lead conversion stats
    const convertedLeads = clientData.filter(c =>
      (c.clientStatus === 'Active' || c.client_status === 'Active') &&
      (c.previousStatus === 'Lead' || c.previous_status === 'Lead')
    ).length;
    const totalLeads = clientData.filter(c =>
      c.clientStatus === 'Lead' || c.client_status === 'Lead'
    ).length;
    const conversionRate = (totalLeads + convertedLeads) > 0 ? (convertedLeads / (totalLeads + convertedLeads)) * 100 : 0;
    const potentialValue = totalLeads * 50000; // Mock: $50k potential per lead
    const avgConversionTime = 45; // Mock: 45 days average

    // Inactive stats
    const inactiveClients = clientData.filter(c =>
      c.clientStatus === 'Inactive' || c.client_status === 'Inactive'
    );
    const totalInactive = inactiveClients.length;
    const totalAllClients = clientData.length;
    const inactiveRate = totalAllClients > 0 ? (totalInactive / totalAllClients) * 100 : 0;
    const lostValue = inactiveClients.reduce((sum, c) => sum + Number(c.totalValue || c.total_value || 0), 0);
    const avgDaysInactive = 180; // Mock: 180 days average

    // All clients stats
    const totalPortfolioValue = clientData.reduce((sum, c) => sum + Number(c.totalValue || c.total_value || 0), 0);
    const totalTransactions = clientData.reduce((sum, c) => sum + Number(c.totalTransactions || c.total_transactions || 0), 0);
    const avgTransactionsPerClient = clientData.length > 0 ? totalTransactions / clientData.length : 0;

    setStats({
      totalClients: filteredClients.length,
      activeClients: activeClients.length,
      newThisMonth,
      totalClientValue,
      avgClientLifetime,
      convertedLeads,
      conversionRate,
      potentialValue,
      avgConversionTime,
      totalInactive,
      inactiveRate,
      lostValue,
      avgDaysInactive,
      totalPortfolioValue,
      avgTransactionsPerClient,
    });
  };

  const handleClientClick = (clientId) => {
    console.log('Client clicked - ID:', clientId);
    navigate(`/clients/${clientId}`);
  };

  // Batch delete handler
  const handleBatchDelete = async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} client${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await clientsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted clients from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedClients(prev => prev.filter(c => !deletedIds.has(c.id)));
        setClients(prev => prev.filter(c => !deletedIds.has(c.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active clients only
        const remainingClients = clients.filter(c => !deletedIds.has(c.id));
        calculateStats(remainingClients, selectedStatus);
      }
    } catch (error) {
      console.error('Error batch deleting clients:', error);
      alert('Failed to delete clients. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedClients.map(c => c.id));
    } else {
      setSelectedArchivedIds([]);
    }
  };

  const handleSelectClient = (clientId, checked) => {
    if (checked) {
      setSelectedArchivedIds(prev => [...prev, clientId]);
    } else {
      setSelectedArchivedIds(prev => prev.filter(id => id !== clientId));
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
                  Clients
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
                    case 'active':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={People}
                              title="Total Active Clients"
                              value={stats.totalClients || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={PersonAdd}
                              title="New This Month"
                              value={stats.newThisMonth || 0}
                              color="#ffffff"
                              delay={1}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Total Client Value"
                              value={stats.totalClientValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={5000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Avg Client Lifetime"
                              value={(stats.avgClientLifetime || 0) / 1000}
                              prefix="$"
                              suffix="K"
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                              goal={50}
                            />
                          </Grid>
                        </>
                      );

                    case 'lead':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Converted Leads"
                              value={stats.convertedLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={25}
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
                              icon={AttachMoney}
                              title="Potential Value"
                              value={stats.potentialValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={2000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Avg Conversion Time"
                              value={stats.avgConversionTime || 0}
                              suffix=" days"
                              color="#ffffff"
                              delay={3}
                            />
                          </Grid>
                        </>
                      );

                    case 'inactive':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={People}
                              title="Total Inactive"
                              value={stats.totalInactive || 0}
                              color="#ffffff"
                              delay={0}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingDown}
                              title="Inactive Rate"
                              value={stats.inactiveRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Lost Value"
                              value={stats.lostValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Avg Days Inactive"
                              value={stats.avgDaysInactive || 0}
                              suffix=" days"
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
                              title="Total Archived Clients"
                              value={archivedCount || 0}
                              color="#ffffff"
                              delay={0}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Storage}
                              title="Max Archived"
                              value={`${archivedCount || 0}/1000`}
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Total Lifetime Value"
                              value={stats.totalClientValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              showPrivacy={true}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Avg Client Age"
                              value={stats.avgClientLifetime ? `${Math.round(stats.avgClientLifetime / 365)}` : '0'}
                              suffix=" days"
                              color="#ffffff"
                              delay={3}
                            />
                          </Grid>
                        </>
                      );

                    default: // 'all' status
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={People}
                              title="Total Clients"
                              value={stats.totalClients || 0}
                              color="#ffffff"
                              delay={0}
                              goal={150}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Active Clients"
                              value={stats.activeClients || 0}
                              color="#ffffff"
                              delay={1}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Total Portfolio Value"
                              value={stats.totalPortfolioValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              showPrivacy={true}
                              goal={10000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Avg Transactions/Client"
                              value={stats.avgTransactionsPerClient || 0}
                              color="#ffffff"
                              delay={3}
                              goal={5}
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
                  onClick={() => setNewClientModalOpen(true)}
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
                  Add New Client
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
                  Client Analytics
                </Button>
              </Box>
              </Box>

              {/* Right container: AI Client Manager */}
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
                    background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
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
                      background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
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
                        AI Client Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to manage client relationships, send reminders, and track touchpoints.
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
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
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
              <Tab label="Active Clients" value="active" />
              <Tab label="Leads" value="lead" />
              <Tab label="Inactive" value="inactive" />
              <Tab label="All Clients" value="all" />
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
                    created_at: 'Date Added',
                    last_contact: 'Last Contact',
                    name: 'Name',
                    total_value: 'Total Value',
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
                <MenuItem value="created_at">Date Added</MenuItem>
                <MenuItem value="last_contact">Last Contact</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="total_value">Total Value</MenuItem>
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
              <Tab label="Active" value="active" />
              <Tab label="Leads" value="lead" />
              <Tab label="Inactive" value="inactive" />
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
                      created_at: 'Date Added',
                      last_contact: 'Last Contact',
                      name: 'Name',
                      total_value: 'Total Value',
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
                  <MenuItem value="created_at">Date Added</MenuItem>
                  <MenuItem value="last_contact">Last Contact</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="total_value">Total Value</MenuItem>
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

        {/* Clients Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr',
            lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr',
          },
          gap: 3,
          width: '100%',
        }}>
          <AnimatePresence>
            {(() => {
              // Use archived clients for archived view, otherwise use active clients
              const sourceClients = selectedStatus === 'archived' ? archivedClients : clients;

              const filteredClients = sourceClients.filter(c => {
                switch (selectedStatus) {
                  case 'active':
                    return c.clientStatus === 'Active' || c.client_status === 'Active' ||
                           c.clientStatus === 'active' || c.client_status === 'active';
                  case 'lead':
                    return c.clientStatus === 'Lead' || c.client_status === 'Lead' ||
                           c.clientStatus === 'lead' || c.client_status === 'lead';
                  case 'inactive':
                    return c.clientStatus === 'Inactive' || c.client_status === 'Inactive' ||
                           c.clientStatus === 'inactive' || c.client_status === 'inactive';
                  case 'archived':
                    return true; // Show all archived clients
                  case 'all':
                    return true;
                  default:
                    return true;
                }
              });

              // Sort clients based on sortBy state
              const sortedClients = [...filteredClients].sort((a, b) => {
                let aVal, bVal;

                switch(sortBy) {
                  case 'created_at':
                    aVal = new Date(a.createdAt || a.created_at || 0);
                    bVal = new Date(b.createdAt || b.created_at || 0);
                    return bVal - aVal;
                  case 'last_contact':
                    aVal = new Date(a.lastContact || a.last_contact || 0);
                    bVal = new Date(b.lastContact || b.last_contact || 0);
                    return bVal - aVal;
                  case 'name':
                    aVal = `${a.firstName || a.first_name || ''} ${a.lastName || a.last_name || ''}`.toLowerCase();
                    bVal = `${b.firstName || b.first_name || ''} ${b.lastName || b.last_name || ''}`.toLowerCase();
                    return aVal.localeCompare(bVal);
                  case 'total_value':
                    aVal = Number(a.totalValue || a.total_value || 0);
                    bVal = Number(b.totalValue || b.total_value || 0);
                    return bVal - aVal;
                  case 'client_status':
                    aVal = (a.clientStatus || a.client_status || '').toLowerCase();
                    bVal = (b.clientStatus || b.client_status || '').toLowerCase();
                    return aVal.localeCompare(bVal);
                  default:
                    return 0;
                }
              });

              if (!sortedClients || sortedClients.length === 0) {
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
                      No {selectedStatus} clients found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedStatus === 'active' ? 'Add a new client to get started' : `No ${selectedStatus} clients in the system`}
                    </Typography>
                  </Paper>
                );
              } else {
                // Show batch selection controls in archived view
                const elements = [];

                if (selectedStatus === 'archived') {
                  elements.push(
                    <Box
                      key="batch-controls"
                      sx={{
                        gridColumn: '1 / -1',
                        mb: 2,
                        p: 2,
                        backgroundColor: alpha('#f97316', 0.1),
                        border: `1px solid ${alpha('#f97316', 0.3)}`,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Checkbox
                        checked={selectedArchivedIds.length === archivedClients.length && archivedClients.length > 0}
                        indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedClients.length}
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
                          Delete {selectedArchivedIds.length} Client{selectedArchivedIds.length > 1 ? 's' : ''}
                        </Button>
                      )}
                    </Box>
                  );
                }

                // Add client cards
                sortedClients.forEach((client, index) => {
                  const isSelected = selectedArchivedIds.includes(client.id);

                  elements.push(
                    <Box key={client.id} sx={{ position: 'relative' }}>
                      {/* Selection checkbox for archived view */}
                      {selectedStatus === 'archived' && (
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectClient(client.id, e.target.checked)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 10,
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          onClick={() => !isSelected && handleClientClick(client.id)}
                          sx={{
                            cursor: 'pointer',
                            height: '100%',
                            minHeight: 200,
                            opacity: isSelected ? 0.7 : 1,
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 6,
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {`${client.firstName || client.first_name || ''} ${client.lastName || client.last_name || ''}`}
                            </Typography>
                            <Stack spacing={1}>
                              <Chip
                                label={client.clientStatus || client.client_status || 'Unknown'}
                                size="small"
                                color="primary"
                              />
                              <Typography variant="body2" color="textSecondary">
                                Email: {client.email || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Phone: {client.phone || 'N/A'}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Box>
                  );
                });

                return elements;
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
                onClick={loadMoreClients}
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
                {loadingMore ? 'Loading...' : `Load More (${totalCount - clients.length} remaining)`}
              </Button>
            </Box>
          )}
        </Box>

        {/* Calendar Dialog (placeholder for future implementation) */}
        <Dialog
          open={calendarDialogOpen}
          onClose={() => setCalendarDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Calendar View</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ p: 3, textAlign: 'center' }}>
              Calendar view coming soon...
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalendarDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* New Client Modal */}
        <NewClientModal
          open={newClientModalOpen}
          onClose={() => setNewClientModalOpen(false)}
          onSuccess={(newClientId) => {
            setNewClientModalOpen(false);
            fetchClients();
          }}
        />
      </Container>
    </>
  );
};

export default ClientsDashboard;
