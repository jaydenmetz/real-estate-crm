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
  Close,
  Add,
  Remove,
  TrendingUp,
  Schedule,
  RestoreFromTrash as RestoreFromTrashIcon,
  Lock,
  Group,
  Business,
} from '@mui/material/icons';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useEscrowCalculations } from '../../../../../hooks/useEscrowCalculations';
import { getStatusConfig } from '../../../../../constants/escrowConfig';
import { EditableTextField } from '../../../../common/editors/EditableTextField';
import { EditableDateField } from '../../../../common/editors/EditableDateField';
import { EditableNumberField } from '../../../../common/editors/EditableNumberField';
import { ContactSelectionModal } from '../../../../modals/ContactSelectionModal';
import { EditPurchasePrice } from '../../editors/EditPurchasePrice';
import { EditCommissionAmount } from '../../editors/EditCommissionAmount';
import { EditAcceptanceDate } from '../../editors/EditAcceptanceDate';
import { EditClosingDate } from '../../editors/EditClosingDate';
import { EditPropertyAddress } from '../../editors/EditPropertyAddress';
import PeopleEditor from '../../../../common/editors/PeopleEditor';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';
import { formatCurrency, formatDate as formatDateUtil, getInitials as getInitialsUtil, truncateText } from '../../../../../utils/formatters';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';

