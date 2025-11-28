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
 */
export const EditRepresentationType = ({
  open,
  onClose,
  onSave,
  value = 'buyer',
  color = '#3b82f6',
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

  // Auto-advance when user selects an option
  const handleChange = (event, newType) => {
    if (newType !== null) {
      setSelectedType(newType);
      // Auto-save after short delay to show selection
      setTimeout(() => {
        onSave(newType);
        onClose();
      }, 300);
    }
  };

  return (
    <ModalDialog open={open} onClose={onClose} color={color} maxWidth={400}>
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

        {/* Representation Type Toggle */}
        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleChange}
          orientation="vertical"
          fullWidth
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiToggleButton-root': {
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.2)',
              fontWeight: 600,
              py: 2,
              fontSize: '1rem',
              display: 'flex',
              justifyContent: 'flex-start',
              gap: 2,
              textTransform: 'none',
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
            <Person sx={{ fontSize: 24 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body1" fontWeight={600}>
                Buyer
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Representing the buyer
              </Typography>
            </Box>
          </ToggleButton>

          <ToggleButton value="seller">
            <Home sx={{ fontSize: 24 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body1" fontWeight={600}>
                Seller
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Representing the seller
              </Typography>
            </Box>
          </ToggleButton>

          <ToggleButton value="dual">
            <Group sx={{ fontSize: 24 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body1" fontWeight={600}>
                Dual Agency
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Representing both parties
              </Typography>
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </ModalDialog>
  );
};
