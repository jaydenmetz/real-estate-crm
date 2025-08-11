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
  Home,
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useQuery } from 'react-query';
import { safeFormatDate, getSafeTimestamp } from '../../utils/safeDateUtils';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service.service.service';

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

const HomeDashboard = () => {
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  // Empty data for fresh start
  const stats = {
    activeEscrows: 0,
    activeListings: 0,
    totalClients: 0,
    upcomingAppointments: 0,
    monthlyVolume: 0,
    closingThisWeek: 0,
    newLeads: 0,
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
                    <Home />
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
        </Grid>
      </Container>
    </Box>
  );
};

export default HomeDashboard;