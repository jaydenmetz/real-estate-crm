// frontend/src/components/details/EscrowDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Grow,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Badge,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  AvatarGroup,
  ButtonGroup,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CalendarToday,
  CheckCircle,
  Warning,
  Schedule,
  People,
  Home,
  Assignment,
  Timeline,
  Notifications,
  AutoAwesome,
  PlayArrow,
  NavigateNext,
  NavigateBefore,
  Favorite,
  Share,
  MoreVert,
  LocationOn,
  Bed,
  Bathroom,
  SquareFoot,
  DirectionsCar,
  WbSunny,
  Pool,
  Deck,
  Fireplace,
  Kitchen,
  Weekend,
  Visibility,
  Message,
  Call,
  Email,
  AccessTime,
  TrendingFlat,
  KeyboardArrowUp,
  KeyboardArrowDown,
  EmojiEvents,
  Flag,
  Timer,
  Speed,
  Psychology,
  SmartToy,
  Celebration,
  LocalFireDepartment,
  WaterDrop,
  Bolt,
  Air,
  MapsHomeWork,
  AccountBalance,
  MonetizationOn,
  ShowChart,
  BarChart,
  PieChart,
  PhotoCamera,
  Videocam,
  ThreeDRotation,
  ArrowForward,
  ArrowBack,
  Close,
  FullscreenExit,
  Fullscreen,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { escrowsAPI } from '../../services/api';

// Animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
`;

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.25)',
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  minHeight: 400,
  [theme.breakpoints.down('md')]: {
    minHeight: 300,
  },
}));

const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'active' ? '#44b700' : 
                     status === 'pending' ? '#ff9800' : '#757575',
    color: status === 'active' ? '#44b700' : 
           status === 'pending' ? '#ff9800' : '#757575',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'active' ? `${pulse} 2s infinite` : 'none',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const MetricCard = styled(Card)(({ theme, trend }) => ({
  background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 30px 0 rgba(0, 0, 0, 0.1)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: trend === 'up' ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)' :
                trend === 'down' ? 'linear-gradient(90deg, #f44336 0%, #ff5722 100%)' :
                'linear-gradient(90deg, #2196f3 0%, #03a9f4 100%)',
  },
}));

const AIButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 20px 0 rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 30px 0 rgba(102, 126, 234, 0.6)',
  },
  '& .MuiButton-startIcon': {
    animation: `${float} 3s ease-in-out infinite`,
  },
}));

const PropertyImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '& .swiper': {
    borderRadius: theme.spacing(2),
  },
  '& .swiper-slide': {
    position: 'relative',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
  },
  '& .swiper-button-next, & .swiper-button-prev': {
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    '&::after': {
      fontSize: '20px',
    },
  },
  '& .swiper-pagination-bullet': {
    backgroundColor: 'white',
    opacity: 0.7,
    '&.swiper-pagination-bullet-active': {
      opacity: 1,
    },
  },
}));

const TimelineCard = styled(Card)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  '& .MuiTimelineItem-root': {
    '&:before': {
      display: 'none',
    },
  },
}));

const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color = '#667eea' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color={color}>
          <CountUp end={progress} duration={2} />%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Complete
        </Typography>
      </Box>
    </Box>
  );
};

const PropertyFeature = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
      <Icon sx={{ fontSize: 16 }} />
    </Avatar>
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Box>
);

const CHART_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const EscrowDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewMode, setViewMode] = useState('dashboard');
  const [showFinancials, setShowFinancials] = useState(false);
  
  // Fetch escrow data
  const { data: escrow, isLoading } = useQuery(
    ['escrow', id],
    () => escrowsAPI.getById(id),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      select: (response) => response.data,
    }
  );

  // Speed dial actions for AI assistance
  const speedDialActions = [
    { 
      icon: <Email />, 
      name: 'Draft Follow-up Email', 
      action: 'draft_email',
      color: '#4caf50'
    },
    { 
      icon: <Assignment />, 
      name: 'Update Checklist', 
      action: 'update_checklist',
      color: '#ff9800'
    },
    { 
      icon: <Call />, 
      name: 'Schedule Calls', 
      action: 'schedule_calls',
      color: '#2196f3'
    },
    { 
      icon: <Timeline />, 
      name: 'Generate Timeline', 
      action: 'generate_timeline',
      color: '#9c27b0'
    },
    { 
      icon: <Psychology />, 
      name: 'AI Insights', 
      action: 'ai_insights',
      color: '#f44336'
    },
  ];

  const handleAIAction = async (action) => {
    try {
      await escrowsAPI.aiAssist(id, { 
        action, 
        context: { 
          escrowStatus: escrow?.escrowStatus,
          daysToClose: escrow?.activityStats?.daysToClose,
          checklistProgress: escrow?.checklistProgress
        } 
      });
      // Show notification
    } catch (error) {
      console.error('AI action failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const escrowData = escrow || {};
  const progress = escrowData.checklistProgress?.overall?.percentage || 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Hero Section with Property Images */}
      <Fade in timeout={800}>
        <HeroSection>
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <StatusBadge
                  overlap="circular"
                  status={escrowData.escrowStatus?.toLowerCase()}
                  variant="dot"
                >
                  <Chip
                    label={escrowData.escrowStatus}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  />
                </StatusBadge>
                
                <Typography variant={isMobile ? "h4" : "h3"} gutterBottom fontWeight="bold">
                  {escrowData.propertyAddress}
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Chip
                    icon={<Home />}
                    label={escrowData.propertyType}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<AttachMoney />}
                    label={`$${escrowData.purchasePrice?.toLocaleString()}`}
                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                  />
                </Stack>

                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  {escrowData.transactionType} • {escrowData.escrowNumber}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Visibility />}
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                    onClick={() => setViewMode('details')}
                  >
                    View Details
                  </Button>
                  <IconButton sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Share sx={{ color: 'white' }} />
                  </IconButton>
                  <IconButton sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <Favorite sx={{ color: 'white' }} />
                  </IconButton>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ position: 'relative', height: { xs: 300, md: 400 } }}>
              <PropertyImageContainer sx={{ height: '100%' }}>
                <Swiper
                  modules={[Navigation, Pagination, Autoplay, EffectFade]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  effect="fade"
                  style={{ height: '100%' }}
                >
                  {escrowData.propertyImages?.map((image, index) => (
                    <SwiperSlide key={index}>
                      <Box
                        sx={{
                          height: '100%',
                          background: `url(${image}) center/cover`,
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            p: 3,
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={3}>
                              <PropertyFeature icon={Bed} label="Beds" value={escrowData.bedrooms} />
                            </Grid>
                            <Grid item xs={3}>
                              <PropertyFeature icon={Bathroom} label="Baths" value={escrowData.bathrooms} />
                            </Grid>
                            <Grid item xs={3}>
                              <PropertyFeature icon={SquareFoot} label="Sq Ft" value={escrowData.squareFootage?.toLocaleString()} />
                            </Grid>
                            <Grid item xs={3}>
                              <PropertyFeature icon={DirectionsCar} label="Garage" value="2" />
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </PropertyImageContainer>
            </Grid>
          </Grid>
        </HeroSection>
      </Fade>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1000}>
            <MetricCard trend="up">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Days to Close
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={escrowData.activityStats?.daysToClose || 0} duration={2} />
                  </Typography>
                  <Chip
                    size="small"
                    icon={<TrendingDown sx={{ fontSize: 16 }} />}
                    label="5 days faster"
                    sx={{ mt: 1, bgcolor: 'success.light', color: 'success.dark' }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <CalendarToday />
                </Avatar>
              </Box>
            </MetricCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1200}>
            <MetricCard trend="neutral">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    My Commission
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${showFinancials ? (
                      <CountUp end={escrowData.myCommission || 0} duration={2} separator="," />
                    ) : '••••••'}
                  </Typography>
                  <Chip
                    size="small"
                    icon={showFinancials ? <Visibility /> : <VisibilityOff />}
                    label={showFinancials ? "Hide" : "Show"}
                    onClick={() => setShowFinancials(!showFinancials)}
                    sx={{ mt: 1, cursor: 'pointer' }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </MetricCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1400}>
            <MetricCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Checklist Progress
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={progress} duration={2} />%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ 
                      mt: 1, 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      }
                    }}
                  />
                </Box>
                <Box sx={{ ml: 2 }}>
                  <ProgressRing progress={progress} size={80} strokeWidth={8} />
                </Box>
              </Box>
            </MetricCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1600}>
            <MetricCard trend="up">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Communication Score
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={escrowData.activityStats?.communicationScore || 0} duration={2} />
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <LocalFireDepartment 
                        key={star}
                        sx={{ 
                          fontSize: 16, 
                          color: star <= Math.floor((escrowData.activityStats?.communicationScore || 0) / 20) 
                            ? 'warning.main' 
                            : 'grey.300' 
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}>
                  <Message />
                </Avatar>
              </Box>
            </MetricCard>
          </Grow>
        </Grid>
      </Grid>

      {/* Main Dashboard Content */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left Column - Activity & Timeline */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Activity Timeline */}
            <Zoom in timeout={800}>
              <GlassCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Recent Activity
                    </Typography>
                    <AIButton
                      size="small"
                      startIcon={<AutoAwesome />}
                      onClick={() => handleAIAction('generate_timeline')}
                    >
                      AI Timeline Analysis
                    </AIButton>
                  </Box>
                  
                  <List>
                    {escrowData.timeline?.slice(0, 5).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ListItem
                          sx={{
                            bgcolor: index === 0 ? 'action.hover' : 'transparent',
                            borderRadius: 2,
                            mb: 1,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `${CHART_COLORS[index % CHART_COLORS.length]}20` }}>
                              {event.type === 'milestone' && <Flag sx={{ color: CHART_COLORS[index % CHART_COLORS.length] }} />}
                              {event.type === 'inspection' && <Assignment sx={{ color: CHART_COLORS[index % CHART_COLORS.length] }} />}
                              {event.type === 'financial' && <AttachMoney sx={{ color: CHART_COLORS[index % CHART_COLORS.length] }} />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={event.event}
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {event.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(event.date).toLocaleDateString()}
                                </Typography>
                              </>
                            }
                          />
                          {index === 0 && (
                            <Chip
                              label="Latest"
                              size="small"
                              color="primary"
                              sx={{ animation: `${pulse} 2s infinite` }}
                            />
                          )}
                        </ListItem>
                      </motion.div>
                    ))}
                  </List>
                  
                  <Button fullWidth variant="text" endIcon={<ArrowForward />}>
                    View Full Timeline
                  </Button>
                </CardContent>
              </GlassCard>
            </Zoom>

            {/* Market Insights Chart */}
            <Zoom in timeout={1000}>
              <GlassCard>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Market Performance
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { month: 'Jan', value: 1150000, avg: 1100000 },
                          { month: 'Feb', value: 1180000, avg: 1120000 },
                          { month: 'Mar', value: 1200000, avg: 1140000 },
                          { month: 'Apr', value: 1220000, avg: 1160000 },
                          { month: 'May', value: 1250000, avg: 1180000 },
                          { month: 'Jun', value: escrowData.purchasePrice || 1250000, avg: 1200000 },
                        ]}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#764ba2" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                        <ChartTooltip
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="avg"
                          stroke="#764ba2"
                          fillOpacity={1}
                          fill="url(#colorAvg)"
                          strokeWidth={2}
                          name="Market Average"
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#667eea"
                          fillOpacity={1}
                          fill="url(#colorValue)"
                          strokeWidth={3}
                          name="This Property"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        List to Sale Ratio
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {((escrowData.purchasePrice / escrowData.listPrice) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Neighborhood Trend
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {escrowData.marketComparison?.neighborhoodTrend}
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Price per Sq Ft
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${escrowData.marketComparison?.pricePerSqft}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </GlassCard>
            </Zoom>
          </Stack>
        </Grid>

        {/* Right Column - Quick Actions & People */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Zoom in timeout={1200}>
              <GlassCard>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CheckCircle />}
                      sx={{
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        color: 'white',
                        justifyContent: 'flex-start',
                      }}
                      onClick={() => navigate(`/escrows/${id}?tab=checklist`)}
                    >
                      Update Checklist ({escrowData.checklistProgress?.overall?.completed}/{escrowData.checklistProgress?.overall?.total})
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Schedule />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Schedule Inspection
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Email />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Send Update to Client
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Assignment />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Upload Documents
                    </Button>
                  </Stack>
                </CardContent>
              </GlassCard>
            </Zoom>

            {/* People Involved */}
            <Zoom in timeout={1400}>
              <GlassCard>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    People Involved
                  </Typography>
                  
                  {/* Clients */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Clients
                    </Typography>
                    <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                      {escrowData.clients?.map((client) => (
                        <Tooltip key={client.id} title={`${client.name} (${client.type})`}>
                          <Avatar 
                            src={client.avatar} 
                            sx={{ 
                              cursor: 'pointer',
                              border: '2px solid white',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            {client.name?.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>

                  {/* Professional Team */}
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Professional Team
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                          <Business sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={escrowData.transactionCoordinator?.name}
                        secondary="Transaction Coordinator"
                      />
                      <IconButton size="small">
                        <Call fontSize="small" />
                      </IconButton>
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                          <AccountBalance sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={escrowData.loanOfficer?.name}
                        secondary="Loan Officer"
                      />
                      <IconButton size="small">
                        <Email fontSize="small" />
                      </IconButton>
                    </ListItem>
                  </List>
                </CardContent>
              </GlassCard>
            </Zoom>

            {/* Upcoming Deadlines */}
            <Zoom in timeout={1600}>
              <GlassCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Upcoming Deadlines
                    </Typography>
                    <Chip
                      label={`${escrowData.activityStats?.upcomingDeadlines} urgent`}
                      size="small"
                      color="error"
                    />
                  </Box>
                  
                  <Stack spacing={2}>
                    {[
                      { 
                        label: 'Contingency Removal', 
                        date: escrowData.contingencyRemovalDate,
                        icon: <Flag />,
                        color: 'error'
                      },
                      { 
                        label: 'Loan Contingency', 
                        date: escrowData.loanContingencyDate,
                        icon: <AccountBalance />,
                        color: 'warning'
                      },
                      { 
                        label: 'Closing Date', 
                        date: escrowData.scheduledCoeDate,
                        icon: <Home />,
                        color: 'success'
                      },
                    ].map((deadline, index) => (
                      <motion.div
                        key={deadline.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: `${deadline.color}.light`,
                            border: `1px solid`,
                            borderColor: `${deadline.color}.main`,
                          }}
                        >
                          <Avatar sx={{ bgcolor: `${deadline.color}.main`, width: 36, height: 36, mr: 2 }}>
                            {deadline.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {deadline.label}
                            </Typography>
                            <Typography variant="caption">
                              {new Date(deadline.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight="bold" color={`${deadline.color}.dark`}>
                            {Math.ceil((new Date(deadline.date) - new Date()) / (1000 * 60 * 60 * 24))} days
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </CardContent>
              </GlassCard>
            </Zoom>
          </Stack>
        </Grid>
      </Grid>

      {/* AI Speed Dial */}
      <SpeedDial
        ariaLabel="AI Assistant Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon icon={<SmartToy />} openIcon={<Close />} />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleAIAction(action.action)}
            sx={{
              bgcolor: action.color,
              color: 'white',
              '&:hover': { bgcolor: action.color },
            }}
          />
        ))}
      </SpeedDial>
    </Container>
  );
};

export default EscrowDashboard;