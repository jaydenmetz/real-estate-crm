import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home,
  AttachMoney,
  CalendarToday,
  TrendingUp,
  Schedule,
  Business,
  AccountBalance,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isValid } from 'date-fns';

const EscrowWidgetMedium = ({ escrow, index = 0, loading = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  if (loading) {
    return <EscrowWidgetMediumSkeleton />;
  }

  // Parse data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const loanAmount = parseFloat(escrow.loanAmount) || 0;
  const earnestMoney = parseFloat(escrow.earnestMoney) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;

  // Calculate days to close
  const closingDate = escrow.scheduledCoeDate || escrow.closingDate;
  let daysToClose = null;
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
    } catch (e) {}
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      if (isValid(d)) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
      }
    } catch (e) {}
    return null;
  };

  // Status config
  const getStatusConfig = (status) => {
    const configs = {
      'Active': { color: 'success', bg: '#4caf50', label: 'Active' },
      'Pending': { color: 'warning', bg: '#ff9800', label: 'Pending' },
      'Closed': { color: 'default', bg: '#9e9e9e', label: 'Closed' },
      'Cancelled': { color: 'error', bg: '#f44336', label: 'Cancelled' },
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(escrow.escrowStatus);

  // Get property image or default
  const propertyImage = escrow.propertyImageUrl || escrow.zillowImageUrl;

  // Parse address for compact display
  const parseAddress = (address) => {
    if (!address) return { street: 'No Address', cityState: '' };
    const parts = address.split(',');
    const street = parts[0]?.trim() || 'No Address';
    const city = parts[1]?.trim() || '';
    const state = parts[2]?.trim() || '';
    return {
      street,
      cityState: city && state ? `${city}, ${state}` : city || state || '',
    };
  };

  const { street, cityState } = parseAddress(escrow.propertyAddress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        onClick={() => navigate(`/escrows/${escrow.id}`)}
        sx={{
          height: 320,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
          display: 'flex',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(statusConfig.bg, 0.2)}`,
            borderColor: alpha(statusConfig.bg, 0.3),
          },
        }}
      >
        {/* Left: Property Image */}
        <Box
          sx={{
            width: 280,
            minWidth: 280,
            position: 'relative',
            background: propertyImage
              ? `url(${propertyImage})`
              : `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.2)} 0%, ${alpha(theme.palette.grey[500], 0.3)} 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!propertyImage && (
            <Home sx={{ fontSize: 96, color: alpha(theme.palette.grey[500], 0.5) }} />
          )}

          {/* Status Chip */}
          <Chip
            label={statusConfig.label}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontWeight: 600,
              fontSize: 11,
              backgroundColor: statusConfig.bg,
              color: 'white',
              '& .MuiChip-label': { px: 1.5 },
            }}
          />

          {/* Progress Badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              backgroundColor: alpha(theme.palette.common.black, 0.75),
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600 }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 700 }}>
              {checklistProgress}%
            </Typography>
          </Box>
        </Box>

        {/* Right: Content */}
        <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
          {/* Address */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.05rem',
              mb: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {street}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.8rem',
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cityState || escrow.clientName || 'No Client'}
          </Typography>

          {/* Top Metrics - 3 columns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 18, color: 'success.main', mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 9 }}>
                Sale Price
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 18, color: 'primary.main', mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 9 }}>
                Close Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {formatDate(closingDate) || 'TBD'}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Schedule
                sx={{
                  fontSize: 18,
                  color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'info.main',
                  mb: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 9 }}>
                Days Left
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'text.primary',
                }}
              >
                {daysToClose !== null ? (isPastDue ? `${Math.abs(daysToClose)} late` : daysToClose) : 'TBD'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Financial Details - 2 columns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                Commission
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {formatCurrency(commission)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                Loan Amount
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {formatCurrency(loanAmount)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                EMD
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {formatCurrency(earnestMoney)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                Down Payment
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {formatCurrency(purchasePrice - loanAmount)}
              </Typography>
            </Box>
          </Box>

          {/* Company Logos - 2 boxes side by side */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              mt: 'auto',
            }}
          >
            <Box
              title={escrow.escrowCompany || 'Escrow Company N/A'}
              sx={{
                height: 36,
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                backgroundColor: escrow.escrowCompany
                  ? alpha(theme.palette.primary.main, 0.04)
                  : alpha(theme.palette.grey[300], 0.3),
                px: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: escrow.escrowCompany
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.grey[300], 0.5),
                },
              }}
            >
              <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: escrow.escrowCompany ? 'text.primary' : 'text.disabled',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {escrow.escrowCompany
                  ? escrow.escrowCompany.split(' ')[0]
                  : 'Escrow'}
              </Typography>
            </Box>

            <Box
              title={escrow.lenderName || 'Lender N/A'}
              sx={{
                height: 36,
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                backgroundColor: escrow.lenderName
                  ? alpha(theme.palette.primary.main, 0.04)
                  : alpha(theme.palette.grey[300], 0.3),
                px: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: escrow.lenderName
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.grey[300], 0.5),
                },
              }}
            >
              <AccountBalance sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: escrow.lenderName ? 'text.primary' : 'text.disabled',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {escrow.lenderName
                  ? escrow.lenderName.split(' ')[0]
                  : 'Lender'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Skeleton loading component
const EscrowWidgetMediumSkeleton = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: 320,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Image skeleton */}
      <Skeleton variant="rectangular" width={280} height={320} animation="wave" />

      {/* Content skeleton */}
      <CardContent sx={{ flex: 1, p: 2.5 }}>
        {/* Address skeleton */}
        <Skeleton variant="text" width="85%" height={26} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="65%" height={20} sx={{ mb: 2 }} />

        {/* Top metrics skeleton - 3 columns */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
          {[...Array(3)].map((_, idx) => (
            <Box key={idx} sx={{ textAlign: 'center' }}>
              <Skeleton variant="circular" width={18} height={18} sx={{ mx: 'auto', mb: 0.5 }} />
              <Skeleton variant="text" width="60%" height={12} sx={{ mx: 'auto', mb: 0.5 }} />
              <Skeleton variant="text" width="80%" height={18} sx={{ mx: 'auto' }} />
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Financial details skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} variant="text" width="100%" height={18} />
          ))}
        </Box>

        {/* Company logos skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 'auto' }}>
          {[...Array(2)].map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EscrowWidgetMedium;
