import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import {
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
import { EditPurchasePrice } from '../../editors/EditPurchasePrice';
import { EditCommissionAmount } from '../../editors/EditCommissionAmount';
import { EditAcceptanceDate } from '../../editors/EditAcceptanceDate';
import { EditClosingDate } from '../../editors/EditClosingDate';
import { EditPropertyAddress } from '../../editors/EditPropertyAddress';

/**
 * EscrowTableRow - Compact table view (no images)
 * Similar to your second screenshot with table headers + compact rows
 */
const EscrowTableRow = ({ escrow, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showCommission, setShowCommission] = useState(false);

  // Editor modal states
  const [priceEditorOpen, setPriceEditorOpen] = useState(false);
  const [commissionEditorOpen, setCommissionEditorOpen] = useState(false);
  const [acceptanceDateEditorOpen, setAcceptanceDateEditorOpen] = useState(false);
  const [closingDateEditorOpen, setClosingDateEditorOpen] = useState(false);
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);

  // Memoized calculations
  const calculations = useEscrowCalculations(escrow);
  const {
    purchasePrice,
    commission,
    checklistProgress,
    closingDate,
    acceptanceDate,
  } = calculations;

  const statusConfig = getStatusConfig(escrow.escrow_status);
  const address = escrow.property_address || 'No Address';

  const handleClick = useCallback(() => {
    navigate(`/escrows/${escrow.id}`);
  }, [escrow.id, navigate]);

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
      onClick={handleClick}
      sx={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr 80px',
        gap: 2,
        alignItems: 'center',
        width: '100%',
        minHeight: 60,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        position: 'relative',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: alpha(statusConfig.color, 0.03),
          border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
          boxShadow: `0 2px 8px ${alpha(statusConfig.color, 0.1)}`,
        },
      }}
    >
      {/* Property Address - Editable */}
      <Box
        onClick={(e) => {
          if (onUpdate) {
            e.stopPropagation();
            setAddressEditorOpen(true);
          }
        }}
        sx={{
          minWidth: 0,
          cursor: onUpdate ? 'pointer' : 'default',
          transition: 'all 0.2s',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          mx: -1,
          '&:hover': onUpdate ? {
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
          } : {},
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: theme.palette.text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {address}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
          }}
        >
          {escrow.city && escrow.state ? `${escrow.city}, ${escrow.state}` : 'Location TBD'}
        </Typography>
      </Box>

      {/* Status */}
      <Box>
        <Chip
          label={statusConfig.label}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: 10,
            height: 24,
            background: statusConfig.bg,
            color: 'white',
          }}
        />
      </Box>

      {/* Price - Editable */}
      <Box
        onClick={(e) => {
          if (onUpdate) {
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
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
          } : {},
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10b981' }}>
          {formatCurrency(purchasePrice)}
        </Typography>
      </Box>

      {/* Commission - Editable */}
      <Box
        onClick={(e) => {
          if (onUpdate) {
            e.stopPropagation();
            setCommissionEditorOpen(true);
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: onUpdate ? 'pointer' : 'default',
          transition: 'all 0.2s',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          mx: -1,
          '&:hover': onUpdate ? {
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
          } : {},
        }}
      >
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
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#6366f1' }}>
          {showCommission ? formatCurrency(commission) : maskCommission(commission)}
        </Typography>
      </Box>

      {/* Acceptance Date - Editable */}
      <Box
        onClick={(e) => {
          if (onUpdate) {
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
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.primary }}>
          {formatDateUtil(acceptanceDate, 'MMM d, yyyy') || 'TBD'}
        </Typography>
      </Box>

      {/* Closing Date - Editable */}
      <Box
        onClick={(e) => {
          if (onUpdate) {
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
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.primary }}>
          {formatDateUtil(closingDate, 'MMM d, yyyy') || 'TBD'}
        </Typography>
      </Box>

      {/* Progress */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: statusConfig.color,
          }}
        >
          {checklistProgress}%
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
        {isArchived && onRestore && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onRestore(escrow.id);
            }}
            sx={{
              width: 32,
              height: 32,
              color: '#10b981',
              '&:hover': {
                bgcolor: alpha('#10b981', 0.1),
              },
            }}
          >
            <RestoreFromTrashIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
        {(onArchive || onDelete) && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (isArchived && onDelete) {
                onDelete(escrow.id);
              } else if (onArchive) {
                onArchive(escrow.id);
              }
            }}
            sx={{
              width: 32,
              height: 32,
              color: theme.palette.text.secondary,
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.1),
                color: '#ef4444',
              },
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* Editor Modals */}
      <EditPurchasePrice
        open={priceEditorOpen}
        onClose={() => setPriceEditorOpen(false)}
        onSave={(updates) => onUpdate(escrow.id, updates)}
        escrow={escrow}
      />

      <EditCommissionAmount
        open={commissionEditorOpen}
        onClose={() => setCommissionEditorOpen(false)}
        onSave={(updates) => onUpdate(escrow.id, updates)}
        escrow={escrow}
      />

      <EditAcceptanceDate
        open={acceptanceDateEditorOpen}
        onClose={() => setAcceptanceDateEditorOpen(false)}
        onSave={(updates) => onUpdate(escrow.id, updates)}
        escrow={escrow}
      />

      <EditClosingDate
        open={closingDateEditorOpen}
        onClose={() => setClosingDateEditorOpen(false)}
        onSave={(updates) => onUpdate(escrow.id, updates)}
        escrow={escrow}
      />

      <EditPropertyAddress
        open={addressEditorOpen}
        onClose={() => setAddressEditorOpen(false)}
        onSave={(updates) => onUpdate(escrow.id, updates)}
        escrow={escrow}
      />
    </Box>
  );
};

export default EscrowTableRow;
