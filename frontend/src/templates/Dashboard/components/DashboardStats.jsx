import React from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Stack, Chip } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';
import CountUp from 'react-countup';

/**
 * DashboardStats - Config-driven stats cards
 */
export const DashboardStats = ({ stats, config, selectedStatus }) => {
  // Filter stats based on visibility rules
  const visibleStats = config.filter(statConfig => {
    if (!statConfig.visibleWhen) return true;
    return statConfig.visibleWhen.includes(selectedStatus);
  });

  return (
    <Grid container spacing={3}>
      {visibleStats.map(statConfig => {
        const stat = stats[statConfig.id];
        if (!stat) return null;

        // Get icon component dynamically
        const IconComponent = statConfig.icon ? MuiIcons[statConfig.icon] : null;

        // Format value based on type
        const formatValue = (value, format) => {
          switch (format) {
            case 'currency':
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value);
            case 'percentage':
              return `${value.toFixed(1)}%`;
            case 'number':
            default:
              return new Intl.NumberFormat('en-US').format(value);
          }
        };

        // Calculate progress toward goal
        const progressPercentage = stat.goal ? Math.min((stat.value / stat.goal) * 100, 100) : 0;

        return (
          <Grid item xs={12} sm={6} md={3} key={statConfig.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Stack spacing={2}>
                {/* Icon & Label */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {stat.label}
                    </Typography>
                  </Box>
                  {IconComponent && (
                    <Box
                      sx={{
                        backgroundColor: 'primary.lighter',
                        borderRadius: 1,
                        p: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent sx={{ fontSize: 20, color: 'primary.main' }} />
                    </Box>
                  )}
                </Stack>

                {/* Value with CountUp animation */}
                <Typography variant="h4" fontWeight="bold">
                  {stat.format === 'currency' ? '$' : ''}
                  <CountUp
                    end={stat.format === 'currency' ? stat.value : stat.value}
                    duration={1.5}
                    separator=","
                    decimals={stat.format === 'currency' ? 0 : 0}
                  />
                  {stat.format === 'percentage' ? '%' : ''}
                </Typography>

                {/* Trend Indicator */}
                {stat.trend && (
                  <Chip
                    label={`${stat.trend === 'up' ? '+' : '-'}${stat.trendValue}%`}
                    size="small"
                    color={stat.trend === 'up' ? 'success' : 'error'}
                    sx={{ width: 'fit-content', fontSize: '0.75rem' }}
                  />
                )}

                {/* Goal Progress */}
                {stat.showGoal && stat.goal && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {formatValue(stat.goal, stat.format)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progressPercentage.toFixed(0)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: progressPercentage >= 100 ? 'success.main' : 'primary.main',
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};
