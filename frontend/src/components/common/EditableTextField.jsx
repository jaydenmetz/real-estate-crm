import React, { useState, useCallback } from 'react';
import { Box, TextField, IconButton, CircularProgress, Typography } from '@mui/material';
import { Check, Close, Edit } from '@mui/icons-material';

export const EditableTextField = ({
  value,
  onSave,
  type = 'text',
  label,
  format,
  placeholder = 'Click to edit',
  variant = 'body1',
  sx = {},
  inputProps = {},
  multiline = false,
  rows = 1,
  ...props
}) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleStartEdit = useCallback((e) => {
    e.stopPropagation();
    setTempValue(value || '');
    setEditing(true);
  }, [value]);

  const handleSave = useCallback(async (e) => {
    e?.stopPropagation();
    if (!tempValue || tempValue === value) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(tempValue);
      setEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
      // Keep editing mode open on error
    } finally {
      setSaving(false);
    }
  }, [tempValue, value, onSave]);

  const handleCancel = useCallback((e) => {
    e?.stopPropagation();
    setTempValue(value || '');
    setEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave(e);
    } else if (e.key === 'Escape') {
      handleCancel(e);
    }
  }, [handleSave, handleCancel, multiline]);

  if (editing) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          width: '100%',
          ...sx,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <TextField
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          type={type}
          size="small"
          fullWidth
          autoFocus
          disabled={saving}
          multiline={multiline}
          rows={rows}
          placeholder={placeholder}
          inputProps={inputProps}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: 'inherit',
              fontWeight: 'inherit',
            },
          }}
          {...props}
        />
        <Box sx={{ display: 'flex', gap: 0.5, pt: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleSave}
            disabled={saving}
            sx={{
              color: 'success.main',
              '&:hover': { backgroundColor: 'success.light' },
            }}
          >
            {saving ? <CircularProgress size={16} /> : <Check sx={{ fontSize: 18 }} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCancel}
            disabled={saving}
            sx={{
              color: 'error.main',
              '&:hover': { backgroundColor: 'error.light' },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  const displayValue = format && value ? format(value) : value || placeholder;

  return (
    <Box
      onClick={handleStartEdit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderRadius: 1,
        px: 0.5,
        py: 0.25,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '&:hover .edit-icon': {
          opacity: 0.6,
        },
        ...sx,
      }}
    >
      <Typography
        variant={variant}
        sx={{
          flex: 1,
          fontWeight: 'inherit',
          fontSize: 'inherit',
          color: 'inherit',
        }}
      >
        {displayValue}
      </Typography>
      <Edit
        className="edit-icon"
        sx={{
          fontSize: 14,
          opacity: 0,
          transition: 'opacity 0.2s',
          color: 'text.secondary',
        }}
      />
    </Box>
  );
};
