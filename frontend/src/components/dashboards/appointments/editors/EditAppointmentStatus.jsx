import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Select } from '../../../common/setters/Select';
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_LABELS } from '../../../../constants/appointmentConfig';

/**
 * Appointment-specific Status Editor
 * Uses EditorModal + Select setter pattern
 * Provides dropdown for changing appointment status
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current appointment status
 */
export const EditAppointmentStatus = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value || '');

  // Convert status constants to options array
  const statusOptions = Object.values(APPOINTMENT_STATUS)
    .filter(status => status !== APPOINTMENT_STATUS.ARCHIVED) // Don't allow direct archive via status change
    .map(status => ({
      value: status,
      label: APPOINTMENT_STATUS_LABELS[status]
    }));

  const handleSave = async () => {
    await onSave(editValue);
  };

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#0891b2">
      <Select
        label="Appointment Status"
        value={editValue}
        onChange={setEditValue}
        options={statusOptions}
        color="#0891b2"
      />
    </EditorModal>
  );
};
