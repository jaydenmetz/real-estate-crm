import React, { useMemo, useState } from 'react';
import { CardTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  Person as PersonIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatters';
import { getContactDisplayName, getSubtitle } from '../../../../../utils/displayNameStrategies';
import { ClientCircles } from '../../../../common/ui/ClientCircles';

// Compact date formatter - smaller separators for tighter spacing
const formatCompactDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {month}
      <span style={{ fontSize: '0.7em', letterSpacing: '-0.5px' }}> </span>
      {day}
      <span style={{ fontSize: '0.6em' }}>, </span>
      {year}
    </span>
  );
};

// Mask function for Lifetime Value privacy toggle
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
// CARD VIEW CONFIGURATION HOOK
// ============================================================================

const useContactCardConfig = () => {
  return useMemo(() => {
    return {
      // Image/Header Configuration - Avatar for contacts
      image: {
        source: (contact) => contact.avatar_url || contact.avatarUrl || null,
        fallbackIcon: PersonIcon,
        aspectRatio: '3 / 2',
      },

      // No status chip for contacts (they use role badges instead)
      status: null,

      // Title Configuration (display_name with fallback to computed name)
      title: {
        field: (contact) => getContactDisplayName(contact),
        editable: false, // Don't allow inline name editing from card
      },

      // Subtitle Configuration (phone + email)
      subtitle: {
        formatter: (contact) => getSubtitle('contact', contact) || 'No contact info',
      },

      // Metrics Configuration (2 columns - Total Portfolio and Lifetime Value)
      metrics: [
        // Total Portfolio (sum of all associated deals)
        {
          label: 'Total Portfolio',
          field: (contact) => contact.total_portfolio || contact.totalPortfolio || 0,
          formatter: (value) => formatCurrency(value),
          color: {
            primary: '#10b981',
            secondary: '#059669',
            bg: alpha('#10b981', 0.08),
          },
          editable: false,
        },

        // Lifetime Value (with privacy toggle)
        {
          label: 'Lifetime Value',
          field: (contact) => contact.lifetime_value || contact.lifetimeValue || 0,
          formatter: (value) => formatCurrency(value),
          color: {
            primary: '#8B5CF6',
            secondary: '#7C3AED',
            bg: alpha('#8B5CF6', 0.08),
          },
          editable: false,
          toggle: {
            maskFn: maskLifetimeValue,
            privacyLinked: false, // Independent toggle per card (no master toggle)
            icon: { show: 'Visibility', hide: 'VisibilityOff' },
            defaultHidden: false,
          },
        },
      ],

      // Footer Configuration (Created + Last Follow Up + Associated Contacts)
      footer: {
        fields: [
          // Created Date
          {
            label: 'Created',
            field: 'created_at',
            formatter: (value) => formatCompactDate(value),
            editable: false,
          },

          // Last Follow Up Date
          {
            label: 'Last Follow Up',
            field: (contact) => contact.last_follow_up || contact.lastFollowUp || contact.last_contact_date,
            formatter: (value) => formatCompactDate(value),
            editable: false,
          },

          // Associated Contacts (contact circles)
          {
            label: (contact) => {
              const associatedContacts = contact.associated_contacts || contact.contacts || [];
              return associatedContacts.length === 1 ? 'Contact' : 'Contacts';
            },
            field: 'associated_contacts',
            customRenderer: (contact) => {
              // Get associated contacts from contact data
              const associatedContacts = contact.associated_contacts || contact.contacts || [];

              // If no associated contacts, don't render anything
              if (associatedContacts.length === 0) {
                return null;
              }

              // Show associated contacts as circles
              return (
                <ClientCircles
                  clients={{ buyers: associatedContacts, sellers: [] }}
                  representationType="buyer"
                  maxVisible={6}
                />
              );
            },
            editable: false,
          },
        ],
      },

      // Quick Actions Configuration
      actions: {
        view: true,
        archive: true,
        restore: true,
        delete: true,
      },
    };
  }, []);
};

/**
 * ContactCard - Card view for contacts dashboard
 *
 * Uses CardTemplate for consistent card layout across the app.
 * Matches the design pattern of EscrowCard, ClientCard, and LeadCard.
 *
 * Layout:
 * - Header: Avatar with PersonIcon fallback (no status chip)
 * - Title: Contact Display Name (First Last)
 * - Subtitle: Phone + Email
 * - Metrics: Total Portfolio | Lifetime Value (with privacy toggle)
 * - Footer: Created | Last Follow Up | Associated Contacts
 */
const ContactCard = React.memo(({
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
  // Compatibility props (ignored)
  config: _config,
  index,
}) => {
  // Generate config for contact cards
  const cardConfig = useContactCardConfig();

  return (
    <CardTemplate
      data={contact}
      config={cardConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
      isSelectable={isSelectable}
      isSelected={isSelected}
      onSelect={onSelect}
      disableMasterPrivacy={true} // No master privacy toggle for contacts
    />
  );
});

ContactCard.displayName = 'ContactCard';

export { ContactCard };
export default ContactCard;
