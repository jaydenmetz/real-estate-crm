/**
 * BulkActionsBar.jsx - Bulk action controls for multi-select
 *
 * Displays between tabs and filters when items are selected
 * Single dropdown menu with all bulk actions
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Archive as ArchiveIcon,
  Close as CloseIcon,
  Unarchive as UnarchiveIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';

export const BulkActionsBar = ({
  selectedCount = 0,
  totalCount = 0,
  onClearSelection,
  onSelectAll,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  customActions = [],
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    action?.();
  };

  if (selectedCount === 0) {
    return null;
  }

  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <>
      {/* Bulk Actions Dropdown - matches filter button style */}
      <Button
        size="small"
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={handleClick}
        sx={{
          minWidth: 140,
          height: 32,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          border: '1px solid',
          borderColor: 'primary.main',
          color: 'primary.main',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          },
        }}
      >
        {selectedCount} selected
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 0.5,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        {/* Select All / Unselect All */}
        {onSelectAll && (
          <>
            <MenuItem onClick={() => handleAction(onSelectAll)}>
              <ListItemIcon>
                {allSelected ? (
                  <CheckBoxOutlineBlankIcon fontSize="small" />
                ) : (
                  <CheckBoxIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText primary={allSelected ? 'Unselect All' : 'Select All'} />
            </MenuItem>
            <Divider />
          </>
        )}

        {/* Archive/Restore Actions */}
        {isArchived ? (
          <>
            {onRestore && (
              <MenuItem onClick={() => handleAction(onRestore)}>
                <ListItemIcon>
                  <UnarchiveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={`Restore (${selectedCount})`} />
              </MenuItem>
            )}
          </>
        ) : (
          onArchive && (
            <MenuItem onClick={() => handleAction(onArchive)}>
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={`Archive (${selectedCount})`} />
            </MenuItem>
          )
        )}

        {/* Custom Actions */}
        {customActions.length > 0 && (
          <>
            <Divider />
            {customActions.map((action, idx) => (
              <MenuItem
                key={idx}
                onClick={() => handleAction(action.onClick)}
                disabled={action.disabled}
              >
                {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                <ListItemText primary={action.label} />
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </>
  );
};
