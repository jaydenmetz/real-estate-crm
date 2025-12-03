import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { EditorModal } from '../../../common/modals/EditorModal';

/**
 * Client-specific Name Editor
 * Uses EditorModal for consistent styling
 * Used for editing full name or first/last name separately
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current name value
 * @param {string} label - Field label (e.g., "First Name", "Last Name", "Full Name")
 */
export const EditClientName = ({ open, onClose, onSave, value, label = "Client Name" }) => {
  const [editValue, setEditValue] = useState(value || '');

  // Reset when value changes
  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
  };

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#8b5cf6">
      <Box sx={{ width: '100%' }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <TextField
          fullWidth
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          autoFocus
          variant="outlined"
          placeholder={`Enter ${label.toLowerCase()}`}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              fontSize: '1rem',
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.5)',
              opacity: 1,
            },
          }}
        />
      </Box>
    </EditorModal>
  );
};
