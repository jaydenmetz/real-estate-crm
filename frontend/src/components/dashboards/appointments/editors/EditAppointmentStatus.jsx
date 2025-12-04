import React from 'react';
import { EditSelect } from '../../../common/editors/fields/EditSelect';
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_LABELS } from '../../../../constants/appointmentConfig';

/**
 * Appointment-specific Status Editor
 * Wraps EditSelect with appointment-specific context and styling
 * Provides dropdown for changing appointment status
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current appointment status
 */
export const EditAppointmentStatus = ({ open, onClose, onSave, value }) => {
  // Convert status constants to options array
  const statusOptions = Object.values(APPOINTMENT_STATUS)
    .filter(status => status !== APPOINTMENT_STATUS.ARCHIVED) // Don't allow direct archive via status change
    .map(status => ({
      value: status,
      label: APPOINTMENT_STATUS_LABELS[status]
    }));

  return (
    <EditSelect
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Appointment Status"
      value={value}
      options={statusOptions}
      color="#9c27b0" // Purple theme for appointments
    />
  );
};
