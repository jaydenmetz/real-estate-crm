import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Divider,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  AvatarGroup,
  Tooltip,
  Stack,
  Alert,
  Badge,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Grow,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Rating,
  Collapse,
  ImageList,
  ImageListItem,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ArrowBack,
  Home,
  Bed,
  Bathroom,
  SquareFoot,
  Landscape,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  Visibility,
  Message,
  Favorite,
  Share,
  Print,
  Edit,
  MoreVert,
  LocationOn,
  DirectionsCar,
  School,
  LocalHospital,
  ShoppingCart,
  Restaurant,
  FitnessCenter,
  Pool,
  Deck,
  Fireplace,
  Kitchen,
  Weekend,
  PhotoCamera,
  VideoCameraBack,
  ThreeDRotation,
  Timeline,
  Analytics,
  People,
  Schedule,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  AutoAwesome,
  QrCode2,
  Download,
  ContentCopy,
  Email,
  Phone,
  Groups,
  Campaign,
  Psychology,
  Garage,
  Hvac,
  Close,
  OpenInNew,
  NavigateNext,
  NavigateBefore,
  LocalActivity,
  HistoryEdu,
  CameraAlt,
  Videocam,
  Map,
  Tour,
  EventAvailable,
  Info,
  WaterDrop,
  Wifi,
  LocalLaundryService,
  Balcony,
  Yard,
  AcUnit,
  CheckBox,
  CheckBoxOutlineBlank,
  FiberManualRecord,
  PlayArrow,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom as SwiperZoom, Autoplay } from 'swiper/modules';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  RadarChart, Radar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import CountUp from 'react-countup';
import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import 'swiper/css/autoplay';
import { useQuery } from 'react-query';
import { listingsAPI } from '../../services/api';
import DetailPageErrorBoundary from '../common/DetailPageErrorBoundary';

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const MetricCard = styled(motion.div)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '500px',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  background: theme.palette.grey[900],
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
  padding: theme.spacing(4),
  color: 'white',
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  '& .MuiChip-icon': {
    color: theme.palette.primary.main,
  },
}));

