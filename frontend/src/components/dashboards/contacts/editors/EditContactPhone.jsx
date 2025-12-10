import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Phone } from '../../../common/setters/Phone';

/**
 * Contact Phone Editor
 * Uses the standard EditorModal + Phone setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newPhone) => void
 * @param {string} value - Current phone number
 */
export const EditContactPhone = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  return (
    <EditorModal
      open={open}
      onClose={onClose}
      onSave={() => onSave(editValue)}
      color="#8B5CF6" // Purple for contacts
    >
      <Phone
        label="Phone Number"
        value={editValue}
        onChange={setEditValue}
        color="#8B5CF6"
      />
    </EditorModal>
  );
};
