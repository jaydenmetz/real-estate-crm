import React from 'react';
import { SetDate } from '../../../components/common/editors/fields/SetDate';

/**
 * Dashboard-specific Display End Date Editor
 * Wraps SetDate with dashboard-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current display end date
 * @param {string} color - Theme color from hero (default: blue)
 * @param {Date|string} minDate - Minimum selectable date (start date for validation)
 */
export const EditDisplayEndDate = ({
  open,
  onClose,
  onSave,
  value,
  color = '#3b82f6',
  minDate
}) => {
  return (
    <SetDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Display End Date"
      value={value}
      color={color}
      minDate={minDate}
    />
  );
};
