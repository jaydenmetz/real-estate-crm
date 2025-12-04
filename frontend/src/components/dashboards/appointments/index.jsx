import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { appointmentsConfig } from '../../../config/entities/appointments.config';
import { AppointmentCard, AppointmentListItem, AppointmentTableRow } from './view-modes';
import { NewAppointmentModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';
import { AppointmentsHeroCarousel } from './hero';

/**
 * AppointmentsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by appointmentsConfig and DashboardTemplate,
 * matching the escrows dashboard architecture.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 *
 * Custom Components:
 * - Stat Cards: Reusable stat card components in hero/stats/
 * - Navigation: Uses template DashboardNavigation (no custom component)
 * - View Modes:
 *   - Card (grid): AppointmentCard component
 *   - List: AppointmentListItem component (horizontal with date)
 *   - Table: AppointmentTableRow component (compact table)
 * - Hero Carousel: 2-page carousel with AI Manager integration
 *
 * Status Context:
 * - StatusProvider fetches database-driven status configurations
 * - Replaces hardcoded status values with team-specific database statuses
 * - Enables user customization and multi-tenant support
 */
const AppointmentsDashboard = () => {
  return (
    <StatusProvider entityType="appointments">
      <DashboardTemplate
        config={appointmentsConfig}
        CardComponent={AppointmentCard}
        ListComponent={AppointmentListItem}
        TableComponent={AppointmentTableRow}
        NewItemModal={NewAppointmentModal}
        HeroComponent={AppointmentsHeroCarousel}
      />
    </StatusProvider>
  );
};

export default AppointmentsDashboard;
