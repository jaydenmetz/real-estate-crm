import React from 'react';
import { EditCurrency } from '../../../common/editors/fields/EditCurrency';

/**
 * Client-specific Budget Editor
 * Wraps EditCurrency with client-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current budget/max budget
 */
export const EditClientBudget = ({ open, onClose, onSave, value }) => {
  return (
    <EditCurrency
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Budget"
      value={value}
      color="#8b5cf6" // Purple theme for clients
      prefix="$"
    />
  );
};
