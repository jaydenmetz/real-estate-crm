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
  Home,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  Bed,
  Bathtub,
  SquareFoot,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getStatusConfig } from '../../../../../constants/listingConfig';
import { formatCurrency, formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * ListingListItem - Full-width horizontal list view with image on left
 * Adapted from EscrowListItem for listings data structure
 */
const ListingListItem = ({ listing, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
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
    square_feet,
    listing_date,
    days_on_market,
    listing_commission = 0,
    buyer_commission = 0,
  } = listing;

  // Calculate total commission
  const totalCommission = parseFloat(listing_commission || 0) + parseFloat(buyer_commission || 0);
  const listPrice = parseFloat(list_price || 0);

  const statusConfig = getStatusConfig(listing_status);
  const propertyImage = getBestPropertyImage(listing);
  const address = property_address || 'No Address';

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

  // Calculate commission as dollar amount if percentages
  const commissionAmount = totalCommission > 0 && totalCommission < 100
    ? (listPrice * totalCommission / 100)
    : totalCommission;

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

        {/* MLS Badge */}
        {mls_number && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            >
              MLS #{mls_number}
            </Typography>
          </Box>
        )}

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
                item={listing}
                onView={() => navigate(`/listings/${id}`)}
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

        {/* Days on Market Badge */}
        {days_on_market !== null && days_on_market !== undefined && listing_status === 'Active' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: alpha(statusConfig.color, 0.9),
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            >
              {days_on_market} day{days_on_market !== 1 ? 's' : ''} on market
            </Typography>
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
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: theme.palette.text.primary,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
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
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {city && state ? `${city}, ${state}${zip_code ? ' ' + zip_code : ''}` : 'Location TBD'}
        </Typography>

        {/* Property Details Row */}
        {(bedrooms || bathrooms || square_feet) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {bedrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bed sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
                  {bedrooms} bd
                </Typography>
              </Box>
            )}
            {bathrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bathtub sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
                  {bathrooms} ba
                </Typography>
              </Box>
            )}
            {square_feet && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SquareFoot sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
                  {square_feet.toLocaleString()} sqft
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Metrics Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 'auto' }}>
          {/* List Price */}
          <Box>
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              List Price
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatCurrency(listPrice)}
            </Typography>
          </Box>

          {/* Commission */}
          {commissionAmount > 0 && (
            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
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
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#6366f1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {showCommission ? formatCurrency(commissionAmount) : maskCommission(commissionAmount)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Listing Date */}
          {listing_date && (
            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                Listed
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatDateUtil(listing_date, 'MMM d, yyyy')}
              </Typography>
            </Box>
          )}

          {/* Status Icon */}
          <Box>
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              Status
            </Typography>
            {listing_status === 'Sold' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircle sx={{ fontSize: 16, color: '#6366f1' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#6366f1', whiteSpace: 'nowrap' }}>
                  Sold
                </Typography>
              </Box>
            ) : listing_status === 'Cancelled' || listing_status === 'Withdrawn' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Cancel sx={{ fontSize: 16, color: '#ef4444' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444', whiteSpace: 'nowrap' }}>
                  {listing_status}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: statusConfig.color, whiteSpace: 'nowrap' }}>
                {statusConfig.label}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ListingListItem;
