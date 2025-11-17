import React from 'react';
import { TableRowTemplate } from '../../../../../templates/ViewModes';
import { listingTableConfig } from '../../config/viewModeConfig';

/**
 * ListingTableRow - Compact table view for listings dashboard
 *
 * Now uses TableRowTemplate with configuration-driven column mapping and editing.
 *
 * Reduced from 152 lines to ~40 lines by moving all logic to:
 * - TableRowTemplate: Generic template with editing support (460 lines, reusable)
 * - listingTableConfig: Listing-specific configuration
 *
 * Features preserved:
 * - Grid layout with columns (Property, Status, Price, Beds/Baths, MLS#, Days, Commission, Actions)
 * - Inline editors: address, price, commission, dates, status
 * - Status chip with color coding
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 * - QuickActionsMenu
 */
const ListingTableRow = React.memo(({
  listing,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  return (
    <TableRowTemplate
      data={listing}
      config={listingTableConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
    />
  );
});

ListingTableRow.displayName = 'ListingTableRow';

export default ListingTableRow;
