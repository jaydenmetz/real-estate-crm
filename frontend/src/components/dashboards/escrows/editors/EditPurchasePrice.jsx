import React from 'react';
import { EditCurrency } from '../../../common/editors/fields/EditCurrency';

/**
 * Escrow-specific Purchase Price Editor
 * Wraps EditCurrency with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current purchase price
 */
export const EditPurchasePrice = ({ open, onClose, onSave, value }) => {
  return (
    <EditCurrency
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Purchase Price"
      value={value}
      color="#3b82f6" // Blue theme for purchase price
      prefix="$"
    />
  );
};
