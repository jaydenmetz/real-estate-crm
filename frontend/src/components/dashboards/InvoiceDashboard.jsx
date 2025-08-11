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
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Receipt,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Add,
  FilterList,
  Download,
  MoreVert,
  Search,
  Email,
  CalendarToday,
  AttachMoney,
  AccountBalance,
  Paid,
  Send,
  Print,
  ErrorOutline,
  Description,
  Timer,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useQuery } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.service.service.service';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
  },
}));

const StatCard = styled(Paper)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: theme.palette[color].main,
  color: theme.palette[color].contrastText,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: alpha(theme.palette[color].dark, 0.2),
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    Pending: { bg: theme.palette.info.light, color: theme.palette.info.dark },
    Paid: { bg: theme.palette.success.light, color: theme.palette.success.dark },
    Overdue: { bg: theme.palette.error.light, color: theme.palette.error.dark },
    Cancelled: { bg: theme.palette.grey[300], color: theme.palette.grey[700] },
  };
  
  const colors = statusColors[status] || statusColors.Pending;
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold',
  };
});

const InvoiceDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Determine status filter based on active tab
  const getStatusFilter = () => {
    switch (activeTab) {
      case 1: return 'Pending';
      case 2: return 'Overdue';
      case 3: return 'Paid';
      default: return 'all';
    }
  };

  // Fetch invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery(
    ['invoices', activeTab, searchTerm],
    () => {
      const params = new URLSearchParams();
      const status = getStatusFilter();
      if (status !== 'all') params.append('status', status);
      if (activeTab === 2) params.append('overdue', 'true');
      if (searchTerm) params.append('search', searchTerm);
      
      return api.get(`/invoices?${params.toString()}`);
    },
    {
      onError: (error) => {
        enqueueSnackbar('Failed to fetch invoices', { variant: 'error' });
      },
    }
  );

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'invoiceStats',
    () => api.get('/invoices/stats'),
    {
      onError: (error) => {
        enqueueSnackbar('Failed to fetch invoice statistics', { variant: 'error' });
      },
    }
  );

  const invoices = invoicesData?.data?.invoices || [];
  const stats = statsData?.data || {};

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, invoice) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleViewDetails = () => {
    if (selectedInvoice) {
      navigate(`/invoices/${selectedInvoice.id}`);
    }
    handleMenuClose();
  };

  const handleSendReminder = async () => {
    if (selectedInvoice) {
      try {
        await api.post(`/invoices/${selectedInvoice.id}/reminder`);
        enqueueSnackbar('Reminder sent successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to send reminder', { variant: 'error' });
      }
    }
    handleMenuClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getDaysOverdue = (dueDate) => {
    return differenceInDays(new Date(), new Date(dueDate));
  };

  const getInvoiceIcon = (invoice) => {
    if (invoice.status === 'Paid') return <CheckCircle color="success" />;
    if (invoice.status === 'Overdue') return <ErrorOutline color="error" />;
    if (invoice.type === 'Commission') return <AttachMoney color="primary" />;
    return <Receipt color="action" />;
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
            Invoice Management
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
              onClick={() => navigate('/invoices/new')}
            >
              Create Invoice
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0} color="warning">
              <Box position="relative" zIndex={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Outstanding
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      <CountUp
                        start={0}
                        end={stats.outstanding?.total || 0}
                        duration={2}
                        prefix="$"
                        separator=","
                        decimals={2}
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {stats.outstanding?.count || 0} invoices
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                    <Timer fontSize="large" />
                  </Avatar>
                </Stack>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0} color="error">
              <Box position="relative" zIndex={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Overdue
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      <CountUp
                        start={0}
                        end={stats.outstanding?.overdue || 0}
                        duration={2}
                        prefix="$"
                        separator=","
                        decimals={2}
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {stats.outstanding?.overdueCount || 0} invoices
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                    <Warning fontSize="large" />
                  </Avatar>
                </Stack>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0} color="success">
              <Box position="relative" zIndex={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      YTD Paid
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      <CountUp
                        start={0}
                        end={stats.ytd?.paid || 0}
                        duration={2}
                        prefix="$"
                        separator=","
                        decimals={2}
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {stats.ytd?.count || 0} total invoices
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                    <Paid fontSize="large" />
                  </Avatar>
                </Stack>
              </Box>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0} color="info">
              <Box position="relative" zIndex={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Avg Days to Pay
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      <CountUp
                        start={0}
                        end={stats.performance?.avgDaysToPayment || 0}
                        duration={2}
                        suffix=" days"
                      />
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {Math.round(stats.performance?.paymentRate || 0)}% payment rate
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 56, height: 56 }}>
                    <Schedule fontSize="large" />
                  </Avatar>
                </Stack>
              </Box>
            </StatCard>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search invoices by number, client, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
            <Tab label={`All Invoices (${stats.ytd?.count || 0})`} />
            <Tab 
              label={
                <Badge badgeContent={stats.outstanding?.count || 0} color="info">
                  <span>Pending</span>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={stats.outstanding?.overdueCount || 0} color="error">
                  <span>Overdue</span>
                </Badge>
              }
            />
            <Tab label={`Paid (${stats.ytd?.count - (stats.outstanding?.count || 0) || 0})`} />
          </Tabs>
        </Paper>

        {/* Invoice List */}
        <Grid container spacing={3}>
          {invoicesLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <StyledCard>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6">Loading...</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          ) : invoices.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No invoices found
                </Typography>
                <Typography color="text.secondary" mb={2}>
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Create your first invoice to get started'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/invoices/new')}
                >
                  Create Invoice
                </Button>
              </Paper>
            </Grid>
          ) : (
            invoices.map((invoice) => (
              <Grid item xs={12} md={6} key={invoice.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <StyledCard onClick={() => navigate(`/invoices/${invoice.id}`)}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {getInvoiceIcon(invoice)}
                            <Typography variant="h6">
                              {invoice.invoiceNumber}
                            </Typography>
                          </Stack>
                          <StatusChip
                            label={invoice.status}
                            status={invoice.status}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, invoice)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Client
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {invoice.clientName}
                          </Typography>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Amount
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(invoice.total)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Balance
                            </Typography>
                            <Typography 
                              variant="h6" 
                              color={invoice.balance > 0 ? 'error' : 'success'}
                            >
                              {formatCurrency(invoice.balance)}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Divider />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarToday fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                            </Typography>
                          </Stack>
                          {invoice.status === 'Overdue' && (
                            <Chip
                              label={`${getDaysOverdue(invoice.dueDate)} days overdue`}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={invoice.type}
                            size="small"
                            variant="outlined"
                          />
                          {invoice.status === 'Pending' && (
                            <Tooltip title="Send reminder">
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInvoice(invoice);
                                  handleSendReminder();
                                }}
                              >
                                <Email fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewDetails}>
            <Description sx={{ mr: 1 }} fontSize="small" />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            enqueueSnackbar('Download feature coming soon', { variant: 'info' });
            handleMenuClose();
          }}>
            <Download sx={{ mr: 1 }} fontSize="small" />
            Download PDF
          </MenuItem>
          {selectedInvoice?.status === 'Pending' && (
            <MenuItem onClick={handleSendReminder}>
              <Email sx={{ mr: 1 }} fontSize="small" />
              Send Reminder
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={() => {
            enqueueSnackbar('Edit feature coming soon', { variant: 'info' });
            handleMenuClose();
          }}>
            Edit
          </MenuItem>
        </Menu>
      </motion.div>
    </Container>
  );
};

export default InvoiceDashboard;