import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { listingsConfig } from '../../../config/entities/listings.config';
import ListingCard from './view-modes/card/ListingCard';
import NewListingModal from './modals/NewListingModal';

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
 * - View Modes: ListingCard component in view-modes/card/
 */
const ListingsDashboard = () => {
  return (
    <DashboardTemplate
      config={listingsConfig}
      CardComponent={ListingCard}
      NewItemModal={NewListingModal}
    />
  );
};

export default ListingsDashboard;
