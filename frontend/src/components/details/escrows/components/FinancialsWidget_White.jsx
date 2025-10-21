import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../../utils/formatters';

// White card with green icon badge
const WhiteCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  overflow: 'hidden', // Prevent content overflow
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const IconBadge = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: theme.spacing(1.5),
  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const MetricRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  minWidth: 0, // Allow flex items to shrink
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

const FinancialsWidget_White = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <WhiteCard>
        <Skeleton width="60%" height={28} sx={{ mb: 2.5 }} />
        <Skeleton width="100%" height={50} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" height={50} sx={{ mb: 1.5 }} />
        <Skeleton width="100%" height={50} />
      </WhiteCard>
    );
  }

  // Get financials from JSONB structure
  const financials = escrow?.financials || {};
  const details = escrow?.details || {};

  const purchasePrice = financials.purchasePrice || details.purchasePrice || escrow?.purchase_price || 0;
  const downPayment = financials.downPayment || details.downPayment || escrow?.down_payment || 0;
  const loanAmount = financials.loanAmount || details.loanAmount || escrow?.loan_amount || 0;
  const agentNet = financials.agentNet || financials.agent1099Income || details.myCommission || escrow?.my_commission || 0;
  const splitPercentage = financials.splitPercentage || 70;

  const downPaymentPercent = purchasePrice > 0 ? Math.round((downPayment / purchasePrice) * 100) : 0;

  return (
    <WhiteCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconBadge>
            <DollarSign size={18} style={{ color: 'white' }} />
          </IconBadge>
          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
            Financials
          </Typography>
        </Box>
      </Box>

      {/* Metrics */}
      <Box flex={1} display="flex" flexDirection="column" gap={0.5}>
        <MetricRow>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Purchase Price
          </Typography>
          <Typography variant="body2" fontWeight="700" color="text.primary">
            {formatCurrency(purchasePrice)}
          </Typography>
        </MetricRow>

        <MetricRow>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Down Payment ({downPaymentPercent}%)
          </Typography>
          <Typography variant="body2" fontWeight="600" color="text.primary">
            {formatCurrency(downPayment)}
          </Typography>
        </MetricRow>

        <MetricRow>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            Loan Amount
          </Typography>
          <Typography variant="body2" fontWeight="600" color="text.primary">
            {formatCurrency(loanAmount)}
          </Typography>
        </MetricRow>
      </Box>

      {/* Highlighted Commission */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: 2,
          padding: 2,
          mt: 2,
          border: '1px solid #86efac',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={0.5}>
              Your Commission
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Typography variant="caption" sx={{ backgroundColor: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.65rem', fontWeight: 600 }}>
                {splitPercentage}% split
              </Typography>
            </Box>
          </Box>
          <Box textAlign="right">
            <Typography variant="h5" fontWeight="700" sx={{ color: '#16a34a' }}>
              {formatCurrency(agentNet)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              net income
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        mt={2}
        pt={2}
        borderTop={1}
        borderColor="divider"
        textAlign="center"
      >
        <Typography variant="caption" color="text.secondary" sx={{ '&:hover': { color: 'success.main' } }}>
          Click for detailed breakdown →
        </Typography>
      </Box>
    </WhiteCard>
  );
};

export default FinancialsWidget_White;
