import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { escrowsConfig } from '../../../config/entities/escrows.config';
import EscrowCard from './view-modes/card/EscrowCard';
import { NewEscrowModal } from './modals/NewEscrowModal';

/**
 * EscrowsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by escrowsConfig and DashboardTemplate,
 * eliminating ~2,000 lines of duplicate code.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 */
const EscrowsDashboard = () => {
  return (
    <DashboardTemplate
      config={escrowsConfig}
      CardComponent={EscrowCard}
      NewItemModal={NewEscrowModal}
    />
  );
};

export default EscrowsDashboard;
