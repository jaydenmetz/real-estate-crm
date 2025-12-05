import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Currency } from '../../../common/setters/Currency';

/**
 * Commission Editor for Clients
 * Uses EditorModal + Currency setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newCommissionValue) => void
 * @param {number} value - Current commission value
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditClientCommission = ({ open, onClose, onSave, value, inline = false }) => {
  const [editValue, setEditValue] = useState(value);

  const handleChange = (newValue) => {
    setEditValue(newValue);
    // In inline mode, immediately notify parent of changes
    if (inline && onSave) {
      onSave(parseFloat(newValue) || 0);
    }
  };

  const content = (
    <Currency
      label="Commission"
      value={editValue}
      onChange={handleChange}
      color="#06b6d4"
      showCurrentValue={!inline}
    />
  );

  if (inline) {
    return content;
  }

  return (
    <EditorModal open={open} onClose={onClose} onSave={() => onSave(parseFloat(editValue) || 0)} color="#06b6d4">
      {content}
    </EditorModal>
  );
};
