import React, { useState, useRef } from 'react';
import { Box, Avatar, Typography, Paper, Fade, Popper, Chip } from '@mui/material';
import { Add, Email, Phone } from '@mui/icons-material';

/**
 * Lead status color configuration
 * Different colors for different lead statuses/temperatures
 */
const LEAD_COLORS = {
  hot: {
    border: '#ef4444',    // Red - hot leads
    bg: '#ef4444',
    label: 'Hot',
  },
  warm: {
    border: '#f59e0b',    // Amber - warm leads
    bg: '#f59e0b',
    label: 'Warm',
  },
  cold: {
    border: '#3b82f6',    // Blue - cold leads
    bg: '#3b82f6',
    label: 'Cold',
  },
  new: {
    border: '#10b981',    // Green - new leads
    bg: '#10b981',
    label: 'New',
  },
  default: {
    border: '#8b5cf6',    // Purple - default
    bg: '#8b5cf6',
    label: 'Lead',
  },
};

/**
 * LeadCircles Component
 * Displays lead avatars/initials in a horizontal row
 * Shows up to maxVisible circles, then "+N" indicator for overflow
 * Hover reveals contact card with full details
 *
 * Visual differentiation by lead temperature:
 * - Hot: Red border/ring
 * - Warm: Amber border/ring
 * - Cold: Blue border/ring
 * - New: Green border/ring
 *
 * @param {Array} leads - Array of lead objects
 * @param {function} onEdit - Callback to open EditLeads modal
 * @param {number} maxVisible - Max circles to show before "+N" (default: 6)
 */
