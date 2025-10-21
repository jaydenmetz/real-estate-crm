import React from 'react';
import { Box, Card, Typography, Skeleton } from '@mui/material';
import { AttachMoney, TrendingUp, AccountBalance } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../../utils/formatters';

// Ultra-clean card showing only 3 key financial numbers
const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s',
  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  marginBottom: theme.spacing(1.5),
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  flexShrink: 0,
}));

const FinancialsWidget = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <CompactCard>
        <Skeleton width="60%" height={28} sx={{ mb: 2.5, bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Skeleton width="100%" height={70} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
        <Skeleton width="100%" height={70} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
        <Skeleton width="100%" height={70} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
      </CompactCard>
    );
  }

  // FIXED: Use flat database fields instead of nested financials object
  const purchasePrice = escrow?.purchase_price || escrow?.purchasePrice || 0;
  const commissionPercent = escrow?.commission_percent || escrow?.commissionRate || 0;
  const commissionTotal = escrow?.commission_total || escrow?.myCommission || 0;

  // Calculate agent net (simplified - should match real commission structure)
  const agentNet = commissionTotal > 0 ? commissionTotal * 0.80 - 285 - 250 : 0; // 80% split - fees

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      onClick={onClick}
    >
      {/* Header */}
      <Typography variant="h6" fontWeight="700" sx={{ color: 'white', mb: 2.5 }}>
        Financials
      </Typography>

      {/* Key Metrics - Only 3 shown */}
      <Box flex={1}>
        {/* Purchase Price */}
        <MetricBox>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Purchase Price
            </Typography>
            <Typography variant="h5" fontWeight="700" sx={{ color: 'white', mt: 0.5 }}>
              {formatCurrency(purchasePrice)}
            </Typography>
          </Box>
          <IconBox>
            <AccountBalance sx={{ fontSize: 28, color: 'white' }} />
          </IconBox>
        </MetricBox>

        {/* Commission Rate */}
        <MetricBox>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Commission Rate
            </Typography>
            <Typography variant="h5" fontWeight="700" sx={{ color: 'white', mt: 0.5 }}>
              {commissionPercent}%
            </Typography>
          </Box>
          <IconBox>
            <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
          </IconBox>
        </MetricBox>

        {/* Agent Net Income */}
        <MetricBox sx={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Your Net (1099)
            </Typography>
            <Typography variant="h4" fontWeight="700" sx={{ color: 'white', mt: 0.5 }}>
              {formatCurrency(agentNet)}
            </Typography>
          </Box>
          <IconBox sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
            <AttachMoney sx={{ fontSize: 32, color: 'white' }} />
          </IconBox>
        </MetricBox>
      </Box>

      {/* Footer */}
      <Box
        mt={2}
        pt={2}
        borderTop="1px solid rgba(255, 255, 255, 0.2)"
        textAlign="center"
      >
        <Typography variant="caption" fontWeight="600" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Click to view full breakdown
        </Typography>
      </Box>
    </CompactCard>
  );
};

export default FinancialsWidget;
