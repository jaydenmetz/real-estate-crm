import React from 'react';
import { EditCommission } from '../../../common/editors/specialized/EditCommission';

/**
 * Escrow-specific Commission Editor
 * Wraps EditCommission with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current commission value
 * @param {number} purchasePrice - Purchase price for percentage calculation
 */
export const EditCommissionAmount = ({ open, onClose, onSave, value, purchasePrice }) => {
  return (
    <EditCommission
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Commission"
      value={value}
      purchasePrice={purchasePrice}
      color="#10b981" // Green theme for commission
    />
  );
};
