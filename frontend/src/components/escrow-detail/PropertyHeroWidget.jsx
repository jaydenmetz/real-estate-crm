import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Divider,
  Stack,
  Button,
  Tooltip
} from '@mui/material';
import {
  Bed,
  Bathtub,
  SquareFoot,
  CalendarMonth,
  LocationOn,
  ExpandMore,
  ExpandLess,
  Home,
  Landscape,
  AttachMoney,
  TrendingUp,
  LocalParking,
  Pool,
  Fireplace,
  Deck,
  Map,
  Edit,
  Share,
  FavoriteBorder,
  Print
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const HeroContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  background: 'white',
  marginBottom: theme.spacing(3)
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 480,
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[100],
  [theme.breakpoints.down('md')]: {
    height: 320
  }
}));

const PropertyImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease'
});

const PriceOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(3),
  left: theme.spacing(3),
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 2.5),
  color: 'white'
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1)
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)'
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5
}));

const DetailItem = ({ icon: Icon, label, value, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: `${color}.50`,
        color: `${color}.main`
      }}
    >
      <Icon fontSize="small" />
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const PropertyHeroWidget = ({ data = {} }) => {
  const [expanded, setExpanded] = useState(false);

  // Extract property details
  const propertyAddress = data.property_address || data.propertyAddress || 'Property Address';
  const city = data.city || 'City';
  const state = data.state || 'CA';
  const zipCode = data.zip_code || data.zipCode || '00000';
  const county = data.county || 'County';
  
  const purchasePrice = data.purchase_price || data.purchasePrice || 0;
  const listPrice = data.list_price || data.listPrice || purchasePrice;
  const bedrooms = data.bedrooms || 0;
  const bathrooms = data.bathrooms || 0;
  const squareFeet = data.square_feet || data.squareFeet || 0;
  const yearBuilt = data.year_built || data.yearBuilt || 'N/A';
  const lotSize = data.lot_size || data.lotSize || 'N/A';
  const propertyType = data.property_type || data.propertyType || 'Single Family';
  const apn = data.apn || 'N/A';
  const mlsNumber = data.mls_number || data.mlsNumber || 'N/A';
  const propertyImage = data.property_image_url || data.propertyImageUrl || 
    `https://via.placeholder.com/800x600/764ba2/ffffff?text=${encodeURIComponent(propertyAddress)}`;
  
  const escrowStatus = data.escrow_status || data.escrowStatus || 'active';
  const statusColors = {
    active: 'success',
    pending: 'warning',
    closed: 'info',
    cancelled: 'error'
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatSqFt = (sqft) => {
    return sqft ? `${sqft.toLocaleString()} sq ft` : 'N/A';
  };

  return (
    <HeroContainer
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Image Section */}
      <ImageContainer>
        <PropertyImage
          src={propertyImage}
          alt={propertyAddress}
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/800x600/764ba2/ffffff?text=${encodeURIComponent(propertyAddress)}`;
          }}
        />
        
        <StatusChip
          label={escrowStatus}
          color={statusColors[escrowStatus?.toLowerCase()] || 'default'}
          size="small"
        />

        <ActionButtons>
          <ActionButton size="small">
            <Share fontSize="small" />
          </ActionButton>
          <ActionButton size="small">
            <FavoriteBorder fontSize="small" />
          </ActionButton>
          <ActionButton size="small">
            <Print fontSize="small" />
          </ActionButton>
          <ActionButton size="small">
            <Edit fontSize="small" />
          </ActionButton>
        </ActionButtons>

        <PriceOverlay>
          <Typography variant="h4" fontWeight="bold">
            {formatPrice(purchasePrice)}
          </Typography>
          {listPrice !== purchasePrice && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Listed at {formatPrice(listPrice)}
            </Typography>
          )}
        </PriceOverlay>
      </ImageContainer>

      {/* Main Property Info */}
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Address */}
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {propertyAddress}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">
                {city}, {state} {zipCode} • {county} County
              </Typography>
            </Box>
          </Box>

          {/* Key Features Grid */}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={6} sm={3}>
              <DetailItem
                icon={Bed}
                label="Bedrooms"
                value={bedrooms}
                color="primary"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <DetailItem
                icon={Bathtub}
                label="Bathrooms"
                value={bathrooms}
                color="info"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <DetailItem
                icon={SquareFoot}
                label="Square Feet"
                value={formatSqFt(squareFeet)}
                color="success"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <DetailItem
                icon={CalendarMonth}
                label="Year Built"
                value={yearBuilt}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Expand/Collapse Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Button
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ borderRadius: 3 }}
            >
              {expanded ? 'Show Less' : 'Show All Property Details'}
            </Button>
          </Box>

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <Divider />
              
              {/* Property Information */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Property Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <DetailItem
                      icon={Home}
                      label="Property Type"
                      value={propertyType}
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <DetailItem
                      icon={Landscape}
                      label="Lot Size"
                      value={lotSize}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <DetailItem
                      icon={Map}
                      label="APN"
                      value={apn}
                      color="info"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <DetailItem
                      icon={TrendingUp}
                      label="MLS Number"
                      value={mlsNumber}
                      color="warning"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Price Analysis */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Price Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Purchase Price
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {formatPrice(purchasePrice)}
                      </Typography>
                      {squareFeet > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          ${Math.round(purchasePrice / squareFeet)}/sq ft
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Original List Price
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {formatPrice(listPrice)}
                      </Typography>
                      {listPrice !== purchasePrice && (
                        <Typography variant="body2" color="text.secondary">
                          {((purchasePrice - listPrice) / listPrice * 100).toFixed(1)}% difference
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Features (placeholder for future amenities) */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Features & Amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Central AC', 'Hardwood Floors', '2 Car Garage', 'Updated Kitchen', 'Pool'].map((feature) => (
                    <Chip
                      key={feature}
                      label={feature}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Stack>
          </Collapse>
        </Stack>
      </Box>
    </HeroContainer>
  );
};

export default PropertyHeroWidget;