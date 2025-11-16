import React from 'react';
import { Box, Paper, Typography, Chip, alpha, useTheme } from '@mui/material';
import { Home, Bed, Bathtub, SquareFoot } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ListItemTemplate } from '../../../../../templates/ViewModes';
import { listingListConfig } from '../../config/viewModeConfig';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
import { getStatusConfig } from '../../../../../constants/listingConfig';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * ListingListItem - Full-width horizontal list view with property image
 *
 * Uses ListItemTemplate with custom property image sidebar.
 * Preserves unique features: property image, MLS badge, days on market badge.
 */
const ListingListItem = ({ listing, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    id,
    property_address,
    mls_number,
    days_on_market,
    listing_status,
    bedrooms,
    bathrooms,
    square_feet,
  } = listing;

  const propertyImage = getBestPropertyImage(listing);
  const statusConfig = getStatusConfig(listing_status);

  const handleClick = () => navigate(`/listings/${id}`);

  return (
    <Paper
      sx={{
        mb: 1.5,
        display: 'flex',
        overflow: 'hidden',
        transition: 'all 0.2s',
        cursor: 'pointer',
        border: `1px solid ${alpha(statusConfig.color, 0.15)}`,
        boxShadow: `0 4px 16px ${alpha(statusConfig.color, 0.08)}`,
        '&:hover': {
          boxShadow: `0 6px 24px ${alpha(statusConfig.color, 0.15)}`,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={handleClick}
    >
      {/* Property Image Sidebar (Custom) */}
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
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>
              MLS #{mls_number}
            </Typography>
          </Box>
        )}

        {/* Quick Actions */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)', borderRadius: '50%' }}>
            <QuickActionsMenu
              item={listing}
              onView={() => navigate(`/listings/${id}`)}
              onShare={null}
              onArchive={onArchive}
              onRestore={onRestore}
              onDelete={onDelete}
              isArchived={isArchived}
              color="white"
            />
          </Box>
        </Box>

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
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.7rem' }}>
              {days_on_market} day{days_on_market !== 1 ? 's' : ''} on market
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main Content using Template */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, minWidth: 0 }}>
        {/* Header: Address + Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {property_address || 'No Address'}
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

        {/* Property Details */}
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

        {/* Use ListItemTemplate for remaining fields */}
        <Box sx={{ mt: 'auto' }}>
          <ListItemTemplate
            data={listing}
            config={{
              ...listingListConfig,
              avatar: null, // No avatar, already using property image sidebar
              title: null, // Already rendered above
              status: null, // Already rendered above
              primaryFields: listingListConfig.primaryFields,
              secondaryFields: listingListConfig.secondaryFields,
              actions: null, // Already rendered in image sidebar
            }}
            onClick={null} // Click handled by parent
            onArchive={null} // Handled in QuickActionsMenu
            onDelete={null}
            onRestore={null}
            isArchived={isArchived}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default ListingListItem;
