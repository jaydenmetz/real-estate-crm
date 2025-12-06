import React from 'react';
import { Person, PersonAdd } from '@mui/icons-material';
import { EntitySearchInput } from './EntitySearchInput';
import { clientsAPI } from '../../../../services/api.service';

/**
 * Client Search Input Component
 * Thin wrapper around EntitySearchInput for searching clients
 *
 * @param {object} value - Currently selected client object
 * @param {function} onChange - Change handler: (client) => void
 * @param {string} label - Static label (overrides dynamic labels)
 * @param {string} initialLabel - Label before selection (default: "Select Client")
 * @param {string} selectedLabel - Label after selection (default: "Selected Client")
 * @param {string} placeholder - Placeholder text
 * @param {string} color - Theme color
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {function} onAddNew - Optional callback when "Add New Client" is clicked: (searchText) => void
 */
export const ClientInput = ({
  value,
  onChange,
  label,
  initialLabel = 'Select Client',
  selectedLabel = 'Selected Client',
  placeholder = 'Search clients...',
  color = '#8b5cf6', // Purple for clients
  disabled = false,
  autoFocus = false,
  onAddNew,
  ...props
}) => {
  // Search function for clients
  const searchClients = async (searchText) => {
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

      const response = await clientsAPI.getAll(params);

      if (response.success && response.data) {
        return response.data.clients || response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  };

  // Display label: First Last
  const getDisplayLabel = (client) => {
    const firstName = client.first_name || client.firstName || '';
    const lastName = client.last_name || client.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Client';
  };

  // Sub label: email or phone
  const getSubLabel = (client) => {
    const email = client.email || client.client_email || '';
    const phone = client.phone || client.client_phone || '';
    return email || phone || null;
  };

  // Get unique key
  const getOptionKey = (client) => client.id || client.client_id;

  return (
    <EntitySearchInput
      searchFn={searchClients}
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
      noOptionsText="No clients found"
      // "Add New Client" functionality
      onAddNew={onAddNew}
      addNewLabel={(text) => `Add "${text}" as New Client`}
      addNewIcon={PersonAdd}
      {...props}
    />
  );
};

export default ClientInput;
