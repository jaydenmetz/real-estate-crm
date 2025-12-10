import React, { useMemo } from 'react';
import { CardTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  PersonAdd,
  Email,
  Phone,
  Event,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { getLeadDisplayName, getSubtitle } from '../../../../../utils/displayNameStrategies';
import { ClientCircles } from '../../../../common/ui/ClientCircles';
import { useStatus } from '../../../../../contexts/StatusContext';
import { getStatusConfig as getLeadStatusConfig } from '../../../../../constants/leadConfig';

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

// ============================================================================
// CARD VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate card config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Card configuration object
 */
const useLeadCardConfig = (statuses) => {
  return useMemo(() => {
    // Transform database statuses into dropdown options, or use defaults
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          color: status.color,
        }))
      : [
          // Default fallback status options
          { value: 'new', label: 'New', color: '#3b82f6' },
          { value: 'contacted', label: 'Contacted', color: '#8b5cf6' },
          { value: 'met', label: 'Met', color: '#10b981' },
          { value: 'under_contract', label: 'Under Contract', color: '#f59e0b' },
          { value: 'closed', label: 'Closed', color: '#06b6d4' },
          { value: 'competing', label: 'Competing', color: '#f97316' },
          { value: 'rejected', label: 'Rejected', color: '#ef4444' },
          { value: 'unresponsive', label: 'Unresponsive', color: '#94a3b8' },
          { value: 'deferred', label: 'Deferred', color: '#a855f7' },
          { value: 'unqualified', label: 'Unqualified', color: '#6b7280' },
        ];

    return {
      // Image/Header Configuration - Show PersonAdd icon for leads
      image: {
        source: () => null, // No image for leads
        fallbackIcon: PersonAdd,
        aspectRatio: '3 / 2',
      },

      // Status Chip Configuration (top-left, editable)
      status: {
        field: 'lead_status',
        getConfig: (status) => {
          const config = getLeadStatusConfig(status);
          return {
            label: config.label,
            color: config.color,
            bg: config.bg,
          };
        },
        editable: true,
        options: statusOptions,
        onSave: (lead, newStatus) => {
          return { lead_status: newStatus };
        },
      },

      // Title Configuration (display_name with fallback to computed name)
      title: {
        field: (lead) => getLeadDisplayName(lead),
        editable: false, // Don't allow inline name editing from card
      },

      // Subtitle Configuration (phone + email)
      subtitle: {
        formatter: (lead) => getSubtitle('lead', lead),
      },

      // Metrics Configuration (Target Price and Commission)
      metrics: [
        // Target Price
        {
          label: 'Target Price',
          field: (lead) => lead.target_price || lead.budget || 0,
          formatter: (value) => formatCurrency(value),
          color: {
            primary: '#10b981',
            secondary: '#059669',
            bg: alpha('#10b981', 0.08),
          },
          editable: false,
        },

        // Commission (3% of target price)
        {
          label: 'Est. Commission',
          field: (lead) => {
            const targetPrice = lead.target_price || lead.budget || 0;
            const commissionRate = lead.commission_rate || 0.03; // Default 3%
            return targetPrice * commissionRate;
          },
          formatter: (value) => formatCurrency(value),
          color: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            bg: alpha('#6366f1', 0.08),
          },
          editable: false,
        },
      ],

      // Footer Configuration (Created Date + Expiration Date + Contacts)
      footer: {
        fields: [
          // Created Date
          {
            label: 'Created',
            field: 'created_at',
            formatter: (value) => formatCompactDate(value),
            editable: false,
          },

          // Expiration Date
          {
            label: 'Expires',
            field: (lead) => lead.expiration_date || lead.expires_at,
            formatter: (value) => formatCompactDate(value),
            editable: false,
          },

          // Lead Contacts (contact circles)
          {
            label: (lead) => {
              const contacts = lead.contacts || [];
              return contacts.length === 1 ? 'Contact' : 'Contacts';
            },
            field: 'contacts',
            customRenderer: (lead) => {
              // Get contacts from lead data
              const contacts = lead.contacts || [];

              // If no contacts, show the lead itself as a "contact"
              if (contacts.length === 0 && (lead.first_name || lead.last_name)) {
                const leadAsContact = [{
                  id: lead.id,
                  first_name: lead.first_name,
                  last_name: lead.last_name,
                  email: lead.email,
                  phone: lead.phone,
                }];
                return (
                  <ClientCircles
                    clients={{ buyers: leadAsContact, sellers: [] }}
                    representationType="buyer"
                    maxVisible={6}
                  />
                );
              }

              // Show actual contacts
              return (
                <ClientCircles
                  clients={{ buyers: contacts, sellers: [] }}
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
  }, [statuses]);
};

/**
 * LeadCard - Card view for leads dashboard
 *
 * Uses CardTemplate for consistent card layout across the app.
 * Matches the design pattern of EscrowCard.
 *
 * Layout:
 * - Header: PersonAdd icon with status chip
 * - Title: Lead Display Name (First Last)
 * - Subtitle: Phone • Email
 * - Metrics: Target Price | Est. Commission
 * - Footer: Created | Expires | Contacts
 */
const LeadCard = React.memo(({
  lead,
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
  // Get database-driven statuses from context
  const { statuses } = useStatus();

  // Generate config for lead cards with database statuses
  const config = useLeadCardConfig(statuses);

  return (
    <CardTemplate
      data={lead}
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

LeadCard.displayName = 'LeadCard';

export default LeadCard;
