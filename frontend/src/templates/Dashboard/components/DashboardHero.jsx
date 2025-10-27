import React from 'react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export const DashboardHero = ({ config, onNewItem, dateRange, scope }) => {
  return (
    <Box
      sx={{
        background: config.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 2,
        p: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold">{config.title}</Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            {config.subtitle}
          </Typography>
          {(config.showDateRange || config.showScope) && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {config.showDateRange && dateRange && (
                <Chip label={dateRange.label} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              )}
              {config.showScope && scope && (
                <Chip label={scope.toUpperCase()} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              )}
            </Stack>
          )}
        </Box>
        {onNewItem && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewItem}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
            }}
          >
            New {config.entitySingular}
          </Button>
        )}
      </Stack>
    </Box>
  );
};
