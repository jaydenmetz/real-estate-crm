import React from 'react';
import { Box, Typography, Button, Grid, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AttachMoney,
  CalendarToday,
  Email,
  Assessment,
  MoreHoriz,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Styled Components
const HeroContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(to bottom right, #ffffff, #f9fafb)',
  padding: theme.spacing(4),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const PropertyImageWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 320,
  height: 200,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  flexShrink: 0,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: 400,
  },
}));

const PropertyImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ProgressBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  padding: theme.spacing(0.5, 1.5),
  backgroundColor: '#10b981',
  color: 'white',
  borderRadius: 9999,
  fontSize: '0.875rem',
  fontWeight: 600,
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
}));

const StatusBadge = styled(Chip)(({ status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          background: '#dcfce7',
          color: '#166534',
          border: '#bbf7d0',
        };
      case 'pending':
        return {
          background: '#fef3c7',
          color: '#92400e',
          border: '#fde68a',
        };
      case 'closed':
        return {
          background: '#f3f4f6',
          color: '#374151',
          border: '#d1d5db',
        };
      default:
        return {
          background: '#fee2e2',
          color: '#991b1b',
          border: '#fecaca',
        };
    }
  };

  const colors = getColors();

  return {
    backgroundColor: colors.background,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '4px 8px',
    height: 'auto',
    '& .MuiChip-icon': {
      width: 8,
      height: 8,
      backgroundColor: colors.color,
      borderRadius: '50%',
      marginLeft: 8,
    },
  };
});

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
}));

const ActionButton = styled(Button)(({ variant }) => ({
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 24px',
  borderRadius: 8,
  boxShadow: variant === 'contained'
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    : 'none',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: variant === 'contained'
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : 'none',
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

// Helper function to calculate days until date
const getDaysUntil = (dateString) => {
  if (!dateString) return null;
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to format currency
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

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const EscrowHeroCard = ({
  escrow,
  onEmailParties,
  onGenerateStatement,
  onMoreActions
}) => {
  // Calculate progress (example calculation - adjust based on your data)
  const calculateProgress = () => {
    // This is a placeholder - adjust based on your actual progress logic
    return 64; // 64%
  };

  const progress = calculateProgress();
  const daysUntilClose = getDaysUntil(escrow?.details?.closingDate);
  const propertyAddress = escrow?.details?.propertyAddress || 'Property Address';
  const city = escrow?.details?.city || 'City';
  const state = escrow?.details?.state || 'State';
  const zipCode = escrow?.details?.zipCode || '00000';
  const escrowNumber = escrow?.details?.escrowNumber || 'ESC-2025-0000';
  const status = escrow?.details?.escrowStatus || 'active';
  const purchasePrice = escrow?.financials?.purchasePrice || 0;
  const commission = escrow?.financials?.grossCommission || 0;
  const closingDate = escrow?.details?.closingDate;

  // Get placeholder image (you can replace with actual property image logic)
  const propertyImage = escrow?.['property-details']?.image ||
    `data:image/svg+xml,%3Csvg width='320' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='320' height='200' fill='%234F46E5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(propertyAddress)}%3C/text%3E%3C/svg%3E`;

  return (
    <HeroContainer>
      <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
        {/* Property Image */}
        <PropertyImageWrapper>
          <PropertyImage src={propertyImage} alt={propertyAddress} />
          <ProgressBadge>
            {progress}% Complete
          </ProgressBadge>
        </PropertyImageWrapper>

        {/* Property Info & Stats */}
        <Box flex={1}>
          {/* Header */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" mb={1}>
                {propertyAddress}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1" color="text.secondary">
                  {city}, {state} {zipCode}
                </Typography>
                <Typography color="text.disabled">•</Typography>
                <Typography variant="body1" color="primary" fontWeight={500}>
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

          {/* Stats Grid */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard elevation={0}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5}>
                  Purchase Price
                </Typography>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {formatCurrency(purchasePrice)}
                </Typography>
                <Typography variant="caption" color="success.main" mt={0.5}>
                  ▲ At asking
                </Typography>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard elevation={0}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5}>
                  My Commission
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {formatCurrency(commission)}
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  {purchasePrice ? ((commission / purchasePrice) * 100).toFixed(1) : 0}% of sale
                </Typography>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard elevation={0}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5}>
                  Close Date
                </Typography>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {formatDate(closingDate)}
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  {daysUntilClose !== null ? `${daysUntilClose} days left` : 'Date TBD'}
                </Typography>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard elevation={0}>
                <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5}>
                  Next Deadline
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  Oct 20
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  Inspection
                </Typography>
              </StatCard>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box display="flex" gap={1.5} flexWrap="wrap">
            <ActionButton
              variant="contained"
              startIcon={<Email />}
              onClick={onEmailParties}
            >
              📧 Email All Parties
            </ActionButton>
            <ActionButton
              variant="outlined"
              startIcon={<Assessment />}
              onClick={onGenerateStatement}
            >
              📊 Generate Statement
            </ActionButton>
            <ActionButton
              variant="outlined"
              startIcon={<MoreHoriz />}
              onClick={onMoreActions}
            >
              ⋯ More
            </ActionButton>
          </Box>
        </Box>
      </Box>
    </HeroContainer>
  );
};

export default EscrowHeroCard;
