import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Text } from '../../../common/setters/Text';

/**
 * Appointment-specific Title Editor
 * Uses EditorModal + Text setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current appointment title
 */
export const EditAppointmentTitle = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = async () => {
    await onSave(editValue);
  };

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#0891b2">
      <Text
        label="Appointment Title"
        value={editValue}
        onChange={setEditValue}
        color="#0891b2"
        placeholder="Enter appointment title..."
      />
    </EditorModal>
  );
};
