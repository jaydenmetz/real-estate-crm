import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Collapse,
  Divider,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocalOffer as PriceIcon,
  Square as SquareIcon,
  Bathtub as BathIcon,
  Bed as BedIcon,
  DirectionsCar as CarIcon,
  Pool as PoolIcon,
  Deck as DeckIcon,
  Landscape as LandIcon,
  AccountTree as ZoningIcon,
  Assignment as APNIcon,
  Tag as MLSIcon,
  HomeWork as HOAIcon,
  Construction as YearIcon,
  Architecture as StyleIcon,
  Assessment as ConditionIcon,
  AspectRatio as SqftIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const SectionContainer = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.08)',
  border: '1px solid rgba(118, 75, 162, 0.1)'
}));

const PropertyImage = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 400,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#f5f5f5',
  border: '1px solid rgba(118, 75, 162, 0.15)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const ExpandButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
    transform: 'translateY(-1px)'
  }
}));

const DetailGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .detail-section': {
    marginBottom: theme.spacing(3)
  },
  '& .detail-item': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: '#f8f9fa',
    marginBottom: theme.spacing(1),
    border: '1px solid #e8e8e8',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f0f0f0',
      borderColor: 'rgba(118, 75, 162, 0.2)'
    },
    '& .icon': {
      marginRight: theme.spacing(2),
      color: '#764ba2'
    },
    '& .label': {
      fontSize: '0.875rem',
      color: theme.palette.grey[600],
      marginRight: theme.spacing(2),
      minWidth: 120,
      fontWeight: 500
    },
    '& .value': {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.palette.grey[900]
    }
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#764ba2',
  marginBottom: theme.spacing(1.5),
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}));

