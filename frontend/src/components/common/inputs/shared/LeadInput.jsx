import React from 'react';
import { Person } from '@mui/icons-material';
import { EntitySearchInput } from './EntitySearchInput';
import { leadsAPI } from '../../../../services/api.service';

/**
 * Lead Search Input Component
 * Thin wrapper around EntitySearchInput for searching leads
 *
 * @param {object} value - Currently selected lead object
 * @param {function} onChange - Change handler: (lead) => void
 * @param {string} label - Optional label above input
 * @param {string} placeholder - Placeholder text
 * @param {string} color - Theme color
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const LeadInput = ({
  value,
  onChange,
  label,
  placeholder = 'Search leads...',
  color = '#3b82f6', // Blue for leads
  disabled = false,
  autoFocus = false,
  ...props
}) => {
  // Search function for leads
  const searchLeads = async (searchText) => {
    try {
      const response = await leadsAPI.getAll({
        search: searchText,
        limit: 10,
      });

      if (response.success && response.data) {
        return response.data.leads || response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error searching leads:', error);
      return [];
    }
  };

  // Display label: First Last
  const getDisplayLabel = (lead) => {
    const firstName = lead.first_name || lead.firstName || '';
    const lastName = lead.last_name || lead.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Lead';
  };

  // Sub label: email or phone
  const getSubLabel = (lead) => {
    const email = lead.email || '';
    const phone = lead.phone || '';
    return email || phone || null;
  };

  // Get unique key
  const getOptionKey = (lead) => lead.id || lead.lead_id;

  return (
    <EntitySearchInput
      searchFn={searchLeads}
      getDisplayLabel={getDisplayLabel}
      getSubLabel={getSubLabel}
      getOptionKey={getOptionKey}
      value={value}
      onChange={onChange}
      icon={Person}
      color={color}
      placeholder={placeholder}
      label={label}
      disabled={disabled}
      autoFocus={autoFocus}
      noOptionsText="No leads found"
      {...props}
    />
  );
};

export default LeadInput;
