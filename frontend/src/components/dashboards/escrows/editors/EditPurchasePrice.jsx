import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Currency } from '../../../common/setters/Currency';

/**
 * Purchase Price Editor
 * Uses EditorModal + Currency setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newPrice) => void
 * @param {number} value - Current purchase price
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditPurchasePrice = ({ open, onClose, onSave, value, inline = false }) => {
  const [editValue, setEditValue] = useState(value);

  // Handler that updates local state AND calls onSave in inline mode
  const handleChange = (newValue) => {
    setEditValue(newValue);
    // In inline mode, immediately notify parent of changes
    if (inline && onSave) {
      // Keep it as a string - Currency expects string values
      onSave(newValue);
    }
  };

  const content = (
    <Currency
      label="Purchase Price"
      value={editValue}
      onChange={handleChange}
      color="#10b981"
      showCurrentValue={!inline}
      maxWidth="100%"
    />
  );

  if (inline) {
    return content;
  }

  return (
    <EditorModal open={open} onClose={onClose} onSave={() => onSave(parseFloat(editValue))} color="#10b981">
      {content}
    </EditorModal>
  );
};
