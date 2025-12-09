import React from 'react';
import { Person, PersonAdd } from '@mui/icons-material';
import { EntitySearchInput } from './EntitySearchInput';
import { contactsAPI } from '../../../../services/api.service';

/**
 * Contact Search Input Component
 * Thin wrapper around EntitySearchInput for searching contacts
 *
 * @param {object} value - Currently selected contact object
 * @param {function} onChange - Change handler: (contact) => void
 * @param {string} label - Static label (overrides dynamic labels)
 * @param {string} initialLabel - Label before selection (default: "Select Contact")
 * @param {string} selectedLabel - Label after selection (default: "Selected Contact")
 * @param {string} placeholder - Placeholder text
 * @param {string} color - Theme color
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {function} onAddNew - Optional callback when "Add New" is clicked: (searchText) => void
 * @param {boolean} allowManualEntry - If true, allows user to enter name manually without selecting
 * @param {function} onManualEntry - Callback when user enters name manually: ({ firstName, lastName }) => void
 */
export const ContactInput = ({
  value,
  onChange,
  label,
  initialLabel = 'Select Contact',
  selectedLabel = 'Selected Contact',
  placeholder = 'Search contacts...',
  color = '#8b5cf6', // Purple for contacts
  disabled = false,
  autoFocus = false,
  onAddNew,
  allowManualEntry = false,
  onManualEntry,
  ...props
}) => {
  // Search function for contacts
  const searchContacts = async (searchText) => {
    try {
      const params = {
        limit: searchText ? 10 : 5, // 5 recent items when empty, 10 for search
      };

      // Use search endpoint if there's text, otherwise get all
      if (searchText) {
        params.name = searchText;
        const response = await contactsAPI.search(params);
        if (response.success && response.data) {
          return response.data.contacts || response.data || [];
        }
      } else {
        // Get recent contacts
        const response = await contactsAPI.getAll({
          limit: 5,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        if (response.success && response.data) {
          return response.data.contacts || response.data || [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  };

  // Display label: First Last
  const getDisplayLabel = (contact) => {
    const firstName = contact.first_name || contact.firstName || '';
    const lastName = contact.last_name || contact.lastName || '';
    return `${firstName} ${lastName}`.trim() || contact.full_name || 'Unknown Contact';
  };

  // Sub label: email or phone
  const getSubLabel = (contact) => {
    const email = contact.email || '';
    const phone = contact.phone || '';
    return email || phone || null;
  };

  // Get unique key
  const getOptionKey = (contact) => contact.id || contact.contact_id;

  // Handle manual entry if allowed
  const handleAddNew = (searchText) => {
    if (allowManualEntry && onManualEntry) {
      // Parse the search text into first and last name
      const parts = searchText.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      onManualEntry({ firstName, lastName, isNew: true });
    } else if (onAddNew) {
      onAddNew(searchText);
    }
  };

  return (
    <EntitySearchInput
      searchFn={searchContacts}
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
      noOptionsText="No contacts found"
      // "Add New" functionality
      onAddNew={allowManualEntry || onAddNew ? handleAddNew : undefined}
      addNewLabel={(text) => allowManualEntry ? `Use "${text}"` : `Add "${text}" as New Contact`}
      addNewIcon={PersonAdd}
      {...props}
    />
  );
};

export default ContactInput;
