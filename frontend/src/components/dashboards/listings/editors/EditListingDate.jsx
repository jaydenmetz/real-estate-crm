import React from 'react';
import { EditDate } from '../../../common/editors/fields/EditDate';

/**
 * Listing-specific Listing Date Editor
 * Wraps EditDate with listing-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current listing date (ISO format)
 */
export const EditListingDate = ({ open, onClose, onSave, value }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Listing Date"
      value={value}
      color="#3b82f6" // Blue theme for listings
    />
  );
};
