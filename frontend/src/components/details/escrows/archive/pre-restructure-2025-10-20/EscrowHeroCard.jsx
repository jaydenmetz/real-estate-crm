import React from 'react';
import { Box, Typography, Button, Grid, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AttachMoney,
  CalendarToday,
  Email,
  Assessment,
  MoreHoriz,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

// PHASE 1: Clean Blue Hero Card (matches dashboard aesthetic)
const HeroContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)', // Blue gradient (escrows theme)
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(74, 144, 226, 0.3)',
  position: 'relative',
  marginBottom: theme.spacing(4),
  // Add subtle pattern overlay
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.6,
    pointerEvents: 'none',
  },
}));

const PropertyImageWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 280,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.down('md')]: {
    height: 220,
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
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  color: 'white',
  padding: theme.spacing(3),
  textAlign: 'center',
}));

const ProgressBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  padding: theme.spacing(0.75, 2),
  backgroundColor: 'rgba(16, 185, 129, 0.95)',
  color: 'white',
  borderRadius: 9999,
  fontSize: '0.875rem',
  fontWeight: 700,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const StatusBadge = styled(Chip)(({ status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          background: 'rgba(220, 252, 231, 0.95)',
          color: '#166534',
          border: 'rgba(187, 247, 208, 0.5)',
        };
      case 'pending':
        return {
          background: 'rgba(254, 243, 199, 0.95)',
          color: '#92400e',
          border: 'rgba(253, 230, 138, 0.5)',
        };
      case 'closed':
        return {
          background: 'rgba(243, 244, 246, 0.95)',
          color: '#374151',
          border: 'rgba(209, 213, 219, 0.5)',
        };
      default:
        return {
          background: 'rgba(254, 226, 226, 0.95)',
          color: '#991b1b',
          border: 'rgba(254, 202, 202, 0.5)',
        };
    }
  };

  const colors = getColors();

  return {
    backgroundColor: colors.background,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 700,
    fontSize: '0.875rem',
    padding: '6px 12px',
    height: 'auto',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };
});

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const ActionButton = styled(Button)(({ variant }) => ({
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: 12,
  border: variant === 'outlined' ? '2px solid rgba(255, 255, 255, 0.3)' : 'none',
  color: 'white',
  backgroundColor: variant === 'contained' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s',
  '&:hover': {
    backgroundColor: variant === 'contained'
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const PulsingDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  backgroundColor: '#10b981',
  borderRadius: '50%',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
}));

// Helper functions
const formatCurrency = (amount) => {
  if (!amount) return '$0';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount >= 100000 ? 0 : 1)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const EscrowHeroCard = ({
  escrow,
  onEmailParties,
  onGenerateStatement,
  onMoreActions
}) => {
  const { layouts, spacing } = useResponsiveLayout();

  // Extract data from escrow object
  const propertyAddress = escrow?.details?.propertyAddress || escrow?.property_address || '9613 Lake Pyramid Court';
  const city = escrow?.details?.city || escrow?.property_city || 'City';
  const state = escrow?.details?.state || escrow?.property_state || 'State';
  const zipCode = escrow?.details?.zipCode || escrow?.property_zip || '00000';
  const escrowNumber = escrow?.details?.escrowNumber || escrow?.escrow_number || 'ESC-2025-0001';
  const status = escrow?.details?.escrowStatus || escrow?.status || 'active';
  const purchasePrice = escrow?.financials?.purchasePrice || escrow?.purchase_price || 650000;
  const commission = escrow?.financials?.grossCommission || escrow?.commission_amount || 0;
  const closingDate = escrow?.details?.closingDate || escrow?.close_date;
  const progress = escrow?.details?.completionPercentage || escrow?.completion_percentage || 64;

  // Property image from database (fallback to placeholder)
  const propertyImage = escrow?.['property-details']?.image || escrow?.property_image_url;

  return (
    <HeroContainer
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, p: spacing.container }}>
        <Grid container spacing={4}>
          {/* Left: Property Image */}
          <Grid item xs={12} md={5}>
            <PropertyImageWrapper>
              {propertyImage ? (
                <PropertyImage
                  src={propertyImage}
                  alt={propertyAddress}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <ImagePlaceholder style={{ display: propertyImage ? 'none' : 'flex' }}>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  {propertyAddress}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Property image not available
                </Typography>
              </ImagePlaceholder>
              <ProgressBadge>
                {progress}% Complete
              </ProgressBadge>
            </PropertyImageWrapper>
          </Grid>

          {/* Right: Property Info & Metrics */}
          <Grid item xs={12} md={7}>
            {/* Header */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  }}
                >
                  {propertyAddress}
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                  <Typography
                    variant="body1"
                    sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    {city}, {state} {zipCode}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>•</Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}
                  >
                    {escrowNumber}
                  </Typography>
                </Box>
              </Box>

              <StatusBadge
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                status={status}
                icon={<PulsingDot />}
              />
            </Box>

            {/* Metrics Grid - Always 2×2 to prevent overlap */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={6}>
                <MetricBox>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}
                  >
                    Purchase Price
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {formatCurrency(purchasePrice)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    {purchasePrice >= 500000 ? 'At asking' : 'Below asking'}
                  </Typography>
                </MetricBox>
              </Grid>

              <Grid item xs={6}>
                <MetricBox>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}
                  >
                    My Commission
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {formatCurrency(commission)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    {commission > 0 ? `${((commission / purchasePrice) * 100).toFixed(1)}% of sale` : '0.0% of sale'}
                  </Typography>
                </MetricBox>
              </Grid>

              <Grid item xs={6}>
                <MetricBox>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}
                  >
                    Close Date
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {formatDate(closingDate).split(',')[0]}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    {closingDate ? 'Date TBD' : 'Not set'}
                  </Typography>
                </MetricBox>
              </Grid>

              <Grid item xs={6}>
                <MetricBox>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}
                  >
                    Next Deadline
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#fbbf24',
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    }}
                  >
                    Oct 20
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    Inspection
                  </Typography>
                </MetricBox>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box display="flex" gap={2} flexWrap="wrap">
              <ActionButton
                variant="contained"
                startIcon={<Email />}
                onClick={onEmailParties}
              >
                Email All Parties
              </ActionButton>
              <ActionButton
                variant="outlined"
                startIcon={<Assessment />}
                onClick={onGenerateStatement}
              >
                Generate Statement
              </ActionButton>
              <ActionButton
                variant="outlined"
                onClick={onMoreActions}
              >
                <MoreHoriz />
              </ActionButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </HeroContainer>
  );
};

export default EscrowHeroCard;
