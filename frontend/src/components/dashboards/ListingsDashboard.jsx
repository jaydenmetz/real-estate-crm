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
import { listingsAPI } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';
import NewListingModal from '../forms/NewListingModal';
import networkMonitor from '../../services/networkMonitor.service';
import { useWebSocket } from '../../hooks/useWebSocket';

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
    return saved || 'small';
  });
  const [sortBy, setSortBy] = useState('listing_date'); // Sort field
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
      console.log('WebSocket connected, real-time updates active');
    } else {
      console.log('WebSocket disconnected');
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

  const fetchListings = async (pageNum = 1, appendData = false) => {
    try {
      // Show appropriate loading state
      if (appendData) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
      }

      console.log(`Fetching listings... (page ${pageNum})`);

      // Fetch listings with pagination (50 per page for optimal performance)
      const response = await listingsAPI.getAll({
        includeArchived: true,
        page: pageNum,
        limit: 50
      });
      console.log('API Response:', response);

      if (response.success) {
        const allData = response.data.listings || response.data || [];
        const pagination = response.data.pagination || {};
        const totalPages = pagination.totalPages || 1;
        const totalRecords = pagination.total || allData.length;
        const hasMore = pageNum < totalPages;

        // Separate active and archived listings based on deleted_at field
        const listingData = allData.filter(listing => !listing.deleted_at && !listing.deletedAt);
        const archivedData = allData.filter(listing => listing.deleted_at || listing.deletedAt);

        console.log(`Page ${pageNum}/${totalPages} - Total: ${totalRecords}, Loaded: ${allData.length}, Active: ${listingData.length}, Archived: ${archivedData.length}`);

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

  const handleListingClick = (listingId) => {
    console.log('Listing clicked - ID:', listingId);
    navigate(`/listings/${listingId}`);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedListings.map(l => l.id));
    } else {
      setSelectedArchivedIds([]);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} listing${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await listingsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted listings from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedListings(prev => prev.filter(l => !deletedIds.has(l.id)));
        setListings(prev => prev.filter(l => !deletedIds.has(l.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active listings only
        const remainingListings = listings.filter(l => !deletedIds.has(l.id));
        calculateStats(remainingListings, selectedStatus);

        console.log(`Successfully permanently deleted ${response.data.deletedCount || selectedArchivedIds.length} listings`);
      }
    } catch (error) {
      console.error('Failed to batch delete listings:', error);
      alert('Failed to delete listings. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  };

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
                  Listings
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
                minWidth: 0, // Allow shrinking
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
                              icon={Home}
                              title="Total Active Listings"
                              value={stats.totalListings || 0}
                              color="#ffffff"
                              delay={0}
                              goal={20}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="New This Month"
                              value={stats.newThisMonth || 0}
                              color="#ffffff"
                              delay={1}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Total Value"
                              value={stats.totalValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={10000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Avg Days on Market"
                              value={stats.avgDaysOnMarket || 0}
                              color="#ffffff"
                              delay={3}
                              goal={30}
                            />
                          </Grid>
                        </>
                      );

                    case 'pending':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Home}
                              title="Total Pending Listings"
                              value={stats.pendingListings || 0}
                              color="#ffffff"
                              delay={0}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Pending This Month"
                              value={stats.pendingThisMonth || 0}
                              color="#ffffff"
                              delay={1}
                              goal={3}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Total Value"
                              value={stats.totalValue || 0}
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
                              title="Projected Commission"
                              value={stats.projectedCommission || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                              goal={125000}
                            />
                          </Grid>
                        </>
                      );

                    case 'sold':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Total Sold Listings"
                              value={stats.soldListings || 0}
                              color="#ffffff"
                              delay={0}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Sold This Year"
                              value={stats.soldThisYear || 0}
                              color="#ffffff"
                              delay={1}
                              goal={40}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Total Value"
                              value={stats.totalValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={15000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Total Commission"
                              value={stats.totalCommission || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                              goal={375000}
                            />
                          </Grid>
                        </>
                      );

                    case 'expired':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={ErrorIcon}
                              title="Total Expired Listings"
                              value={stats.expiredListings || 0}
                              color="#ffffff"
                              delay={0}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Expiration Rate"
                              value={stats.expirationRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingDown}
                              title="Lost Value"
                              value={stats.lostValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={1000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Avg Days Listed"
                              value={stats.avgDaysListed || 0}
                              color="#ffffff"
                              delay={3}
                              goal={90}
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
                              title="Total Archived Listings"
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
                              title="Total Value"
                              value={stats.totalValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Avg Days on Market"
                              value={stats.avgDaysOnMarket || 0}
                              color="#ffffff"
                              delay={3}
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
                              title="Total Listings"
                              value={stats.totalListings || 0}
                              color="#ffffff"
                              delay={0}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Active Listings"
                              value={stats.activeListings || 0}
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Total Value"
                              value={stats.totalValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Avg Days on Market"
                              value={stats.avgDaysOnMarket || 0}
                              color="#ffffff"
                              delay={3}
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
                  onClick={() => setNewListingModalOpen(true)}
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
                  Create New Listing
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
                  Listing Analytics
                </Button>
              </Box>
              </Box>

              {/* Right container: AI Assistant */}
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
                    background: 'linear-gradient(135deg, rgba(23, 63, 26, 0.12) 0%, rgba(51, 105, 55, 0.08) 100%)',
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
                      background: 'linear-gradient(135deg, rgba(23, 63, 26, 0.18) 0%, rgba(51, 105, 55, 0.12) 100%)',
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
                        AI Listings Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to automate listing tasks, send reminders, and manage showings.
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
            display: { xs: 'flex', lg: 'none' },
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
              <Tab label="Active Listings" value="active" />
              <Tab label="Pending Listings" value="pending" />
              <Tab label="Sold Listings" value="sold" />
              <Tab label="All Listings" value="all" />
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
            flex: '0 0 auto',
            marginLeft: 'auto',
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
                    listing_date: 'Listing Date',
                    list_price: 'Price',
                    property_address: 'Address',
                    days_on_market: 'Days on Market',
                    listing_status: 'Status',
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
                <MenuItem value="listing_date">Listing Date</MenuItem>
                <MenuItem value="list_price">Price</MenuItem>
                <MenuItem value="property_address">Address</MenuItem>
                <MenuItem value="days_on_market">Days on Market</MenuItem>
                <MenuItem value="listing_status">Status</MenuItem>
              </Select>
            </FormControl>

            {/* View Mode & Calendar Selector */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setViewMode(newValue);
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
            </ToggleButtonGroup>

            {/* Calendar Button */}
            <IconButton
              size="small"
              onClick={() => setCalendarDialogOpen(true)}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: alpha('#000', 0.06),
                '&:hover': {
                  backgroundColor: alpha('#000', 0.1),
                },
              }}
            >
              <CalendarToday sx={{ fontSize: 16 }} />
            </IconButton>

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
              <Tab label="Pending" value="pending" />
              <Tab label="Sold" value="sold" />
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
                      listing_date: 'Listing Date',
                      list_price: 'Price',
                      property_address: 'Address',
                      days_on_market: 'Days on Market',
                      listing_status: 'Status',
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
                  <MenuItem value="listing_date">Listing Date</MenuItem>
                  <MenuItem value="list_price">Price</MenuItem>
                  <MenuItem value="property_address">Address</MenuItem>
                  <MenuItem value="days_on_market">Days on Market</MenuItem>
                  <MenuItem value="listing_status">Status</MenuItem>
                </Select>
              </FormControl>

              {/* View Mode & Calendar - Mobile */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      setViewMode(newValue);
                    }
                  }}
                  size="small"
                  aria-label="View mode selection"
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
                </ToggleButtonGroup>

                {/* Calendar Button */}
                <IconButton
                  size="small"
                  onClick={() => setCalendarDialogOpen(true)}
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: alpha('#000', 0.04),
                    },
                  }}
                >
                  <CalendarToday sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

        {/* Listings Grid */}
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
              // Handle archived view separately
              if (selectedStatus === 'archived') {
                if (!archivedListings || archivedListings.length === 0) {
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
                        No archived listings
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Archived listings will appear here
                      </Typography>
                    </Paper>
                  );
                }

                return (
                  <>
                    {/* Batch Delete Controls */}
                    <Box sx={{
                      gridColumn: '1 / -1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      backgroundColor: alpha('#ff9800', 0.1),
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: alpha('#ff9800', 0.3),
                    }}>
                      <Checkbox
                        checked={selectedArchivedIds.length === archivedListings.length && archivedListings.length > 0}
                        indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedListings.length}
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
                          Delete {selectedArchivedIds.length} Listing{selectedArchivedIds.length > 1 ? 's' : ''}
                        </Button>
                      )}
                    </Box>

                    {archivedListings.map((listing, index) => {
                      const isSelected = selectedArchivedIds.includes(listing.id);

                      return (
                        <Box key={listing.id} sx={{ position: 'relative' }}>
                          {/* Selection checkbox */}
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedArchivedIds(prev => [...prev, listing.id]);
                              } else {
                                setSelectedArchivedIds(prev => prev.filter(id => id !== listing.id));
                              }
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              zIndex: 1,
                              backgroundColor: 'white',
                              borderRadius: '4px',
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
                              onClick={() => handleListingClick(listing.id)}
                              sx={{
                                cursor: 'pointer',
                                height: '100%',
                                minHeight: 200,
                                opacity: 0.7,
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'translateY(-4px)',
                                  boxShadow: 6,
                                },
                                transition: 'all 0.3s',
                                border: '2px solid',
                                borderColor: isSelected ? 'error.main' : 'transparent',
                              }}
                            >
                              <CardContent sx={{ pt: 5 }}>
                                <Typography variant="h6" gutterBottom>
                                  {listing.propertyAddress || listing.property_address || 'No Address'}
                                </Typography>
                                <Typography variant="h5" color="primary" gutterBottom>
                                  ${(listing.listPrice || listing.list_price || 0).toLocaleString()}
                                </Typography>
                                <Stack spacing={1}>
                                  <Chip
                                    label="Archived"
                                    size="small"
                                    color="warning"
                                  />
                                  <Typography variant="body2" color="textSecondary">
                                    MLS: {listing.mlsNumber || listing.mls_number || 'N/A'}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Box>
                      );
                    })}
                  </>
                );
              }

              // Regular listings view
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

              if (!sortedListings || sortedListings.length === 0) {
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
                      No {selectedStatus} listings found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedStatus === 'active' ? 'Create a new listing to get started' : `No ${selectedStatus} listings in the system`}
                    </Typography>
                  </Paper>
                );
              } else {
                return sortedListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => handleListingClick(listing.id)}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        minHeight: 200,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {listing.propertyAddress || listing.property_address || 'No Address'}
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          ${(listing.listPrice || listing.list_price || 0).toLocaleString()}
                        </Typography>
                        <Stack spacing={1}>
                          <Chip
                            label={listing.listingStatus || listing.listing_status || 'Unknown'}
                            size="small"
                            color="primary"
                          />
                          <Typography variant="body2" color="textSecondary">
                            MLS: {listing.mlsNumber || listing.mls_number || 'N/A'}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                ));
              }
            })()}
          </AnimatePresence>
        </Box>

        {/* Load More Button */}
        {hasMorePages && !loading && selectedStatus !== 'archived' && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            mb: 2
          }}>
            <Button
              variant="outlined"
              size="large"
              onClick={loadMoreListings}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={20} /> : <Refresh />}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              {loadingMore ? 'Loading...' : `Load More (${totalCount - listings.length} remaining)`}
            </Button>
          </Box>
        )}

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
