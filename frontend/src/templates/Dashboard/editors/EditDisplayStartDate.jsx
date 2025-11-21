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
 */
export const EditDisplayStartDate = ({ open, onClose, onSave, value, color = '#3b82f6' }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Display Start Date"
      value={value}
      color={color}
    />
  );
};
