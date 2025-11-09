import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { escrowsConfig } from '../../../config/entities/escrows.config';
import EscrowCard from './view-modes/card/EscrowCard';
import { NewEscrowModal } from './modals/NewEscrowModal';
import EscrowNavigation from './navigation';

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
 * - EscrowNavigation: Custom tabs and filters
 * - Stat Cards: Reusable stat card components in hero/stats/
 */
const EscrowsDashboard = () => {
  return (
    <DashboardTemplate
      config={escrowsConfig}
      CardComponent={EscrowCard}
      NewItemModal={NewEscrowModal}
      NavigationComponent={EscrowNavigation}
    />
  );
};

export default EscrowsDashboard;
