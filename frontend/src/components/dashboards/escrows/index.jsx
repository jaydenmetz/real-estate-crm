import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { escrowsConfig } from '../../../config/entities/escrows.config';
import { EscrowCard, EscrowListItem, EscrowTableRow } from './view-modes';
import { NewEscrowModal } from './modals/NewEscrowModal';

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
 * - Stat Cards: Reusable stat card components in hero/stats/
 * - Navigation: Uses template DashboardNavigation (no custom component)
 * - View Modes:
 *   - Card (grid): EscrowCard component
 *   - List: EscrowListItem component (horizontal with image)
 *   - Table: EscrowTableRow component (compact table)
 */
const EscrowsDashboard = () => {
  return (
    <DashboardTemplate
      config={escrowsConfig}
      CardComponent={EscrowCard}
      ListComponent={EscrowListItem}
      TableComponent={EscrowTableRow}
      NewItemModal={NewEscrowModal}
    />
  );
};

export default EscrowsDashboard;
