import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Share,
  Archive,
  RestoreFromTrash,
  Delete,
} from '@mui/icons-material';

/**
 * QuickActionsMenu - Consistent 3-dot menu for all view modes
 *
 * @param {object} item - The item (escrow, client, etc.)
 * @param {function} onView - Navigate to detail view
 * @param {function} onShare - Share action (future)
 * @param {function} onArchive - Archive the item
 * @param {function} onRestore - Restore from archive
 * @param {function} onDelete - Delete the item
 * @param {boolean} isArchived - Whether item is currently archived
 * @param {string} color - Theme color for the menu (default: text.secondary)
 */
export const QuickActionsMenu = ({
  item,
  onView,
  onShare,
  onArchive,
  onRestore,
  onDelete,
  isArchived = false,
  color = 'text.secondary',
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action) => (e) => {
    e.stopPropagation();
    handleClose();
    action(item.id);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          width: 32,
          height: 32,
          color: color,
          '&:hover': {
            bgcolor: alpha('#000', 0.05),
          },
        }}
      >
        <MoreVert sx={{ fontSize: 18 }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: alpha('#000', 0.05),
              },
            },
          },
        }}
      >
        {/* View Details */}
        {onView && (
          <MenuItem onClick={handleAction(onView)}>
            <ListItemIcon>
              <Visibility sx={{ fontSize: 18, color: '#6366f1' }} />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        )}

        {/* Share (future feature - disabled for now) */}
        {onShare && (
          <MenuItem onClick={handleAction(onShare)} disabled>
            <ListItemIcon>
              <Share sx={{ fontSize: 18, color: '#8b5cf6' }} />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        )}

        {/* Divider before destructive actions */}
        {(onArchive || onRestore || onDelete) && <Divider sx={{ my: 0.5 }} />}

        {/* Archive or Restore */}
        {isArchived ? (
          onRestore && (
            <MenuItem onClick={handleAction(onRestore)}>
              <ListItemIcon>
                <RestoreFromTrash sx={{ fontSize: 18, color: '#10b981' }} />
              </ListItemIcon>
              <ListItemText>Restore</ListItemText>
            </MenuItem>
          )
        ) : (
          onArchive && (
            <MenuItem onClick={handleAction(onArchive)}>
              <ListItemIcon>
                <Archive sx={{ fontSize: 18, color: '#f59e0b' }} />
              </ListItemIcon>
              <ListItemText>Archive</ListItemText>
            </MenuItem>
          )
        )}

        {/* Delete (only show in archive view) */}
        {isArchived && onDelete && (
          <MenuItem onClick={handleAction(onDelete)}>
            <ListItemIcon>
              <Delete sx={{ fontSize: 18, color: '#ef4444' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: '#ef4444' }}>Delete Forever</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
