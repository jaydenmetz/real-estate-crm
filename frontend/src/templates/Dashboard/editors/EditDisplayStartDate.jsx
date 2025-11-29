import React from 'react';
import { SetDate } from '../../../components/common/editors/fields/SetDate';

/**
 * Dashboard-specific Display Start Date Editor
 * Wraps SetDate with dashboard-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current display start date
 * @param {string} color - Theme color from hero (default: blue)
 * @param {Date|string} maxDate - Maximum selectable date (end date for validation)
 * @param {function} onSaveSuccess - Callback after successful save (for auto-progression)
 */
export const EditDisplayStartDate = ({
  open,
  onClose,
  onSave,
  value,
  color = '#3b82f6',
  maxDate,
  onSaveSuccess
}) => {
  return (
    <SetDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Display Start Date"
      value={value}
      color={color}
      maxDate={maxDate}
      onSaveSuccess={onSaveSuccess}
    />
  );
};
