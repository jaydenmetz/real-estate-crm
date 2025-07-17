// frontend/src/components/dashboards/EscrowsDashboard.jsx

import React, { useState } from 'react';
import { safeParseDate } from '../../utils/safeDateUtils';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Skeleton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Fade,
  Zoom,
  Stack,
  Avatar,
  AvatarGroup,
  useTheme,
  alpha,
  Collapse,
  CardActions,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Add,
  FilterList,
  Download,
  MoreVert,
  Home,
  People,
  AttachMoney,
  CalendarToday,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Gavel,
  ViewModule,
  ViewCarousel,
  Visibility,
  VisibilityOff,
  LocationOn,
  Business,
  Receipt,
  AccountBalance,
  Description,
  Timeline,
  Assignment,
  ExpandMore,
  Speed,
  Timer,
  AutoAwesome,
  Star,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays } from 'date-fns';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { useNavigate } from 'react-router-dom';
import { api, escrowsAPI } from '../../services/api';
import EscrowFormSimple from '../forms/EscrowFormSimple';
import EscrowCreated from '../common/EscrowCreated';
import StatsFullView from '../common/StatsFullView';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '300px',
  padding: theme.spacing(6, 0, 4),
  background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/patterns/escrow-pattern.svg")',
    opacity: 0.1,
  },
}));

const StyledStatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .stats-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: theme.palette[color].main,
    opacity: 0.05,
  },
}));

