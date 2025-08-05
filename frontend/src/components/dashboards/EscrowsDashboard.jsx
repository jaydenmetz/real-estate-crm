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
  Collapse,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider,
  Tooltip as MuiTooltip,
  Tabs,
  Tab,
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
  BugReport,
  ExpandMore,
  ExpandLess,
  Storage,
  Refresh,
  Error as ErrorIcon,
  Analytics,
  DataObject,
  NetworkCheck,
  Info,
  Warning,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { safeFormatDate, safeParseDate } from '../../utils/safeDateUtils';
import { escrowsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import DebugPanel from '../common/DebugPanel';
import networkMonitor from '../../services/networkMonitor';

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
                  <LocationOn sx={{ fontSize: 20, color: theme.palette.primary.main }} />
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
                    {escrow.propertyAddress}
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
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Escrow: {escrow.displayId || escrow.escrowNumber}
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
  const { user } = useAuth();
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewEscrowModal, setShowNewEscrowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [stats, setStats] = useState({
    totalEscrows: 0,
    activeEscrows: 0,
    totalVolume: 0,
    projectedCommission: 0,
    closedThisMonth: 0,
    avgDaysToClose: 0,
    grossCommission: 0,
    myCommission: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchEscrows();
  }, []);

  useEffect(() => {
    if (escrows.length > 0) {
      calculateStats(escrows, selectedStatus);
    }
  }, [selectedStatus, escrows]);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      console.log('Fetching escrows...');
      const response = await escrowsAPI.getAll();
      console.log('API Response:', response);
      
      if (response.success) {
        const escrowData = response.data.escrows || [];
        console.log('Escrows found:', escrowData.length);
        
        // Log ID information for debugging
        if (escrowData.length > 0) {
          console.log('Sample escrow IDs:');
          escrowData.slice(0, 3).forEach((esc, idx) => {
            console.log(`  ${idx + 1}. id: ${esc.id}, displayId: ${esc.displayId}`);
          });
        }
        
        setEscrows(escrowData);
        calculateStats(escrowData, selectedStatus);
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

  const calculateStats = (escrowData, statusFilter = 'active') => {
    // Safety check for escrowData
    if (!escrowData || !Array.isArray(escrowData)) {
      setStats({
        totalEscrows: 0,
        activeEscrows: 0,
        totalVolume: 0,
        projectedCommission: 0,
        closedThisMonth: 0,
        avgDaysToClose: 0,
        grossCommission: 0,
        myCommission: 0,
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
    
    setStats({
      totalEscrows: filteredEscrows.length,
      activeEscrows: filteredEscrows.length, // For backward compatibility
      totalVolume,
      projectedCommission: myCommission, // For backward compatibility
      closedThisMonth: 0,
      avgDaysToClose: Math.round(filteredEscrows.reduce((sum, e) => sum + (Number(e.daysToClose) || 0), 0) / (filteredEscrows.length || 1)),
      grossCommission,
      myCommission,
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
    console.log('Escrow clicked - ID:', escrowId);
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

      {/* Status Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedStatus}
          onChange={(e, newValue) => setSelectedStatus(newValue)}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minHeight: 56,
            },
            '& .Mui-selected': {
              fontWeight: 700,
            },
          }}
        >
          <Tab label="Active Escrows" value="active" />
          <Tab label="Closed Escrows" value="closed" />
          <Tab label="Cancelled Escrows" value="cancelled" />
        </Tabs>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Home}
              title={`Total ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
              value={stats.totalEscrows}
              color="#2196f3"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={AttachMoney}
              title="Total Volume"
              value={stats.totalVolume / 1000000}
              prefix="$"
              suffix="M"
              color="#4caf50"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TrendingUp}
              title="Gross Commission"
              value={stats.grossCommission}
              prefix="$"
              color="#ff9800"
              delay={400}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={CheckCircle}
              title="My Commission"
              value={stats.myCommission}
              prefix="$"
              color="#9c27b0"
              delay={600}
            />
          </Grid>
        </Grid>

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

      {/* Action Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Escrows
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
          {(() => {
            const filteredEscrows = escrows.filter(e => {
              switch (selectedStatus) {
                case 'active':
                  return e.escrowStatus === 'Active Under Contract' || 
                         e.escrowStatus === 'active under contract' ||
                         e.escrowStatus === 'Pending' || 
                         e.escrowStatus === 'pending' ||
                         e.escrowStatus === 'Active' || 
                         e.escrowStatus === 'active';
                case 'closed':
                  return e.escrowStatus === 'Closed' || 
                         e.escrowStatus === 'closed' ||
                         e.escrowStatus === 'Completed' || 
                         e.escrowStatus === 'completed';
                case 'cancelled':
                  return e.escrowStatus === 'Cancelled' || 
                         e.escrowStatus === 'cancelled' ||
                         e.escrowStatus === 'Withdrawn' || 
                         e.escrowStatus === 'withdrawn' ||
                         e.escrowStatus === 'Expired' || 
                         e.escrowStatus === 'expired';
                default:
                  return true;
              }
            });
            
            if (!filteredEscrows || filteredEscrows.length === 0) {
              return (
            <Paper 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                background: theme => alpha(theme.palette.primary.main, 0.03),
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No {selectedStatus} escrows found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStatus === 'active' ? 'Create a new escrow to get started' : `No ${selectedStatus} escrows in the system`}
              </Typography>
            </Paper>
              );
            } else {
              return filteredEscrows.map((escrow, index) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  onClick={handleEscrowClick}
                  index={index}
                />
              ));
            }
          })()}
        </AnimatePresence>
      </Box>

      {/* New Debug Panel - Admin Only */}
      {(
      <DebugPanel
        pageTitle="Debug Panel: Escrows Dashboard"
        user={user}
        apiRequests={[
          {
            url: '/api/v1/escrows',
            method: 'GET',
            status: 200,
            duration: networkMonitor.getStats().avgDuration || 0,
            timestamp: new Date().toISOString(),
            response: { escrows: escrows.slice(0, 3), total: escrows.length, stats }
          }
        ]}
        databases={[
          {
            name: 'PostgreSQL - Escrows',
            recordCount: escrows.length,
            lastSync: new Date().toISOString(),
            status: 'connected',
            sampleData: escrows[0]
          },
          {
            name: 'Redis Cache',
            recordCount: networkMonitor.getStats().total,
            lastSync: new Date().toISOString(),
            status: 'connected'
          }
        ]}
        customData={{
          dashboardStats: stats,
          chartData: { points: chartData.length, type: 'area' },
          filterStatus: 'all',
          viewMode: 'grid',
          user: {
            username: user?.username,
            role: user?.role,
            permissions: user?.permissions
          }
        }}
      />
      )}

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