import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { clientsConfig } from '../../../config/entities/clients.config';
import { ClientCard } from '../../common/view-modes/card';
import NewClientModal from './modals/NewClientModal';

/**
 * ClientsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by clientsConfig and DashboardTemplate,
 * eliminating ~2,500 lines of duplicate code.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 */
const ClientsDashboard = () => {
  return (
    <DashboardTemplate
      config={clientsConfig}
      CardComponent={ClientCard}
      NewItemModal={NewClientModal}
    />
  );
};

export default ClientsDashboard;
