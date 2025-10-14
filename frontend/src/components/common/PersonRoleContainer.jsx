import React, { useState } from 'react';
import { Box, Avatar, Typography, IconButton, useTheme, alpha } from '@mui/material';
import { Remove, MoreHoriz, Add } from '@mui/icons-material';

/**
 * PersonRoleContainer - Fixed-height container for displaying people in a role
 *
 * Supports 3 display modes:
 * - 1 person: Shows single card centered + Add button below
 * - 2 people: First at top 1/3, second at bottom 2/3 + Add button below
 * - 3-6 people: Shows first 2 people + ellipsis button to open popup
 *
 * @param {string} roleName - Display name (e.g., "Buyer", "Seller")
 * @param {Array} people - Array of person objects (max 6)
 * @param {Object} color - Color scheme { primary, secondary }
 * @param {Function} onPersonClick - Handler for clicking a person
 * @param {Function} onRemovePerson - Handler for removing a person (optional)
 * @param {Function} onViewAll - Handler for viewing all people in popup
 * @param {Function} onAddPerson - Handler for adding a new person
 * @param {Function} getInitials - Helper to get initials from name
 * @param {Function} truncateName - Helper to truncate long names
 */
const PersonRoleContainer = ({
  roleName,
  people,
  color,
  onPersonClick,
  onRemovePerson,
  onViewAll,
  onAddPerson,
  getInitials,
  truncateName,
}) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  // Render single person card
  const renderPersonCard = (person, index, sx = {}) => (
    <Box
      key={`person-${index}`}
      onClick={() => onPersonClick && onPersonClick(person, index)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        p: 0.75,
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(color.primary, 0.05),
        },
        ...sx,
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
          {people.length > 1 ? `${roleName} ${index + 1}` : roleName}
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
      {people.length > 1 && onRemovePerson && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemovePerson(index);
          }}
          sx={{ width: 24, height: 24, color: 'error.main' }}
        >
          <Remove sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  );

  // Render ellipsis button for 3+ people
  const renderEllipsisButton = () => (
    <Box
      onClick={onViewAll}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        p: 1,
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(color.primary, 0.05),
        },
      }}
    >
      <IconButton
        size="small"
        sx={{
          width: 36,
          height: 36,
          backgroundColor: alpha(color.primary, 0.1),
          color: color.primary,
          '&:hover': {
            backgroundColor: alpha(color.primary, 0.2),
          },
        }}
      >
        <MoreHoriz sx={{ fontSize: 20 }} />
      </IconButton>
      <Typography
        variant="caption"
        sx={{
          ml: 1,
          fontSize: 11,
          fontWeight: 600,
          color: color.primary,
        }}
      >
        {people.length} {roleName}s
      </Typography>
    </Box>
  );

  // Render add button for 1-2 people (shows on hover)
  const renderAddButton = () => (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        onAddPerson && onAddPerson();
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        p: 0.5,
        borderRadius: 2,
        height: hovered ? 'auto' : 0,
        opacity: hovered ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          background: alpha(color.primary, 0.05),
        },
      }}
    >
      <IconButton
        size="small"
        sx={{
          width: 32,
          height: 32,
          backgroundColor: alpha(color.primary, 0.1),
          color: color.primary,
          '&:hover': {
            backgroundColor: alpha(color.primary, 0.2),
          },
        }}
      >
        <Add sx={{ fontSize: 18 }} />
      </IconButton>
      <Typography
        variant="caption"
        sx={{
          ml: 1,
          fontSize: 10,
          fontWeight: 600,
          color: color.primary,
        }}
      >
        Add {roleName}
      </Typography>
    </Box>
  );

  // Container with fixed height
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* 1 person: Centered + Add button below on hover */}
      {people.length === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          {renderPersonCard(people[0], 0)}
          {onAddPerson && renderAddButton()}
        </Box>
      )}

      {/* 2 people: Equal spacing + Add button */}
      {people.length === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.5, justifyContent: 'center' }}>
          {renderPersonCard(people[0], 0)}
          {renderPersonCard(people[1], 1)}
          {onAddPerson && renderAddButton()}
        </Box>
      )}

      {/* 3-6 people: Show first 2 + ellipsis */}
      {people.length >= 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1 }}>
          {renderPersonCard(people[0], 0)}
          {renderPersonCard(people[1], 1)}
          {renderEllipsisButton()}
        </Box>
      )}

      {/* No people: Empty state */}
      {people.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            opacity: 0.3,
          }}
        >
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            No {roleName}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PersonRoleContainer;
