import React from 'react';
import { EditDate } from '../../../common/editors/fields/EditDate';

/**
 * Listing-specific Expiration Date Editor
 * Wraps EditDate with listing-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current expiration date (ISO format)
 */
export const EditExpirationDate = ({ open, onClose, onSave, value }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Expiration Date"
      value={value}
      color="#3b82f6" // Blue theme for listings
    />
  );
};
