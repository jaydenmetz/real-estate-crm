import React, { useState, useRef } from 'react';
import { Box, Avatar, Typography, Paper, Fade, Popper, Chip } from '@mui/material';
import { Add, Email, Phone, Person, PersonOutline } from '@mui/icons-material';

/**
 * Attendee type color configuration
 * Blue = Client, Green = Lead, Purple = Contact
 */
const ATTENDEE_COLORS = {
  client: {
    border: '#3b82f6',    // Blue
    bg: '#3b82f6',
    label: 'Client',
  },
  lead: {
    border: '#10b981',    // Green
    bg: '#10b981',
    label: 'Lead',
  },
  contact: {
    border: '#8b5cf6',    // Purple
    bg: '#8b5cf6',
    label: 'Contact',
  },
};

/**
 * AttendeeCircles Component
 * Displays attendee avatars/initials in a horizontal row for appointments
 * Shows up to maxVisible circles, then "+N" indicator for overflow
 * Hover reveals contact card with full details
 *
 * @param {Array} attendees - Array of attendee objects [{display_name, email, phone, attendee_type, is_primary}]
 * @param {function} onEdit - Callback to open EditAttendees modal
 * @param {number} maxVisible - Max circles to show before "+N" (default: 4)
 */
export const AttendeeCircles = ({
  attendees = [],
  onEdit,
  maxVisible = 4,
}) => {
  const [hoveredAttendee, setHoveredAttendee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const closeTimeoutRef = useRef(null);

  // Get initials from attendee name
  const getInitials = (attendee, index) => {
    if (!attendee?.display_name) return `A${index + 1}`;

    const parts = attendee.display_name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase() || `A${index + 1}`;
  };

  // Handle hover events with delayed close
  const handleMouseEnter = (event, attendee) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setAnchorEl(event.currentTarget);
    setHoveredAttendee(attendee);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredAttendee(null);
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
    setHoveredAttendee(null);
    setAnchorEl(null);
  };

  // Render a single attendee avatar
  const renderAttendeeAvatar = (attendee, index, totalInGroup) => {
    const initials = getInitials(attendee, index);
    const isHovered = hoveredAttendee?.id === attendee.id || hoveredAttendee === attendee;
    const attendeeType = attendee.attendee_type || 'contact';
    const typeConfig = ATTENDEE_COLORS[attendeeType] || ATTENDEE_COLORS.contact;

    return (
      <Box
        key={attendee.id || `attendee-${index}`}
        onMouseEnter={(e) => handleMouseEnter(e, attendee)}
        onMouseLeave={handleMouseLeave}
        sx={{
          position: 'relative',
          marginLeft: index === 0 ? 0 : '-14px',
          zIndex: isHovered ? 20 : totalInGroup - index,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Colored ring around avatar for type indication */}
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${typeConfig.border}, ${typeConfig.border}dd)`,
            padding: '2px',
            boxShadow: isHovered
              ? `0 4px 12px ${typeConfig.border}60`
              : `0 1px 3px rgba(0,0,0,0.12)`,
            transition: 'all 0.2s ease',
            transform: isHovered
              ? 'perspective(100px) rotateY(0deg) scale(1.15) translateY(-2px)'
              : 'perspective(100px) rotateY(12deg)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'perspective(100px) rotateY(0deg) scale(1.15) translateY(-2px)',
              boxShadow: `0 4px 12px ${typeConfig.border}60`,
              zIndex: 25,
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
              fontSize: '0.5rem',
              fontWeight: 700,
              bgcolor: typeConfig.bg,
              color: 'white',
              border: '1.5px solid white',
            }}
          >
            {initials}
          </Avatar>
        </Box>

        {/* Primary indicator - small star */}
        {attendee.is_primary && (
          <Box
            sx={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#fbbf24',
              border: '1.5px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.4rem',
            }}
          >
            ★
          </Box>
        )}
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
          fontSize: '0.65rem',
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

  // Get gradient colors based on attendee type
  const getGradientColors = (attendeeType) => {
    if (attendeeType === 'client') {
      return {
        from: 'rgba(59, 130, 246, 0.9)',
        to: 'rgba(37, 99, 235, 0.85)',
      };
    }
    if (attendeeType === 'lead') {
      return {
        from: 'rgba(16, 185, 129, 0.9)',
        to: 'rgba(5, 150, 105, 0.85)',
      };
    }
    return {
      from: 'rgba(139, 92, 246, 0.9)',
      to: 'rgba(109, 40, 217, 0.85)',
    };
  };

  // Render the contact card popper
  const renderContactCard = () => {
    if (!hoveredAttendee) return null;

    const attendeeType = hoveredAttendee.attendee_type || 'contact';
    const gradientColors = getGradientColors(attendeeType);
    const typeConfig = ATTENDEE_COLORS[attendeeType] || ATTENDEE_COLORS.contact;

    return (
      <Popper
        open={Boolean(hoveredAttendee && anchorEl)}
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
                width: 220,
                borderRadius: 3,
                overflow: 'hidden',
                background: `linear-gradient(160deg, ${gradientColors.from}, ${gradientColors.to})`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              }}
              onMouseEnter={handlePopupMouseEnter}
              onMouseLeave={handlePopupMouseLeave}
            >
              <Box sx={{ p: 2, textAlign: 'center' }}>
                {/* Avatar */}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 500,
                      color: 'white',
                      letterSpacing: '1px',
                    }}
                  >
                    {getInitials(hoveredAttendee, 0)}
                  </Typography>
                </Box>

                {/* Type badge + Primary indicator */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                  <Chip
                    label={typeConfig.label}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.6rem',
                      height: 18,
                      border: '1px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                  {hoveredAttendee.is_primary && (
                    <Chip
                      label="Primary"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(251, 191, 36, 0.3)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                        height: 18,
                        border: '1px solid rgba(251, 191, 36, 0.5)',
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  )}
                </Box>

                {/* Name */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    mb: 1.5,
                    fontSize: '1.1rem',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  {hoveredAttendee.display_name || 'Unknown'}
                </Typography>

                {/* Action buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1.5 }}>
                  <Box
                    component="a"
                    href={hoveredAttendee.email ? `mailto:${hoveredAttendee.email}` : undefined}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: hoveredAttendee.email ? 'pointer' : 'default',
                      opacity: hoveredAttendee.email ? 1 : 0.4,
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      '&:hover': {
                        bgcolor: hoveredAttendee.email ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                        transform: hoveredAttendee.email ? 'scale(1.1)' : 'none',
                      },
                    }}
                  >
                    <Email sx={{ fontSize: 18, color: 'white' }} />
                  </Box>

                  <Box
                    component="a"
                    href={hoveredAttendee.phone ? `tel:${hoveredAttendee.phone}` : undefined}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: hoveredAttendee.phone ? 'pointer' : 'default',
                      opacity: hoveredAttendee.phone ? 1 : 0.4,
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      '&:hover': {
                        bgcolor: hoveredAttendee.phone ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                        transform: hoveredAttendee.phone ? 'scale(1.1)' : 'none',
                      },
                    }}
                  >
                    <Phone sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                </Box>

                {/* Contact details */}
                <Box
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.15)',
                    borderRadius: 1.5,
                    p: 1,
                    textAlign: 'left',
                  }}
                >
                  {hoveredAttendee.phone && (
                    <Box sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        phone
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'white', fontWeight: 500 }}>
                        {hoveredAttendee.phone}
                      </Typography>
                    </Box>
                  )}

                  {hoveredAttendee.email && (
                    <Box>
                      <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        email
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'white', fontWeight: 500, wordBreak: 'break-all' }}>
                        {hoveredAttendee.email}
                      </Typography>
                    </Box>
                  )}

                  {!hoveredAttendee.email && !hoveredAttendee.phone && (
                    <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center' }}>
                      No contact info
                    </Typography>
                  )}
                </Box>

                {/* Edit link */}
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: '0.7rem',
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

  // Empty state - no attendees
  if (!attendees || attendees.length === 0) {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
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
            fontSize: '0.6rem',
            fontWeight: 700,
            bgcolor: '#9ca3af',
            color: 'white',
            border: '1.5px solid white',
          }}
        >
          <Add sx={{ fontSize: 12 }} />
        </Avatar>
      </Box>
    );
  }

  const displayAttendees = attendees.slice(0, maxVisible);
  const overflowCount = attendees.length - maxVisible;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {displayAttendees.map((attendee, index) =>
        renderAttendeeAvatar(attendee, index, displayAttendees.length)
      )}
      {renderOverflowText(overflowCount)}
      {renderContactCard()}
    </Box>
  );
};

export default AttendeeCircles;
