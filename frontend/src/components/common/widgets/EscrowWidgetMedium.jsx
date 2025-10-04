import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home,
  CalendarToday,
  AttachMoney,
  AccountBalance,
  Description,
  Business,
  Person,
  Schedule,
  Visibility,
  Edit,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isValid } from 'date-fns';

const EscrowWidgetMedium = ({ escrow, index = 0 }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Parse data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const loanAmount = parseFloat(escrow.loanAmount) || 0;
  const earnestMoney = parseFloat(escrow.earnestMoney) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;

  // Calculate days to close
  const closingDate = escrow.scheduledCoeDate || escrow.closingDate;
  let daysToClose = 'N/A';
  let isUrgent = false;
  let isPastDue = false;

  if (closingDate) {
    try {
      const closeDate = new Date(closingDate);
      if (isValid(closeDate)) {
        const days = differenceInDays(closeDate, new Date());
        daysToClose = days;
        isUrgent = days <= 7 && days > 0;
        isPastDue = days < 0;
      }
    } catch (e) {
      daysToClose = escrow.daysToClose || 'N/A';
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isValid(d)) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {}
    return 'N/A';
  };

  // Status config
  const getStatusConfig = (status) => {
    const configs = {
      'Active': { color: 'success', bg: '#4caf50' },
      'Pending': { color: 'warning', bg: '#ff9800' },
      'Closed': { color: 'default', bg: '#9e9e9e' },
      'Cancelled': { color: 'error', bg: '#f44336' },
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(escrow.escrowStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        onClick={() => navigate(`/escrows/${escrow.id}`)}
        sx={{
          minHeight: 380,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(statusConfig.bg, 0.2)}`,
            borderColor: alpha(statusConfig.bg, 0.3),
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <Home sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.1rem' }}>
                {escrow.propertyAddress || 'No Address'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {escrow.clientName || 'No Client'}
              </Typography>
            </Box>
            <Chip
              label={escrow.escrowStatus}
              size="small"
              color={statusConfig.color}
              sx={{ fontWeight: 600, mt: 0.5 }}
            />
          </Box>

          {/* Stats Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
                Sale Price
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                <CalendarToday sx={{ fontSize: 18, color: 'primary.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
                Close Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatDate(closingDate).split(',')[0]}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                <Schedule sx={{ fontSize: 18, color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'info.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
                Days Left
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'text.primary',
                }}
              >
                {daysToClose !== 'N/A' ? daysToClose : 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                <AttachMoney sx={{ fontSize: 18, color: 'secondary.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 10 }}>
                Commission
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatCurrency(commission)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Detail Rows */}
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Open Date
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDate(escrow.acceptanceDate)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Escrow Company
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {escrow.escrowCompany || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Loan Amount
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(loanAmount)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Earnest Money
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ${earnestMoney.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Escrow #
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {escrow.escrowNumber || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Assigned Agent
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {escrow.assignedAgent || 'Unassigned'}
              </Typography>
            </Box>
          </Stack>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Transaction Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {checklistProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={checklistProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
                },
              }}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/escrows/${escrow.id}`);
              }}
              sx={{
                flex: 1,
                py: 1,
                px: 2,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Visibility sx={{ fontSize: 18 }} />
              View Details
            </Box>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/escrows/${escrow.id}/edit`);
              }}
              sx={{
                flex: 1,
                py: 1,
                px: 2,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                border: `1px solid ${theme.palette.primary.main}`,
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Edit sx={{ fontSize: 18 }} />
              Edit
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EscrowWidgetMedium;
