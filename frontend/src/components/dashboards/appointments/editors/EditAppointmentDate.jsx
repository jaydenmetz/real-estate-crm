import React from 'react';
import { EditDate } from '../../../common/editors/fields/EditDate';

/**
 * Appointment-specific Date Editor
 * Wraps EditDate with appointment-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void - receives date string YYYY-MM-DD
 * @param {string} value - Current appointment date (YYYY-MM-DD format)
 */
export const EditAppointmentDate = ({ open, onClose, onSave, value }) => {
  return (
    <EditDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Appointment Date"
      value={value}
      color="#9c27b0" // Purple theme for appointments
    />
  );
};
