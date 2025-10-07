import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  AttachMoney,
  Home,
  CheckCircle,
  Add,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { listingsAPI } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

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

// Enhanced animated stat card component with gradient animations
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend }) => {
  const theme = useTheme();
  return (
    <Grid item xs={12} sm={6} md={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: delay * 0.1 }}
      >
        <Card
          elevation={0}
          sx={{
            height: '100%',
            minHeight: 140,
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(color, 0.3)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
              border: `1px solid ${alpha(color, 0.5)}`,
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
                    decimals={suffix === 'M' || suffix === 'K' ? 1 : 0}
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
                    background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
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
    </Grid>
  );
};

const ListingsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('listingsViewMode');
    return saved || 'small';
  });
  const [sortBy, setSortBy] = useState('listing_date'); // Sort field
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalValue: 0,
    avgDaysOnMarket: 0,
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('listingsViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (listings.length > 0) {
      calculateStats(listings, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, listings]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      console.log('Fetching listings...');

      const response = await listingsAPI.getAll();
      console.log('API Response:', response);

      if (response.success) {
        const listingData = response.data.listings || response.data || [];
        console.log('Listings received:', listingData.length);
        setListings(listingData);
        calculateStats(listingData, selectedStatus);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching listings:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (listingData, statusFilter = 'active') => {
    if (!listingData || !Array.isArray(listingData)) {
      setStats({
        totalListings: 0,
        activeListings: 0,
        totalValue: 0,
        avgDaysOnMarket: 0,
      });
      return;
    }

    let filteredListings = [];

    // Filter based on selected status
    switch (statusFilter) {
      case 'active':
        filteredListings = listingData.filter(l =>
          l.listingStatus === 'Active' ||
          l.listing_status === 'Active' ||
          l.listingStatus === 'active' ||
          l.listing_status === 'active'
        );
        break;
      case 'pending':
        filteredListings = listingData.filter(l =>
          l.listingStatus === 'Pending' ||
          l.listing_status === 'Pending' ||
          l.listingStatus === 'pending' ||
          l.listing_status === 'pending'
        );
        break;
      case 'sold':
        filteredListings = listingData.filter(l =>
          l.listingStatus === 'Sold' ||
          l.listing_status === 'Sold' ||
          l.listingStatus === 'sold' ||
          l.listing_status === 'sold'
        );
        break;
      case 'expired':
        filteredListings = listingData.filter(l =>
          l.listingStatus === 'Expired' ||
          l.listing_status === 'Expired' ||
          l.listingStatus === 'expired' ||
          l.listing_status === 'expired'
        );
        break;
      default:
        filteredListings = listingData;
    }

    // Calculate stats for filtered listings
    const totalValue = filteredListings.reduce((sum, l) => sum + Number(l.listPrice || l.list_price || 0), 0);

    // Calculate average days on market
    const now = new Date();
    const avgDaysOnMarket = Math.round(
      filteredListings.reduce((sum, l) => {
        const listingDate = new Date(l.listingDate || l.listing_date);
        const days = Math.floor((now - listingDate) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / (filteredListings.length || 1)
    );

    setStats({
      totalListings: filteredListings.length,
      activeListings: filteredListings.length,
      totalValue,
      avgDaysOnMarket,
    });
  };

  const handleListingClick = (listingId) => {
    console.log('Listing clicked - ID:', listingId);
    navigate(`/listings/${listingId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

        {/* Hero Section with Stats */}
        <HeroSection>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Listing Management
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Track and manage all your real estate listings in one place
            </Typography>
          </motion.div>

          {/* Stats Grid */}
          <Grid container spacing={3}>
            <StatCard icon={Home} title="Total Listings" value={stats.totalListings || 0} color="#3b82f6" delay={0} />
            <StatCard icon={CheckCircle} title="Active Listings" value={stats.activeListings || 0} color="#10b981" delay={1} />
            <StatCard icon={AttachMoney} title="Total Value" value={(stats.totalValue || 0) / 1000000} prefix="$" suffix="M" color="#f59e0b" delay={2} />
            <StatCard icon={TrendingUp} title="Avg Days on Market" value={stats.avgDaysOnMarket || 0} color="#8b5cf6" delay={3} />
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/listings/new')}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Listing Analytics
            </Button>
          </Box>
        </HeroSection>

      {/* Status Tabs with View Mode Toggle */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 2,
          }}
        >
          <Tabs
            value={selectedStatus}
            onChange={(e, newValue) => setSelectedStatus(newValue)}
            sx={{
              flex: 1,
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
            <Tab label="Active Listings" value="active" />
            <Tab label="Pending Listings" value="pending" />
            <Tab label="Sold Listings" value="sold" />
            <Tab label="Expired Listings" value="expired" />
          </Tabs>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Sort Selector */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="listing_date">Listing Date</MenuItem>
                <MenuItem value="list_price">Price</MenuItem>
                <MenuItem value="property_address">Address</MenuItem>
                <MenuItem value="days_on_market">Days on Market</MenuItem>
                <MenuItem value="listing_status">Status</MenuItem>
              </Select>
            </FormControl>

            {/* View Mode Selector */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
              aria-label="View mode selection"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              <ToggleButton
                value="small"
                aria-label="Grid view"
                title="Grid view"
              >
                <Box sx={{ display: 'flex', gap: 0.4 }}>
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </Box>
              </ToggleButton>
              <ToggleButton
                value="large"
                aria-label="Full width view"
                title="Full width view"
              >
                <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>
      </Box>

        {/* Listings Grid - Placeholder for now */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr',
            lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr',
          },
          gap: 3,
          width: '100%',
        }}>
          <AnimatePresence>
            {(() => {
              const filteredListings = listings.filter(l => {
                switch (selectedStatus) {
                  case 'active':
                    return l.listingStatus === 'Active' || l.listing_status === 'Active' ||
                           l.listingStatus === 'active' || l.listing_status === 'active';
                  case 'pending':
                    return l.listingStatus === 'Pending' || l.listing_status === 'Pending' ||
                           l.listingStatus === 'pending' || l.listing_status === 'pending';
                  case 'sold':
                    return l.listingStatus === 'Sold' || l.listing_status === 'Sold' ||
                           l.listingStatus === 'sold' || l.listing_status === 'sold';
                  case 'expired':
                    return l.listingStatus === 'Expired' || l.listing_status === 'Expired' ||
                           l.listingStatus === 'expired' || l.listing_status === 'expired';
                  default:
                    return true;
                }
              });

              // Sort listings based on sortBy state
              const sortedListings = [...filteredListings].sort((a, b) => {
                let aVal, bVal;

                switch(sortBy) {
                  case 'listing_date':
                    aVal = new Date(a.listingDate || a.listing_date || 0);
                    bVal = new Date(b.listingDate || b.listing_date || 0);
                    return bVal - aVal; // Newest first
                  case 'list_price':
                    aVal = Number(a.listPrice || a.list_price || 0);
                    bVal = Number(b.listPrice || b.list_price || 0);
                    return bVal - aVal; // Highest first
                  case 'property_address':
                    aVal = (a.propertyAddress || a.property_address || '').toLowerCase();
                    bVal = (b.propertyAddress || b.property_address || '').toLowerCase();
                    return aVal.localeCompare(bVal); // A-Z
                  case 'days_on_market':
                    const nowDate = new Date();
                    const aDays = a.listingDate ? Math.floor((nowDate - new Date(a.listingDate)) / (1000 * 60 * 60 * 24)) : 0;
                    const bDays = b.listingDate ? Math.floor((nowDate - new Date(b.listingDate)) / (1000 * 60 * 60 * 24)) : 0;
                    return bDays - aDays; // Most days first
                  case 'listing_status':
                    aVal = (a.listingStatus || a.listing_status || '').toLowerCase();
                    bVal = (b.listingStatus || b.listing_status || '').toLowerCase();
                    return aVal.localeCompare(bVal); // A-Z
                  default:
                    return 0;
                }
              });

              if (!sortedListings || sortedListings.length === 0) {
                return (
                  <Paper
                    sx={{
                      p: 6,
                      height: 240,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      background: theme => alpha(theme.palette.primary.main, 0.03),
                      border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      gridColumn: '1 / -1',
                    }}
                  >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No {selectedStatus} listings found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedStatus === 'active' ? 'Create a new listing to get started' : `No ${selectedStatus} listings in the system`}
                    </Typography>
                  </Paper>
                );
              } else {
                return sortedListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => handleListingClick(listing.id)}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        minHeight: 200,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {listing.propertyAddress || listing.property_address || 'No Address'}
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                          ${(listing.listPrice || listing.list_price || 0).toLocaleString()}
                        </Typography>
                        <Stack spacing={1}>
                          <Chip
                            label={listing.listingStatus || listing.listing_status || 'Unknown'}
                            size="small"
                            color="primary"
                          />
                          <Typography variant="body2" color="textSecondary">
                            MLS: {listing.mlsNumber || listing.mls_number || 'N/A'}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                ));
              }
            })()}
          </AnimatePresence>
        </Box>

      </Container>
    </>
  );
};

export default ListingsDashboard;
