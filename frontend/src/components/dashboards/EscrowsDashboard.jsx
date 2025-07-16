// frontend/src/components/dashboards/EscrowsDashboard.jsx

import React, { useState } from 'react';
import EscrowCompactCard from '../common/EscrowCompactCard';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays } from 'date-fns';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { useNavigate } from 'react-router-dom';
import { api, escrowsAPI } from '../../services/api';
import EscrowForm from '../forms/EscrowForm';
import EscrowFormSimple from '../forms/EscrowFormSimple';
import EscrowCreated from '../common/EscrowCreated';
import StatsCard from '../common/StatsCard';
import StatsFullView from '../common/StatsFullView';

// Mock data for fallback
const mockEscrows = [
  {
    id: 'esc_001',
    escrowNumber: 'ESC-2025-001',
    propertyAddress: '456 Ocean View Dr, La Jolla, CA 92037',
    propertyType: 'Single Family',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    purchasePrice: 1250000,
    escrowStatus: 'Active',
    currentStage: 'Inspection',
    closingDate: new Date('2025-07-30'),
    daysToClose: 22,
    grossCommission: 31250,
    buyers: [{ name: 'Michael & Sarah Chen' }],
    sellers: [{ name: 'Robert Johnson' }],
  },
  {
    id: 'esc_002',
    escrowNumber: 'ESC-2025-002',
    propertyAddress: '789 Sunset Blvd, Del Mar, CA 92014',
    propertyType: 'Condo',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    purchasePrice: 850000,
    escrowStatus: 'Pending',
    currentStage: 'Appraisal',
    closingDate: new Date('2025-07-15'),
    daysToClose: 7,
    grossCommission: 21250,
    buyers: [{ name: 'Emily Davis' }],
    sellers: [{ name: 'The Andersons' }],
  },
  {
    id: 'esc_003',
    escrowNumber: 'ESC-2025-003',
    propertyAddress: '321 Palm Ave, Coronado, CA 92118',
    propertyType: 'Townhouse',
    propertyImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
    purchasePrice: 1450000,
    escrowStatus: 'Closing',
    currentStage: 'Final Walkthrough',
    closingDate: new Date('2025-07-10'),
    daysToClose: 2,
    grossCommission: 36250,
    buyers: [{ name: 'David & Lisa Park' }],
    sellers: [{ name: 'William Thompson' }],
  },
];

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
          // Mock create
          const id = `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = safeParseDate(new Date()) || new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const count = (escrows?.length || 0) + 1;
          const escrowNumber = `ESC-${year}-${month}-${count.toString().padStart(3, '0')}`;
          
          const purchasePrice = parseFloat(escrowData.purchasePrice) || 0;
          const commissionPercentage = parseFloat(escrowData.commissionPercentage) || 2.5;
          const grossCommission = purchasePrice * (commissionPercentage / 100);
          
          const closingDate = new Date(escrowData.closingDate);
          const today = new Date();
          const daysToClose = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));
          
          const newEscrow = {
            id,
            escrowNumber,
            ...escrowData,
            propertyImage: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400',
            escrowStatus: 'Active',
            currentStage: 'Contract',
            daysToClose,
            grossCommission,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Add to mock data
          mockEscrows.push(newEscrow);
          
          return { data: { data: newEscrow } };
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
          // Mock create even on error
          const id = `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const mockNewEscrow = {
            id,
            escrowNumber: `ESC-2025-${mockEscrows.length + 1}`,
            ...mutation.variables,
            propertyImage: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400',
            escrowStatus: 'Active',
            currentStage: 'Contract',
            daysToClose: 30,
            grossCommission: parseFloat(mutation.variables.purchasePrice) * 0.025,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          mockEscrows.push(mockNewEscrow);
          setCreatedEscrowData(mockNewEscrow);
          setShowSuccessPage(true);
          handleCloseForm();
          queryClient.invalidateQueries('escrows');
          enqueueSnackbar('Escrow created successfully (offline mode)', { variant: 'info' });
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="h4">Escrows</Typography>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={showCommission ? "Hide commission amounts" : "Show commission amounts"}>
            <FormControlLabel
              control={
                <Switch
                  checked={showCommission}
                  onChange={(e) => handleCommissionToggle(e.target.checked)}
                  icon={<VisibilityOff />}
                  checkedIcon={<Visibility />}
                  color="primary"
                />
              }
              label={showCommission ? "Commission" : "Commission"}
              sx={{ 
                mr: 2,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            Add Escrow
          </Button>
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Escrows"
            value={stats.totalActive}
            icon={<Home />}
            color="primary"
            onClick={() => setStatusFilter('Active')}
            subtitle={`${stats.totalActive} properties in escrow`}
            onRequestFullView={() => setShowStatsFullView(true)}
            expandable={true}
            details={
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active escrows require daily attention for timely closing.
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="High Priority" 
                      secondary={`${escrows.filter(e => e.escrowStatus === 'Active' && e.priorityLevel === 'high').length} escrows`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Normal Priority" 
                      secondary={`${escrows.filter(e => e.escrowStatus === 'Active' && e.priorityLevel !== 'high').length} escrows`}
                    />
                  </ListItem>
                </List>
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Closing This Week"
            value={stats.closingThisWeek}
            icon={<Warning />}
            color="warning"
            onClick={() => {
              setStatusFilter('Active');
              enqueueSnackbar(`${stats.closingThisWeek} escrows closing within 7 days`, { variant: 'warning' });
            }}
            subtitle="Urgent attention needed"
            trend={stats.closingThisWeek > 0 ? 25 : 0}
            onRequestFullView={() => setShowStatsFullView(true)}
            expandable={true}
            details={
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Escrows requiring immediate action:
                </Typography>
                {escrows
                  .filter(e => {
                    const dateStr = e.closingDate || e.scheduledCoeDate;
                    if (!dateStr) return false;
                    try {
                      const closeDate = new Date(dateStr);
                      if (isNaN(closeDate.getTime())) return false;
                      const days = differenceInDays(closeDate, new Date());
                      return days >= 0 && days <= 7 && e.escrowStatus === 'Active';
                    } catch {
                      return false;
                    }
                  })
                  .slice(0, 3)
                  .map(e => {
                    const dateStr = e.closingDate || e.scheduledCoeDate;
                    let days = 'N/A';
                    try {
                      const closeDate = new Date(dateStr);
                      if (!isNaN(closeDate.getTime())) {
                        days = differenceInDays(closeDate, new Date());
                      }
                    } catch {}
                    return (
                      <Typography key={e.id} variant="caption" display="block" sx={{ mt: 1 }}>
                        • {e.propertyAddress} - {days} days
                      </Typography>
                    );
                  })
                }
              </Box>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Volume"
            value={showCommission ? `$${(stats.totalVolume / 1000000).toFixed(1)}M` : '•••••'}
            icon={<AttachMoney />}
            color="success"
            subtitle={showCommission ? "YTD transaction volume" : "Hidden"}
            onRequestFullView={() => setShowStatsFullView(true)}
            expandable={true}
            details={showCommission ? (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Volume breakdown by status:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Active" 
                      secondary={`$${(escrows.filter(e => e.escrowStatus === 'Active').reduce((sum, e) => sum + e.purchasePrice, 0) / 1000000).toFixed(1)}M`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Closed" 
                      secondary={`$${(escrows.filter(e => e.escrowStatus === 'Closed').reduce((sum, e) => sum + e.purchasePrice, 0) / 1000000).toFixed(1)}M`}
                    />
                  </ListItem>
                </List>
              </Box>
            ) : "Commission details are hidden"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Days to Close"
            value={stats.avgDaysToClose}
            icon={<Schedule />}
            color="info"
            subtitle="Industry avg: 43 days"
            trend={stats.avgDaysToClose < 43 ? -((43 - stats.avgDaysToClose) / 43 * 100).toFixed(0) : ((stats.avgDaysToClose - 43) / 43 * 100).toFixed(0)}
            onRequestFullView={() => setShowStatsFullView(true)}
            expandable={true}
            details={
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Your performance vs industry average.
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {stats.avgDaysToClose < 43 
                    ? `You're closing ${43 - stats.avgDaysToClose} days faster than average!`
                    : `Consider process improvements to reduce closing time.`
                  }
                </Typography>
              </Box>
            }
          />
        </Grid>
      </Grid>

      {/* Tabs - Hidden */}
      {false && (
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All (${escrows.length})`} />
          <Tab label={`Active (${escrows.filter(e => e.escrowStatus === 'Active').length})`} />
          <Tab label={`Pending (${escrows.filter(e => e.escrowStatus === 'Pending').length})`} />
          <Tab label={`Closing (${escrows.filter(e => e.escrowStatus === 'Closing').length})`} />
          <Tab label={`Closed (${escrows.filter(e => e.escrowStatus === 'Closed').length})`} />
        </Tabs>
      </Paper>
      )}

      {/* Escrows List View */}
      <Box sx={{ mb: 4 }}>
        {getFilteredEscrows().map((escrow, index) => (
          <EscrowCompactCard 
            key={escrow.id}
            escrow={escrow}
            index={index}
            showCommission={showCommission}
          />
        ))}
      </Box>

      {/* Grid View (Hidden by default) */}
      {false && (
      <Grid container spacing={3}>
        {isLoading ? (
          // Loading skeletons
          [...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          getFilteredEscrows().map((escrow) => {
            const daysToClose = calculateDaysToClose(escrow.closingDate);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={escrow.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea onClick={() => handleCardClick(escrow)}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={escrow.propertyImage || 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400'}
                        alt={escrow.propertyAddress}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          display: 'flex',
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={escrow.escrowStatus}
                          color={getStatusColor(escrow.escrowStatus)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper' },
                        }}
                        size="small"
                        onClick={(e) => handleMenuOpen(e, escrow)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom noWrap>
                        {escrow.propertyAddress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {escrow.escrowNumber} • {escrow.propertyType}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Purchase Price
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ${escrow.purchasePrice.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Closing Date
                          </Typography>
                          <Typography variant="body2">
                            {safeFormatDate(escrow.closingDate, 'MMM d, yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Days to Close
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={daysToClose && daysToClose <= 7 ? 'error.main' : 'success.main'}
                          >
                            {daysToClose !== null ? 
                              (daysToClose > 0 ? `${daysToClose} days` : 'Closed') : 
                              'N/A'
                            }
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              icon={<People />}
                              label={escrow.buyers?.[0]?.name?.split(' ')[0] || 'Buyer'}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              icon={<Home />}
                              label={escrow.sellers?.[0]?.name?.split(' ')[0] || 'Seller'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">
                              Commission
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              ${(escrow.grossCommission * 0.5).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getStageIcon(escrow.currentStage)}
                          <Typography variant="caption" color="text.secondary">
                            {escrow.currentStage}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
      )}

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
    </Container>
  );
};

export default EscrowsDashboard;