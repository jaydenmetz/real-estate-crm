import React from 'react';
import { SetCurrency } from '../../../common/editors/fields/SetCurrency';

/**
 * Listing-specific Listed Price Editor
 * Wraps SetCurrency with listing-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current listed price
 */
export const EditListedPrice = ({ open, onClose, onSave, value }) => {
  return (
    <SetCurrency
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Listed Price"
      value={value}
      color="#10b981" // Green theme for listed price
      prefix="$"
    />
  );
};
