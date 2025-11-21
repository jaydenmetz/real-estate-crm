import React from 'react';
import { EditAddress } from '../../../common/editors/specialized/EditAddress';

/**
 * Escrow-specific Property Address Editor
 * Wraps EditAddress with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (addressData) => void - receives full address object
 * @param {string} value - Current property display address (shows in UI, editable)
 * @param {Object} data - Full escrow object (contains property_address, city, state, zip_code, etc.)
 */
export const EditPropertyAddress = ({
  open,
  onClose,
  onSave,
  value, // property_address_display (what user sees)
  data, // Full escrow object from CardTemplate/ListItemTemplate
}) => {
  // Build full address object from escrow data
  const addressObject = data ? {
    property_address: data.property_address || '',
    display_address: data.display_address || data.property_address || '',
    city: data.city || '',
    state: data.state || '',
    zip_code: data.zip_code || '',
    county: data.county || '',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
  } : value; // Fallback to string value if no data object

  return (
    <EditAddress
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Property Address"
      value={addressObject} // Pass full address object with city/state/zip
      color="#10b981" // Green theme for property
    />
  );
};
