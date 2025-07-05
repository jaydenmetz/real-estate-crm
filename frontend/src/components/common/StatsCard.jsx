import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatsCard({ title, value, icon, color = 'primary', trend }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center">
          {icon}
          <Box ml={1}>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h5">
              {value}
            </Typography>
            {trend && (
              <Typography variant="caption" color={color}>
                {trend}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}