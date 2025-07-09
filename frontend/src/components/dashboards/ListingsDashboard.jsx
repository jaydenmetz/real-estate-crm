import React, { useState } from 'react';
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
} from '@mui/material';
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
  DateRange,
  CameraAlt,
  Bed,
  Bathtub,
  SquareFoot,
  LocationOn,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../../services/api';
import ListingForm from '../forms/ListingForm';
import StatsCard from '../common/StatsCard';

const ListingsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Mock listings data
  const mockListings = [
    {
      id: 1,
      propertyAddress: '123 Main Street, San Diego, CA 92101',
      mlsNumber: 'SD2024001',
      listingStatus: 'Active',
      listPrice: 850000,
      originalListPrice: 875000,
      propertyType: 'Single Family',
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2400,
      lotSize: 7200,
      yearBuilt: 2018,
      garage: 2,
      pool: true,
      listingDate: '2024-01-05',
      daysOnMarket: 15,
      views: 342,
      favorites: 28,
      showings: 12,
      primaryImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      virtualTourLink: 'https://example.com/tour/123',
      professionalPhotos: true,
      dronePhotos: true,
      sellers: ['John & Jane Smith'],
      listingAgent: 'You',
      buyerAgent: null,
      commission: { listing: 3.0, buyer: 2.5 }
    },
    {
      id: 2,
      propertyAddress: '456 Oak Avenue, La Jolla, CA 92037',
      mlsNumber: 'LJ2024002',
      listingStatus: 'Active',
      listPrice: 1250000,
      originalListPrice: 1250000,
      propertyType: 'Condo',
      bedrooms: 3,
      bathrooms: 2.5,
      squareFootage: 1800,
      yearBuilt: 2020,
      garage: 2,
      pool: false,
      listingDate: '2024-01-10',
      daysOnMarket: 10,
      views: 256,
      favorites: 18,
      showings: 8,
      primaryImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      virtualTourLink: 'https://example.com/tour/456',
      professionalPhotos: true,
      dronePhotos: false,
      sellers: ['Michael Johnson'],
      listingAgent: 'You',
      buyerAgent: null,
      commission: { listing: 3.0, buyer: 2.5 }
    },
    {
      id: 3,
      propertyAddress: '789 Beach Drive, Carlsbad, CA 92008',
      mlsNumber: 'CB2024003',
      listingStatus: 'Pending',
      listPrice: 2100000,
      originalListPrice: 2250000,
      propertyType: 'Single Family',
      bedrooms: 5,
      bathrooms: 4.5,
      squareFootage: 3800,
      lotSize: 12000,
      yearBuilt: 2016,
      garage: 3,
      pool: true,
      listingDate: '2023-12-15',
      daysOnMarket: 35,
      views: 567,
      favorites: 45,
      showings: 22,
      primaryImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      virtualTourLink: 'https://example.com/tour/789',
      professionalPhotos: true,
      dronePhotos: true,
      sellers: ['Robert & Susan Williams'],
      listingAgent: 'You',
      buyerAgent: 'Sarah Chen',
      commission: { listing: 3.0, buyer: 2.5 }
    },
    {
      id: 4,
      propertyAddress: '321 Sunset Boulevard, Del Mar, CA 92014',
      mlsNumber: 'DM2024004',
      listingStatus: 'Coming Soon',
      listPrice: 3500000,
      originalListPrice: 3500000,
      propertyType: 'Single Family',
      bedrooms: 6,
      bathrooms: 5,
      squareFootage: 4500,
      lotSize: 15000,
      yearBuilt: 2022,
      garage: 3,
      pool: true,
      listingDate: '2024-01-25',
      daysOnMarket: 0,
      views: 0,
      favorites: 0,
      showings: 0,
      primaryImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
      virtualTourLink: null,
      professionalPhotos: false,
      dronePhotos: false,
      sellers: ['The Thompson Trust'],
      listingAgent: 'You',
      buyerAgent: null,
      commission: { listing: 3.0, buyer: 2.5 }
    }
  ];

  // Filter listings based on tab
  const statusMap = ['all', 'Coming Soon', 'Active', 'Pending', 'Sold'];
  const currentStatus = statusMap[tabValue];

  const { data, isLoading } = useQuery(
    ['listings', currentStatus],
    () => {
      // Return mock data
      if (currentStatus === 'all') {
        return { listings: mockListings };
      }
      return { 
        listings: mockListings.filter(l => l.listingStatus === currentStatus) 
      };
    },
    { staleTime: 30000 }
  );

  const listings = data?.listings || [];

  // Calculate stats
  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.listingStatus === 'Active').length,
    pendingListings: listings.filter(l => l.listingStatus === 'Pending').length,
    totalValue: listings.reduce((sum, l) => sum + l.listPrice, 0),
    avgDaysOnMarket: Math.round(
      listings.filter(l => l.daysOnMarket > 0).reduce((sum, l) => sum + l.daysOnMarket, 0) / 
      listings.filter(l => l.daysOnMarket > 0).length || 0
    ),
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
  };

  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedListing(null);
  };

  const handleListingClick = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Coming Soon': return 'info';
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Sold': return 'default';
      case 'Expired': return 'error';
      default: return 'default';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Listings</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            New Listing
          </Button>
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard
            title="Total Listings"
            value={stats.totalListings}
            icon={<Home sx={{ color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard
            title="Active"
            value={stats.activeListings}
            icon={<TrendingUp sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard
            title="Pending"
            value={stats.pendingListings}
            icon={<DateRange sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard
            title="Total Value"
            value={formatPrice(stats.totalValue)}
            icon={<TrendingUp sx={{ color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard
            title="Avg DOM"
            value={stats.avgDaysOnMarket}
            icon={<DateRange sx={{ color: 'info.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={<RemoveRedEye sx={{ color: 'secondary.main' }} />}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All (${mockListings.length})`} />
          <Tab label="Coming Soon" />
          <Tab label="Active" />
          <Tab label="Pending" />
          <Tab label="Sold" />
        </Tabs>
      </Paper>

      {/* Listings Grid */}
      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} md={6} lg={4} key={listing.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea onClick={() => handleListingClick(listing.id)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={listing.primaryImage}
                  alt={listing.propertyAddress}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {formatPrice(listing.listPrice)}
                    </Typography>
                    <Chip
                      label={listing.listingStatus}
                      color={getStatusColor(listing.listingStatus)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle' }} />
                    {listing.propertyAddress}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
                    <Typography variant="body2">
                      <Bed sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {listing.bedrooms} BD
                    </Typography>
                    <Typography variant="body2">
                      <Bathtub sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {listing.bathrooms} BA
                    </Typography>
                    <Typography variant="body2">
                      <SquareFoot sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {listing.squareFootage.toLocaleString()} sqft
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      MLS# {listing.mlsNumber}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {listing.virtualTourLink && (
                        <Tooltip title="Virtual Tour Available">
                          <CameraAlt sx={{ fontSize: 18, color: 'primary.main' }} />
                        </Tooltip>
                      )}
                      {listing.pool && (
                        <Tooltip title="Pool">
                          <Home sx={{ fontSize: 18, color: 'info.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <RemoveRedEye sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption">{listing.views}</Typography>
                      <FavoriteBorder sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
                      <Typography variant="caption">{listing.favorites}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {listing.daysOnMarket} days on market
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
              
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(listing);
                }}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  handleListingClick(listing.id);
                }}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Listing Form Dialog */}
      <ListingForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(data) => {
          const mutation = selectedListing
            ? listingsAPI.update(selectedListing.id, data)
            : listingsAPI.create(data);
          
          mutation.then(() => {
            queryClient.invalidateQueries('listings');
            enqueueSnackbar(`Listing ${selectedListing ? 'updated' : 'created'}`, { variant: 'success' });
            handleCloseForm();
          });
        }}
        listing={selectedListing}
      />
    </Container>
  );
};

export default ListingsDashboard;