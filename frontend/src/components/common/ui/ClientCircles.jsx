import React from 'react';
import { Box, Avatar, Tooltip, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';

/**
 * ClientCircles Component
 * Displays client avatars/initials in a horizontal row
 * Shows up to maxVisible circles, then "+N" indicator for overflow
 *
 * @param {Object} clients - { buyers: [{Client}...], sellers: [{Client}...] }
 * @param {string} representationType - 'buyer' | 'seller' | 'dual'
 * @param {function} onEdit - Callback to open EditClients modal
 * @param {number} maxVisible - Max circles to show before "+N" (default: 5)
 */
export const ClientCircles = ({
  clients = { buyers: [], sellers: [] },
  representationType = 'buyer',
  onEdit,
  maxVisible = 5,
}) => {
  // Filter clients based on representation type
  const getVisibleClients = () => {
    if (!clients) return [];

    const { buyers = [], sellers = [] } = clients;

    if (representationType === 'buyer') {
      return buyers;
    } else if (representationType === 'seller') {
      return sellers;
    } else if (representationType === 'dual') {
      // For dual, show both buyers and sellers
      return [...buyers, ...sellers];
    }

    return [];
  };

  const visibleClients = getVisibleClients();
  const totalCount = visibleClients.length;
  const displayClients = visibleClients.slice(0, maxVisible);
  const overflowCount = totalCount - maxVisible;

  // Get initials from client name
  const getInitials = (client) => {
    if (!client) return '?';

    const firstName = client.first_name || client.firstName || '';
    const lastName = client.last_name || client.lastName || '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}` || '?';
  };

  // Get full name for tooltip
  const getFullName = (client) => {
    if (!client) return 'Unknown Client';

    const firstName = client.first_name || client.firstName || '';
    const lastName = client.last_name || client.lastName || '';

    return `${firstName} ${lastName}`.trim() || 'Unknown Client';
  };

  // Empty state - no clients
  if (totalCount === 0) {
    return (
      <Tooltip title="Click to add clients">
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.75rem',
            bgcolor: 'action.disabledBackground',
            color: 'text.disabled',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          <Person fontSize="small" />
        </Avatar>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {/* Display client circles */}
      {displayClients.map((client, index) => {
        const avatarUrl = client.avatar_url || client.avatarUrl;
        const initials = getInitials(client);
        const fullName = getFullName(client);

        return (
          <Tooltip key={client.id || index} title={fullName} arrow>
            <Avatar
              src={avatarUrl}
              alt={fullName}
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: 'background.paper',
                bgcolor: avatarUrl ? 'transparent' : 'primary.main',
                color: 'white',
                '&:hover': {
                  transform: 'scale(1.1)',
                  zIndex: 10,
                  transition: 'transform 0.2s',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              {!avatarUrl && initials}
            </Avatar>
          </Tooltip>
        );
      })}

      {/* Overflow indicator (+N more) */}
      {overflowCount > 0 && (
        <Tooltip
          title={
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                +{overflowCount} more {overflowCount === 1 ? 'client' : 'clients'}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {visibleClients.slice(maxVisible).map((client, index) => (
                  <Typography key={index} variant="caption" display="block">
                    {getFullName(client)}
                  </Typography>
                ))}
              </Box>
            </Box>
          }
          arrow
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              bgcolor: 'action.selected',
              color: 'text.primary',
              border: '2px solid',
              borderColor: 'background.paper',
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: 'action.hover',
                zIndex: 10,
                transition: 'transform 0.2s',
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            +{overflowCount}
          </Avatar>
        </Tooltip>
      )}
    </Box>
  );
};
