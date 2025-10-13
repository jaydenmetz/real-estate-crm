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
  Divider,
} from '@mui/material';
import {
  Home,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  PersonOutline,
  CalendarToday,
  AttachMoney,
  Bed,
  Bathtub,
  SquareFoot,
  TrendingUp,
  Description,
  ChevronLeft,
  ChevronRight,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ListingCard = React.memo(({ listing, viewMode = 'small', index = 0, onArchive, onDelete, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPrice, setShowPrice] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0); // 0=small, 1=property, 2=activity, 3=documents

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // 1200px+

  // Panel widths
  const PANEL_WIDTHS = {
    small: 320,
    property: 380,
    activity: 240,
    documents: 240,
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

  // Memoized navigation handlers
  const goToNextPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.min(prev + 1, maxPanelIndex));
  }, [maxPanelIndex]);

  const goToPrevPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.max(prev - 1, 0));
  }, []);

  // Memoized click handler
  const handleClick = useCallback(() => {
    navigate(`/listings/${listing.id}`);
  }, [listing.id, navigate]);

  // Memoized price toggle
  const togglePrice = useCallback((e) => {
    e.stopPropagation();
    setShowPrice(prev => !prev);
  }, []);

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      'Active': { label: 'Active', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
      'Pending': { label: 'Pending', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
      'Sold': { label: 'Sold', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
      'Expired': { label: 'Expired', color: '#6b7280', bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' },
      'Withdrawn': { label: 'Withdrawn', color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
      'Coming Soon': { label: 'Coming Soon', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    };
    return configs[status] || configs['Active'];
  };

  const statusConfig = getStatusConfig(listing.status);

  // Format currency with decimals
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Mask price for privacy
  const maskPrice = (value) => {
    const absValue = Math.abs(value || 0);
    if (absValue >= 1000000) return '$*,***,***';
    if (absValue >= 100000) return '$***,***';
    if (absValue >= 10000) return '$**,***';
    return '$*,***';
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      if (d && !isNaN(d.getTime())) {
        return format(d, 'MMM d, yyyy');
      }
    } catch (e) {}
    return null;
  };

  // Get days on market
  const getDaysOnMarket = () => {
    if (!listing.listDate) return 0;
    try {
      const listDate = new Date(listing.listDate);
      const today = new Date();
      const diffTime = Math.abs(today - listDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  const daysOnMarket = getDaysOnMarket();
  const isNewListing = daysOnMarket <= 7;
  const isStale = daysOnMarket > 90;

  const propertyImage = listing.photos?.[0] || listing.imageUrl;
  const address = listing.address || 'No Address';

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mock property details
  const propertyDetails = {
    beds: listing.bedrooms || listing.beds || 0,
    baths: listing.bathrooms || listing.baths || 0,
    sqft: listing.sqft || listing.squareFeet || 0,
    yearBuilt: listing.yearBuilt || 'N/A',
    lotSize: listing.lotSize || 'N/A',
    propertyType: listing.propertyType || 'Single Family',
  };

  // Mock activity data
  const activity = [
    { type: 'Listed', date: listing.listDate || listing.createdAt, icon: <Home sx={{ fontSize: 16 }} /> },
    { type: 'Price Change', date: listing.priceChangeDate, icon: <AttachMoney sx={{ fontSize: 16 }} /> },
    { type: 'Showing', date: listing.lastShowingDate, icon: <Visibility sx={{ fontSize: 16 }} /> },
    { type: 'Open House', date: listing.openHouseDate, icon: <CalendarToday sx={{ fontSize: 16 }} /> },
  ].filter(a => a.date); // Only show activities with dates

  // Mock documents
  const documents = [
    { name: 'Listing Agreement', completed: true },
    { name: 'Disclosure Package', completed: !!listing.disclosuresComplete },
    { name: 'MLS Photos', completed: !!propertyImage },
    { name: 'Marketing Materials', completed: false },
  ];

  // Calculate which panels to show based on viewMode and viewport
  const getVisiblePanelWidths = () => {
    // Mobile/Tablet: Use carousel system
    if (!isDesktop) {
      if (isMobile) return [PANEL_WIDTHS.small]; // Show 1 panel
      if (isTablet) return [PANEL_WIDTHS.small, PANEL_WIDTHS.property]; // Show 2 panels
    }

    // Desktop: Show panels based on viewMode
    if (viewMode === 'small') {
      return [PANEL_WIDTHS.small]; // 320px
    } else if (viewMode === 'medium') {
      return [PANEL_WIDTHS.small, PANEL_WIDTHS.property]; // 700px
    } else {
      return [PANEL_WIDTHS.small, PANEL_WIDTHS.property, PANEL_WIDTHS.activity, PANEL_WIDTHS.documents]; // 1180px
    }
  };

  const visiblePanelWidths = getVisiblePanelWidths();

  // Helper to check if a panel should be shown
  const showPanel = (panelIndex) => {
    if (!isDesktop) return true; // Always render all panels, carousel will hide them

    // Desktop: Show based on viewMode
    if (viewMode === 'small') return panelIndex === 0;
    if (viewMode === 'medium') return panelIndex <= 1;
    return true; // large: show all
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
              {/* Property Image with grey gradient background */}
              <Box
                sx={{
                  aspectRatio: '3 / 2',
                  width: '100%',
                  position: 'relative',
                  background: propertyImage
                    ? `url(${propertyImage})`
                    : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
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
                {!propertyImage && (
                  <Home sx={{ fontSize: 120, color: alpha('#757575', 0.4), zIndex: 1 }} />
                )}

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

                {/* New Listing Badge */}
                {isNewListing && (
                  <Chip
                    label="NEW"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontWeight: 700,
                      fontSize: 10,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      zIndex: 3,
                    }}
                  />
                )}

                {/* Days on Market - BOTTOM LEFT */}
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
                  <CalendarToday sx={{ fontSize: 14, color: 'white' }} />
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    {daysOnMarket} {daysOnMarket === 1 ? 'day' : 'days'}
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
                          onDelete(listing.id);
                        } else if (isArchived && onRestore) {
                          onRestore(listing.id);
                        } else if (onArchive) {
                          onArchive(listing.id);
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
                {/* Address */}
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
                  {address}
                </Typography>

                {/* Price Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: 22,
                      color: statusConfig.color,
                      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {showPrice ? formatCurrency(listing.listPrice) : maskPrice(listing.listPrice)}
                  </Typography>
                  <IconButton
                    onClick={togglePrice}
                    size="small"
                    sx={{
                      width: 24,
                      height: 24,
                      color: alpha(theme.palette.text.secondary, 0.6),
                      '&:hover': { color: theme.palette.text.primary },
                    }}
                  >
                    {showPrice ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Box>

                {/* Property Stats */}
                <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                  {propertyDetails.beds > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Bed sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {propertyDetails.beds}
                      </Typography>
                    </Box>
                  )}
                  {propertyDetails.baths > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Bathtub sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {propertyDetails.baths}
                      </Typography>
                    </Box>
                  )}
                  {propertyDetails.sqft > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SquareFoot sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {propertyDetails.sqft.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Property Type */}
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
                  {propertyDetails.propertyType}
                </Typography>

                {/* Agent Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 14,
                      fontWeight: 700,
                      background: statusConfig.bg,
                    }}
                  >
                    {getInitials(listing.agentName || 'Agent')}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>
                      {listing.agentName || 'Listing Agent'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 11 }}>
                      {listing.brokerageName || 'Associated Real Estate'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* PANEL 2: Property Details (380px) */}
        {showPanel(1) && viewMode !== 'small' && (
          <Card
            sx={{
              width: PANEL_WIDTHS.property,
              minWidth: PANEL_WIDTHS.property,
              borderRadius: 4,
              boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              {/* Header */}
              <Box sx={{ p: 2, background: alpha(statusConfig.color, 0.05), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusConfig.color }}>
                  Property Details
                </Typography>
              </Box>

              {/* Details List */}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <DetailRow label="Bedrooms" value={propertyDetails.beds || 'N/A'} />
                  <DetailRow label="Bathrooms" value={propertyDetails.baths || 'N/A'} />
                  <DetailRow label="Square Feet" value={propertyDetails.sqft ? propertyDetails.sqft.toLocaleString() : 'N/A'} />
                  <DetailRow label="Year Built" value={propertyDetails.yearBuilt} />
                  <DetailRow label="Lot Size" value={propertyDetails.lotSize} />
                  <DetailRow label="Property Type" value={propertyDetails.propertyType} />
                  <Divider sx={{ my: 1 }} />
                  <DetailRow label="List Date" value={formatDate(listing.listDate) || 'N/A'} />
                  <DetailRow label="Days on Market" value={daysOnMarket} />
                  {listing.originalPrice && listing.originalPrice !== listing.listPrice && (
                    <DetailRow
                      label="Original Price"
                      value={formatCurrency(listing.originalPrice)}
                      valueColor={theme.palette.text.secondary}
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* PANEL 3: Activity Timeline (240px) */}
        {showPanel(2) && viewMode === 'large' && (
          <Card
            sx={{
              width: PANEL_WIDTHS.activity,
              minWidth: PANEL_WIDTHS.activity,
              borderRadius: 4,
              boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              {/* Header */}
              <Box sx={{ p: 2, background: alpha(statusConfig.color, 0.05), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusConfig.color }}>
                  Activity
                </Typography>
              </Box>

              {/* Activity List */}
              <Box sx={{ p: 2 }}>
                {activity.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {activity.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
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
                          {item.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                            {item.type}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 11 }}>
                            {formatDate(item.date)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                    No recent activity
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* PANEL 4: Documents Checklist (240px) */}
        {showPanel(3) && viewMode === 'large' && (
          <Card
            sx={{
              width: PANEL_WIDTHS.documents,
              minWidth: PANEL_WIDTHS.documents,
              borderRadius: 4,
              boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
              {/* Header */}
              <Box sx={{ p: 2, background: alpha(statusConfig.color, 0.05), borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusConfig.color }}>
                  Documents
                </Typography>
              </Box>

              {/* Documents List */}
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {documents.map((doc, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {doc.completed ? (
                        <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 20, color: alpha(theme.palette.text.disabled, 0.3) }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 13,
                          color: doc.completed ? theme.palette.text.primary : theme.palette.text.secondary,
                          fontWeight: doc.completed ? 600 : 400,
                        }}
                      >
                        {doc.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                      Progress
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: statusConfig.color }}>
                      {Math.round((documents.filter(d => d.completed).length / documents.length) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(documents.filter(d => d.completed).length / documents.length) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(statusConfig.color, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: statusConfig.bg,
                      },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
});

// Helper component for property detail rows
const DetailRow = ({ label, value, valueColor }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, color: valueColor || theme.palette.text.primary }}>
        {value}
      </Typography>
    </Box>
  );
};

export default ListingCard;
