import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Divider,
  LinearProgress,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import DetailPageDebugger from '../common/DetailPageDebugger';
import DetailPageErrorBoundary from '../common/DetailPageErrorBoundary';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Edit,
  Share,
  Print,
  MoreVert,
  Home,
  LocationOn,
  AttachMoney,
  CalendarToday,
  SquareFoot,
  Bed,
  Bathtub,
  DirectionsCar,
  Pool,
  CameraAlt,
  Videocam,
  RemoveRedEye,
  Favorite,
  FavoriteBorder,
  School,
  LocalHospital,
  ShoppingCart,
  DirectionsTransit,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  Schedule,
  Note,
  Email,
  Phone,
  Groups,
  Assessment,
  Description,
  CloudDownload,
  Add,
  OpenInNew,
  ContentCopy,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { listingsAPI } from '../../services/api';

// Safe date parsing helper
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // If it's already a Date object, return it
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // Try to parse the date string
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// Safe date formatting helper
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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [openShareDialog, setOpenShareDialog] = useState(false);

  // Debug logging
  console.log('[ListingDetail] Component mounted');
  console.log('[ListingDetail] ID received:', id);
  console.log('[ListingDetail] Window location:', window.location.href);

  // Mock listing data for demonstration
  const mockListing = {
    id: id,
    propertyAddress: '123 Main Street',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92101',
    fullAddress: '123 Main Street, San Diego, CA 92101',
    mlsNumber: 'SD2024001',
    listingStatus: 'Active',
    listPrice: 850000,
    originalListPrice: 875000,
    pricePerSqft: 354,
    propertyType: 'Single Family',
    bedrooms: 4,
    bathrooms: 3,
    halfBathrooms: 0,
    squareFootage: 2400,
    lotSize: 7200,
    yearBuilt: 2018,
    garage: 2,
    pool: true,
    listingDate: '2024-01-05',
    expirationDate: '2024-07-05',
    daysOnMarket: 15,
    virtualTourLink: 'https://example.com/tour/123',
    professionalPhotos: true,
    dronePhotos: true,
    videoWalkthrough: true,
    propertyDescription: 'Beautiful modern home in prime location. This stunning 4-bedroom, 3-bathroom residence offers contemporary luxury living with an open floor plan, gourmet kitchen, and resort-style backyard. High ceilings, natural light, and premium finishes throughout.',
    features: [
      'Gourmet Kitchen with Quartz Countertops',
      'Stainless Steel Appliances',
      'Hardwood Floors Throughout',
      'Master Suite with Walk-in Closet',
      'Resort-Style Pool and Spa',
      'Smart Home Technology',
      'Solar Panels',
      'EV Charging Station',
      'Custom Built-ins',
      'Drought-Resistant Landscaping'
    ],
    sellers: [
      { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '(555) 123-4568' }
    ],
    listingAgent: {
      id: 1,
      name: 'You',
      email: 'agent@realestate.com',
      phone: '(555) 999-8888'
    },
    commission: {
      listing: 3.0,
      buyer: 2.5,
      total: 5.5
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ],
    showings: [
      { id: 1, date: '2024-01-18', time: '2:00 PM', agent: 'Sarah Chen', feedback: 'Clients loved it, considering offer' },
      { id: 2, date: '2024-01-17', time: '10:00 AM', agent: 'Mike Johnson', feedback: 'Price too high for clients' },
      { id: 3, date: '2024-01-16', time: '4:00 PM', agent: 'Lisa Wong', feedback: 'Very interested, second showing requested' },
      { id: 4, date: '2024-01-15', time: '11:00 AM', agent: 'David Park', feedback: 'Not enough bedrooms' }
    ],
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
      { date: '2024-01-05', price: 875000, event: 'Listed' },
      { date: '2024-01-12', price: 850000, event: 'Price Reduced' }
    ],
    comparableProperties: [
      { address: '456 Oak Ave', soldPrice: 825000, soldDate: '2023-12-15', sqft: 2350, pricePerSqft: 351 },
      { address: '789 Elm St', soldPrice: 890000, soldDate: '2023-11-20', sqft: 2500, pricePerSqft: 356 },
      { address: '321 Pine Rd', soldPrice: 835000, soldDate: '2024-01-02', sqft: 2300, pricePerSqft: 363 }
    ],
    notes: [
      { id: 1, content: 'Sellers motivated due to job relocation', createdAt: '2024-01-05', createdBy: 'You' },
      { id: 2, content: 'Price reduction approved by sellers', createdAt: '2024-01-12', createdBy: 'You' },
      { id: 3, content: 'Open house scheduled for this weekend', createdAt: '2024-01-16', createdBy: 'Marketing Team' }
    ],
    documents: [
      { id: 1, name: 'Property Disclosure', type: 'PDF', size: '2.4 MB', uploadedDate: '2024-01-05' },
      { id: 2, name: 'Survey Report', type: 'PDF', size: '1.8 MB', uploadedDate: '2024-01-05' },
      { id: 3, name: 'HOA Documents', type: 'PDF', size: '5.2 MB', uploadedDate: '2024-01-06' },
      { id: 4, name: 'Marketing Brochure', type: 'PDF', size: '3.1 MB', uploadedDate: '2024-01-08' }
    ]
  };

  // Fetch listing details
  const { data: listing, isLoading, error, isError } = useQuery(
    ['listing', id],
    async () => {
      try {
        const response = await listingsAPI.getOne(id);
        return response;
      } catch (err) {
        console.error('Error fetching listing:', err);
        // Return mock data on error
        return mockListing;
      }
    },
    { 
      refetchInterval: 30000,
      retry: 1
    }
  );

  const displayListing = listing || mockListing;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      // API call would go here
      setNewNote('');
      queryClient.invalidateQueries(['listing', id]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleChecklistToggle = async (category, item) => {
    try {
      // API call to update checklist
      queryClient.invalidateQueries(['listing', id]);
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await listingsAPI.updateStatus(id, newStatus);
      queryClient.invalidateQueries(['listing', id]);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePriceUpdate = async (newPrice) => {
    try {
      await listingsAPI.updatePrice(id, newPrice);
      queryClient.invalidateQueries(['listing', id]);
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

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

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !listing) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Failed to load listing details. Please try again later.
        </Alert>
      </Container>
    );
  }

  if (!displayListing) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Listing not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <DetailPageDebugger 
        pageName="ListingDetail"
        id={id}
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={displayListing}
        additionalInfo={{
          activeTab,
          hasListingData: !!listing,
          usingMockData: !listing && !!displayListing
        }}
      />
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/listings')}
          sx={{ textDecoration: 'none' }}
        >
          Listings
        </Link>
        <Typography color="textPrimary">{displayListing.propertyAddress}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4">{displayListing.fullAddress}</Typography>
              <Chip
                label={displayListing.listingStatus}
                color={getStatusColor(displayListing.listingStatus)}
              />
              {displayListing.pool && (
                <Chip icon={<Pool />} label="Pool" variant="outlined" />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Typography variant="body1" color="text.secondary">
                <strong>MLS#:</strong> {displayListing.mlsNumber}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Listed:</strong> {safeFormatDate(displayListing.listingDate, 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>DOM:</strong> {displayListing.daysOnMarket}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="h3" color="primary">
                  {formatPrice(displayListing.listPrice)}
                </Typography>
                {displayListing.originalListPrice !== displayListing.listPrice && (
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    Original: {formatPrice(displayListing.originalListPrice)}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="body1">
                  <Bed sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
                  {displayListing.bedrooms} Bedrooms
                </Typography>
                <Typography variant="body1">
                  <Bathtub sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
                  {displayListing.bathrooms} Bathrooms
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">
                  <SquareFoot sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
                  {displayListing.squareFootage.toLocaleString()} sqft
                </Typography>
                <Typography variant="body1">
                  <AttachMoney sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
                  {formatPrice(displayListing.pricePerSqft)}/sqft
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => setEditMode(!editMode)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => setOpenShareDialog(true)}>
              <Share />
            </IconButton>
            <IconButton>
              <Print />
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          handleStatusChange('Pending');
          setAnchorEl(null);
        }}>
          Mark as Pending
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/listings/${id}/edit`);
          setAnchorEl(null);
        }}>
          Edit Listing
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          Schedule Open House
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          Generate Flyer
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          View on MLS
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          Withdraw Listing
        </MenuItem>
      </Menu>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Overview" />
          <Tab label="Analytics" />
          <Tab label="Showings" />
          <Tab label="Marketing" />
          <Tab label="Documents" />
          <Tab label="Activity" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Property Images */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Property Images</Typography>
                <ImageList cols={3} gap={8}>
                  {displayListing.images.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        loading="lazy"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedImage(image);
                          setOpenImageDialog(true);
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {displayListing.virtualTourLink && (
                    <Button
                      startIcon={<Videocam />}
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(displayListing.virtualTourLink, '_blank')}
                    >
                      Virtual Tour
                    </Button>
                  )}
                  <Button startIcon={<CameraAlt />} variant="outlined" size="small">
                    Upload Photos
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h4">{displayListing.analytics.views}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Views</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4">{displayListing.analytics.favorites}</Typography>
                    <Typography variant="body2" color="text.secondary">Favorites</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">This Week</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2">{displayListing.analytics.viewsThisWeek}</Typography>
                    {displayListing.analytics.viewsTrend === 'up' ? (
                      <TrendingUp color="success" fontSize="small" />
                    ) : (
                      <TrendingDown color="error" fontSize="small" />
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Inquiries</Typography>
                  <Typography variant="body2">{displayListing.analytics.inquiries}</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Seller Information</Typography>
                {displayListing.sellers.map((seller) => (
                  <Box key={seller.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">{seller.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {seller.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {seller.phone}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Commission */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commission</Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Listing Side</TableCell>
                      <TableCell align="right">{displayListing.commission.listing}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Buyer Side</TableCell>
                      <TableCell align="right">{displayListing.commission.buyer}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{displayListing.commission.total}%</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Commission Amount</strong></TableCell>
                      <TableCell align="right">
                        <strong>{formatPrice(displayListing.listPrice * displayListing.commission.total / 100)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {/* Property Description */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Property Description</Typography>
                <Typography variant="body1" paragraph>
                  {displayListing.propertyDescription}
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Features</Typography>
                <Grid container spacing={2}>
                  {displayListing.features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Comparable Properties */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Comparable Sales</Typography>
                <Table>
                  <TableBody>
                    {displayListing.comparableProperties.map((comp, index) => (
                      <TableRow key={index}>
                        <TableCell>{comp.address}</TableCell>
                        <TableCell>{formatPrice(comp.soldPrice)}</TableCell>
                        <TableCell>{comp.sqft.toLocaleString()} sqft</TableCell>
                        <TableCell>{formatPrice(comp.pricePerSqft)}/sqft</TableCell>
                        <TableCell>{safeFormatDate(comp.soldDate, 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Views Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Daily Views</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={displayListing.analytics.dailyViews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#1976d2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Views by Source */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Views by Source</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={displayListing.analytics.viewsBySource} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="source" type="category" />
                    <RechartsTooltip />
                    <Bar dataKey="views" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Analytics Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Analytics Summary</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{displayListing.analytics.avgTimeOnPage}</Typography>
                      <Typography variant="body2" color="text.secondary">Avg. Time on Page</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{displayListing.analytics.shares}</Typography>
                      <Typography variant="body2" color="text.secondary">Shares</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {((displayListing.analytics.favorites / displayListing.analytics.views) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Save Rate</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {((displayListing.analytics.inquiries / displayListing.analytics.views) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Inquiry Rate</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Upcoming Showings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Showing History</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => navigate('/appointments/new', { state: { listingId: id } })}
                  >
                    Schedule Showing
                  </Button>
                </Box>
                <List>
                  {displayListing.showings.map((showing) => (
                    <ListItem key={showing.id} divider>
                      <ListItemIcon>
                        <Groups />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${safeFormatDate(showing.date, 'MMM d, yyyy')} at ${showing.time} - ${showing.agent}`}
                        secondary={showing.feedback ? `Feedback: ${showing.feedback}` : 'No feedback yet'}
                      />
                      <Chip
                        label={showing.feedback ? 'Feedback Received' : 'Pending Feedback'}
                        color={showing.feedback ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Showing Summary */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4">{displayListing.showings.length}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Showings</Typography>
                      </Box>
                      <Groups color="primary" sx={{ fontSize: 40, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4">
                          {displayListing.showings.filter(s => s.feedback && s.feedback.toLowerCase().includes('interested')).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Interested Parties</Typography>
                      </Box>
                      <Favorite color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4">
                          {Math.round(displayListing.analytics.views / displayListing.showings.length)}:1
                        </Typography>
                        <Typography variant="body2" color="text.secondary">View to Showing Ratio</Typography>
                      </Box>
                      <Assessment color="info" sx={{ fontSize: 40, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Marketing Checklist */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Marketing Checklist</Typography>
                <FormGroup>
                  {Object.entries(displayListing.marketingChecklist).map(([key, value]) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={value}
                          onChange={() => handleChecklistToggle('marketing', key)}
                        />
                      }
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    />
                  ))}
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Marketing Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Email />}
                      onClick={() => navigate('/email-templates', { state: { listingId: id } })}
                    >
                      Send Email Campaign
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Facebook />}
                      onClick={() => setOpenShareDialog(true)}
                    >
                      Share on Social Media
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Description />}
                    >
                      Generate Marketing Flyer
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CalendarToday />}
                    >
                      Schedule Open House
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Price History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Price History</Typography>
                <Timeline>
                  {displayListing.priceHistory.map((price, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent color="text.secondary">
                        {safeFormatDate(price.date, 'MMM d, yyyy')}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={index === 0 ? 'primary' : 'secondary'} />
                        {index < displayListing.priceHistory.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="h6">{formatPrice(price.price)}</Typography>
                        <Typography variant="body2" color="text.secondary">{price.event}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          {/* Documents */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Documents</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                  >
                    Upload Document
                  </Button>
                </Box>
                <List>
                  {displayListing.documents.map((doc) => (
                    <ListItem
                      key={doc.id}
                      secondaryAction={
                        <IconButton edge="end" aria-label="download">
                          <CloudDownload />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${doc.type} • ${doc.size} • Uploaded ${doc.uploadedDate}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && (
        <Grid container spacing={3}>
          {/* Notes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 1 }}
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    Add Note
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {displayListing.notes.map((note) => (
                    <ListItem key={note.id} alignItems="flex-start">
                      <ListItemText
                        primary={note.content}
                        secondary={
                          <>
                            {note.createdBy} • {safeFormatDate(note.createdAt, 'MMM dd, yyyy h:mm a')}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Image Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <img src={selectedImage} alt="Property" style={{ width: '100%' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)}>
        <DialogTitle>Share Listing</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Facebook />}
                onClick={() => {
                  window.open(`https://facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
                  setOpenShareDialog(false);
                }}
              >
                Facebook
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Twitter />}
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`, '_blank');
                  setOpenShareDialog(false);
                }}
              >
                Twitter
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Instagram />}
              >
                Instagram
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LinkedIn />}
                onClick={() => {
                  window.open(`https://linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank');
                  setOpenShareDialog(false);
                }}
              >
                LinkedIn
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setOpenShareDialog(false);
                }}
              >
                Copy Link
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const ListingDetailWithErrorBoundary = () => (
  <DetailPageErrorBoundary pageName="ListingDetail">
    <ListingDetail />
  </DetailPageErrorBoundary>
);

export default ListingDetailWithErrorBoundary;