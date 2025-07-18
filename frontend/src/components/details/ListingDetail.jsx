// frontend/src/components/details/ListingDetail.jsx

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
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
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
  NavigateNext,
  RemoveRedEye,
  FavoriteBorder,
  Groups,
  TrendingDown,
  Chat,
  Task,
  Assessment,
  Speed,
  WbSunny,
  AcUnit,
  Garage,
  Grass,
  LocalLaundryService,
  Balcony,
  EmojiEvents,
  Star,
  StarBorder,
  WhatsApp,
  Sms,
  Category,
  DateRange,
  Description,
  History,
  SystemUpdate,
  BarChart,
  ShowChart,
  Domain,
  AccountTree,
  PeopleAlt,
  Receipt,
  Security,
  Person,
  Info,
  VisibilityOff,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';
import CountUp from 'react-countup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { listingsAPI } from '../../services/api';
import ListingForm from '../forms/ListingForm';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
  color: 'white',
  minHeight: 500,
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(46, 125, 50, 0.3)',
  [theme.breakpoints.down('md')]: {
    minHeight: 400,
  },
}));

const PropertyImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  height: '100%',
  '& .swiper': {
    borderRadius: theme.spacing(2),
    height: '100%',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    '&::after': {
      fontSize: '20px',
    },
  },
  '& .swiper-pagination-bullet': {
    background: 'white',
    opacity: 0.6,
    '&.swiper-pagination-bullet-active': {
      opacity: 1,
    },
  },
}));

const PropertyFeature = ({ icon: Icon, label, value }) => (
  <Box sx={{ textAlign: 'center', color: 'white' }}>
    <Icon sx={{ fontSize: 28, mb: 0.5, opacity: 0.9 }} />
    <Typography variant="h6" fontWeight="bold">{value}</Typography>
    <Typography variant="caption" sx={{ opacity: 0.8 }}>{label}</Typography>
  </Box>
);

const AnimatedCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const MetricCard = styled(Card)(({ theme, trend }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.1)',
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

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
  '& .MuiChip-icon': {
    marginLeft: theme.spacing(0.5),
  },
}));

const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: status === 'Active' ? '#44b700' : 
                     status === 'Pending' ? '#ff9800' : 
                     status === 'Sold' ? '#757575' : '#f44336',
    color: status === 'Active' ? '#44b700' : 
           status === 'Pending' ? '#ff9800' : 
           status === 'Sold' ? '#757575' : '#f44336',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'Active' ? `${pulse} 2s infinite` : 'none',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

