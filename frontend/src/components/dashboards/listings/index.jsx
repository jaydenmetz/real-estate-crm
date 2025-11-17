import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { listingsConfig } from '../../../config/entities/listings.config';
import { ListingCard, ListingListItem, ListingTableRow } from './view-modes';
import NewListingModal from './modals/NewListingModal';

// DEBUG: Log all imports to verify they're defined
console.log('[ListingsDashboard] Component imports:', {
  ListingCard,
  ListingListItem,
  ListingTableRow,
  NewListingModal,
  listingsConfig: !!listingsConfig
});

/**
 * ListingsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by listingsConfig and DashboardTemplate,
 * matching the escrows dashboard architecture.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 *
 * Custom Components:
 * - Stat Cards: Reusable stat card components in hero/stats/
 * - Navigation: Uses template DashboardNavigation (no custom component)
 * - View Modes:
 *   - Card (grid): ListingCard component
 *   - List: ListingListItem component (horizontal with image)
 *   - Table: ListingTableRow component (compact table)
 */
const ListingsDashboard = () => {
  // DEBUG: Log before rendering
  console.log('[ListingsDashboard] Rendering with components:', {
    CardComponent: ListingCard,
    ListComponent: ListingListItem,
    TableComponent: ListingTableRow
  });

  return (
    <DashboardTemplate
      config={listingsConfig}
      CardComponent={ListingCard}
      ListComponent={ListingListItem}
      TableComponent={ListingTableRow}
      NewItemModal={NewListingModal}
    />
  );
};

export default ListingsDashboard;
