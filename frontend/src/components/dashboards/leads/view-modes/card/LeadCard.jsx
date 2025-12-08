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

// Status configuration for leads
// Uses lowercase_snake_case keys: new, contacted, met, under_contract, closed, competing, rejected, unresponsive, deferred, unqualified
const getLeadStatusConfig = (status) => {
  const configs = {
    // Active category (3 statuses)
    'new': { label: 'NEW', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    'contacted': { label: 'CONTACTED', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    'met': { label: 'MET', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    // Won category (2 statuses)
    'under_contract': { label: 'UNDER CONTRACT', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    'closed': { label: 'CLOSED', color: '#06b6d4', bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
    // Lost category (5 statuses)
    'competing': { label: 'COMPETING', color: '#f97316', bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
    'rejected': { label: 'REJECTED', color: '#ef4444', bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    'unresponsive': { label: 'UNRESPONSIVE', color: '#94a3b8', bg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
    'deferred': { label: 'DEFERRED', color: '#a855f7', bg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' },
    'unqualified': { label: 'UNQUALIFIED', color: '#6b7280', bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' },
  };
  // Normalize status to lowercase for consistent lookup
  const normalized = status ? status.toLowerCase() : 'new';
  return configs[normalized] || configs['new'];
};

// ============================================================================
// CARD VIEW CONFIGURATION HOOK
// ============================================================================

const useLeadCardConfig = () => {
  return useMemo(() => {
    // Static status options for leads
    const statusOptions = [
      // Active category
      { value: 'new', label: 'New', color: '#3b82f6' },
      { value: 'contacted', label: 'Contacted', color: '#8b5cf6' },
      { value: 'met', label: 'Met', color: '#10b981' },
      // Won category
      { value: 'under_contract', label: 'Under Contract', color: '#f59e0b' },
      { value: 'closed', label: 'Closed', color: '#06b6d4' },
      // Lost category
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

      // Title Configuration (Lead Display Name)
      title: {
        field: (lead) => {
          const firstName = lead.first_name || '';
          const lastName = lead.last_name || '';
          return `${firstName} ${lastName}`.trim() || 'Unnamed Lead';
        },
        editable: false, // Don't allow inline name editing from card
      },

      // Subtitle Configuration (phone/email)
      subtitle: {
        formatter: (lead) => {
          const parts = [];
          if (lead.phone) {
            // Format phone number
            const cleaned = ('' + lead.phone).replace(/\D/g, '');
            const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
            if (match) {
              parts.push('(' + match[1] + ') ' + match[2] + '-' + match[3]);
            } else {
              parts.push(lead.phone);
            }
          }
          if (lead.email) parts.push(lead.email);
          return parts.join(' • ') || null;
        },
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
  }, []);
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
  // Generate config for lead cards
  const config = useLeadCardConfig();

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
