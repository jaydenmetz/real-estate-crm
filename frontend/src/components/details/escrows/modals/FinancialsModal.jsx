import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { styled } from '@mui/material/styles';
import EditableField from '../components/EditableField';
import { formatCurrency, parseCurrency, parsePercentage } from '../../../../utils/formatters';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    maxWidth: 1400,
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

const PropertyHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SectionBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2.5),
  paddingBottom: theme.spacing(1),
  borderBottom: `2px solid ${theme.palette.divider}`,
}));

const FinancialRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
}));

const SubRow = styled(Box)(({ theme}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0, 1, 3),
}));

const TotalRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: '#1e293b',
  color: 'white',
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const FinancialsModal = ({ open, onClose, escrow, onUpdate }) => {
  const financials = escrow?.financials || {};
  const details = escrow?.details || {};

  // Property details
  const propertyAddress = escrow?.property_address || '';
  const displayId = escrow?.display_id || '';

  // Purchase Price (from escrow table)
  const purchasePrice = escrow?.purchase_price || 0;

  // Deal Cost Breakdown
  const commissionPercentage = financials.commissionPercentage || escrow?.commission_percentage || 2.5;
  const baseCommission = financials.baseCommission || (purchasePrice * commissionPercentage / 100);
  const grossCommission = financials.grossCommission || baseCommission;
  const referralFees = financials.referralFees || 0;
  const grossCommissionFees = referralFees; // Same value, different label
  const adjustedGross = grossCommission - grossCommissionFees;
  const netCommission = adjustedGross; // After referral fees
  const franchiseFees = financials.franchiseFees || 0;
  const dealExpense = franchiseFees;
  const dealNet = netCommission - dealExpense;

  // Agent Cost Breakdown
  const agentGCI = dealNet; // Same as Deal Net
  const splitPercentage = financials.splitPercentage || 75;
  const agentCommission = agentGCI * (splitPercentage / 100);
  const transactionFee = financials.transactionFee || 285;
  const tcFee = financials.tcFee || 250;
  const agentSplit = agentCommission - transactionFee - tcFee;
  const agent1099Income = agentSplit;
  const excessPayment = agent1099Income; // Same value for now
  const agentNet = agent1099Income;

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
    <StyledDialog open={open} onClose={onClose} maxWidth={false}>
      <HeaderGradient>
        <Box>
          <Typography variant="h5" fontWeight="700">
            Financial Breakdown
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
            Complete commission calculation and expense tracking
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon size={24} />
        </IconButton>
      </HeaderGradient>

      <PropertyHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight="600">
              Property Address:
            </Typography>
            <Typography variant="h6" fontWeight="700" color="text.primary">
              {propertyAddress}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary" fontWeight="600">
              Deal ID:
            </Typography>
            <Typography variant="h6" fontWeight="700" color="primary.main">
              {displayId}
            </Typography>
          </Box>
        </Box>
      </PropertyHeader>

      <DialogContent sx={{ p: 4, backgroundColor: 'grey.50' }}>
        <Grid container spacing={3}>
          {/* Left Column - Deal Cost Breakdown */}
          <Grid item xs={12} md={6}>
            <SectionBox>
              <SectionTitle>Deal Cost Breakdown</SectionTitle>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Base Commission
                </Typography>
                <EditableField
                  value={baseCommission}
                  onSave={(value) => handleUpdateField('baseCommission', value)}
                  type="currency"
                  format={formatCurrency}
                  parse={parseCurrency}
                  displayClass="MuiTypography-root MuiTypography-body1"
                  disabled={!onUpdate}
                />
              </FinancialRow>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Gross Commission
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
                <Typography variant="body1" fontWeight="600">
                  Gross Commission Fees
                </Typography>
                <Typography variant="body1" fontWeight="600" color="error.main">
                  {formatCurrency(-grossCommissionFees)}
                </Typography>
              </FinancialRow>

              <SubRow>
                <Typography variant="body2" color="text.secondary">
                  Referral Fees ({formatCurrency(-referralFees)})
                </Typography>
                <EditableField
                  value={referralFees}
                  onSave={(value) => handleUpdateField('referralFees', value)}
                  type="currency"
                  format={(val) => formatCurrency(-val)}
                  parse={parseCurrency}
                  displayClass="MuiTypography-root MuiTypography-body2"
                  disabled={!onUpdate}
                />
              </SubRow>

              <Divider sx={{ my: 1.5 }} />

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Adjusted Gross
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {formatCurrency(adjustedGross)}
                </Typography>
              </FinancialRow>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Net Commission
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {formatCurrency(netCommission)}
                </Typography>
              </FinancialRow>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Deal Expense
                </Typography>
                <Typography variant="body1" fontWeight="600" color="error.main">
                  {formatCurrency(-dealExpense)}
                </Typography>
              </FinancialRow>

              <SubRow>
                <Typography variant="body2" color="text.secondary">
                  Franchise Fees ({formatCurrency(-franchiseFees)})
                </Typography>
                <EditableField
                  value={franchiseFees}
                  onSave={(value) => handleUpdateField('franchiseFees', value)}
                  type="currency"
                  format={(val) => formatCurrency(-val)}
                  parse={parseCurrency}
                  displayClass="MuiTypography-root MuiTypography-body2"
                  disabled={!onUpdate}
                />
              </SubRow>

              <TotalRow>
                <Typography variant="h6" fontWeight="700">
                  Deal Net
                </Typography>
                <Typography variant="h5" fontWeight="700">
                  {formatCurrency(dealNet)}
                </Typography>
              </TotalRow>
            </SectionBox>
          </Grid>

          {/* Right Column - Agent Cost Breakdown */}
          <Grid item xs={12} md={6}>
            <SectionBox>
              <SectionTitle>Agent Cost Breakdown</SectionTitle>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Deal Net
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {formatCurrency(dealNet)}
                </Typography>
              </FinancialRow>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Agent GCI
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {formatCurrency(agentGCI)}
                </Typography>
              </FinancialRow>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Jayden Metz's Split
                </Typography>
                <Typography variant="body1" fontWeight="700">
                  {formatCurrency(agentSplit)}
                </Typography>
              </FinancialRow>

              <SubRow>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Agent Commission -
                  </Typography>
                  <EditableField
                    value={splitPercentage}
                    onSave={(value) => handleUpdateField('splitPercentage', value)}
                    type="number"
                    format={(val) => `${val}%`}
                    parse={parsePercentage}
                    displayClass="MuiTypography-root MuiTypography-body2"
                    placeholder="0%"
                    disabled={!onUpdate}
                  />
                  <Typography variant="body2" color="text.secondary" component="span">
                    {' '}({formatCurrency(agentCommission)})
                  </Typography>
                </Box>
              </SubRow>

              <SubRow>
                <Typography variant="body2" color="text.secondary">
                  Transaction Fee ({formatCurrency(-transactionFee)})
                </Typography>
                <EditableField
                  value={transactionFee}
                  onSave={(value) => handleUpdateField('transactionFee', value)}
                  type="currency"
                  format={(val) => formatCurrency(-val)}
                  parse={parseCurrency}
                  displayClass="MuiTypography-root MuiTypography-body2"
                  disabled={!onUpdate}
                />
              </SubRow>

              <SubRow>
                <Typography variant="body2" color="text.secondary">
                  TC Fee ({formatCurrency(-tcFee)})
                </Typography>
                <EditableField
                  value={tcFee}
                  onSave={(value) => handleUpdateField('tcFee', value)}
                  type="currency"
                  format={(val) => formatCurrency(-val)}
                  parse={parseCurrency}
                  displayClass="MuiTypography-root MuiTypography-body2"
                  disabled={!onUpdate}
                />
              </SubRow>

              <Divider sx={{ my: 1.5 }} />

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Agent 1099 Income
                </Typography>
                <Typography variant="body1" fontWeight="700" color="success.main">
                  {formatCurrency(agent1099Income)}
                </Typography>
              </FinancialRow>

              <FinancialRow>
                <Typography variant="body1" fontWeight="600">
                  Excess Payment
                </Typography>
                <Typography variant="body1" fontWeight="700" color="success.main">
                  {formatCurrency(excessPayment)}
                </Typography>
              </FinancialRow>

              <TotalRow>
                <Typography variant="h6" fontWeight="700">
                  Agent Net
                </Typography>
                <Typography variant="h5" fontWeight="700">
                  {formatCurrency(agentNet)}
                </Typography>
              </TotalRow>
            </SectionBox>
          </Grid>
        </Grid>

        <Box mt={3} p={2} sx={{ backgroundColor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> Click any editable value to update. Calculated fields will automatically update based on your changes.
            Agent Net represents your 1099 income before taxes.
          </Typography>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default FinancialsModal;
