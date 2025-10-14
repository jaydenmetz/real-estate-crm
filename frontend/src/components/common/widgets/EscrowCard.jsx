import React, { useState, useCallback, useEffect } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  Close,
  Add,
  Remove,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';
import { useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useEscrowCalculations } from '../../../hooks/useEscrowCalculations';
import { getStatusConfig } from '../../../constants/escrowConfig';
import { EditableTextField } from '../EditableTextField';
import { EditableDateField } from '../EditableDateField';
import { EditableNumberField } from '../EditableNumberField';
import { ContactSelectionModal } from '../../modals/ContactSelectionModal';
import { BadgeEditor } from '../BadgeEditor';
import PersonRoleContainer from '../PersonRoleContainer';
import ViewAllPeopleModal from '../../modals/ViewAllPeopleModal';
import TeamManagementModal from '../../modals/TeamManagementModal';

const EscrowCard = React.memo(({ escrow, viewMode = 'small', animationType = 'spring', animationDuration = 1, animationIntensity = 1, index = 0, onArchive, onDelete, onRestore, isArchived = false, onUpdate }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showCommission, setShowCommission] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0); // 0=small, 1=people, 2=timeline, 3=checklists

  // Badge editor states
  const [priceEditorOpen, setPriceEditorOpen] = useState(false);
  const [commissionEditorOpen, setCommissionEditorOpen] = useState(false);

  // Status menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  // Inline editing states
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Multiple buyers/sellers state - Initialize from people JSONB or legacy fields
  const initializeBuyers = () => {
    if (escrow.people?.buyers && Array.isArray(escrow.people.buyers)) {
      return escrow.people.buyers;
    }
    if (escrow.people?.buyer) {
      return [escrow.people.buyer];
    }
    return [{ name: escrow.buyer_name || 'TBD', email: escrow.buyer_email || '' }];
  };

  const initializeSellers = () => {
    if (escrow.people?.sellers && Array.isArray(escrow.people.sellers)) {
      return escrow.people.sellers;
    }
    if (escrow.people?.seller) {
      return [escrow.people.seller];
    }
    return [{ name: escrow.seller_name || 'TBD', email: escrow.seller_email || '' }];
  };

  const [buyers, setBuyers] = useState(initializeBuyers());
  const [sellers, setSellers] = useState(initializeSellers());

  // Contact selection modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(null);

  // Hover states for Add Buyer/Seller buttons
  const [showAddBuyerButton, setShowAddBuyerButton] = useState(false);
  const [showAddSellerButton, setShowAddSellerButton] = useState(false);

  // View All modal states
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [viewAllModalRole, setViewAllModalRole] = useState(null); // 'buyer' or 'seller'

  // Team Management modal states
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamModalRoleType, setTeamModalRoleType] = useState(null); // 'buyer_agent', 'listing_agent', 'lender', 'escrow_officer'

  // Sync state when escrow data changes from parent
  useEffect(() => {
    setBuyers(initializeBuyers());
    setSellers(initializeSellers());
  }, [escrow.people, escrow.buyer_name, escrow.seller_name]);

  // ✅ Memoized calculations - only recalculate when escrow data changes
  const calculations = useEscrowCalculations(escrow);

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

  // ✅ Memoized navigation handlers - prevent child re-renders
  const goToNextPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.min(prev + 1, maxPanelIndex));
  }, [maxPanelIndex]);

  const goToPrevPanel = useCallback(() => {
    setCurrentPanel((prev) => Math.max(prev - 1, 0));
  }, []);

  // ✅ Swipe gesture handling
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      goToNextPanel();
    } else if (info.offset.x > swipeThreshold) {
      goToPrevPanel();
    }
  }, [goToNextPanel, goToPrevPanel]);

  // ✅ Memoized click handler - prevents re-renders
  const handleClick = useCallback(() => {
    navigate(`/escrows/${escrow.id}`);
  }, [escrow.id, navigate]);

  // ✅ Memoized commission toggle
  const toggleCommission = useCallback((e) => {
    e.stopPropagation();
    setShowCommission(prev => !prev);
  }, []);

  // ✅ Inline editing handlers
  const handleStartEdit = useCallback((field, currentValue, e) => {
    e?.stopPropagation();
    setEditingField(field);
    setEditValue(currentValue || '');
  }, []);

  const handleCancelEdit = useCallback((e) => {
    e?.stopPropagation();
    setEditingField(null);
    setEditValue('');
  }, []);

  const handleSaveEdit = useCallback(async (field, e) => {
    e?.stopPropagation();
    if (!onUpdate || !editValue) {
      handleCancelEdit();
      return;
    }

    setSaving(true);
    try {
      const updateData = { [field]: editValue };
      await onUpdate(escrow.id, updateData);
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update field:', error);
    } finally {
      setSaving(false);
    }
  }, [escrow.id, editValue, onUpdate, handleCancelEdit]);

  // ✅ Helper to update people in database
  const updatePeopleInDatabase = useCallback(async (updatedBuyers, updatedSellers) => {
    if (!onUpdate) return;

    const updatedPeople = {
      ...escrow.people,
      buyers: updatedBuyers,
      sellers: updatedSellers,
    };

    try {
      await onUpdate(escrow.id, { people: updatedPeople });
    } catch (error) {
      console.error('Failed to update people:', error);
    }
  }, [escrow.id, escrow.people, onUpdate]);

  // ✅ Multiple buyers/sellers handlers (max 6 each)
  const handleAddBuyer = useCallback(async (e) => {
    e?.stopPropagation();
    if (buyers.length >= 6) {
      console.warn('Maximum 6 buyers allowed');
      return;
    }
    const newBuyers = [...buyers, { name: 'TBD', email: '', phone: '', company: null }];
    setBuyers(newBuyers);
    await updatePeopleInDatabase(newBuyers, sellers);
  }, [buyers, sellers, updatePeopleInDatabase]);

  const handleAddSeller = useCallback(async (e) => {
    e?.stopPropagation();
    if (sellers.length >= 6) {
      console.warn('Maximum 6 sellers allowed');
      return;
    }
    const newSellers = [...sellers, { name: 'TBD', email: '', phone: '', company: null }];
    setSellers(newSellers);
    await updatePeopleInDatabase(buyers, newSellers);
  }, [buyers, sellers, updatePeopleInDatabase]);

  const handleRemoveBuyer = useCallback(async (index, e) => {
    e?.stopPropagation();
    if (buyers.length > 1) {
      const newBuyers = buyers.filter((_, i) => i !== index);
      setBuyers(newBuyers);
      await updatePeopleInDatabase(newBuyers, sellers);
    }
  }, [buyers, sellers, updatePeopleInDatabase]);

  const handleRemoveSeller = useCallback(async (index, e) => {
    e?.stopPropagation();
    if (sellers.length > 1) {
      const newSellers = sellers.filter((_, i) => i !== index);
      setSellers(newSellers);
      await updatePeopleInDatabase(buyers, newSellers);
    }
  }, [buyers, sellers, updatePeopleInDatabase]);

  // ✅ View All modal handlers
  const handleViewAllBuyers = useCallback((e) => {
    e?.stopPropagation();
    setViewAllModalRole('buyer');
    setViewAllModalOpen(true);
  }, []);

  const handleViewAllSellers = useCallback((e) => {
    e?.stopPropagation();
    setViewAllModalRole('seller');
    setViewAllModalOpen(true);
  }, []);

  const handleCloseViewAllModal = useCallback(() => {
    setViewAllModalOpen(false);
    setViewAllModalRole(null);
  }, []);

  // ✅ Team Management modal handlers
  const handleOpenTeamModal = useCallback((roleType, e) => {
    e?.stopPropagation();
    setTeamModalRoleType(roleType);
    setTeamModalOpen(true);
  }, []);

  const handleCloseTeamModal = useCallback(() => {
    setTeamModalOpen(false);
    setTeamModalRoleType(null);
  }, []);

  const handleTeamPersonClick = useCallback(async (person, section, personIndex) => {
    // TODO: Open contact selection modal to edit person
    console.log('Edit person:', person, 'in section:', section);
  }, []);

  const handleTeamAddPerson = useCallback(async (section) => {
    // TODO: Open contact selection modal to add person
    console.log('Add person to section:', section);
  }, []);

  const handleTeamRemovePerson = useCallback(async (section, personIndex) => {
    // TODO: Remove person from team section
    console.log('Remove person:', personIndex, 'from section:', section);
  }, []);

  // ✅ Contact selection modal handlers
  const handlePersonClick = useCallback((role, roleConfig, index = null, e) => {
    e?.stopPropagation();
    setSelectedRole({ type: role, config: roleConfig });
    setSelectedRoleIndex(index);
    setContactModalOpen(true);
  }, []);

  const handleContactSelect = useCallback(async (contact) => {
    if (!onUpdate || !selectedRole) return;

    try {
      const roleType = selectedRole.type;

      // Update based on role type
      if (roleType === 'buyer' && selectedRoleIndex !== null) {
        const newBuyers = [...buyers];
        newBuyers[selectedRoleIndex] = {
          name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company_name,
        };
        setBuyers(newBuyers);
        await updatePeopleInDatabase(newBuyers, sellers);
      } else if (roleType === 'seller' && selectedRoleIndex !== null) {
        const newSellers = [...sellers];
        newSellers[selectedRoleIndex] = {
          name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company_name,
        };
        setSellers(newSellers);
        await updatePeopleInDatabase(buyers, newSellers);
      } else {
        // For single-person roles (agents, lender, escrow officer)
        const updatedPeople = {
          ...escrow.people,
          [roleType]: {
            name: contact.full_name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company_name,
          },
        };
        await onUpdate(escrow.id, { people: updatedPeople });
      }

      setContactModalOpen(false);
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  }, [selectedRole, selectedRoleIndex, buyers, sellers, escrow.id, escrow.people, onUpdate, updatePeopleInDatabase]);

  // ✅ Status configuration (constant lookup, no object creation)
  const statusConfig = getStatusConfig(escrow.escrow_status);

  // ✅ Destructure memoized calculations
  const {
    purchasePrice,
    commission,
    grossCommission,
    checklistProgress,
    daysToClose,
    isUrgent,
    isPastDue,
    closingDate,
    acceptanceDate
  } = calculations;

  // Remove old calculation code - now using memoized hook
  if (false && closingDate) {
    try {
      const closeDate = new Date(closingDate);
      if (false && closeDate) {
        const days = 0;
        const _daysToClose = days;
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

  // ✅ Removed duplicate getStatusConfig - now using imported constant
  const propertyImage = escrow.property_image || escrow.zillow_url;
  const address = escrow.property_address || 'No Address';

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  /**
   * Smart name truncation that prioritizes first and last names
   * Examples:
   *   "John Doe" → "John Doe" (fits)
   *   "John Michael Doe" → "John M. Doe" (middle initial)
   *   "John Michael Christopher Doe" → "John M. C. Doe" (all middle initials)
   *   "Christopher Emmanuel Rodriguez Martinez" → "Christopher E. R. Martinez"
   * @param {string} name - Full name to truncate
   * @param {number} maxLength - Maximum character length (default 25)
   * @returns {string} Truncated name
   */
  const truncateName = (name, maxLength = 25) => {
    if (!name || name.length <= maxLength) return name;

    const parts = name.trim().split(/\s+/);
    if (parts.length <= 2) {
      // Just first and last, use ellipsis if too long
      return name.length > maxLength ? `${name.substring(0, maxLength - 3)}...` : name;
    }

    // First name + middle initials + last name
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const middleNames = parts.slice(1, -1);

    // Create middle initials
    const middleInitials = middleNames.map(n => `${n[0]}.`).join(' ');

    const truncated = `${firstName} ${middleInitials} ${lastName}`;

    // If still too long, just show "First L."
    if (truncated.length > maxLength) {
      return `${firstName} ${lastName[0]}.`;
    }

    return truncated;
  };

  // People data with lender and escrow officer
  const people = {
    buyer: {
      name: escrow.buyer_name || 'TBD',
      email: escrow.buyer_email,
      company: null,
      color: { primary: '#10b981', secondary: '#059669' }
    },
    buyerAgent: {
      name: escrow.buyer_agent_name || 'You',
      company: 'Associated Real Estate',
      color: { primary: '#8b5cf6', secondary: '#7c3aed' }
    },
    lender: {
      name: escrow.lender_name || 'TBD',
      company: escrow.lender_company || 'TBD',
      color: { primary: '#14b8a6', secondary: '#0d9488' }
    },
    seller: {
      name: escrow.seller_name || 'TBD',
      email: escrow.seller_email,
      company: null,
      color: { primary: '#f59e0b', secondary: '#d97706' }
    },
    listingAgent: {
      name: escrow.listing_agent_name || 'TBD',
      company: 'Associated Real Estate',
      color: { primary: '#6366f1', secondary: '#4f46e5' }
    },
    escrowOfficer: {
      name: escrow.escrow_officer_name || 'TBD',
      company: escrow.escrow_company || 'TBD',
      color: { primary: '#ec4899', secondary: '#db2777' }
    },
  };

  // Mock timeline milestones
  const timeline = [
    { label: 'Opened', date: escrow.created_at, completed: true },
    { label: 'Inspection', date: escrow.inspection_date, completed: !!escrow.inspection_date },
    { label: 'Appraisal', date: escrow.appraisal_date, completed: !!escrow.appraisal_date },
    { label: 'Closing', date: closingDate, completed: escrow.escrow_status === 'Closed' },
  ];

  // Mock checklist groups
  const checklists = [
    { group: 'Documents', completed: 3, total: 5 },
    { group: 'Inspections', completed: 2, total: 3 },
    { group: 'Financing', completed: 1, total: 2 },
    { group: 'Disclosures', completed: 4, total: 4 },
  ];

  // Calculate which panels to show based on viewMode and viewport
  const getVisiblePanelWidths = () => {
    // Mobile/Tablet: Use carousel system
    if (!isDesktop) {
      if (isMobile) return [PANEL_WIDTHS.small]; // Show 1 panel
      if (isTablet) return [PANEL_WIDTHS.small, PANEL_WIDTHS.people]; // Show 2 panels
    }

    // Desktop: Show panels based on viewMode
    if (viewMode === 'small') {
      return [PANEL_WIDTHS.small]; // 320px
    } else if (viewMode === 'medium') {
      return [PANEL_WIDTHS.small, PANEL_WIDTHS.people]; // 700px
    } else {
      return [PANEL_WIDTHS.small, PANEL_WIDTHS.people, PANEL_WIDTHS.timeline, PANEL_WIDTHS.checklists]; // 1180px
    }
  };

  const visiblePanelWidths = getVisiblePanelWidths();
  const containerWidth = visiblePanelWidths.reduce((sum, width) => sum + width, 0);

  // Card height is determined naturally by content:
  // - Image: 3:2 aspect ratio (responsive to card width)
  // - Content section: Compact padding for minimal white space
  // Card 2 matches Card 1's height automatically via flexbox stretch

  // Helper to check if a panel should be shown
  const showPanel = (panelIndex) => {
    // panelIndex: 0=small, 1=people, 2=timeline, 3=checklists
    if (!isDesktop) {
      // Mobile/tablet: controlled by carousel
      return true; // Always render all panels, carousel will hide them
    }

    // Desktop: Show based on viewMode
    if (viewMode === 'small') return panelIndex === 0;
    if (viewMode === 'medium') return panelIndex <= 1;
    return true; // large: show all
  };

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
    <Box
      style={{ width: '100%', position: 'relative' }}
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

      {/* Card Container - Card 1 stays fixed, Card 2 slides in */}
      <Box sx={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        gap: 1.5, // 12px gap between cards
        alignItems: 'stretch', // Force both cards to match height
      }}>
        {/* Card 1: Escrow Card (Fixed 320px width in all modes) */}
        <Box
          sx={{
            width: '320px', // Always 320px width
            minWidth: '320px', // Prevent shrinking
            maxWidth: '320px', // Prevent growing
            flexShrink: 0,
            display: 'flex', // Make this a flex container so Card stretches to full height
          }}
        >
          <Card
            onClick={handleClick}
            sx={{
              width: '100%',
              // No height specified - let content (image 3:2 + content section) determine height
              cursor: 'pointer',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              // Subtle gradient border effect
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
              // Dynamic shadow
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
              {/* Property Image - 3:2 aspect ratio (standard MLS photos) */}
              <Box
                sx={{
                  aspectRatio: '3 / 2', // Standard MLS photo aspect ratio (1500x1000)
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
                  <Home sx={{ fontSize: 80, color: alpha('#757575', 0.5), zIndex: 1 }} />
                )}

                {/* Status Chip - TOP LEFT - Clickable to change status */}
                <Chip
                  label={statusConfig.label}
                  size="small"
                  onClick={(e) => {
                    if (onUpdate) {
                      e.stopPropagation();
                      setStatusMenuAnchor(e.currentTarget);
                    }
                  }}
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
                    cursor: onUpdate ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': onUpdate ? {
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.4)}`,
                    } : {},
                    '& .MuiChip-label': { px: 1.5, py: 0.5 },
                  }}
                />

                {/* Hover Zone for Delete Button - TOP RIGHT */}
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
                          onDelete(escrow.id);
                        } else if (isArchived && onRestore) {
                          onRestore(escrow.id);
                        } else if (onArchive) {
                          onArchive(escrow.id);
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
              <CardContent sx={{
                p: 1.25,
                '&:last-child': { pb: 1.25 }, // Override MUI default
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Address - Editable */}
                {onUpdate ? (
                  <EditableTextField
                    value={escrow.property_address}
                    onSave={(newValue) => onUpdate(escrow.id, { property_address: newValue })}
                    variant="h6"
                    placeholder="No Address"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      mb: 1,
                      color: theme.palette.text.primary,
                      lineHeight: 1.2,
                    }}
                  />
                ) : (
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      mb: 1,
                      color: theme.palette.text.primary,
                      lineHeight: 1.2,
                    }}
                  >
                    {address}
                  </Typography>
                )}

                {/* Metrics Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1 }}>
                  {/* Price - Editable */}
                  <Box
                    onClick={(e) => {
                      if (onUpdate) {
                        e.stopPropagation();
                        setPriceEditorOpen(true);
                      }
                    }}
                    sx={{
                      p: 0.75,
                      borderRadius: 1.5,
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
                      border: `1px solid ${alpha('#10b981', 0.15)}`,
                      cursor: onUpdate ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      '&:hover': onUpdate ? {
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.16) 100%)',
                        transform: 'scale(1.05)',
                      } : {},
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
                    onClick={(e) => {
                      if (onUpdate) {
                        e.stopPropagation();
                        setCommissionEditorOpen(true);
                      }
                    }}
                    sx={{
                      position: 'relative',
                      p: 0.75,
                      borderRadius: 1.5,
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
                      border: `1px solid ${alpha('#6366f1', 0.15)}`,
                      cursor: onUpdate ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      '&:hover': onUpdate ? {
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.16) 100%)',
                        transform: 'scale(1.05)',
                      } : {},
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: '#4f46e5', mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Commission
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                          flexShrink: 0,
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
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: '#6366f1',
                          letterSpacing: '-0.5px',
                        }}
                      >
                        {showCommission ? formatCurrency(commission) : maskCommission(commission)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Footer - Acceptance, Close, and Days count */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 'auto',
                    pt: 1,
                    px: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    gap: 1,
                  }}
                >
                  {/* Acceptance Date - 33.33% width */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: '33.33%' }}>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Acceptance
                    </Typography>
                    {onUpdate ? (
                      <EditableDateField
                        value={acceptanceDate}
                        onSave={(newValue) => onUpdate(escrow.id, { acceptance_date: newValue })}
                        variant="body2"
                        sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                        {formatDate(acceptanceDate) || 'TBD'}
                      </Typography>
                    )}
                  </Box>

                  {/* Close Date - 33.33% width */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: '33.33%' }}>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Close
                    </Typography>
                    {onUpdate ? (
                      <EditableDateField
                        value={closingDate}
                        onSave={(newValue) => onUpdate(escrow.id, { closing_date: newValue })}
                        variant="body2"
                        sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                        {formatDate(closingDate) || 'TBD'}
                      </Typography>
                    )}
                  </Box>

                  {/* Days Count - 33.33% width */}
                  <Box sx={{ width: '33.33%', display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'flex-end' }}>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {escrow.escrow_status === 'Closed' ? 'Status' : escrow.escrow_status === 'Cancelled' ? 'Status' : 'Days'}
                    </Typography>
                    {escrow.escrow_status === 'Closed' ? (
                      <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                        px: 1.5, py: 0.5, borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.15) 100%)',
                        border: `1px solid ${alpha('#10b981', 0.2)}`,
                      }}>
                        <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#10b981' }}>
                          Closed
                        </Typography>
                      </Box>
                    ) : escrow.escrow_status === 'Cancelled' ? (
                      <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                        px: 1.5, py: 0.5, borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)',
                        border: `1px solid ${alpha('#ef4444', 0.2)}`,
                      }}>
                        <Cancel sx={{ fontSize: 14, color: '#ef4444' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#ef4444' }}>
                          Cancelled
                        </Typography>
                      </Box>
                    ) : daysToClose !== null ? (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        background: isPastDue
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.15) 100%)'
                          : isUrgent
                          ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.15) 100%)',
                        border: `1px solid ${alpha(isPastDue ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6', 0.2)}`,
                      }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: isPastDue ? '#ef4444' : isUrgent ? '#f59e0b' : '#3b82f6',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isPastDue ? `${Math.abs(daysToClose)}d late` : `${daysToClose}d`}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                        TBD
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Box>
          </Card>
        </Box>

        {/* Card 2: Extension Panels */}
        {viewMode !== 'small' && (
          <Box
            style={{
              width: 'calc(100% - 332px)', // Full width minus Card 1 (320px) and gap (12px)
              flexShrink: 0,
              display: 'flex',
              opacity: 1,
            }}
          >
              <Card
                sx={{
                  width: '100%',
                  height: '100%', // Match Card 1 height
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 8px 32px ${alpha(statusConfig.color, 0.12)}, 0 2px 8px ${alpha(statusConfig.color, 0.08)}`,
                  display: 'flex',
                  flexDirection: 'row', // Horizontal layout for large view
                }}
              >
                {/* PANEL 1: People (large view only) */}
                {viewMode === 'large' && (
                  <Box
                    sx={{
                      width: '50%',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.02) 0%, rgba(139,92,246,0.03) 100%)',
                      borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {/* People content for large view - Fixed 2x3 Grid */}
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 3, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        People
                      </Typography>

                      {/* Fixed 2 Column x 3 Row Grid */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gridTemplateRows: '1fr 1fr 1fr',
                          gap: 2,
                          height: 'calc(100% - 40px)', // Subtract title height
                        }}
                      >
                        {/* LEFT COLUMN - Row 1: Buyers */}
                        <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
                          <PersonRoleContainer
                            roleName="Buyer"
                            people={buyers}
                            color={people.buyer.color}
                            onPersonClick={(person, index) =>
                              handlePersonClick('buyer', people.buyer.color, index)
                            }
                            onRemovePerson={handleRemoveBuyer}
                            onViewAll={handleViewAllBuyers}
                            onAddPerson={handleViewAllBuyers}
                            getInitials={getInitials}
                            truncateName={truncateName}
                          />
                        </Box>

                        {/* RIGHT COLUMN - Row 1: Sellers */}
                        <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
                          <PersonRoleContainer
                            roleName="Seller"
                            people={sellers}
                            color={people.seller.color}
                            onPersonClick={(person, index) =>
                              handlePersonClick('seller', people.seller.color, index)
                            }
                            onRemovePerson={handleRemoveSeller}
                            onViewAll={handleViewAllSellers}
                            onAddPerson={handleViewAllSellers}
                            getInitials={getInitials}
                            truncateName={truncateName}
                          />
                        </Box>

                        {/* LEFT COLUMN - Row 2: Buyer Agent */}
                        <Box
                          onClick={(e) => handleOpenTeamModal('buyer_agent', e)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            p: 1,
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              background: alpha(people.buyerAgent.color.primary, 0.05),
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: `linear-gradient(135deg, ${people.buyerAgent.color.primary} 0%, ${people.buyerAgent.color.secondary} 100%)`,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {getInitials(people.buyerAgent.name)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: people.buyerAgent.color.primary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                              Buyer Agent
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={people.buyerAgent.name}>
                              {truncateName(people.buyerAgent.name, 28)}
                            </Typography>
                            {people.buyerAgent.company && (
                              <Typography variant="caption" sx={{ fontSize: 10, color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                {people.buyerAgent.company}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* RIGHT COLUMN - Row 2: Listing Agent */}
                        <Box
                          onClick={(e) => handleOpenTeamModal('listing_agent', e)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            p: 1,
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              background: alpha(people.listingAgent.color.primary, 0.05),
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: `linear-gradient(135deg, ${people.listingAgent.color.primary} 0%, ${people.listingAgent.color.secondary} 100%)`,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {getInitials(people.listingAgent.name)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: people.listingAgent.color.primary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                              Listing Agent
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={people.listingAgent.name}>
                              {truncateName(people.listingAgent.name, 28)}
                            </Typography>
                            {people.listingAgent.company && (
                              <Typography variant="caption" sx={{ fontSize: 10, color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                {people.listingAgent.company}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* LEFT COLUMN - Row 3: Lender */}
                        <Box
                          onClick={(e) => handleOpenTeamModal('lender', e)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            p: 1,
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              background: alpha(people.lender.color.primary, 0.05),
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: `linear-gradient(135deg, ${people.lender.color.primary} 0%, ${people.lender.color.secondary} 100%)`,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {getInitials(people.lender.name)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: people.lender.color.primary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                              Lender
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={people.lender.name}>
                              {truncateName(people.lender.name, 28)}
                            </Typography>
                            {people.lender.company && (
                              <Typography variant="caption" sx={{ fontSize: 10, color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                {people.lender.company}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* RIGHT COLUMN - Row 3: Escrow Officer */}
                        <Box
                          onClick={(e) => handleOpenTeamModal('escrow_officer', e)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                            p: 1,
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              background: alpha(people.escrowOfficer.color.primary, 0.05),
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: `linear-gradient(135deg, ${people.escrowOfficer.color.primary} 0%, ${people.escrowOfficer.color.secondary} 100%)`,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                            }}
                          >
                            {getInitials(people.escrowOfficer.name)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: people.escrowOfficer.color.primary, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                              Escrow Officer
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={people.escrowOfficer.name}>
                              {truncateName(people.escrowOfficer.name, 28)}
                            </Typography>
                            {people.escrowOfficer.company && (
                              <Typography variant="caption" sx={{ fontSize: 10, color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                {people.escrowOfficer.company}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </>
                  </Box>
                )}

                {/* PANEL 2: Timeline (Only in large view) */}
                {viewMode === 'large' && (
                  <Box
                    sx={{
                      width: '25%',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.02) 0%, rgba(168,85,247,0.03) 100%)',
                      borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
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
                          gap: 1,
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
                )}

                {/* PANEL 3: Checklists (Only in large view) */}
                {viewMode === 'large' && (
                  <Box
                    sx={{
                      width: '25%',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.02) 0%, rgba(217,70,239,0.03) 100%)',
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
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
                )}
              </Card>
            </Box>
          )}
      </Box>

      {/* Contact Selection Modal */}
      <ContactSelectionModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSelect={handleContactSelect}
        roleType={selectedRole?.type}
        roleConfig={selectedRole?.config || { primary: '#6366f1', secondary: '#8b5cf6' }}
      />

      {/* View All Buyers Modal */}
      {viewAllModalOpen && viewAllModalRole === 'buyer' && (
        <ViewAllPeopleModal
          open={viewAllModalOpen}
          onClose={handleCloseViewAllModal}
          roleName="Buyer"
          people={buyers}
          color={people.buyer.color}
          onPersonClick={(person, index) => handlePersonClick('buyer', people.buyer.color, index)}
          onAddPerson={handleAddBuyer}
          onRemovePerson={(index) => handleRemoveBuyer(index, null)}
          getInitials={getInitials}
          truncateName={truncateName}
        />
      )}

      {/* View All Sellers Modal */}
      {viewAllModalOpen && viewAllModalRole === 'seller' && (
        <ViewAllPeopleModal
          open={viewAllModalOpen}
          onClose={handleCloseViewAllModal}
          roleName="Seller"
          people={sellers}
          color={people.seller.color}
          onPersonClick={(person, index) => handlePersonClick('seller', people.seller.color, index)}
          onAddPerson={handleAddSeller}
          onRemovePerson={(index) => handleRemoveSeller(index, null)}
          getInitials={getInitials}
          truncateName={truncateName}
        />
      )}

      {/* Team Management Modal */}
      {teamModalOpen && teamModalRoleType && (
        <TeamManagementModal
          open={teamModalOpen}
          onClose={handleCloseTeamModal}
          roleType={teamModalRoleType}
          teamData={escrow.people || {}}
          color={
            teamModalRoleType === 'buyer_agent' ? people.buyerAgent.color :
            teamModalRoleType === 'listing_agent' ? people.listingAgent.color :
            teamModalRoleType === 'lender' ? people.lender.color :
            people.escrowOfficer.color
          }
          onPersonClick={handleTeamPersonClick}
          onAddPerson={handleTeamAddPerson}
          onRemovePerson={handleTeamRemovePerson}
          getInitials={getInitials}
          truncateName={truncateName}
        />
      )}

      {/* Price Badge Editor */}
      <BadgeEditor
        open={priceEditorOpen}
        onClose={() => setPriceEditorOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { purchase_price: newValue })}
        label="Purchase Price"
        value={purchasePrice}
        color="#10b981"
        prefix="$"
      />

      {/* Commission Badge Editor */}
      <BadgeEditor
        open={commissionEditorOpen}
        onClose={() => setCommissionEditorOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { my_commission: newValue })}
        label="Commission"
        value={commission}
        color="#6366f1"
        prefix="$"
      />

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onUpdate(escrow.id, { escrow_status: 'Active' });
            setStatusMenuAnchor(null);
          }}
          sx={{
            '&:hover': { background: alpha('#10b981', 0.1) },
          }}
        >
          <ListItemIcon>
            <TrendingUp sx={{ color: '#10b981' }} />
          </ListItemIcon>
          <ListItemText primary="Active" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onUpdate(escrow.id, { escrow_status: 'Closed' });
            setStatusMenuAnchor(null);
          }}
          sx={{
            '&:hover': { background: alpha('#6366f1', 0.1) },
          }}
        >
          <ListItemIcon>
            <CheckCircle sx={{ color: '#6366f1' }} />
          </ListItemIcon>
          <ListItemText primary="Closed" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            onUpdate(escrow.id, { escrow_status: 'Cancelled' });
            setStatusMenuAnchor(null);
          }}
          sx={{
            '&:hover': { background: alpha('#ef4444', 0.1) },
          }}
        >
          <ListItemIcon>
            <Cancel sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText primary="Cancelled" />
        </MenuItem>
      </Menu>
    </Box>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison function - only re-render if data actually changed
  // This prevents unnecessary re-renders when parent state changes

  // Check if viewMode changed
  if (prevProps.viewMode !== nextProps.viewMode) return false; // Re-render

  // Check if archived status changed
  if (prevProps.isArchived !== nextProps.isArchived) return false; // Re-render

  // Check if index changed (affects animations)
  if (prevProps.index !== nextProps.index) return false; // Re-render

  // Deep comparison of escrow object - only check fields that affect rendering
  const escrowChanged =
    prevProps.escrow.id !== nextProps.escrow.id ||
    prevProps.escrow.property_address !== nextProps.escrow.property_address ||
    prevProps.escrow.purchase_price !== nextProps.escrow.purchase_price ||
    prevProps.escrow.myCommission !== nextProps.escrow.myCommission ||
    prevProps.escrow.grossCommission !== nextProps.escrow.grossCommission ||
    prevProps.escrow.escrow_status !== nextProps.escrow.escrow_status ||
    prevProps.escrow.checklistProgress !== nextProps.escrow.checklistProgress ||
    prevProps.escrow.scheduledCoeDate !== nextProps.escrow.scheduledCoeDate ||
    prevProps.escrow.closing_date !== nextProps.escrow.closing_date ||
    prevProps.escrow.acceptanceDate !== nextProps.escrow.acceptanceDate;

  return !escrowChanged; // Return true to SKIP re-render, false to re-render
});

EscrowCard.displayName = 'EscrowCard';

export default EscrowCard;
