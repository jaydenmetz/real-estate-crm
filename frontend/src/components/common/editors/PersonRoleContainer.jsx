import React, { useState } from 'react';
import { Box, Avatar, Typography, useTheme, alpha } from '@mui/material';

/**
 * PersonRoleContainer - Fixed-height container for displaying people in a role
 *
 * Supports 3 display modes:
 * - 1 person: Shows single card centered (full width)
 * - 2 people: Shows both cards centered (full width stacked)
 * - 3-6 people: Shows first 2 cards + row of initials for remaining
 *
 * Features:
 * - Hover highlighting (background + border)
 * - Click anywhere to edit people in popup
 * - Fixed height (no layout shift)
 * - Role-colored backgrounds
 *
 * @param {string} roleName - Display name (e.g., "Buyer", "Seller")
 * @param {Array} people - Array of person objects (max 6)
 * @param {Object} color - Color scheme { primary, secondary }
 * @param {Function} onContainerClick - Handler for clicking entire container (opens popup)
 * @param {Function} getInitials - Helper to get initials from name
 * @param {Function} truncateName - Helper to truncate long names
 */
const PersonRoleContainer = ({
  roleName,
  people,
  color,
  onContainerClick,
  getInitials,
  truncateName,
}) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  // Render single person card (full width)
  const renderPersonCard = (person, index) => (
    <Box
      key={`person-${index}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0.75,
        borderRadius: 2,
        width: '100%',
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
          fontWeight: 700,
          fontSize: '1.1rem',
        }}
      >
        {getInitials(person.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: 9,
            fontWeight: 600,
            color: color.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'block',
          }}
        >
          {roleName} {people.length > 1 && index + 1}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: theme.palette.text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={person.name}
        >
          {truncateName(person.name, 28)}
        </Typography>
        {person.company && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              color: theme.palette.text.secondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {person.company}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // Render initials-only avatar (for 3-6 people remaining)
  const renderInitialsAvatar = (person, index) => (
    <Avatar
      key={`avatar-${index}`}
      sx={{
        width: 32,
        height: 32,
        background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
        fontWeight: 700,
        fontSize: '0.875rem',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.1)',
          transition: 'transform 0.2s',
        },
      }}
      title={person.name}
    >
      {getInitials(person.name)}
    </Avatar>
  );

  // Container with fixed height and role-colored background
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onContainerClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: hovered ? alpha(color.primary, 0.12) : alpha(color.primary, 0.06),
        borderRadius: 3,
        p: 1,
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: `2px solid ${hovered ? alpha(color.primary, 0.3) : 'transparent'}`,
      }}
    >
      {/* 1 person: Centered full-width card */}
      {people.length === 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {renderPersonCard(people[0], 0)}
        </Box>
      )}

      {/* 2 people: Both cards centered, full-width stacked */}
      {people.length === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {renderPersonCard(people[0], 0)}
          {renderPersonCard(people[1], 1)}
        </Box>
      )}

      {/* 3-6 people: First 2 cards + row of initials */}
      {people.length >= 3 && people.length <= 6 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {renderPersonCard(people[0], 0)}
          {renderPersonCard(people[1], 1)}
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mt: 0.5 }}>
            {people.slice(2).map((person, idx) => renderInitialsAvatar(person, idx + 2))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PersonRoleContainer;
