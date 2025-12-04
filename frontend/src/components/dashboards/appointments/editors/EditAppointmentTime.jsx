import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Time } from '../../../common/setters/Time';

/**
 * Appointment-specific Time Editor
 * Uses EditorModal + Time setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void - receives time string HH:MM
 * @param {string} value - Current appointment time (HH:MM format)
 */
export const EditAppointmentTime = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = async () => {
    await onSave(editValue);
  };

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#0891b2">
      <Time
        label="Appointment Time"
        value={editValue}
        onChange={setEditValue}
        color="#0891b2"
      />
    </EditorModal>
  );
};
