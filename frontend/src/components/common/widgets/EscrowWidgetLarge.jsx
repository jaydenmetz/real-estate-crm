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
  Schedule,
  Business,
  AccountBalance,
  Description,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isValid } from 'date-fns';

const EscrowWidgetLarge = ({ escrow, index = 0, loading = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  if (loading) {
    return <EscrowWidgetLargeSkeleton />;
  }

  // Parse data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const loanAmount = parseFloat(escrow.loanAmount) || 0;
  const earnestMoney = parseFloat(escrow.earnestMoney) || 0;
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

  // Format currency
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      if (isValid(d)) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  // Parse address for full display
  const parseAddress = (address) => {
    if (!address) return { street: 'No Address', cityStateZip: '' };
    const parts = address.split(',');
    const street = parts[0]?.trim() || 'No Address';
    const city = parts[1]?.trim() || '';
    const stateZip = parts[2]?.trim() || '';
    return {
      street,
      cityStateZip: city && stateZip ? `${city}, ${stateZip}` : city || stateZip || '',
    };
  };

  const { street, cityStateZip } = parseAddress(escrow.propertyAddress);

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
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px ${alpha(statusConfig.bg, 0.15)}`,
            borderColor: alpha(statusConfig.bg, 0.3),
          },
        }}
      >
        {/* Left: Property Image */}
        <Box
          sx={{
            width: 360,
            minWidth: 360,
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
            <Home sx={{ fontSize: 120, color: alpha(theme.palette.grey[500], 0.5) }} />
          )}

          {/* Status Chip */}
          <Chip
            label={statusConfig.label}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              fontWeight: 600,
              fontSize: 12,
              backgroundColor: statusConfig.bg,
              color: 'white',
              '& .MuiChip-label': { px: 2 },
            }}
          />

          {/* Progress Bar */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              backgroundColor: alpha(theme.palette.common.black, 0.8),
              borderRadius: 1.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: 40,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                width: `${checklistProgress}%`,
                transition: 'width 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                px: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: 11 }}>
                {checklistProgress}% Complete
              </Typography>
            </Box>
            {checklistProgress < 100 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 16,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: 10 }}>
                  {checklistProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right: Content */}
        <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: '1.15rem',
                mb: 0.5,
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
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {cityStateZip}
            </Typography>
          </Box>

          {/* Key Metrics - 4 columns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2.5 }}>
            <Box sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 20, color: 'success.main', mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 9 }}>
                Sale Price
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {formatCurrency(purchasePrice)}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 20, color: 'secondary.main', mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 9 }}>
                Commission
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {formatCurrency(commission)}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 20, color: 'primary.main', mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 9 }}>
                Close Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {formatDate(closingDate) || 'TBD'}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Schedule
                sx={{
                  fontSize: 20,
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
                  fontSize: '0.95rem',
                  color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'text.primary',
                }}
              >
                {daysToClose !== null ? (isPastDue ? `${Math.abs(daysToClose)} late` : daysToClose) : 'TBD'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Financial Details Grid - 3 columns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block', mb: 0.5 }}>
                Loan Amount
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {formatCurrency(loanAmount)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block', mb: 0.5 }}>
                Down Payment
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {formatCurrency(downPayment)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block', mb: 0.5 }}>
                EMD
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {formatCurrency(earnestMoney)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block', mb: 0.5 }}>
                Client
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {escrow.clientName || 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block', mb: 0.5 }}>
                Escrow #
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {escrow.escrowNumber || escrow.displayId || 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9, display: 'block', mb: 0.5 }}>
                Open Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {formatDate(escrow.acceptanceDate) || 'N/A'}
              </Typography>
            </Box>
          </Box>

          {/* Company Bar - Full width horizontal */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              mt: 'auto',
              p: 1.5,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {[
              { icon: Business, name: escrow.escrowCompany, label: 'Escrow' },
              { icon: AccountBalance, name: escrow.lenderName, label: 'Lender' },
              { icon: Description, name: escrow.titleCompany, label: 'Title' },
              { icon: Business, name: escrow.nhdCompany, label: 'NHD' },
            ].map((company, idx) => (
              <Box
                key={idx}
                title={company.name || `${company.label} N/A`}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  backgroundColor: company.name
                    ? alpha(theme.palette.background.paper, 0.8)
                    : alpha(theme.palette.grey[300], 0.3),
                  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: company.name
                      ? theme.palette.background.paper
                      : alpha(theme.palette.grey[300], 0.5),
                  },
                }}
              >
                <company.icon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 8,
                      fontWeight: 600,
                      color: 'text.secondary',
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {company.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: company.name ? 'text.primary' : 'text.disabled',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {company.name ? company.name.split(' ').slice(0, 2).join(' ') : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Skeleton loading component
const EscrowWidgetLargeSkeleton = () => {
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
      <Skeleton variant="rectangular" width={360} height={320} animation="wave" />

      {/* Content skeleton */}
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Header skeleton */}
        <Skeleton variant="text" width="90%" height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" height={22} sx={{ mb: 2 }} />

        {/* Metrics skeleton - 4 columns */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2.5 }}>
          {[...Array(4)].map((_, idx) => (
            <Box key={idx} sx={{ textAlign: 'center' }}>
              <Skeleton variant="circular" width={20} height={20} sx={{ mx: 'auto', mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={12} sx={{ mx: 'auto', mb: 0.5 }} />
              <Skeleton variant="text" width="85%" height={20} sx={{ mx: 'auto' }} />
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Financial grid skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2.5 }}>
          {[...Array(6)].map((_, idx) => (
            <Box key={idx}>
              <Skeleton variant="text" width="60%" height={12} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="80%" height={18} />
            </Box>
          ))}
        </Box>

        {/* Company bar skeleton */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[...Array(4)].map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" sx={{ flex: 1, height: 48, borderRadius: 1 }} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EscrowWidgetLarge;
