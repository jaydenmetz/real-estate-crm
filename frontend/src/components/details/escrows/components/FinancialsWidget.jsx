import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  IconButton,
  Stack,
  Divider,
  Button,
  Paper,
  LinearProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Collapse
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  Calculate,
  Home,
  LocalAtm,
  CreditCard,
  Savings,
  Edit,
  ExpandMore,
  ExpandLess,
  PieChart,
  ShowChart,
  Assessment,
  MonetizationOn,
  Payment,
  AccountBalanceWallet
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const WidgetContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white'
}));

const MetricCard = styled(Paper)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${theme.palette[color].light}15 0%, ${theme.palette[color].main}10 100%)`,
  border: `1px solid ${theme.palette[color].light}30`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 20px ${theme.palette[color].main}20`
  }
}));

const AmountDisplay = styled(Typography)(({ theme, color = 'text.primary' }) => ({
  fontWeight: 700,
  fontSize: '1.75rem',
  color: theme.palette[color].main || color,
  lineHeight: 1.2
}));

const SummaryBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)', // Blue gradient (escrows theme)
  borderRadius: theme.spacing(2),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)'
  }
}));

const TransactionRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  '& td': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const FinancialsWidget = ({ data = {}, onEdit }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, breakdown, transactions

  // Extract financial data
  const purchasePrice = data.purchase_price || data.purchasePrice || 0;
  const listPrice = data.list_price || data.listPrice || purchasePrice;
  const downPayment = data.down_payment || data.downPayment || 0;
  const loanAmount = data.loan_amount || data.loanAmount || (purchasePrice - downPayment);
  const earnestMoney = data.earnest_money || data.earnestMoney || 0;
  const closingCosts = data.closing_costs || data.closingCosts || 0;
  const sellerCredits = data.seller_credits || data.sellerCredits || 0;
  const commissionRate = data.commission_rate || data.commissionRate || 0;
  const commissionAmount = data.commission_amount || data.commissionAmount || 
    (purchasePrice * (commissionRate / 100));
  
  // Calculate derived values
  const downPaymentPercent = purchasePrice > 0 ? (downPayment / purchasePrice) * 100 : 0;
  const loanToValue = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;
  const totalCashNeeded = downPayment + closingCosts - sellerCredits;
  const effectivePurchasePrice = purchasePrice - sellerCredits;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Pie chart data for fund distribution (blue theme for escrows)
  const fundDistribution = [
    { name: 'Down Payment', value: downPayment, color: '#4A90E2' }, // Blue
    { name: 'Loan Amount', value: loanAmount, color: '#5B9FED' }, // Light blue
    { name: 'Closing Costs', value: closingCosts, color: '#7CB9E8' }, // Sky blue
    { name: 'Seller Credits', value: sellerCredits, color: '#4ecdc4' } // Teal (keep)
  ].filter(item => item.value > 0);

  // Transaction breakdown
  const transactions = [
    { label: 'Purchase Price', amount: purchasePrice, type: 'primary' },
    { label: 'Down Payment', amount: -downPayment, type: 'debit' },
    { label: 'Loan Amount', amount: loanAmount, type: 'credit' },
    { label: 'Earnest Money Deposit', amount: -earnestMoney, type: 'debit' },
    { label: 'Closing Costs', amount: -closingCosts, type: 'debit' },
    { label: 'Seller Credits', amount: sellerCredits, type: 'credit' },
    { label: 'Commission', amount: -commissionAmount, type: 'debit' }
  ].filter(t => t.amount !== 0);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <WidgetContainer
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Financial Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete transaction financial breakdown
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => onEdit?.('financials')}>
            <Edit />
          </IconButton>
        </Stack>
      </Box>

      {/* Summary Box - 2×2 Grid (prevents text overlap) */}
      <SummaryBox sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.75rem' }}>
                Purchase Price
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.75rem' }}>
                Total Cash Needed
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {formatCurrency(totalCashNeeded)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.75rem' }}>
                Loan Amount
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {formatCurrency(loanAmount)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.75rem' }}>
                LTV Ratio
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {formatPercent(loanToValue)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </SummaryBox>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant={viewMode === 'overview' ? 'contained' : 'outlined'}
          startIcon={<PieChart />}
          onClick={() => setViewMode('overview')}
        >
          Overview
        </Button>
        <Button
          size="small"
          variant={viewMode === 'breakdown' ? 'contained' : 'outlined'}
          startIcon={<Receipt />}
          onClick={() => setViewMode('breakdown')}
        >
          Breakdown
        </Button>
        <Button
          size="small"
          variant={viewMode === 'transactions' ? 'contained' : 'outlined'}
          startIcon={<ShowChart />}
          onClick={() => setViewMode('transactions')}
        >
          Transactions
        </Button>
      </Box>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MetricCard color="primary" elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.main',
                    color: 'white'
                  }}
                >
                  <LocalAtm />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Down Payment
                  </Typography>
                  <AmountDisplay color="primary">
                    {formatCurrency(downPayment)}
                  </AmountDisplay>
                  <Typography variant="caption" color="text.secondary">
                    {formatPercent(downPaymentPercent)} of purchase price
                  </Typography>
                </Box>
              </Box>
            </MetricCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricCard color="success" elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'success.main',
                    color: 'white'
                  }}
                >
                  <AccountBalance />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Loan Amount
                  </Typography>
                  <AmountDisplay color="success">
                    {formatCurrency(loanAmount)}
                  </AmountDisplay>
                  <Typography variant="caption" color="text.secondary">
                    {formatPercent(loanToValue)} LTV ratio
                  </Typography>
                </Box>
              </Box>
            </MetricCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricCard color="warning" elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'warning.main',
                    color: 'white'
                  }}
                >
                  <Receipt />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Closing Costs
                  </Typography>
                  <AmountDisplay color="warning">
                    {formatCurrency(closingCosts)}
                  </AmountDisplay>
                  <Typography variant="caption" color="text.secondary">
                    Estimated buyer costs
                  </Typography>
                </Box>
              </Box>
            </MetricCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricCard color="info" elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'info.main',
                    color: 'white'
                  }}
                >
                  <Savings />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Earnest Money
                  </Typography>
                  <AmountDisplay color="info">
                    {formatCurrency(earnestMoney)}
                  </AmountDisplay>
                  <Typography variant="caption" color="text.secondary">
                    Initial deposit
                  </Typography>
                </Box>
              </Box>
            </MetricCard>
          </Grid>

          {/* Fund Distribution Chart */}
          {fundDistribution.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 2 }} elevation={0}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Fund Distribution
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <ResponsiveContainer width={200} height={200}>
                    <RechartsChart>
                      <Pie
                        data={fundDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {fundDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    </RechartsChart>
                  </ResponsiveContainer>
                  <Box sx={{ flex: 1 }}>
                    {fundDistribution.map((item) => (
                      <Box
                        key={item.name}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color
                          }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(item.value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {viewMode === 'breakdown' && (
        <Stack spacing={2}>
          {/* Buyer Costs */}
          <Paper sx={{ p: 2, borderRadius: 1.5 }} elevation={0}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => toggleSection('buyer')}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Buyer Costs
              </Typography>
              <IconButton size="small">
                {expandedSection === 'buyer' ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={expandedSection === 'buyer'}>
              <Table size="small" sx={{ mt: 2 }}>
                <TableBody>
                  <TransactionRow>
                    <TableCell>Down Payment</TableCell>
                    <TableCell align="right">{formatCurrency(downPayment)}</TableCell>
                  </TransactionRow>
                  <TransactionRow>
                    <TableCell>Earnest Money</TableCell>
                    <TableCell align="right">{formatCurrency(earnestMoney)}</TableCell>
                  </TransactionRow>
                  <TransactionRow>
                    <TableCell>Closing Costs</TableCell>
                    <TableCell align="right">{formatCurrency(closingCosts)}</TableCell>
                  </TransactionRow>
                  <TransactionRow>
                    <TableCell>Less: Seller Credits</TableCell>
                    <TableCell align="right">-{formatCurrency(sellerCredits)}</TableCell>
                  </TransactionRow>
                  <TransactionRow>
                    <TableCell><strong>Total Cash Needed</strong></TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(totalCashNeeded)}</strong>
                    </TableCell>
                  </TransactionRow>
                </TableBody>
              </Table>
            </Collapse>
          </Paper>

          {/* Seller Proceeds */}
          <Paper sx={{ p: 2, borderRadius: 1.5 }} elevation={0}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => toggleSection('seller')}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Seller Proceeds
              </Typography>
              <IconButton size="small">
                {expandedSection === 'seller' ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={expandedSection === 'seller'}>
              <Table size="small" sx={{ mt: 2 }}>
                <TableBody>
                  <TransactionRow>
                    <TableCell>Sale Price</TableCell>
                    <TableCell align="right">{formatCurrency(purchasePrice)}</TableCell>
                  </TransactionRow>
                  <TransactionRow>
                    <TableCell>Less: Commission</TableCell>
                    <TableCell align="right">-{formatCurrency(commissionAmount)}</TableCell>
                  </TransactionRow>
                  <TransactionRow>
                    <TableCell>Less: Seller Credits</TableCell>
                    <TableCell align="right">-{formatCurrency(sellerCredits)}</TableCell>
                  </TransactionRow>
                  <TransactionRow>
                    <TableCell><strong>Net Proceeds</strong></TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(purchasePrice - commissionAmount - sellerCredits)}</strong>
                    </TableCell>
                  </TransactionRow>
                </TableBody>
              </Table>
            </Collapse>
          </Paper>
        </Stack>
      )}

      {viewMode === 'transactions' && (
        <Paper sx={{ p: 2, borderRadius: 1.5 }} elevation={0}>
          <Table>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TransactionRow key={index}>
                  <TableCell>
                    <Typography variant="body2">{transaction.label}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        transaction.type === 'debit' ? 'error.main' :
                        transaction.type === 'credit' ? 'success.main' :
                        'text.primary'
                      }
                    >
                      {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                    </Typography>
                  </TableCell>
                </TransactionRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {purchasePrice === 0 && (
        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
          <AttachMoney sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body1">
            No financial data available
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => onEdit?.('financials')}
          >
            Add Financial Details
          </Button>
        </Box>
      )}
    </WidgetContainer>
  );
};

export default FinancialsWidget;