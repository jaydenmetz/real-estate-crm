import React from 'react';
import { ListItemTemplate } from '../../../../../templates/ViewModes';
import { listingListConfig } from '../../config/viewModeConfig';

/**
 * ListingListItem - Horizontal list view for listings dashboard
 *
 * Now uses ListItemTemplate with configuration-driven field mapping.
 *
 * Reduced from 217 lines to ~40 lines by moving all logic to:
 * - ListItemTemplate: Generic template with editing support (519 lines, reusable)
 * - listingListConfig: Listing-specific configuration
 *
 * Features preserved:
 * - Property image sidebar (200px wide)
 * - MLS badge overlay
 * - Days on market badge
 * - Status chip
 * - Property details (beds/baths/sqft)
 * - Inline editing for all fields
 * - Quick actions menu
 */
const ListingListItem = React.memo(({
  listing,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  return (
    <ListItemTemplate
      data={listing}
      config={listingListConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
    />
  );
});

ListingListItem.displayName = 'ListingListItem';

export default ListingListItem;
