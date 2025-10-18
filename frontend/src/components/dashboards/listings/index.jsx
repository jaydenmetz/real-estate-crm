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
  useTheme,
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
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Home,
  CheckCircle,
  Add,
  Assessment,
  Archive as ArchiveIcon,
  Visibility,
  VisibilityOff,
  Schedule,
  CalendarToday,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  Sort,
  Storage,
  Refresh,
  NetworkCheck,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format as formatDate } from 'date-fns';
import { listingsAPI } from '../../../services/api.service';
import { useAuth } from '../../../contexts/AuthContext';
import NewListingModal from '../../forms/NewListingModal';
import networkMonitor from '../../../services/networkMonitor.service';
import ListingCard from '../../common/widgets/ListingCard';
import { useWebSocket } from '../../../hooks/useWebSocket';
import ListingHeroCard from './components/ListingHeroCard';
import ListingNavigation from './components/ListingNavigation';
import ListingContent from './components/ListingContent';
import ListingStatsGrid from './components/ListingStatsGrid';
import { useListingHandlers } from './hooks/useListingHandlers';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(46, 125, 50, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

// Enhanced animated stat card component with new layout structure
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend, showPrivacy = false, goal }) => {
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

const ListingsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connectionStatus } = useWebSocket();
  const [listings, setListings] = useState([]);
  const [archivedListings, setArchivedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('listingsViewMode');
    return saved || 'large';
  });
  const [sortBy, setSortBy] = useState('listing_date'); // Sort field
  const [scope, setScope] = useState(() => {
    const saved = localStorage.getItem('listingsScope');
    return saved || 'team';
  }); // 'brokerage', 'team', 'user'
  const [dateRangeFilter, setDateRangeFilter] = useState('1M'); // '1D', '1M', '1Y', 'YTD', or null for custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [newListingModalOpen, setNewListingModalOpen] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });
  const maxArchivedLimit = 100;
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalValue: 0,
    avgDaysOnMarket: 0,
    newThisMonth: 0,
    pendingListings: 0,
    pendingThisMonth: 0,
    projectedCommission: 0,
    soldListings: 0,
    soldThisYear: 0,
    totalCommission: 0,
    expiredListings: 0,
    expirationRate: 0,
    lostValue: 0,
    avgDaysListed: 0,
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('listingsViewMode', viewMode);
  }, [viewMode]);

  // Save scope to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('listingsScope', scope);
  }, [scope]);

  // PHASE 6: Refetch listings when scope changes
  useEffect(() => {
    fetchListings();
  }, [scope]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl key combinations
      if (e.metaKey || e.ctrlKey) {
        switch(e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            setNewListingModalOpen(true);
            break;
          case 'f':
            e.preventDefault();
            // Focus search if exists (can add search later)
            break;
          case 'r':
            e.preventDefault();
            fetchListings();
            break;
          case 'a':
            e.preventDefault();
            if (selectedStatus === 'archived' && archivedListings.length > 0) {
              // Toggle select all
              if (selectedArchivedIds.length === archivedListings.length) {
                setSelectedArchivedIds([]);
              } else {
                setSelectedArchivedIds(archivedListings.map(l => l.id));
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
  }, [selectedStatus, archivedListings, selectedArchivedIds, newListingModalOpen]);

  // Network monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData({
        stats: networkMonitor.getStats(),
        requests: networkMonitor.getRequests(),
        errors: networkMonitor.getErrors()
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket real-time updates
  useEffect(() => {
    if (isConnected) {
      // console.log('WebSocket connected, real-time updates active');
    } else {
      // console.log('WebSocket disconnected');
    }
  }, [isConnected]);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'archived') {
      // Calculate stats for archived listings
      calculateStats(archivedListings, 'archived');
    } else if (listings.length > 0) {
      calculateStats(listings, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, listings, archivedListings, dateRangeFilter, customStartDate, customEndDate]);

  // Check if dates are the same day
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

    // 1D - Today only
    if (isSameDay(start, today) && isSameDay(end, today)) {
      return '1D';
    }

    // 1M - Last 30 days
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    oneMonthAgo.setHours(0, 0, 0, 0);
    if (isSameDay(start, oneMonthAgo) && isSameDay(end, today)) {
      return '1M';
    }

    // 1Y - Last 365 days
    const oneYearAgo = new Date(now);
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0, 0);
    if (isSameDay(start, oneYearAgo) && isSameDay(end, today)) {
      return '1Y';
    }

    // YTD - Start of year to today
    const yearStart = new Date(now.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);
    if (isSameDay(start, yearStart) && isSameDay(end, today)) {
      return 'YTD';
    }

    return null;
  };

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

      return { startDate, endDate };
    }

    // Calculate preset range
    switch (dateRangeFilter) {
      case '1D':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '1M':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '1Y':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 365);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const websocketService = require('../../../services/websocket.service').default;

    const unsubscribe = websocketService.on('data:update', (data) => {
      // console.log('📡 WebSocket data update received:', data);

      if (data.entityType === 'listing') {
        // console.log('🔄 Refetching listings due to real-time update');
        fetchListings();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  const fetchListings = async (pageNum = 1, appendData = false) => {
    try {
      // Show appropriate loading state
      if (appendData) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
      }

      // console.log(`Fetching listings... (page ${pageNum})`);

      // Fetch listings with pagination (50 per page for optimal performance)
      // PHASE 6: Include scope filter (brokerage, team, user)
      const response = await listingsAPI.getAll({
        includeArchived: true,
        page: pageNum,
        limit: 50,
        scope: scope // Pass scope from state
      });
      // console.log('API Response:', response);

      if (response.success) {
        const allData = response.data.listings || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        // Separate active and archived listings based on deleted_at field
        const listingData = allData.filter(listing => !listing.deleted_at && !listing.deletedAt);
        const archivedData = allData.filter(listing => listing.deleted_at || listing.deletedAt);

        // console.log(`Page ${pageNum}/${totalPages} - Total: ${totalRecords}, Loaded: ${allData.length}, Active: ${listingData.length}, Archived: ${archivedData.length}`);

        // Update state based on whether we're appending or replacing
        if (appendData) {
          setListings(prev => [...prev, ...listingData]);
          setArchivedListings(prev => [...prev, ...archivedData]);
        } else {
          setListings(listingData);
          setArchivedListings(archivedData);
        }

        // Update pagination state
        setCurrentPage(pageNum);
        setHasMorePages(hasMore);
        setTotalCount(totalRecords);
        setArchivedCount(archivedData.length);

        // Calculate stats from currently loaded data only
        const currentListings = appendData ? [...listings, ...listingData] : listingData;
        calculateStats(currentListings, selectedStatus);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching listings:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreListings = () => {
    if (!loadingMore && hasMorePages) {
      fetchListings(currentPage + 1, true);
    }
  };

  const calculateStats = (listingData, statusFilter = 'active') => {
    if (!listingData || !Array.isArray(listingData)) {
      setStats({
        totalListings: 0,
        activeListings: 0,
        totalValue: 0,
        avgDaysOnMarket: 0,
        newThisMonth: 0,
        pendingListings: 0,
        pendingThisMonth: 0,
        projectedCommission: 0,
        soldListings: 0,
        soldThisYear: 0,
        totalCommission: 0,
        expiredListings: 0,
        expirationRate: 0,
        lostValue: 0,
        avgDaysListed: 0,
      });
      return;
    }

    // Get date range for filtering
    const dateRange = getDateRange();

    // Filter by date range if applicable
    let dateFilteredListings = listingData;
    if (dateRange.startDate && dateRange.endDate) {
      dateFilteredListings = listingData.filter(listing => {
        const listingDate = new Date(listing.listingDate || listing.listing_date);
        return listingDate >= dateRange.startDate && listingDate <= dateRange.endDate;
      });
    }

    let filteredListings = [];

    // Filter based on selected status
    switch (statusFilter) {
      case 'active':
        filteredListings = dateFilteredListings.filter(l =>
          l.listingStatus === 'Active' ||
          l.listing_status === 'Active' ||
          l.listingStatus === 'active' ||
          l.listing_status === 'active'
        );
        break;
      case 'pending':
        filteredListings = dateFilteredListings.filter(l =>
          l.listingStatus === 'Pending' ||
          l.listing_status === 'Pending' ||
          l.listingStatus === 'pending' ||
          l.listing_status === 'pending'
        );
        break;
      case 'sold':
        filteredListings = dateFilteredListings.filter(l =>
          l.listingStatus === 'Sold' ||
          l.listing_status === 'Sold' ||
          l.listingStatus === 'sold' ||
          l.listing_status === 'sold'
        );
        break;
      case 'expired':
        filteredListings = dateFilteredListings.filter(l =>
          l.listingStatus === 'Expired' ||
          l.listing_status === 'Expired' ||
          l.listingStatus === 'expired' ||
          l.listing_status === 'expired'
        );
        break;
      case 'archived':
        // For archived, just use all the data since it's already filtered
        filteredListings = dateFilteredListings;
        break;
      default:
        filteredListings = dateFilteredListings;
    }

    // Calculate stats for filtered listings
    const totalValue = filteredListings.reduce((sum, l) => sum + Number(l.listPrice || l.list_price || 0), 0);

    // Calculate average days on market
    const now = new Date();
    const avgDaysOnMarket = filteredListings.length > 0 ? Math.round(
      filteredListings.reduce((sum, l) => {
        const listingDate = new Date(l.listingDate || l.listing_date);
        const days = Math.floor((now - listingDate) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / filteredListings.length
    ) : 0;

    // Calculate month-specific stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newThisMonth = filteredListings.filter(l => {
      const listingDate = new Date(l.listingDate || l.listing_date);
      return listingDate >= thisMonth;
    }).length;

    // Calculate projected commission (2.5% of total value)
    const projectedCommission = totalValue * 0.025;

    // Calculate this year stats
    const thisYear = new Date().getFullYear();
    const soldThisYear = listingData.filter(l => {
      const isSold = l.listingStatus === 'Sold' || l.listing_status === 'Sold' ||
                     l.listingStatus === 'sold' || l.listing_status === 'sold';
      if (!isSold) return false;
      const soldDate = new Date(l.closeDate || l.close_date || l.listingDate || l.listing_date);
      return soldDate.getFullYear() === thisYear;
    }).length;

    // Calculate total commission (from sold listings)
    const soldListings = listingData.filter(l =>
      l.listingStatus === 'Sold' || l.listing_status === 'Sold' ||
      l.listingStatus === 'sold' || l.listing_status === 'sold'
    );
    const totalSoldValue = soldListings.reduce((sum, l) => sum + Number(l.listPrice || l.list_price || 0), 0);
    const totalCommission = totalSoldValue * 0.025;

    // Calculate expiration rate
    const totalListings = listingData.length;
    const expiredListings = listingData.filter(l =>
      l.listingStatus === 'Expired' || l.listing_status === 'Expired' ||
      l.listingStatus === 'expired' || l.listing_status === 'expired'
    );
    const expirationRate = totalListings > 0 ? ((expiredListings.length / totalListings) * 100).toFixed(1) : 0;

    // Calculate lost value (from expired listings)
    const lostValue = expiredListings.reduce((sum, l) => sum + Number(l.listPrice || l.list_price || 0), 0);

    // Calculate average days listed for expired
    const avgDaysListed = expiredListings.length > 0 ? Math.round(
      expiredListings.reduce((sum, l) => {
        const listingDate = new Date(l.listingDate || l.listing_date);
        const expiryDate = new Date(l.expirationDate || l.expiration_date || now);
        const days = Math.floor((expiryDate - listingDate) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / expiredListings.length
    ) : 0;

    // Calculate pending this month
    const pendingListings = listingData.filter(l =>
      l.listingStatus === 'Pending' || l.listing_status === 'Pending' ||
      l.listingStatus === 'pending' || l.listing_status === 'pending'
    );
    const pendingThisMonth = pendingListings.filter(l => {
      const listingDate = new Date(l.listingDate || l.listing_date);
      return listingDate >= thisMonth;
    }).length;

    setStats({
      totalListings: filteredListings.length,
      activeListings: filteredListings.length,
      totalValue,
      avgDaysOnMarket,
      newThisMonth,
      pendingListings: pendingListings.length,
      pendingThisMonth,
      projectedCommission,
      soldListings: soldListings.length,
      soldThisYear,
      totalCommission,
      expiredListings: expiredListings.length,
      expirationRate: parseFloat(expirationRate),
      lostValue,
      avgDaysListed,
    });
  };

  // Use listing handlers hook (must be after function definitions above)
  const handlers = useListingHandlers({
    listings,
    setListings,
    archivedListings,
    setArchivedListings,
    setArchivedCount,
    selectedStatus,
    calculateStats,
    fetchListings,
    selectedArchivedIds,
    setSelectedArchivedIds,
    setBatchDeleting,
  });

  // Filter and sort listings for display
  const filteredListings = listings.filter(l => {
    switch (selectedStatus) {
      case 'active':
        return l.listingStatus === 'Active' || l.listing_status === 'Active' ||
               l.listingStatus === 'active' || l.listing_status === 'active';
      case 'pending':
        return l.listingStatus === 'Pending' || l.listing_status === 'Pending' ||
               l.listingStatus === 'pending' || l.listing_status === 'pending';
      case 'sold':
        return l.listingStatus === 'Sold' || l.listing_status === 'Sold' ||
               l.listingStatus === 'sold' || l.listing_status === 'sold';
      case 'expired':
        return l.listingStatus === 'Expired' || l.listing_status === 'Expired' ||
               l.listingStatus === 'expired' || l.listing_status === 'expired';
      default:
        return true;
    }
  });

  // Sort listings based on sortBy state
  const sortedListings = [...filteredListings].sort((a, b) => {
    let aVal, bVal;

    switch(sortBy) {
      case 'listing_date':
        aVal = new Date(a.listingDate || a.listing_date || 0);
        bVal = new Date(b.listingDate || b.listing_date || 0);
        return bVal - aVal; // Newest first
      case 'list_price':
        aVal = Number(a.listPrice || a.list_price || 0);
        bVal = Number(b.listPrice || b.list_price || 0);
        return bVal - aVal; // Highest first
      case 'property_address':
        aVal = (a.propertyAddress || a.property_address || '').toLowerCase();
        bVal = (b.propertyAddress || b.property_address || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      case 'days_on_market':
        const nowDate = new Date();
        const aDays = a.listingDate ? Math.floor((nowDate - new Date(a.listingDate)) / (1000 * 60 * 60 * 24)) : 0;
        const bDays = b.listingDate ? Math.floor((nowDate - new Date(b.listingDate)) / (1000 * 60 * 60 * 24)) : 0;
        return bDays - aDays; // Most days first
      case 'listing_status':
        aVal = (a.listingStatus || a.listing_status || '').toLowerCase();
        bVal = (b.listingStatus || b.listing_status || '').toLowerCase();
        return aVal.localeCompare(bVal); // A-Z
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const dateRange = getDateRange();

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section with Stats */}
        <ListingHeroCard
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          dateRange={dateRange}
          detectPresetRange={detectPresetRange}
        >
          {/* Stats Grid passed as children */}
          <ListingStatsGrid
            selectedStatus={selectedStatus}
            stats={stats}
            archivedCount={archivedCount}
            maxArchivedLimit={maxArchivedLimit}
            setNewListingModalOpen={setNewListingModalOpen}
          />
        </ListingHeroCard>

        {/* Navigation Bar */}
        <ListingNavigation
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          scope={scope}
          setScope={setScope}
          setCalendarDialogOpen={setCalendarDialogOpen}
          archivedCount={archivedCount}
        />

        {/* Main Content */}
        <ListingContent
          loading={loading}
          selectedStatus={selectedStatus}
          viewMode={viewMode}
          sortedListings={sortedListings}
          archivedListings={archivedListings}
          handleListingClick={handlers.handleListingClick}
          handleArchive={handlers.handleArchive}
          handleRestore={handlers.handleRestore}
          handleUpdateListing={handlers.handleUpdateListing}
          loadingMore={loadingMore}
          hasMorePages={hasMorePages}
          handleLoadMore={loadMoreListings}
          selectedArchivedIds={selectedArchivedIds}
          setSelectedArchivedIds={setSelectedArchivedIds}
          handleBatchDelete={handlers.handleBatchDelete}
          batchDeleting={batchDeleting}
          handleSelectAll={handlers.handleSelectAll}
          totalCount={totalCount}
        />

        {/* New Listing Modal */}
        <NewListingModal
          open={newListingModalOpen}
          onClose={() => setNewListingModalOpen(false)}
          onSuccess={(newListing) => {
            setNewListingModalOpen(false);
            fetchListings();
          }}
        />

        {/* Calendar Dialog */}
        <Dialog
          open={calendarDialogOpen}
          onClose={() => setCalendarDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Calendar View
            <IconButton
              onClick={() => setCalendarDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              ✕
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary">
              Calendar view coming soon. View your listings by listing date, close date, or expiration date.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalendarDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};


export default ListingsDashboard;
