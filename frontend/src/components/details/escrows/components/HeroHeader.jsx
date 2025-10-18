import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Collapse,
  Divider,
  Avatar,
  Stack,
  Paper,
  Tooltip
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

// Styled components with purple-blue theme
const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
  marginBottom: theme.spacing(2)
}));

const PropertyImage = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 240,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const DetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(118, 75, 162, 0.1)',
  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.08)'
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.grey[600],
    fontSize: '1.2rem'
  }
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 'bold',
  backgroundColor: 
    status === 'active' ? '#10b981' :
    status === 'pending' ? '#f59e0b' :
    status === 'closed' ? '#6b7280' :
    '#ef4444',
  color: 'white'
}));

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  }
}));

const DetailSection = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginTop: theme.spacing(1)
}));

const DetailGrid = styled(Grid)(({ theme }) => ({
  '& .detail-item': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: theme.spacing(1),
    '& .icon': {
      marginRight: theme.spacing(1.5),
      color: 'rgba(255, 255, 255, 0.7)'
    },
    '& .label': {
      fontSize: '0.75rem',
      opacity: 0.7,
      marginRight: theme.spacing(1),
      minWidth: 100
    },
    '& .value': {
      fontSize: '0.875rem',
      fontWeight: 500
    }
  }
}));

function HeroHeader({ data, onUpdate }) {
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

  // Calculate days to close
  const daysToClose = () => {
    if (!data.closingDate && !data.coeDate) return null;
    const closing = new Date(data.closingDate || data.coeDate);
    const today = new Date();
    const days = Math.ceil((closing - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const dtc = daysToClose();

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
    <HeaderContainer>
      <Grid container spacing={3}>
        {/* Left Section - Property Image */}
        <Grid item xs={12} md={4}>
          <PropertyImage>
            {data.propertyImageUrl || data.property_image_url ? (
              <img 
                src={data.propertyImageUrl || data.property_image_url} 
                alt={data.propertyAddress || data.property_address}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';
                }}
              />
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <HomeIcon sx={{ fontSize: 64, opacity: 0.3 }} />
              </Box>
            )}
          </PropertyImage>
          
          {/* Expand button for property details */}
          <Box display="flex" justifyContent="center" mt={2}>
            <ExpandButton 
              expanded={expanded} 
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              <ExpandMoreIcon />
            </ExpandButton>
            <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
              {expanded ? 'Hide' : 'Show'} All Property Details
            </Typography>
          </Box>
        </Grid>

        {/* Right Section - Key Information */}
        <Grid item xs={12} md={8}>
          <Box>
            {/* Address and Status */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {data.propertyAddress || data.property_address}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {data.city}, {data.state} {data.zipCode || data.zip_code}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <StatusChip 
                  label={data.escrowStatus || data.escrow_status || 'Active'} 
                  status={(data.escrowStatus || data.escrow_status || 'active').toLowerCase()}
                  size="small"
                />
                <Chip 
                  label={data.displayId || data.display_id || data.escrowNumber} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  size="small"
                />
              </Stack>
            </Box>

            {/* Key Metrics Grid */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <DetailSection>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Purchase Price</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(data.purchasePrice || data.purchase_price)}
                  </Typography>
                </DetailSection>
              </Grid>
              <Grid item xs={6} sm={3}>
                <DetailSection>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Closing Date</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatDate(data.closingDate || data.coeDate)}
                  </Typography>
                  {dtc !== null && (
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {dtc > 0 ? `${dtc} days` : dtc === 0 ? 'Today!' : 'Closed'}
                    </Typography>
                  )}
                </DetailSection>
              </Grid>
              <Grid item xs={6} sm={3}>
                <DetailSection>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>My Commission</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(data.myCommission || data.my_commission)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Net: {formatCurrency(data.netCommission || data.net_commission)}
                  </Typography>
                </DetailSection>
              </Grid>
              <Grid item xs={6} sm={3}>
                <DetailSection>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Property Type</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data.propertyType || data.property_type || 'Single Family'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {data.transactionType || data.transaction_type || 'Purchase'}
                  </Typography>
                </DetailSection>
              </Grid>
            </Grid>

            {/* Primary Contacts */}
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <DetailSection>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>Buyer</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="500">
                    {data.buyer?.name || data.people?.buyer?.name || 'Not assigned'}
                  </Typography>
                  {(data.buyer?.phone || data.people?.buyer?.phone) && (
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {data.buyer?.phone || data.people?.buyer?.phone}
                    </Typography>
                  )}
                </DetailSection>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailSection>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1, opacity: 0.7 }} />
                    <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>Seller</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="500">
                    {data.seller?.name || data.people?.seller?.name || 'Not assigned'}
                  </Typography>
                  {(data.seller?.phone || data.people?.seller?.phone) && (
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {data.seller?.phone || data.people?.seller?.phone}
                    </Typography>
                  )}
                </DetailSection>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Expandable Property Details Section */}
      <Collapse in={expanded}>
        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
        
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Complete Property Details
        </Typography>
        
        <DetailGrid container spacing={2}>
          {/* Basic Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>Basic Information</Typography>
            {propertyDetails.basic.map((detail, index) => (
              <Box key={index} className="detail-item">
                <span className="icon">{detail.icon}</span>
                <span className="label">{detail.label}:</span>
                <span className="value">{detail.value}</span>
              </Box>
            ))}
          </Grid>

          {/* Features */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>Features & Amenities</Typography>
            {propertyDetails.features.map((detail, index) => (
              <Box key={index} className="detail-item">
                <span className="icon">{detail.icon}</span>
                <span className="label">{detail.label}:</span>
                <span className="value">{detail.value}</span>
              </Box>
            ))}
          </Grid>

          {/* Administrative */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>Administrative</Typography>
            {propertyDetails.administrative.map((detail, index) => (
              <Box key={index} className="detail-item">
                <span className="icon">{detail.icon}</span>
                <span className="label">{detail.label}:</span>
                <span className="value">{detail.value}</span>
              </Box>
            ))}
          </Grid>

          {/* HOA & Financial */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>HOA & Pricing</Typography>
            {[...propertyDetails.hoa, ...propertyDetails.financial].map((detail, index) => (
              <Box key={index} className="detail-item">
                <span className="icon">{detail.icon}</span>
                <span className="label">{detail.label}:</span>
                <span className="value">{detail.value}</span>
              </Box>
            ))}
          </Grid>
        </DetailGrid>

        {/* Property Features List */}
        {data.propertyFeatures && data.propertyFeatures.length > 0 && (
          <>
            <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1 }}>Property Features</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {data.propertyFeatures.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Collapse>
    </HeaderContainer>
  );
}

export default HeroHeader;