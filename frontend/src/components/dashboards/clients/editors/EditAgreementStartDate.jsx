import React, { useState, useEffect } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { DateSetter } from '../../../common/setters/Date';
import { toLocalDateString, parseLocalDate } from '../../../../utils/safeDateUtils';

/**
 * Agreement Start Date (Beginning) Editor for Clients
 * Uses EditorModal + DateSetter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current agreement start date
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditAgreementStartDate = ({ open, onClose, onSave, value, inline = false }) => {
  const [editValue, setEditValue] = useState(null);

  // Initialize/reset date when modal opens or value changes
  useEffect(() => {
    if (open || inline) {
      // Parse the value to a Date object using timezone-safe utility
      if (value) {
        const date = value instanceof Date ? value : parseLocalDate(value);
        // Check for valid date
        if (date && !isNaN(date.getTime())) {
          setEditValue(date);
        } else {
          setEditValue(null);
        }
      } else {
        setEditValue(null);
      }
    }
  }, [open, inline, value]);

  const handleSave = async () => {
    if (editValue && editValue instanceof Date && !isNaN(editValue.getTime())) {
      // Use centralized utility to prevent timezone shifting
      const dateString = toLocalDateString(editValue);
      if (dateString) {
        await onSave(dateString);
      }
    }
  };

  // Handler that updates local state AND calls onSave in inline mode
  const handleChange = (newDate) => {
    setEditValue(newDate);
    // In inline mode, immediately notify parent of changes
    if (inline && onSave && newDate && newDate instanceof Date && !isNaN(newDate.getTime())) {
      // Use centralized utility to prevent timezone shifting
      const dateString = toLocalDateString(newDate);
      if (dateString) {
        onSave(dateString);
      }
    }
  };

  const content = (
    <DateSetter
      label="Agreement Start Date"
      value={editValue}
      onChange={handleChange}
      color="#8b5cf6"
      showCurrentValue={!inline}
    />
  );

  if (inline) {
    return content;
  }

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#8b5cf6">
      {content}
    </EditorModal>
  );
};
