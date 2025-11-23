import React from 'react';
import { EditDate } from '../../../common/editors/fields/EditDate';

/**
 * Listing-specific Listing Date Editor (start date)
 * Wraps EditDate with listing-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current listing date
 */
export const EditListingDate = ({ open, onClose, onSave, value }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Listing Date"
      value={value}
      color="#3b82f6" // Blue theme for listing date
    />
  );
};
