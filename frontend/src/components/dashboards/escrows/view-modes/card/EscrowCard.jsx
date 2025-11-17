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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useEscrowCalculations } from '../../../../../hooks/useEscrowCalculations';
import { getStatusConfig } from '../../../../../constants/escrowConfig';
import { EditableTextField } from '../../../../common/editors/EditableTextField';
import { EditableDateField } from '../../../../common/editors/EditableDateField';
import { EditableNumberField } from '../../../../common/editors/EditableNumberField';
import { EditPurchasePrice } from '../../editors/EditPurchasePrice';
import { EditCommissionAmount } from '../../editors/EditCommissionAmount';
import { EditAcceptanceDate } from '../../editors/EditAcceptanceDate';
import { EditClosingDate } from '../../editors/EditClosingDate';
import { EditPropertyAddress } from '../../editors/EditPropertyAddress';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';
import { formatCurrency, formatDate as formatDateUtil } from '../../../../../utils/formatters';
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
