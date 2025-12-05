import React from 'react';
import { Business } from '@mui/icons-material';
import { EntitySearchInput } from './EntitySearchInput';
import { listingsAPI } from '../../../../services/api.service';

/**
 * Listing Search Input Component
 * Thin wrapper around EntitySearchInput for searching listings
 *
 * @param {object} value - Currently selected listing object
 * @param {function} onChange - Change handler: (listing) => void
 * @param {string} label - Optional label above input
 * @param {string} placeholder - Placeholder text
 * @param {string} color - Theme color
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const ListingInput = ({
  value,
  onChange,
  label,
  placeholder = 'Search listings...',
  color = '#f59e0b', // Amber for listings
  disabled = false,
  autoFocus = false,
  ...props
}) => {
  // Search function for listings
  const searchListings = async (searchText) => {
    try {
      const response = await listingsAPI.getAll({
        search: searchText,
        limit: 10,
      });

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
      disabled={disabled}
      autoFocus={autoFocus}
      noOptionsText="No listings found"
      {...props}
    />
  );
};

export default ListingInput;
