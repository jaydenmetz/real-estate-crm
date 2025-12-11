import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { DateSetter } from '../../../common/setters/Date';
import { toLocalDateString } from '../../../../utils/safeDateUtils';

/**
 * Appointment-specific Date Editor
 * Uses EditorModal + DateSetter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void - receives date string YYYY-MM-DD
 * @param {string} value - Current appointment date (YYYY-MM-DD format)
 */
export const EditAppointmentDate = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    if (editValue) {
      // Use centralized utility to prevent timezone shifting
      const dateString = toLocalDateString(editValue);
      if (dateString) {
        await onSave(dateString);
      }
    }
  };

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#0891b2">
      <DateSetter label="Appointment Date" value={editValue} onChange={setEditValue} color="#0891b2" />
    </EditorModal>
  );
};
