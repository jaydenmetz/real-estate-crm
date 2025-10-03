import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Stack,
  AvatarGroup,
  useTheme,
  alpha,
  Badge,
  CardMedia,
  Skeleton,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  TrendingUp,
  Schedule,
  Home as HomeIcon,
  People,
  Assessment,
  Warning,
  CheckCircle,
  ArrowForward,
  AutoAwesome,
  Star,
  Notifications,
  CalendarToday,
  AttachMoney,
  LocationOn,
  Timer,
  Speed,
  Assignment,
  Visibility,
  Add,
  BarChart,
  PendingActions,
  Groups,
  EventNote,
  PersonOutline,
  EventAvailableOutlined,
  LeaderboardOutlined,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useQuery } from 'react-query';
import { safeFormatDate, getSafeTimestamp } from '../../utils/safeDateUtils';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';

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

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '280px',
  padding: theme.spacing(6, 0, 4),
  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
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
    background: 'url("/patterns/dashboard-pattern.svg")',
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

const StyledStatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
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
    '& .stats-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
    '& .view-more': {
      opacity: 1,
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

const ActivityCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.6s ease-out`,
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[4],
    '& .arrow-icon': {
      transform: 'translateX(4px)',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '3px',
    height: '100%',
    background: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  },
  '&:hover::before': {
    width: '5px',
  },
}));

const ProgressCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
    animation: `${shimmer} 2s linear infinite`,
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  color: 'white',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const ModuleHeroCard = styled(Box)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(6),
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
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

const HomeDashboard = () => {
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  // Fetch real data from APIs
  const { data: listingsData } = useQuery('listings', () => api.get('/listings'), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: escrowsData } = useQuery('escrows', () => api.get('/escrows'), {
    staleTime: 5 * 60 * 1000,
  });

  const { data: clientsData } = useQuery('clients', () => api.get('/clients'), {
    staleTime: 5 * 60 * 1000,
  });

  const { data: appointmentsData } = useQuery('appointments', () => api.get('/appointments'), {
    staleTime: 5 * 60 * 1000,
  });

  const { data: leadsData } = useQuery('leads', () => api.get('/leads'), {
    staleTime: 5 * 60 * 1000,
  });

  // Calculate stats from fetched data
  const listings = listingsData?.data?.data || [];
  const escrows = escrowsData?.data?.data || [];
  const clients = clientsData?.data?.data || [];
  const appointments = appointmentsData?.data?.data || [];
  const leads = leadsData?.data?.data || [];

  const stats = {
    // Listings stats
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    listingsValue: listings.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0),
    hotListings: listings.filter(l => l.views > 50 || l.showings > 5).length,

    // Escrows stats
    totalEscrows: escrows.length,
    activeEscrows: escrows.filter(e => e.escrowStatus === 'active' || e.escrowStatus === 'pending').length,
    escrowVolume: escrows.reduce((sum, e) => sum + (parseFloat(e.purchasePrice) || 0), 0),
    projectedCommission: escrows.reduce((sum, e) => sum + (parseFloat(e.buyerCommission || 0) + parseFloat(e.sellerCommission || 0)), 0),

    // Clients stats
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    buyers: clients.filter(c => c.clientType === 'buyer').length,
    sellers: clients.filter(c => c.clientType === 'seller').length,

    // Appointments stats
    totalAppointments: appointments.length,
    todayAppointments: appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate);
      const today = new Date();
      return apptDate.toDateString() === today.toDateString();
    }).length,
    weekAppointments: appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return apptDate <= weekFromNow && apptDate >= new Date();
    }).length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,

    // Leads stats
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    hotLeads: leads.filter(l => l.leadScore >= 80).length,
    convertedLeads: leads.filter(l => l.status === 'converted' || l.status === 'client').length,

    // Dashboard overview stats
    upcomingAppointments: appointments.filter(a => new Date(a.appointmentDate) >= new Date()).length,
    monthlyVolume: escrows.reduce((sum, e) => sum + (parseFloat(e.purchasePrice) || 0), 0),
    closingThisWeek: escrows.filter(e => {
      const closeDate = new Date(e.closingDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return closeDate <= weekFromNow && closeDate >= new Date();
    }).length,
    pendingTasks: 0,
  };

  const recentActivity = [];

  const upcomingTasks = [];

  const quickStats = [
    { label: 'Conversion Rate', value: '0%', change: '+0%', positive: true },
    { label: 'Avg Days on Market', value: '0', change: '+0 days', positive: true },
    { label: 'Client Satisfaction', value: '0.0', change: '+0.0', positive: true },
    { label: 'Response Time', value: '0h', change: '+0m', positive: true },
  ];

  const handleCardClick = (stat, path) => {
    setActiveCard(stat);
    setTimeout(() => {
      navigate(path);
    }, 200);
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
                  Welcome back, {user?.profile?.firstName || user?.username || 'User'}! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {safeFormatDate(new Date(), 'EEEE, MMMM d, yyyy')} • Let's make today productive
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title="View notifications">
                  <IconButton
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    <Badge badgeContent={3} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <AnimatedButton
                  startIcon={<AutoAwesome />}
                  onClick={() => navigate('/ai-agents')}
                  size="large"
                >
                  AI Assistant
                </AnimatedButton>
              </Box>
            </Box>
          </motion.div>

          {/* Quick Stats Row */}
          <Grid container spacing={2} sx={{ mb: -8 }}>
            {quickStats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      color: 'white',
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {stat.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                      <Typography variant="h5" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          bgcolor: stat.positive ? 'success.main' : 'error.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 1, pb: 4 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <StyledStatsCard 
                color="primary"
                onClick={() => handleCardClick('escrows', '/escrows')}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      <CountUp end={stats.activeEscrows} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Active Escrows
                    </Typography>
                    <Chip
                      label={`${stats.closingThisWeek} closing this week`}
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Avatar 
                    className="stats-icon"
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: 'primary.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Assessment />
                  </Avatar>
                </Box>
                <Typography 
                  className="view-more"
                  variant="caption" 
                  sx={{ 
                    mt: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  View all <ArrowForward fontSize="small" />
                </Typography>
              </StyledStatsCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StyledStatsCard 
                color="secondary"
                onClick={() => handleCardClick('listings', '/listings')}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      <CountUp end={stats.activeListings} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Active Listings
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={65} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'secondary.main',
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        65% of inventory sold
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar 
                    className="stats-icon"
                    sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                      color: 'secondary.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <HomeIcon />
                  </Avatar>
                </Box>
                <Typography 
                  className="view-more"
                  variant="caption" 
                  sx={{ 
                    mt: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  View all <ArrowForward fontSize="small" />
                </Typography>
              </StyledStatsCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StyledStatsCard 
                color="success"
                onClick={() => handleCardClick('clients', '/clients')}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      <CountUp end={stats.totalClients} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Total Clients
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                      <Chip label={`+${stats.newLeads} new`} size="small" color="success" />
                    </Stack>
                  </Box>
                  <Avatar 
                    className="stats-icon"
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      color: 'success.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Groups />
                  </Avatar>
                </Box>
                <Typography 
                  className="view-more"
                  variant="caption" 
                  sx={{ 
                    mt: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  View all <ArrowForward fontSize="small" />
                </Typography>
              </StyledStatsCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StyledStatsCard 
                color="info"
                onClick={() => handleCardClick('appointments', '/appointments')}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      <CountUp end={stats.upcomingAppointments} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Today's Appointments
                    </Typography>
                    {stats.pendingTasks > 0 && (
                      <Chip 
                        icon={<PendingActions />}
                        label={`${stats.pendingTasks} pending tasks`}
                        size="small"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  <Avatar 
                    className="stats-icon"
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1), 
                      color: 'info.main',
                      width: 56,
                      height: 56,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <EventNote />
                  </Avatar>
                </Box>
                <Typography 
                  className="view-more"
                  variant="caption" 
                  sx={{ 
                    mt: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  View calendar <ArrowForward fontSize="small" />
                </Typography>
              </StyledStatsCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Activity
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{ textTransform: 'none' }}
                  >
                    View all
                  </Button>
                </Box>
                <AnimatePresence>
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ActivityCard onClick={() => navigate(activity.link)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette[activity.color].main, 0.1),
                              color: `${activity.color}.main`,
                            }}
                          >
                            {activity.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {activity.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.subtitle}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                            <ArrowForward 
                              className="arrow-icon"
                              fontSize="small" 
                              sx={{ 
                                display: 'block',
                                ml: 'auto',
                                mt: 0.5,
                                color: 'text.secondary',
                                transition: 'transform 0.3s ease',
                              }} 
                            />
                          </Box>
                        </Box>
                      </ActivityCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Paper>
            </motion.div>
          </Grid>

          {/* Upcoming Tasks */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Today's Tasks
                  </Typography>
                  <IconButton size="small" onClick={() => navigate('/tasks')}>
                    <Add />
                  </IconButton>
                </Box>
                {upcomingTasks.map((task, index) => (
                  <Box
                    key={task.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 1,
                      bgcolor: 'grey.50',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'grey.100',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.priority}
                        size="small"
                        color={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Timer fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Due at {task.dueTime}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Assignment />}
                  sx={{ mt: 2, textTransform: 'none' }}
                  onClick={() => navigate('/tasks')}
                >
                  View All Tasks
                </Button>
              </Paper>
            </motion.div>
          </Grid>

          {/* Monthly Progress */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <ProgressCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Monthly Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You're on track to exceed your goals this month!
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Star />
                  </Avatar>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Sales Volume
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        $<CountUp end={stats.monthlyVolume / 1000000} decimals={1} duration={2} />M
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={85}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.300',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Deals Closed
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        8 / 10
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        80% of target
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        New Clients
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {stats.newLeads}
                      </Typography>
                      <Typography variant="caption" color="info.main">
                        +40% from last month
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Satisfaction Score
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        4.8 / 5.0
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            fontSize="small"
                            sx={{
                              color: star <= 4.8 ? 'warning.main' : 'grey.300',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </ProgressCard>
            </motion.div>
          </Grid>

          {/* Module Hero Cards */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Quick Access
              </Typography>
            </motion.div>
          </Grid>

          {/* Escrows Module */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <ModuleHeroCard
                gradient="linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
                onClick={() => navigate('/escrows')}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Escrow Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Track your real estate transactions
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Total Escrows</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.totalEscrows} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Active Escrows</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.activeEscrows} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Total Volume</Typography>
                      <Typography variant="h4" fontWeight="bold">${stats.escrowVolume > 0 ? <CountUp end={stats.escrowVolume / 1000000} decimals={1} duration={2} /> : '0'}M</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Commission</Typography>
                      <Typography variant="h4" fontWeight="bold">${stats.projectedCommission > 0 ? <CountUp end={stats.projectedCommission / 1000} decimals={0} duration={2} /> : '0'}K</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </ModuleHeroCard>
            </motion.div>
          </Grid>

          {/* Listings Module */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <ModuleHeroCard
                gradient="linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)"
                onClick={() => navigate('/listings')}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Listings Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Manage and showcase your properties
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Total Listings</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.totalListings} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Active</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.activeListings} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Total Value</Typography>
                      <Typography variant="h4" fontWeight="bold">${stats.listingsValue > 0 ? <CountUp end={stats.listingsValue / 1000000} decimals={1} duration={2} /> : '0'}M</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Hot Properties</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.hotListings} duration={2} /></Typography>
                    </Box>
                  </Grid>
                </Grid>
              </ModuleHeroCard>
            </motion.div>
          </Grid>

          {/* Clients Module */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <ModuleHeroCard
                gradient="linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)"
                onClick={() => navigate('/clients')}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Client Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Manage your client relationships
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Total Clients</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.totalClients} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Active Clients</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.activeClients} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Buyers</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.buyers} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Sellers</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.sellers} duration={2} /></Typography>
                    </Box>
                  </Grid>
                </Grid>
              </ModuleHeroCard>
            </motion.div>
          </Grid>

          {/* Appointments Module */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <ModuleHeroCard
                gradient="linear-gradient(135deg, #F57C00 0%, #FFB74D 100%)"
                onClick={() => navigate('/appointments')}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Appointments
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Schedule and manage appointments
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Total Appointments</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.totalAppointments} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Today</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.todayAppointments} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>This Week</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.weekAppointments} duration={2} /></Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Completed</Typography>
                      <Typography variant="h4" fontWeight="bold"><CountUp end={stats.completedAppointments} duration={2} /></Typography>
                    </Box>
                  </Grid>
                </Grid>
              </ModuleHeroCard>
            </motion.div>
          </Grid>

          {/* Leads Module */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
            >
              <ModuleHeroCard
                gradient="linear-gradient(135deg, #EC4899 0%, #F472B6 100%)"
                onClick={() => navigate('/leads')}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Lead Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                  Track and convert your leads
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Total Leads</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        <CountUp end={stats.totalLeads} duration={2} />
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>New Leads</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        <CountUp end={stats.newLeads} duration={2} />
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Hot Leads</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        <CountUp end={stats.hotLeads} duration={2} />
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Converted</Typography>
                      <Typography variant="h4" fontWeight="bold">
                        <CountUp end={stats.convertedLeads} duration={2} />
                      </Typography>
                    </Box>
                  </Grid>
</Grid>
              </ModuleHeroCard>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomeDashboard;