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

// Calculate font size based on value length (dynamic per card)
const calculateFontSize = (value, prefix, suffix) => {
  const valueStr = typeof value === 'number'
    ? value.toLocaleString()
    : String(value);
  const totalLength = (prefix || '').length + valueStr.length + (suffix || '').length;

  if (totalLength <= 4) {
    return { xs: '2.5rem', sm: '2rem', md: '1.8rem', lg: '2rem', xl: '2.2rem' };
  }
  if (totalLength <= 7) {
    return { xs: '2.2rem', sm: '1.7rem', md: '1.5rem', lg: '1.7rem', xl: '1.9rem' };
  }
  if (totalLength <= 10) {
    return { xs: '2rem', sm: '1.5rem', md: '1.3rem', lg: '1.5rem', xl: '1.6rem' };
  }
  if (totalLength <= 13) {
    return { xs: '1.7rem', sm: '1.2rem', md: '1.1rem', lg: '1.2rem', xl: '1.3rem' };
  }
  return { xs: '1.5rem', sm: '1rem', md: '0.9rem', lg: '1rem', xl: '1.1rem' };
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
}) => {
  const [showValue, setShowValue] = useState(false);
  const dynamicFontSize = calculateFontSize(value, prefix, suffix);
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;

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

          {/* Content Row: [Privacy?] Value Icon */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 2,
            px: 1,
          }}>
            {/* Privacy toggle */}
            {showPrivacy && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setShowValue(!showValue); }}
                sx={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
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
              }}
            >
              {showPrivacy && !showValue ? (
                maskValue(value)
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
