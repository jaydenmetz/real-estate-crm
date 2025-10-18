import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Grid,
  Stack,
  Avatar
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon
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

const DetailSection = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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

const ContactBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  border: '1px solid rgba(255, 255, 255, 0.1)'
}));

function HeroHeaderCompact({ data }) {
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

  return (
    <HeaderContainer>
      {/* Address and Status */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
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
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <DetailSection>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
              Purchase Price
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(data.purchasePrice || data.purchase_price)}
            </Typography>
          </DetailSection>
        </Grid>
        <Grid item xs={6} sm={3}>
          <DetailSection>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
              Closing Date
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatDate(data.closingDate || data.coeDate)}
            </Typography>
            {dtc !== null && (
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                {dtc > 0 ? `${dtc} days remaining` : dtc === 0 ? 'Closing Today!' : 'Closed'}
              </Typography>
            )}
          </DetailSection>
        </Grid>
        <Grid item xs={6} sm={3}>
          <DetailSection>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
              My Commission
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(data.myCommission || data.my_commission)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
              Net: {formatCurrency(data.netCommission || data.net_commission)}
            </Typography>
          </DetailSection>
        </Grid>
        <Grid item xs={6} sm={3}>
          <DetailSection>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
              Property Type
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {data.propertyType || data.property_type || 'Single Family'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
              {data.transactionType || data.transaction_type || 'Purchase'}
            </Typography>
          </DetailSection>
        </Grid>
      </Grid>

      {/* Primary Contacts Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <ContactBox>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                Buyer
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.buyer?.name || data.people?.buyer?.name || 'Not assigned'}
              </Typography>
              {(data.buyer?.phone || data.people?.buyer?.phone) && (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {data.buyer?.phone || data.people?.buyer?.phone}
                </Typography>
              )}
            </Box>
          </ContactBox>
        </Grid>
        <Grid item xs={12} sm={6}>
          <ContactBox>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                Seller
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.seller?.name || data.people?.seller?.name || 'Not assigned'}
              </Typography>
              {(data.seller?.phone || data.people?.seller?.phone) && (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {data.seller?.phone || data.people?.seller?.phone}
                </Typography>
              )}
            </Box>
          </ContactBox>
        </Grid>
      </Grid>

      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          pointerEvents: 'none'
        }}
      />
    </HeaderContainer>
  );
}

export default HeroHeaderCompact;