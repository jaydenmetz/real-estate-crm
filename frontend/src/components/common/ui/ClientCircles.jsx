import React, { useState } from 'react';
import { Box, Avatar, Typography, Paper, Fade, Popper, ClickAwayListener } from '@mui/material';
import { Person, Email, Phone } from '@mui/icons-material';

/**
 * ClientCircles Component
 * Displays client avatars/initials in a horizontal row
 * Shows up to maxVisible circles, then "+N" indicator for overflow
 * Hover reveals contact card with full details
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
  const [hoveredClient, setHoveredClient] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

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

  // Get initials from client name or generate C1, C2 style
  const getInitials = (client, index) => {
    if (!client) return `C${index + 1}`;

    const firstName = client.first_name || client.firstName || '';
    const lastName = client.last_name || client.lastName || '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    // If we have initials, use them, otherwise use C1, C2 style
    if (firstInitial || lastInitial) {
      return `${firstInitial}${lastInitial}`.trim() || `C${index + 1}`;
    }
    return `C${index + 1}`;
  };

  // Get full name for tooltip
  const getFullName = (client) => {
    if (!client) return 'Unknown Client';

    const firstName = client.first_name || client.firstName || '';
    const lastName = client.last_name || client.lastName || '';

    return `${firstName} ${lastName}`.trim() || 'Unknown Client';
  };

  // Handle hover events
  const handleMouseEnter = (event, client) => {
    setAnchorEl(event.currentTarget);
    setHoveredClient(client);
  };

  const handleMouseLeave = () => {
    setHoveredClient(null);
    setAnchorEl(null);
  };

  // Empty state - no clients
  if (totalCount === 0) {
    return (
      <Avatar
        sx={{
          width: 36,
          height: 36,
          fontSize: '0.8rem',
          bgcolor: 'action.disabledBackground',
          color: 'text.disabled',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'white',
            transform: 'scale(1.1)',
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
      >
        <Person fontSize="small" />
      </Avatar>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
      }}
    >
      {/* Display client circles */}
      {displayClients.map((client, index) => {
        const avatarUrl = client.avatar_url || client.avatarUrl;
        const initials = getInitials(client, index);
        const isHovered = hoveredClient?.id === client.id || hoveredClient === client;

        return (
          <Box
            key={client.id || index}
            onMouseEnter={(e) => handleMouseEnter(e, client)}
            onMouseLeave={handleMouseLeave}
            sx={{ position: 'relative' }}
          >
            <Avatar
              src={avatarUrl}
              alt={getFullName(client)}
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                bgcolor: avatarUrl ? 'transparent' : '#3b82f6',
                color: 'white',
                transition: 'all 0.2s ease',
                boxShadow: isHovered ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                zIndex: isHovered ? 10 : 1,
                '&:hover': {
                  transform: 'scale(1.15)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              {!avatarUrl && initials}
            </Avatar>
          </Box>
        );
      })}

      {/* Overflow indicator (+N more) */}
      {overflowCount > 0 && (
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            bgcolor: '#64748b',
            color: 'white',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.15)',
              bgcolor: '#475569',
              boxShadow: '0 4px 12px rgba(100, 116, 139, 0.4)',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          +{overflowCount}
        </Avatar>
      )}

      {/* Contact Card Popper */}
      <Popper
        open={Boolean(hoveredClient && anchorEl)}
        anchorEl={anchorEl}
        placement="top"
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              sx={{
                p: 2,
                minWidth: 200,
                maxWidth: 280,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
              onMouseEnter={() => setHoveredClient(hoveredClient)}
              onMouseLeave={handleMouseLeave}
            >
              {hoveredClient && (
                <Box>
                  {/* Client Name */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    {getFullName(hoveredClient)}
                  </Typography>

                  {/* Email */}
                  {(hoveredClient.email || hoveredClient.client_email) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                        }}
                      >
                        {hoveredClient.email || hoveredClient.client_email}
                      </Typography>
                    </Box>
                  )}

                  {/* Phone */}
                  {(hoveredClient.phone || hoveredClient.client_phone) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                        }}
                      >
                        {hoveredClient.phone || hoveredClient.client_phone}
                      </Typography>
                    </Box>
                  )}

                  {/* No contact info message */}
                  {!(hoveredClient.email || hoveredClient.client_email) &&
                    !(hoveredClient.phone || hoveredClient.client_phone) && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.disabled',
                          fontStyle: 'italic',
                          fontSize: '0.85rem',
                        }}
                      >
                        No contact info available
                      </Typography>
                    )}

                  {/* Click to edit hint */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1.5,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                  >
                    Click to edit clients
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};
