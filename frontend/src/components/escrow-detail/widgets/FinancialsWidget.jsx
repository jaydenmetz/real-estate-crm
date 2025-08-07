import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Collapse,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BankIcon,
  ShowChart as ChartIcon,
  ExpandMore as ExpandMoreIcon,
  PieChart as PieChartIcon,
  Receipt as ReceiptIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Styled components
const WidgetCard = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
  }
}));

const StatCard = styled(Paper)(({ theme, gradient }) => ({
  padding: theme.spacing(2),
  background: gradient || 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1.5),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  }
}));

const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  React.useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>
      {prefix}{displayValue.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </span>
  );
};

const FloatingIcon = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  opacity: 0.1,
  pointerEvents: 'none',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.spacing(1),
  backdropFilter: 'blur(5px)',
  marginTop: theme.spacing(2),
}));

function FinancialsWidget({ data, expanded, onExpand, onUpdate }) {
  const [activeChart, setActiveChart] = useState('pie');
  
  if (!data) return null;

  // Calculate key metrics
  const purchasePrice = data.purchasePrice || 0;
  const earnestMoney = data.earnestMoneyDeposit || 0;
  const downPayment = data.downPayment || 0;
  const loanAmount = data.loanAmount || 0;
  const commission = data.myCommission || data.agentSplit || 0;
  const grossCommission = data.grossCommission || 0;
  const netCommission = data.netCommission || commission;
  const fees = data.franchiseFees || 0;
  const transactionFee = data.transactionFee || 0;
  
  // Pie chart data for commission breakdown
  const commissionData = [
    { name: 'Agent Split', value: commission, color: '#00ff88' },
    { name: 'Franchise Fees', value: fees, color: '#ff6b6b' },
    { name: 'Transaction Fee', value: transactionFee, color: '#4ecdc4' },
    { name: 'TC Fee', value: data.tcFee || 0, color: '#45b7d1' },
    { name: 'Other', value: Math.max(0, grossCommission - commission - fees - transactionFee - (data.tcFee || 0)), color: '#96ceb4' }
  ].filter(item => item.value > 0);

  // Bar chart data for purchase breakdown
  const purchaseData = [
    { name: 'Purchase Price', value: purchasePrice, color: '#667eea' },
    { name: 'Earnest Money', value: earnestMoney, color: '#764ba2' },
    { name: 'Down Payment', value: downPayment, color: '#f093fb' },
    { name: 'Loan Amount', value: loanAmount, color: '#f5576c' }
  ].filter(item => item.value > 0);

  // Calculate percentages
  const commissionRate = purchasePrice > 0 ? (grossCommission / purchasePrice * 100) : 0;
  const downPaymentPercent = purchasePrice > 0 ? (downPayment / purchasePrice * 100) : 0;
  const loanToValue = purchasePrice > 0 ? (loanAmount / purchasePrice * 100) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <Box sx={{ 
          bgcolor: 'rgba(0, 0, 0, 0.8)', 
          p: 1, 
          borderRadius: 1,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Typography variant="caption" color="white">
            {payload[0].name}: ${payload[0].value.toLocaleString()}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <WidgetCard
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Floating Background Icons */}
      <FloatingIcon
        animate={{
          y: [-20, 20],
          x: [-10, 10],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{ top: 20, right: 20 }}
      >
        <MoneyIcon sx={{ fontSize: 80 }} />
      </FloatingIcon>
      
      <FloatingIcon
        animate={{
          y: [20, -20],
          x: [10, -10],
          rotate: [360, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{ bottom: 20, left: 20 }}
      >
        <ChartIcon sx={{ fontSize: 60 }} />
      </FloatingIcon>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Financials
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            <AnimatedNumber value={purchasePrice} prefix="$" />
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Purchase Price
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            sx={{ 
              color: 'white',
              bgcolor: activeChart === 'pie' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveChart('pie');
            }}
          >
            <PieChartIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ 
              color: 'white',
              bgcolor: activeChart === 'bar' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveChart('bar');
            }}
          >
            <ChartIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics Grid */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <StatCard gradient="linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)">
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  <AnimatedNumber value={commission} prefix="$" />
                </Typography>
                <Typography variant="caption">My Commission</Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={commissionRate}
              sx={{ 
                mt: 1,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white',
                }
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {commissionRate.toFixed(2)}% of sale
            </Typography>
          </StatCard>
        </Grid>
        
        <Grid item xs={6}>
          <StatCard gradient="linear-gradient(135deg, #ffd700 0%, #ffb700 100%)">
            <Box display="flex" alignItems="center" gap={1}>
              <BankIcon />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  <AnimatedNumber value={loanAmount} prefix="$" />
                </Typography>
                <Typography variant="caption">Loan Amount</Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={loanToValue}
              sx={{ 
                mt: 1,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'white',
                }
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {loanToValue.toFixed(0)}% LTV
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      {/* Interactive Charts */}
      <AnimatePresence mode="wait">
        {activeChart === 'pie' && commissionData.length > 0 && (
          <motion.div
            key="pie"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <ChartContainer>
              <Typography variant="subtitle2" gutterBottom>
                Commission Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={commissionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {commissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </motion.div>
        )}
        
        {activeChart === 'bar' && purchaseData.length > 0 && (
          <motion.div
            key="bar"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <ChartContainer>
              <Typography variant="subtitle2" gutterBottom>
                Financial Overview
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={purchaseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" tick={{ fill: 'white', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'white', fontSize: 10 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" animationDuration={800}>
                    {purchaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Additional Stats */}
      <Collapse in={expanded}>
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Detailed Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <StatCard>
                <Typography variant="caption">Earnest Money</Typography>
                <Typography variant="h6">
                  <AnimatedNumber value={earnestMoney} prefix="$" />
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6}>
              <StatCard>
                <Typography variant="caption">Down Payment</Typography>
                <Typography variant="h6">
                  <AnimatedNumber value={downPayment} prefix="$" />
                </Typography>
                <Chip
                  label={`${downPaymentPercent.toFixed(0)}%`}
                  size="small"
                  sx={{ mt: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }}
                />
              </StatCard>
            </Grid>
            <Grid item xs={6}>
              <StatCard>
                <Typography variant="caption">Gross Commission</Typography>
                <Typography variant="h6">
                  <AnimatedNumber value={grossCommission} prefix="$" />
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6}>
              <StatCard>
                <Typography variant="caption">Net Commission</Typography>
                <Typography variant="h6">
                  <AnimatedNumber value={netCommission} prefix="$" />
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {/* Expand Indicator */}
      <Box display="flex" justifyContent="center" mt={2}>
        <IconButton
          size="small"
          sx={{ 
            color: 'white', 
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.3s' 
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
    </WidgetCard>
  );
}

export default FinancialsWidget;