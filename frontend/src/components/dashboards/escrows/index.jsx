import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { escrowsConfig } from '../../../config/entities/escrows.config';
import { EscrowCard, EscrowListItem, EscrowTableRow } from './view-modes';
import { NewEscrowModal } from './modals/NewEscrowModal';
import { PrivacyProvider } from '../../../contexts/PrivacyContext';
import { StatusProvider } from '../../../contexts/StatusContext';
import EscrowsHeroCarousel from './hero/EscrowsHeroCarousel';

/**
 * EscrowsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by escrowsConfig and DashboardTemplate,
 * eliminating ~2,000 lines of duplicate code.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 *
 * Custom Components:
 * - Hero: EscrowsHeroCarousel (carousel wrapper for hero section)
 * - Stat Cards: Reusable stat card components in hero/stats/
 * - Navigation: Uses template DashboardNavigation (no custom component)
 * - View Modes:
 *   - Card (grid): EscrowCard component
 *   - List: EscrowListItem component (horizontal with image)
 *   - Table: EscrowTableRow component (compact table)
 *
 * Privacy Context:
 * - PrivacyProvider enables master toggle control for commission privacy
 * - Top stat card (TotalCommissionCard) acts as master toggle
 * - Individual cards respect master state while allowing independent control
 *
 * Status Context:
 * - StatusProvider fetches database-driven status configurations
 * - Replaces hardcoded status values with team-specific database statuses
 * - Enables user customization and multi-tenant support
 */
const EscrowsDashboard = () => {
  return (
    <StatusProvider entityType="escrows">
      <PrivacyProvider entityType="escrows">
        <DashboardTemplate
          config={escrowsConfig}
          CardComponent={EscrowCard}
          ListComponent={EscrowListItem}
          TableComponent={EscrowTableRow}
          NewItemModal={NewEscrowModal}
          HeroComponent={EscrowsHeroCarousel}
        />
      </PrivacyProvider>
    </StatusProvider>
  );
};

export default EscrowsDashboard;
