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
 * @param {string} canonicalValue - Current canonical address (for geocoding, optional)
 */
export const EditPropertyAddress = ({
  open,
  onClose,
  onSave,
  value, // property_address_display (what user sees)
  canonicalValue, // property_address (for reference, optional)
}) => {
  return (
    <EditAddress
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Property Address"
      value={value} // Pass display address for editing
      color="#10b981" // Green theme for property
    />
  );
};
