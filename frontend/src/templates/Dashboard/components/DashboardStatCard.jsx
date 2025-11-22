import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Home,
  People,
  AttachMoney,
  CheckCircle,
  Schedule,
  PersonAdd,
  TrendingUp,
  TrendingDown,
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

// Calculate font size based on number magnitude (dynamic per card)
// Each 3 digits (order of magnitude) gets progressively smaller
const calculateFontSize = (value, prefix, suffix) => {
  // Get the numeric value for magnitude calculation
  const numValue = typeof value === 'number' ? Math.abs(value) : 0;

  // Determine magnitude: 1-999, 1K-999K, 1M-999M, 1B+
  if (numValue < 1000) {
    // Hundreds: "2", "99", "500"
    return { xs: '2.8rem', sm: '2.2rem', md: '2rem', lg: '2.2rem', xl: '2.4rem' };
  }
  if (numValue < 10000) {
    // Low thousands: "1,000" - "9,999"
    return { xs: '2.5rem', sm: '2rem', md: '1.8rem', lg: '2rem', xl: '2.2rem' };
  }
  if (numValue < 100000) {
    // Mid thousands: "10,000" - "99,999"
    return { xs: '2.2rem', sm: '1.8rem', md: '1.6rem', lg: '1.8rem', xl: '2rem' };
  }
  if (numValue < 1000000) {
    // High thousands: "100,000" - "999,999"
    return { xs: '2rem', sm: '1.6rem', md: '1.4rem', lg: '1.6rem', xl: '1.8rem' };
  }
  if (numValue < 10000000) {
    // Low millions: "1,000,000" - "9,999,999"
    return { xs: '1.8rem', sm: '1.4rem', md: '1.2rem', lg: '1.4rem', xl: '1.6rem' };
  }
  if (numValue < 100000000) {
    // Mid millions: "10,000,000" - "99,999,999"
    return { xs: '1.6rem', sm: '1.2rem', md: '1.1rem', lg: '1.2rem', xl: '1.4rem' };
  }
  if (numValue < 1000000000) {
    // High millions: "100,000,000" - "999,999,999"
    return { xs: '1.4rem', sm: '1.1rem', md: '1rem', lg: '1.1rem', xl: '1.2rem' };
  }
  if (numValue < 10000000000) {
    // Low billions: "1,000,000,000" - "9,999,999,999"
    return { xs: '1.2rem', sm: '1rem', md: '0.9rem', lg: '1rem', xl: '1.1rem' };
  }
  // 10B+ (very large teams)
  return { xs: '1rem', sm: '0.9rem', md: '0.8rem', lg: '0.9rem', xl: '1rem' };
};

/**
 * DashboardStatCard - Simplified stat card
 *
 * Structure:
 * Card → CardContent → Title Row + Content Row (value + icon)
 */
const DashboardStatCard = ({
  icon,
  title,
  value,
  prefix = '',
  suffix = '',
  color = '#ffffff',
  backgroundColor = null,
  textColor = null,
  valueColor = null,
  delay = 0,
  showPrivacy = false,
  defaultHidden = true,
}) => {
  const [showValue, setShowValue] = useState(false);
  const dynamicFontSize = calculateFontSize(value, prefix, suffix);
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;

  // Generate animated mask with staggered asterisks
  const renderAnimatedMask = (val) => {
    const absValue = Math.abs(val);
    let pattern;
    if (absValue >= 1000000) pattern = '***,***,***';
    else if (absValue >= 100000) pattern = '***,***';
    else if (absValue >= 10000) pattern = '**,***';
    else if (absValue >= 1000) pattern = '*,***';
    else if (absValue >= 100) pattern = '***';
    else if (absValue >= 10) pattern = '**';
    else pattern = '*';

    let charIndex = 0;
    return (
      <>
        <span style={{ fontSize: '0.7em', opacity: 0.9 }}>$</span>
        {pattern.split('').map((char, i) => {
          if (char === ',') {
            return <span key={i}>,</span>;
          }
          const delay = charIndex * 0.08;
          charIndex++;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                animation: `fadeInChar 0.3s ease-out ${delay}s both`,
              }}
            >
              *
            </span>
          );
        })}
        <style>{`
          @keyframes fadeInChar {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card
        elevation={0}
        sx={{
          height: 200,
          width: '100%', // Fill grid cell (constrained by parent to 250px fixed)
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
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          {/* Title */}
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
              alignSelf: 'flex-start',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: textColor === '#000' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(10px)',
              mb: 2,
            }}
          >
            {title}
          </Typography>

          {/* Content Row: Value + Icon (icon anchored right) */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            pl: 2,
            pr: 0.5,
            position: 'relative',
          }}>
            {/* Privacy toggle - positioned at left edge */}
            {showPrivacy && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setShowValue(!showValue); }}
                sx={{
                  position: 'absolute',
                  left: -8,
                  width: 28,
                  height: 28,
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' },
                }}
              >
                {showValue ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
              </IconButton>
            )}

            {/* Value */}
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: valueColor || textColor || 'white',
                textShadow: (valueColor || textColor) === '#000' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                fontSize: dynamicFontSize,
                ml: showPrivacy ? 1.5 : 0,
              }}
            >
              {showPrivacy && !showValue ? (
                renderAnimatedMask(value)
              ) : typeof value === 'string' ? (
                <>
                  {prefix && <span style={{ fontSize: '0.7em', opacity: 0.9 }}>{prefix}</span>}
                  {value}
                  {suffix && <span style={{ fontSize: '0.7em', opacity: 0.9 }}>{suffix}</span>}
                </>
              ) : (
                <>
                  {prefix && <span style={{ fontSize: '0.7em', opacity: 0.9 }}>{prefix}</span>}
                  <CountUp end={value} duration={2.5} separator="," decimals={0} />
                  {suffix && <span style={{ fontSize: '0.7em', opacity: 0.9 }}>{suffix}</span>}
                </>
              )}
            </Box>

            {/* Icon */}
            <Box sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: textColor === '#000' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                border: textColor === '#000' ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(255,255,255,0.2)',
              }} />
              {IconComponent && <IconComponent sx={{ fontSize: 26, color: textColor === '#000' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)', zIndex: 1 }} />}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardStatCard;
