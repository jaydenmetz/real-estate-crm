import React, { useState } from 'react';
import { Box, Avatar, Typography, Paper, Fade, Popper, Chip } from '@mui/material';
import { Add, Email, Phone } from '@mui/icons-material';

/**
 * Role color configuration
 * Blue = Buyer, Orange = Seller
 * Extensible for future roles (realtors, vendors, etc.)
 */
const ROLE_COLORS = {
  buyer: {
    border: '#3b82f6',    // Blue
    bg: '#3b82f6',
    label: 'Buyer',
  },
  seller: {
    border: '#f97316',    // Orange
    bg: '#f97316',
    label: 'Seller',
  },
  // Future roles can be added here:
  // realtor: { border: '#8b5cf6', bg: '#8b5cf6', label: 'Realtor' },
  // vendor: { border: '#06b6d4', bg: '#06b6d4', label: 'Vendor' },
};

/**
 * ClientCircles Component
 * Displays client avatars/initials in a horizontal row
 * Shows up to maxVisible circles, then "+N" indicator for overflow
 * Hover reveals contact card with full details
 *
 * Visual differentiation:
 * - Buyers: Blue border/ring
 * - Sellers: Orange border/ring
 * - Profile images show colored ring around avatar
 * - Initials show colored background
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
  const [hoveredRole, setHoveredRole] = useState(null); // Track which role the hovered client belongs to
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
  const handleMouseEnter = (event, client, role) => {
    setAnchorEl(event.currentTarget);
    setHoveredClient(client);
    setHoveredRole(role);
  };

  const handleMouseLeave = () => {
    setHoveredClient(null);
    setHoveredRole(null);
    setAnchorEl(null);
  };

  // Render a single client avatar with role-based coloring
  const renderClientAvatar = (client, index, totalInGroup, role = 'buyer') => {
    const avatarUrl = client.avatar_url || client.avatarUrl;
    const initials = getInitials(client, index);
    const isHovered = hoveredClient?.id === client.id || hoveredClient === client;
    const roleConfig = ROLE_COLORS[role] || ROLE_COLORS.buyer;

    return (
      <Box
        key={client.id || `client-${index}`}
        onMouseEnter={(e) => handleMouseEnter(e, client, role)}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: 'relative',
          marginLeft: index === 0 ? 0 : '-16px', // Tighter overlap
          zIndex: isHovered ? 20 : totalInGroup - index,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Colored ring around avatar for role indication */}
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${roleConfig.border}, ${roleConfig.border}dd)`,
            padding: '2px',
            boxShadow: isHovered
              ? `0 4px 12px ${roleConfig.border}60`
              : `0 1px 3px rgba(0,0,0,0.12)`,
            transition: 'all 0.2s ease',
            // 3D perspective tilt - like a plate with right edge lifted
            // rotateY tilts left/right, perspective gives depth
            transform: isHovered
              ? 'perspective(100px) rotateY(0deg) scale(1.15) translateY(-2px)'
              : 'perspective(100px) rotateY(12deg)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'perspective(100px) rotateY(0deg) scale(1.15) translateY(-2px)',
              boxShadow: `0 4px 12px ${roleConfig.border}60`,
              zIndex: 25,
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
        >
          <Avatar
            src={avatarUrl}
            alt={getFullName(client)}
            sx={{
              width: '100%',
              height: '100%',
              fontSize: '0.55rem',
              fontWeight: 700,
              bgcolor: avatarUrl ? 'white' : roleConfig.bg,
              color: 'white',
              border: '1.5px solid white',
            }}
          >
            {!avatarUrl && initials}
          </Avatar>
        </Box>
      </Box>
    );
  };

  // Render simple text overflow indicator (e.g., "+3")
  const renderOverflowText = (count) => {
    if (count <= 0) return null;

    return (
      <Typography
        component="span"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        sx={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'text.secondary',
          ml: 0.25,
          cursor: 'pointer',
          flexShrink: 0, // Prevent text from being cut off
          whiteSpace: 'nowrap',
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        +{count}
      </Typography>
    );
  };

  // Render a group of clients (no overflow - that's handled separately)
  const renderClientGroup = (clientList, maxShow, role) => {
    if (clientList.length === 0) return null;

    const displayClients = clientList.slice(0, maxShow);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {displayClients.map((client, idx) => renderClientAvatar(client, idx, displayClients.length, role))}
      </Box>
    );
  };

  // Get gradient colors based on role
  const getGradientColors = (role) => {
    if (role === 'buyer') {
      return {
        from: 'rgba(99, 102, 241, 0.9)',  // Indigo
        to: 'rgba(139, 92, 246, 0.85)',    // Purple
      };
    }
    return {
      from: 'rgba(249, 115, 22, 0.9)',   // Orange
      to: 'rgba(234, 88, 12, 0.85)',      // Darker orange
    };
  };

  // Render the contact card popper (Apple-style glassmorphism)
  const renderContactCard = () => {
    const gradientColors = getGradientColors(hoveredRole);
    const roleConfig = ROLE_COLORS[hoveredRole] || ROLE_COLORS.buyer;

    return (
      <Popper
        open={Boolean(hoveredClient && anchorEl)}
        anchorEl={anchorEl}
        placement="top"
        transition
        modifiers={[{ name: 'offset', options: { offset: [0, 12] } }]}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250}>
            <Paper
              elevation={24}
              sx={{
                width: 240,
                borderRadius: 4,
                overflow: 'hidden',
                background: `linear-gradient(160deg, ${gradientColors.from}, ${gradientColors.to})`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
              onMouseEnter={() => setHoveredClient(hoveredClient)}
              onMouseLeave={handleMouseLeave}
            >
              {hoveredClient && (
                <Box sx={{ p: 2.5, textAlign: 'center' }}>
                  {/* Large Avatar with initials */}
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      margin: '0 auto 16px',
                      background: 'rgba(255,255,255,0.15)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '1.75rem',
                        fontWeight: 500,
                        color: 'white',
                        letterSpacing: '1px',
                      }}
                    >
                      {getInitials(hoveredClient, 0)}
                    </Typography>
                  </Box>

                  {/* Role badge - small pill */}
                  {hoveredRole && ROLE_COLORS[hoveredRole] && (
                    <Chip
                      label={ROLE_COLORS[hoveredRole].label}
                      size="small"
                      sx={{
                        mb: 1,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 20,
                        border: '1px solid rgba(255,255,255,0.3)',
                        '& .MuiChip-label': { px: 1.5 },
                      }}
                    />
                  )}

                  {/* Client Name - Large and bold */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      mb: 2,
                      fontSize: '1.25rem',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    {getFullName(hoveredClient)}
                  </Typography>

                  {/* Action buttons row - Apple style */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    {/* Email button */}
                    <Box
                      component="a"
                      href={(hoveredClient.email || hoveredClient.client_email) ? `mailto:${hoveredClient.email || hoveredClient.client_email}` : undefined}
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (hoveredClient.email || hoveredClient.client_email) ? 'pointer' : 'default',
                        opacity: (hoveredClient.email || hoveredClient.client_email) ? 1 : 0.4,
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                        '&:hover': {
                          bgcolor: (hoveredClient.email || hoveredClient.client_email) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                          transform: (hoveredClient.email || hoveredClient.client_email) ? 'scale(1.1)' : 'none',
                        },
                      }}
                    >
                      <Email sx={{ fontSize: 20, color: 'white' }} />
                    </Box>

                    {/* Phone button */}
                    <Box
                      component="a"
                      href={(hoveredClient.phone || hoveredClient.client_phone) ? `tel:${hoveredClient.phone || hoveredClient.client_phone}` : undefined}
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (hoveredClient.phone || hoveredClient.client_phone) ? 'pointer' : 'default',
                        opacity: (hoveredClient.phone || hoveredClient.client_phone) ? 1 : 0.4,
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                        '&:hover': {
                          bgcolor: (hoveredClient.phone || hoveredClient.client_phone) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                          transform: (hoveredClient.phone || hoveredClient.client_phone) ? 'scale(1.1)' : 'none',
                        },
                      }}
                    >
                      <Phone sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                  </Box>

                  {/* Contact details section */}
                  <Box
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.15)',
                      borderRadius: 2,
                      p: 1.5,
                      textAlign: 'left',
                    }}
                  >
                    {/* Phone number */}
                    {(hoveredClient.phone || hoveredClient.client_phone) && (
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.25 }}>
                          mobile
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>
                          {hoveredClient.phone || hoveredClient.client_phone}
                        </Typography>
                      </Box>
                    )}

                    {/* Email */}
                    {(hoveredClient.email || hoveredClient.client_email) && (
                      <Box>
                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.25 }}>
                          email
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: 'white', fontWeight: 500, wordBreak: 'break-all' }}>
                          {hoveredClient.email || hoveredClient.client_email}
                        </Typography>
                      </Box>
                    )}

                    {/* No contact info */}
                    {!(hoveredClient.email || hoveredClient.client_email) &&
                      !(hoveredClient.phone || hoveredClient.client_phone) && (
                        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center' }}>
                          No contact info
                        </Typography>
                      )}
                  </Box>

                  {/* Edit button */}
                  <Typography
                    sx={{
                      mt: 1.5,
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      '&:hover': { color: 'white' },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                  >
                    Click to edit
                  </Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
    );
  };

  // Calculate total for empty state check
  const totalCount = representationType === 'dual'
    ? buyers.length + sellers.length
    : representationType === 'buyer'
      ? buyers.length
      : sellers.length;

  // Empty state - no clients (grey circle with + icon)
  if (totalCount === 0) {
    return (
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #9ca3af, #9ca3afdd)',
          padding: '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.15) translateY(-2px)',
            boxShadow: '0 4px 12px rgba(156, 163, 175, 0.5)',
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
      >
        <Avatar
          sx={{
            width: '100%',
            height: '100%',
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: '#9ca3af',
            color: 'white',
            border: '1.5px solid white',
          }}
        >
          <Add sx={{ fontSize: 14 }} />
        </Avatar>
      </Box>
    );
  }

  // DUAL REPRESENTATION: Show both buyer and seller groups
  // Blue-bordered avatars for buyers, Orange-bordered for sellers
  // Max 6 total displayed, dynamically allocated between groups
  // Overflow shown as simple "+N" text at the end
  if (representationType === 'dual') {
    const hasBoth = buyers.length > 0 && sellers.length > 0;
    const maxTotal = 6;

    // Calculate how many to show from each group
    // Logic: Fill up to 6 total, giving each group up to 3 if both have 3+
    // If one group has fewer, give the extra slots to the other
    let maxBuyers, maxSellers;

    if (!hasBoth) {
      // Only one group - show up to 6
      maxBuyers = buyers.length > 0 ? maxTotal : 0;
      maxSellers = sellers.length > 0 ? maxTotal : 0;
    } else {
      // Both groups exist - allocate 6 total slots dynamically
      // Each group gets at least min(their count, 3), then remaining slots go to the larger group
      const buyerCount = buyers.length;
      const sellerCount = sellers.length;

      if (buyerCount <= 3 && sellerCount <= 3) {
        // Both fit within 3 each - show all
        maxBuyers = buyerCount;
        maxSellers = sellerCount;
      } else if (buyerCount <= 3) {
        // Buyers fit in 3 or less, sellers get remaining (up to 6 - buyerCount)
        maxBuyers = buyerCount;
        maxSellers = Math.min(sellerCount, maxTotal - buyerCount);
      } else if (sellerCount <= 3) {
        // Sellers fit in 3 or less, buyers get remaining (up to 6 - sellerCount)
        maxSellers = sellerCount;
        maxBuyers = Math.min(buyerCount, maxTotal - sellerCount);
      } else {
        // Both have 3+, split evenly at 3 each
        maxBuyers = 3;
        maxSellers = 3;
      }
    }

    // Calculate total overflow (combined from both groups)
    const totalOverflow = (buyers.length - maxBuyers) + (sellers.length - maxSellers);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {/* Buyers group (blue rings) */}
        {buyers.length > 0 && renderClientGroup(buyers, maxBuyers, 'buyer')}

        {/* Visual separator if both exist - thin line */}
        {hasBoth && (
          <Box sx={{ width: '1px', height: 18, bgcolor: 'divider', mx: 0.125, flexShrink: 0 }} />
        )}

        {/* Sellers group (orange rings) */}
        {sellers.length > 0 && renderClientGroup(sellers, maxSellers, 'seller')}

        {/* Combined overflow text at the end */}
        {renderOverflowText(totalOverflow)}

        {renderContactCard()}
      </Box>
    );
  }

  // SINGLE REPRESENTATION (buyer or seller only)
  const clientList = representationType === 'buyer' ? buyers : sellers;
  const role = representationType === 'buyer' ? 'buyer' : 'seller';
  const displayClients = clientList.slice(0, maxVisible);
  const overflowCount = clientList.length - maxVisible;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {displayClients.map((client, index) => renderClientAvatar(client, index, displayClients.length, role))}
      {renderOverflowText(overflowCount)}
      {renderContactCard()}
    </Box>
  );
};
