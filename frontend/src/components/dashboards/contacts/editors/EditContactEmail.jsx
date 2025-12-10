import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Email } from '../../../common/setters/Email';
import { parseEmailForStorage } from '../../../../utils/validators';

/**
 * Contact Email Editor
 * Uses the standard EditorModal + Email setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newEmail) => void
 * @param {string} value - Current email address
 */
export const EditContactEmail = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  return (
    <EditorModal
      open={open}
      onClose={onClose}
      onSave={() => onSave(parseEmailForStorage(editValue))}
      color="#8B5CF6" // Purple for contacts
    >
      <Email
        label="Email Address"
        value={editValue}
        onChange={setEditValue}
        color="#8B5CF6"
      />
    </EditorModal>
  );
};
