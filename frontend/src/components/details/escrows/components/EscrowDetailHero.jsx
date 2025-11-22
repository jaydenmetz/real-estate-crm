import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../../utils/formatters';

// Blue gradient hero similar to dashboard (dynamic height based on content)
const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

const PropertyImageBox = styled(Box)(({ theme }) => ({
  width: 192,
  height: 192,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  flexShrink: 0,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '4px solid rgba(255, 255, 255, 0.2)',
  [theme.breakpoints.down('md')]: {
    width: 120,
    height: 120,
  },
}));

const PropertyImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ImagePlaceholder = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '3rem',
}));

const StatCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const EscrowDetailHero = ({ escrow, onUpdate }) => {
  const [imageError, setImageError] = useState(false);

  if (!escrow) {
    return null;
  }

  // Extract data from nested JSONB structure
  const details = escrow.details || escrow;
  const propertyAddress = details.propertyAddress || escrow.property_address || 'Property Address';
  const city = escrow.city || escrow['property-details']?.city || '';
  const state = escrow.state || escrow['property-details']?.state || 'CA';
  const escrowNumber = details.escrowNumber || escrow.display_id || 'ESC-2025-0001';
  const purchasePrice = details.purchasePrice || escrow.purchase_price || 0;
  const myCommission = details.myCommission || escrow.my_commission || 0;
  const closingDate = details.scheduledCoeDate || escrow.closing_date || null;
  const status = details.escrowStatus || escrow.escrow_status || 'Active';
  const daysToClose = details.daysToClose || 0;
  const checklistProgress = details.checklistProgress || 0;

  // Property image
  const propertyImage = details.propertyImage || escrow.property_image_url;

  // Status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'closed':
        return '#2196f3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <HeroContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {/* Property Image */}
          <PropertyImageBox>
            {propertyImage && !imageError ? (
              <PropertyImage
                src={propertyImage}
                alt={propertyAddress}
                onError={() => setImageError(true)}
              />
            ) : (
              <ImagePlaceholder>🏠</ImagePlaceholder>
            )}
          </PropertyImageBox>

          {/* Property Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={status}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(status),
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: 0.5,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 600,
                }}
              >
                {escrowNumber}
              </Typography>
            </Box>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                {propertyAddress}
              </Typography>
            </motion.div>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              {(city || state) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={16} style={{ opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {city ? `${city}, ${state}` : state}
                  </Typography>
                </Box>
              )}
              {daysToClose > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={16} style={{ opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Closes in {daysToClose} days
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Stats Grid - Always 2x2 grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',  // Always 2 columns (2x2 grid)
            gap: 2,
            maxWidth: { xs: '100%', xl: '50%' }, // On large screens, take 50% width to leave room for manager slot
          }}
        >
          <StatCard>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem',
              }}
            >
              Purchase Price
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'white',
              }}
            >
              {purchasePrice >= 1000000
                ? `$${(purchasePrice / 1000000).toFixed(1)}M`
                : `$${(purchasePrice / 1000).toFixed(0)}K`}
            </Typography>
          </StatCard>

          <StatCard>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem',
              }}
            >
              Your Commission
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#4ade80',
              }}
            >
              {myCommission >= 1000
                ? `$${(myCommission / 1000).toFixed(1)}K`
                : formatCurrency(myCommission)}
            </Typography>
          </StatCard>

          <StatCard>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem',
              }}
            >
              Progress
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'white',
              }}
            >
              {checklistProgress}%
            </Typography>
          </StatCard>

          <StatCard>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem',
              }}
            >
              Closing Date
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'white',
              }}
            >
              {closingDate
                ? new Date(closingDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Not Set'}
            </Typography>
          </StatCard>
        </Box>
      </Box>
    </HeroContainer>
  );
};

export default EscrowDetailHero;
