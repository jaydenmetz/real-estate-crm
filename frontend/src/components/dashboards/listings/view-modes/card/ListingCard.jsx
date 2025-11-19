import React from 'react';
import { CardTemplate } from '../../../../../templates/Dashboard/view-modes';
import { listingCardConfig } from '../../config/viewModeConfig';

/**
 * ListingCard - Card view for listings dashboard
 *
 * Now uses CardTemplate with configuration-driven field mapping.
 * Matches escrows implementation exactly for consistency.
 *
 * Features:
 * - Quick actions menu (Archive/Delete/View)
 * - Status badges and color coding
 * - Consistent with all other dashboard view modes
 */
const ListingCard = React.memo(({
  listing,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  return (
    <CardTemplate
      data={listing}
      config={listingCardConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
    />
  );
});

ListingCard.displayName = 'ListingCard';

export default ListingCard;
