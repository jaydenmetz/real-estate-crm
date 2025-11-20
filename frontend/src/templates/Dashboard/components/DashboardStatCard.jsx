import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  VisibilityOff,
  Home,
  People,
  AttachMoney,
  CheckCircle,
  Schedule,
  PersonAdd,
  Cancel,
  Pending,
  Paid,
  EventAvailable,
  MonetizationOn,
  EventBusy,
  MoneyOff,
  Dashboard,
  CalendarMonth,
  AccountBalance,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

// Map icon strings to MUI icon components
const iconMap = {
  'Home': Home,
  'People': People,
  'AttachMoney': AttachMoney,
  'CheckCircle': CheckCircle,
  'Schedule': Schedule,
  'PersonAdd': PersonAdd,
  'TrendingUp': TrendingUp,
  'TrendingDown': TrendingDown,
  'Cancel': Cancel,
  'Pending': Pending,
  'Paid': Paid,
  'EventAvailable': EventAvailable,
  'MonetizationOn': MonetizationOn,
  'EventBusy': EventBusy,
  'MoneyOff': MoneyOff,
  'Dashboard': Dashboard,
  'CalendarMonth': CalendarMonth,
  'AccountBalance': AccountBalance,
  'AccountBalanceWallet': AccountBalanceWallet,
};

/**
 * DashboardStatCard - Reusable stat card matching ClientStatCard exactly
 *
 * Features:
 * - CountUp animations
 * - Goal progress tracking
 * - Trend indicators (up/down)
 * - Optional privacy toggle
 * - framer-motion animations
 * - Responsive typography
 */
