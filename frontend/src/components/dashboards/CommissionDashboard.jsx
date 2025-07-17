import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AttachMoney,
  TrendingUp,
  Receipt,
  Assessment,
  CheckCircle,
  Schedule,
  Warning,
  Add,
  FilterList,
  Download,
  MoreVert,
  Home,
  People,
  CalendarToday,
  AccountBalance,
  Assignment,
  Paid,
  Pending,
  Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useQuery } from 'react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    Pending: { bg: theme.palette.warning.light, color: theme.palette.warning.dark },
    Processing: { bg: theme.palette.info.light, color: theme.palette.info.dark },
    Paid: { bg: theme.palette.success.light, color: theme.palette.success.dark },
    Cancelled: { bg: theme.palette.error.light, color: theme.palette.error.dark },
  };
  
  const colors = statusColors[status] || statusColors.Pending;
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold',
  };
});

const CommissionDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch commissions
  const { data: commissionsData, isLoading: commissionsLoading } = useQuery(
    ['commissions', statusFilter],
    () => api.get(`/commissions${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
    {
      onError: (error) => {
        enqueueSnackbar('Failed to fetch commissions', { variant: 'error' });
      },
    }
  );

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'commissionStats',
    () => api.get('/commissions/stats'),
    {
      onError: (error) => {
        enqueueSnackbar('Failed to fetch commission statistics', { variant: 'error' });
      },
    }
  );

  const commissions = commissionsData?.data?.commissions || [];
  const stats = statsData?.data || {};

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const filters = ['all', 'Pending', 'Processing', 'Paid'];
    setStatusFilter(filters[newValue]);
  };

  const handleMenuOpen = (event, commission) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommission(commission);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommission(null);
  };

  const handleViewDetails = () => {
    if (selectedCommission) {
      navigate(`/commissions/${selectedCommission.id}`);
    }
    handleMenuClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCommissionIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle color="success" />;
      case 'Processing':
        return <Schedule color="info" />;
      case 'Pending':
        return <Warning color="warning" />;
      default:
        return <AttachMoney />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Commission Tracking
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => enqueueSnackbar('Export feature coming soon', { variant: 'info' })}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/commissions/new')}
            >
              Add Commission
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  YTD Earnings
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={stats.ytd?.totalNet || 0}
                    duration={2}
                    prefix="$"
                    separator=","
                  />
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                <TrendingUp fontSize="large" />
              </Avatar>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0} sx={{ background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)` }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  This Month
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={stats.monthly?.totalNet || 0}
                    duration={2}
                    prefix="$"
                    separator=","
                  />
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                <CalendarToday fontSize="large" />
              </Avatar>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0} sx={{ background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)` }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Pipeline
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={(stats.pipeline?.pending || 0) + (stats.pipeline?.processing || 0)}
                    duration={2}
                    prefix="$"
                    separator=","
                  />
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                <Timeline fontSize="large" />
              </Avatar>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0} sx={{ background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)` }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Avg Split
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={stats.averageSplit || 0}
                    duration={2}
                    suffix="%"
                  />
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                <Assessment fontSize="large" />
              </Avatar>
            </StatCard>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
            <Tab label={`All (${stats.ytd?.totalTransactions || 0})`} />
            <Tab label={`Pending (${stats.ytd?.byStatus?.pending || 0})`} />
            <Tab label={`Processing (${stats.ytd?.byStatus?.processing || 0})`} />
            <Tab label={`Paid (${stats.ytd?.byStatus?.paid || 0})`} />
          </Tabs>
        </Paper>

        {/* Commission List */}
        <Grid container spacing={3}>
          {commissionsLoading ? (
            // Loading skeletons
            [1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                    <Skeleton variant="rectangular" height={60} />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          ) : commissions.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No commissions found
                </Typography>
                <Typography color="text.secondary" mb={2}>
                  {statusFilter !== 'all' 
                    ? `No ${statusFilter.toLowerCase()} commissions at this time`
                    : 'Start by adding your first commission'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/commissions/new')}
                >
                  Add Commission
                </Button>
              </Paper>
            </Grid>
          ) : (
            commissions.map((commission) => (
              <Grid item xs={12} md={6} lg={4} key={commission.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <StyledCard>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {commission.escrowNumber}
                          </Typography>
                          <StatusChip
                            label={commission.status}
                            status={commission.status}
                            size="small"
                            icon={getCommissionIcon(commission.status)}
                          />
                        </Box>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, commission)}>
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Stack spacing={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Home fontSize="small" color="action" />
                          <Typography variant="body2" noWrap>
                            {commission.propertyAddress}
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Sale Price:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(commission.salePrice)}
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Gross Commission:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(commission.grossCommission)}
                          </Typography>
                        </Box>

                        <Divider />

                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1" color="primary" fontWeight="bold">
                            Net Commission:
                          </Typography>
                          <Typography variant="body1" color="primary" fontWeight="bold">
                            {formatCurrency(commission.netCommission)}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {commission.status === 'Paid' ? 'Paid' : 'Expected'}: {
                              format(
                                new Date(commission.actualPayoutDate || commission.projectedPayoutDate),
                                'MMM d, yyyy'
                              )
                            }
                          </Typography>
                        </Box>

                        <Chip
                          label={commission.side}
                          size="small"
                          color={commission.side === 'Listing' ? 'primary' : 'secondary'}
                          sx={{ width: 'fit-content' }}
                        />
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewDetails}>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            enqueueSnackbar('Edit feature coming soon', { variant: 'info' });
            handleMenuClose();
          }}>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            enqueueSnackbar('Delete feature coming soon', { variant: 'info' });
            handleMenuClose();
          }}>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </motion.div>
    </Container>
  );
};

export default CommissionDashboard;