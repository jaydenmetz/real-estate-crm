import React from 'react';
import { EditText } from '../../../common/editors/fields/EditText';

/**
 * Appointment-specific Location Editor
 * Wraps EditText with appointment-specific context and styling
 * Used for editing appointment location/address
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current location
 */
export const EditAppointmentLocation = ({ open, onClose, onSave, value }) => {
  return (
    <EditText
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Location"
      value={value}
      color="#9c27b0" // Purple theme for appointments
      multiline={true}
      rows={3}
    />
  );
};
