import React from 'react';
import { Business, Add as AddIcon } from '@mui/icons-material';
import { EntitySearchInput } from './EntitySearchInput';
import { listingsAPI } from '../../../../services/api.service';

/**
 * Listing Search Input Component
 * Thin wrapper around EntitySearchInput for searching listings
 *
 * @param {object} value - Currently selected listing object
 * @param {function} onChange - Change handler: (listing) => void
 * @param {string} label - Static label (overrides dynamic labels)
 * @param {string} initialLabel - Label before selection (default: "Select Listing")
 * @param {string} selectedLabel - Label after selection (default: "Selected Listing")
 * @param {string} placeholder - Placeholder text
 * @param {string} color - Theme color
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {function} onAddNew - Optional callback when "Add New Listing" is clicked: (searchText) => void
 */
export const ListingInput = ({
  value,
  onChange,
  label,
  initialLabel = 'Select Listing',
  selectedLabel = 'Selected Listing',
  placeholder = 'Search listings...',
  color = '#f59e0b', // Amber for listings
  disabled = false,
  autoFocus = false,
  onAddNew,
  ...props
}) => {
  // Search function for listings
  const searchListings = async (searchText) => {
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

      const response = await listingsAPI.getAll(params);

      if (response.success && response.data) {
        return response.data.listings || response.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error searching listings:', error);
      return [];
    }
  };

  // Display label: Address
  const getDisplayLabel = (listing) => {
    return listing.property_address || listing.display_address || 'Unknown Address';
  };

  // Sub label: city, state
  const getSubLabel = (listing) => {
    const parts = [listing.city, listing.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Get unique key
  const getOptionKey = (listing) => listing.id || listing.listing_id;

  return (
    <EntitySearchInput
      searchFn={searchListings}
      getDisplayLabel={getDisplayLabel}
      getSubLabel={getSubLabel}
      getOptionKey={getOptionKey}
      value={value}
      onChange={onChange}
      icon={Business}
      color={color}
      placeholder={placeholder}
      label={label}
      initialLabel={initialLabel}
      selectedLabel={selectedLabel}
      disabled={disabled}
      autoFocus={autoFocus}
      noOptionsText="No listings found"
      // "Add New Listing" functionality
      onAddNew={onAddNew}
      addNewLabel={(text) => `Add "${text}" as New Listing`}
      addNewIcon={AddIcon}
      {...props}
    />
  );
};

export default ListingInput;
