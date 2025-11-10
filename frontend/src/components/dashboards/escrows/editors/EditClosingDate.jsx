import React from 'react';
import { EditDate } from '../../../common/editors/fields/EditDate';

/**
 * Escrow-specific Closing Date Editor
 * Wraps EditDate with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current closing date
 */
export const EditClosingDate = ({ open, onClose, onSave, value }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Closing Date"
      value={value}
      color="#8b5cf6" // Purple theme for closing date
    />
  );
};
