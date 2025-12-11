import React, { useState, useEffect } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { DateSetter } from '../../../common/setters/Date';
import { toLocalDateString, parseLocalDate } from '../../../../utils/safeDateUtils';

/**
 * Agreement End Date (Expiration) Editor for Clients
 * Uses EditorModal + DateSetter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current agreement end date
 * @param {string|Date} minDate - Optional minimum date (e.g., agreement start date)
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditAgreementEndDate = ({ open, onClose, onSave, value, minDate, inline = false }) => {
  const [editValue, setEditValue] = useState(null);
  const [parsedMinDate, setParsedMinDate] = useState(null);

  // Initialize/reset date when modal opens or value changes
  useEffect(() => {
    if (open || inline) {
      // Parse the value using timezone-safe utility
      if (value) {
        const date = value instanceof Date ? value : parseLocalDate(value);
        if (date && !isNaN(date.getTime())) {
          setEditValue(date);
        } else {
          setEditValue(null);
        }
      } else {
        setEditValue(null);
      }

      // Parse minDate using timezone-safe utility
      if (minDate) {
        const min = minDate instanceof Date ? minDate : parseLocalDate(minDate);
        if (min && !isNaN(min.getTime())) {
          setParsedMinDate(min);
        } else {
          setParsedMinDate(null);
        }
      } else {
        setParsedMinDate(null);
      }
    }
  }, [open, inline, value, minDate]);

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
      label="Agreement Expiration Date"
      value={editValue}
      onChange={handleChange}
      color="#f59e0b"
      minDate={parsedMinDate}
      showCurrentValue={!inline}
    />
  );

  if (inline) {
    return content;
  }

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#f59e0b">
      {content}
    </EditorModal>
  );
};