function PropertyImageSection({ data }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!data) return null;

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Property details for expanded view
  const propertyDetails = {
    basic: [
      { icon: <BedIcon />, label: 'Bedrooms', value: data.bedrooms || 'N/A' },
      { icon: <BathIcon />, label: 'Bathrooms', value: data.bathrooms || 'N/A' },
      { icon: <SqftIcon />, label: 'Square Feet', value: data.squareFeet ? `${data.squareFeet.toLocaleString()} sqft` : 'N/A' },
      { icon: <LandIcon />, label: 'Lot Size', value: data.lotSize ? `${data.lotSize.toLocaleString()} sqft` : 'N/A' },
      { icon: <YearIcon />, label: 'Year Built', value: data.yearBuilt || 'N/A' },
      { icon: <CarIcon />, label: 'Garage', value: data.garageSpaces ? `${data.garageSpaces} spaces` : 'N/A' }
    ],
    features: [
      { icon: <PoolIcon />, label: 'Pool', value: data.pool ? 'Yes' : 'No' },
      { icon: <DeckIcon />, label: 'Spa', value: data.spa ? 'Yes' : 'No' },
      { icon: <StyleIcon />, label: 'Style', value: data.architecturalStyle || 'N/A' },
      { icon: <ConditionIcon />, label: 'Condition', value: data.propertyCondition || 'N/A' },
      { icon: <HomeIcon />, label: 'Stories', value: data.stories || 'N/A' },
      { icon: <LocationIcon />, label: 'View', value: data.viewType || 'N/A' }
    ],
    administrative: [
      { icon: <APNIcon />, label: 'APN', value: data.apn || 'N/A' },
      { icon: <MLSIcon />, label: 'MLS #', value: data.mlsNumber || 'N/A' },
      { icon: <ZoningIcon />, label: 'Zoning', value: data.zoning || 'N/A' },
      { icon: <BusinessIcon />, label: 'County', value: data.county || 'N/A' },
      { icon: <LocationIcon />, label: 'Subdivision', value: data.subdivision || 'N/A' },
      { icon: <LocationIcon />, label: 'Cross Streets', value: data.crossStreets || 'N/A' }
    ],
    hoa: [
      { icon: <HOAIcon />, label: 'HOA Fee', value: data.hoaFee ? `$${data.hoaFee}/${data.hoaFrequency || 'month'}` : 'N/A' },
      { icon: <BusinessIcon />, label: 'HOA Name', value: data.hoaName || 'N/A' },
      { icon: <HomeIcon />, label: 'Gated', value: data.gatedCommunity ? 'Yes' : 'No' },
      { icon: <PersonIcon />, label: 'Senior', value: data.seniorCommunity ? 'Yes' : 'No' }
    ],
    financial: [
      { icon: <PriceIcon />, label: 'List Price', value: formatCurrency(data.listPrice) },
      { icon: <CalendarIcon />, label: 'List Date', value: formatDate(data.listDate) },
      { icon: <CalendarIcon />, label: 'Days on Market', value: data.daysOnMarket || 'N/A' },
      { icon: <MoneyIcon />, label: 'Price/Sqft', value: data.squareFeet && data.purchasePrice ? 
        `$${Math.round(data.purchasePrice / data.squareFeet)}` : 'N/A' }
    ]
  };

  return (
    <SectionContainer elevation={0}>
      {/* Property Image */}
      <PropertyImage>
        {data.propertyImageUrl || data.property_image_url ? (
          <img 
            src={data.propertyImageUrl || data.property_image_url} 
            alt={data.propertyAddress || data.property_address}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200';
            }}
          />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <HomeIcon sx={{ fontSize: 80, color: '#e0e0e0' }} />
          </Box>
        )}
      </PropertyImage>
      
      {/* Expand button */}
      <ExpandButton onClick={() => setExpanded(!expanded)}>
        <IconButton 
          sx={{ 
            color: 'white', 
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            padding: 0,
            marginRight: 1
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
        <Typography variant="body2" fontWeight={600}>
          {expanded ? 'Hide' : 'View'} Complete Property Details
        </Typography>
      </ExpandButton>

      {/* Expandable Property Details Section */}
      <Collapse in={expanded}>
        <DetailGrid container spacing={3}>
          {/* Basic Details */}
          <Grid item xs={12} md={6}>
            <Box className="detail-section">
              <SectionTitle>Basic Information</SectionTitle>
              {propertyDetails.basic.map((detail, index) => (
                <Box key={index} className="detail-item">
                  <span className="icon">{detail.icon}</span>
                  <span className="label">{detail.label}</span>
                  <span className="value">{detail.value}</span>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Features */}
          <Grid item xs={12} md={6}>
            <Box className="detail-section">
              <SectionTitle>Features & Amenities</SectionTitle>
              {propertyDetails.features.map((detail, index) => (
                <Box key={index} className="detail-item">
                  <span className="icon">{detail.icon}</span>
                  <span className="label">{detail.label}</span>
                  <span className="value">{detail.value}</span>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Administrative */}
          <Grid item xs={12} md={6}>
            <Box className="detail-section">
              <SectionTitle>Administrative</SectionTitle>
              {propertyDetails.administrative.map((detail, index) => (
                <Box key={index} className="detail-item">
                  <span className="icon">{detail.icon}</span>
                  <span className="label">{detail.label}</span>
                  <span className="value">{detail.value}</span>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* HOA & Financial */}
          <Grid item xs={12} md={6}>
            <Box className="detail-section">
              <SectionTitle>HOA & Pricing</SectionTitle>
              {[...propertyDetails.hoa, ...propertyDetails.financial].map((detail, index) => (
                <Box key={index} className="detail-item">
                  <span className="icon">{detail.icon}</span>
                  <span className="label">{detail.label}</span>
                  <span className="value">{detail.value}</span>
                </Box>
              ))}
            </Box>
          </Grid>
        </DetailGrid>

        {/* Property Features List */}
        {data.propertyFeatures && data.propertyFeatures.length > 0 && (
          <Box mt={3}>
            <SectionTitle>Property Features</SectionTitle>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {data.propertyFeatures.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Collapse>
    </SectionContainer>
  );
}

export default PropertyImageSection;