import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { leadsConfig } from '../../../config/entities/leads.config';
import { LeadCard, LeadListItem, LeadTableRow } from './view-modes';
import { NewLeadModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';
import { LeadsHeroCarousel } from './hero';

/**
 * LeadsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by leadsConfig and DashboardTemplate,
 * matching the escrows dashboard architecture.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 *
 * Custom Components:
 * - Stat Cards: Reusable stat card components in hero/stats/
 * - Navigation: Uses template DashboardNavigation (no custom component)
 * - View Modes:
 *   - Card (grid): LeadCard component
 *   - List: LeadListItem component (horizontal with priority)
 *   - Table: LeadTableRow component (compact table)
 * - Hero Carousel: 2-page carousel with AI Lead Nurturing Manager integration
 *
 * Status Context:
 * - StatusProvider fetches database-driven status configurations
 * - Replaces hardcoded status values with team-specific database statuses
 * - Enables user customization and multi-tenant support
 */
const LeadsDashboard = () => {
  return (
    <StatusProvider entityType="leads">
      <DashboardTemplate
        config={leadsConfig}
        CardComponent={LeadCard}
        ListComponent={LeadListItem}
        TableComponent={LeadTableRow}
        NewItemModal={NewLeadModal}
        HeroComponent={LeadsHeroCarousel}
      />
    </StatusProvider>
  );
};

export default LeadsDashboard;
