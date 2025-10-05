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
} from '@mui/material';
import { Home } from '@mui/icons-material';
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
  const earnestMoney = parseFloat(escrow.earnestMoneyDeposit) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;
  const downPayment = purchasePrice - loanAmount;

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

  // Format currency - BOLD numbers, no decimals for K/M
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
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
  const propertyImage = escrow.propertyImageUrl || escrow.zillowImageUrl;

  // Full address
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
          height: 320,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: statusConfig.glow,
            '& .overlay-gradient': {
              opacity: 0.15,
            },
          },
        }}
      >
        {/* STATUS ACCENT BAR - Left edge, full height */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: statusConfig.bg,
            zIndex: 2,
          }}
        />

        {/* ANIMATED OVERLAY GRADIENT on hover */}
        <Box
          className="overlay-gradient"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: statusConfig.bg,
            opacity: 0,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* LEFT: Property Image - 280px wide */}
        <Box
          sx={{
            width: 280,
            minWidth: 280,
            height: 320,
            position: 'relative',
            background: propertyImage
              ? `url(${propertyImage})`
              : statusConfig.bg,
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
              height: '40%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            },
          }}
        >
          {!propertyImage && (
            <Home sx={{ fontSize: 100, color: 'rgba(255,255,255,0.9)' }} />
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
              height: 8,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${checklistProgress}%`,
                background: statusConfig.bg,
                transition: 'width 0.5s ease-in-out',
                boxShadow: `0 0 12px ${alpha(statusConfig.color, 0.7)}`,
              }}
            />
          </Box>

          {/* Progress percentage - FLOATING bottom left */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              fontSize: 14,
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              zIndex: 3,
            }}
          >
            {checklistProgress}%
          </Typography>
        </Box>

        {/* RIGHT: Content */}
        <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          {/* Address - FULL ADDRESS */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              lineHeight: 1.3,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: theme.palette.text.primary,
            }}
          >
            {address}
          </Typography>

          {/* TOP ROW: 3 Key Metrics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2 }}>
            {/* Price */}
            <Box
              sx={{
                p: 1.5,
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
              <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#059669', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Price
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1rem', color: '#10b981', letterSpacing: '-0.5px' }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>

            {/* Commission */}
            <Box
              sx={{
                p: 1.5,
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
              <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#4f46e5', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Commission
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1rem', color: '#6366f1', letterSpacing: '-0.5px' }}>
                {formatCurrency(commission)}
              </Typography>
            </Box>

            {/* Days Badge */}
            {daysToClose !== null ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: isPastDue
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)'
                    : isUrgent
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.15) 100%)',
                  border: `1px solid ${isPastDue ? alpha('#ef4444', 0.2) : isUrgent ? alpha('#f59e0b', 0.2) : alpha('#3b82f6', 0.2)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: isPastDue ? '#dc2626' : isUrgent ? '#d97706' : '#2563eb', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Days
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1rem', color: isPastDue ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6', letterSpacing: '-0.5px' }}>
                  {isPastDue ? `${Math.abs(daysToClose)} late` : daysToClose}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.grey[200], 0.5) }}>
                <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>Days</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary' }}>TBD</Typography>
              </Box>
            )}
          </Box>

          {/* FINANCIAL DETAILS: 2x2 Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Loan Amount
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                {formatCurrency(loanAmount)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Down Payment
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                {formatCurrency(downPayment)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                EMD
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                {formatCurrency(earnestMoney)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Close Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                {formatDate(closingDate) || 'TBD'}
              </Typography>
            </Box>
          </Box>

          {/* FOOTER: Companies */}
          <Box
            sx={{
              mt: 'auto',
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Escrow
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {escrow.escrowCompany || 'TBD'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Lender
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {escrow.lenderName || 'TBD'}
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
        border: 'none',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Image skeleton */}
      <Skeleton variant="rectangular" width={280} height={320} animation="wave" />

      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Address skeleton */}
        <Skeleton variant="text" width="90%" height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" height={28} sx={{ mb: 2 }} />

        {/* Top metrics skeleton - 3 boxes */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2 }}>
          {[...Array(3)].map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Box>

        {/* Financial grid skeleton - 2x2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          {[...Array(4)].map((_, idx) => (
            <Box key={idx}>
              <Skeleton variant="text" width="60%" height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          ))}
        </Box>

        {/* Footer skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 'auto', pt: 2 }}>
          {[...Array(2)].map((_, idx) => (
            <Box key={idx}>
              <Skeleton variant="text" width="40%" height={12} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={18} />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EscrowWidgetMedium;
