import React from 'react';
import { EditDate } from '../../../common/editors/fields/EditDate';

/**
 * Escrow-specific Acceptance Date Editor
 * Wraps EditDate with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current acceptance date
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 */
export const EditAcceptanceDate = ({ open, onClose, onSave, value, inline = false }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Acceptance Date"
      value={value}
      color="#3b82f6" // Blue theme for acceptance date
      inline={inline}
    />
  );
};
