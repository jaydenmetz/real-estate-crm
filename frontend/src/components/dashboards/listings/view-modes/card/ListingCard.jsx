import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatters';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';

/**
 * ListingCard - Card view for listings dashboard
 *
 * Displays listing with:
 * - Property image (from listing or Street View)
 * - Property address
 * - Listing price
 * - Status badge (Active/Closed/Expired)
 * - Commission amount
 * - Dates (Beginning/Expiration)
 *
 * Features:
 * - Inline editing for all fields (via editors)
 * - Quick actions menu (Archive/Delete/View)
 * - Status badges and color coding
 *
 * TODO: Add inline editors, quick actions, multi-panel navigation
 */
const ListingCard = React.memo(({
  listing,
  viewMode = 'card',
  animationType = 'spring',
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  onUpdate
}) => {
  const status = listing.listing_status || listing.status || 'active';
  const propertyImage = getBestPropertyImage(listing);

  const statusColors = {
    active: '#4caf50',
    closed: '#2196f3',
    expired: '#f44336'
  };

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: 4,
        transform: 'translateY(-2px)'
      }
    }}>
      {/* Property Image */}
      <Box
        sx={{
          height: 200,
          backgroundImage: `url(${propertyImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        {/* Status Badge */}
        <Chip
          label={status.toUpperCase()}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: statusColors[status.toLowerCase()] || '#757575',
            color: 'white',
            fontWeight: 600
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Property Address */}
        <Typography variant="h6" gutterBottom>
          {listing.property_address || 'No Address'}
        </Typography>

        {/* Listing Price */}
        <Typography variant="h5" color="primary" gutterBottom>
          {formatCurrency(listing.listing_price || listing.price || 0)}
        </Typography>

        {/* Details Grid */}
        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {listing.bedrooms && (
            <Typography variant="body2" color="text.secondary">
              {listing.bedrooms} beds
            </Typography>
          )}
          {listing.bathrooms && (
            <Typography variant="body2" color="text.secondary">
              {listing.bathrooms} baths
            </Typography>
          )}
          {listing.square_feet && (
            <Typography variant="body2" color="text.secondary">
              {listing.square_feet.toLocaleString()} sqft
            </Typography>
          )}
          {listing.days_on_market && (
            <Typography variant="body2" color="text.secondary">
              {listing.days_on_market} DOM
            </Typography>
          )}
        </Box>

        {/* MLS Number */}
        {listing.mls_number && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            MLS# {listing.mls_number}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

export default ListingCard;
