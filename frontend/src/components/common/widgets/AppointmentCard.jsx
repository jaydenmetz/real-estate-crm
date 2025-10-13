import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  Phone,
  VideoCall,
  Person,
  CheckCircle,
  Cancel,
  Notes,
  ChevronLeft,
  ChevronRight,
  Close,
  EventAvailable,
  EventBusy,
  Pending,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistance, isPast, isFuture, isToday, isTomorrow } from 'date-fns';

const AppointmentCard = React.memo(({ appointment, viewMode = 'small', index = 0, onArchive, onDelete, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPanel, setCurrentPanel] = useState(0); // 0=small, 1=details, 2=attendees, 3=notes

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Panel widths
  const PANEL_WIDTHS = {
    small: 320,
    details: 380,
    attendees: 240,
    notes: 240,
  };

  // Calculate visible panels
  const getVisiblePanels = () => {
    if (isDesktop) return 4;
    if (isTablet) return 2;
    return 1;
  };

  const visiblePanels = getVisiblePanels();
  const totalPanels = 4;
  const maxPanelIndex = totalPanels - visiblePanels;

  // Memoized navigation handlers
  const goToNextPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.min(prev + 1, maxPanelIndex));
  }, [maxPanelIndex]);

  const goToPrevPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.max(prev - 1, 0));
  }, []);

  // Memoized click handler
  const handleClick = useCallback(() => {
    navigate(`/appointments/${appointment.id}`);
  }, [appointment.id, navigate]);

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      'Scheduled': { label: 'Scheduled', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: <EventAvailable /> },
      'Confirmed': { label: 'Confirmed', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: <CheckCircle /> },
      'Pending': { label: 'Pending', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: <Pending /> },
      'Completed': { label: 'Completed', color: '#6b7280', bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', icon: <CheckCircle /> },
      'Cancelled': { label: 'Cancelled', color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: <EventBusy /> },
      'No Show': { label: 'No Show', color: '#991b1b', bg: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)', icon: <Cancel /> },
    };
    return configs[status] || configs['Scheduled'];
  };

  const statusConfig = getStatusConfig(appointment.status);

  // Format date and time
  const formatDateTime = (date) => {
    if (!date) return { date: 'TBD', time: 'TBD' };
    try {
      const d = new Date(date);
      if (d && !isNaN(d.getTime())) {
        return {
          date: format(d, 'MMM d, yyyy'),
          time: format(d, 'h:mm a'),
          dayOfWeek: format(d, 'EEEE'),
        };
      }
    } catch (e) {}
    return { date: 'TBD', time: 'TBD' };
  };

  const { date: appointmentDate, time: appointmentTime, dayOfWeek } = formatDateTime(appointment.appointmentDate || appointment.appointment_date || appointment.date);

  // Get relative time
  const getRelativeTime = () => {
    const dateField = appointment.appointmentDate || appointment.appointment_date || appointment.date;
    if (!dateField) return 'Date TBD';
    try {
      const d = new Date(dateField);
      if (isToday(d)) return 'Today';
      if (isTomorrow(d)) return 'Tomorrow';
      if (isPast(d)) return formatDistance(d, new Date(), { addSuffix: true });
      if (isFuture(d)) return formatDistance(d, new Date(), { addSuffix: true });
    } catch (e) {}
    return '';
  };

  const relativeTime = getRelativeTime();
  const dateField = appointment.appointmentDate || appointment.appointment_date || appointment.date;
  const appointmentIsPast = dateField ? isPast(new Date(dateField)) : false;
  const appointmentIsToday = dateField ? isToday(new Date(dateField)) : false;
  const appointmentIsSoon = dateField ? (new Date(dateField) - new Date()) / (1000 * 60 * 60) < 24 : false; // < 24 hours

  // Get appointment type icon
  const getTypeIcon = () => {
    const type = (appointment.appointmentType || appointment.appointment_type || appointment.type || 'In-Person').toLowerCase();
    if (type.includes('video') || type.includes('zoom') || type.includes('virtual')) {
      return <VideoCall sx={{ fontSize: 80, color: alpha('#3b82f6', 0.5), zIndex: 1 }} />;
    }
    if (type.includes('phone') || type.includes('call')) {
      return <Phone sx={{ fontSize: 80, color: alpha('#10b981', 0.5), zIndex: 1 }} />;
    }
    return <CalendarToday sx={{ fontSize: 80, color: alpha('#757575', 0.5), zIndex: 1 }} />;
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mock attendees
  const attendees = [
    { name: appointment.clientName || 'Client Name', type: 'Client', email: appointment.clientEmail },
    { name: appointment.agentName || 'Agent Name', type: 'Agent', email: appointment.agentEmail },
  ].filter(a => a.name !== 'Client Name' && a.name !== 'Agent Name');

  // Mock appointment details
  const details = {
    location: appointment.location || 'Location TBD',
    type: appointment.appointmentType || appointment.appointment_type || appointment.type || 'In-Person',
    duration: appointment.duration || '30 min',
    purpose: appointment.title || appointment.purpose || appointment.description || appointment.notes || 'Consultation',
  };

  // Mock notes timeline
  const notesTimeline = [
    { date: appointment.createdAt, note: 'Appointment scheduled', author: appointment.agentName || 'Agent' },
    appointment.confirmedAt ? { date: appointment.confirmedAt, note: 'Confirmed by client', author: 'System' } : null,
    appointment.notes ? { date: appointment.updatedAt || appointment.createdAt, note: appointment.notes, author: appointment.agentName || 'Agent' } : null,
  ].filter(Boolean);

  // Calculate which panels to show
  const getVisiblePanelWidths = () => {
    if (!isDesktop) {
      if (isMobile) return [PANEL_WIDTHS.small];
      if (isTablet) return [PANEL_WIDTHS.small, PANEL_WIDTHS.details];
    }

    if (viewMode === 'small') {
      return [PANEL_WIDTHS.small];
    } else if (viewMode === 'medium') {
      return [PANEL_WIDTHS.small, PANEL_WIDTHS.details];
    } else {
      return [PANEL_WIDTHS.small, PANEL_WIDTHS.details, PANEL_WIDTHS.attendees, PANEL_WIDTHS.notes];
    }
  };

  const visiblePanelWidths = getVisiblePanelWidths();

  // Helper to check if panel should be shown
  const showPanel = (panelIndex) => {
    if (!isDesktop) return true;
    if (viewMode === 'small') return panelIndex === 0;
    if (viewMode === 'medium') return panelIndex <= 1;
    return true;
  };

  return (
    <Box style={{ width: '100%', position: 'relative' }}>
      {/* Navigation Arrows - Mobile/Tablet only */}
      {!isDesktop && (
        <>
          {currentPanel > 0 && (
            <IconButton
              onClick={goToPrevPanel}
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: alpha(theme.palette.background.paper, 0.9),
                boxShadow: 3,
                '&:hover': { background: theme.palette.background.paper },
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}

          {currentPanel < maxPanelIndex && (
            <IconButton
              onClick={goToNextPanel}
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                background: alpha(theme.palette.background.paper, 0.9),
                boxShadow: 3,
                '&:hover': { background: theme.palette.background.paper },
              }}
            >
              <ChevronRight />
            </IconButton>
          )}
        </>
      )}

      {/* Panel Indicators - Mobile only */}
      {isMobile && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 10,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              onClick={() => setCurrentPanel(Math.min(i, maxPanelIndex))}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === currentPanel ? statusConfig.color : alpha(theme.palette.text.disabled, 0.3),
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.3)' },
              }}
            />
          ))}
        </Box>
      )}

      {/* Card Container */}
      <Box sx={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: 1.5,
        alignItems: 'stretch',
      }}>
        {/* PANEL 1: Small Card (320px) */}
        {showPanel(0) && (
          <Box sx={{ width: '320px', minWidth: '320px', maxWidth: '320px', flexShrink: 0, display: 'flex' }}>
            <Card
              onClick={handleClick}
              sx={{
                width: '100%',
                cursor: 'pointer',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -1,
                  borderRadius: 4,
                  padding: '1px',
                  background: `linear-gradient(135deg, ${alpha(statusConfig.color, 0.2)}, ${alpha(statusConfig.color, 0.05)}, transparent)`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none',
                },
                boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.12)}, 0 2px 8px ${alpha(statusConfig.color, 0.08)}`,
                '&:hover': {
                  boxShadow: `0 12px 48px ${alpha(statusConfig.color, 0.2)}, 0 4px 12px ${alpha(statusConfig.color, 0.15)}`,
                  transform: 'translateY(-2px)',
                },
                transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Appointment Visual Header with grey gradient */}
              <Box
                sx={{
                  aspectRatio: '3 / 2',
                  width: '100%',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                  },
                }}
              >
                {/* Large appointment type icon */}
                {getTypeIcon()}

                {/* Status Chip - TOP LEFT */}
                <Chip
                  label={statusConfig.label}
                  size="small"
                  icon={React.cloneElement(statusConfig.icon, { sx: { fontSize: 16, color: 'white !important' } })}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    background: statusConfig.bg,
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 3,
                    '& .MuiChip-label': { px: 1.5, py: 0.5 },
                    '& .MuiChip-icon': { ml: 0.5 },
                  }}
                />

                {/* Today/Soon Badge */}
                {appointmentIsToday && (
                  <Chip
                    label="TODAY"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontWeight: 700,
                      fontSize: 10,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                      },
                      zIndex: 3,
                    }}
                  />
                )}

                {appointmentIsSoon && !appointmentIsToday && (
                  <Chip
                    label="SOON"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontWeight: 700,
                      fontSize: 10,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      zIndex: 3,
                    }}
                  />
                )}

                {/* Relative Time - BOTTOM LEFT */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  <AccessTime sx={{ fontSize: 14, color: 'white' }} />
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    {relativeTime}
                  </Typography>
                </Box>

                {/* Delete/Archive Button - TOP RIGHT */}
                {(onArchive || onDelete || onRestore) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      zIndex: 3,
                      '&:hover .delete-button': { opacity: 1 },
                    }}
                  >
                    <IconButton
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isArchived && onDelete) {
                          onDelete(appointment.id);
                        } else if (isArchived && onRestore) {
                          onRestore(appointment.id);
                        } else if (onArchive) {
                          onArchive(appointment.id);
                        }
                      }}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        opacity: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        width: 28,
                        height: 28,
                        backdropFilter: 'blur(8px)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          color: 'rgba(255, 255, 255, 0.95)',
                          transform: 'scale(1.15)',
                        },
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Card Content */}
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Appointment Title/Purpose */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.3,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {details.purpose}
                </Typography>

                {/* Date and Time */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                      {appointmentDate}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      ({dayOfWeek})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                      {appointmentTime}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      ({details.duration})
                    </Typography>
                  </Box>
                </Box>

                {/* Location/Type */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ fontSize: 13, color: theme.palette.text.secondary }}>
                    {details.location}
                  </Typography>
                </Box>

                {/* Appointment Type Chip */}
                <Chip
                  label={details.type}
                  size="small"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: alpha(statusConfig.color, 0.1),
                    color: statusConfig.color,
                    mb: 1.5,
                  }}
                />

                {/* Client/Agent Info */}
                {attendees.length > 0 && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {attendees.slice(0, 2).map((attendee, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: 11,
                              fontWeight: 700,
                              background: statusConfig.bg,
                            }}
                          >
                            {getInitials(attendee.name)}
                          </Avatar>
                          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600 }}>
                            {attendee.name}
                          </Typography>
                          {idx < attendees.length - 1 && (
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mx: 0.5 }}>
                              •
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* PANEL 2: Appointment Details (380px) */}
        {showPanel(1) && viewMode !== 'small' && (
          <Card
            sx={{
              width: PANEL_WIDTHS.details,
              minWidth: PANEL_WIDTHS.details,
              borderRadius: 4,
              boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              {/* Header */}
              <Box sx={{ p: 2, background: alpha(statusConfig.color, 0.05), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusConfig.color }}>
                  Appointment Details
                </Typography>
              </Box>

              {/* Details List */}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <DetailRow label="Date" value={appointmentDate} icon={<CalendarToday sx={{ fontSize: 16 }} />} />
                  <DetailRow label="Time" value={appointmentTime} icon={<AccessTime sx={{ fontSize: 16 }} />} />
                  <DetailRow label="Duration" value={details.duration} />
                  <DetailRow label="Type" value={details.type} />
                  <Divider sx={{ my: 1 }} />
                  <DetailRow label="Location" value={details.location} icon={<LocationOn sx={{ fontSize: 16 }} />} />
                  <DetailRow label="Purpose" value={details.purpose} />
                  {appointment.clientName && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <DetailRow label="Client" value={appointment.clientName} icon={<Person sx={{ fontSize: 16 }} />} />
                    </>
                  )}
                  {appointment.agentName && (
                    <DetailRow label="Agent" value={appointment.agentName} icon={<Person sx={{ fontSize: 16 }} />} />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* PANEL 3: Attendees (240px) */}
        {showPanel(2) && viewMode === 'large' && (
          <Card
            sx={{
              width: PANEL_WIDTHS.attendees,
              minWidth: PANEL_WIDTHS.attendees,
              borderRadius: 4,
              boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              {/* Header */}
              <Box sx={{ p: 2, background: alpha(statusConfig.color, 0.05), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusConfig.color }}>
                  Attendees
                </Typography>
              </Box>

              {/* Attendees List */}
              <Box sx={{ p: 2 }}>
                {attendees.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {attendees.map((attendee, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: 14,
                            fontWeight: 700,
                            background: statusConfig.bg,
                          }}
                        >
                          {getInitials(attendee.name)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                            {attendee.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 11 }}>
                            {attendee.type}
                          </Typography>
                          {attendee.email && (
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 10, display: 'block' }}>
                              {attendee.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                    No attendees
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* PANEL 4: Notes Timeline (240px) */}
        {showPanel(3) && viewMode === 'large' && (
          <Card
            sx={{
              width: PANEL_WIDTHS.notes,
              minWidth: PANEL_WIDTHS.notes,
              borderRadius: 4,
              boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              {/* Header */}
              <Box sx={{ p: 2, background: alpha(statusConfig.color, 0.05), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusConfig.color }}>
                  Notes
                </Typography>
              </Box>

              {/* Notes Timeline */}
              <Box sx={{ p: 2 }}>
                {notesTimeline.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {notesTimeline.map((note, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: alpha(statusConfig.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: statusConfig.color,
                          }}
                        >
                          <Notes sx={{ fontSize: 16 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontSize: 12, lineHeight: 1.4, mb: 0.5 }}>
                            {note.note}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 10 }}>
                            {note.author} • {format(new Date(note.date), 'MMM d')}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                    No notes yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
});

// Helper component for detail rows
const DetailRow = ({ label, value, valueColor, icon }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon && <Box sx={{ color: theme.palette.text.secondary }}>{icon}</Box>}
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, color: valueColor || theme.palette.text.primary, textAlign: 'right' }}>
        {value}
      </Typography>
    </Box>
  );
};

export default AppointmentCard;
