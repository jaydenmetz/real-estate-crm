import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon, color = 'primary', trend, subtitle }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography 
                variant="body2" 
                color={trend > 0 ? 'success.main' : 'error.main'}
                sx={{ mt: 1 }}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: `${color}.light`,
                color: `${color}.main`,
                opacity: 0.2
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;