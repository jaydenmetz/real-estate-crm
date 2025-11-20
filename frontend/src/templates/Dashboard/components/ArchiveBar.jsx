/**
 * ArchiveBar.jsx - Archive view controls with year selector and actions
 *
 * Displays:
 * - Year selector dropdown (2025, 2024, 2023, All Time)
 * - Select all checkbox
 * - Restore and Delete actions for selected items
 *
 * Replaces BulkActionsBar in archive view only
 */

import React, { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Checkbox,
  Button,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Unarchive as UnarchiveIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';

export const ArchiveBar = ({
  selectedYear,
  onYearChange,
  yearOptions = [], // Array of { value: number, label: string }
  selectedItems = [],
  totalCount = 0,
  onSelectAll,
  onClearSelection,
  onRestore,
  onDelete,
  isRestoring = false,
  isDeleting = false,
}) => {
  const allSelected = selectedItems.length === totalCount && totalCount > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < totalCount;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        mb: 2,
        backgroundColor: alpha('#ff9800', 0.08),
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha('#ff9800', 0.2),
      }}
    >
      {/* Year Selector */}
      <Select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        size="small"
        sx={{
          minWidth: 140,
          height: 36,
          backgroundColor: 'white',
          borderRadius: 1.5,
          fontWeight: 600,
          fontSize: '0.875rem',
          '& .MuiSelect-select': {
            py: 1,
            px: 1.5,
          },
        }}
      >
        {yearOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {/* Select All Checkbox */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => {
            if (e.target.checked) {
              onSelectAll();
            } else {
              onClearSelection();
            }
          }}
          sx={{
            '&.MuiCheckbox-indeterminate': {
              color: 'warning.main',
            },
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {selectedItems.length > 0
            ? `${selectedItems.length} selected`
            : `Select all ${totalCount}`}
        </Typography>
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Action Buttons - only show when items selected */}
      {selectedItems.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Restore Button */}
          {onRestore && (
            <Button
              variant="contained"
              size="small"
              startIcon={isRestoring ? <CircularProgress size={16} color="inherit" /> : <UnarchiveIcon />}
              onClick={onRestore}
              disabled={isRestoring || isDeleting}
              sx={{
                backgroundColor: 'success.main',
                '&:hover': {
                  backgroundColor: 'success.dark',
                },
              }}
            >
              Restore {selectedItems.length}
            </Button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
              onClick={onDelete}
              disabled={isRestoring || isDeleting}
            >
              Delete {selectedItems.length}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ArchiveBar;
