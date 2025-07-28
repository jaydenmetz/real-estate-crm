import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Avatar,
  AvatarGroup,
  useTheme,
  alpha,
  Tab,
  Tabs,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  AttachMoney,
  Home,
  People,
  CalendarToday,
  Speed,
  Timeline,
  BarChart,
  PieChart as PieChartIcon,
  ShowChart,
  Download,
  Refresh,
  Info,
  CheckCircle,
  Warning,
  LocationCity,
  Schedule,
  Visibility,
  Star,
  ArrowUpward,
  ArrowDownward,
  AutoAwesome,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import ChartErrorBoundary from '../common/ChartErrorBoundary';

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
  minHeight: '280px',
  padding: theme.spacing(6, 0, 4),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    background: 'url("/patterns/analytics-pattern.svg")',
    opacity: 0.1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const MetricCard = styled(Card)(({ theme, trend }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.6s ease-out`,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .metric-icon': {
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
    background: trend === 'up' ? alpha(theme.palette.success.main, 0.1) : 
                trend === 'down' ? alpha(theme.palette.error.main, 0.1) : 
                alpha(theme.palette.info.main, 0.1),
  },
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeIn} 0.8s ease-out`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const InsightCard = styled(Card)(({ theme, type }) => ({
  background: type === 'success' ? alpha(theme.palette.success.main, 0.05) :
             type === 'warning' ? alpha(theme.palette.warning.main, 0.05) :
             type === 'info' ? alpha(theme.palette.info.main, 0.05) :
             'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[4],
  },
}));

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [viewType, setViewType] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [tabValue, setTabValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Empty data for fresh start
  const performanceData = [];
  const revenueBySource = [];
  const clientAcquisition = [];
  const propertyTypes = [];
  const monthlyMetrics = [];
  const agentPerformance = [];
  const marketTrends = [];

  // Calculate metrics
  const metrics = {
    totalRevenue: 0,
    avgDealSize: 0,
    conversionRate: 0,
    totalTransactions: 0,
    activeListings: 0,
    avgDaysOnMarket: 0,
    clientSatisfaction: 0,
    repeatClients: 0,
  };

  // Key insights
  const insights = [
    {
      type: 'success',
      title: 'Revenue Goal On Track',
      description: 'You\'re 85% towards your monthly revenue target',
      icon: <TrendingUp />,
      action: 'View Details',
    },
    {
      type: 'warning',
      title: 'Listing Inventory Low',
      description: 'Active listings down 20% from last month',
      icon: <Warning />,
      action: 'Add Listings',
    },
    {
      type: 'info',
      title: 'Market Trend Alert',
      description: 'Average home prices up 5% in your area',
      icon: <Timeline />,
      action: 'View Report',
    },
  ];

  // Chart colors
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#fa709a'];

  const handleExport = () => {
    console.log('Exporting analytics data...');
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

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
                  Analytics Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Real-time insights to grow your real estate business
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 150 }}>
                  <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '& .MuiSvgIcon-root': { color: 'white' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                    <MenuItem value="quarter">Last Quarter</MenuItem>
                    <MenuItem value="year">Last Year</MenuItem>
                  </Select>
                </FormControl>
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={handleRefresh}>
                  <Refresh />
                </IconButton>
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={handleExport}>
                  <Download />
                </IconButton>
              </Box>
            </Box>
          </motion.div>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
              '& .Mui-selected': { color: 'white' },
              '& .MuiTabs-indicator': { bgcolor: 'white' },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Performance" />
            <Tab label="Revenue" />
            <Tab label="Market Analysis" />
            <Tab label="AI Insights" />
          </Tabs>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 1, pb: 4 }}>
        {/* Metrics Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <MetricCard trend="up">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      $<CountUp end={metrics.totalRevenue / 1000} decimals={1} duration={2} />k
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2" color="success.main">
                        +12.5% from last period
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar
                    className="metric-icon"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <AttachMoney />
                  </Avatar>
                </Box>
              </MetricCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MetricCard trend="down">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Avg Days on Market
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      <CountUp end={metrics.avgDaysOnMarket} duration={2} />
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <ArrowDownward sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2" color="success.main">
                        -5 days improvement
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar
                    className="metric-icon"
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: 'info.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Speed />
                  </Avatar>
                </Box>
              </MetricCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <MetricCard trend="up">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      <CountUp end={metrics.conversionRate} decimals={1} duration={2} />%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2" color="success.main">
                        +2.3% increase
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar
                    className="metric-icon"
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: 'secondary.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <TrendingUp />
                  </Avatar>
                </Box>
              </MetricCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <MetricCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Client Satisfaction
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      <CountUp end={metrics.clientSatisfaction} decimals={1} duration={2} />
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Out of 5.0
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar
                    className="metric-icon"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: 'warning.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Star />
                  </Avatar>
                </Box>
              </MetricCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Revenue Trend */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <ChartCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Revenue Trend
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedMetric}
                    exclusive
                    onChange={(e, newValue) => setSelectedMetric(newValue)}
                    size="small"
                  >
                    <ToggleButton value="revenue">Revenue</ToggleButton>
                    <ToggleButton value="transactions">Transactions</ToggleButton>
                    <ToggleButton value="commission">Commission</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <ChartErrorBoundary>
                  {mounted && typeof window !== 'undefined' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#667eea"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography color="text.secondary">Loading chart...</Typography>
                    </Box>
                  )}
                </ChartErrorBoundary>
              </ChartCard>
            </motion.div>
          </Grid>

          {/* Key Insights */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Box sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  AI-Powered Insights
                </Typography>
                <AnimatePresence>
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <InsightCard type={insight.type}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(
                                insight.type === 'success' ? theme.palette.success.main :
                                insight.type === 'warning' ? theme.palette.warning.main :
                                theme.palette.info.main,
                                0.1
                              ),
                              color: `${insight.type}.main`,
                            }}
                          >
                            {insight.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {insight.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {insight.description}
                            </Typography>
                            <Button
                              size="small"
                              sx={{ mt: 1, textTransform: 'none' }}
                              endIcon={<AutoAwesome />}
                            >
                              {insight.action}
                            </Button>
                          </Box>
                        </Box>
                      </InsightCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            </motion.div>
          </Grid>

          {/* Revenue by Source */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <ChartCard>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Revenue by Source
                </Typography>
                <ChartErrorBoundary>
                  {mounted && typeof window !== 'undefined' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                    <Pie
                      data={revenueBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography color="text.secondary">Loading chart...</Typography>
                    </Box>
                  )}
                </ChartErrorBoundary>
              </ChartCard>
            </motion.div>
          </Grid>

          {/* Client Acquisition */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <ChartCard>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Client Acquisition Channels
                </Typography>
                <ChartErrorBoundary>
                  {mounted && typeof window !== 'undefined' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={clientAcquisition}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                    <XAxis dataKey="channel" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                    <Bar dataKey="leads" fill="#667eea" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="conversions" fill="#764ba2" radius={[8, 8, 0, 0]} />
                      <Legend />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography color="text.secondary">Loading chart...</Typography>
                    </Box>
                  )}
                </ChartErrorBoundary>
              </ChartCard>
            </motion.div>
          </Grid>

          {/* Market Trends */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <ChartCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Market Trends Analysis
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Chip label="Median Price" color="primary" />
                    <Chip label="Inventory" color="secondary" />
                    <Chip label="Days on Market" color="default" />
                  </Stack>
                </Box>
                <ChartErrorBoundary>
                  {mounted && typeof window !== 'undefined' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={marketTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis yAxisId="left" stroke={theme.palette.text.secondary} />
                    <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="medianPrice"
                      stroke="#667eea"
                      strokeWidth={2}
                      dot={{ fill: '#667eea' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="inventory"
                      stroke="#764ba2"
                      strokeWidth={2}
                        dot={{ fill: '#764ba2' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <Typography color="text.secondary">Loading chart...</Typography>
                    </Box>
                  )}
                </ChartErrorBoundary>
              </ChartCard>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;