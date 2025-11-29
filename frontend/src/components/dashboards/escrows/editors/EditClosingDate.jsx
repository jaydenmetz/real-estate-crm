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
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 */
export const EditClosingDate = ({ open, onClose, onSave, value, inline = false }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Closing Date"
      value={value}
      color="#8b5cf6" // Purple theme for closing date
      inline={inline}
    />
  );
};
