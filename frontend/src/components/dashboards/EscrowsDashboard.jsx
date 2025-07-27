import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewEscrowModal from '../forms/NewEscrowModal';
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
  Fade,
  Grow,
  Slide,
  Skeleton,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { safeFormatDate, safeParseDate } from '../../utils/safeDateUtils';
import { escrowsAPI } from '../../services/api';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

// Enhanced animated stat card component with gradient animations
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.001 }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          minHeight: 140,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(color, 0.2)}`,
            border: `1px solid ${alpha(color, 0.4)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography 
                color="textSecondary" 
                gutterBottom 
                variant="body2"
                sx={{ fontWeight: 500, letterSpacing: 0.5 }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  color,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                }}
              >
                <span style={{ fontSize: '0.7em' }}>{prefix}</span>
                <CountUp 
                  end={value} 
                  duration={2.5} 
                  separator="," 
                  decimals={suffix === 'M' ? 2 : 0}
                />
                <span style={{ fontSize: '0.7em' }}>{suffix}</span>
              </Typography>
              {trend && (
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                  <Typography variant="caption" color="success.main">
                    {trend}% from last month
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
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
                  background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.8)', opacity: 1 },
                    '50%': { transform: 'scale(1.2)', opacity: 0.5 },
                    '100%': { transform: 'scale(0.8)', opacity: 1 },
                  },
                }}
              />
              <Icon sx={{ fontSize: 48, color, zIndex: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced escrow card component with stunning visuals
const EscrowCard = ({ escrow, onClick, index }) => {
  const theme = useTheme();
  const statusColors = {
    'Active Under Contract': '#4caf50',
    'active under contract': '#4caf50',
    'Pending': '#ff9800',
    'pending': '#ff9800',
    'Closed': '#9e9e9e',
    'closed': '#9e9e9e',
    // Legacy support
    'Active': '#4caf50',
    'active': '#4caf50'
  };
  
  const statusColor = statusColors[escrow.escrowStatus] || '#9e9e9e';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        onClick={() => onClick(escrow.id)}
        elevation={0}
        sx={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: alpha(statusColor, 0.3),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 10px 40px ${alpha(statusColor, 0.2)}`,
            borderColor: alpha(statusColor, 0.5),
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 1)',
            '& .arrow-icon': {
              transform: 'translateX(5px)',
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: statusColor,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {escrow.displayId || escrow.escrowNumber}
                  </Typography>
                  <Chip
                    label={escrow.escrowStatus}
                    size="small"
                    sx={{
                      background: alpha(statusColor, 0.1),
                      color: statusColor,
                      border: `1px solid ${alpha(statusColor, 0.3)}`,
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {escrow.propertyAddress}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Transaction Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  ${Number(escrow.purchasePrice).toLocaleString()}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    ${Number(escrow.myCommission).toLocaleString()} commission
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Timeline
                </Typography>
                <Box mt={0.5}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Handshake sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {safeFormatDate(escrow.acceptanceDate, 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalance sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {safeFormatDate(escrow.scheduledCoeDate, 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: escrow.daysToClose <= 7 ? 'error.main' : 'primary.main',
                    }}
                  >
                    {escrow.daysToClose > 0 ? escrow.daysToClose : 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    days left
                  </Typography>
                </Box>
                <IconButton 
                  color="primary" 
                  size="large"
                  className="arrow-icon"
                  sx={{ 
                    transition: 'transform 0.3s ease',
                    background: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {/* Progress bar */}
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Box
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(statusColor, 0.1),
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${escrow.checklistProgress || 0}%`,
                  backgroundColor: statusColor,
                  borderRadius: 2,
                  transition: 'width 1s ease-out',
                }}
              />
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {escrow.checklistProgress || 0}% Complete
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EscrowsDashboard = () => {
  const navigate = useNavigate();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewEscrowModal, setShowNewEscrowModal] = useState(false);
  const [stats, setStats] = useState({
    totalEscrows: 0,
    activeEscrows: 0,
    totalVolume: 0,
    projectedCommission: 0,
    closedThisMonth: 0,
    avgDaysToClose: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchEscrows();
  }, []);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      console.log('Fetching escrows...');
      const response = await escrowsAPI.getAll();
      console.log('API Response:', response);
      
      if (response.success) {
        const escrowData = response.data.escrows || [];
        console.log('Escrows found:', escrowData.length);
        setEscrows(escrowData);
        calculateStats(escrowData);
        generateChartData(escrowData);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching escrows:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (escrowData) => {
    // Safety check for escrowData
    if (!escrowData || !Array.isArray(escrowData)) {
      setStats({
        totalEscrows: 0,
        activeEscrows: 0,
        totalVolume: 0,
        projectedCommission: 0,
        closedThisMonth: 0
      });
      return;
    }
    
    // Both "Active Under Contract" and "Pending" are considered active escrows
    const active = escrowData.filter(e => 
      e.escrowStatus === 'Active Under Contract' || 
      e.escrowStatus === 'active under contract' ||
      e.escrowStatus === 'Pending' || 
      e.escrowStatus === 'pending' ||
      // Legacy support
      e.escrowStatus === 'Active' || 
      e.escrowStatus === 'active'
    );
    const totalVolume = active.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    const projectedCommission = active.reduce((sum, e) => sum + Number(e.myCommission || 0), 0);
    
    setStats({
      totalEscrows: escrowData.length,
      activeEscrows: active.length,
      totalVolume,
      projectedCommission,
      closedThisMonth: 0, /* Temporarily disabled date filtering
      closedThisMonth: escrowData.filter(e => {
        if (e.escrowStatus !== 'Closed') return false;
        const closeDate = safeParseDate(e.scheduledCoeDate);
        if (!closeDate) return false;
        const now = new Date();
        return closeDate.getMonth() === now.getMonth() && closeDate.getFullYear() === now.getFullYear();
      }).length, */
      avgDaysToClose: Math.round(active.reduce((sum, e) => sum + (Number(e.daysToClose) || 0), 0) / (active.length || 1)),
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Enhanced Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Escrow Dashboard
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  Track and manage all your real estate transactions in one place
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={handleCreateNew}
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.9)' 
                      }
                    }}
                  >
                    Create New Escrow
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      color: 'white', 
                      borderColor: 'white',
                      '&:hover': { 
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                    startIcon={<Assessment />}
                  >
                    Transaction Analytics
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 3, 
                  p: 3,
                  backdropFilter: 'blur(10px)',
                }}>
                  <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                    <CountUp end={stats.activeEscrows} duration={2} />
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Active Escrows
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                    $<CountUp end={stats.totalVolume / 1000000} duration={2.5} decimals={1} />M
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Transaction Volume
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </HeroSection>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Home}
              title="Total Escrows"
              value={stats.totalEscrows}
              color="#2196f3"
              delay={0}
              trend={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TrendingUp}
              title="Active Escrows"
              value={stats.activeEscrows}
              color="#4caf50"
              delay={200}
              trend={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={AttachMoney}
              title="Total Volume"
              value={stats.totalVolume / 1000000}
              prefix="$"
              suffix="M"
              color="#ff9800"
              delay={400}
              trend={15}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={CheckCircle}
              title="Projected Commission"
              value={stats.projectedCommission}
              prefix="$"
              color="#9c27b0"
              delay={600}
              trend={10}
            />
          </Grid>
        </Grid>

        {/* Enhanced Charts */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
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
        </Grid>

      {/* Action Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          All Escrows
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleCreateNew}
          size="large"
        >
          Create New Escrow
        </Button>
      </Box>

      {/* Escrow Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AnimatePresence>
          {escrows.length === 0 ? (
            <Paper 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                background: theme => alpha(theme.palette.primary.main, 0.03),
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No escrows found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Create your first escrow to get started
              </Typography>
            </Paper>
          ) : (
            escrows.map((escrow, index) => (
              <EscrowCard
                key={escrow.id}
                escrow={escrow}
                onClick={handleEscrowClick}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </Box>

      {/* New Escrow Modal */}
      <NewEscrowModal
        open={showNewEscrowModal}
        onClose={() => setShowNewEscrowModal(false)}
        onSuccess={handleNewEscrowSuccess}
      />
    </Container>
  );
};

export default EscrowsDashboard;