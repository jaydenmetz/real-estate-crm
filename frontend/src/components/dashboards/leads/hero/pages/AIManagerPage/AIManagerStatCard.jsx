import React from 'react';
import { Box, Typography, Skeleton, alpha } from '@mui/material';

/**
 * AIManagerStatCard - Stat card component for AI Manager page
 *
 * Displays a single metric with:
 * - Title
 * - Value (with loading skeleton)
 * - Subtitle
 * - Accent color
 */
const AIManagerStatCard = ({ title, value, subtitle, loading = false, color = '#10b981' }) => {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)',
        transition: 'all 0.2s',
        '&:hover': {
          background: 'rgba(255,255,255,0.15)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 500,
          mb: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.7rem',
        }}
      >
        {title}
      </Typography>

      {loading ? (
        <Skeleton
          variant="text"
          width={80}
          height={40}
          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
        />
      ) : (
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 700,
            mb: 0.5,
            display: 'flex',
            alignItems: 'baseline',
            gap: 0.5,
          }}
        >
          {value}
        </Typography>
      )}

      <Typography
        variant="caption"
        sx={{
          color: alpha('#fff', 0.6),
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: color,
          }}
        />
        {subtitle}
      </Typography>
    </Box>
  );
};

export default AIManagerStatCard;
