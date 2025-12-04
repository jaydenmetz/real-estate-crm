import React from 'react';
import { Box, Paper, Typography, alpha } from '@mui/material';
import { Psychology as PsychologyIcon } from '@mui/icons-material';

/**
 * AIManagerTeaser - Clickable slot to open AI Lead Manager upsell modal
 *
 * Simple, clean design matching the 300x300 slot in desktop layout.
 * Opens AIManagerModal when clicked.
 *
 * Color Theme: Green (#10b981) - representing growth and nurturing
 */
const AIManagerTeaser = ({ onClick }) => {
  return (
    <Paper
      onClick={onClick}
      sx={{
        width: 300,
        height: 300,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.12) 100%)',
          '& .brain-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
        '&:active': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Animated gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.08) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          '.MuiPaper-root:hover &': {
            opacity: 1,
          },
        }}
      />

      {/* Brain Icon */}
      <Box
        className="brain-icon"
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: (theme) => alpha('#10b981', 0.2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <PsychologyIcon
          sx={{
            fontSize: 40,
            color: '#34d399',
            filter: 'drop-shadow(0 2px 8px rgba(16,185,129,0.4))',
          }}
        />
      </Box>

      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          color: '#fff',
          fontWeight: 600,
          mb: 1,
          textAlign: 'center',
          px: 2,
        }}
      >
        AI Lead Nurturing Manager
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          px: 3,
          lineHeight: 1.6,
        }}
      >
        Score, nurture, and convert leads with intelligent automation
      </Typography>

      {/* "Click to learn more" hint */}
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.5)',
          mt: 3,
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        Click to learn more
      </Typography>
    </Paper>
  );
};

export default AIManagerTeaser;
