import React from 'react';
import { Box, Paper, Typography, alpha } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';

/**
 * LockedStatCard - Greyed-out stat card showing locked AI Manager features
 *
 * Used on Page 2 (AI Manager page) to tease premium features.
 * Shows "--" values with lock icon overlay.
 */
const LockedStatCard = ({
  icon = 'Dashboard',
  title = 'STAT NAME',
  subtitle,
  color = '#9e9e9e',
}) => {
  const IconComponent = Icons[icon] || Icons.Dashboard;

  return (
    <Paper
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        opacity: 0.6,
        height: '100%',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Lock overlay in top-right */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.grey[500], 0.2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LockIcon
          sx={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.4)',
          }}
        />
      </Box>

      {/* Icon */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: (theme) => alpha(color, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <IconComponent
          sx={{
            fontSize: 24,
            color: alpha(color, 0.6),
          }}
        />
      </Box>

      {/* Title */}
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 600,
          letterSpacing: '0.5px',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {/* Locked value */}
      <Typography
        variant="h4"
        sx={{
          color: 'rgba(255,255,255,0.3)',
          fontWeight: 700,
          mb: subtitle ? 0.5 : 0,
        }}
      >
        --
      </Typography>

      {/* Optional subtitle */}
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.7rem',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

export default LockedStatCard;
