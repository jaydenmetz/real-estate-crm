import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Text } from '../../../common/setters/Text';

/**
 * Appointment-specific Location Editor
 * Uses EditorModal + Text setter pattern
 * Used for editing appointment location/address
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current location
 */
export const EditAppointmentLocation = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value || '');

  const handleSave = async () => {
    await onSave(editValue);
  };

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#0891b2">
      <Text
        label="Location"
        value={editValue}
        onChange={setEditValue}
        color="#0891b2"
        placeholder="Enter appointment location..."
        multiline={true}
        rows={3}
      />
    </EditorModal>
  );
};
