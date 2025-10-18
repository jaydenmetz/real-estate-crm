import React from 'react';
import { Box, Typography, alpha } from '@mui/material';

/**
 * Helper function to get initials from name
 * @param {string} name - The full name
 * @returns {string} The initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * MiniContactCard - A compact contact display component
 *
 * Used to display contact information in a small, visually appealing card
 * Commonly used in escrow cards for buyers, sellers, and agents
 *
 * @param {string} title - The role/title (e.g., "Buyer", "Seller", "Agent")
 * @param {string} name - The contact's full name
 * @param {string} initials - Override for initials (optional, will calculate if not provided)
 * @param {string} color - The theme color for the avatar (default: #2196f3)
 */
export const MiniContactCard = ({ title, name, initials, color = '#2196f3' }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 0.75,
      borderRadius: 1,
      backgroundColor: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.2)}`,
      minHeight: 32,
    }}
  >
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials || getInitials(name)}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          fontSize: '9px',
          color: 'text.secondary',
          display: 'block',
          lineHeight: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: '10px',
          fontWeight: 600,
          display: 'block',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name || 'Not Assigned'}
      </Typography>
    </Box>
  </Box>
);

export default MiniContactCard;