import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Stack,
  Grid,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import * as MuiIcons from '@mui/icons-material';
import { format } from 'date-fns';
import CountUp from 'react-countup';

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(21, 101, 192, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0);
  }
`;

const HeroSection = styled(Box)(({ theme, gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(21, 101, 192, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
  },
}));

const StatusBadge = styled(Box)(({ theme, status }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: status === 'active' ? theme.palette.success.main : theme.palette.grey[400],
  border: `3px solid ${theme.palette.background.paper}`,
  animation: status === 'active' ? `${pulseAnimation} 1.4s infinite` : 'none',
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    '& .metric-icon': {
      transform: 'scale(1.2) rotate(5deg)',
    },
  },
  '& .metric-icon': {
    transition: 'transform 0.3s ease',
  },
}));

/**
 * DetailHero Component
 *
 * Renders hero section for detail pages based on config
 * Supports: avatar, title, subtitle, badges, actions, stats
 */
export const DetailHero = ({ entity, config }) => {
  const theme = useTheme();
  const heroConfig = config.detail?.hero || {};

  if (!entity) return null;

  // Get field values from entity
  const getValue = (field) => {
    if (typeof field === 'function') {
      return field(entity);
    }
    return entity[field] || null;
  };

  // Get icon component
  const getIcon = (iconName) => {
    if (!iconName) return null;
    const Icon = MuiIcons[iconName];
    return Icon ? <Icon /> : null;
  };

  // Format value based on format type
  const formatValue = (value, format) => {
    if (!value) return 'N/A';

    switch (format) {
      case 'currency':
        return `$${typeof value === 'number' ? value.toLocaleString() : value}`;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        try {
          return format(new Date(value), 'MMM d, yyyy');
        } catch {
          return value;
        }
      case 'datetime':
        try {
          return format(new Date(value), 'MMM d, yyyy h:mm a');
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusMap = heroConfig.statusColors || {
      active: theme.palette.success.main,
      inactive: theme.palette.grey[400],
      pending: theme.palette.warning.main,
      completed: theme.palette.success.main,
    };
    return statusMap[status?.toLowerCase()] || theme.palette.grey[400];
  };

  return (
    <HeroSection gradient={heroConfig.gradient}>
      <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {/* Avatar */}
            {heroConfig.showAvatar !== false && (
              <Box sx={{ position: 'relative', mr: 3 }}>
                <Avatar
                  src={getValue(heroConfig.avatarField || 'avatar')}
                  sx={{
                    width: 100,
                    height: 100,
                    border: '4px solid white',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  {getValue(heroConfig.nameField || 'name')?.[0]}
                </Avatar>
                {heroConfig.showStatusBadge && (
                  <StatusBadge
                    status={getValue(heroConfig.statusField || 'status')?.toLowerCase()}
                  />
                )}
              </Box>
            )}

            {/* Title and Subtitle */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {getValue(heroConfig.nameField || 'name')}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                {/* Subtitle Chips */}
                {heroConfig.subtitleFields?.map((field, index) => {
                  const value = getValue(field.field || field);
                  const icon = getIcon(field.icon);

                  return value ? (
                    <Chip
                      key={index}
                      label={value}
                      icon={icon}
                      sx={{
                        backgroundColor: field.color || 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                  ) : null;
                })}
              </Stack>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {heroConfig.actions?.map((action, index) => {
              const icon = getIcon(action.icon);

              return (
                <Button
                  key={index}
                  variant={action.variant || 'contained'}
                  startIcon={icon}
                  onClick={() => action.onClick?.(entity)}
                  sx={{
                    backgroundColor: action.variant === 'contained' ? 'white' : 'transparent',
                    color: action.variant === 'contained' ? theme.palette.primary.main : 'white',
                    borderColor: 'white',
                    '&:hover': {
                      backgroundColor: action.variant === 'contained' ? 'grey.100' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'white',
                    },
                  }}
                >
                  {action.label}
                </Button>
              );
            })}
          </Stack>
        </Grid>

        {/* Stats Grid */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {heroConfig.stats?.map((stat, index) => {
              const value = getValue(stat.field);
              const icon = getIcon(stat.icon);
              const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

              return (
                <Grid item xs={6} key={index}>
                  <MetricCard elevation={0}>
                    {icon && React.cloneElement(icon, {
                      className: 'metric-icon',
                      sx: { fontSize: 40, color: stat.color || theme.palette.primary.main, mb: 1 }
                    })}
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stat.format === 'currency' && '$'}
                      {stat.useCountUp !== false ? (
                        <CountUp
                          end={stat.format === 'currency' ? numericValue / 1000 : numericValue}
                          duration={2}
                          decimals={stat.format === 'currency' ? 0 : 0}
                        />
                      ) : (
                        formatValue(value, stat.format)
                      )}
                      {stat.format === 'currency' && 'K'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </MetricCard>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </HeroSection>
  );
};
