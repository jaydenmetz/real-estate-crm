import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';

/**
 * Text Setter - Pure text input component
 * Self-contained: Label + Current Value + Text Input
 *
 * Usage in EditorModal (editing existing value):
 * <EditorModal>
 *   <Text label="Title" value={title} onChange={setTitle} />
 * </EditorModal>
 *
 * Usage in ModalStepPage (creation flow):
 * <ModalStepPage>
 *   <Text label="Title" value={title} onChange={setTitle} showCurrentValue={false} />
 * </ModalStepPage>
 *
 * @param {string} label - Field label (e.g., "Title", "Description")
 * @param {string} value - Current value
 * @param {function} onChange - Change handler (newValue) => void
 * @param {string} color - Theme color
 * @param {boolean} showCurrentValue - Show current value display (default: true, hide in creation flows)
 * @param {boolean} disabled - Disable input
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {string|number} maxWidth - Maximum width of input field (default: '300px')
 * @param {boolean} multiline - Enable multiline input
 * @param {number} rows - Number of rows for multiline input
 */
export const Text = ({
  label,
  value,
  onChange,
  color = '#10b981',
  showCurrentValue = true,
  disabled = false,
  placeholder = '',
  autoFocus = true,
  maxWidth = '300px',
  multiline = false,
  rows = 1,
}) => {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || '');

  // Sync local value when prop value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const input = inputRef.current.querySelector('input') || inputRef.current.querySelector('textarea');
      if (input) {
        setTimeout(() => {
          input.focus();
          const endPos = input.value.length;
          input.setSelectionRange(endPos, endPos);
        }, 50);
      }
    }
  }, [autoFocus]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Input Container - centered with max width */}
      <Box sx={{ width: '100%', maxWidth }}>
        {/* Label - left aligned within the input container */}
        <Typography
          variant="caption"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            mb: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {label}
        </Typography>

        {/* Current Value Display - Only show if enabled (hide in creation flows) */}
        {showCurrentValue && value && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 2,
              wordBreak: 'break-word',
            }}
          >
            {value}
          </Typography>
        )}

        {/* Text Input */}
        <TextField
          ref={inputRef}
          fullWidth
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          multiline={multiline}
          rows={multiline ? rows : undefined}
          inputProps={{
            style: {
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'white',
              padding: multiline ? '14px' : '14px 16px',
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              minHeight: multiline ? 'auto' : '56px',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: disabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.4)',
                opacity: 1,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};
