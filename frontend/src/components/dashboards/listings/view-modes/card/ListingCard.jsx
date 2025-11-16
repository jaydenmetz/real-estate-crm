import React from 'react';
import { Box, Card, CardMedia } from '@mui/material';
import { CardTemplate } from '../../../../../templates/ViewModes';
import { listingCardConfig } from '../../config/viewModeConfig';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';

/**
 * ListingCard - Card view for listings dashboard
 *
 * Now uses CardTemplate with configuration-driven field mapping.
 * Displays listing with:
 * - Property image (from listing or Street View)
 * - Property address
 * - Listing price, beds/baths/sqft
 * - Status badge (Active/Closed/Expired)
 * - Commission amount
 * - Dates (List Date/Expiration)
 *
 * Features:
 * - Quick actions menu (Archive/Delete/View)
 * - Status badges and color coding
 * - Consistent with all other dashboard view modes
 */
const ListingCard = React.memo(({
  listing,
  onClick,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  const propertyImage = getBestPropertyImage(listing);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Property Image Header */}
      <CardMedia
        component="div"
        sx={{
          height: 180,
          backgroundImage: `url(${propertyImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Card Content using Template */}
      <Box sx={{ flexGrow: 1 }}>
        <CardTemplate
          data={listing}
          config={listingCardConfig}
          onClick={onClick}
          onArchive={onArchive}
          onDelete={onDelete}
          onRestore={onRestore}
          isArchived={isArchived}
        />
      </Box>
    </Card>
  );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
