import React from 'react';
import { EditDate } from '../../../components/common/editors/fields/EditDate';

/**
 * Dashboard-specific Display End Date Editor
 * Wraps EditDate with dashboard-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current display end date
 * @param {string} color - Theme color from hero (default: blue)
 */
export const EditDisplayEndDate = ({ open, onClose, onSave, value, color = '#3b82f6' }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Display End Date"
      value={value}
      color={color}
    />
  );
};
