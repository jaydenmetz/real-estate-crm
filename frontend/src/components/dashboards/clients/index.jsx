import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { clientsConfig } from '../../../config/entities/clients.config';
import { ClientCard, ClientListItem, ClientTableRow } from './view-modes';
import { NewClientModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';

/**
 * ClientsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by clientsConfig and DashboardTemplate,
 * eliminating ~2,500 lines of duplicate code.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 *
 * Custom Components:
 * - View Modes:
 *   - Card (grid): ClientCard component (now uses CardTemplate)
 *   - List: ClientListItem component (horizontal with image)
 *   - Table: ClientTableRow component (compact table)
 *
 * Status Context:
 * - StatusProvider fetches database-driven status configurations
 * - Replaces hardcoded status values with team-specific database statuses
 * - Enables user customization and multi-tenant support
 */
const ClientsDashboard = () => {
  return (
    <StatusProvider entityType="clients">
      <DashboardTemplate
        config={clientsConfig}
        CardComponent={ClientCard}
        ListComponent={ClientListItem}
        TableComponent={ClientTableRow}
        NewItemModal={NewClientModal}
      />
    </StatusProvider>
  );
};

export default ClientsDashboard;
