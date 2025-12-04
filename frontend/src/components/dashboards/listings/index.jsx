import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { listingsConfig } from '../../../config/entities/listings.config';
import { ListingCard, ListingListItem, ListingTableRow } from './view-modes';
import NewListingModal from './modals/NewListingModal';
import { PrivacyProvider } from '../../../contexts/PrivacyContext';
import { StatusProvider } from '../../../contexts/StatusContext';
import { ListingsHeroCarousel } from './hero';

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
 * - Hero Carousel: 2-page carousel with AI Manager integration
 *
 * Privacy Context:
 * - PrivacyProvider enables master toggle control for commission privacy
 * - Top stat card acts as master toggle
 * - Individual cards respect master state while allowing independent control
 *
 * Status Context:
 * - StatusProvider fetches database-driven status configurations
 * - Replaces hardcoded status values with team-specific database statuses
 * - Enables user customization and multi-tenant support
 */
const ListingsDashboard = () => {
  return (
    <StatusProvider entityType="listings">
      <PrivacyProvider entityType="listings">
        <DashboardTemplate
          config={listingsConfig}
          CardComponent={ListingCard}
          ListComponent={ListingListItem}
          TableComponent={ListingTableRow}
          NewItemModal={NewListingModal}
          HeroComponent={ListingsHeroCarousel}
        />
      </PrivacyProvider>
    </StatusProvider>
  );
};

export default ListingsDashboard;
