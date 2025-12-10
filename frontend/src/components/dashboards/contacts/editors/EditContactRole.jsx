import React, { useState } from 'react';
import { Box, Typography, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Check, Close, People, PersonAdd, VerifiedUser } from '@mui/icons-material';
import { ModalContainer } from '../../../common/modals/ModalContainer';
import { CONTACT_ROLE_CONFIG } from '../../../../constants/contactConfig';

/**
 * Contact Role Editor
 * Allows changing contact role between Sphere, Lead, and Client
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newRole) => void
 * @param {string} value - Current role ('sphere', 'lead', 'client')
 * @param {boolean} inline - If true, renders without modal wrapper
 */
export const EditContactRole = ({
  open,
  onClose,
  onSave,
  value,
  inline = false,
  color = '#8B5CF6',
}) => {
  const [selectedRole, setSelectedRole] = useState(value || 'sphere');
  const [saving, setSaving] = useState(false);

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setSelectedRole(newRole);

      // In inline mode, auto-save
      if (inline && onSave) {
        onSave(newRole);
      }
    }
  };

  const handleSave = async () => {
    if (selectedRole === value) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await onSave(selectedRole);
      if (!inline) onClose();
    } catch (error) {
      console.error('Failed to save contact role:', error);
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = [
    { value: 'sphere', label: 'Sphere', icon: People, description: 'General contact in your sphere' },
    { value: 'lead', label: 'Lead', icon: PersonAdd, description: 'Potential client being nurtured' },
    { value: 'client', label: 'Client', icon: VerifiedUser, description: 'Active or past client' },
  ];

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
        {/* Current Role Display */}
        {!inline && value && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
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
              Current Role
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'white',
                textTransform: 'capitalize',
              }}
            >
              {CONTACT_ROLE_CONFIG[value]?.label || value}
            </Typography>
          </Box>
        )}

        {/* Role Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              mb: 1,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center',
            }}
          >
            Select Role
          </Typography>
          <ToggleButtonGroup
            value={selectedRole}
            exclusive
            onChange={handleRoleChange}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.3)',
                fontWeight: 600,
                py: 2,
                flexDirection: 'column',
                gap: 0.5,
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
            {roleOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <ToggleButton key={option.value} value={option.value}>
                  <IconComponent sx={{ fontSize: 24, mb: 0.5 }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {option.label}
                  </Typography>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Box>

        {/* Role Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          {roleOptions.find(r => r.value === selectedRole)?.description}
        </Typography>

        {/* Action Buttons - Only show in standalone mode */}
        {!inline && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
              disabled={saving || selectedRole === value}
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
