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
  PersonOutline,
  Email,
  Phone,
  Home,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  RadioButtonUnchecked,
  ChevronLeft,
  ChevronRight,
  Close,
  AttachMoney,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Status configuration for client stages
const getStatusConfig = (stage) => {
  const configs = {
    'New': { label: 'New', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    'Qualified': { label: 'Qualified', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    'Showing': { label: 'Showing', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    'Offer': { label: 'Offer', color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
    'Contract': { label: 'Contract', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    'Closed': { label: 'Closed', color: '#059669', bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
  };
  return configs[stage] || configs['New'];
};

const ClientCard = React.memo(({ client, viewMode = 'small', index = 0, onArchive, onDelete, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentPanel, setCurrentPanel] = useState(0);

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Navigation handlers
  const goToNextPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.min(prev + 1, 2));
  }, []);

  const goToPrevPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.max(prev - 1, 0));
  }, []);

  // Click handler
  const handleClick = useCallback(() => {
    navigate(`/clients/${client.id}`);
  }, [client.id, navigate]);

  // Status configuration
  const statusConfig = getStatusConfig(client.stage || 'New');

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0';
    return `$${Math.round(value / 1000)}k`;
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

  // Get initials
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName[0] : '';
    const last = lastName ? lastName[0] : '';
    return (first + last).toUpperCase() || '?';
  };

  // Client details
  const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim();
  const initials = getInitials(client.first_name, client.last_name);

  // Mock activity timeline
  const timeline = [
    { label: 'Initial Contact', date: client.created_at, completed: true },
    { label: 'Qualified', date: client.qualifiedDate, completed: client.stage !== 'New' },
    { label: 'Showing Properties', date: client.showingDate, completed: ['Showing', 'Offer', 'Contract', 'Closed'].includes(client.stage) },
    { label: 'Offer Submitted', date: client.offerDate, completed: ['Offer', 'Contract', 'Closed'].includes(client.stage) },
  ];

  // Mock activity/communication log
  const activityLog = [
    { type: 'call', date: client.last_contactDate, description: 'Phone consultation' },
    { type: 'email', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Sent listings' },
    { type: 'meeting', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), description: 'Property showing' },
    { type: 'note', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), description: 'Updated preferences' },
  ];

  // Calculate engagement score (mock)
  const engagementScore = client.activeEscrows ? 100 : (client.closedTransactions || 0) * 20 + (client.stage === 'Closed' ? 100 : 60);

  return (
    <Box style={{ width: '100%', position: 'relative' }}>
      {/* Navigation Arrows - Mobile/Tablet */}
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
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}

          {currentPanel < 2 && viewMode !== 'small' && (
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
              }}
            >
              <ChevronRight />
            </IconButton>
          )}
        </>
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
        {/* Card 1: Client Card (Fixed 320px width) */}
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
            {/* Avatar Section with Grey Background */}
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
              {/* Large Avatar Icon */}
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  background: statusConfig.bg,
                  fontSize: '3rem',
                  fontWeight: 700,
                  zIndex: 2,
                  border: `4px solid rgba(255,255,255,0.9)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {initials}
              </Avatar>

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

              {/* Delete Button - TOP RIGHT */}
              {(onArchive || onDelete || onRestore) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
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
                        onDelete(client.id);
                      } else if (isArchived && onRestore) {
                        onRestore(client.id);
                      } else if (onArchive) {
                        onArchive(client.id);
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
                      },
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}

              {/* Engagement Progress Bar */}
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
                    width: `${engagementScore}%`,
                    background: statusConfig.bg,
                    transition: 'width 0.5s ease-in-out',
                    boxShadow: `0 0 10px ${alpha(statusConfig.color, 0.6)}`,
                  }}
                />
              </Box>

              {/* Engagement Score */}
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
                {engagementScore}%
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
              {/* Client Name */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  mb: 0.5,
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                }}
              >
                {fullName}
              </Typography>

              {/* Client Type Chip */}
              <Chip
                label={client.clientType || 'Client'}
                size="small"
                sx={{
                  mb: 1,
                  width: 'fit-content',
                  fontSize: 10,
                  fontWeight: 600,
                  background: alpha(statusConfig.color, 0.1),
                  color: statusConfig.color,
                }}
              />

              {/* Contact Info Grid */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1 }}>
                {client.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                    <Typography variant="caption" sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                      {client.email}
                    </Typography>
                  </Box>
                )}
                {client.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                    <Typography variant="caption" sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                      {client.phone}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Metrics Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1 }}>
                {/* Budget Range */}
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
                    border: `1px solid ${alpha('#10b981', 0.15)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#059669', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Budget
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#10b981', letterSpacing: '-0.5px' }}>
                    {formatCurrency(client.priceRangeMin)}-{formatCurrency(client.priceRangeMax)}
                  </Typography>
                </Box>

                {/* Transaction Volume */}
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
                    border: `1px solid ${alpha('#6366f1', 0.15)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#4f46e5', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Volume
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#6366f1', letterSpacing: '-0.5px' }}>
                    {formatCurrency(client.totalVolume || 0)}
                  </Typography>
                </Box>
              </Box>

              {/* Footer - Last Contact & Next Follow-up */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 'auto',
                  pt: 1,
                  px: 0.5,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, pl: 0.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 0.25 }}>
                      Last
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: theme.palette.text.primary }}>
                      {formatDate(client.last_contactDate) || 'Never'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 0.25 }}>
                      Next
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: theme.palette.text.primary }}>
                      {formatDate(client.next_follow_upDate) || 'TBD'}
                    </Typography>
                  </Box>
                </Box>

                {/* Active Escrows Badge */}
                {client.activeEscrows > 0 && (
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 1.5, py: 0.75, borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.15) 100%)',
                    border: `1px solid ${alpha('#10b981', 0.2)}`,
                  }}>
                    <Home sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#10b981' }}>
                      {client.activeEscrows}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Card 2: Extension Panels (Only show in medium/large view) */}
        {viewMode !== 'small' && (
          <Box
            style={{
              width: 'calc(100% - 332px)',
              flexShrink: 0,
              display: 'flex',
              opacity: 1,
            }}
          >
            <Card
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.12)}, 0 2px 8px ${alpha(statusConfig.color, 0.08)}`,
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {/* PANEL 1: Preferences (large view only) */}
              {viewMode === 'large' && (
                <Box
                  sx={{
                    width: 'calc(33.33% - 1px)',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.02) 0%, rgba(139,92,246,0.03) 100%)',
                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 3, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Preferences
                  </Typography>

                  {/* Budget */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <AttachMoney sx={{ fontSize: 20, color: '#10b981' }} />
                      <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Budget Range
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary, pl: 4.5 }}>
                      {formatCurrency(client.priceRangeMin)} - {formatCurrency(client.priceRangeMax)}
                    </Typography>
                  </Box>

                  {/* Locations */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 20, color: '#3b82f6' }} />
                      <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Preferred Areas
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 4.5 }}>
                      {(client.preferredLocations || []).map((loc, idx) => (
                        <Chip
                          key={idx}
                          label={loc}
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 20,
                            background: alpha('#3b82f6', 0.1),
                            color: '#3b82f6',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Property Type */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Home sx={{ fontSize: 20, color: '#8b5cf6' }} />
                      <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Property Types
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 4.5 }}>
                      {(client.propertyTypes || []).map((type, idx) => (
                        <Chip
                          key={idx}
                          label={type}
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 20,
                            background: alpha('#8b5cf6', 0.1),
                            color: '#8b5cf6',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Bedrooms/Bathrooms */}
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, display: 'block' }}>
                      Requirements
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, pl: 0 }}>
                      {client.bedrooms || 0} bed • {client.bathrooms || 0} bath
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* PANEL 2: Timeline (Only in large view) */}
              {viewMode === 'large' && (
                <Box
                  sx={{
                    width: 'calc(33.33% - 1px)',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.02) 0%, rgba(168,85,247,0.03) 100%)',
                    borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 3, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Timeline
                  </Typography>

                  {timeline.map((milestone, idx) => (
                    <Box
                      key={milestone.label}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        mb: 3,
                        position: 'relative',
                        '&::after': idx < timeline.length - 1 ? {
                          content: '""',
                          position: 'absolute',
                          left: 11,
                          top: 28,
                          bottom: -24,
                          width: 2,
                          background: milestone.completed
                            ? 'linear-gradient(to bottom, #10b981, #059669)'
                            : alpha(theme.palette.divider, 0.2),
                        } : {},
                      }}
                    >
                      {milestone.completed ? (
                        <CheckCircle sx={{ fontSize: 24, color: '#10b981', flexShrink: 0 }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ fontSize: 24, color: alpha(theme.palette.text.disabled, 0.3), flexShrink: 0 }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: milestone.completed ? theme.palette.text.primary : theme.palette.text.secondary }}>
                          {milestone.label}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                          {milestone.date ? formatDate(milestone.date) : 'Pending'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* PANEL 3: Activity Log (Only in large view) */}
              {viewMode === 'large' && (
                <Box
                  sx={{
                    width: 'calc(33.34%)',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.02) 0%, rgba(217,70,239,0.03) 100%)',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 3, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Recent Activity
                  </Typography>

                  {activityLog.map((activity, idx) => (
                    <Box key={idx} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary }}>
                          {activity.description}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 500, color: theme.palette.text.secondary }}>
                        {formatDate(activity.date)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
});

ClientCard.displayName = 'ClientCard';

export default ClientCard;
