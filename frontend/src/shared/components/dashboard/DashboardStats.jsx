import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Skeleton,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info
} from '@mui/icons-material';
import { formatNumber, formatCurrency, formatPercentage } from '../../../utils/formatters';

const StatsCard = ({ stat, color = 'primary.main', loading = false, onClick }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </Paper>
    );
  }

  const formatValue = (value) => {
    switch (stat.format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      default:
        return value;
    }
  };

  const trendColor = stat.change > 0 ? 'success.main' : 'error.main';
  const TrendIcon = stat.change > 0 ? TrendingUp : TrendingDown;

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        borderTop: 3,
        borderColor: color,
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center">
          {stat.icon && (
            <Box sx={{ mr: 1.5, color, display: 'flex' }}>
              {stat.icon}
            </Box>
          )}
          <Typography color="textSecondary" variant="subtitle2">
            {stat.label}
          </Typography>
        </Box>

        {stat.info && (
          <Tooltip title={stat.info}>
            <IconButton size="small">
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Value */}
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {formatValue(stat.value)}
      </Typography>

      {/* Change Indicator */}
      {stat.change !== undefined && stat.change !== null && (
        <Box display="flex" alignItems="center" gap={0.5}>
          <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
          <Typography variant="body2" sx={{ color: trendColor }}>
            {Math.abs(stat.change)}%
          </Typography>
          {stat.changePeriod && (
            <Typography variant="body2" color="textSecondary">
              vs {stat.changePeriod}
            </Typography>
          )}
        </Box>
      )}

      {/* Subtitle */}
      {stat.subtitle && (
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          {stat.subtitle}
        </Typography>
      )}
    </Paper>
  );
};

const DashboardStats = ({
  stats = [],
  color = 'primary.main',
  loading = false,
  columns = { xs: 12, sm: 6, md: 3 }
}) => {
  if (!stats || stats.length === 0) return null;

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item {...columns} key={stat.id || index}>
          <StatsCard
            stat={stat}
            color={stat.color || color}
            loading={loading}
            onClick={stat.onClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStats;
