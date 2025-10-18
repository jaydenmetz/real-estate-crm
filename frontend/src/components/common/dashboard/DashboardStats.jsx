import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const DashboardStats = ({ stats = [] }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={stat.label || index}>
          <Card sx={{
            height: '100%',
            transition: 'box-shadow 0.3s',
            '&:hover': {
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {stat.icon && (
                  <Avatar sx={{
                    bgcolor: stat.color || 'primary.main',
                    mr: 2,
                    width: 48,
                    height: 48
                  }}>
                    {stat.icon}
                  </Avatar>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>

              {stat.change !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip
                    label={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
                    size="small"
                    color={stat.change > 0 ? 'success' : 'error'}
                    icon={stat.change > 0 ? <TrendingUp /> : <TrendingDown />}
                    sx={{ fontWeight: 600 }}
                  />
                  {stat.changeLabel && (
                    <Typography variant="caption" color="text.secondary">
                      {stat.changeLabel}
                    </Typography>
                  )}
                </Box>
              )}

              {stat.subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {stat.subtitle}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStats;