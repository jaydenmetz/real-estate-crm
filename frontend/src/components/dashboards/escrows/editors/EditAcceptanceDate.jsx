import React from 'react';
import { SetDate } from '../../../common/editors/fields/SetDate';

/**
 * Escrow-specific Acceptance Date Editor
 * Wraps SetDate with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current acceptance date
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 */
export const EditAcceptanceDate = ({ open, onClose, onSave, value, inline = false }) => {
  return (
    <SetDate
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
