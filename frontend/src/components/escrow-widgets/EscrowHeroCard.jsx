import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Chip,
  Paper
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Timer,
  CheckCircle,
  Home
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HeroCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(118, 75, 162, 0.25)',
  borderRadius: theme.spacing(2),
  overflow: 'visible'
}));

const PropertyImageBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 300,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  position: 'relative',
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.spacing(1.5),
  color: 'white',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  }
}));

const AIAgentSlot = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.spacing(1.5),
  color: 'white'
}));

const StatusBadge = styled(Chip)(({ status }) => {
  const getStatusColor = () => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('open')) return '#4caf50';
    if (statusLower.includes('pending')) return '#ff9800';
    if (statusLower.includes('closed') || statusLower.includes('complete')) return '#2196f3';
    return '#757575';
  };

  return {
    backgroundColor: getStatusColor(),
    color: 'white',
    fontWeight: 600,
    fontSize: '0.875rem',
    height: 32,
    position: 'absolute',
    top: 16,
    right: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  };
});

const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const EscrowHeroCard = ({ escrow }) => {
  // Extract data with fallbacks
  const propertyImage = escrow?.property_image || escrow?.propertyImage;
  const propertyAddress = escrow?.property_address || escrow?.propertyAddress || 'Address Not Available';
  const escrowStatus = escrow?.escrow_status || escrow?.escrowStatus || 'Unknown';
  const purchasePrice = escrow?.purchase_price || escrow?.purchasePrice || 0;
  const myCommission = escrow?.my_commission || escrow?.myCommission || 0;
  const closingDate = escrow?.closing_date || escrow?.closingDate;
  const openingDate = escrow?.opening_date || escrow?.openingDate;
  const checklistProgress = escrow?.checklist_progress || escrow?.checklistProgress || 0;

  // Calculate days to close
  const calculateDaysToClose = () => {
    if (!closingDate) return 'N/A';
    const today = new Date();
    const close = new Date(closingDate);
    const diffTime = close - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysToClose = calculateDaysToClose();
  const daysToCloseDisplay = typeof daysToClose === 'number' ? daysToClose : daysToClose;

  return (
    <HeroCard>
      <CardContent sx={{ p: 4 }}>
        {/* Property Image */}
        <PropertyImageBox>
          {propertyImage ? (
            <img src={propertyImage} alt={propertyAddress} />
          ) : (
            <Home sx={{ fontSize: 120, color: 'rgba(255,255,255,0.5)' }} />
          )}
          <StatusBadge status={escrowStatus} label={escrowStatus} />
        </PropertyImageBox>

        {/* Property Address */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {propertyAddress}
        </Typography>

        {/* Stat Cards Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Purchase Price */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ fontSize: 28 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Purchase Price
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </StatCard>
          </Grid>

          {/* My Commission */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ fontSize: 28 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  My Commission
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {formatCurrency(myCommission)}
              </Typography>
            </StatCard>
          </Grid>

          {/* Days to Close */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              elevation={0}
              sx={{
                background: typeof daysToClose === 'number' && daysToClose < 30
                  ? 'rgba(255, 152, 0, 0.25)'
                  : 'rgba(255, 255, 255, 0.15)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer sx={{ fontSize: 28 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Days to Close
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {daysToCloseDisplay}
                {typeof daysToClose === 'number' && (
                  <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                    days
                  </Typography>
                )}
              </Typography>
            </StatCard>
          </Grid>

          {/* Progress */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 28 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Progress
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {checklistProgress}%
              </Typography>
            </StatCard>
          </Grid>
        </Grid>

        {/* AI Agent Slot */}
        <AIAgentSlot>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, opacity: 0.9 }}>
            AI Agent Actions
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            AI agent features coming soon. This slot will display active AI tasks and available actions.
          </Typography>
        </AIAgentSlot>
      </CardContent>
    </HeroCard>
  );
};

export default EscrowHeroCard;
