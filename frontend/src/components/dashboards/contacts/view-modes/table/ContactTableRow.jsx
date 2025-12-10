import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import { alpha } from '@mui/material';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { getContactDisplayName, getSubtitle } from '../../../../../utils/displayNameStrategies';

// Import ClientCircles component
import { ClientCircles } from '../../../../common/ui/ClientCircles';

// ============================================================================
// LIFETIME VALUE MASKING (for privacy toggle)
// ============================================================================

const maskLifetimeValue = (value) => {
  const absValue = Math.abs(value || 0);
  if (absValue >= 100000) return '$***,***';
  if (absValue >= 10000) return '$**,***';
  if (absValue >= 1000) return '$*,***';
  if (absValue >= 100) return '$***';
  if (absValue >= 10) return '$**';
  return '$*';
};

// ============================================================================
// TABLE VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate table config for contacts
 * @returns {Object} Table configuration object
 */
const useContactTableConfig = () => {
  return useMemo(() => {
    return {
      // Grid layout: 8 columns (Name, Contact, Portfolio, Lifetime Value, Created, Last Follow Up, Associated, Actions)
      gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px 80px',

      // No status config for contacts (no workflow status)
      statusConfig: null,

      // Column configurations
      columns: [
        // Name (with subtitle for email/phone)
        {
          label: 'Name',
          field: (contact) => getContactDisplayName(contact),
          subtitle: (contact) => getSubtitle('contact', contact) || 'No contact info',
          editable: false,
          align: 'left',
          bold: true,
          hoverColor: 'rgba(139, 92, 246, 0.08)',
        },

        // Contact Info (phone & email combined)
        {
          label: 'Contact',
          field: (contact) => {
            const phone = contact.phone || '';
            const email = contact.email || '';
            if (phone && email) return phone;
            return phone || email || '—';
          },
          subtitle: (contact) => {
            const phone = contact.phone || '';
            const email = contact.email || '';
            if (phone && email) return email;
            return '';
          },
          editable: false,
          align: 'left',
          hoverColor: alpha('#000', 0.05),
        },

        // Total Portfolio
        {
          label: 'Portfolio',
          field: (contact) => contact.total_portfolio || contact.totalPortfolio || 0,
          formatter: (value) => formatCurrency(value),
          editable: false,
          align: 'left',
          bold: true,
          color: '#10b981',
          hoverColor: 'rgba(16, 185, 129, 0.08)',
        },

        // Lifetime Value (with toggle)
        {
          label: 'Lifetime Value',
          field: (contact) => contact.lifetime_value || contact.lifetimeValue || 0,
          formatter: (value) => formatCurrency(value),
          editable: false,
          toggle: {
            maskFn: maskLifetimeValue,
            privacyLinked: false, // Independent toggle (no master for contacts)
          },
          align: 'left',
          bold: true,
          color: '#8B5CF6',
          hoverColor: 'rgba(139, 92, 246, 0.08)',
        },

        // Created Date
        {
          label: 'Created',
          field: 'created_at',
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
          editable: false,
          align: 'left',
          hoverColor: alpha('#000', 0.05),
        },

        // Last Follow Up Date
        {
          label: 'Last Follow Up',
          field: (contact) => contact.last_follow_up || contact.lastFollowUp || contact.last_contact_date,
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
          editable: false,
          align: 'left',
          hoverColor: alpha('#000', 0.05),
        },

        // Associated Contacts (contact circles)
        {
          label: 'Associated',
          field: 'associated_contacts',
          customRenderer: (contact) => {
            const associatedContacts = contact.associated_contacts || contact.contacts || [];
            if (associatedContacts.length === 0) {
              return null;
            }
            return (
              <ClientCircles
                clients={{ buyers: associatedContacts, sellers: [] }}
                representationType="buyer"
                maxVisible={3}
                size="small"
              />
            );
          },
          editable: false,
          align: 'left',
        },
      ],
    };
  }, []);
};

/**
 * ContactTableRow - Compact table view for contacts dashboard
 *
 * Uses TableRowTemplate with inline configuration.
 *
 * Features:
 * - Grid layout with 7 columns
 * - Display name with contact info subtitle
 * - Portfolio and Lifetime Value with privacy toggle
 * - Created and Last Follow Up dates
 * - Quick actions menu
 */
const ContactTableRow = React.memo(({
  contact,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  // Multi-select props
  isSelectable,
  isSelected,
  onSelect,
}) => {
  // Generate config for contact table rows
  const config = useContactTableConfig();

  return (
    <TableRowTemplate
      data={contact}
      config={config}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
      isSelectable={isSelectable}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
});

ContactTableRow.displayName = 'ContactTableRow';

export default ContactTableRow;
