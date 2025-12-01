import React from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';

/**
 * AIManagerStatCard - Stat card for AI Manager page
 *
 * Matches the optimal design from the mockup with:
 * - Label chip at top
 * - Large value with subtext
 * - Icon on the right side
 * - Optional highlight state for urgent items
 */
const AIManagerStatCard = ({
  label = 'STAT NAME',
  value = '--',
  subtext = '',
  icon = '📋',
  highlight = false,
  valueColor,
}) => {
  return (
    <Box
      sx={{
        background: highlight
          ? 'rgba(255,255,255,0.15)'
          : 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        p: 2.5,
        position: 'relative',
        height: '100%',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        border: highlight
          ? '2px solid rgba(255,255,255,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(255,255,255,0.18)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Label Chip at top */}
      <Chip
        label={label}
        size="small"
        sx={{
          alignSelf: 'flex-start',
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.65rem',
          letterSpacing: '0.5px',
          height: 24,
          mb: 2,
        }}
      />

      {/* Bottom section with value and icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          mt: 'auto',
        }}
      >
        {/* Value and subtext */}
        <Box>
          <Typography
            sx={{
              color: valueColor || '#fff',
              fontWeight: 700,
              fontSize: '2.5rem',
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
          {subtext && (
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {subtext}
            </Typography>
          )}
        </Box>

        {/* Icon */}
        <Box
          sx={{
            fontSize: '2.5rem',
            opacity: 0.8,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );
};

export default AIManagerStatCard;
