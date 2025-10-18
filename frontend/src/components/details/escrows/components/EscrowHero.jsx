import React, { useState } from 'react';
import { Box, Typography, Skeleton, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { OpenInNew, TrendingUp, CalendarToday, AttachMoney } from '@mui/icons-material';
import { motion } from 'framer-motion';

// PHASE 3: Compact 100px Hero Card
const HeroContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(74, 144, 226, 0.25)',
  position: 'relative',
  height: 100,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  cursor: 'default',
  // Subtle pattern overlay
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M20 20v20h20V20H20zm16 16h-12v-12h12v12z\'/%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.4,
    pointerEvents: 'none',
  },
}));

const PropertyImageBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 120,
  height: 80,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
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
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
  color: 'white',
  fontSize: '2rem',
}));

const ZillowButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: 'rgba(0, 106, 255, 0.9)',
  color: 'white',
  width: 24,
  height: 24,
  '&:hover': {
    backgroundColor: 'rgba(0, 106, 255, 1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '0.875rem',
  },
}));

const InfoSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  minWidth: 0, // Allows text ellipsis
  position: 'relative',
  zIndex: 1,
}));

const MetricsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  flexWrap: 'nowrap',
}));

const MetricBox = styled(Box)(({ theme, clickable }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  cursor: clickable ? 'pointer' : 'default',
  transition: 'all 0.2s',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  '&:hover': clickable ? {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
  } : {},
}));

const ProgressBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1.5),
  backgroundColor: 'rgba(16, 185, 129, 0.95)',
  color: 'white',
  borderRadius: 9999,
  fontSize: '0.75rem',
  fontWeight: 700,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const EscrowHero = ({ escrow, loading, onOpenFinancials }) => {
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <HeroContainer>
        <Skeleton variant="rectangular" width={120} height={80} sx={{ borderRadius: 1.5 }} />
        <Box flex={1}>
          <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
          <Skeleton width="40%" height={20} />
        </Box>
      </HeroContainer>
    );
  }

  // Extract data from escrow object (supports both restructured and flat formats)
  const propertyAddress = escrow?.details?.propertyAddress || escrow?.property_address || 'Property Address';
  const escrowNumber = escrow?.details?.escrowNumber || escrow?.display_id || 'ESC-2025-0001';
  const purchasePrice = escrow?.financials?.purchasePrice || escrow?.purchase_price || 0;
  const commission = escrow?.financials?.agentNet || escrow?.my_commission || escrow?.financials?.agent1099Income || 0;
  const closingDate = escrow?.details?.scheduledCoeDate || escrow?.timeline?.coeDate || escrow?.closing_date;
  const progress = escrow?.details?.checklistProgress || escrow?.completion_percentage || 0;

  // Property image
  const propertyImage = escrow?.details?.propertyImage || escrow?.property_image_url;
  const zillowUrl = escrow?.details?.zillowUrl || escrow?.zillow_url;

  const handleMetricClick = () => {
    if (onOpenFinancials) {
      onOpenFinancials();
    }
  };

  return (
    <HeroContainer
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
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
        {zillowUrl && (
          <Tooltip title="View on Zillow">
            <ZillowButton
              size="small"
              onClick={() => window.open(zillowUrl, '_blank')}
            >
              <OpenInNew />
            </ZillowButton>
          </Tooltip>
        )}
      </PropertyImageBox>

      {/* Property Info & Metrics */}
      <InfoSection>
        {/* Address & Escrow Number */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 700,
              fontSize: '1.125rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {propertyAddress}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              fontSize: '0.75rem',
              ml: 2,
            }}
          >
            {escrowNumber}
          </Typography>
        </Box>

        {/* Metrics Row */}
        <MetricsRow>
          {/* Purchase Price (Clickable) */}
          <Tooltip title="Click to view financial breakdown">
            <MetricBox clickable onClick={handleMetricClick}>
              <AttachMoney sx={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block', lineHeight: 1 }}>
                  Price
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
                  {formatCurrency(purchasePrice)}
                </Typography>
              </Box>
            </MetricBox>
          </Tooltip>

          {/* Commission (Clickable) */}
          <Tooltip title="Click to view commission details">
            <MetricBox clickable onClick={handleMetricClick}>
              <TrendingUp sx={{ fontSize: '1rem', color: '#10b981' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block', lineHeight: 1 }}>
                  Commission
                </Typography>
                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
                  {formatCurrency(commission)}
                </Typography>
              </Box>
            </MetricBox>
          </Tooltip>

          {/* Close Date */}
          <MetricBox>
            <CalendarToday sx={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.65rem', display: 'block', lineHeight: 1 }}>
                Close
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
                {formatDate(closingDate)}
              </Typography>
            </Box>
          </MetricBox>

          {/* Progress Badge */}
          <Box ml="auto">
            <ProgressBadge>
              {progress}% ✓
            </ProgressBadge>
          </Box>
        </MetricsRow>
      </InfoSection>
    </HeroContainer>
  );
};

export default EscrowHero;
