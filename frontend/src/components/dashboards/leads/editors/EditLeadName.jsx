import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, InputAdornment } from '@mui/material';
import { Check, Close, Person } from '@mui/icons-material';
import { ModalContainer } from '../../../common/modals/ModalContainer';

/**
 * Lead Name Editor
 * Allows editing first and last name for leads
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (updates) => void - receives { first_name, last_name, display_name }
 * @param {string} value - Current display name
 * @param {object} data - Full lead object
 * @param {boolean} inline - If true, renders without modal wrapper
 */
export const EditLeadName = ({
  open,
  onClose,
  onSave,
  value,
  data,
  inline = false,
  color = '#10b981', // Green for leads
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize values when dialog opens
  useEffect(() => {
    if (open || inline) {
      const currentFirstName = data?.first_name || data?.firstName || '';
      const currentLastName = data?.last_name || data?.lastName || '';
      setFirstName(currentFirstName);
      setLastName(currentLastName);
    }
  }, [open, inline, data]);

  const getCurrentName = () => {
    if (value) return value;
    if (!data) return '';
    const first = data.first_name || data.firstName || '';
    const last = data.last_name || data.lastName || '';
    return `${first} ${last}`.trim();
  };

  const hasChanges = () => {
    const origFirst = data?.first_name || data?.firstName || '';
    const origLast = data?.last_name || data?.lastName || '';
    return firstName !== origFirst || lastName !== origLast;
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const displayName = `${firstName} ${lastName}`.trim();
      await onSave({
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
      });
      if (!inline) onClose();
    } catch (error) {
      console.error('Failed to save lead name:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && hasChanges()) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Auto-save in inline mode
  const handleInlineChange = (field, value) => {
    if (field === 'first') {
      setFirstName(value);
      if (inline && onSave) {
        const displayName = `${value} ${lastName}`.trim();
        onSave({ first_name: value, last_name: lastName, display_name: displayName });
      }
    } else {
      setLastName(value);
      if (inline && onSave) {
        const displayName = `${firstName} ${value}`.trim();
        onSave({ first_name: firstName, last_name: value, display_name: displayName });
      }
    }
  };

  const content = (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Current Name Display */}
        {!inline && getCurrentName() && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: 10,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                mb: 0.5,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Current Name
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'white',
              }}
            >
              {getCurrentName()}
            </Typography>
          </Box>
        )}

        {/* First Name Input */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              mb: 0.75,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            First Name
          </Typography>
          <TextField
            fullWidth
            value={firstName}
            onChange={(e) => handleInlineChange('first', e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={saving}
            placeholder="First name"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: 'white', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 2,
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
                fontSize: '15px',
                fontWeight: 500,
              },
            }}
          />
        </Box>

        {/* Last Name Input */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              mb: 0.75,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Last Name
          </Typography>
          <TextField
            fullWidth
            value={lastName}
            onChange={(e) => handleInlineChange('last', e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={saving}
            placeholder="Last name"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 2,
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
                fontSize: '15px',
                fontWeight: 500,
              },
            }}
          />
        </Box>

        {/* Action Buttons - Only show in standalone mode */}
        {!inline && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              disabled={saving}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                },
              }}
            >
              <Close />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={saving || !hasChanges()}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'white',
                color: color,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(0,0,0,0.2)',
                },
              }}
            >
              <Check />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );

  if (inline) {
    return content;
  }

  return (
    <ModalContainer open={open} onClose={onClose} color={color} maxWidth={420}>
      {content}
    </ModalContainer>
  );
};
