import React from 'react';
import { EditCurrency } from '../../../common/editors/fields/EditCurrency';

/**
 * Listing-specific List Price Editor
 * Wraps EditCurrency with listing-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current list price
 */
export const EditListPrice = ({ open, onClose, onSave, value }) => {
  return (
    <EditCurrency
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="List Price"
      value={value}
      color="#3b82f6" // Blue theme for listings
      prefix="$"
    />
  );
};
