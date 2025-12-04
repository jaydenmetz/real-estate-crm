import React, { useState, useEffect } from 'react';
import { Box, Typography, Select as MuiSelect, MenuItem, alpha } from '@mui/material';

/**
 * Select Setter - Pure select/dropdown input component
 * Self-contained: Label + Current Value + Select Input
 *
 * Usage in EditorModal (editing existing value):
 * <EditorModal>
 *   <Select label="Status" value={status} onChange={setStatus} options={statusOptions} />
 * </EditorModal>
 *
 * Usage in ModalStepPage (creation flow):
 * <ModalStepPage>
 *   <Select label="Status" value={status} onChange={setStatus} options={statusOptions} showCurrentValue={false} />
 * </ModalStepPage>
 *
 * @param {string} label - Field label (e.g., "Status", "Type")
 * @param {string} value - Current value
 * @param {function} onChange - Change handler (newValue) => void
 * @param {Array} options - Array of { value, label } objects
 * @param {string} color - Theme color
 * @param {boolean} showCurrentValue - Show current value display (default: true, hide in creation flows)
 * @param {boolean} disabled - Disable input
 * @param {string} placeholder - Placeholder text
 * @param {string|number} maxWidth - Maximum width of input field (default: '300px')
 */
export const Select = ({
  label,
  value,
  onChange,
  options = [],
  color = '#10b981',
  showCurrentValue = true,
  disabled = false,
  placeholder = 'Select...',
  maxWidth = '300px',
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync local value when prop value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Get the display label for current value
  const currentLabel = options.find(opt => opt.value === value)?.label || value;

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
            }}
          >
            {currentLabel}
          </Typography>
        )}

        {/* Select Input */}
        <MuiSelect
          fullWidth
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          displayEmpty
          sx={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            minHeight: '56px',
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.3)',
              borderWidth: 2,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: disabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.1)',
              },
            },
            '& .MuiSelect-select': {
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'white',
              padding: '14px 16px',
            },
            '& .MuiSvgIcon-root': {
              color: 'white',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: alpha(color, 0.95),
                backdropFilter: 'blur(20px)',
                borderRadius: 2,
                mt: 1,
                '& .MuiMenuItem-root': {
                  color: 'white',
                  fontWeight: 500,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                    },
                  },
                },
              },
            },
          }}
        >
          {!localValue && (
            <MenuItem value="" disabled>
              <em style={{ color: 'rgba(255,255,255,0.4)' }}>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
      </Box>
    </Box>
  );
};
