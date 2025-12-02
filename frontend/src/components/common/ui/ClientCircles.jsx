import React, { useState } from 'react';
import { Box, Avatar, Typography, Paper, Fade, Popper } from '@mui/material';
import { Person, Email, Phone } from '@mui/icons-material';

/**
 * ClientCircles Component
 * Displays client avatars/initials in a horizontal row
 * Shows up to maxVisible circles, then "+N" indicator for overflow
 * Hover reveals contact card with full details
 *
 * For dual representation: Shows "B" indicator + buyer circles, then "S" + seller circles
 * This allows 6 buyers + 6 sellers to be displayed compactly
 *
 * @param {Object} clients - { buyers: [{Client}...], sellers: [{Client}...] }
 * @param {string} representationType - 'buyer' | 'seller' | 'dual'
 * @param {function} onEdit - Callback to open EditClients modal
 * @param {number} maxVisible - Max circles to show per group before "+N" (default: 6)
 */
export const ClientCircles = ({
  clients = { buyers: [], sellers: [] },
  representationType = 'buyer',
  onEdit,
  maxVisible = 6,
}) => {
  const [hoveredClient, setHoveredClient] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const { buyers = [], sellers = [] } = clients || {};

  // Get initials from client name or generate C1, C2 style
  const getInitials = (client, index) => {
    if (!client) return `C${index + 1}`;

    const firstName = client.first_name || client.firstName || '';
    const lastName = client.last_name || client.lastName || '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

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

  // Render a single client avatar
  const renderClientAvatar = (client, index, totalInGroup, color = '#3b82f6') => {
    const avatarUrl = client.avatar_url || client.avatarUrl;
    const initials = getInitials(client, index);
    const isHovered = hoveredClient?.id === client.id || hoveredClient === client;
    const depthOffset = index * 0.5;

    return (
      <Box
        key={client.id || `client-${index}`}
        onMouseEnter={(e) => handleMouseEnter(e, client)}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: 'relative',
          marginLeft: index === 0 ? 0 : '-14px',
          zIndex: isHovered ? 20 : totalInGroup - index,
          transition: 'all 0.2s ease',
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={getFullName(client)}
          sx={{
            width: 28,
            height: 28,
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: 'pointer',
            bgcolor: avatarUrl ? 'transparent' : color,
            color: 'white',
            border: '2px solid white',
            boxShadow: isHovered
              ? `0 4px 12px ${color}80`
              : `${index * 0.5}px ${1 + depthOffset}px ${3 + index}px rgba(0,0,0,${0.1 + index * 0.03})`,
            transition: 'all 0.2s ease',
            transform: isHovered
              ? 'scale(1.15) translateY(-2px)'
              : `translateY(${depthOffset}px)`,
            '&:hover': {
              transform: 'scale(1.15) translateY(-2px)',
              boxShadow: `0 4px 12px ${color}80`,
              zIndex: 25,
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
  };

  // Render overflow indicator
  const renderOverflow = (count, color = '#64748b') => (
    <Box sx={{ marginLeft: '-14px', zIndex: 0 }}>
      <Avatar
        sx={{
          width: 28,
          height: 28,
          fontSize: '0.6rem',
          fontWeight: 700,
          cursor: 'pointer',
          bgcolor: color,
          color: 'white',
          border: '2px solid white',
          boxShadow: '1px 2px 6px rgba(0,0,0,0.15)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.15) translateY(-2px)',
            bgcolor: color,
            boxShadow: `0 4px 12px ${color}60`,
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
      >
        +{count}
      </Avatar>
    </Box>
  );

  // Render role indicator (B or S)
  const renderRoleIndicator = (label, color) => (
    <Typography
      sx={{
        fontSize: '0.6rem',
        fontWeight: 800,
        color: color,
        mr: 0.25,
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
  );

  // Render a group of clients (buyers or sellers)
  const renderClientGroup = (clientList, maxShow, color, roleLabel) => {
    if (clientList.length === 0) return null;

    const displayClients = clientList.slice(0, maxShow);
    const overflow = clientList.length - maxShow;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {roleLabel && renderRoleIndicator(roleLabel, color)}
        {displayClients.map((client, idx) => renderClientAvatar(client, idx, displayClients.length, color))}
        {overflow > 0 && renderOverflow(overflow, '#64748b')}
      </Box>
    );
  };

  // Calculate total for empty state check
  const totalCount = representationType === 'dual'
    ? buyers.length + sellers.length
    : representationType === 'buyer'
      ? buyers.length
      : sellers.length;

  // Empty state - no clients
  if (totalCount === 0) {
    return (
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: '0.75rem',
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

  // DUAL REPRESENTATION: Show both buyer and seller groups with labels
  if (representationType === 'dual') {
    const hasBoth = buyers.length > 0 && sellers.length > 0;
    // If both groups exist, show max 4 per group to fit better
    // If only one group, show full maxVisible
    const maxPerGroup = hasBoth ? Math.min(4, maxVisible) : maxVisible;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {/* Buyers group */}
        {buyers.length > 0 && renderClientGroup(buyers, maxPerGroup, '#3b82f6', hasBoth ? 'B' : null)}

        {/* Separator if both exist */}
        {hasBoth && (
          <Box sx={{ width: '1px', height: 20, bgcolor: 'divider', mx: 0.25 }} />
        )}

        {/* Sellers group */}
        {sellers.length > 0 && renderClientGroup(sellers, maxPerGroup, '#10b981', hasBoth ? 'S' : null)}

        {/* Contact Card Popper */}
        <Popper
          open={Boolean(hoveredClient && anchorEl)}
          anchorEl={anchorEl}
          placement="top"
          transition
          modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                      {getFullName(hoveredClient)}
                    </Typography>
                    {(hoveredClient.email || hoveredClient.client_email) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {hoveredClient.email || hoveredClient.client_email}
                        </Typography>
                      </Box>
                    )}
                    {(hoveredClient.phone || hoveredClient.client_phone) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {hoveredClient.phone || hoveredClient.client_phone}
                        </Typography>
                      </Box>
                    )}
                    {!(hoveredClient.email || hoveredClient.client_email) &&
                      !(hoveredClient.phone || hoveredClient.client_phone) && (
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: '0.85rem' }}>
                          No contact info available
                        </Typography>
                      )}
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
                        '&:hover': { textDecoration: 'underline' },
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
  }

  // SINGLE REPRESENTATION (buyer or seller only)
  const clientList = representationType === 'buyer' ? buyers : sellers;
  const color = representationType === 'buyer' ? '#3b82f6' : '#10b981';
  const displayClients = clientList.slice(0, maxVisible);
  const overflowCount = clientList.length - maxVisible;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {displayClients.map((client, index) => renderClientAvatar(client, index, displayClients.length, color))}
      {overflowCount > 0 && renderOverflow(overflowCount)}

      {/* Contact Card Popper */}
      <Popper
        open={Boolean(hoveredClient && anchorEl)}
        anchorEl={anchorEl}
        placement="top"
        transition
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    {getFullName(hoveredClient)}
                  </Typography>
                  {(hoveredClient.email || hoveredClient.client_email) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {hoveredClient.email || hoveredClient.client_email}
                      </Typography>
                    </Box>
                  )}
                  {(hoveredClient.phone || hoveredClient.client_phone) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {hoveredClient.phone || hoveredClient.client_phone}
                      </Typography>
                    </Box>
                  )}
                  {!(hoveredClient.email || hoveredClient.client_email) &&
                    !(hoveredClient.phone || hoveredClient.client_phone) && (
                      <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        No contact info available
                      </Typography>
                    )}
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
                      '&:hover': { textDecoration: 'underline' },
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
