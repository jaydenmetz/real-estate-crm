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
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Receipt,
  TrendingUp,
  Category,
  AttachMoney,
  Add,
  FilterList,
  Download,
  MoreVert,
  Search,
  CalendarToday,
  DirectionsCar,
  LocalOffer,
  Store,
  CameraAlt,
  CheckCircle,
  ErrorOutline,
  Timeline,
  PieChart,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useQuery } from 'react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
// Note: Chart.js imports are commented out for now
// To enable charts, install: npm install react-chartjs-2 chart.js
// import { 
//   Chart as ChartJS, 
//   ArcElement, 
//   Tooltip as ChartTooltip, 
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
// } from 'chart.js';
// import { Pie, Bar } from 'react-chartjs-2';

// ChartJS.register(
//   ArcElement, 
//   ChartTooltip, 
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement
// );

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatCard = styled(Paper)(({ theme, gradient }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 500,
}));

const ExpenseDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery(
    ['expenses', categoryFilter, searchTerm],
    () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      return api.get(`/expenses?${params.toString()}`);
    },
    {
      onError: (error) => {
        enqueueSnackbar('Failed to fetch expenses', { variant: 'error' });
      },
    }
  );

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ['expenseStats', dateRange],
    () => api.get(`/expenses/stats?year=${new Date().getFullYear()}`),
    {
      onError: (error) => {
        enqueueSnackbar('Failed to fetch expense statistics', { variant: 'error' });
      },
    }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'expenseCategories',
    () => api.get('/expenses/categories'),
  );

  const expenses = expensesData?.data?.expenses || [];
  const stats = statsData?.data || {};
  const categories = categoriesData?.data || {};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Marketing': <Campaign />,
      'Transportation': <DirectionsCar />,
      'Office Supplies': <Store />,
      'Professional Services': <Business />,
      'Professional Development': <School />,
      'Client Entertainment': <Restaurant />,
      'Communication': <Phone />,
      'Insurance': <Security />,
      'Fees & Licenses': <AccountBalance />,
    };
    return icons[category] || <Category />;
  };

  // Prepare chart data
  const categoryChartData = {
    labels: Object.keys(stats.byCategory || {}),
    datasets: [{
      data: Object.values(stats.byCategory || {}).map(cat => cat.total),
      backgroundColor: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.error.main,
        '#9c27b0',
        '#ff9800',
        '#607d8b',
      ],
    }],
  };

  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Expenses',
      data: stats.monthlyBreakdown?.map(m => m.total) || [],
      backgroundColor: alpha(theme.palette.primary.main, 0.8),
    }],
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
            Expense Management
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => enqueueSnackbar('Report generation coming soon', { variant: 'info' })}
            >
              Generate Report
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/expenses/new')}
            >
              Add Expense
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              elevation={0}
              gradient={`linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`}
            >
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  YTD Total
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={stats.ytd?.total || 0}
                    duration={2}
                    prefix="$"
                    separator=","
                  />
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {stats.ytd?.count || 0} expenses
                </Typography>
              </Stack>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              elevation={0}
              gradient={`linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`}
            >
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Tax Deductible
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={stats.ytd?.deductible || 0}
                    duration={2}
                    prefix="$"
                    separator=","
                  />
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {Math.round((stats.ytd?.deductible / stats.ytd?.total) * 100) || 0}% of total
                </Typography>
              </Stack>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              elevation={0}
              gradient={`linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`}
            >
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Mileage Deduction
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={stats.mileage?.totalDeduction || 0}
                    duration={2}
                    prefix="$"
                    separator=","
                  />
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {stats.mileage?.totalMiles || 0} miles
                </Typography>
              </Stack>
            </StatCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              elevation={0}
              gradient={`linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`}
            >
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Monthly Average
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  <CountUp
                    start={0}
                    end={stats.ytd?.avgPerMonth || 0}
                    duration={2}
                    prefix="$"
                    separator=","
                  />
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ${Math.round(stats.ytd?.avgPerExpense || 0)} per expense
                </Typography>
              </Stack>
            </StatCard>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Expenses by Category
              </Typography>
              {stats.byCategory && (
                <Box sx={{ position: 'relative', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Chart visualization available after installing react-chartjs-2
                  </Typography>
                  {/* <Pie 
                    data={categoryChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  /> */}
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Monthly Trend
              </Typography>
              {stats.monthlyBreakdown && (
                <Box sx={{ position: 'relative', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Chart visualization available after installing react-chartjs-2
                  </Typography>
                  {/* <Bar 
                    data={monthlyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => `$${value}`,
                          },
                        },
                      },
                    }}
                  /> */}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search expenses..."
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
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {Object.keys(categories).map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => enqueueSnackbar('Advanced filters coming soon', { variant: 'info' })}
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Expenses */}
        <Paper sx={{ mb: 3 }}>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Recent Expenses
            </Typography>
            <List>
              {expensesLoading ? (
                <ListItem>
                  <ListItemText primary="Loading expenses..." />
                </ListItem>
              ) : expenses.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No expenses found" 
                    secondary="Add your first expense to start tracking"
                  />
                </ListItem>
              ) : (
                expenses.slice(0, 10).map((expense, index) => (
                  <React.Fragment key={expense.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      button
                      onClick={() => navigate(`/expenses/${expense.id}`)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                          {expense.hasReceipt ? <Receipt /> : <AttachMoney />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle1" fontWeight="500">
                                {expense.vendor}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {expense.description}
                              </Typography>
                            </Box>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(expense.amount)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} mt={1}>
                            <CategoryChip 
                              label={expense.category} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                            <Chip 
                              label={expense.subcategory} 
                              size="small"
                              variant="outlined"
                            />
                            {expense.taxDeductible && (
                              <Chip 
                                label="Tax Deductible" 
                                size="small" 
                                color="success"
                                variant="outlined"
                                icon={<CheckCircle />}
                              />
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto!important' }}>
                              {format(new Date(expense.date), 'MMM d, yyyy')}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))
              )}
            </List>
            {expenses.length > 10 && (
              <Box textAlign="center" mt={2}>
                <Button onClick={() => navigate('/expenses')}>
                  View All Expenses
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Top Vendors */}
        <Paper>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Top Vendors
            </Typography>
            <List>
              {stats.topVendors?.map((vendor, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={vendor.vendor}
                    secondary={`${formatCurrency(vendor.total)}`}
                  />
                  <LinearProgress 
                    variant="determinate" 
                    value={(vendor.total / stats.topVendors[0].total) * 100}
                    sx={{ width: 100, ml: 2 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

// Add missing icon imports
const Campaign = () => <LocalOffer />;
const Business = () => <Store />;
const School = () => <Category />;
const Restaurant = () => <Store />;
const Phone = () => <Category />;
const Security = () => <Category />;
const AccountBalance = () => <Category />;

export default ExpenseDashboard;