// Chart colors
const CHART_COLORS = ['#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];

// Safe date helpers
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

const safeFormatDate = (dateValue, formatString, fallback = 'N/A') => {
  const date = safeParseDate(dateValue);
  if (!date) return fallback;
  try {
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [aiVisionOpen, setAiVisionOpen] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(false);

  // Mock listing data
  const mockListing = {
    id: id,
    propertyAddress: '789 Pine St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    fullAddress: '789 Pine St, Anytown, CA 12345',
    mlsNumber: 'MLS123456',
    listingStatus: 'Active',
    listPrice: 565000,
    originalListPrice: 595000,
    pricePerSqft: 305,
    propertyType: 'Single Family',
    bedrooms: 3,
    bathrooms: 2,
    halfBathrooms: 0,
    squareFootage: 1850,
    lotSize: 6500,
    yearBuilt: 2018,
    garage: 2,
    pool: false,
    listDate: '2025-06-25',
    expirationDate: '2025-12-25',
    daysOnMarket: 11,
    virtualTourLink: 'https://example.com/tour/789-pine',
    professionalPhotos: true,
    dronePhotos: true,
    videoWalkthrough: true,
    propertyDescription: 'Beautiful modern home with open floor plan and high-end finishes throughout. This stunning property features a gourmet kitchen, spacious master suite, and professionally landscaped yard.',
    features: [
      'Granite Countertops',
      'Stainless Steel Appliances',
      'Hardwood Floors',
      'Walk-in Closet',
      'Energy Efficient Windows',
      'Smart Thermostat',
      'Security System',
      'Covered Patio'
    ],
    propertyImages: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    ],
    sellers: ['Thompson Family'],
    listingAgent: 'You',
    commission: 17000,
    showings: 8,
    inquiries: 15,
    offers: 1,
    viewsThisWeek: 89,
    viewsLastWeek: 76,
    favoritesCount: 12,
    analytics: {
      views: 342,
      favorites: 28,
      shares: 15,
      inquiries: 8,
      viewsThisWeek: 89,
      viewsLastWeek: 76,
      viewsTrend: 'up',
      avgTimeOnPage: '3:24',
      viewsBySource: [
        { source: 'MLS', views: 142 },
        { source: 'Zillow', views: 89 },
        { source: 'Realtor.com', views: 67 },
        { source: 'Company Website', views: 44 }
      ],
      dailyViews: [
        { date: '1/12', views: 12 },
        { date: '1/13', views: 18 },
        { date: '1/14', views: 22 },
        { date: '1/15', views: 35 },
        { date: '1/16', views: 28 },
        { date: '1/17', views: 31 },
        { date: '1/18', views: 42 }
      ]
    },
    marketingChecklist: {
      photography: true,
      virtualTour: true,
      droneVideo: true,
      floorPlan: true,
      brochures: true,
      mlsListing: true,
      zillowListing: true,
      realtorListing: true,
      socialMedia: true,
      emailCampaign: false,
      openHouse: false,
      neighborhoodMailers: false
    },
    priceHistory: [
      { date: '2025-06-25', price: 595000, event: 'Listed' },
      { date: '2025-07-02', price: 565000, event: 'Price Reduced' }
    ],
    neighborhood: {
      walkScore: 85,
      transitScore: 72,
      bikeScore: 90,
      nearbySchools: [
        { name: 'Pine Elementary', distance: '0.5 mi', rating: 8 },
        { name: 'Anytown Middle', distance: '1.2 mi', rating: 7 },
        { name: 'Central High', distance: '2.1 mi', rating: 9 }
      ],
      nearbyAmenities: [
        { type: 'Grocery', name: 'Whole Foods', distance: '0.3 mi' },
        { type: 'Park', name: 'Central Park', distance: '0.2 mi' },
        { type: 'Hospital', name: 'Anytown Medical', distance: '1.5 mi' }
      ]
    }
  };

  // Fetch listing details
  const { data: listing, isLoading, error } = useQuery(
    ['listing', id],
    async () => {
      try {
        const response = await listingsAPI.getOne(id);
        return response;
      } catch (err) {
        console.error('Error fetching listing:', err);
        return mockListing;
      }
    },
    { 
      refetchInterval: 30000,
      retry: 1,
      initialData: mockListing
    }
  );

  const displayListing = listing || mockListing;

  // AI speed dial actions
  const aiActions = [
    { 
      icon: <Campaign />, 
      name: 'Generate Marketing Copy',
      description: 'AI writes compelling listing descriptions'
    },
    { 
      icon: <PhotoCamera />, 
      name: 'Enhance Photos',
      description: 'AI optimizes property images'
    },
    { 
      icon: <Analytics />, 
      name: 'Price Analysis',
      description: 'AI analyzes optimal pricing'
    },
    { 
      icon: <Groups />, 
      name: 'Find Buyers',
      description: 'AI matches with potential buyers'
    },
    { 
      icon: <Psychology />, 
      name: 'Market Insights',
      description: 'AI provides market predictions'
    },
  ];

  // AI Vision features
  const aiVisionFeatures = [
    {
      title: 'Virtual Staging',
      description: 'Transform empty rooms with AI-powered furniture placement',
      icon: <Weekend />,
      demo: 'Show before/after staging examples',
      status: 'coming_soon'
    },
    {
      title: 'Automated Showings',
      description: 'AI agent conducts virtual property tours 24/7',
      icon: <Tour />,
      demo: 'Interactive tour simulation',
      status: 'coming_soon'
    },
    {
      title: 'Buyer Matching',
      description: 'AI matches property features with buyer preferences',
      icon: <Groups />,
      demo: 'Compatibility scoring system',
      status: 'coming_soon'
    },
    {
      title: 'Dynamic Pricing',
      description: 'Real-time price optimization based on market conditions',
      icon: <TrendingUp />,
      demo: 'Price prediction dashboard',
      status: 'coming_soon'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Coming Soon': return 'info';
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Sold': return 'default';
      case 'Expired': return 'error';
      case 'Withdrawn': return 'error';
      default: return 'default';
    }
  };

  if (isLoading && !listing) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Hero Section with Property Images */}
      <HeroSection>
        <Swiper
          modules={[Navigation, Pagination, SwiperZoom, Autoplay, Thumbs]}
          navigation
          pagination={{ clickable: true }}
          zoom
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          style={{ height: '100%' }}
        >
          {displayListing.propertyImages?.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container">
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <ImageOverlay>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {displayListing.propertyAddress}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {displayListing.city}, {displayListing.state} {displayListing.zipCode}
              </Typography>
              <Stack direction="row" spacing={2} mt={2}>
                <FeatureChip
                  icon={<Bed />}
                  label={`${displayListing.bedrooms} Beds`}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
                <FeatureChip
                  icon={<Bathroom />}
                  label={`${displayListing.bathrooms} Baths`}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
                <FeatureChip
                  icon={<SquareFoot />}
                  label={`${displayListing.squareFootage?.toLocaleString()} sqft`}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
                {displayListing.pool && (
                  <FeatureChip
                    icon={<Pool />}
                    label="Pool"
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  />
                )}
              </Stack>
            </Box>
            <Box textAlign="right">
              <Typography variant="h2" fontWeight="bold">
                {formatPrice(displayListing.listPrice)}
              </Typography>
              {displayListing.originalListPrice > displayListing.listPrice && (
                <Typography variant="body1" sx={{ textDecoration: 'line-through', opacity: 0.7 }}>
                  Was {formatPrice(displayListing.originalListPrice)}
                </Typography>
              )}
              <Chip
                label={displayListing.listingStatus}
                color={getStatusColor(displayListing.listingStatus)}
                size="large"
                sx={{ mt: 1 }}
              />
            </Box>
          </Stack>
        </ImageOverlay>

        {/* Action buttons */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <IconButton
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.5)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
            onClick={() => navigate('/listings')}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.5)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
            onClick={() => setShareDialogOpen(true)}
          >
            <Share />
          </IconButton>
          <IconButton
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.5)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <Print />
          </IconButton>
        </Stack>
      </HeroSection>

      {/* Thumbnail Gallery */}
      <Box sx={{ mb: 4 }}>
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs]}
          spaceBetween={10}
          slidesPerView={isMobile ? 3 : isTablet ? 5 : 8}
          freeMode
          watchSlidesProgress
          style={{ height: '80px' }}
        >
          {displayListing.propertyImages?.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={image}
                alt={`Thumb ${index + 1}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Visibility color="primary" />
                <Chip
                  label={`${((displayListing.viewsThisWeek - displayListing.viewsLastWeek) / displayListing.viewsLastWeek * 100).toFixed(0)}%`}
                  size="small"
                  color={displayListing.viewsThisWeek > displayListing.viewsLastWeek ? 'success' : 'error'}
                />
              </Stack>
              <Typography variant="h4" fontWeight="bold">
                <CountUp end={displayListing.analytics?.views || 342} duration={2} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Views
              </Typography>
            </Stack>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Groups color="primary" />
                <Badge badgeContent="New" color="error" />
              </Stack>
              <Typography variant="h4" fontWeight="bold">
                <CountUp end={displayListing.showings || 8} duration={2} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showings
              </Typography>
            </Stack>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Stack spacing={1}>
              <Favorite color="primary" />
              <Typography variant="h4" fontWeight="bold">
                <CountUp end={displayListing.favoritesCount || 12} duration={2} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Favorites
              </Typography>
            </Stack>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Stack spacing={1}>
              <CalendarToday color="primary" />
              <Typography variant="h4" fontWeight="bold">
                <CountUp end={displayListing.daysOnMarket || 11} duration={2} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days on Market
              </Typography>
            </Stack>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Property Details */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Property Description */}
            <GlassCard>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Property Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {displayListing.propertyDescription}
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Features & Amenities
                </Typography>
                <Grid container spacing={1}>
                  {displayListing.features?.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircle color="primary" fontSize="small" />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </GlassCard>

            {/* Analytics Chart */}
            <GlassCard>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Performance Analytics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Daily Views Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={displayListing.analytics?.dailyViews || []}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3f51b5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                        <YAxis stroke={theme.palette.text.secondary} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#3f51b5" 
                          fillOpacity={1} 
                          fill="url(#colorViews)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Traffic Sources
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={displayListing.analytics?.viewsBySource || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ source, views }) => `${source}: ${views}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="views"
                        >
                          {displayListing.analytics?.viewsBySource?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>

                {/* Key Stats */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Stack alignItems="center">
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {displayListing.analytics?.avgTimeOnPage || '3:24'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg. Time on Page
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack alignItems="center">
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {displayListing.inquiries || 15}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Inquiries
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack alignItems="center">
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {displayListing.offers || 1}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Offers
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Stack alignItems="center">
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatPrice(displayListing.pricePerSqft)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Price/sqft
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>

            {/* Marketing Checklist */}
            <GlassCard>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Marketing Checklist
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(displayListing.marketingChecklist || {}).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            color="primary"
                          />
                        }
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </GlassCard>
          </Stack>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Property Details Card */}
            <GlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Property Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Home /></ListItemIcon>
                    <ListItemText 
                      primary="Property Type" 
                      secondary={displayListing.propertyType}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarToday /></ListItemIcon>
                    <ListItemText 
                      primary="Year Built" 
                      secondary={displayListing.yearBuilt}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Landscape /></ListItemIcon>
                    <ListItemText 
                      primary="Lot Size" 
                      secondary={`${displayListing.lotSize?.toLocaleString()} sqft`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Garage /></ListItemIcon>
                    <ListItemText 
                      primary="Garage" 
                      secondary={`${displayListing.garage} Cars`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </GlassCard>

            {/* Neighborhood Info */}
            <GlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Neighborhood
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Walk Score</Typography>
                      <Chip 
                        label={displayListing.neighborhood?.walkScore || 85} 
                        color="primary" 
                        size="small"
                      />
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={displayListing.neighborhood?.walkScore || 85} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Nearby Schools
                  </Typography>
                  {displayListing.neighborhood?.nearbySchools?.map((school, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{school.name}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          {school.distance}
                        </Typography>
                        <Rating value={school.rating / 2} size="small" readOnly />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </GlassCard>

            {/* Agent Info */}
            <GlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Listing Agent
                </Typography>
                <Stack spacing={2} alignItems="center">
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80,
                      bgcolor: theme.palette.primary.main 
                    }}
                  >
                    {displayListing.listingAgent?.charAt(0) || 'Y'}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {displayListing.listingAgent}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<Phone />}
                      size="small"
                      fullWidth
                    >
                      Call
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Email />}
                      size="small"
                      fullWidth
                    >
                      Email
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                    fullWidth
                  >
                    Schedule Showing
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LocalActivity />}
                    fullWidth
                  >
                    Plan Open House
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Campaign />}
                    fullWidth
                  >
                    Boost Marketing
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<QrCode2 />}
                    fullWidth
                  >
                    Generate QR Code
                  </Button>
                </Stack>
              </CardContent>
            </GlassCard>
          </Stack>
        </Grid>
      </Grid>

      {/* AI Speed Dial */}
      <SpeedDial
        ariaLabel="AI Assistant"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<AutoAwesome />} openIcon={<Close />} />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {aiActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={
              <Box>
                <Typography variant="subtitle2">{action.name}</Typography>
                <Typography variant="caption">{action.description}</Typography>
              </Box>
            }
            onClick={() => {
              console.log(`AI Action: ${action.name}`);
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </SpeedDial>

      {/* AI Vision Button */}
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.light} 90%)`,
        }}
        onClick={() => setAiVisionOpen(true)}
      >
        <Tooltip title="AI Vision Preview">
          <Info />
        </Tooltip>
      </Fab>

      {/* AI Vision Dialog */}
      <Dialog
        open={aiVisionOpen}
        onClose={() => setAiVisionOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesome color="secondary" />
              <Typography variant="h6">AI Vision - Property Marketing</Typography>
            </Stack>
            <IconButton onClick={() => setAiVisionOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info" icon={<AutoAwesome />}>
              These AI-powered features are coming soon to revolutionize property marketing!
            </Alert>

            {aiVisionFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard>
                  <CardContent>
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                        {feature.icon}
                      </Avatar>
                      <Box flex={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{feature.title}</Typography>
                          <Chip label="Coming Soon" size="small" color="secondary" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {feature.description}
                        </Typography>
                        
                        <Collapse in={expandedFeature === index}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Preview Demo:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {feature.demo}
                            </Typography>
                          </Box>
                        </Collapse>
                        
                        <Button
                          size="small"
                          onClick={() => setExpandedFeature(expandedFeature === index ? null : index)}
                          endIcon={expandedFeature === index ? <NavigateBefore /> : <NavigateNext />}
                        >
                          {expandedFeature === index ? 'Hide Demo' : 'View Demo'}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </GlassCard>
              </motion.div>
            ))}

            <Card sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {playingVideo ? (
                  <CircularProgress color="inherit" />
                ) : (
                  <IconButton
                    sx={{
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                    }}
                    onClick={() => setPlayingVideo(true)}
                  >
                    <PlayArrow fontSize="large" />
                  </IconButton>
                )}
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  See AI Marketing in Action
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Watch how AI transforms your property listings with automated staging, 
                  dynamic pricing, and intelligent buyer matching.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiVisionOpen(false)}>Close</Button>
          <Button variant="contained" color="secondary" startIcon={<AutoAwesome />}>
            Join Waitlist
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Listing</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Button variant="outlined" startIcon={<Email />} fullWidth>
              Email to Client
            </Button>
            <Button variant="outlined" startIcon={<Message />} fullWidth>
              Send via SMS
            </Button>
            <Button variant="outlined" startIcon={<ContentCopy />} fullWidth>
              Copy Link
            </Button>
            <Button variant="outlined" startIcon={<QrCode2 />} fullWidth>
              Generate QR Code
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Wrap with error boundary
const ListingDetailWithErrorBoundary = () => (
  <DetailPageErrorBoundary pageName="Listing Detail">
    <ListingDetail />
  </DetailPageErrorBoundary>
);

export default ListingDetailWithErrorBoundary;