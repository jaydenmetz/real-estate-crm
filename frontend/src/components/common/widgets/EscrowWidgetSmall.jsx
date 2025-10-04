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
import {
  Home,
  AttachMoney,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material';
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
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    if (!address) return { street: 'No Address', city: '' };
    const parts = address.split(',');
    return {
      street: parts[0]?.trim() || 'No Address',
      city: parts[1]?.trim() || '',
    };
  };

  const { street, city } = parseAddress(escrow.propertyAddress);

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
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(statusConfig.bg, 0.2)}`,
            borderColor: alpha(statusConfig.bg, 0.3),
          },
        }}
      >
        {/* Property Image */}
        <Box
          sx={{
            height: 140,
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
            <Home sx={{ fontSize: 64, color: alpha(theme.palette.grey[500], 0.5) }} />
          )}

          {/* Status Chip */}
          <Chip
            label={statusConfig.label}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
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
              bottom: 10,
              left: 10,
              backgroundColor: alpha(theme.palette.common.black, 0.7),
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {checklistProgress}% Complete
          </Box>
        </Box>

        <CardContent sx={{ p: 2, height: 'calc(100% - 140px)', display: 'flex', flexDirection: 'column' }}>
          {/* Address */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
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
              fontSize: '0.75rem',
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {city || escrow.clientName || 'No Client'}
          </Typography>

          {/* Key Metrics - 2 rows x 2 columns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <AttachMoney sx={{ fontSize: 12, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  Price
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <CalendarToday sx={{ fontSize: 12, color: 'primary.main' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  Close
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatDate(closingDate) || 'TBD'}
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <TrendingUp sx={{ fontSize: 12, color: 'secondary.main' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  Commission
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatCurrency(commission)}
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <CalendarToday sx={{ fontSize: 12, color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'info.main' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                  Days
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'text.primary',
                }}
              >
                {daysToClose !== null ? (isPastDue ? `${Math.abs(daysToClose)} late` : daysToClose) : 'TBD'}
              </Typography>
            </Box>
          </Box>

          {/* Company Logos - 4 boxes */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0.5,
              mt: 'auto',
            }}
          >
            {[
              { name: escrow.escrowCompany, label: 'ESC' },
              { name: escrow.lenderName, label: 'LDR' },
              { name: escrow.titleCompany, label: 'TTL' },
              { name: escrow.nhdCompany, label: 'NHD' },
            ].map((company, idx) => (
              <Box
                key={idx}
                title={company.name || 'N/A'}
                sx={{
                  height: 28,
                  borderRadius: 0.75,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: company.name ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.grey[300], 0.3),
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: company.name ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.grey[300], 0.5),
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: company.name ? 'text.primary' : 'text.disabled',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    px: 0.5,
                  }}
                >
                  {company.label}
                </Typography>
              </Box>
            ))}
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
        height: 320,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
      }}
    >
      {/* Image skeleton */}
      <Skeleton variant="rectangular" height={140} animation="wave" />

      <CardContent sx={{ p: 2 }}>
        {/* Address skeleton */}
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={18} sx={{ mb: 2 }} />

        {/* Metrics skeleton - 2x2 grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
          {[...Array(4)].map((_, idx) => (
            <Box key={idx}>
              <Skeleton variant="text" width="50%" height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={20} />
            </Box>
          ))}
        </Box>

        {/* Company logos skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" height={28} sx={{ borderRadius: 0.75 }} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EscrowWidgetSmall;
