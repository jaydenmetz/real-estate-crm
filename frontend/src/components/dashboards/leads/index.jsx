import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { leadsConfig } from '../../../config/entities/leads.config';
import { LeadCard } from './view-modes';
import { NewLeadModal } from './modals';

const LeadsDashboard = () => {
  return (
    <DashboardTemplate
      config={leadsConfig}
      CardComponent={LeadCard}
      NewItemModal={NewLeadModal}
    />
  );
};

export default LeadsDashboard;
