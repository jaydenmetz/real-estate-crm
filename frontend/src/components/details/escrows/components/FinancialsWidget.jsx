import React from 'react';
import {
  Box,
  Card,
  Typography,
  Divider,
  Chip,
  Skeleton
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  ExpandMore
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  background: 'white',
  height: '100%',
  maxHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const FinancialRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0)
}));

const HighlightRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(1)
}));

const FinancialsWidget = ({ escrow, loading, onClick }) => {
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <CompactCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Skeleton width="40%" height={24} />
          <Skeleton width="20%" height={22} />
        </Box>
        <Skeleton width="30%" height={16} sx={{ mb: 1 }} />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Box key={i} display="flex" justifyContent="space-between" mb={1}>
            <Skeleton width="45%" height={18} />
            <Skeleton width="25%" height={18} />
          </Box>
        ))}
        <Skeleton width="100%" height={50} sx={{ mt: 1, borderRadius: 1 }} />
      </CompactCard>
    );
  }

  // Extract financial data (supports both formats)
  const financials = escrow?.financials || {};

  const baseCommission = financials.grossCommission || 0;
  const franchiseFee = financials.franchiseFees || 0;
  const dealNet = financials.adjustedGross || (baseCommission - franchiseFee);
  const agentCommissionPercent = financials.splitPercentage || 80;
  const agentCommission = financials.agentSplit || (dealNet * (agentCommissionPercent / 100));
  const transactionFee = financials.transactionFee || 285;
  const tcFee = financials.tcFee || 250;
  const agent1099Income = financials.agent1099Income || financials.agentNet || (agentCommission - transactionFee - tcFee);

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AttachMoney sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
            Commission
          </Typography>
        </Box>
        <Chip
          icon={<TrendingUp sx={{ fontSize: 16 }} />}
          label="Agent GCI"
          size="small"
          color="success"
          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
        />
      </Box>

      {/* Deal Cost Breakdown */}
      <Box flex={1} overflow="auto">
        <Typography variant="caption" color="text.secondary" fontWeight="600" mb={1} display="block">
          DEAL BREAKDOWN
        </Typography>

        <FinancialRow>
          <Typography variant="body2" color="text.primary">Base Commission</Typography>
          <Typography variant="body2" fontWeight="600">{formatCurrency(baseCommission)}</Typography>
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            Franchise Fees
          </Typography>
          <Typography variant="body2" color="error.main">
            -{formatCurrency(franchiseFee)}
          </Typography>
        </FinancialRow>

        <Divider sx={{ my: 1 }} />

        <FinancialRow>
          <Typography variant="body2" fontWeight="600" color="text.primary">
            Deal Net
          </Typography>
          <Typography variant="body2" fontWeight="700" color="primary.main">
            {formatCurrency(dealNet)}
          </Typography>
        </FinancialRow>

        <Divider sx={{ my: 1.5 }} />

        {/* Agent Split Breakdown */}
        <Typography variant="caption" color="text.secondary" fontWeight="600" mb={1} display="block">
          YOUR SPLIT ({agentCommissionPercent}%)
        </Typography>

        <FinancialRow>
          <Typography variant="body2" color="text.primary">Agent Commission</Typography>
          <Typography variant="body2" fontWeight="600" color="success.main">
            {formatCurrency(agentCommission)}
          </Typography>
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            Transaction Fee
          </Typography>
          <Typography variant="body2" color="error.main">
            -{formatCurrency(transactionFee)}
          </Typography>
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            TC Fee
          </Typography>
          <Typography variant="body2" color="error.main">
            -{formatCurrency(tcFee)}
          </Typography>
        </FinancialRow>
      </Box>

      {/* Agent Net (Highlighted) */}
      <HighlightRow>
        <Typography variant="body1" fontWeight="700" color="white">
          Agent Net (1099)
        </Typography>
        <Typography variant="h6" fontWeight="700" color="white">
          {formatCurrency(agent1099Income)}
        </Typography>
      </HighlightRow>

      {/* Footer */}
      <Box
        mt={1}
        pt={1}
        borderTop={1}
        borderColor="divider"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={0.5}
      >
        <Typography variant="caption" color="text.secondary">
          View Full Breakdown
        </Typography>
        <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Box>
    </CompactCard>
  );
};

export default FinancialsWidget;
