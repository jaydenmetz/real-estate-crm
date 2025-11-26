/**
 * BulkActionsButton.jsx - Bulk action controls for multi-select
 *
 * Compact dropdown button with bulk actions
 * Shows selection count and provides menu with Archive/Restore options
 */

import React, { useState } from 'react';
import {
  Button,
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
  Unarchive as UnarchiveIcon,
  DeleteForever as DeleteForeverIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';

export const BulkActionsButton = ({
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

  const allSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  return (
    <>
      {/* Bulk Actions Dropdown - always visible, matches filter button style */}
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
          borderColor: hasSelection ? 'primary.main' : 'divider',
          color: hasSelection ? 'primary.main' : 'text.secondary',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          },
        }}
      >
        {hasSelection ? `${selectedCount} selected` : 'Select All'}
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
        {/* When no items selected: Show only Select All */}
        {!hasSelection && onSelectAll && (
          <MenuItem onClick={() => handleAction(onSelectAll)}>
            <ListItemIcon>
              <CheckBoxIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Select All" />
          </MenuItem>
        )}

        {/* When items are selected: Show full menu */}
        {hasSelection && (
          <>
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
                {onDelete && (
                  <MenuItem onClick={() => handleAction(onDelete)}>
                    <ListItemIcon>
                      <DeleteForeverIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`Delete (${selectedCount})`} />
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
          </>
        )}
      </Menu>
    </>
  );
};
