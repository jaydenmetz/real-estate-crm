import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Close, TrendingUp } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 600,
    width: '100%',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
  color: 'white',
}));

const FinancialRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
}));

const HighlightRow = styled(FinancialRow)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  marginTop: theme.spacing(2),
}));

/**
 * FinancialsDetailModal (Stub for Phase 3)
 * Full implementation will be completed in Phase 6
 * Currently shows basic commission breakdown with mock data
 */
const FinancialsDetailModal = ({ open, onClose, escrow }) => {
  // Mock data (will be replaced with real API data in Phase 6)
  const baseCommission = escrow?.financials?.grossCommission || 2779.20;
  const franchiseFee = escrow?.financials?.franchiseFees || 173.70;
  const dealNet = baseCommission - franchiseFee;
  const agentCommissionPercent = escrow?.financials?.splitPercentage || 80;
  const agentCommission = dealNet * (agentCommissionPercent / 100);
  const transactionFee = escrow?.financials?.transactionFee || 285.00;
  const tcFee = escrow?.financials?.tcFee || 250.00;
  const agent1099Income = agentCommission - transactionFee - tcFee;

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Header>
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUp />
          <Typography variant="h6" fontWeight="700">
            Financial Breakdown
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
        >
          <Close />
        </Button>
      </Header>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          DEAL BREAKDOWN
        </Typography>

        <FinancialRow>
          <Typography variant="body2">Base Commission</Typography>
          <Typography variant="body2" fontWeight="600">{formatCurrency(baseCommission)}</Typography>
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" sx={{ pl: 2 }}>Franchise Fees</Typography>
          <Typography variant="body2" color="error.main">-{formatCurrency(franchiseFee)}</Typography>
        </FinancialRow>

        <Divider sx={{ my: 1 }} />

        <FinancialRow>
          <Typography variant="body2" fontWeight="600">Deal Net</Typography>
          <Typography variant="body2" fontWeight="600">{formatCurrency(dealNet)}</Typography>
        </FinancialRow>

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          AGENT SPLIT
        </Typography>

        <FinancialRow>
          <Typography variant="body2">Agent Commission ({agentCommissionPercent}%)</Typography>
          <Typography variant="body2" fontWeight="600">{formatCurrency(agentCommission)}</Typography>
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" sx={{ pl: 2 }}>Transaction Fee</Typography>
          <Typography variant="body2" color="error.main">-{formatCurrency(transactionFee)}</Typography>
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" sx={{ pl: 2 }}>TC Fee</Typography>
          <Typography variant="body2" color="error.main">-{formatCurrency(tcFee)}</Typography>
        </FinancialRow>

        <HighlightRow sx={{ backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="body1" fontWeight="700">
            Agent Net (1099)
          </Typography>
          <Typography variant="h6" fontWeight="700">
            {formatCurrency(agent1099Income)}
          </Typography>
        </HighlightRow>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="caption" color="warning.dark">
            🚧 Phase 3 Stub: Full editing functionality will be added in Phase 6
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button variant="contained" disabled>
          Save Changes (Phase 6)
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default FinancialsDetailModal;
