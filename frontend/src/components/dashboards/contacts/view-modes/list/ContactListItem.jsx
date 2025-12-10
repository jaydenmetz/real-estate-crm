import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  Person as PersonIcon,
} from '@mui/icons-material';
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
// LIST VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate list config for contacts
 * @returns {Object} List configuration object
 */
const useContactListConfig = () => {
  return useMemo(() => {
    return {
      // Image/Left Section Configuration - Avatar
      image: {
        source: (contact) => contact.avatar_url || contact.avatarUrl || null,
        fallbackIcon: PersonIcon,
        width: 200,
      },

      // No status chip for contacts (no workflow status)
      status: null,

      // Title Configuration (display name)
      title: {
        field: (contact) => getContactDisplayName(contact),
        editable: false,
      },

      // Subtitle Configuration (phone + email)
      subtitle: {
        formatter: (contact) => getSubtitle('contact', contact) || 'No contact info',
      },

      // Metrics Configuration (horizontal row)
      metrics: [
        // Total Portfolio
        {
          label: 'Portfolio',
          field: (contact) => contact.total_portfolio || contact.totalPortfolio || 0,
          formatter: (value) => formatCurrency(value),
          editable: false,
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
        },

        // Created Date
        {
          label: 'Created',
          field: 'created_at',
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: false,
        },

        // Last Follow Up Date
        {
          label: 'Last Follow Up',
          field: (contact) => contact.last_follow_up || contact.lastFollowUp || contact.last_contact_date,
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: false,
        },

        // Associated Contacts - Shows contact circles
        {
          label: (contact) => {
            const associatedContacts = contact.associated_contacts || contact.contacts || [];
            return associatedContacts.length === 1 ? 'Contact' : 'Contacts';
          },
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
                maxVisible={4}
                size="small"
                disableHover
              />
            );
          },
          editable: false,
        },
      ],
    };
  }, []);
};

/**
 * ContactListItem - Horizontal list view for contacts dashboard
 *
 * Uses ListItemTemplate with inline configuration.
 *
 * Features:
 * - Avatar image with PersonIcon fallback
 * - Display name and contact info
 * - Portfolio and Lifetime Value metrics
 * - Created and Last Follow Up dates
 * - Associated contacts circles
 */
const ContactListItem = React.memo(({
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
  // Generate config for contact list items
  const config = useContactListConfig();

  return (
    <ListItemTemplate
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

ContactListItem.displayName = 'ContactListItem';

export default ContactListItem;
