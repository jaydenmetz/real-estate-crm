import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider
} from '@mui/material';
import { AttachMoney, TrendingUp } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import EditableField from '../common/EditableField';

const WidgetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  }
}));

const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const FinancialWidget = ({ viewMode = 'medium', data = {}, onUpdate }) => {
  const purchasePrice = data?.purchase_price || data?.purchasePrice || 0;
  const downPayment = data?.down_payment || data?.downPayment || 0;
  const loanAmount = data?.loan_amount || data?.loanAmount || 0;
  const earnestMoney = data?.earnest_money_deposit || data?.earnestMoneyDeposit || 0;
  const myCommission = data?.my_commission || data?.myCommission || 0;
  const commissionRate = data?.commission_percentage || data?.commission_rate || data?.commissionRate;
  const closingCosts = data?.closing_costs || data?.closingCosts || 0;

  const handleFieldUpdate = async (field, value) => {
    if (onUpdate) {
      await onUpdate(field, value);
    }
  };

  return (
    <WidgetCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AttachMoney sx={{ color: '#764ba2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Financial Details
          </Typography>
        </Box>

        {viewMode === 'small' && (
          <Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Purchase Price
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Down Payment
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatCurrency(downPayment)}
              </Typography>
            </Box>
          </Box>
        )}

        {viewMode === 'medium' && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Purchase Price
                </Typography>
                <EditableField
                  value={purchasePrice}
                  onSave={(value) => handleFieldUpdate('purchase_price', value)}
                  type="currency"
                  variant="h6"
                  sx={{ color: '#764ba2' }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  My Commission
                </Typography>
                <EditableField
                  value={myCommission}
                  onSave={(value) => handleFieldUpdate('my_commission', value)}
                  type="currency"
                  variant="h6"
                  sx={{ color: '#4caf50' }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Down Payment
                </Typography>
                <EditableField
                  value={downPayment}
                  onSave={(value) => handleFieldUpdate('down_payment', value)}
                  type="currency"
                  variant="body1"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Loan Amount
                </Typography>
                <EditableField
                  value={loanAmount}
                  onSave={(value) => handleFieldUpdate('loan_amount', value)}
                  type="currency"
                  variant="body1"
                />
              </Grid>
            </Grid>

            {earnestMoney > 0 && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Earnest Money Deposit
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(earnestMoney)}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {viewMode === 'large' && (
          <Box>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Purchase Price</TableCell>
                  <TableCell align="right" sx={{ fontSize: '1rem', fontWeight: 600, color: '#764ba2' }}>
                    {formatCurrency(purchasePrice)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Down Payment</TableCell>
                  <TableCell align="right">{formatCurrency(downPayment)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Loan Amount</TableCell>
                  <TableCell align="right">{formatCurrency(loanAmount)}</TableCell>
                </TableRow>
                {earnestMoney > 0 && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Earnest Money Deposit</TableCell>
                    <TableCell align="right">{formatCurrency(earnestMoney)}</TableCell>
                  </TableRow>
                )}
                {closingCosts > 0 && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Closing Costs</TableCell>
                    <TableCell align="right">{formatCurrency(closingCosts)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Commission Breakdown
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>My Commission</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      {formatCurrency(myCommission)}
                    </TableCell>
                  </TableRow>
                  {commissionRate && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Commission Rate</TableCell>
                      <TableCell align="right">{commissionRate}%</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>% of Purchase Price</TableCell>
                    <TableCell align="right">
                      {purchasePrice > 0 ? ((myCommission / purchasePrice) * 100).toFixed(2) : 0}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </CardContent>
    </WidgetCard>
  );
};

export default FinancialWidget;
