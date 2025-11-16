import React from 'react';
import { EditText } from '../../../common/editors/fields/EditText';

/**
 * Appointment-specific Title Editor
 * Wraps EditText with appointment-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current appointment title
 */
export const EditAppointmentTitle = ({ open, onClose, onSave, value }) => {
  return (
    <EditText
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Appointment Title"
      value={value}
      color="#9c27b0" // Purple theme for appointments
    />
  );
};
