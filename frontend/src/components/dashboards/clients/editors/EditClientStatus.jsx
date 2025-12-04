import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, Select, FormControl } from '@mui/material';
import { EditorModal } from '../../../common/modals/EditorModal';
import { CLIENT_STATUS, CLIENT_STATUS_LABELS } from '../../../../constants/clientConfig';

/**
 * Client-specific Status Editor
 * Uses EditorModal for consistent styling
 * Provides dropdown for changing client status
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current client status
 */
export const EditClientStatus = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value || CLIENT_STATUS.ACTIVE);

  // Reset when value changes
  useEffect(() => {
    setEditValue(value || CLIENT_STATUS.ACTIVE);
  }, [value]);

  // Convert status constants to options array
  const statusOptions = Object.values(CLIENT_STATUS)
    .filter(status => status !== CLIENT_STATUS.ARCHIVED)
    .map(status => ({
      value: status,
      label: CLIENT_STATUS_LABELS[status]
    }));

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
          Client Status
        </Typography>
        <FormControl fullWidth>
          <Select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'white',
              },
              '& .MuiSelect-icon': {
                color: 'white',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1e1e2e',
                  color: 'white',
                  '& .MuiMenuItem-root': {
                    '&:hover': {
                      bgcolor: 'rgba(139, 92, 246, 0.2)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(139, 92, 246, 0.3)',
                      '&:hover': {
                        bgcolor: 'rgba(139, 92, 246, 0.4)',
                      },
                    },
                  },
                },
              },
            }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </EditorModal>
  );
};