const EscrowCard = styled(Card)(({ theme, status }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.6s ease-out`,
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[12],
    '& .property-image': {
      transform: 'scale(1.05)',
    },
    '& .action-buttons': {
      opacity: 1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: status === 'Active' ? theme.palette.success.main :
                status === 'Pending' ? theme.palette.warning.main :
                status === 'Closing' ? theme.palette.info.main :
                theme.palette.grey[400],
  },
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  ...(status === 'Active' && {
    background: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.dark,
  }),
  ...(status === 'Pending' && {
    background: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.dark,
  }),
  ...(status === 'Closing' && {
    background: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.dark,
  }),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
  color: 'white',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'linear-gradient(135deg, #42A5F5 0%, #1565C0 100%)',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

// Empty data for fresh start
const mockEscrows = [];

const EscrowsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [createdEscrowData, setCreatedEscrowData] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'carousel'
  const [statusFilter, setStatusFilter] = useState('Active'); // Default to Active
  const [showCommission, setShowCommission] = useState(() => {
    // Load commission visibility preference from localStorage
    const saved = localStorage.getItem('showCommission');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showStatsFullView, setShowStatsFullView] = useState(false);
  const [editingEscrow, setEditingEscrow] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Save commission visibility preference when it changes
  const handleCommissionToggle = (checked) => {
    setShowCommission(checked);
    localStorage.setItem('showCommission', JSON.stringify(checked));
  };

  // Determine which status tab is active
  const status = ['all', 'Active', 'Pending', 'Closing', 'Closed'][tabValue];

  // Query with fallback to mock data
  const { data, isLoading, error } = useQuery(
    ['escrows', status],
    async () => {
      try {
        const response = await escrowsAPI.getAll(status === 'all' ? {} : { status });
        console.log('Dashboard API Response:', response); // Debug log
        // The API returns { success: true, data: { escrows: [...], pagination: {...} } }
        if (response.success && response.data) {
          return response.data;
        }
        // Fallback for different response structures
        return response.data || response;
      } catch (err) {
        console.error('Dashboard API error:', err);
        return { escrows: mockEscrows };
      }
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  // Use mock data if API fails
  const escrows = data?.escrows || mockEscrows;

  // Calculate stats
  const stats = {
    totalActive: escrows.filter(e => e.escrowStatus === 'Active').length,
    closingThisWeek: escrows.filter(e => {
      if (!e.closingDate) return false;
      try {
        const closeDate = new Date(e.closingDate);
        if (isNaN(closeDate.getTime())) return false;
        const days = differenceInDays(closeDate, new Date());
        return days >= 0 && days <= 7;
      } catch {
        return false;
      }
    }).length,
    totalVolume: escrows.reduce((sum, e) => sum + e.purchasePrice, 0),
    avgDaysToClose: Math.round(
      escrows.filter(e => e.daysToClose > 0).reduce((sum, e) => sum + e.daysToClose, 0) / 
      escrows.filter(e => e.daysToClose > 0).length || 0
    ),
  };

  // Filter escrows based on status filter
  const getFilteredEscrows = () => {
    if (!statusFilter) return escrows;
    return escrows.filter(e => e.escrowStatus?.toLowerCase() === statusFilter?.toLowerCase());
  };

  // Mutation for creating escrow
  const mutation = useMutation(
    async (escrowData) => {
      try {
        return api.post('/escrows', escrowData);
      } catch (error) {
        // Fallback to mock implementation if API fails
        console.log('API failed, using mock implementation');
          // Return empty response for mock create
          return { data: { data: null } };
      }
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('escrows');
        
        // Show success page
        const newEscrow = response.data?.data || response.data;
        setCreatedEscrowData(newEscrow);
        setShowSuccessPage(true);
        handleCloseForm();
      },
      onError: (error) => {
        console.error('Escrow mutation error:', error);
          // Don't create mock data on error
          enqueueSnackbar('Failed to create escrow. Please try again.', { variant: 'error' });
      },
    }
  );

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingEscrow(null);
  };

  const handleEdit = (escrow, event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setEditingEscrow(escrow);
    setOpenForm(true);
  };

  const handleCardClick = (escrow) => {
    navigate(`/escrows/${escrow.id}`);
  };

  const handleMenuOpen = (event, escrow) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCard(escrow);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCard(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Closing': return 'info';
      case 'Closed': return 'default';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStageIcon = (stage) => {
    const icons = {
      'Contract': <CheckCircle />,
      'Inspection': <Home />,
      'Appraisal': <AttachMoney />,
      'Loan Processing': <Schedule />,
      'Final Walkthrough': <People />,
      'Closing': <Gavel />,
    };
    return icons[stage] || <TrendingUp />;
  };

  const calculateDaysToClose = (closingDate) => {
    if (!closingDate) return null;
    try {
      const closeDate = new Date(closingDate);
      if (isNaN(closeDate.getTime())) return null;
      const days = differenceInDays(closeDate, new Date());
      return days;
    } catch {
      return null;
    }
  };

  const handleEditFromSuccess = (escrowData) => {
    setShowSuccessPage(false);
    setEditingEscrow(escrowData);
    setOpenForm(true);
  };

  const handleViewDetailsFromSuccess = (escrowId) => {
    navigate(`/escrows/${escrowId}`);
  };

  const handleBackFromSuccess = () => {
    setShowSuccessPage(false);
    setCreatedEscrowData(null);
  };

  // Show success page if we just created an escrow
  if (showSuccessPage && createdEscrowData) {
    return (
      <EscrowCreated
        escrowData={createdEscrowData}
        onEdit={handleEditFromSuccess}
        onViewDetails={handleViewDetailsFromSuccess}
        onBack={handleBackFromSuccess}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Escrow Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Track and manage all your active transactions in one place
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title={showCommission ? "Hide commission amounts" : "Show commission amounts"}>
                  <IconButton
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                    onClick={() => handleCommissionToggle(!showCommission)}
                  >
                    {showCommission ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </Tooltip>
                <AnimatedButton
                  startIcon={<Add />}
                  onClick={() => setOpenForm(true)}
                  size="large"
                >
                  New Escrow
                </AnimatedButton>
              </Box>
            </Box>
          </motion.div>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <StyledStatsCard color="primary">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        <CountUp end={stats.totalActive} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Active Escrows
                      </Typography>
                    </Box>
                    <Avatar 
                      className="stats-icon"
                      sx={{ 
                        bgcolor: alpha('#1565C0', 0.1), 
                        color: 'primary.main',
                        width: 56,
                        height: 56,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Home />
                    </Avatar>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: alpha('#1565C0', 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'primary.main',
                        }
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      75% of monthly target
                    </Typography>
                  </Box>
                </StyledStatsCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <StyledStatsCard color="warning">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        <CountUp end={stats.closingThisWeek} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Closing This Week
                      </Typography>
                    </Box>
                    <Avatar 
                      className="stats-icon"
                      sx={{ 
                        bgcolor: alpha('#ff9800', 0.1), 
                        color: 'warning.main',
                        width: 56,
                        height: 56,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Timer />
                    </Avatar>
                  </Box>
                  {stats.closingThisWeek > 0 && (
                    <Chip 
                      label="Requires Attention" 
                      size="small" 
                      color="warning" 
                      sx={{ mt: 2 }}
                    />
                  )}
                </StyledStatsCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <StyledStatsCard color="success">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        {showCommission ? (
                          <>$<CountUp end={stats.totalVolume / 1000000} decimals={1} duration={2} />M</>
                        ) : (
                          '•••••'
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Total Volume
                      </Typography>
                    </Box>
                    <Avatar 
                      className="stats-icon"
                      sx={{ 
                        bgcolor: alpha('#4caf50', 0.1), 
                        color: 'success.main',
                        width: 56,
                        height: 56,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <AttachMoney />
                    </Avatar>
                  </Box>
                  {showCommission && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 2, display: 'block' }}>
                      +12.5% from last month
                    </Typography>
                  )}
                </StyledStatsCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <StyledStatsCard color="info">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        <CountUp end={stats.avgDaysToClose} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Avg Days to Close
                      </Typography>
                    </Box>
                    <Avatar 
                      className="stats-icon"
                      sx={{ 
                        bgcolor: alpha('#2196f3', 0.1), 
                        color: 'info.main',
                        width: 56,
                        height: 56,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Speed />
                    </Avatar>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip 
                      label={stats.avgDaysToClose < 43 ? 'Above Average' : 'Below Average'} 
                      size="small" 
                      color={stats.avgDaysToClose < 43 ? 'success' : 'warning'}
                    />
                  </Stack>
                </StyledStatsCard>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: -6, position: 'relative', zIndex: 1 }}>
        {/* Filter Bar */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'white',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`Active (${escrows.filter(e => e.escrowStatus?.toLowerCase() === 'active').length})`}
              onClick={() => setStatusFilter('Active')}
              color={statusFilter === 'Active' ? 'primary' : 'default'}
              variant={statusFilter === 'Active' ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: statusFilter === 'Active' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            />
            <Chip
              label={`Closed (${escrows.filter(e => e.escrowStatus?.toLowerCase() === 'closed').length})`}
              onClick={() => setStatusFilter('Closed')}
              color={statusFilter === 'Closed' ? 'success' : 'default'}
              variant={statusFilter === 'Closed' ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: statusFilter === 'Closed' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            />
            <Chip
              label={`Cancelled (${escrows.filter(e => e.escrowStatus?.toLowerCase() === 'cancelled').length})`}
              onClick={() => setStatusFilter('Cancelled')}
              color={statusFilter === 'Cancelled' ? 'error' : 'default'}
              variant={statusFilter === 'Cancelled' ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: statusFilter === 'Cancelled' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            />
            {statusFilter && (
              <Chip
                label="All"
                onClick={() => setStatusFilter(null)}
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small">
              <FilterList />
            </IconButton>
            <IconButton size="small">
              <Download />
            </IconButton>
          </Box>
        </Paper>

        {/* Escrows List */}
        <Box sx={{ mt: 3 }}>
          <AnimatePresence>
            {getFilteredEscrows().map((escrow, index) => (
              <motion.div
                key={escrow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EscrowCard 
                  status={escrow.escrowStatus}
                  onClick={() => handleCardClick(escrow)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ position: 'relative', height: '200px' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={escrow.propertyImage || 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400'}
                          alt={escrow.propertyAddress}
                          className="property-image"
                          sx={{ 
                            borderRadius: 1,
                            transition: 'all 0.3s ease',
                          }}
                        />
                        <StatusBadge 
                          label={escrow.escrowStatus} 
                          status={escrow.escrowStatus}
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            left: 12,
                          }} 
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={9}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                              {escrow.propertyAddress}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                              <Chip 
                                icon={<Receipt />} 
                                label={escrow.escrowNumber} 
                                size="small" 
                                variant="outlined"
                              />
                              <Chip 
                                icon={<Home />} 
                                label={escrow.propertyType || 'Single Family'} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <IconButton 
                            className="action-buttons"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, escrow);
                            }}
                            sx={{ 
                              opacity: 0,
                              transition: 'opacity 0.3s ease',
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Purchase Price
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                ${escrow.purchasePrice?.toLocaleString() || 'N/A'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Closing Date
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {escrow.closingDate && !isNaN(new Date(escrow.closingDate).getTime()) 
                                  ? format(new Date(escrow.closingDate), 'MMM dd, yyyy')
                                  : 'TBD'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Days to Close
                              </Typography>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold"
                                color={escrow.daysToClose <= 7 ? 'error.main' : 'success.main'}
                              >
                                {escrow.daysToClose || calculateDaysToClose(escrow.closingDate) || 'N/A'} days
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Commission
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {showCommission 
                                  ? `$${((escrow.grossCommission || 0) * 0.5).toLocaleString()}`
                                  : '•••••'
                                }
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <People fontSize="small" color="action" />
                              <Typography variant="body2">
                                <strong>Buyers:</strong> {escrow.buyers?.[0]?.name || 'TBD'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Business fontSize="small" color="action" />
                              <Typography variant="body2">
                                <strong>Sellers:</strong> {escrow.sellers?.[0]?.name || 'TBD'}
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Timeline fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Stage: <strong>{escrow.currentStage || 'Contract'}</strong>
                            </Typography>
                          </Box>
                        </Box>

                        {/* Progress Bar */}
                        <Box sx={{ mt: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Transaction Progress
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(((30 - (escrow.daysToClose || 30)) / 30) * 100)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.round(((30 - (escrow.daysToClose || 30)) / 30) * 100)} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha('#1565C0', 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: 'linear-gradient(90deg, #1565C0 0%, #42A5F5 100%)',
                              }
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Grid>
                  </Grid>
                </EscrowCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {getFilteredEscrows().length === 0 && (
            <Paper 
              sx={{ 
                p: 8, 
                textAlign: 'center',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No escrows found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {statusFilter 
                  ? `No ${statusFilter.toLowerCase()} escrows at this time.`
                  : 'Start by creating your first escrow.'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenForm(true)}
                sx={{ mt: 2 }}
              >
                Create New Escrow
              </Button>
            </Paper>
          )}
        </Box>
      </Container>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={(e) => handleEdit(selectedCard, e)}>
          Edit Escrow
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/escrows/${selectedCard?.id}`);
          handleMenuClose();
        }}>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Download Documents
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Cancel Escrow
        </MenuItem>
      </Menu>

      {/* Form Dialog */}
      <EscrowFormSimple
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(formData) => mutation.mutate(formData)}
        loading={mutation.isLoading}
        escrow={editingEscrow}
        onSuccess={() => {
          queryClient.invalidateQueries('escrows');
          handleCloseForm();
        }}
      />

      {/* Stats Full View Modal */}
      <StatsFullView
        open={showStatsFullView}
        onClose={() => setShowStatsFullView(false)}
        stats={stats}
        escrows={escrows}
        showCommission={showCommission}
      />
    </Box>
  );
};

export default EscrowsDashboard;
