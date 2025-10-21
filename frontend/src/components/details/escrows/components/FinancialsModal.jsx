import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { Close, AttachMoney, TrendingUp } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import EditableField from './EditableField';
import { formatCurrency, parseCurrency, parsePercentage } from '../../../../utils/formatters';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 700,
    width: '100%',
  },
}));

const HeaderGradient = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  color: 'white',
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const FinancialRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
}));

const HighlightBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  color: 'white',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 1,
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1.5),
  marginTop: theme.spacing(2),
}));

const FinancialsModal = ({ open, onClose, escrow, onUpdate }) => {
  const financials = escrow?.financials || {};
  const purchasePrice = escrow?.purchase_price || escrow?.purchasePrice || 0;

  // Editable fields
  const commissionRate = financials.commissionRate || 3.0;
  const grossCommission = financials.grossCommission || (purchasePrice * (commissionRate / 100));
  const franchiseFees = financials.franchiseFees || 0;
  const splitPercentage = financials.splitPercentage || 80;
  const transactionFee = financials.transactionFee || 285;
  const tcFee = financials.tcFee || 250;

  // Calculated fields
  const adjustedGross = grossCommission - franchiseFees;
  const agentSplit = adjustedGross * (splitPercentage / 100);
  const agentNet = agentSplit - transactionFee - tcFee;

  // Handle field update
  const handleUpdateField = async (field, value) => {
    if (onUpdate) {
      await onUpdate({
        financials: {
          ...financials,
          [field]: value,
        },
      });
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <HeaderGradient>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Financial Breakdown
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
            Complete commission calculation
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </HeaderGradient>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 2, display: 'block' }}>
          Click any value to edit • Calculated fields update automatically
        </Typography>

        {/* Deal Overview */}
        <SectionTitle>Deal Overview</SectionTitle>

        <FinancialRow>
          <Typography variant="body1" color="text.primary" fontWeight="600">
            Purchase Price
          </Typography>
          <Typography variant="h6" fontWeight="700" color="primary.main">
            {formatCurrency(purchasePrice)}
          </Typography>
        </FinancialRow>

        <FinancialRow>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" color="text.primary">
              Commission Rate
            </Typography>
            <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
          </Box>
          <EditableField
            value={commissionRate}
            onSave={(value) => handleUpdateField('commissionRate', value)}
            type="number"
            format={(val) => `${val}%`}
            parse={parsePercentage}
            displayClass="MuiTypography-root MuiTypography-h6"
            placeholder="0.0%"
            disabled={!onUpdate}
          />
        </FinancialRow>

        <Divider sx={{ my: 2 }} />

        {/* Commission Breakdown */}
        <SectionTitle>Commission Breakdown</SectionTitle>

        <FinancialRow>
          <Typography variant="body1" color="text.primary">
            Gross Commission ({commissionRate}%)
          </Typography>
          <EditableField
            value={grossCommission}
            onSave={(value) => handleUpdateField('grossCommission', value)}
            type="currency"
            format={formatCurrency}
            parse={parseCurrency}
            displayClass="MuiTypography-root MuiTypography-body1"
            disabled={!onUpdate}
          />
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            Franchise Fees
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="error.main">-</Typography>
            <EditableField
              value={franchiseFees}
              onSave={(value) => handleUpdateField('franchiseFees', value)}
              type="currency"
              format={formatCurrency}
              parse={parseCurrency}
              displayClass="MuiTypography-root MuiTypography-body2"
              disabled={!onUpdate}
            />
          </Box>
        </FinancialRow>

        <Divider sx={{ my: 2 }} />

        <FinancialRow>
          <Typography variant="body1" fontWeight="600" color="text.primary">
            Deal Net (After Franchise Fees)
          </Typography>
          <Typography variant="h6" fontWeight="700" color="primary.main">
            {formatCurrency(adjustedGross)}
          </Typography>
        </FinancialRow>

        <Divider sx={{ my: 2 }} />

        {/* Agent Split */}
        <SectionTitle>Your Split</SectionTitle>

        <FinancialRow>
          <Typography variant="body1" color="text.primary">
            Split Percentage
          </Typography>
          <EditableField
            value={splitPercentage}
            onSave={(value) => handleUpdateField('splitPercentage', value)}
            type="number"
            format={(val) => `${val}%`}
            parse={parsePercentage}
            displayClass="MuiTypography-root MuiTypography-body1"
            placeholder="0%"
            disabled={!onUpdate}
          />
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body1" color="text.primary">
            Agent Commission ({splitPercentage}%)
          </Typography>
          <Typography variant="body1" fontWeight="600" color="success.main">
            {formatCurrency(agentSplit)}
          </Typography>
        </FinancialRow>

        <Divider sx={{ my: 1.5 }} />

        <FinancialRow>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            Transaction Fee
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="error.main">-</Typography>
            <EditableField
              value={transactionFee}
              onSave={(value) => handleUpdateField('transactionFee', value)}
              type="currency"
              format={formatCurrency}
              parse={parseCurrency}
              displayClass="MuiTypography-root MuiTypography-body2"
              disabled={!onUpdate}
            />
          </Box>
        </FinancialRow>

        <FinancialRow>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
            TC Fee
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="error.main">-</Typography>
            <EditableField
              value={tcFee}
              onSave={(value) => handleUpdateField('tcFee', value)}
              type="currency"
              format={formatCurrency}
              parse={parseCurrency}
              displayClass="MuiTypography-root MuiTypography-body2"
              disabled={!onUpdate}
            />
          </Box>
        </FinancialRow>

        {/* Agent Net (Highlighted) */}
        <HighlightBox>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Your Net Income
              </Typography>
              <Typography variant="h4" fontWeight="700" sx={{ color: 'white', mt: 0.5 }}>
                {formatCurrency(agentNet)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, display: 'block' }}>
                1099 Income (After All Fees)
              </Typography>
            </Box>
            <AttachMoney sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
          </Box>
        </HighlightBox>

        <Box mt={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> Agent Net is calculated automatically based on your commission split and fees.
            This is your 1099 income before taxes.
          </Typography>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default FinancialsModal;
