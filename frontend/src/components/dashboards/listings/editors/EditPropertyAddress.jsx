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
 * @param {string} canonicalValue - Current canonical address (for geocoding, optional)
 */
export const EditPropertyAddress = ({
  open,
  onClose,
  onSave,
  value, // property_address (what user sees)
  canonicalValue, // For reference if needed
}) => {
  return (
    <EditAddress
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Property Address"
      value={value} // Pass display address for editing
      color="#3b82f6" // Blue theme for listings
    />
  );
};
