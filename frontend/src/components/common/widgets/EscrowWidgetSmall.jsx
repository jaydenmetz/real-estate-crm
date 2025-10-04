import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home,
  CalendarToday,
  AttachMoney,
  Timer,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isValid } from 'date-fns';

const EscrowWidgetSmall = ({ escrow, index = 0 }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Parse data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
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
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          height: 280,
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
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
          {/* Header: Icon + Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <Home sx={{ fontSize: 28, color: 'primary.main' }} />
            </Box>
            <Chip
              label={escrow.escrowStatus}
              size="small"
              color={statusConfig.color}
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          </Box>

          {/* Title + Subtitle */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'text.primary',
            }}
          >
            {escrow.propertyAddress || 'No Address'}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
            }}
          >
            {escrow.clientName || 'No Client'}
          </Typography>

          {/* Stats Row */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: 10 }}>
                Price
              </Typography>
              <Tooltip title={`$${purchasePrice.toLocaleString()}`}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  {formatCurrency(purchasePrice)}
                </Typography>
              </Tooltip>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: 10 }}>
                Close
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {formatDate(closingDate)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: 10 }}>
                Days
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
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                Progress
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10 }}>
                {checklistProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={checklistProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
                },
              }}
            />
          </Box>

          {/* Company Logos - 4 boxes in single row (1x4) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0.75,
              mb: 2,
            }}
          >
            {[
              { name: escrow.escrowCompany, icon: '🏦', label: 'Escrow' },
              { name: escrow.lenderName, icon: '💰', label: 'Lender' },
              { name: escrow.titleCompany, icon: '📋', label: 'Title' },
              { name: escrow.nhdCompany, icon: '🏘️', label: 'NHD' },
            ].map((company, idx) => (
              <Tooltip key={idx} title={company.name || 'N/A'} arrow>
                <Box
                  sx={{
                    height: 32,
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    px: 0.5,
                  }}
                >
                  <span style={{ marginRight: 4 }}>{company.icon}</span>
                  <Typography variant="caption" sx={{ fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {company.name ? company.name.split(' ')[0] : company.label}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/escrows/${escrow.id}`);
              }}
              sx={{
                flex: 1,
                py: 0.75,
                px: 1.5,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                border: `1px solid ${theme.palette.primary.main}`,
                color: 'primary.main',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Visibility sx={{ fontSize: 14 }} />
              View
            </Box>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/escrows/${escrow.id}/edit`);
              }}
              sx={{
                flex: 1,
                py: 0.75,
                px: 1.5,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                border: `1px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  color: 'text.primary',
                  backgroundColor: alpha(theme.palette.text.primary, 0.05),
                },
              }}
            >
              <Edit sx={{ fontSize: 14 }} />
              Edit
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EscrowWidgetSmall;
