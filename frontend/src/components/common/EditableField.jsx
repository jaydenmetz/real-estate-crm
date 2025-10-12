import React, { useState } from 'react';
import {
  TextField,
  IconButton,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const EditableContainer = styled(Box)(({ theme, isEditing }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: isEditing ? theme.spacing(0.5) : 0,
  borderRadius: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isEditing ? 'transparent' : 'rgba(118, 75, 162, 0.05)'
  }
}));

const EditableField = ({
  value,
  onSave,
  type = 'text',
  label,
  variant = 'h6',
  sx = {},
  prefix = '',
  suffix = '',
  multiline = false,
  rows = 1,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
      // Keep in edit mode on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'Not set';
    if (type === 'number' && typeof val === 'number') {
      return new Intl.NumberFormat('en-US').format(val);
    }
    if (type === 'currency' && typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    return val;
  };

  if (isEditing) {
    return (
      <EditableContainer isEditing>
        <TextField
          value={editValue}
          onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
          onKeyDown={handleKeyPress}
          type={type === 'currency' || type === 'number' ? 'number' : 'text'}
          size="small"
          fullWidth
          multiline={multiline}
          rows={rows}
          autoFocus
          disabled={isSaving}
          label={label}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white'
            }
          }}
        />
        <IconButton
          size="small"
          onClick={handleSave}
          disabled={isSaving}
          sx={{ color: '#4caf50' }}
        >
          {isSaving ? <CircularProgress size={20} /> : <CheckIcon />}
        </IconButton>
        <IconButton
          size="small"
          onClick={handleCancel}
          disabled={isSaving}
          sx={{ color: '#f44336' }}
        >
          <CloseIcon />
        </IconButton>
      </EditableContainer>
    );
  }

  return (
    <EditableContainer
      onClick={handleEdit}
      sx={{
        cursor: disabled ? 'default' : 'pointer',
        ...sx
      }}
    >
      <Typography variant={variant} sx={{ fontWeight: 600, flex: 1 }}>
        {prefix}{formatValue(value)}{suffix}
      </Typography>
      {!disabled && (
        <IconButton
          size="small"
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s',
            '.MuiBox-root:hover &': {
              opacity: 1
            },
            color: '#764ba2'
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </EditableContainer>
  );
};

export default EditableField;
