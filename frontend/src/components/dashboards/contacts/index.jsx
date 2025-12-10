import React from 'react';
import { DashboardTemplate } from '../../../templates/Dashboard';
import { contactsConfig } from '../../../config/entities/contacts.config';
import { ContactCard, ContactListItem, ContactTableRow } from './view-modes';
import { NewContactModal } from './modals';
import { StatusProvider } from '../../../contexts/StatusContext';
import { ContactsHeroCarousel } from './hero';

/**
 * ContactsDashboard - Config-driven dashboard using DashboardTemplate
 *
 * This dashboard is now powered by contactsConfig and DashboardTemplate,
 * reducing from ~260 lines of custom code to ~55 lines.
 *
 * All functionality (stats, filtering, sorting, CRUD operations) is
 * handled by the template system using the entity configuration.
 *
 * Custom Components:
 * - Hero: ContactsHeroCarousel (spheres layout with AI Coach)
 * - Stat Cards: Not used (spheres layout shows Sphere > Leads > Clients)
 * - View Modes:
 *   - Card (grid): ContactCard component (uses CardTemplate)
 *   - List: ContactListItem component (horizontal with avatar)
 *   - Table: ContactTableRow component (compact table)
 *
 * Spheres Layout:
 * - Shows nested visualization: Sphere (all contacts) > Leads > Clients
 * - Clicking on Leads/Clients navigates to respective dashboards
 * - AI Coach card shows future AI coaching feature
 *
 * Status Context:
 * - StatusProvider fetches database-driven status configurations
 * - Contacts use role-based filtering (Sphere, Lead, Client) rather than workflow status
 */
const ContactsDashboard = () => {
  return (
    <StatusProvider entityType="contacts">
      <DashboardTemplate
        config={contactsConfig}
        CardComponent={ContactCard}
        ListComponent={ContactListItem}
        TableComponent={ContactTableRow}
        NewItemModal={NewContactModal}
        HeroComponent={ContactsHeroCarousel}
      />
    </StatusProvider>
  );
};

export default ContactsDashboard;