const EscrowCard = React.memo(({ escrow, onArchive, onDelete, onRestore, isArchived = false, onUpdate }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showCommission, setShowCommission] = useState(false);

  // Badge editor states
  const [priceEditorOpen, setPriceEditorOpen] = useState(false);
  const [commissionEditorOpen, setCommissionEditorOpen] = useState(false);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);

  // Date picker modal states
  const [acceptanceDatePickerOpen, setAcceptanceDatePickerOpen] = useState(false);
  const [closingDatePickerOpen, setClosingDatePickerOpen] = useState(false);

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

  // People Editor modal states
  const [peopleEditorOpen, setPeopleEditorOpen] = useState(false);
  const [peopleEditorRole, setPeopleEditorRole] = useState(null); // 'buyer', 'seller', 'buyer_agent', etc.

  // Open People Editor for a specific role
  const handleOpenPeopleEditor = useCallback((role) => {
    setPeopleEditorRole(role);
    setPeopleEditorOpen(true);
  }, []);

  // Close People Editor
  const handleClosePeopleEditor = useCallback(() => {
    setPeopleEditorOpen(false);
    setPeopleEditorRole(null);
  }, []);

  // Save people from editor
  const handleSavePeople = useCallback(async (updatedPeople) => {
    if (!peopleEditorRole) return;

    // TODO: Update the appropriate state and call onUpdate
    // // console.log('Saving people for role:', peopleEditorRole, updatedPeople);

    // For now, just close the modal
    handleClosePeopleEditor();
  }, [peopleEditorRole, handleClosePeopleEditor]);

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

  // Click vs drag detection (for text selection)
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Handle card click - only navigate if not dragging (text selection)
  const handleCardMouseDown = useCallback((e) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  }, []);

  const handleCardMouseMove = useCallback((e) => {
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      // If mouse moved more than 5px, consider it a drag (text selection)
      if (distance > 5) {
        setIsDragging(true);
      }
    }
  }, [mouseDownPos]);

  const handleClick = useCallback(() => {
    // Only navigate if user didn't drag (text selection)
    if (!isDragging) {
      navigate(`/escrows/${escrow.id}`);
    }
    setMouseDownPos(null);
  }, [isDragging, escrow.id, navigate]);

  // Separate handler for QuickActionsMenu that always navigates
  const handleCardClick = useCallback(() => {
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

  // Mask commission for privacy (keeping this as it's component-specific)
  const maskCommission = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 100000) return '$***,***';
    if (absValue >= 10000) return '$**,***';
    if (absValue >= 1000) return '$*,***';
    if (absValue >= 100) return '$***';
    if (absValue >= 10) return '$**';
    return '$*';
  };

  // ✅ Removed duplicate getStatusConfig - now using imported constant
  // Get best available image: property_image_url > zillow_image_url > street view > placeholder
  const propertyImage = getBestPropertyImage(escrow);
  const address = escrow.property_address || 'No Address';

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
      color: { primary: '#3b82f6', secondary: '#2563eb' }
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


  return (
    <Box sx={{ width: '320px', maxWidth: '320px', flexShrink: 0 }}>
          <Card
            onMouseDown={handleCardMouseDown}
            onMouseMove={handleCardMouseMove}
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

                {/* Quick Actions Menu - TOP RIGHT */}
                {(onArchive || onDelete || onRestore) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 3,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '.card-wrapper:hover &': {
                        opacity: 1,
                      },
                    }}
                    className="action-button"
                  >
                    <Box
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '50%',
                      }}
                    >
                      <QuickActionsMenu
                        item={escrow}
                        onView={handleCardClick}
                        onShare={null} // Future feature
                        onArchive={onArchive}
                        onRestore={onRestore}
                        onDelete={onDelete}
                        isArchived={isArchived}
                        color="white"
                      />
                    </Box>
                  </Box>
                )}
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
                  {onUpdate ? (
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddressEditorOpen(true);
                      }}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderRadius: 1,
                        px: 0.5,
                        py: 0.25,
                        flex: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      {/* Street Address */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: theme.palette.text.primary,
                          lineHeight: 1.2,
                        }}
                      >
                        {address}
                      </Typography>
                      {/* City, State, Zip */}
                      {(escrow.city || escrow.state || escrow.zip_code) && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            color: theme.palette.text.secondary,
                            lineHeight: 1.3,
                            display: 'block',
                            mt: 0.25,
                          }}
                        >
                          {[escrow.city, escrow.state].filter(Boolean).join(', ')}{escrow.zip_code ? ` ${escrow.zip_code}` : ''}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ flex: 1 }}>
                      {/* Street Address */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          color: theme.palette.text.primary,
                          lineHeight: 1.2,
                        }}
                      >
                        {address}
                      </Typography>
                      {/* City, State, Zip */}
                      {(escrow.city || escrow.state || escrow.zip_code) && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            color: theme.palette.text.secondary,
                            lineHeight: 1.3,
                            display: 'block',
                            mt: 0.25,
                          }}
                        >
                          {[escrow.city, escrow.state].filter(Boolean).join(', ')}{escrow.zip_code ? ` ${escrow.zip_code}` : ''}
                        </Typography>
                      )}
                    </Box>
                  )}
                  {escrow.is_private ? (
                    <Chip
                      icon={<Lock />}
                      label="Private"
                      size="small"
                      color="error"
                      sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }}
                    />
                  ) : escrow.access_level ? (
                    <Chip
                      icon={escrow.access_level === 'team' ? <Group /> : <Business />}
                      label={escrow.access_level === 'team' ? 'Team' : 'Broker'}
                      size="small"
                      color={escrow.access_level === 'team' ? 'primary' : 'secondary'}
                      sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }}
                    />
                  ) : null}
                </Box>

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
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          setAcceptanceDatePickerOpen(true);
                        }}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderRadius: 1,
                          px: 0.5,
                          py: 0.25,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                          {formatDateUtil(acceptanceDate, 'MMM d, yyyy') || 'TBD'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                        {formatDateUtil(acceptanceDate, 'MMM d, yyyy') || 'TBD'}
                      </Typography>
                    )}
                  </Box>

                  {/* Close Date - 33.33% width */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: '33.33%' }}>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Close
                    </Typography>
                    {onUpdate ? (
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          setClosingDatePickerOpen(true);
                        }}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderRadius: 1,
                          px: 0.5,
                          py: 0.25,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                          {formatDateUtil(closingDate, 'MMM d, yyyy') || 'TBD'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                        {formatDateUtil(closingDate, 'MMM d, yyyy') || 'TBD'}
                      </Typography>
                    )}
                  </Box>

                  {/* Progress - 33.33% width */}
                  <Box sx={{ width: '33.33%', display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'flex-end' }}>
                    <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {escrow.escrow_status === 'Closed' ? 'Status' : escrow.escrow_status === 'Cancelled' ? 'Status' : 'Progress'}
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
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: theme.palette.text.primary }}>
                          {checklistProgress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={checklistProgress}
                          sx={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.08),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#10b981',
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Box>
          </Card>

      {/* Contact Selection Modal */}
      <ContactSelectionModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSelect={handleContactSelect}
        roleType={selectedRole?.type}
        roleConfig={selectedRole?.config || { primary: '#6366f1', secondary: '#8b5cf6' }}
      />

      {/* Price Badge Editor */}
      <EditPurchasePrice
        open={priceEditorOpen}
        onClose={() => setPriceEditorOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { purchase_price: newValue })}
        value={purchasePrice}
      />

      {/* Commission Editor */}
      <EditCommissionAmount
        open={commissionEditorOpen}
        onClose={() => setCommissionEditorOpen(false)}
        onSave={(updates) => onUpdate(escrow.id, updates)}
        value={commission}
        commissionPercentage={parseFloat(escrow.commission_percentage || escrow.commissionPercentage || 0)}
        commissionType={escrow.commission_type || escrow.commissionType || 'percentage'}
        purchasePrice={parseFloat(escrow.purchase_price || escrow.purchasePrice || 0)}
      />

      {/* Acceptance Date Editor */}
      <EditAcceptanceDate
        open={acceptanceDatePickerOpen}
        onClose={() => setAcceptanceDatePickerOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { acceptance_date: newValue })}
        value={acceptanceDate}
      />

      {/* Closing Date Editor */}
      <EditClosingDate
        open={closingDatePickerOpen}
        onClose={() => setClosingDatePickerOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { closing_date: newValue })}
        value={closingDate}
      />

      {/* Property Address Editor */}
      <EditPropertyAddress
        open={addressEditorOpen}
        onClose={() => setAddressEditorOpen(false)}
        onSave={(addressData) => onUpdate(escrow.id, addressData)}
        value={escrow.property_address}
      />

      {/* People Editor Modal */}
      {peopleEditorOpen && (
        <PeopleEditor
          open={peopleEditorOpen}
          onClose={handleClosePeopleEditor}
          onSave={handleSavePeople}
          roleName={
            peopleEditorRole === 'buyer' ? 'Buyers' :
            peopleEditorRole === 'seller' ? 'Sellers' :
            peopleEditorRole === 'buyer_agent' ? "Buyer's Agent Team" :
            peopleEditorRole === 'listing_agent' ? "Listing Agent Team" :
            peopleEditorRole === 'lender' ? 'Lender Team' :
            peopleEditorRole === 'escrow_officer' ? 'Escrow Team' :
            'People'
          }
          currentPeople={
            peopleEditorRole === 'buyer' ? buyers.map((person, idx) => ({ ...person, id: person.id || `buyer-${idx}` })) :
            peopleEditorRole === 'seller' ? sellers.map((person, idx) => ({ ...person, id: person.id || `seller-${idx}` })) :
            peopleEditorRole === 'buyer_agent' ? (people.buyerAgent ? [{ ...people.buyerAgent, id: 'buyer-agent-1' }] : []) :
            peopleEditorRole === 'listing_agent' ? (people.listingAgent ? [{ ...people.listingAgent, id: 'listing-agent-1' }] : []) :
            peopleEditorRole === 'lender' ? (people.lender ? [{ ...people.lender, id: 'lender-1' }] : []) :
            peopleEditorRole === 'escrow_officer' ? (people.escrowOfficer ? [{ ...people.escrowOfficer, id: 'escrow-officer-1' }] : []) :
            []
          }
          color={
            peopleEditorRole === 'buyer' ? people.buyer.color :
            peopleEditorRole === 'seller' ? people.seller.color :
            peopleEditorRole === 'buyer_agent' ? people.buyerAgent.color :
            peopleEditorRole === 'listing_agent' ? people.listingAgent.color :
            peopleEditorRole === 'lender' ? people.lender.color :
            peopleEditorRole === 'escrow_officer' ? people.escrowOfficer.color :
            { primary: '#6366f1', secondary: '#8b5cf6' }
          }
          allContacts={[]} // TODO: Pass actual contacts array
          getInitials={getInitialsUtil}
        />
      )}

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

  // Check if archived status changed
  if (prevProps.isArchived !== nextProps.isArchived) return false; // Re-render

  // Deep comparison of escrow object - only check fields that affect rendering
  const escrowChanged =
    prevProps.escrow.id !== nextProps.escrow.id ||
    prevProps.escrow.property_address !== nextProps.escrow.property_address ||
    prevProps.escrow.city !== nextProps.escrow.city ||
    prevProps.escrow.state !== nextProps.escrow.state ||
    prevProps.escrow.zip_code !== nextProps.escrow.zip_code ||
    prevProps.escrow.county !== nextProps.escrow.county ||
    prevProps.escrow.purchase_price !== nextProps.escrow.purchase_price ||
    prevProps.escrow.my_commission !== nextProps.escrow.my_commission ||
    prevProps.escrow.commission_percentage !== nextProps.escrow.commission_percentage ||
    prevProps.escrow.commission_type !== nextProps.escrow.commission_type ||
    prevProps.escrow.grossCommission !== nextProps.escrow.grossCommission ||
    prevProps.escrow.escrow_status !== nextProps.escrow.escrow_status ||
    prevProps.escrow.checklistProgress !== nextProps.escrow.checklistProgress ||
    prevProps.escrow.scheduledCoeDate !== nextProps.escrow.scheduledCoeDate ||
    prevProps.escrow.closing_date !== nextProps.escrow.closing_date ||
    prevProps.escrow.acceptance_date !== nextProps.escrow.acceptance_date;

  return !escrowChanged; // Return true to SKIP re-render, false to re-render
});

EscrowCard.displayName = 'EscrowCard';

export default EscrowCard;
