// frontend/src/components/dashboards/EscrowsDashboard.jsx

import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import EscrowForm from '../forms/EscrowForm';
import StatsCard from '../common/StatsCard';

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
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Determine which status tab is active
  const status = ['all', 'Active', 'Pending', 'Closing', 'Closed'][tabValue];

  // Query with fallback to mock data
  const { data, isLoading, error } = useQuery(
    ['escrows', status],
    () => api.get('/escrows', { params: { status: status === 'all' ? undefined : status } }).then(res => res.data),
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      keepPreviousData: true,
      onError: () => {
        // Return mock data on error
        return { escrows: mockEscrows };
      }
    }
  );

  // Use mock data if API fails
  const escrows = data?.escrows || mockEscrows;

  // Calculate stats
  const stats = {
    totalActive: escrows.filter(e => e.escrowStatus === 'Active').length,
    closingThisWeek: escrows.filter(e => {
      const days = differenceInDays(new Date(e.closingDate), new Date());
      return days >= 0 && days <= 7;
    }).length,
    totalVolume: escrows.reduce((sum, e) => sum + e.purchasePrice, 0),
    avgDaysToClose: Math.round(
      escrows.filter(e => e.daysToClose > 0).reduce((sum, e) => sum + e.daysToClose, 0) / 
      escrows.filter(e => e.daysToClose > 0).length || 0
    ),
  };

  // Filter escrows based on tab
  const getFilteredEscrows = () => {
    if (status === 'all') return escrows;
    return escrows.filter(e => e.escrowStatus === status);
  };

  // Mutation for creating or updating
  const mutation = useMutation(
    (escrowData) => {
      if (selectedEscrow) {
        return api.put(`/escrows/${selectedEscrow.id}`, escrowData);
      }
      return api.post('/escrows', escrowData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('escrows');
        enqueueSnackbar('Escrow saved successfully', { variant: 'success' });
        handleCloseForm();
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.error?.message || 'Error saving escrow',
          { variant: 'error' }
        );
      },
    }
  );

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedEscrow(null);
  };

  const handleEdit = (escrow, event) => {
    event.stopPropagation();
    setSelectedEscrow(escrow);
    setOpenForm(true);
    setAnchorEl(null);
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
    const days = differenceInDays(new Date(closingDate), new Date());
    return days;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Escrow Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            New Escrow
          </Button>
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Escrows"
            value={stats.totalActive}
            icon={<Home />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Closing This Week"
            value={stats.closingThisWeek}
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Volume"
            value={`$${(stats.totalVolume / 1000000).toFixed(1)}M`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Days to Close"
            value={stats.avgDaysToClose}
            icon={<Schedule />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All (${escrows.length})`} />
          <Tab label={`Active (${escrows.filter(e => e.escrowStatus === 'Active').length})`} />
          <Tab label={`Pending (${escrows.filter(e => e.escrowStatus === 'Pending').length})`} />
          <Tab label={`Closing (${escrows.filter(e => e.escrowStatus === 'Closing').length})`} />
          <Tab label={`Closed (${escrows.filter(e => e.escrowStatus === 'Closed').length})`} />
        </Tabs>
      </Paper>

      {/* Escrows Grid */}
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
                            {format(new Date(escrow.closingDate), 'MMM d, yyyy')}
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
      <EscrowForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(formData) => mutation.mutate(formData)}
        escrow={selectedEscrow}
        loading={mutation.isLoading}
      />
    </Container>
  );
};

export default EscrowsDashboard;