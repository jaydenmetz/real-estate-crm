import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { leadsConfig } from '../../../config/entities/leads.config';
import LeadCard from '../../common/widgets/LeadCard';
import NewLeadModal from './modals/NewLeadModal';

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
