import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Styled components with purple theme
const WidgetCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  border: '1px solid rgba(118, 75, 162, 0.1)',
  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.08)'
}));

const MetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  background: 'white',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(118, 75, 162, 0.08)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5)
}));

const MetricIcon = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem'
  }
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  color: theme.palette.grey[500],
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 700,
  color: '#764ba2'
}));

function FinancialsWidgetCompact({ data }) {
  if (!data) return null;

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare commission breakdown for pie chart
  const commissionData = [
    { name: 'Net Commission', value: data.netCommission || data.net_commission || 0, color: '#667eea' },
    { name: 'Brokerage Split', value: data.brokerageSplit || data.brokerage_split || 0, color: '#9ca3af' },
    { name: 'Transaction Fees', value: (data.transactionFee || 0) + (data.tcFee || 0), color: '#d1d5db' }
  ].filter(item => item.value > 0);

  const metrics = [
    {
      label: 'Purchase Price',
      value: formatCurrency(data.purchasePrice || data.purchase_price),
      icon: <MoneyIcon />
    },
    {
      label: 'Down Payment',
      value: formatCurrency(data.downPayment || data.down_payment),
      icon: <BankIcon />
    },
    {
      label: 'Loan Amount',
      value: formatCurrency(data.loanAmount || data.loan_amount),
      icon: <TrendingIcon />
    },
    {
      label: 'My Commission',
      value: formatCurrency(data.myCommission || data.my_commission),
      icon: <ReceiptIcon />
    }
  ];

  return (
    <WidgetCard elevation={0}>
      <Typography variant="h6" fontWeight="600" color="#764ba2" mb={2}>
        Financials
      </Typography>

      <Grid container spacing={1.5}>
        {metrics.map((metric, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <MetricCard>
              <MetricIcon>{metric.icon}</MetricIcon>
              <Box flex={1} minWidth={0}>
                <MetricLabel>{metric.label}</MetricLabel>
                <MetricValue>{metric.value}</MetricValue>
              </Box>
            </MetricCard>
          </Grid>
        ))}
      </Grid>

      {commissionData.length > 0 && (
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <Box p={1.5} bgcolor="white" borderRadius={1} border="1px solid rgba(118, 75, 162, 0.08)">
              <Typography variant="subtitle2" fontWeight={600} color="#764ba2" mb={1}>
                Commission Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={commissionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {commissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box p={1.5} bgcolor="white" borderRadius={1} border="1px solid rgba(118, 75, 162, 0.08)">
              <Typography variant="subtitle2" fontWeight={600} color="#764ba2" mb={1}>
                Net Breakdown
              </Typography>
              {commissionData.map((item, index) => (
                <Box key={index} display="flex" justifyContent="space-between" mb={0.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.color
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={600}>
                    {formatCurrency(item.value)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600} color="#764ba2">
                  Net Total
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#764ba2">
                  {formatCurrency(data.netCommission || data.net_commission)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
    </WidgetCard>
  );
}

export default FinancialsWidgetCompact;