// Mock listing detail data
const mockListingDetail = {
  id: 1,
  propertyAddress: '123 Ocean View Drive, La Jolla, CA 92037',
  mlsNumber: 'SD2024001',
  listingStatus: 'Active',
  listPrice: 2850000,
  originalListPrice: 2950000,
  pricePerSqFt: 892,
  propertyType: 'Single Family',
  yearBuilt: 2018,
  lotSize: 12500,
  squareFootage: 3200,
  bedrooms: 4,
  bathrooms: 3.5,
  garage: 3,
  stories: 2,
  pool: true,
  spa: true,
  fireplace: true,
  view: 'Ocean',
  
  // Additional details
  propertyDescription: 'Stunning modern home with panoramic ocean views. This architectural masterpiece features an open floor plan, floor-to-ceiling windows, and premium finishes throughout. The gourmet kitchen boasts professional-grade appliances and a large center island perfect for entertaining.',
  
  // Features
  features: {
    interior: [
      'Hardwood Floors',
      'Granite Countertops',
      'Stainless Steel Appliances',
      'Walk-in Closets',
      'Master Suite',
      'Laundry Room',
      'Home Office',
      'Wine Cellar',
      'Smart Home System'
    ],
    exterior: [
      'Private Pool',
      'Spa/Hot Tub',
      'Outdoor Kitchen',
      'Fire Pit',
      'Garden',
      '3-Car Garage',
      'Security System',
      'Solar Panels'
    ],
    community: [
      'Gated Community',
      'Tennis Courts',
      'Clubhouse',
      'Walking Trails',
      'Private Beach Access'
    ]
  },
  
  // Room details
  rooms: [
    { name: 'Living Room', dimensions: '20x25', level: 1 },
    { name: 'Kitchen', dimensions: '18x20', level: 1 },
    { name: 'Master Bedroom', dimensions: '16x20', level: 2 },
    { name: 'Home Office', dimensions: '12x14', level: 1 },
    { name: 'Media Room', dimensions: '15x18', level: 1 }
  ],
  
  // Financial
  taxes: 28500,
  hoaDues: 450,
  insurance: 3200,
  utilities: 350,
  
  // Dates
  listingDate: '2024-01-05',
  lastPriceChange: '2024-01-20',
  daysOnMarket: 45,
  
  // Statistics
  views: 1842,
  favorites: 156,
  showings: 28,
  offers: 3,
  
  // Photos
  photos: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200',
  ],
  
  // Virtual tour
  virtualTourUrl: 'https://my.matterport.com/show/?m=example',
  videoUrl: 'https://www.youtube.com/embed/example',
  
  // Marketing
  marketingRemarks: 'Exceptional oceanfront estate in prestigious La Jolla. Don\'t miss this rare opportunity!',
  specialFeatures: ['Ocean View', 'Pool', 'Smart Home', 'Solar', 'Gated'],
  
  // Agents
  listingAgent: {
    name: 'You',
    phone: '(858) 555-0001',
    email: 'you@realty.com',
    license: 'DRE# 01234567'
  },
  
  // Seller info
  sellers: ['John & Jane Smith'],
  showingInstructions: 'Call listing agent for appointment. 24-hour notice required.',
  
  // Commission
  commission: {
    listing: 2.5,
    buyer: 2.5,
    total: 5.0
  },
  
  // Nearby
  schools: [
    { name: 'La Jolla Elementary', rating: 9, distance: '0.5 mi' },
    { name: 'Muirlands Middle School', rating: 8, distance: '1.2 mi' },
    { name: 'La Jolla High School', rating: 9, distance: '1.8 mi' }
  ],
  
  // Activity log
  activityLog: [
    { date: '2024-02-15', type: 'showing', agent: 'Jane Doe', feedback: 'Clients loved the view!' },
    { date: '2024-02-14', type: 'inquiry', source: 'Zillow', message: 'Is this still available?' },
    { date: '2024-02-13', type: 'price_change', oldPrice: 2950000, newPrice: 2850000 },
    { date: '2024-02-12', type: 'showing', agent: 'Bob Smith', feedback: 'Too expensive for clients' },
  ]
};

// Analytics data
const viewsData = [
  { day: 'Mon', views: 45, favorites: 5 },
  { day: 'Tue', views: 62, favorites: 8 },
  { day: 'Wed', views: 78, favorites: 12 },
  { day: 'Thu', views: 92, favorites: 15 },
  { day: 'Fri', views: 104, favorites: 18 },
  { day: 'Sat', views: 142, favorites: 24 },
  { day: 'Sun', views: 168, favorites: 28 },
];