const DashboardStatCard = ({
  icon,
  title,
  value,
  prefix = '',
  suffix = '',
  color = '#ffffff',
  backgroundColor = null, // Solid background color (overrides gradient if provided)
  textColor = null, // Text color (white or black)
  valueColor = null, // Color for the value text (green/red for semantic meaning)
  delay = 0,
  trend,
  showPrivacy = false,
  goal
}) => {
  const theme = useTheme();
  const [showValue, setShowValue] = useState(false);

  // Resolve icon - can be string or component
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;

  // Mask value for privacy
  const maskValue = (val) => {
    const absValue = Math.abs(val);
    if (absValue >= 1000000) return '$***,***,***';
    if (absValue >= 100000) return '$***,***';
    if (absValue >= 10000) return '$**,***';
    if (absValue >= 1000) return '$*,***';
    if (absValue >= 100) return '$***';
    if (absValue >= 10) return '$**';
    return '$*';
  };

  // Calculate percentage difference from goal
  const percentageToGoal = goal && typeof value === 'number' && typeof goal === 'number'
    ? ((value / goal - 1) * 100).toFixed(1)
    : null;
  const isAboveGoal = percentageToGoal && parseFloat(percentageToGoal) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.34, 1.56, 0.64, 1]
      }}
    >
      <Card
        elevation={0}
        sx={{
          height: 200, // Fixed height for consistency
          position: 'relative',
          overflow: 'hidden',
          background: backgroundColor || `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
          backdropFilter: backgroundColor ? 'none' : 'blur(10px)',
          border: backgroundColor ? `1px solid ${alpha(backgroundColor, 0.5)}` : `1px solid ${alpha(color, 0.3)}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: backgroundColor ? `0 20px 40px ${alpha(backgroundColor, 0.4)}` : `0 20px 40px ${alpha(color, 0.25)}`,
            border: backgroundColor ? `1px solid ${alpha(backgroundColor, 0.7)}` : `1px solid ${alpha(color, 0.5)}`,
          },
        }}
      >
        <CardContent sx={{
          position: 'relative',
          zIndex: 1,
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between'
        }}>
          {/* Top: Title with enhanced styling */}
          <Box sx={{ mb: 2, minHeight: 40, display: 'flex', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  fontSize: '0.8125rem',
                  color: textColor || 'rgba(255, 255, 255, 0.95)',
                  background: textColor === '#000' ? 'linear-gradient(135deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  px: 2,
                  py: 0.75,
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: textColor === '#000' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          {/* Middle: CSS Grid layout for precise control */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: showPrivacy ? '32px 1fr 52px' : '1fr 52px',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2, md: 1.5, lg: 2 },
            flex: 1,
            my: 1,
            px: { xs: 1, sm: 0.5, md: 0.75, lg: 1 },
          }}>
            {/* Privacy toggle - fixed column */}
            {showPrivacy && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowValue(!showValue);
                }}
                sx={{
                  width: 28,
                  height: 28,
                  color: 'rgba(255,255,255,0.8)',
                  justifySelf: 'start',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                  },
                }}
              >
                {showValue ? (
                  <VisibilityOff sx={{ fontSize: 18 }} />
                ) : (
                  <Visibility sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            )}

            {/* Value - fills grid column, centered within */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: valueColor || textColor || 'white',
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 0.2,
                  flexShrink: 1,
                  // Breakpoint-aware font scaling for optimal display at all viewport sizes
                  fontSize: (() => {
                    const valueStr = String(value || '').replace(/,/g, '');
                    const numDigits = valueStr.length;
                    const estimatedCommas = Math.max(0, Math.floor((numDigits - 1) / 3));
                    const displayLength = prefix.length + numDigits + estimatedCommas + suffix.length;

                    // Different sizing strategy per breakpoint:
                    // xs (mobile, <600px): 1 column, large cards - use larger sizes
                    // sm (tablet, 600-900px): 2 columns - moderate sizes
                    // md (small desktop, 900-1200px): 2 columns - tighter sizing
                    // lg+ (large desktop, >1200px): 4 columns - use clamp for flexibility

                    if (displayLength >= 12) {
                      return { xs: '2rem', sm: '1.5rem', md: '1.2rem', lg: '1.35rem', xl: '1.5rem' };
                    }
                    if (displayLength >= 11) {
                      return { xs: '2.2rem', sm: '1.7rem', md: '1.35rem', lg: '1.5rem', xl: '1.7rem' };
                    }
                    if (displayLength >= 10) {
                      return { xs: '2.4rem', sm: '1.9rem', md: '1.5rem', lg: '1.65rem', xl: '1.9rem' };
                    }
                    if (displayLength >= 9) {
                      return { xs: '2.6rem', sm: '2.1rem', md: '1.65rem', lg: '1.85rem', xl: '2.1rem' };
                    }
                    if (displayLength >= 8) {
                      return { xs: '2.8rem', sm: '2.3rem', md: '1.8rem', lg: '2rem', xl: '2.3rem' };
                    }
                    // ≤7 chars: largest
                    return { xs: '3rem', sm: '2.5rem', md: '2rem', lg: '2.25rem', xl: '2.5rem' };
                  })(),
                  textShadow: (valueColor || textColor) === '#000' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {showPrivacy && !showValue ? (
                  <span>{maskValue(value)}</span>
                ) : typeof value === 'string' ? (
                  // Custom string value (no CountUp animation)
                  <>
                    {prefix && (
                      <Box component="span" sx={{ fontSize: { xs: '1.2rem', sm: '1rem', md: '0.85rem', lg: '0.95rem', xl: '1.05rem' }, opacity: 0.85 }}>
                        {prefix}
                      </Box>
                    )}
                    <span>{value}</span>
                    {suffix && (
                      <Box component="span" sx={{ fontSize: { xs: '1.2rem', sm: '1rem', md: '0.85rem', lg: '0.95rem', xl: '1.05rem' }, opacity: 0.85 }}>
                        {suffix}
                      </Box>
                    )}
                  </>
                ) : (
                  // Numeric value with CountUp animation
                  <>
                    {prefix && (
                      <Box component="span" sx={{ fontSize: { xs: '1.2rem', sm: '1rem', md: '0.85rem', lg: '0.95rem', xl: '1.05rem' }, opacity: 0.85 }}>
                        {prefix}
                      </Box>
                    )}
                    <CountUp
                      end={value}
                      duration={2.5}
                      separator=","
                      decimals={0}
                    />
                    {suffix && (
                      <Box component="span" sx={{ fontSize: { xs: '1.2rem', sm: '1rem', md: '0.85rem', lg: '0.95rem', xl: '1.05rem' }, opacity: 0.85 }}>
                        {suffix}
                      </Box>
                    )}
                  </>
                )}
              </Typography>
            </Box>

            {/* Icon Circle - fixed grid column on right */}
            <Box
              sx={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                justifySelf: 'end',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: textColor === '#000' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                  border: textColor === '#000' ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(255,255,255,0.2)',
                }}
              />
              {IconComponent && <IconComponent sx={{ fontSize: 26, color: textColor === '#000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)', zIndex: 1 }} />}
            </Box>
          </Box>

          {/* Bottom: Goal section with white background */}
          {goal && (
            <Box
              sx={{
                mt: 2,
                mx: -2.5,
                mb: -2.5,
                px: 2.5,
                py: 1,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
                  Goal:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>
                  {prefix}{typeof goal === 'number' ? goal.toLocaleString() : goal}{suffix}
                </Typography>
              </Box>

              {percentageToGoal && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isAboveGoal ? (
                    <TrendingUp sx={{ fontSize: 18, color: '#10b981' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 18, color: '#ef4444' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isAboveGoal ? '#10b981' : '#ef4444',
                      fontSize: '0.875rem',
                    }}
                  >
                    ({isAboveGoal ? '+' : ''}{percentageToGoal}%)
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardStatCard;