import React from 'react';
import { EditDate } from '../../../components/common/editors/fields/EditDate';

/**
 * Dashboard-specific Display Start Date Editor
 * Wraps EditDate with dashboard-specific context and styling
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
    <EditDate
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
