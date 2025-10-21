import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const DisplayValue = styled(Box)(({ theme, disabled }) => ({
  cursor: disabled ? 'default' : 'pointer',
  padding: '2px 4px',
  borderRadius: theme.spacing(0.5),
  transition: 'all 0.2s',
  position: 'relative',
  display: 'inline-block',
  '&:hover': disabled ? {} : {
    backgroundColor: theme.palette.primary.main + '08',
    border: `1px solid ${theme.palette.primary.main}33`,
  },
  '& .edit-icon': {
    opacity: 0,
    position: 'absolute',
    right: -20,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.75rem',
    transition: 'opacity 0.2s',
  },
  '&:hover .edit-icon': {
    opacity: disabled ? 0 : 0.5,
  },
}));

/**
 * EditableField - Inline editable field component
 *
 * Features:
 * - Click to edit, auto-save on blur
 * - Keyboard shortcuts (Enter to save, Escape to cancel)
 * - Visual hover states
 * - Multiple field types (text, currency, date, number)
 * - Custom formatters and parsers
 */
const EditableField = ({
  value,
  onSave,
  type = 'text',
  placeholder = 'Click to edit',
  format = (v) => v || '',
  parse = (v) => v,
  displayClass = '',
  prefix = '',
  suffix = '',
  disabled = false,
  multiline = false,
  rows = 1,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text' || type === 'currency' || type === 'number') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (editValue === value || isSaving) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const parsedValue = parse(editValue);
      await onSave(parsedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value); // Revert on error
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (disabled) {
    return (
      <span className={displayClass}>
        {prefix}{format(value) || placeholder}{suffix}
      </span>
    );
  }

  if (isEditing) {
    // Date Picker
    if (type === 'date') {
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={editValue ? new Date(editValue) : null}
            onChange={(newValue) => {
              setEditValue(newValue);
              // Auto-save on date selection
              setTimeout(async () => {
                try {
                  await onSave(newValue);
                  setIsEditing(false);
                } catch (error) {
                  console.error('Failed to save date:', error);
                  setEditValue(value);
                  setIsEditing(false);
                }
              }, 100);
            }}
            slotProps={{
              textField: {
                size: 'small',
                autoFocus: true,
                onBlur: () => {
                  if (!isSaving) {
                    handleCancel();
                  }
                },
                sx: { fontSize: '0.75rem' },
              },
            }}
          />
        </LocalizationProvider>
      );
    }

    // Currency Input
    if (type === 'currency') {
      return (
        <TextField
          inputRef={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => {
            // Remove non-numeric characters except decimal
            const cleaned = e.target.value.replace(/[^0-9.]/g, '');
            setEditValue(cleaned);
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          size="small"
          disabled={isSaving}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '0.75rem',
              padding: '4px 8px',
            },
          }}
        />
      );
    }

    // Number Input
    if (type === 'number') {
      return (
        <TextField
          inputRef={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          size="small"
          disabled={isSaving}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '0.75rem',
              padding: '4px 8px',
            },
          }}
        />
      );
    }

    // Text/Multiline Input
    return (
      <TextField
        inputRef={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        size="small"
        multiline={multiline}
        rows={multiline ? rows : 1}
        disabled={isSaving}
        placeholder={placeholder}
        sx={{
          '& .MuiInputBase-input': {
            fontSize: '0.75rem',
            padding: '4px 8px',
          },
        }}
      />
    );
  }

  // Display mode
  return (
    <DisplayValue
      onClick={() => !disabled && setIsEditing(true)}
      disabled={disabled}
      className={displayClass}
    >
      {prefix}
      {format(value) || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>{placeholder}</span>}
      {suffix}
      <span className="edit-icon">✏️</span>
    </DisplayValue>
  );
};

export default EditableField;
