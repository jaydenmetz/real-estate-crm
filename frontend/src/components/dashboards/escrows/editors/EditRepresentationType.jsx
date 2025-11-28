import React, { useState, useEffect } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Person, Home, Group } from '@mui/icons-material';
import { ModalDialog } from '../../../common/editors/shared/ModalDialog';

/**
 * Representation Type Editor
 * Allows selecting between Buyer, Seller, or Dual Agency
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current representation type ('buyer' | 'seller' | 'dual')
 * @param {string} color - Theme color
 * @param {boolean} inline - If true, renders without ModalDialog wrapper (for use in flows)
 */
export const EditRepresentationType = ({
  open,
  onClose,
  onSave,
  value = 'buyer',
  color = '#3b82f6',
  inline = false,
}) => {
  const [selectedType, setSelectedType] = useState(value);

  useEffect(() => {
    if (open) {
      setSelectedType(value || 'buyer');
    }
  }, [open, value]);

  const handleSave = () => {
    onSave(selectedType);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Save selection when user clicks an option (no auto-advance in modal flow)
  const handleChange = (event, newType) => {
    if (newType !== null) {
      setSelectedType(newType);
      onSave(newType);
    }
  };

  const content = (
    <Box onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyPress} tabIndex={0}>
      {/* Label */}
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
        Representation Type
      </Typography>

      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: 'white',
          mb: 3,
          letterSpacing: '-1px',
        }}
      >
        Who do you represent?
      </Typography>

      {/* Representation Type Toggle - Horizontal */}
      <ToggleButtonGroup
        value={selectedType}
        exclusive
        onChange={handleChange}
        fullWidth
        sx={{
          gap: 1.5,
          '& .MuiToggleButtonGroup-grouped': {
            border: 'none',
            '&:not(:first-of-type)': {
              marginLeft: 0,
              borderRadius: 2,
            },
            '&:first-of-type': {
              borderRadius: 2,
            },
          },
          '& .MuiToggleButton-root': {
            color: 'rgba(255,255,255,0.7)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderColor: 'rgba(255,255,255,0.2)',
            fontWeight: 600,
            py: 2.5,
            px: 2,
            fontSize: '0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            textTransform: 'none',
            borderRadius: 2,
            transition: 'all 0.2s',
            '&.Mui-selected': {
              backgroundColor: 'rgba(255,255,255,0.25)',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.35)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.15)',
            },
          },
        }}
      >
        <ToggleButton value="buyer">
          <Person sx={{ fontSize: 28 }} />
          <Typography variant="body2" fontWeight={600}>
            Buyer
          </Typography>
        </ToggleButton>

        <ToggleButton value="seller">
          <Home sx={{ fontSize: 28 }} />
          <Typography variant="body2" fontWeight={600}>
            Seller
          </Typography>
        </ToggleButton>

        <ToggleButton value="dual">
          <Group sx={{ fontSize: 28 }} />
          <Typography variant="body2" fontWeight={600}>
            Dual
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  // If inline mode, return content without wrapper
  if (inline) {
    return content;
  }

  // Otherwise wrap in ModalDialog
  return (
    <ModalDialog open={open} onClose={onClose} color={color} maxWidth={500}>
      {content}
    </ModalDialog>
  );
};
