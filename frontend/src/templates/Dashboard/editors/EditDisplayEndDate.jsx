import React, { useState } from 'react';
import { EditorModal } from '../../../components/common/modals/EditorModal';
import { DateSetter } from '../../../components/common/setters/Date';
import { toLocalDateString } from '../../../utils/safeDateUtils';

export const EditDisplayEndDate = ({ open, onClose, onSave, value }) => {
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
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#ef4444">
      <DateSetter label="Display End Date" value={editValue} onChange={setEditValue} color="#ef4444" />
    </EditorModal>
  );
};
