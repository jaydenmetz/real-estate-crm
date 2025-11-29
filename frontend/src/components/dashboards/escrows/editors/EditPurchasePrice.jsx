import React from 'react';
import { SetCurrency } from '../../../common/editors/fields/SetCurrency';

/**
 * Escrow-specific Purchase Price Editor
 * Wraps SetCurrency with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current purchase price
 */
export const EditPurchasePrice = ({ open, onClose, onSave, value }) => {
  return (
    <SetCurrency
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Purchase Price"
      value={value}
      color="#10b981" // Green theme for purchase price
      prefix="$"
    />
  );
};
