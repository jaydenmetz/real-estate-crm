import React, { useMemo } from 'react';
import { CardTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  Person as PersonIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditClientName,
  EditClientEmail,
  EditClientPhone,
  EditClientStatus,
  EditClientBudget,
} from '../../editors';

// Import LeadCircles component for footer
import { LeadCircles } from '../../../../common/ui/LeadCircles';

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const getStatusConfig = (stage) => {
  const configs = {
    'New': { label: 'New', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    'Qualified': { label: 'Qualified', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    'Showing': { label: 'Showing', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    'Offer': { label: 'Offer', color: '#ec4899', bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
    'Contract': { label: 'Contract', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    'Closed': { label: 'Closed', color: '#059669', bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
    'active': { label: 'Active', color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    'inactive': { label: 'Inactive', color: '#9ca3af', bg: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' },
    'lead': { label: 'Lead', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    'past_client': { label: 'Past', color: '#6b7280', bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' },
  };
  return configs[stage] || configs['New'];
};

// ============================================================================
// BUDGET CONFIGURATION
// ============================================================================

const getBudgetConfig = (priceMin, priceMax) => {
  const midPrice = priceMax || priceMin || 0;

  if (midPrice < 300000) {
    return {
      label: 'Budget-Friendly',
      range: '<$300k',
      color: '#10b981',
      bg: alpha('#10b981', 0.08),
    };
  } else if (midPrice < 550000) {
    return {
      label: 'Classic',
      range: '$300k-$550k',
      color: '#3b82f6',
      bg: alpha('#3b82f6', 0.08),
    };
  } else if (midPrice < 1000000) {
    return {
      label: 'Premium',
      range: '$550k-$1M',
      color: '#8b5cf6',
      bg: alpha('#8b5cf6', 0.08),
    };
  } else {
    return {
      label: 'Luxury',
      range: '$1M+',
      color: '#f59e0b',
      bg: alpha('#f59e0b', 0.08),
    };
  }
};

// Compact date formatter
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
const useClientCardConfig = (statuses) => {
  return useMemo(() => {
    // Transform database statuses into dropdown options
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: status.status_key === 'inactive' ? Cancel : CheckCircle,
          color: status.color,
        }))
      : [
          { value: 'active', label: 'Active', icon: CheckCircle, color: '#10b981' },
          { value: 'lead', label: 'Lead', icon: CheckCircle, color: '#3b82f6' },
          { value: 'inactive', label: 'Inactive', icon: Cancel, color: '#9ca3af' },
          { value: 'past_client', label: 'Past Client', icon: CheckCircle, color: '#6b7280' },
        ];

    return {
      // Image/Header Configuration - Avatar placeholder for clients
      image: {
        source: (client) => client.avatar_url || client.avatarUrl || null,
        fallbackIcon: PersonIcon,
        aspectRatio: '3 / 2',
      },

      // Status Chip Configuration (top-left, editable)
      status: {
        field: (client) => client.stage || client.status || client.client_status || 'New',
        getConfig: (status) => {
          const config = getStatusConfig(status);
          return {
            label: config.label,
            color: config.color,
            bg: config.bg,
          };
        },
        editable: true,
        options: statusOptions,
        onSave: (client, newStatus) => {
          return { client_status: newStatus, stage: newStatus };
        },
      },

      // Title Configuration (client name, editable)
      title: {
        field: (client) => {
          const firstName = client.firstName || client.first_name || '';
          const lastName = client.lastName || client.last_name || '';
          return `${firstName} ${lastName}`.trim() || 'Unnamed Client';
        },
        editable: true,
        editor: EditClientName,
        onSave: (client, newName) => {
          // Parse name into first/last
          const parts = newName.trim().split(/\s+/);
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || '';
          return {
            first_name: firstName,
            last_name: lastName,
          };
        },
      },

      // Subtitle Configuration (client type + email)
      subtitle: {
        formatter: (client) => {
          const clientType = client.clientType || client.client_type || 'Buyer';
          const email = client.email || client.client_email || '';
          return email ? `${clientType} • ${email}` : clientType;
        },
      },

      // Metrics Configuration (2 columns - Budget and Doc Type)
      metrics: [
        // Budget Range (editable)
        {
          label: 'Budget',
          field: (client) => {
            const budgetConfig = getBudgetConfig(client.priceRangeMin, client.priceRangeMax);
            return budgetConfig.label;
          },
          formatter: (value) => value,
          color: (client) => {
            const budgetConfig = getBudgetConfig(client?.priceRangeMin, client?.priceRangeMax);
            return {
              primary: budgetConfig.color,
              secondary: budgetConfig.color,
              bg: budgetConfig.bg,
            };
          },
          editable: true,
          editor: EditClientBudget,
          editorProps: (client) => ({
            value: client.priceRangeMax || client.priceRangeMin || 0,
            priceMin: client.priceRangeMin || 0,
            priceMax: client.priceRangeMax || 0,
          }),
          onSave: (client, updates) => {
            return {
              priceRangeMin: updates.priceMin || updates,
              priceRangeMax: updates.priceMax || updates,
            };
          },
        },

        // Representation Doc Type
        {
          label: 'Doc Type',
          field: (client) => client.representationDocType || 'TBD',
          formatter: (value) => value,
          color: {
            primary: '#6366f1',
            secondary: '#4f46e5',
            bg: alpha('#6366f1', 0.08),
          },
          editable: false, // Can be made editable with appropriate editor
        },
      ],

      // Footer Configuration (Agreement dates + Leads)
      footer: {
        fields: [
          // Beginning Date
          {
            label: 'Beginning',
            field: 'agreementStartDate',
            formatter: (value) => formatCompactDate(value),
            editable: false, // Can be made editable
          },

          // Expiration Date with countdown
          {
            label: (client) => {
              if (!client?.agreementEndDate) return 'Expiration';
              const endDate = new Date(client.agreementEndDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              endDate.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

              if (diffDays < 0) return 'Expired';
              if (diffDays <= 30) return 'Expiring';
              return 'Expiration';
            },
            field: 'agreementEndDate',
            formatter: (value) => formatCompactDate(value),
            editable: false, // Can be made editable
          },

          // Leads (editable) - Shows lead avatars/initials like escrows has clients
          {
            label: (client) => {
              const leads = client.leads || [];
              return leads.length === 1 ? 'Lead' : 'Leads';
            },
            field: 'leads',
            customRenderer: (client, onEdit) => {
              const leads = client.leads || [];

              return (
                <LeadCircles
                  leads={leads}
                  onEdit={onEdit}
                  maxVisible={6}
                />
              );
            },
            editable: false, // Set to true when EditLeads component is ready
            // editor: EditLeads, // TODO: Create EditLeads component
            // onSave: (client, leadsData) => {
            //   return { leads: leadsData };
            // },
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
 * ClientCard - Card view for clients dashboard
 *
 * Now uses CardTemplate with inline configuration for better colocation.
 * Reduced from 859 lines to ~280 lines by using CardTemplate.
 *
 * Features preserved:
 * - Inline editors: name, email, phone, status, budget
 * - Status menu: dynamically populated from database
 * - Click to navigate to detail page
 * - Quick actions: view, archive, restore, delete
 * - Lead circles in footer (like escrows has clients)
 */
const ClientCard = React.memo(({
  client,
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
  viewMode,
  index,
}) => {
  // Try to get statuses from context, but don't fail if not available
  let statuses = [];
  try {
    const statusContext = useStatus();
    statuses = statusContext?.statuses || [];
  } catch (e) {
    // StatusProvider not available - use defaults
  }

  // Generate config with database-driven status options
  const config = useClientCardConfig(statuses);

  return (
    <CardTemplate
      data={client}
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

ClientCard.displayName = 'ClientCard';

export default ClientCard;
