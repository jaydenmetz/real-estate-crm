import React from 'react';
import { EditTime } from '../../../common/editors/fields/EditTime';

/**
 * Appointment-specific Time Editor
 * Wraps EditTime with appointment-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void - receives time string HH:MM
 * @param {string} value - Current appointment time (HH:MM format)
 */
export const EditAppointmentTime = ({ open, onClose, onSave, value }) => {
  return (
    <EditTime
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Appointment Time"
      value={value}
      color="#9c27b0" // Purple theme for appointments
    />
  );
};
