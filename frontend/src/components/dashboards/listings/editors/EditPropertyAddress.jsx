import React from 'react';
import { EditAddress } from '../../../common/editors/specialized/EditAddress';

/**
 * Listing-specific Property Address Editor
 * Wraps EditAddress with listing-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (addressData) => void - receives full address object
 * @param {string} value - Current property display address (shows in UI, editable)
 * @param {Object} data - Full listing object (contains property_address, city, state, zip_code, etc.)
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 * @param {string} color - Theme color override
 */
export const EditPropertyAddress = ({
  open,
  onClose,
  onSave,
  value, // property_address_display (what user sees)
  data, // Full listing object from CardTemplate/ListItemTemplate
  inline = false,
  color = '#f59e0b', // Amber theme for listings
}) => {
  // Build full address object from listing data
  const addressObject = data ? {
    property_address: data.property_address || '',
    display_address: data.display_address || data.property_address || '',
    city: data.city || '',
    state: data.state || '',
    zip_code: data.zip_code || '',
    county: data.county || '',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
  } : value; // Fallback to value if no data object

  return (
    <EditAddress
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Property Address"
      value={addressObject}
      color={color}
      inline={inline}
    />
  );
};
