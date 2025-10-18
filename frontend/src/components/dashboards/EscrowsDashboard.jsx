import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NewEscrowModal from '../forms/NewEscrowModal';
// Import our new extracted components
import EscrowHeroCard from './escrows/EscrowHeroCard';
import EscrowStatsCards from './escrows/EscrowStatsCards';
import EscrowNavigation from './escrows/EscrowNavigation';
import EscrowContent from './escrows/EscrowContent';
import EscrowDebugPanel from './escrows/EscrowDebugPanel';
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
  Storage,
  Refresh,
  Error as ErrorIcon,
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

// Styled Components - HeroSection moved to EscrowHeroCard.jsx
// StatCard component moved to EscrowStatsCards.jsx

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
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState('1M'); // '1D', '1M', '1Y', 'YTD', or null for custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
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

        {/* Hero Section with Stats - Using extracted component */}
        <EscrowHeroCard
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          dateRange={dateRange}
          detectPresetRange={detectPresetRange}
        >
          {/* Stats cards and other content that goes inside the hero */}
          {/* Left container: Stats Grid */}
          <Box sx={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0, // Allow shrinking
          }}>
            {/* Stats Grid - White Cards - Dynamic based on selected tab */}
            <EscrowStatsCards
              selectedStatus={selectedStatus}
              stats={stats}
              escrows={escrows}
              archivedCount={archivedCount}
              hasMorePages={hasMorePages}
            />

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
        </EscrowHeroCard>


      {/* Navigation Bar with Tabs and Controls */}
      <EscrowNavigation
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        scope={scope}
        setScope={setScope}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
        archivedCount={archivedCount}
      />

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


      {/* Prepare calendar data */}
      {(() => {
        // Organize escrows by date for calendar view
        const escrowsByDate = {};
        if (showCalendar) {
          const allEscrows = [...escrows, ...archivedEscrows];
          allEscrows.forEach(escrow => {
            const dates = [
              { date: escrow.openDate, type: 'Open', color: '#4caf50' },
              { date: escrow.closeDate || escrow.closingDate, type: 'Close', color: '#2196f3' },
              { date: escrow.inspectionDate, type: 'Inspection', color: '#ff9800' },
              { date: escrow.appraisalDate, type: 'Appraisal', color: '#9c27b0' },
            ].filter(d => d.date);

            dates.forEach(({ date, type, color }) => {
              const dateStr = safeFormatDate(date, 'yyyy-MM-dd');
              if (!escrowsByDate[dateStr]) escrowsByDate[dateStr] = [];
              escrowsByDate[dateStr].push({
                ...escrow,
                eventType: type,
                eventColor: color,
                propertyAddress: escrow.propertyAddress || escrow.property_address,
                clientName: escrow.buyerName || escrow.buyer_name || escrow.clientName,
                salePrice: escrow.purchasePrice || escrow.purchase_price || escrow.sale_price,
                status: escrow.escrowStatus || escrow.escrow_status
              });
            });
          });
        }

        return (
          <EscrowContent
            showCalendar={showCalendar}
            calendarDate={calendarDate}
            escrowsByDate={escrowsByDate}
            escrows={escrows}
            archivedEscrows={archivedEscrows}
            selectedStatus={selectedStatus}
            sortBy={sortBy}
            viewMode={viewMode}
            animationType={animationType}
            animationDuration={animationDuration}
            animationIntensity={animationIntensity}
            hasMorePages={hasMorePages}
            loading={loading}
            loadingMore={loadingMore}
            totalCount={totalCount}
            calendarDialogOpen={calendarDialogOpen}
            setCalendarDialogOpen={setCalendarDialogOpen}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            handleArchive={handleArchive}
            handleRestore={handleRestore}
            handlePermanentDelete={handlePermanentDelete}
            handleUpdateEscrow={handleUpdateEscrow}
            handleEscrowClick={handleEscrowClick}
            loadMoreEscrows={loadMoreEscrows}
            safeFormatDate={safeFormatDate}
          />
        );
      })()}

      {/* New Escrow Modal */}
      <NewEscrowModal
        open={showNewEscrowModal}
        onClose={() => setShowNewEscrowModal(false)}
        onSuccess={handleNewEscrowSuccess}
      />

      {/* Debug Panel - Admin Only */}
      <EscrowDebugPanel
        user={user}
        debugExpanded={debugExpanded}
        setDebugExpanded={setDebugExpanded}
        networkData={networkData}
        setNetworkData={setNetworkData}
        escrows={escrows}
        stats={stats}
        selectedStatus={selectedStatus}
        viewMode={viewMode}
      />
      </Container>
    </>
  );
};

export default EscrowsDashboard;
