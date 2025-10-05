import React, { useState } from 'react';
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
  Home,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  PersonOutline,
  AccountBalance,
  CheckCircleOutline,
  RadioButtonUnchecked,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isValid, format } from 'date-fns';

const EscrowCard = ({ escrow, viewMode = 'small', index = 0 }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showCommission, setShowCommission] = React.useState(false);
  const [currentPanel, setCurrentPanel] = useState(0); // 0=small, 1=people, 2=timeline, 3=checklists

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // 1200px+

  // Panel widths
  const PANEL_WIDTHS = {
    small: 320,
    people: 380,
    timeline: 240,
    checklists: 240,
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
  const goToNextPanel = () => {
    setCurrentPanel((prev) => Math.min(prev + 1, maxPanelIndex));
  };

  const goToPrevPanel = () => {
    setCurrentPanel((prev) => Math.max(prev - 1, 0));
  };

  // Swipe gesture handling
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      goToNextPanel();
    } else if (info.offset.x > swipeThreshold) {
      goToPrevPanel();
    }
  };

  // Parse data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const grossCommission = parseFloat(escrow.grossCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;

  // Calculate days to close
  const closingDate = escrow.scheduledCoeDate || escrow.closingDate;
  let daysToClose = null;
  let isUrgent = false;
  let isPastDue = false;

  if (closingDate) {
    try {
      const closeDate = new Date(closingDate);
      if (isValid(closeDate)) {
        const days = differenceInDays(closeDate, new Date());
        daysToClose = days;
        isUrgent = days <= 7 && days > 0;
        isPastDue = days < 0;
      }
    } catch (e) {}
  }

  // Format currency with decimals
  const formatCurrency = (value) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Mask commission for privacy
  const maskCommission = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 100000) return '$***,***';
    if (absValue >= 10000) return '$**,***';
    if (absValue >= 1000) return '$*,***';
    if (absValue >= 100) return '$***';
    if (absValue >= 10) return '$**';
    return '$*';
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      if (isValid(d)) {
        return format(d, 'MMM d, yy');
      }
    } catch (e) {}
    return null;
  };

  // Status config
  const getStatusConfig = (status) => {
    const configs = {
      'Active': {
        color: '#10b981',
        bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        label: 'Active',
        glow: '0 8px 32px rgba(16, 185, 129, 0.25)'
      },
      'Pending': {
        color: '#f59e0b',
        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        label: 'Pending',
        glow: '0 8px 32px rgba(245, 158, 11, 0.25)'
      },
      'Closed': {
        color: '#6366f1',
        bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        label: 'Closed',
        glow: '0 8px 32px rgba(99, 102, 241, 0.25)'
      },
      'Cancelled': {
        color: '#ef4444',
        bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        label: 'Cancelled',
        glow: '0 8px 32px rgba(239, 68, 68, 0.25)'
      },
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(escrow.escrowStatus);
  const propertyImage = escrow.propertyImage || escrow.zillowUrl;
  const address = escrow.propertyAddress || 'No Address';

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mock people data (replace with actual data from escrow object)
  const people = {
    buyer: { name: escrow.buyerName || 'TBD', email: escrow.buyerEmail },
    seller: { name: escrow.sellerName || 'TBD', email: escrow.sellerEmail },
    listingAgent: { name: escrow.listingAgentName || 'TBD', brokerage: 'Associated Real Estate' },
    buyerAgent: { name: escrow.buyerAgentName || 'You', brokerage: 'Associated Real Estate' },
  };

  // Mock timeline milestones
  const timeline = [
    { label: 'Opened', date: escrow.createdAt, completed: true },
    { label: 'Inspection', date: escrow.inspectionDate, completed: !!escrow.inspectionDate },
    { label: 'Appraisal', date: escrow.appraisalDate, completed: !!escrow.appraisalDate },
    { label: 'Closing', date: closingDate, completed: escrow.escrowStatus === 'Closed' },
  ];

  // Mock checklist groups
  const checklists = [
    { group: 'Documents', completed: 3, total: 5 },
    { group: 'Inspections', completed: 2, total: 3 },
    { group: 'Financing', completed: 1, total: 2 },
    { group: 'Disclosures', completed: 4, total: 4 },
  ];

  // Calculate container width based on visible panels
  const getContainerWidth = () => {
    if (isDesktop) return 1180; // All panels
    if (isTablet) return 700; // 2 panels (small + people)
    return 320; // 1 panel
  };

  const containerWidth = getContainerWidth();

  // Calculate translate offset based on current panel
  const getTranslateX = () => {
    if (isDesktop) return 0; // No translation needed, all visible

    let offset = 0;
    const panelWidths = [
      PANEL_WIDTHS.small,
      PANEL_WIDTHS.people,
      PANEL_WIDTHS.timeline,
      PANEL_WIDTHS.checklists,
    ];

    for (let i = 0; i < currentPanel; i++) {
      offset += panelWidths[i];
    }

    return -offset;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{ width: '100%', maxWidth: containerWidth, position: 'relative' }}
    >
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

      {/* Card Container with Overflow Hidden */}
      <Box sx={{ overflow: 'hidden', width: '100%', borderRadius: 4 }}>
        <motion.div
          drag={!isDesktop ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={{ x: getTranslateX() }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card
            onClick={() => navigate(`/escrows/${escrow.id}`)}
            sx={{
              height: 400,
              width: 1180, // Total width of all panels
              cursor: 'pointer',
              borderRadius: 4,
              overflow: 'visible',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 4px 20px ${alpha(statusConfig.color, 0.15)}`,
              '&:hover': {
                boxShadow: statusConfig.glow,
              },
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            {/* PANEL 1: Small Card - Base (320px) */}
            <Box sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Property Image */}
              <Box
                sx={{
                  height: 213,
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
                  <Home sx={{ fontSize: 80, color: alpha('#757575', 0.5), zIndex: 1 }} />
                )}

                {/* Status Chip */}
                <Chip
                  label={statusConfig.label}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
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

                {/* Progress Bar */}
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
                      width: `${checklistProgress}%`,
                      background: statusConfig.bg,
                      transition: 'width 0.5s ease-in-out',
                      boxShadow: `0 0 10px ${alpha(statusConfig.color, 0.6)}`,
                    }}
                  />
                </Box>

                {/* Progress Percentage */}
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
                  {checklistProgress}%
                </Typography>
              </Box>

              {/* Card Content */}
              <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Address */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    mb: 2,
                    color: theme.palette.text.primary,
                    lineHeight: 1.3,
                  }}
                >
                  {address}
                </Typography>

                {/* Metrics Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 2 }}>
                  {/* Price */}
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
                      border: `1px solid ${alpha('#10b981', 0.15)}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.16) 100%)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#059669', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Price
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#10b981', letterSpacing: '-0.5px' }}>
                      {formatCurrency(purchasePrice)}
                    </Typography>
                  </Box>

                  {/* Commission */}
                  <Box
                    sx={{
                      position: 'relative',
                      p: 1,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
                      border: `1px solid ${alpha('#6366f1', 0.15)}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.16) 100%)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#4f46e5', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Commission
                      </Typography>
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCommission(!showCommission);
                        }}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          transition: 'all 0.2s',
                          '&:hover': {
                            background: alpha('#6366f1', 0.1),
                          },
                        }}
                      >
                        {showCommission ? (
                          <VisibilityOff sx={{ fontSize: 14, color: '#6366f1' }} />
                        ) : (
                          <Visibility sx={{ fontSize: 14, color: '#6366f1' }} />
                        )}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#6366f1', letterSpacing: '-0.5px' }}>
                      {showCommission ? formatCurrency(commission) : maskCommission(commission)}
                    </Typography>
                  </Box>
                </Box>

                {/* Footer - Close date and days */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 'auto',
                    pt: 1.5,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      Closes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary }}>
                      {formatDate(closingDate) || 'TBD'}
                    </Typography>
                  </Box>

                  {/* Days Badge */}
                  {escrow.escrowStatus === 'Closed' ? (
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.75,
                      px: 2, py: 1, borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.15) 100%)',
                      border: `1px solid ${alpha('#10b981', 0.2)}`,
                    }}>
                      <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10b981' }}>
                        Closed
                      </Typography>
                    </Box>
                  ) : escrow.escrowStatus === 'Cancelled' ? (
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 0.75,
                      px: 2, py: 1, borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)',
                      border: `1px solid ${alpha('#ef4444', 0.2)}`,
                    }}>
                      <Cancel sx={{ fontSize: 18, color: '#ef4444' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#ef4444' }}>
                        Cancelled
                      </Typography>
                    </Box>
                  ) : daysToClose !== null ? (
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: isPastDue
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)'
                          : isUrgent
                          ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.15) 100%)',
                        border: `1px solid ${alpha(
                          isPastDue ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6',
                          0.2
                        )}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: isPastDue ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6',
                        }}
                      >
                        {isPastDue ? `${Math.abs(daysToClose)}d late` : `${daysToClose}d`}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              </CardContent>
            </Box>

            {/* PANEL 2: People (380px) */}
            <Box
              sx={{
                width: 380,
                flexShrink: 0,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.02) 0%, rgba(139,92,246,0.03) 100%)',
                borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 3, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                People
              </Typography>

              {/* Buyer */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {getInitials(people.buyer.name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Buyer
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
                    {people.buyer.name}
                  </Typography>
                  {people.buyer.email && (
                    <Typography variant="caption" sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                      {people.buyer.email}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Seller */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {getInitials(people.seller.name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Seller
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
                    {people.seller.name}
                  </Typography>
                  {people.seller.email && (
                    <Typography variant="caption" sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                      {people.seller.email}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Listing Agent */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {getInitials(people.listingAgent.name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Listing Agent
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
                    {people.listingAgent.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                    {people.listingAgent.brokerage}
                  </Typography>
                </Box>
              </Box>

              {/* Buyer Agent */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  {getInitials(people.buyerAgent.name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                    Buyer Agent
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
                    {people.buyerAgent.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: 11, color: theme.palette.text.secondary }}>
                    {people.buyerAgent.brokerage}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* PANEL 3: Timeline (240px) */}
            <Box
              sx={{
                width: 240,
                flexShrink: 0,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.02) 0%, rgba(168,85,247,0.03) 100%)',
                borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                p: 3,
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
                    <CheckCircleOutline sx={{ fontSize: 24, color: '#10b981', flexShrink: 0 }} />
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

            {/* PANEL 4: Checklists (240px) */}
            <Box
              sx={{
                width: 240,
                flexShrink: 0,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.02) 0%, rgba(217,70,239,0.03) 100%)',
                borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 3, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Checklists
              </Typography>

              {checklists.map((checklist, idx) => {
                const progress = (checklist.completed / checklist.total) * 100;
                const isComplete = checklist.completed === checklist.total;

                return (
                  <Box key={checklist.group} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary }}>
                        {checklist.group}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, color: isComplete ? '#10b981' : theme.palette.text.secondary }}>
                        {checklist.completed}/{checklist.total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: isComplete
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Card>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default EscrowCard;