export const LeadCircles = ({
  leads = [],
  onEdit,
  maxVisible = 6,
}) => {
  const [hoveredLead, setHoveredLead] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const closeTimeoutRef = useRef(null);

  // Get initials from lead name or generate L1, L2 style
  const getInitials = (lead, index) => {
    if (!lead) return `L${index + 1}`;

    const firstName = lead.first_name || lead.firstName || '';
    const lastName = lead.last_name || lead.lastName || '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    if (firstInitial || lastInitial) {
      return `${firstInitial}${lastInitial}`.trim() || `L${index + 1}`;
    }
    return `L${index + 1}`;
  };

  // Get full name for tooltip
  const getFullName = (lead) => {
    if (!lead) return 'Unknown Lead';

    const firstName = lead.first_name || lead.firstName || '';
    const lastName = lead.last_name || lead.lastName || '';

    return `${firstName} ${lastName}`.trim() || 'Unknown Lead';
  };

  // Get lead temperature/status color
  const getLeadColor = (lead) => {
    const temperature = lead?.temperature?.toLowerCase() || lead?.status?.toLowerCase() || 'default';
    return LEAD_COLORS[temperature] || LEAD_COLORS.default;
  };

  // Handle hover events with delayed close
  const handleMouseEnter = (event, lead) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setAnchorEl(event.currentTarget);
    setHoveredLead(lead);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredLead(null);
      setAnchorEl(null);
    }, 150);
  };

  const handlePopupMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    setHoveredLead(null);
    setAnchorEl(null);
  };

  // Render a single lead avatar
  const renderLeadAvatar = (lead, index, total) => {
    const avatarUrl = lead.avatar_url || lead.avatarUrl;
    const initials = getInitials(lead, index);
    const isHovered = hoveredLead?.id === lead.id || hoveredLead === lead;
    const colorConfig = getLeadColor(lead);

    return (
      <Box
        key={lead.id || `lead-${index}`}
        onMouseEnter={(e) => handleMouseEnter(e, lead)}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: 'relative',
          marginLeft: index === 0 ? 0 : '-16px',
          zIndex: isHovered ? 20 : total - index,
          transition: 'all 0.2s ease',
        }}
      >
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colorConfig.border}, ${colorConfig.border}dd)`,
            padding: '2px',
            boxShadow: isHovered
              ? `0 4px 12px ${colorConfig.border}60`
              : `0 1px 3px rgba(0,0,0,0.12)`,
            transition: 'all 0.2s ease',
            transform: isHovered
              ? 'perspective(100px) rotateY(0deg) scale(1.15) translateY(-2px)'
              : 'perspective(100px) rotateY(12deg)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'perspective(100px) rotateY(0deg) scale(1.15) translateY(-2px)',
              boxShadow: `0 4px 12px ${colorConfig.border}60`,
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
            alt={getFullName(lead)}
            sx={{
              width: '100%',
              height: '100%',
              fontSize: '0.55rem',
              fontWeight: 700,
              bgcolor: avatarUrl ? 'white' : colorConfig.bg,
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

  // Render overflow text
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
          flexShrink: 0,
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

  // Get gradient colors based on lead temperature
  const getGradientColors = (lead) => {
    const colorConfig = getLeadColor(lead);
    return {
      from: `${colorConfig.bg}e6`,
      to: `${colorConfig.bg}d9`,
    };
  };

  // Render the contact card popper
  const renderContactCard = () => {
    if (!hoveredLead) return null;

    const gradientColors = getGradientColors(hoveredLead);
    const colorConfig = getLeadColor(hoveredLead);

    return (
      <Popper
        open={Boolean(hoveredLead && anchorEl)}
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
              onMouseEnter={handlePopupMouseEnter}
              onMouseLeave={handlePopupMouseLeave}
            >
              <Box sx={{ p: 2.5, textAlign: 'center' }}>
                {/* Large Avatar */}
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
                    {getInitials(hoveredLead, 0)}
                  </Typography>
                </Box>

                {/* Temperature badge */}
                <Chip
                  label={colorConfig.label}
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

                {/* Lead Name */}
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
                  {getFullName(hoveredLead)}
                </Typography>

                {/* Action buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box
                    component="a"
                    href={(hoveredLead.email || hoveredLead.lead_email) ? `mailto:${hoveredLead.email || hoveredLead.lead_email}` : undefined}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (hoveredLead.email || hoveredLead.lead_email) ? 'pointer' : 'default',
                      opacity: (hoveredLead.email || hoveredLead.lead_email) ? 1 : 0.4,
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      '&:hover': {
                        bgcolor: (hoveredLead.email || hoveredLead.lead_email) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                        transform: (hoveredLead.email || hoveredLead.lead_email) ? 'scale(1.1)' : 'none',
                      },
                    }}
                  >
                    <Email sx={{ fontSize: 20, color: 'white' }} />
                  </Box>

                  <Box
                    component="a"
                    href={(hoveredLead.phone || hoveredLead.lead_phone) ? `tel:${hoveredLead.phone || hoveredLead.lead_phone}` : undefined}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (hoveredLead.phone || hoveredLead.lead_phone) ? 'pointer' : 'default',
                      opacity: (hoveredLead.phone || hoveredLead.lead_phone) ? 1 : 0.4,
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      '&:hover': {
                        bgcolor: (hoveredLead.phone || hoveredLead.lead_phone) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                        transform: (hoveredLead.phone || hoveredLead.lead_phone) ? 'scale(1.1)' : 'none',
                      },
                    }}
                  >
                    <Phone sx={{ fontSize: 20, color: 'white' }} />
                  </Box>
                </Box>

                {/* Contact details */}
                <Box
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.15)',
                    borderRadius: 2,
                    p: 1.5,
                    textAlign: 'left',
                  }}
                >
                  {(hoveredLead.phone || hoveredLead.lead_phone) && (
                    <Box sx={{ mb: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.25 }}>
                        mobile
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>
                        {hoveredLead.phone || hoveredLead.lead_phone}
                      </Typography>
                    </Box>
                  )}

                  {(hoveredLead.email || hoveredLead.lead_email) && (
                    <Box>
                      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.25 }}>
                        email
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'white', fontWeight: 500, wordBreak: 'break-all' }}>
                        {hoveredLead.email || hoveredLead.lead_email}
                      </Typography>
                    </Box>
                  )}

                  {!(hoveredLead.email || hoveredLead.lead_email) &&
                    !(hoveredLead.phone || hoveredLead.lead_phone) && (
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
            </Paper>
          </Fade>
        )}
      </Popper>
    );
  };

  // Empty state
  if (leads.length === 0) {
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

  // Normal render
  const displayLeads = leads.slice(0, maxVisible);
  const overflowCount = leads.length - maxVisible;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {displayLeads.map((lead, index) => renderLeadAvatar(lead, index, displayLeads.length))}
      {renderOverflowText(overflowCount)}
      {renderContactCard()}
    </Box>
  );
};