const trafficSourceData = [
  { source: 'Zillow', visits: 485, fill: '#006AFF' },
  { source: 'Realtor.com', visits: 342, fill: '#D92228' },
  { source: 'MLS', visits: 278, fill: '#27AE60' },
  { source: 'Social Media', visits: 195, fill: '#1877F2' },
  { source: 'Direct', visits: 156, fill: '#8B5CF6' },
  { source: 'Other', visits: 86, fill: '#6B7280' },
];

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  
  // In a real app, this would fetch from API
  const listing = mockListingDetail;
  
  // Calculate derived values
  const priceChange = listing.listPrice - listing.originalListPrice;
  const priceChangePercent = (priceChange / listing.originalListPrice) * 100;
  const monthlyPayment = Math.round((listing.listPrice * 0.8 * 0.065 / 12) / (1 - Math.pow(1 + 0.065/12, -360)));
  const potentialRent = Math.round(listing.listPrice * 0.004);
  
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing property: ${listing.propertyAddress}`;
    
    switch(platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
        break;
      case 'email':
        window.open(`mailto:?subject=${text}&body=${url}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(text + ' ' + url)}`);
        break;
    }
    setShareDialogOpen(false);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'success',
      'Pending': 'warning',
      'Sold': 'default',
      'Withdrawn': 'error',
      'Expired': 'default'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/')}
        >
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body1"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/listings')}
        >
          Listings
        </Link>
        <Typography color="text.primary">{listing.propertyAddress}</Typography>
      </Breadcrumbs>

      {/* Beautiful Hero Section with Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection>
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 }, display: 'flex', alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ width: '100%' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton 
                    onClick={() => navigate('/listings')} 
                    sx={{ 
                      mr: 2, 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <StatusBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    status={listing.listingStatus}
                  >
                    <Chip
                      label={listing.listingStatus}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 'bold'
                      }}
                    />
                  </StatusBadge>
                </Box>

                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {listing.propertyAddress.split(',')[0]}
                </Typography>
                <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                  {listing.propertyAddress.split(',').slice(1).join(',')}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      ${(listing.listPrice || 0).toLocaleString()}
                    </Typography>
                    {priceChange !== 0 && (
                      <Chip
                        icon={priceChange < 0 ? <TrendingDown /> : <TrendingUp />}
                        label={`${priceChange < 0 ? '' : '+'}$${Math.abs(priceChange || 0).toLocaleString()} (${(priceChangePercent || 0).toFixed(1)}%)`}
                        sx={{ 
                          bgcolor: priceChange < 0 ? 'success.main' : 'error.main',
                          color: 'white',
                          mt: 1
                        }}
                      />
                    )}
                  </Box>
                </Stack>

                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  {listing.propertyType} • MLS# {listing.mlsNumber}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Schedule />}
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    Schedule Showing
                  </Button>
                  <IconButton sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={() => setShareDialogOpen(true)}>
                    <Share />
                  </IconButton>
                  <IconButton sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
                    <Favorite />
                  </IconButton>
                  <IconButton sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={handlePrint}>
                    <Print />
                  </IconButton>
                  <IconButton sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Quick Stats */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                      <Typography variant="h5" fontWeight="bold">{listing.daysOnMarket}</Typography>
                      <Typography variant="caption">Days on Market</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                      <Typography variant="h5" fontWeight="bold">{(listing.views || 0).toLocaleString()}</Typography>
                      <Typography variant="caption">Total Views</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                      <Typography variant="h5" fontWeight="bold">{listing.favorites}</Typography>
                      <Typography variant="caption">Favorites</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 2 }}>
                      <Typography variant="h5" fontWeight="bold">{listing.showings}</Typography>
                      <Typography variant="caption">Showings</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ position: 'relative', height: { xs: 400, md: '100%' } }}>
              <PropertyImageContainer sx={{ height: '100%' }}>
                <Swiper
                  modules={[Navigation, Pagination, Autoplay, EffectFade, Thumbs]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  effect="fade"
                  thumbs={{ swiper: thumbsSwiper }}
                  style={{ height: '100%' }}
                  onSlideChange={(swiper) => setSelectedPhoto(swiper.activeIndex)}
                >
                  {listing.photos.map((photo, index) => (
                    <SwiperSlide key={index}>
                      <Box
                        sx={{
                          height: '100%',
                          background: `url(${photo}) center/cover`,
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setSelectedPhoto(index);
                          setPhotoGalleryOpen(true);
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
                              <PropertyFeature icon={Bed} label="Beds" value={listing.bedrooms} />
                            </Grid>
                            <Grid item xs={3}>
                              <PropertyFeature icon={Bathroom} label="Baths" value={listing.bathrooms} />
                            </Grid>
                            <Grid item xs={3}>
                              <PropertyFeature icon={SquareFoot} label="Sq Ft" value={(listing.squareFootage || 0).toLocaleString()} />
                            </Grid>
                            <Grid item xs={3}>
                              <PropertyFeature icon={DirectionsCar} label="Garage" value={listing.garage} />
                            </Grid>
                          </Grid>
                        </Box>
                        
                        {/* Photo count badge */}
                        <Chip
                          icon={<PhotoCamera />}
                          label={`${index + 1} / ${listing.photos.length}`}
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                          }}
                        />
                      </Box>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
                {/* Thumbnail navigation */}
                {!isMobile && (
                  <Box sx={{ mt: 2 }}>
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={6}
                      freeMode={true}
                      watchSlidesProgress={true}
                      modules={[Thumbs]}
                    >
                      {listing.photos.map((photo, index) => (
                        <SwiperSlide key={index}>
                          <Box
                            sx={{
                              height: 60,
                              background: `url(${photo}) center/cover`,
                              borderRadius: 1,
                              cursor: 'pointer',
                              opacity: 0.7,
                              transition: 'opacity 0.3s',
                              '&:hover': {
                                opacity: 1,
                              },
                            }}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </Box>
                )}
              </PropertyImageContainer>
            </Grid>
          </Grid>
        </HeroSection>
      </motion.div>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3, mt: -2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <MetricCard trend="neutral">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Price per Sq Ft
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    $<CountUp end={listing.pricePerSqFt} duration={2} />
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg area: $750
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <ShowChart />
                </Avatar>
              </Box>
            </MetricCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <MetricCard trend="up">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Est. Monthly Payment
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${showFinancials ? <CountUp end={monthlyPayment} duration={2} separator="," /> : '••••'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    20% down, 6.5% APR
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
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
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <MetricCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Potential Rent
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${showFinancials ? <CountUp end={potentialRent} duration={2} separator="," /> : '••••'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Per month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}>
                  <Home />
                </Avatar>
              </Box>
            </MetricCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <MetricCard trend="up">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Activity Score
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={95} duration={2} />
                  </Typography>
                  <Chip
                    size="small"
                    icon={<TrendingUp sx={{ fontSize: 16 }} />}
                    label="High demand"
                    sx={{ mt: 1, bgcolor: 'success.light', color: 'success.dark' }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}>
                  <Speed />
                </Avatar>
              </Box>
            </MetricCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Financial Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch 
              checked={showFinancials}
              onChange={(e) => setShowFinancials(e.target.checked)}
            />
          }
          label="Show Financial Details"
        />
      </Box>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
              '& .Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white !important',
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab icon={<Home />} label="Overview" iconPosition="start" />
            <Tab icon={<Category />} label="Features" iconPosition="start" />
            <Tab icon={<AttachMoney />} label="Financial" iconPosition="start" />
            <Tab icon={<PhotoCamera />} label="Media" iconPosition="start" />
            <Tab icon={<Analytics />} label="Analytics" iconPosition="start" />
            <Tab icon={<History />} label="Activity" iconPosition="start" />
            <Tab icon={<LocationOn />} label="Location" iconPosition="start" />
            <Tab icon={<Description />} label="Documents" iconPosition="start" />
          </Tabs>
        </Paper>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Home sx={{ mr: 1 }} />
                    Property Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {listing.propertyDescription}
                  </Typography>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Category sx={{ mr: 1 }} />
                    Key Features
                  </Typography>
                  <Grid container spacing={2}>
                    {listing.specialFeatures.map((feature, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <FeatureChip
                          icon={
                            feature === 'Ocean View' ? <Visibility /> :
                            feature === 'Pool' ? <Pool /> :
                            feature === 'Smart Home' ? <AutoAwesome /> :
                            feature === 'Solar' ? <WbSunny /> :
                            feature === 'Gated' ? <Security /> :
                            <Check />
                          }
                          label={feature}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Weekend sx={{ mr: 1 }} />
                    Room Details
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {listing.rooms.map((room, index) => (
                          <TableRow key={index}>
                            <TableCell>{room.name}</TableCell>
                            <TableCell>{room.dimensions}</TableCell>
                            <TableCell>Level {room.level}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <AnimatedCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Info sx={{ mr: 1 }} />
                      Quick Facts
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Year Built" secondary={listing.yearBuilt} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Lot Size" secondary={`${(listing.lotSize || 0).toLocaleString()} sq ft`} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Stories" secondary={listing.stories} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="View" secondary={listing.view} />
                      </ListItem>
                    </List>
                  </CardContent>
                </AnimatedCard>
                
                <AnimatedCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1 }} />
                      Contact Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Listing Agent" 
                          secondary={listing.listingAgent.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Phone" 
                          secondary={listing.listingAgent.phone}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={listing.listingAgent.email}
                        />
                      </ListItem>
                    </List>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<Schedule />}
                      sx={{ mt: 2 }}
                    >
                      Schedule a Showing
                    </Button>
                  </CardContent>
                </AnimatedCard>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Features Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Home sx={{ mr: 1 }} />
                    Interior Features
                  </Typography>
                  <List dense>
                    {listing.features.interior.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Landscape sx={{ mr: 1 }} />
                    Exterior Features
                  </Typography>
                  <List dense>
                    {listing.features.exterior.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Groups sx={{ mr: 1 }} />
                    Community Features
                  </Typography>
                  <List dense>
                    {listing.features.community.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>
        )}

        {/* Financial Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    Price Analysis
                  </Typography>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>List Price</TableCell>
                        <TableCell align="right">
                          <Typography variant="h6">${(listing.listPrice || 0).toLocaleString()}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Original Price</TableCell>
                        <TableCell align="right">${(listing.originalListPrice || 0).toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Price Change</TableCell>
                        <TableCell align="right" sx={{ color: priceChange < 0 ? 'success.main' : 'error.main' }}>
                          {priceChange < 0 ? '' : '+'} ${Math.abs(priceChange || 0).toLocaleString()} ({(priceChangePercent || 0).toFixed(1)}%)
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Price per Sq Ft</TableCell>
                        <TableCell align="right">${listing.pricePerSqFt}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Receipt sx={{ mr: 1 }} />
                    Monthly Expenses
                  </Typography>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Property Taxes</TableCell>
                        <TableCell align="right">${(listing.taxes / 12).toFixed(0)}/mo</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>HOA Dues</TableCell>
                        <TableCell align="right">${listing.hoaDues}/mo</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Insurance (est.)</TableCell>
                        <TableCell align="right">${(listing.insurance / 12).toFixed(0)}/mo</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Utilities (est.)</TableCell>
                        <TableCell align="right">${listing.utilities}/mo</TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Total Monthly</strong></TableCell>
                        <TableCell align="right">
                          <Typography variant="h6">
                            ${((listing.taxes / 12) + listing.hoaDues + (listing.insurance / 12) + listing.utilities).toFixed(0)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShowChart sx={{ mr: 1 }} />
                    Commission Breakdown
                  </Typography>
                  {showFinancials ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="primary">
                            ${(((listing.listPrice || 0) * ((listing.commission && listing.commission.listing) || 0)) / 100).toLocaleString()}
                          </Typography>
                          <Typography variant="body1">Listing Side ({listing.commission.listing}%)</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h4" color="secondary">
                            ${(((listing.listPrice || 0) * ((listing.commission && listing.commission.buyer) || 0)) / 100).toLocaleString()}
                          </Typography>
                          <Typography variant="body1">Buyer Side ({listing.commission.buyer}%)</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                          <Typography variant="h4" color="success.main">
                            ${(((listing.listPrice || 0) * ((listing.commission && listing.commission.total) || 0)) / 100).toLocaleString()}
                          </Typography>
                          <Typography variant="body1">Total Commission ({listing.commission.total}%)</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <VisibilityOff sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        Financial details are hidden. Toggle to view.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>
        )}

        {/* Media Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AnimatedCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhotoCamera sx={{ mr: 1 }} />
                      Photo Gallery ({listing.photos.length} photos)
                    </Typography>
                    <ButtonGroup>
                      <Button startIcon={<ThreeDRotation />} onClick={() => setShowVirtualTour(true)}>
                        Virtual Tour
                      </Button>
                      <Button startIcon={<VideoCameraBack />}>
                        Video Tour
                      </Button>
                    </ButtonGroup>
                  </Box>
                  
                  <ImageList variant="quilted" cols={4} gap={8}>
                    {listing.photos.map((photo, index) => (
                      <ImageListItem 
                        key={index} 
                        cols={index === 0 ? 2 : 1} 
                        rows={index === 0 ? 2 : 1}
                      >
                        <img
                          src={photo}
                          alt={`Property photo ${index + 1}`}
                          loading="lazy"
                          style={{ cursor: 'pointer', borderRadius: 8 }}
                          onClick={() => {
                            setSelectedPhoto(index);
                            setPhotoGalleryOpen(true);
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>
        )}

        {/* Analytics Tab */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Views & Favorites Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={viewsData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFavorites" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F44336" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#F44336" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#2E7D32" 
                        fillOpacity={1} 
                        fill="url(#colorViews)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="favorites" 
                        stroke="#F44336" 
                        fillOpacity={1} 
                        fill="url(#colorFavorites)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Traffic Sources
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.source}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="visits"
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={85}
                          size={100}
                          thickness={8}
                          sx={{ color: 'success.main' }}
                        />
                        <Typography variant="h6" sx={{ mt: 2 }}>85%</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Above similar listings
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={92}
                          size={100}
                          thickness={8}
                          sx={{ color: 'primary.main' }}
                        />
                        <Typography variant="h6" sx={{ mt: 2 }}>92%</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Photo quality score
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={78}
                          size={100}
                          thickness={8}
                          sx={{ color: 'warning.main' }}
                        />
                        <Typography variant="h6" sx={{ mt: 2 }}>78%</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Search visibility
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress
                          variant="determinate"
                          value={95}
                          size={100}
                          thickness={8}
                          sx={{ color: 'info.main' }}
                        />
                        <Typography variant="h6" sx={{ mt: 2 }}>95%</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Response rate
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>
        )}

        {/* Activity Tab */}
        {activeTab === 5 && (
          <AnimatedCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1 }} />
                Activity Log
              </Typography>
              <List>
                {listing.activityLog.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'showing' ? <Groups /> :
                         activity.type === 'inquiry' ? <Message /> :
                         activity.type === 'price_change' ? <TrendingDown /> :
                         <Schedule />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          activity.type === 'showing' ? `Showing with ${activity.agent}` :
                          activity.type === 'inquiry' ? `Inquiry from ${activity.source}` :
                          activity.type === 'price_change' ? `Price reduced from $${(activity.oldPrice || 0).toLocaleString()} to $${(activity.newPrice || 0).toLocaleString()}` :
                          'Activity'
                        }
                        secondary={
                          <>
                            {format(new Date(activity.date), 'MMM d, yyyy')}
                            {activity.feedback && ` - ${activity.feedback}`}
                            {activity.message && ` - ${activity.message}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < listing.activityLog.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </AnimatedCard>
        )}

        {/* Location Tab */}
        {activeTab === 6 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1 }} />
                    Location & Neighborhood
                  </Typography>
                  {/* Map placeholder */}
                  <Box
                    sx={{
                      height: 400,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Interactive Map View
                    </Typography>
                  </Box>
                </CardContent>
              </AnimatedCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <AnimatedCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 1 }} />
                    Nearby Schools
                  </Typography>
                  <List>
                    {listing.schools.map((school, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={school.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={school.rating / 2} readOnly size="small" />
                              <Typography variant="caption">{school.distance}</Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>
        )}

        {/* Documents Tab */}
        {activeTab === 7 && (
          <AnimatedCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1 }} />
                Documents & Resources
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary="Property Brochure" secondary="PDF, 2.4 MB" />
                  <Button startIcon={<Download />}>Download</Button>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <QrCode2 />
                  </ListItemIcon>
                  <ListItemText primary="QR Code Flyer" secondary="PDF, 1.1 MB" />
                  <Button startIcon={<Download />}>Download</Button>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhotoCamera />
                  </ListItemIcon>
                  <ListItemText primary="High-Res Photos" secondary="ZIP, 45.2 MB" />
                  <Button startIcon={<Download />}>Download</Button>
                </ListItem>
              </List>
            </CardContent>
          </AnimatedCard>
        )}
      </motion.div>

      {/* Speed Dial Actions */}
      <SpeedDial
        ariaLabel="Property actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Edit />}
          tooltipTitle="Edit Listing"
          onClick={() => setEditFormOpen(true)}
        />
        <SpeedDialAction
          icon={<Share />}
          tooltipTitle="Share"
          onClick={() => setShareDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<Print />}
          tooltipTitle="Print"
          onClick={handlePrint}
        />
        <SpeedDialAction
          icon={<Schedule />}
          tooltipTitle="Schedule Showing"
        />
      </SpeedDial>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setAnchorEl(null); setEditFormOpen(true); }}>
          <ListItemIcon><Edit /></ListItemIcon>
          Edit Listing
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><ContentCopy /></ListItemIcon>
          Duplicate Listing
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Download /></ListItemIcon>
          Export Data
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Analytics /></ListItemIcon>
          View Full Analytics
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <ListItemIcon><ErrorIcon sx={{ color: 'error.main' }} /></ListItemIcon>
          Remove Listing
        </MenuItem>
      </Menu>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Listing</DialogTitle>
        <DialogContent>
          <List>
            <ListItem button onClick={() => handleShare('copy')}>
              <ListItemIcon><ContentCopy /></ListItemIcon>
              <ListItemText primary="Copy Link" />
            </ListItem>
            <ListItem button onClick={() => handleShare('email')}>
              <ListItemIcon><Email /></ListItemIcon>
              <ListItemText primary="Email" />
            </ListItem>
            <ListItem button onClick={() => handleShare('whatsapp')}>
              <ListItemIcon><WhatsApp /></ListItemIcon>
              <ListItemText primary="WhatsApp" />
            </ListItem>
            <ListItem button onClick={() => handleShare('sms')}>
              <ListItemIcon><Sms /></ListItemIcon>
              <ListItemText primary="Text Message" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form */}
      <ListingForm
        open={editFormOpen}
        onClose={() => setEditFormOpen(false)}
        listing={listing}
        onSuccess={() => {
          setEditFormOpen(false);
          queryClient.invalidateQueries(['listing', id]);
          enqueueSnackbar('Listing updated successfully', { variant: 'success' });
        }}
      />

      {/* Photo Gallery Dialog */}
      <Dialog
        open={photoGalleryOpen}
        onClose={() => setPhotoGalleryOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
          <IconButton
            onClick={() => setPhotoGalleryOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
            }}
          >
            <Close />
          </IconButton>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            initialSlide={selectedPhoto}
            style={{ height: '80vh' }}
          >
            {listing.photos.map((photo, index) => (
              <SwiperSlide key={index}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'black',
                  }}
                >
                  <img
                    src={photo}
                    alt={`Property photo ${index + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </DialogContent>
      </Dialog>

      {/* Virtual Tour Dialog */}
      <Dialog
        open={showVirtualTour}
        onClose={() => setShowVirtualTour(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          Virtual Tour
          <IconButton
            onClick={() => setShowVirtualTour(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: '70vh', bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Virtual Tour Viewer
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ListingDetail;