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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getStatusConfig } from '../../../../../constants/listingConfig';
import { formatCurrency, formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * ListingTableRow - Compact table view (no images)
 * Adapted from EscrowTableRow for listings data structure
 */
const ListingTableRow = ({ listing, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showCommission, setShowCommission] = useState(false);

  // Click vs drag detection (for text selection)
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Extract listing data
  const {
    id,
    property_address,
    city,
    state,
    zip_code,
    list_price,
    listing_status,
    mls_number,
    bedrooms,
    bathrooms,
    listing_date,
    days_on_market,
    listing_commission = 0,
    buyer_commission = 0,
  } = listing;

  // Calculate total commission
  const totalCommission = parseFloat(listing_commission || 0) + parseFloat(buyer_commission || 0);
  const listPrice = parseFloat(list_price || 0);

  const statusConfig = getStatusConfig(listing_status);
  const address = property_address || 'No Address';

  // Calculate commission as dollar amount if percentages
  const commissionAmount = totalCommission > 0 && totalCommission < 100
    ? (listPrice * totalCommission / 100)
    : totalCommission;

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
      navigate(`/listings/${id}`);
    }
    setMouseDownPos(null);
  }, [isDragging, id, navigate]);

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
      {/* Property Address */}
      <Box
        sx={{
          minWidth: 0,
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
          {city && state ? `${city}, ${state}${zip_code ? ' ' + zip_code : ''}` : 'Location TBD'}
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

      {/* List Price */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10b981' }}>
          {formatCurrency(listPrice)}
        </Typography>
      </Box>

      {/* Commission */}
      {commissionAmount > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
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
            {showCommission ? formatCurrency(commissionAmount) : maskCommission(commissionAmount)}
          </Typography>
        </Box>
      )}

      {/* MLS Number */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.primary }}>
          {mls_number || '—'}
        </Typography>
      </Box>

      {/* Beds/Baths */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.primary }}>
          {bedrooms && bathrooms ? `${bedrooms}bd / ${bathrooms}ba` : '—'}
        </Typography>
      </Box>

      {/* Days on Market / Listed Date */}
      <Box>
        {days_on_market !== null && days_on_market !== undefined && listing_status === 'Active' ? (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: statusConfig.color }}>
            {days_on_market}d
          </Typography>
        ) : listing_date ? (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.secondary }}>
            {formatDateUtil(listing_date, 'MMM d')}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.disabled }}>
            —
          </Typography>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
        <QuickActionsMenu
          item={listing}
          onView={() => navigate(`/listings/${id}`)}
          onShare={null} // Future feature
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
          isArchived={isArchived}
          color={theme.palette.text.secondary}
        />
      </Box>
    </Box>
  );
};

export default ListingTableRow;
