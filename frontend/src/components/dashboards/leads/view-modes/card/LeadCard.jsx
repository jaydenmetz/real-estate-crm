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
  LinearProgress,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import {
  PersonAdd,
  Phone,
  Email,
  LocationOn,
  Star,
  StarBorder,
  TrendingUp,
  Event,
  AttachMoney,
  Notes,
  ChevronLeft,
  ChevronRight,
  Close,
  Lock,
  Group,
  Business,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';

const LeadCard = React.memo(({ lead, viewMode = 'small', animationType = 'spring', animationDuration = 1, animationIntensity = 1, index = 0, onArchive, onDelete, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPanel, setCurrentPanel] = useState(0); // 0=small, 1=details, 2=activity, 3=notes

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // 1200px+

  // Panel widths
  const PANEL_WIDTHS = {
    small: 320,
    details: 380,
    activity: 240,
    notes: 240,
  };

  // Calculate visible panels based on viewport
  const getVisiblePanels = () => {
    if (isDesktop) return 4; // Show all panels
    if (isTablet) return 2; // Show 2 panels
    return 1; // Mobile: Show 1 panel
  };

  const visiblePanels = getVisiblePanels();
  const totalPanels = 4;
  const maxPanelIndex = totalPanels - visiblePanels;

  // Navigation handlers
  const goToNextPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.min(prev + 1, maxPanelIndex));
  }, [maxPanelIndex]);

  const goToPrevPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.max(prev - 1, 0));
  }, []);

  // Click handler
  const handleClick = useCallback(() => {
    navigate(`/leads/${lead.id}`);
  }, [lead.id, navigate]);

  // Status configuration for leads
  // Uses lowercase_snake_case keys: new, contacted, met, under_contract, closed, competing, rejected, unresponsive, deferred, unqualified
  const getStatusConfig = (status) => {
    const configs = {
      // Active category (3 statuses)
      'new': { label: 'NEW', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
      'contacted': { label: 'CONTACTED', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
      'met': { label: 'MET', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
      // Won category (2 statuses)
      'under_contract': { label: 'UNDER CONTRACT', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
      'closed': { label: 'CLOSED', color: '#06b6d4', bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
      // Lost category (5 statuses)
      'competing': { label: 'COMPETING', color: '#f97316', bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
      'rejected': { label: 'REJECTED', color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
      'unresponsive': { label: 'UNRESPONSIVE', color: '#94a3b8', bg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
      'deferred': { label: 'DEFERRED', color: '#a855f7', bg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' },
      'unqualified': { label: 'UNQUALIFIED', color: '#6b7280', bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' },
    };
    // Normalize status to lowercase for consistent lookup
    const normalized = status ? status.toLowerCase() : 'new';
    return configs[normalized] || configs['new'];
  };

  const statusConfig = getStatusConfig(lead.lead_status || lead.status);

  // Lead score calculation (0-100)
  const leadScore = lead.leadScore || 50;
  const isHotLead = leadScore >= 75;
  const isWarmLead = leadScore >= 50 && leadScore < 75;

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return null;
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'MMM d, yy');
    } catch (e) {
      return null;
    }
  };

  // Get time since created
  const getTimeSinceCreated = () => {
    if (!lead.created_at) return null;
    try {
      return formatDistanceToNow(new Date(lead.created_at), { addSuffix: true });
    } catch (e) {
      return null;
    }
  };

  // Get initials from name
  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'No Name';
  const initials = getInitials(lead.first_name, lead.last_name);
  const timeSinceCreated = getTimeSinceCreated();

  // Mock activity data (replace with actual data)
  const activities = [
    { type: 'call', date: lead.last_contactDate || lead.created_at, note: 'Initial contact' },
    { type: 'email', date: lead.created_at, note: 'Welcome email sent' },
    { type: 'note', date: lead.created_at, note: lead.notes?.substring(0, 30) || 'Lead created' },
  ].filter(a => a.date);

  // Mock notes data
  const notes = lead.notes ? [
    { date: lead.created_at, text: lead.notes, author: 'You' }
  ] : [];

  // Calculate which panels to show based on viewMode and viewport
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
      return [PANEL_WIDTHS.small, PANEL_WIDTHS.details, PANEL_WIDTHS.activity, PANEL_WIDTHS.notes];
    }
  };

  const visiblePanelWidths = getVisiblePanelWidths();
  const containerWidth = visiblePanelWidths.reduce((sum, width) => sum + width, 0);

  // Helper to check if a panel should be shown
  const showPanel = (panelIndex) => {
    if (!isDesktop) return true;
    if (viewMode === 'small') return panelIndex === 0;
    if (viewMode === 'medium') return panelIndex <= 1;
    return true;
  };

  // Calculate translate offset based on current panel
  const getTranslateX = () => {
    if (isDesktop) return 0;

    let offset = 0;
    const panelWidths = [
      PANEL_WIDTHS.small,
      PANEL_WIDTHS.details,
      PANEL_WIDTHS.activity,
      PANEL_WIDTHS.notes,
    ];

    for (let i = 0; i < currentPanel; i++) {
      offset += panelWidths[i];
    }

    return -offset;
  };

  return (
    <Box style={{ width: '100%', position: 'relative' }}>
      {/* Navigation Arrows - Only show on mobile/tablet */}
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
                '&:hover': {
                  background: theme.palette.background.paper,
                },
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
                '&:hover': {
                  background: theme.palette.background.paper,
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          )}
        </>
      )}

      {/* Panel Indicators - Only show on mobile */}
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
                '&:hover': {
                  transform: 'scale(1.3)',
                },
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
        {/* Card 1: Lead Card (Fixed 320px width) */}
        <Box
          sx={{
            width: '320px',
            minWidth: '320px',
            maxWidth: '320px',
            flexShrink: 0,
            display: 'flex',
          }}
        >
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
            {/* PANEL 1: Small Card Content */}
            <Box sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
              {/* Lead Avatar Section - 3:2 aspect ratio to match escrow */}
              <Box
                sx={{
                  aspectRatio: '3 / 2',
                  width: '100%',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
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
                {/* Large Person Icon */}
                <PersonAdd sx={{ fontSize: 120, color: alpha('#757575', 0.5), zIndex: 1 }} />

                {/* Status Chip - TOP LEFT */}
                <Chip
                  label={statusConfig.label}
                  size="small"
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
                  }}
                />

                {/* Lead Score Badge - TOP RIGHT */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: isHotLead
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : isWarmLead
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    border: '2px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {isHotLead ? <Star sx={{ fontSize: 14, color: 'white' }} /> : <StarBorder sx={{ fontSize: 14, color: 'white' }} />}
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>
                    {leadScore}
                  </Typography>
                </Box>

                {/* Hover Zone for Delete Button */}
                {(onArchive || onDelete || onRestore) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 50,
                      right: 0,
                      width: 80,
                      height: 80,
                      zIndex: 3,
                      '&:hover .delete-button': {
                        opacity: 1,
                      },
                    }}
                  >
                    <IconButton
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isArchived && onDelete) {
                          onDelete(lead.id);
                        } else if (isArchived && onRestore) {
                          onRestore(lead.id);
                        } else if (onArchive) {
                          onArchive(lead.id);
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

                {/* Progress Bar (Lead Score) */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex: 3,
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${leadScore}%`,
                      background: statusConfig.bg,
                      transition: 'width 0.5s ease-in-out',
                      boxShadow: `0 0 10px ${alpha(statusConfig.color, 0.6)}`,
                    }}
                  />
                </Box>

                {/* Lead Score Percentage */}
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'white',
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    zIndex: 4,
                  }}
                >
                  {leadScore}%
                </Typography>
              </Box>

              {/* Card Content */}
              <CardContent sx={{
                p: 1.25,
                '&:last-child': { pb: 1.25 },
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: theme.palette.text.primary,
                      lineHeight: 1.2,
                    }}
                  >
                    {fullName}
                  </Typography>
                  {lead.is_private ? (
                    <Chip
                      icon={<Lock />}
                      label="Private"
                      size="small"
                      color="error"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  ) : lead.access_level ? (
                    <Chip
                      icon={lead.access_level === 'team' ? <Group /> : <Business />}
                      label={lead.access_level === 'team' ? 'Team' : 'Broker'}
                      size="small"
                      color={lead.access_level === 'team' ? 'primary' : 'secondary'}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  ) : null}
                </Box>

                {/* Time Since Created */}
                {timeSinceCreated && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      color: theme.palette.text.secondary,
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Event sx={{ fontSize: 12 }} />
                    {timeSinceCreated}
                  </Typography>
                )}

                {/* Contact Info Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.75, mb: 1 }}>
                  {/* Phone */}
                  {lead.phone && (
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
                        border: `1px solid ${alpha('#10b981', 0.15)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.16) 100%)',
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Phone sx={{ fontSize: 14, color: '#059669' }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>
                        {formatPhone(lead.phone)}
                      </Typography>
                    </Box>
                  )}

                  {/* Email */}
                  {lead.email && (
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
                        border: `1px solid ${alpha('#6366f1', 0.15)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.16) 100%)',
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Email sx={{ fontSize: 14, color: '#4f46e5' }} />
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#6366f1',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {lead.email}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Source & Budget */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.75 }}>
                  {/* Source */}
                  {lead.source && (
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(147,51,234,0.12) 100%)',
                        border: `1px solid ${alpha('#a855f7', 0.15)}`,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#9333ea', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Source
                      </Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#a855f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.source}
                      </Typography>
                    </Box>
                  )}

                  {/* Budget */}
                  {lead.budget && (
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.12) 100%)',
                        border: `1px solid ${alpha('#f59e0b', 0.15)}`,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#d97706', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Budget
                      </Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>
                        ${(lead.budget / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Box>
          </Card>
        </Box>

        {/* Card 2: Expandable Panels Container - Only shown in medium/large mode */}
        {viewMode !== 'small' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1.5,
              flexGrow: 1,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1.5,
                transform: `translateX(${getTranslateX()}px)`,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* PANEL 2: Details (Medium & Large view) */}
              {(viewMode === 'medium' || viewMode === 'large') && showPanel(1) && (
                <Box
                  sx={{
                    width: `${PANEL_WIDTHS.details}px`,
                    minWidth: `${PANEL_WIDTHS.details}px`,
                    flexShrink: 0,
                    display: 'flex',
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      borderRadius: 4,
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.08)}`,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}>
                        Lead Details
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Preferences */}
                        {lead.propertyType && (
                          <Box>
                            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, display: 'block' }}>
                              Property Type
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: theme.palette.text.primary }}>
                              {lead.propertyType}
                            </Typography>
                          </Box>
                        )}

                        {/* Location */}
                        {(lead.city || lead.state || lead.zipCode) && (
                          <Box>
                            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, display: 'block' }}>
                              Location
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                              <Typography sx={{ fontSize: 12, color: theme.palette.text.primary }}>
                                {[lead.city, lead.state, lead.zipCode].filter(Boolean).join(', ')}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Timeline */}
                        {lead.timeline && (
                          <Box>
                            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, display: 'block' }}>
                              Timeline
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: theme.palette.text.primary }}>
                              {lead.timeline}
                            </Typography>
                          </Box>
                        )}

                        {/* Agent Assigned */}
                        {lead.assignedTo && (
                          <Box>
                            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, display: 'block' }}>
                              Assigned Agent
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                {getInitials(lead.assignedTo, '')}
                              </Avatar>
                              <Typography sx={{ fontSize: 12, color: theme.palette.text.primary }}>
                                {lead.assignedTo}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* PANEL 3: Activity (Large view only) */}
              {viewMode === 'large' && showPanel(2) && (
                <Box
                  sx={{
                    width: `${PANEL_WIDTHS.activity}px`,
                    minWidth: `${PANEL_WIDTHS.activity}px`,
                    flexShrink: 0,
                    display: 'flex',
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      borderRadius: 4,
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.08)}`,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}>
                        Recent Activity
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {activities.map((activity, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: alpha(statusConfig.color, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {activity.type === 'call' && <Phone sx={{ fontSize: 16, color: statusConfig.color }} />}
                              {activity.type === 'email' && <Email sx={{ fontSize: 16, color: statusConfig.color }} />}
                              {activity.type === 'note' && <Notes sx={{ fontSize: 16, color: statusConfig.color }} />}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontSize: 11, fontWeight: 600, color: theme.palette.text.primary }}>
                                {activity.note}
                              </Typography>
                              <Typography sx={{ fontSize: 10, color: theme.palette.text.secondary, mt: 0.25 }}>
                                {formatDate(activity.date)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* PANEL 4: Notes (Large view only) */}
              {viewMode === 'large' && showPanel(3) && (
                <Box
                  sx={{
                    width: `${PANEL_WIDTHS.notes}px`,
                    minWidth: `${PANEL_WIDTHS.notes}px`,
                    flexShrink: 0,
                    display: 'flex',
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      borderRadius: 4,
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.08)}`,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}>
                        Notes
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {notes.length > 0 ? notes.map((note, index) => (
                          <Box key={index}>
                            <Typography sx={{ fontSize: 11, color: theme.palette.text.primary, mb: 0.5, lineHeight: 1.4 }}>
                              {note.text}
                            </Typography>
                            <Typography sx={{ fontSize: 9, color: theme.palette.text.secondary }}>
                              by {note.author} • {formatDate(note.date)}
                            </Typography>
                          </Box>
                        )) : (
                          <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                            No notes yet
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
});

LeadCard.displayName = 'LeadCard';

export default LeadCard;
