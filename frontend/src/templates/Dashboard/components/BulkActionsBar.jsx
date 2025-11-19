/**
 * BulkActionsBar.jsx - Bulk action controls for multi-select
 *
 * Displays between tabs and filters when items are selected
 * Shows: count, Archive, Delete, and custom actions
 */

import React from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Unarchive as UnarchiveIcon,
} from '@mui/icons-material';

export const BulkActionsBar = ({
  selectedCount = 0,
  onClearSelection,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  customActions = [],
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1,
        px: 2,
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
        borderRadius: 2,
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        flexWrap: 'wrap',
      }}
    >
      {/* Selection Count */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {selectedCount} selected
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {isArchived ? (
          <>
            {onRestore && (
              <Tooltip title="Restore selected items">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UnarchiveIcon />}
                  onClick={onRestore}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 1.5,
                    fontWeight: 500,
                  }}
                >
                  Restore
                </Button>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Permanently delete selected items">
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 1.5,
                    fontWeight: 500,
                  }}
                >
                  Delete
                </Button>
              </Tooltip>
            )}
          </>
        ) : (
          onArchive && (
            <Tooltip title="Archive selected items">
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArchiveIcon />}
                onClick={onArchive}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1.5,
                  fontWeight: 500,
                }}
              >
                Archive
              </Button>
            </Tooltip>
          )
        )}

        {/* Custom Actions */}
        {customActions.map((action, idx) => (
          <Tooltip key={idx} title={action.tooltip || action.label}>
            <Button
              size="small"
              variant="outlined"
              startIcon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
              sx={{
                textTransform: 'none',
                borderRadius: 1.5,
                fontWeight: 500,
              }}
            >
              {action.label}
            </Button>
          </Tooltip>
        ))}
      </Box>

      {/* Clear Selection */}
      <Box sx={{ ml: 'auto' }}>
        <Tooltip title="Clear selection">
          <IconButton
            size="small"
            onClick={onClearSelection}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
