import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Home,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  Close,
  RestoreFromTrash as RestoreFromTrashIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEscrowCalculations } from '../../../../../hooks/useEscrowCalculations';
import { getStatusConfig } from '../../../../../constants/escrowConfig';
import { formatCurrency, formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
import { EditPurchasePrice } from '../../editors/EditPurchasePrice';
import { EditCommissionAmount } from '../../editors/EditCommissionAmount';
import { EditAcceptanceDate } from '../../editors/EditAcceptanceDate';
import { EditClosingDate } from '../../editors/EditClosingDate';
import { EditPropertyAddress } from '../../editors/EditPropertyAddress';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * EscrowListItem - Full-width horizontal list view with image on left
 * Similar to your first screenshot with property image + compact info
 */
const EscrowListItem = ({ escrow, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showCommission, setShowCommission] = useState(false);

  // Editor modal states
  const [priceEditorOpen, setPriceEditorOpen] = useState(false);
  const [commissionEditorOpen, setCommissionEditorOpen] = useState(false);
  const [acceptanceDateEditorOpen, setAcceptanceDateEditorOpen] = useState(false);
  const [closingDateEditorOpen, setClosingDateEditorOpen] = useState(false);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);

  // Click vs drag detection (for text selection)
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Memoized calculations
  const calculations = useEscrowCalculations(escrow);
  const {
    purchasePrice,
    commission,
    checklistProgress,
    daysToClose,
    isUrgent,
    isPastDue,
    closingDate,
    acceptanceDate
  } = calculations;

  const statusConfig = getStatusConfig(escrow.escrow_status);
  const propertyImage = getBestPropertyImage(escrow);
  const address = escrow.property_address || 'No Address';

  // Handle row click - only navigate if not dragging (text selection)
  const handleRowMouseDown = useCallback((e) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  }, []);

  const handleRowMouseMove = useCallback((e) => {
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

  const handleRowClick = useCallback(() => {
    // Only navigate if user didn't drag (text selection)
    if (!isDragging) {
      navigate(`/escrows/${escrow.id}`);
    }
    setMouseDownPos(null);
  }, [isDragging, escrow.id, navigate]);

  const toggleCommission = useCallback((e) => {
    e.stopPropagation();
    setShowCommission(prev => !prev);
  }, []);

  const maskCommission = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 100000) return '$***,***';
    if (absValue >= 10000) return '$**,***';
    if (absValue >= 1000) return '$*,***';
    return '$***';
  };

  return (
    <Box
      onMouseDown={handleRowMouseDown}
      onMouseMove={handleRowMouseMove}
      onClick={handleRowClick}
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: 120,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(statusConfig.color, 0.15)}`,
        boxShadow: `0 4px 16px ${alpha(statusConfig.color, 0.08)}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: `0 6px 24px ${alpha(statusConfig.color, 0.15)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Property Image - 200px fixed width */}
      <Box
        sx={{
          width: 200,
          minWidth: 200,
          position: 'relative',
          background: propertyImage
            ? `url(${propertyImage})`
            : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!propertyImage && (
          <Home sx={{ fontSize: 60, color: alpha('#757575', 0.5) }} />
        )}

        {/* Progress Overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${checklistProgress}%`,
              background: statusConfig.bg,
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </Box>

        {/* Delete/Restore Button */}
        {(onArchive || onDelete || onRestore) && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 0.5,
            }}
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
                onView={() => navigate(`/escrows/${escrow.id}`)}
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

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          minWidth: 0,
        }}
      >
        {/* Header Row: Address + Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="h6"
            onClick={(e) => {
              if (onUpdate) {
                e.stopPropagation();
                setAddressEditorOpen(true);
              }
            }}
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: theme.palette.text.primary,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: onUpdate ? 'pointer' : 'default',
              transition: 'all 0.2s',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mx: -1,
              '&:hover': onUpdate ? {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
              } : {},
            }}
          >
            {address}
          </Typography>
          <Chip
            label={statusConfig.label}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 11,
              ml: 2,
              background: statusConfig.bg,
              color: 'white',
            }}
          />
        </Box>

        {/* Location */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            mb: 2,
            fontSize: '0.875rem',
          }}
        >
          {escrow.city && escrow.state ? `${escrow.city}, ${escrow.state}${escrow.zip_code ? ' ' + escrow.zip_code : ''}` : 'Location TBD'}
        </Typography>

        {/* Metrics Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 'auto' }}>
          {/* Price - Editable */}
          <Box
            onClick={(e) => {
              if (onUpdate && !isDragging) {
                e.stopPropagation();
                setPriceEditorOpen(true);
              }
            }}
            sx={{
              cursor: onUpdate ? 'pointer' : 'default',
              transition: 'all 0.2s',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mx: -1,
              '&:hover': onUpdate ? {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
              } : {},
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Price
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981' }}>
              {formatCurrency(purchasePrice)}
            </Typography>
          </Box>

          {/* Commission - Editable */}
          <Box
            onClick={(e) => {
              if (onUpdate && !isDragging) {
                e.stopPropagation();
                setCommissionEditorOpen(true);
              }
            }}
            sx={{
              cursor: onUpdate ? 'pointer' : 'default',
              transition: 'all 0.2s',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mx: -1,
              '&:hover': onUpdate ? {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
              } : {},
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Commission
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                onClick={toggleCommission}
                sx={{
                  width: 20,
                  height: 20,
                  p: 0,
                }}
              >
                {showCommission ? (
                  <VisibilityOff sx={{ fontSize: 14, color: '#6366f1' }} />
                ) : (
                  <Visibility sx={{ fontSize: 14, color: '#6366f1' }} />
                )}
              </IconButton>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#6366f1' }}>
                {showCommission ? formatCurrency(commission) : maskCommission(commission)}
              </Typography>
            </Box>
          </Box>

          {/* Acceptance Date - Editable */}
          <Box
            onClick={(e) => {
              if (onUpdate && !isDragging) {
                e.stopPropagation();
                setAcceptanceDateEditorOpen(true);
              }
            }}
            sx={{
              cursor: onUpdate ? 'pointer' : 'default',
              transition: 'all 0.2s',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mx: -1,
              '&:hover': onUpdate ? {
                backgroundColor: alpha(theme.palette.text.secondary, 0.08),
              } : {},
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Acceptance
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
              {formatDateUtil(acceptanceDate, 'MMM d, yyyy') || 'TBD'}
            </Typography>
          </Box>

          {/* Closing Date - Editable */}
          <Box
            onClick={(e) => {
              if (onUpdate && !isDragging) {
                e.stopPropagation();
                setClosingDateEditorOpen(true);
              }
            }}
            sx={{
              cursor: onUpdate ? 'pointer' : 'default',
              transition: 'all 0.2s',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              mx: -1,
              '&:hover': onUpdate ? {
                backgroundColor: alpha(theme.palette.text.secondary, 0.08),
              } : {},
            }}
          >
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Close
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
              {formatDateUtil(closingDate, 'MMM d, yyyy') || 'TBD'}
            </Typography>
          </Box>

          {/* Progress/Status */}
          <Box>
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {escrow.escrow_status === 'Closed' || escrow.escrow_status === 'Cancelled' ? 'Status' : 'Progress'}
            </Typography>
            {escrow.escrow_status === 'Closed' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>
                  Closed
                </Typography>
              </Box>
            ) : escrow.escrow_status === 'Cancelled' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Cancel sx={{ fontSize: 16, color: '#ef4444' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444' }}>
                  Cancelled
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: theme.palette.text.primary }}>
                  {checklistProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={checklistProgress}
                  sx={{
                    width: 50,
                    height: 5,
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
      </Box>

      {/* Editor Modals */}
      <EditPurchasePrice
        open={priceEditorOpen}
        onClose={() => setPriceEditorOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { purchase_price: newValue })}
        value={purchasePrice}
      />

      <EditCommissionAmount
        open={commissionEditorOpen}
        onClose={() => setCommissionEditorOpen(false)}
        onSave={(updates) => onUpdate(escrow.id, updates)}
        value={commission}
        commissionPercentage={parseFloat(escrow.commission_percentage || 0)}
        commissionType={escrow.commission_type || 'percentage'}
        purchasePrice={parseFloat(escrow.purchase_price || 0)}
      />

      <EditAcceptanceDate
        open={acceptanceDateEditorOpen}
        onClose={() => setAcceptanceDateEditorOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { acceptance_date: newValue })}
        value={acceptanceDate}
      />

      <EditClosingDate
        open={closingDateEditorOpen}
        onClose={() => setClosingDateEditorOpen(false)}
        onSave={(newValue) => onUpdate(escrow.id, { closing_date: newValue })}
        value={closingDate}
      />

      <EditPropertyAddress
        open={addressEditorOpen}
        onClose={() => setAddressEditorOpen(false)}
        onSave={(addressData) => onUpdate(escrow.id, addressData)}
        value={escrow.property_address}
      />
    </Box>
  );
};

export default EscrowListItem;
