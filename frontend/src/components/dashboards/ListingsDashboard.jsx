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
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../../services/api';
import ListingForm from '../forms/ListingForm';
import StatsCard from '../common/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
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

// Mock data generators
const generateMockListings = () => {
  const addresses = [
    '123 Ocean View Drive, La Jolla, CA 92037',
    '456 Sunset Boulevard, Del Mar, CA 92014',
    '789 Palm Avenue, Coronado, CA 92118',
    '321 Harbor Lane, Point Loma, CA 92106',
    '654 Beach Street, Pacific Beach, CA 92109',
    '987 Hillcrest Avenue, Bankers Hill, CA 92103',
    '147 Park Row, Balboa Park, CA 92101',
    '258 Marina Way, Downtown, CA 92101',
    '369 Canyon Road, Mission Hills, CA 92103',
    '741 Vista Drive, Mount Soledad, CA 92037',
  ];

  const images = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
    'https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=800',
    'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
  ];

  const statuses = ['Active', 'Active', 'Active', 'Pending', 'Under Contract', 'Active', 'Active', 'Sold', 'Active', 'Active'];
  const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Single Family', 'Condo', 'Single Family', 'Condo', 'Single Family', 'Townhouse', 'Single Family'];

  return addresses.map((address, index) => ({
    id: index + 1,
    propertyAddress: address,
    mlsNumber: `SD2024${String(index + 1).padStart(3, '0')}`,
    listingStatus: statuses[index],
    listPrice: 750000 + (index * 150000) + Math.floor(Math.random() * 200000),
    originalListPrice: 800000 + (index * 150000) + Math.floor(Math.random() * 200000),
    propertyType: propertyTypes[index],
    bedrooms: 3 + Math.floor(Math.random() * 3),
    bathrooms: 2 + Math.floor(Math.random() * 2),
    squareFootage: 1800 + Math.floor(Math.random() * 1500),
    lotSize: 5000 + Math.floor(Math.random() * 10000),
    yearBuilt: 2010 + Math.floor(Math.random() * 14),
    garage: 2 + Math.floor(Math.random() * 2),
    pool: Math.random() > 0.5,
    listingDate: new Date(2024, 0, 1 + index * 3).toISOString().split('T')[0],
    daysOnMarket: Math.floor(Math.random() * 90),
    views: 200 + Math.floor(Math.random() * 500),
    favorites: 10 + Math.floor(Math.random() * 50),
    showings: 5 + Math.floor(Math.random() * 20),
    primaryImage: images[index],
    virtualTourLink: `https://example.com/tour/${index + 1}`,
    professionalPhotos: true,
    dronePhotos: Math.random() > 0.3,
    sellers: [`Seller ${index + 1}`],
    listingAgent: 'You',
    buyerAgent: statuses[index] === 'Under Contract' ? 'Other Agent' : null,
    commission: { listing: 2.5, buyer: 2.5 },
    pricePerSqFt: null,
    hoaDues: Math.random() > 0.5 ? 200 + Math.floor(Math.random() * 400) : 0,
    features: {
      hasPool: Math.random() > 0.5,
      hasFireplace: Math.random() > 0.7,
      hasDeck: Math.random() > 0.6,
      hasHardwoodFloors: Math.random() > 0.5,
      hasGraniteCounters: Math.random() > 0.7,
      hasStainlessAppliances: Math.random() > 0.8,
    }
  })).map(listing => ({
    ...listing,
    pricePerSqFt: Math.floor(listing.listPrice / listing.squareFootage),
  }));
};

const mockListings = generateMockListings();

// Mock analytics data
const marketTrendData = [
  { month: 'Jan', avgPrice: 850000, listings: 45, sold: 32 },
  { month: 'Feb', avgPrice: 865000, listings: 52, sold: 38 },
  { month: 'Mar', avgPrice: 875000, listings: 58, sold: 42 },
  { month: 'Apr', avgPrice: 890000, listings: 61, sold: 45 },
  { month: 'May', avgPrice: 905000, listings: 65, sold: 48 },
  { month: 'Jun', avgPrice: 920000, listings: 68, sold: 52 },
];

const priceRangeData = [
  { range: '<$500k', count: 5, fill: '#8884d8' },
  { range: '$500k-$750k', count: 12, fill: '#83a6ed' },
  { range: '$750k-$1M', count: 18, fill: '#8dd1e1' },
  { range: '$1M-$1.5M', count: 15, fill: '#82ca9d' },
  { range: '$1.5M+', count: 8, fill: '#ffc658' },
];

const ListingsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Filter listings based on tab and other filters
  const getFilteredListings = () => {
    let filtered = [...mockListings];

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

  // Calculate stats
  const stats = {
    totalListings: mockListings.length,
    activeListings: mockListings.filter(l => l.listingStatus === 'Active').length,
    totalValue: mockListings.reduce((sum, l) => sum + l.listPrice, 0),
    avgDaysOnMarket: Math.round(mockListings.reduce((sum, l) => sum + l.daysOnMarket, 0) / mockListings.length),
    hotProperties: mockListings.filter(l => l.views > 400 || l.favorites > 30).length,
    newThisWeek: mockListings.filter(l => differenceInDays(new Date(), new Date(l.listingDate)) <= 7).length,
  };

  const handleListingClick = (listing) => {
    navigate(`/listings/${listing.id}`);
  };

  const handleCreateListing = () => {
    setSelectedListing(null);
    setOpenForm(true);
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
        ${listing.listPrice.toLocaleString()}
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
                <Typography variant="caption" display="block">{listing.squareFootage.toLocaleString()} ft²</Typography>
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
      renderCell: (params) => `$${params.value.toLocaleString()}`,
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
      renderCell: (params) => params.value.toLocaleString(),
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
      {/* Hero Section */}
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
                  Your Listings Portfolio
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  Manage and showcase your properties with powerful marketing tools
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <AnimatedButton
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={handleCreateListing}
                  >
                    Create New Listing
                  </AnimatedButton>
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
                    Market Analysis
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
                    <CountUp end={stats.activeListings} duration={2} />
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Active Listings
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                    $<CountUp end={stats.totalValue} duration={2.5} separator="," />
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Portfolio Value
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
                    <CountUp end={mockListings.reduce((sum, l) => sum + l.showings, 0)} duration={2} />
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

      {/* Market Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Market Trends
                </Typography>
                <ToggleButtonGroup
                  value="price"
                  exclusive
                  size="small"
                >
                  <ToggleButton value="price">Price</ToggleButton>
                  <ToggleButton value="volume">Volume</ToggleButton>
                  <ToggleButton value="dom">DOM</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={marketTrendData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="avgPrice" 
                    stroke="#2E7D32" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Price Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priceRangeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.count} listings`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {priceRangeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by address or MLS#..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  label="Property Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Single Family">Single Family</MenuItem>
                  <MenuItem value="Condo">Condo</MenuItem>
                  <MenuItem value="Townhouse">Townhouse</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  label="Price Range"
                >
                  <MenuItem value="all">All Prices</MenuItem>
                  <MenuItem value="under500k">Under $500k</MenuItem>
                  <MenuItem value="500k-750k">$500k - $750k</MenuItem>
                  <MenuItem value="750k-1m">$750k - $1M</MenuItem>
                  <MenuItem value="1m-1.5m">$1M - $1.5M</MenuItem>
                  <MenuItem value="over1.5m">Over $1.5M</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="price-high">Price (High to Low)</MenuItem>
                  <MenuItem value="price-low">Price (Low to High)</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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