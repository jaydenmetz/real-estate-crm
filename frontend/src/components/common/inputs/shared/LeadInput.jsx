import React from 'react';
import { Person, PersonAdd } from '@mui/icons-material';
import { EntitySearchInput } from './EntitySearchInput';
import { leadsAPI } from '../../../../services/api.service';

/**
 * Lead Search Input Component
 * Thin wrapper around EntitySearchInput for searching leads
 *
 * @param {object} value - Currently selected lead object
 * @param {function} onChange - Change handler: (lead) => void
 * @param {string} label - Static label (overrides dynamic labels)
 * @param {string} initialLabel - Label before selection (default: "Select Lead")
 * @param {string} selectedLabel - Label after selection (default: "Selected Lead")
 * @param {string} placeholder - Placeholder text
 * @param {string} color - Theme color
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {function} onAddNew - Optional callback when "Add New Lead" is clicked: (searchText) => void
 */
export const LeadInput = ({
  value,
  onChange,
  label,
  initialLabel = 'Select Lead',
  selectedLabel = 'Selected Lead',
  placeholder = 'Search leads...',
  color = '#3b82f6', // Blue for leads
  disabled = false,
  autoFocus = false,
  onAddNew,
  ...props
}) => {
  // Search function for leads
  const searchLeads = async (searchText) => {
    try {
      const params = {
        limit: searchText ? 10 : 5, // 5 recent items when empty, 10 for search
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      // Only add search param if there's text
      if (searchText) {
        params.search = searchText;
      }

      const response = await leadsAPI.getAll(params);

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
      initialLabel={initialLabel}
      selectedLabel={selectedLabel}
      disabled={disabled}
      autoFocus={autoFocus}
      noOptionsText="No leads found"
      // "Add New Lead" functionality
      onAddNew={onAddNew}
      addNewLabel={(text) => `Add "${text}" as New Lead`}
      addNewIcon={PersonAdd}
      {...props}
    />
  );
};

export default LeadInput;
