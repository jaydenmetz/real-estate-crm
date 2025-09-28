// frontend/src/components/dashboards/ListingsDashboard.jsx

import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
  LinearProgress,
  CircularProgress,
  Fade,
  Grow,
  Zoom,
  Stack,
  ButtonGroup,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  CardActions,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Collapse,
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  TrendingUp,
  TrendingDown,
  Home,
  RemoveRedEye,
  FavoriteBorder,
  Favorite,
  DateRange,
  CameraAlt,
  Bed,
  Bathtub,
  SquareFoot,
  LocationOn,
  LocalFireDepartment,
  Whatshot,
  NewReleases,
  AutoAwesome,
  Star,
  AttachMoney,
  Schedule,
  Groups,
  Assessment,
  Check,
  Close,
  MoreVert,
  Search,
  Sort,
  ViewList,
  ViewModule,
  Share,
  Print,
  Pool,
  Deck,
  Fireplace,
  DirectionsCar,
  PhotoCamera,
  VideoCameraBack,
  ThreeDRotation,
  QrCode2,
  Timeline,
  ShowChart,
  Speed,
  WbSunny,
  AcUnit,
  Kitchen,
  Weekend,
  Landscape,
  NavigateNext,
  BarChart,
  TrendingFlat,
  KeyboardArrowUp,
  KeyboardArrowDown,
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
import NewListingModal from '../forms/NewListingModal';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../../services/api.service';
import ListingForm from '../forms/ListingForm';
import StatsCard from '../common/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import networkMonitor from '../../services/networkMonitor.service';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(46, 125, 50, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

const StyledStatsCard = styled(Card)(({ theme, trend }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

const ListingCard = styled(Card)(({ theme, status }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.main,
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
    '& .listing-overlay': {
      opacity: 1,
    },
  },
  '& .status-badge': {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 2,
  },
  '& .price-badge': {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 2,
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    fontWeight: 'bold',
  },
}));

const FeatureBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(0.5),
  background: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
  color: 'white',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 20px 0 rgba(46, 125, 50, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #66BB6A 0%, #2E7D32 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 30px 0 rgba(46, 125, 50, 0.6)',
  },
  '& .MuiButton-startIcon': {
    animation: `${float} 3s ease-in-out infinite`,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    active: { bg: '#4caf50', text: 'white' },
    pending: { bg: '#ff9800', text: 'white' },
    sold: { bg: '#9e9e9e', text: 'white' },
    'under contract': { bg: '#2196f3', text: 'white' },
    withdrawn: { bg: '#f44336', text: 'white' },
    expired: { bg: '#795548', text: 'white' },
  };
  
  const color = colors[status?.toLowerCase()] || colors.active;
  
  return {
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 'bold',
    '& .MuiChip-icon': {
      color: color.text,
    },
  };
});

// Empty data for fresh start - this will be replaced with real data from API
const mockListings = [];

// Empty analytics data
const marketTrendData = [];

const priceRangeData = [];

const ListingsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [openNewListingModal, setOpenNewListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  // Fetch listings function
  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getAll({ includeArchived: false });

      if (response.success) {
        const listingData = response.data.listings || response.data || [];
        setListings(listingData);
      } else {
        enqueueSnackbar('Failed to fetch listings', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      enqueueSnackbar('Error fetching listings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Load listings on mount
  useEffect(() => {
    fetchListings();
  }, []);

  // Auto-refresh network data when debug panel is expanded
  useEffect(() => {
    if (debugExpanded) {
      const interval = setInterval(() => {
        setNetworkData({
          stats: networkMonitor.getStats(),
          requests: networkMonitor.getRequests(),
          errors: networkMonitor.getErrors()
        });
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [debugExpanded]);

  // Filter listings based on tab and other filters
  const getFilteredListings = () => {
    // Use actual listings from state instead of mockListings
    let filtered = [...listings];

    // Tab filters
    switch (tabValue) {
      case 1: // Active
        filtered = filtered.filter(l => l.listingStatus === 'Active');
        break;
      case 2: // Pending/Under Contract
        filtered = filtered.filter(l => ['Pending', 'Under Contract'].includes(l.listingStatus));
        break;
      case 3: // Sold
        filtered = filtered.filter(l => l.listingStatus === 'Sold');
        break;
      case 4: // Hot Properties
        filtered = filtered.filter(l => l.views > 400 || l.favorites > 30);
        break;
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(l => 
        l.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.mlsNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Property type filter
    if (propertyType !== 'all') {
      filtered = filtered.filter(l => l.propertyType === propertyType);
    }

    // Price range filter
    switch (priceRange) {
      case 'under500k':
        filtered = filtered.filter(l => l.listPrice < 500000);
        break;
      case '500k-750k':
        filtered = filtered.filter(l => l.listPrice >= 500000 && l.listPrice < 750000);
        break;
      case '750k-1m':
        filtered = filtered.filter(l => l.listPrice >= 750000 && l.listPrice < 1000000);
        break;
      case '1m-1.5m':
        filtered = filtered.filter(l => l.listPrice >= 1000000 && l.listPrice < 1500000);
        break;
      case 'over1.5m':
        filtered = filtered.filter(l => l.listPrice >= 1500000);
        break;
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.listingDate) - new Date(a.listingDate));
        break;
      case 'price-high':
        filtered.sort((a, b) => b.listPrice - a.listPrice);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.listPrice - b.listPrice);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views + b.favorites * 10) - (a.views + a.favorites * 10));
        break;
    }

    return filtered;
  };

  const filteredListings = getFilteredListings();

  // Calculate stats based on filtered listings
  const stats = {
    totalListings: filteredListings.length,
    activeListings: filteredListings.filter(l => l.listingStatus === 'Active').length,
    totalValue: filteredListings.reduce((sum, l) => sum + (l.listPrice || 0), 0),
    avgDaysOnMarket: filteredListings.length > 0 ? Math.round(filteredListings.reduce((sum, l) => sum + (l.daysOnMarket || 0), 0) / filteredListings.length) : 0,
    hotProperties: filteredListings.filter(l => (l.views || 0) > 400 || (l.favorites || 0) > 30).length,
    newThisWeek: filteredListings.filter(l => l.listingDate && differenceInDays(new Date(), new Date(l.listingDate)) <= 7).length,
    pendingListings: filteredListings.filter(l => ['Pending', 'Under Contract'].includes(l.listingStatus)).length,
    soldListings: filteredListings.filter(l => l.listingStatus === 'Sold').length,
  };

  // Generate chart data for mini sparklines
  const generateSparklineData = (count) => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        day: i,
        value: Math.floor(Math.random() * count) + Math.floor(count * 0.5)
      });
    }
    return data;
  };

  const handleListingClick = (listing) => {
    navigate(`/listings/${listing.id}`);
  };

  const handleCreateListing = () => {
    setOpenNewListingModal(true);
  };

  const handleEditListing = (listing, e) => {
    e.stopPropagation();
    setSelectedListing(listing);
    setOpenForm(true);
  };

  const renderListingCard = (listing) => (
    <ListingCard key={listing.id} onClick={() => handleListingClick(listing)}>
      <CardMedia
        component="img"
        height="240"
        image={listing.primaryImage}
        alt={listing.propertyAddress}
        sx={{ transition: 'transform 0.3s ease' }}
      />
      
      <StatusChip
        className="status-badge"
        label={listing.listingStatus}
        size="small"
        status={listing.listingStatus}
        icon={listing.listingStatus === 'Active' ? <Whatshot /> : 
              listing.listingStatus === 'Pending' ? <Schedule /> :
              listing.listingStatus === 'Sold' ? <Check /> : null}
      />
      
      <Typography className="price-badge" variant="h6">
        ${(listing.listPrice || 0).toLocaleString()}
      </Typography>

      <Box
        className="listing-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 2,
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Bed />
                <Typography variant="caption" display="block">{listing.bedrooms} beds</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <Bathtub />
                <Typography variant="caption" display="block">{listing.bathrooms} baths</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <SquareFoot />
                <Typography variant="caption" display="block">{(listing.squareFootage || 0).toLocaleString()} ft²</Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <DirectionsCar />
                <Typography variant="caption" display="block">{listing.garage} garage</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <CardContent>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {listing.propertyAddress.split(',')[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {listing.propertyAddress.split(',').slice(1).join(',')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          MLS# {listing.mlsNumber}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <FeatureBadge>
            <Home sx={{ fontSize: 16 }} />
            {listing.propertyType}
          </FeatureBadge>
          <FeatureBadge>
            <AttachMoney sx={{ fontSize: 16 }} />
            ${listing.pricePerSqFt}/ft²
          </FeatureBadge>
          {listing.pool && (
            <FeatureBadge>
              <Pool sx={{ fontSize: 16 }} />
              Pool
            </FeatureBadge>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <RemoveRedEye sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {listing.views}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteBorder sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {listing.favorites}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Groups sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {listing.showings}
              </Typography>
            </Box>
          </Stack>
          
          <Typography variant="caption" color="text.secondary">
            {listing.daysOnMarket} days on market
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          {listing.virtualTourLink && (
            <Tooltip title="Virtual Tour Available">
              <IconButton size="small">
                <ThreeDRotation color="primary" />
              </IconButton>
            </Tooltip>
          )}
          {listing.dronePhotos && (
            <Tooltip title="Drone Photos">
              <IconButton size="small">
                <PhotoCamera color="primary" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
            <Share />
          </IconButton>
          <IconButton size="small" onClick={(e) => handleEditListing(listing, e)}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
            <MoreVert />
          </IconButton>
        </Stack>
      </CardActions>
    </ListingCard>
  );

  const columns = [
    {
      field: 'propertyAddress',
      headerName: 'Property',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.row.propertyAddress.split(',')[0]}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            MLS# {params.row.mlsNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'listingStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip
          label={params.value}
          size="small"
          status={params.value}
        />
      ),
    },
    {
      field: 'listPrice',
      headerName: 'List Price',
      width: 130,
      renderCell: (params) => `$${(params.value || 0).toLocaleString()}`,
    },
    {
      field: 'bedrooms',
      headerName: 'Beds/Baths',
      width: 100,
      renderCell: (params) => `${params.row.bedrooms}/${params.row.bathrooms}`,
    },
    {
      field: 'squareFootage',
      headerName: 'Sq Ft',
      width: 100,
      renderCell: (params) => (params.value || 0).toLocaleString(),
    },
    {
      field: 'daysOnMarket',
      headerName: 'DOM',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value > 60 ? 'error' : params.value > 30 ? 'warning' : 'success'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => navigate(`/listings/${params.row.id}`)}>
            <Visibility />
          </IconButton>
          <IconButton size="small" onClick={() => handleEditListing(params.row)}>
            <Edit />
          </IconButton>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Stunning Debug Interface - Admin Only */}
      {user?.username === 'admin' && (
        <Box sx={{ mb: 4 }}>
          {/* Summary Debug Card */}
          <Card 
            sx={(theme) => ({
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.08)} 50%, 
                ${alpha(theme.palette.error.main, 0.08)} 100%
              )`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: '16px',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 33%, 
                  ${theme.palette.error.main} 66%, 
                  ${theme.palette.warning.main} 100%
                )`,
              }
            })}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={(theme) => ({
                      p: 1.5,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                    })}
                  >
                    <BugReport />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                    Debug Panel: Listings Dashboard
                  </Typography>
                  <Chip 
                    label={process.env.NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟢 LOCAL'} 
                    sx={{
                      background: process.env.NODE_ENV === 'production' 
                        ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)'
                        : 'linear-gradient(45deg, #00b894, #00cec9)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip 
                    label="Admin Only" 
                    sx={{
                      background: 'linear-gradient(45deg, #fdcb6e, #e17055)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setDebugExpanded(!debugExpanded)}
                    startIcon={debugExpanded ? <ExpandLess /> : <ExpandMore />}
                    sx={(theme) => ({
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.1)
                      }
                    })}
                  >
                    {debugExpanded ? 'Hide' : 'Show'} Debug Details
                  </Button>
                  <IconButton 
                    size="small"
                    onClick={() => {
                      // Update network data from network monitor
                      setNetworkData({
                        stats: networkMonitor.getStats(),
                        requests: networkMonitor.getRequests(),
                        errors: networkMonitor.getErrors()
                      });
                      enqueueSnackbar('Network data refreshed', { variant: 'info' });
                    }}
                    sx={(theme) => ({
                      color: theme.palette.primary.main,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1)
                      }
                    })}
                  >
                    <Tooltip title="Refresh Network Data">
                      <Refresh />
                    </Tooltip>
                  </IconButton>
                  <CopyButton 
                    text={JSON.stringify({
                      pageInfo: {
                        url: window.location.href,
                        timestamp: new Date().toISOString(),
                        user: user?.username,
                        userAgent: navigator.userAgent,
                        screenResolution: `${window.screen.width}x${window.screen.height}`
                      },
                      dashboardData: {
                        totalListings: mockListings.length,
                        stats,
                        listingsSample: mockListings.slice(0, 3).map(l => ({
                          id: l.id,
                          address: l.address,
                          status: l.listingStatus,
                          listPrice: l.listPrice
                        })),
                        loading: false,
                        hasData: true
                      },
                      networkActivity: {
                        stats: networkData.stats,
                        recentRequests: networkData.requests.slice(-5),
                        errorCount: networkData.stats.errors,
                        allRequests: networkData.requests,
                        allErrors: networkData.errors
                      },
                      browserInfo: {
                        location: window.location,
                        localStorage: {
                          hasUser: !!localStorage.getItem('user'),
                          userKeys: Object.keys(localStorage)
                        }
                      }
                    }, null, 2)}
                    label="📋 Copy Debug Summary"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2, #667eea)',
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Detailed Debug Panel */}
          <Collapse in={debugExpanded}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Dashboard Statistics */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Analytics /> Dashboard Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Total Listings</Typography>
                        <Typography variant="h4">{mockListings.length}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Active Listings</Typography>
                        <Typography variant="h4">{stats.activeListings}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Portfolio Value</Typography>
                        <Typography variant="h5">${(stats.totalValue / 1000000).toFixed(1)}M</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Avg Days on Market</Typography>
                        <Typography variant="h5">{stats.avgDaysOnMarket}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>

              {/* API & Network Info */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 169, 244, 0.1))',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NetworkCheck /> Network & API Status
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">API Endpoint</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {process.env.REACT_APP_API_URL || 'Not configured'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Environment</Typography>
                        <Chip 
                          label={process.env.NODE_ENV} 
                          size="small" 
                          color={process.env.NODE_ENV === 'production' ? 'error' : 'success'}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Network Requests</Typography>
                        <Typography variant="body2">{networkData.stats.total}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Network Errors</Typography>
                        <Typography variant="body2" color={networkData.stats.errors > 0 ? 'error' : 'inherit'}>
                          {networkData.stats.errors}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Error Rate</Typography>
                        <Typography variant="body2" color={networkData.stats.errorRate > 10 ? 'error' : 'inherit'}>
                          {networkData.stats.errorRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Avg Response Time</Typography>
                        <Typography variant="body2">
                          {networkData.stats.avgDuration.toFixed(0)}ms
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* Recent Listings */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Storage /> Recent Listings Data
                    </Typography>
                    <Stack spacing={2}>
                      {listings.slice(0, 3).map((listing) => (
                        <Box 
                          key={listing.id}
                          sx={{ 
                            p: 2, 
                            background: 'rgba(0,0,0,0.03)', 
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ID: {listing.id} | Status: {listing.listingStatus}
                          </Typography>
                          <Typography variant="body2">
                            {listing.address}
                          </Typography>
                          <Typography variant="body2">
                            Price: ${listing.listPrice.toLocaleString()} | DOM: {listing.daysOnMarket}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* Network Activity Log */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(171, 71, 188, 0.1))',
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  borderRadius: '12px'
                }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NetworkCheck /> Network Activity Log
                      <Chip 
                        label={`${networkData.requests.length} requests`} 
                        size="small" 
                        sx={{ ml: 'auto' }}
                      />
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <Stack spacing={1}>
                        {networkData.requests.slice(-10).reverse().map((req, index) => (
                          <Box 
                            key={req.id || index}
                            sx={{ 
                              p: 1.5, 
                              background: req.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              border: `1px solid ${req.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {req.method} {req.statusCode || 'PENDING'}
                              </Typography>
                              <Typography variant="caption">
                                {req.duration ? `${req.duration}ms` : 'pending...'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ 
                              display: 'block', 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }}>
                              {req.url}
                            </Typography>
                            {req.error && (
                              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                Error: {req.error}
                              </Typography>
                            )}
                          </Box>
                        ))}
                        {networkData.requests.length === 0 && (
                          <Typography variant="caption" color="text.secondary" align="center">
                            No network requests yet. Refresh to see latest activity.
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      )}

      {/* Hero Section with Green Background and Stats */}
      <HeroSection>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom color="white">
              Listings Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, color: 'white' }}>
              Manage and showcase your properties with powerful marketing tools
            </Typography>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleCreateListing}
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#2E7D32',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                Create New Listing
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Assessment />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Market Analysis
              </Button>
            </Stack>

            {/* Stats Cards inside Hero */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                      <Typography color="textSecondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        {tabValue === 0 ? 'Total' : tabValue === 1 ? 'Active' : tabValue === 2 ? 'Pending/UC' : tabValue === 3 ? 'Sold' : 'Hot'} Listings
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        <CountUp end={stats.totalListings} duration={2} preserveValue />
                      </Typography>
                      <Box sx={{ height: 40, mt: 1, opacity: 0.7 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={generateSparklineData(stats.totalListings)}>
                            <defs>
                              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#2E7D32" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                      <Typography color="textSecondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        Active
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        <CountUp end={stats.activeListings} duration={2} preserveValue />
                      </Typography>
                      <Box sx={{ height: 40, mt: 1, opacity: 0.7 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={generateSparklineData(stats.activeListings)}>
                            <Line type="monotone" dataKey="value" stroke="#4CAF50" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                      <Typography color="textSecondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        Total Value
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        ${stats.totalValue > 0 ? <CountUp end={stats.totalValue / 1000000} decimals={1} duration={2} preserveValue /> : '0'}M
                      </Typography>
                      <Box sx={{ height: 40, mt: 1, opacity: 0.7 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={generateSparklineData(Math.floor(stats.totalValue / 100000) || 1)}>
                            <Bar dataKey="value" fill="#FF9800" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                      <Typography color="textSecondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        Avg DOM
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        <CountUp end={stats.avgDaysOnMarket} duration={2} preserveValue />
                      </Typography>
                      <Box sx={{ height: 40, mt: 1, opacity: 0.7 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={generateSparklineData(stats.avgDaysOnMarket)}>
                            <defs>
                              <linearGradient id="colorDom" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#2196F3" fillOpacity={1} fill="url(#colorDom)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                      <Typography color="textSecondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        Hot Properties
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        <CountUp end={stats.hotProperties} duration={2} preserveValue />
                      </Typography>
                      <Box sx={{ height: 40, mt: 1, opacity: 0.7 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={generateSparklineData(stats.hotProperties || 1)}>
                            <Line type="monotone" dataKey="value" stroke="#FF5722" strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
                      <Typography color="textSecondary" variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        New This Week
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                        <CountUp end={stats.newThisWeek} duration={2} preserveValue />
                      </Typography>
                      <Box sx={{ height: 40, mt: 1, opacity: 0.7 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={generateSparklineData(stats.newThisWeek || 1)}>
                            <Bar dataKey="value" fill="#9C27B0" radius={[4, 4, 0, 0]} />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Box>
      </HeroSection>

      {/* Stats Cards - Removed as they're now in hero */}
      <Grid container spacing={3} sx={{ mb: 4, display: 'none' }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StyledStatsCard trend="up">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    New This Week
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={stats.newThisWeek} duration={2} />
                  </Typography>
                  <Chip
                    size="small"
                    icon={<TrendingUp sx={{ fontSize: 16 }} />}
                    label="+23% vs last week"
                    sx={{ mt: 1, bgcolor: 'success.light', color: 'success.dark' }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <NewReleases />
                </Avatar>
              </Box>
            </StyledStatsCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StyledStatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Avg Days on Market
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={stats.avgDaysOnMarket} duration={2} />
                  </Typography>
                  <Chip
                    size="small"
                    icon={<TrendingFlat sx={{ fontSize: 16 }} />}
                    label="Industry avg: 45"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}>
                  <Schedule />
                </Avatar>
              </Box>
            </StyledStatsCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StyledStatsCard trend="up">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Hot Properties
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={stats.hotProperties} duration={2} />
                  </Typography>
                  <Chip
                    size="small"
                    icon={<LocalFireDepartment sx={{ fontSize: 16 }} />}
                    label="High engagement"
                    sx={{ mt: 1, bgcolor: 'error.light', color: 'error.dark' }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'error.light', width: 48, height: 48 }}>
                  <Whatshot />
                </Avatar>
              </Box>
            </StyledStatsCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StyledStatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Total Showings
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    <CountUp end={listings.reduce((sum, l) => sum + (l.showings || 0), 0)} duration={2} />
                  </Typography>
                  <Chip
                    size="small"
                    icon={<Groups sx={{ fontSize: 16 }} />}
                    label="This month"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                  <Groups />
                </Avatar>
              </Box>
            </StyledStatsCard>
          </motion.div>
        </Grid>
      </Grid>


      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 60,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab 
              label="All Listings" 
              icon={<Home />} 
              iconPosition="start"
              sx={{ px: 3 }}
            />
            <Tab 
              label={`Active (${stats.activeListings})`} 
              icon={<Whatshot />} 
              iconPosition="start"
              sx={{ px: 3 }}
            />
            <Tab 
              label="Pending/UC" 
              icon={<Schedule />} 
              iconPosition="start"
              sx={{ px: 3 }}
            />
            <Tab 
              label="Sold" 
              icon={<Check />} 
              iconPosition="start"
              sx={{ px: 3 }}
            />
            <Tab 
              label={`Hot Properties (${stats.hotProperties})`} 
              icon={<LocalFireDepartment />} 
              iconPosition="start"
              sx={{ px: 3, color: 'error.main' }}
            />
          </Tabs>
        </Paper>
      </motion.div>

      {/* Listings Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredListings.map((listing, index) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {renderListingCard(listing)}
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ height: 600 }}>
              <DataGrid
                rows={filteredListings}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                disableSelectionOnClick
                onRowClick={(params) => navigate(`/listings/${params.row.id}`)}
                sx={{
                  '& .MuiDataGrid-row:hover': {
                    cursor: 'pointer',
                  },
                }}
              />
            </Paper>
          )}
        </motion.div>
      </AnimatePresence>

      {/* New Listing Modal */}
      <NewListingModal
        open={openNewListingModal}
        onClose={() => setOpenNewListingModal(false)}
        onSuccess={async (newListing) => {
          await fetchListings();
          setOpenNewListingModal(false);
          enqueueSnackbar('Listing created successfully', { variant: 'success' });
        }}
      />

      {/* Listing Form Dialog */}
      <ListingForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        listing={selectedListing}
        onSuccess={() => {
          setOpenForm(false);
          queryClient.invalidateQueries('listings');
          enqueueSnackbar(
            selectedListing ? 'Listing updated successfully' : 'Listing created successfully',
            { variant: 'success' }
          );
        }}
      />
    </Container>
  );
};

export default ListingsDashboard;