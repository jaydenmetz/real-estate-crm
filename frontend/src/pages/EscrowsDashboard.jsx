import React from 'react';
import { DashboardTemplate } from '../templates/Dashboard';
import { escrowsConfig } from '../config/entities/escrows.config';
import EscrowCard from '../components/common/widgets/EscrowCard';
import { NewEscrowModal } from '../components/dashboards/escrows/modals/NewEscrowModal';

/**
 * EscrowsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This replaces the old custom dashboard with a config-driven approach.
 * All behavior is defined in escrowsConfig (config/entities/escrows.config.js)
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
