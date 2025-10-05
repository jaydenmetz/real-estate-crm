import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import { Home, CheckCircle, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isValid } from 'date-fns';

const EscrowWidgetSmall = ({ escrow, index = 0, loading = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  if (loading) {
    return <EscrowWidgetSmallSkeleton />;
  }

  // Parse data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
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

  // Format currency - exact number (no K/M)
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  // Format currency compact (for hero totals with K/M)
  const formatCurrencyCompact = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${value.toLocaleString()}`;
  };

  // Mask commission for privacy
  const maskCommission = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 100000) return '$***,***';      // $100,000+
    if (absValue >= 10000) return '$**,***';        // $10,000-99,999
    if (absValue >= 1000) return '$*,***';          // $1,000-9,999
    if (absValue >= 100) return '$***';             // $100-999
    if (absValue >= 10) return '$**';               // $10-99
    return '$*';                                     // $0-9
  };

  // Format date - Short and sweet
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      if (isValid(d)) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (e) {}
    return null;
  };

  // Status config with VIBRANT colors
  const getStatusConfig = (status) => {
    const configs = {
      'Active': {
        color: '#10b981',
        bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        label: 'Active',
        glow: '0 8px 32px rgba(16, 185, 129, 0.25)'
      },
      'Pending': {
        color: '#f59e0b',
        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        label: 'Pending',
        glow: '0 8px 32px rgba(245, 158, 11, 0.25)'
      },
      'Closed': {
        color: '#6366f1',
        bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        label: 'Closed',
        glow: '0 8px 32px rgba(99, 102, 241, 0.25)'
      },
      'Cancelled': {
        color: '#ef4444',
        bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        label: 'Cancelled',
        glow: '0 8px 32px rgba(239, 68, 68, 0.25)'
      },
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(escrow.escrowStatus);

  // Get property image or default
  const propertyImage = escrow.propertyImage || escrow.zillowUrl;

  // Parse address - FULL ADDRESS on card
  const address = escrow.propertyAddress || 'No Address';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        onClick={() => navigate(`/escrows/${escrow.id}`)}
        sx={{
          height: 400,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: statusConfig.glow,
          },
        }}
      >
        {/* Property Image - Optimized for MLS 3:2 ratio */}
        <Box
          sx={{
            height: 213,
            position: 'relative',
            background: propertyImage
              ? `url(${propertyImage})`
              : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
            },
          }}
        >
          {!propertyImage && (
            <Home sx={{ fontSize: 80, color: alpha('#757575', 0.5) }} />
          )}

          {/* Status Chip - FLOATING top right */}
          <Chip
            label={statusConfig.label}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              background: statusConfig.bg,
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              zIndex: 3,
              '& .MuiChip-label': { px: 1.5, py: 0.5 },
            }}
          />

          {/* Progress Bar - BOTTOM overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 6,
              backgroundColor: 'rgba(0,0,0,0.3)',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${checklistProgress}%`,
                background: statusConfig.bg,
                transition: 'width 0.5s ease-in-out',
                boxShadow: `0 0 10px ${alpha(statusConfig.color, 0.6)}`,
              }}
            />
          </Box>

          {/* Progress percentage - FLOATING bottom left */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              fontSize: 13,
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              zIndex: 3,
            }}
          >
            {checklistProgress}%
          </Typography>
        </Box>

        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Address - FULL ADDRESS, larger text */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              lineHeight: 1.3,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: theme.palette.text.primary,
            }}
          >
            {address}
          </Typography>

          {/* KEY METRICS - 2 LARGE boxes */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
            {/* Price */}
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
                border: `1px solid ${alpha('#10b981', 0.15)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.16) 100%)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#059669', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Price
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#10b981', letterSpacing: '-0.5px' }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>

            {/* Commission */}
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
                border: `1px solid ${alpha('#6366f1', 0.15)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.16) 100%)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#4f46e5', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Commission
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#6366f1', letterSpacing: '-0.5px' }}>
                {maskCommission(commission)}
              </Typography>
            </Box>
          </Box>

          {/* FOOTER - Close date and days */}
          <Box
            sx={{
              mt: 'auto',
              pt: 1,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                Closes
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>
                {formatDate(closingDate) || 'TBD'}
              </Typography>
            </Box>

            {/* Status Badge Logic */}
            {escrow.escrowStatus === 'Closed' ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.15) 100%)',
                  border: `1px solid ${alpha('#10b981', 0.2)}`,
                }}
              >
                <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10b981' }}>
                  Closed
                </Typography>
              </Box>
            ) : escrow.escrowStatus === 'Cancelled' ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)',
                  border: `1px solid ${alpha('#ef4444', 0.2)}`,
                }}
              >
                <Cancel sx={{ fontSize: 18, color: '#ef4444' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#ef4444' }}>
                  Cancelled
                </Typography>
              </Box>
            ) : daysToClose !== null ? (
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: isPastDue
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)'
                    : isUrgent
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.15) 100%)',
                  border: `1px solid ${isPastDue ? alpha('#ef4444', 0.2) : isUrgent ? alpha('#f59e0b', 0.2) : alpha('#3b82f6', 0.2)}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: isPastDue ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6',
                  }}
                >
                  {isPastDue ? `${Math.abs(daysToClose)}d late` : `${daysToClose}d`}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Skeleton loading component
const EscrowWidgetSmallSkeleton = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: 400,
        border: 'none',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image skeleton */}
      <Skeleton variant="rectangular" height={213} animation="wave" />

      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Address skeleton */}
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />

        {/* Metrics skeleton - 2 large boxes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
          {[...Array(2)].map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" height={50} sx={{ borderRadius: 2 }} />
          ))}
        </Box>

        {/* Footer skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
          <Skeleton variant="text" width="30%" height={36} />
          <Skeleton variant="rectangular" width="25%" height={36} sx={{ borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default EscrowWidgetSmall;
