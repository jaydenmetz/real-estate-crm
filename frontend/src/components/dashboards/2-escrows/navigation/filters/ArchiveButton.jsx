import React from 'react';
import {
  IconButton,
  Badge,
  alpha,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

/**
 * ArchiveButton - Archive/trash icon button (desktop only)
 *
 * Shows badge with archived count
 *
 * @param {string} selectedStatus - Currently selected status
 * @param {Function} onStatusChange - Handler for status change
 * @param {number} archivedCount - Number of archived items
 */
const ArchiveButton = ({
  selectedStatus,
  onStatusChange,
  archivedCount = 0,
}) => {
  return (
    <IconButton
      size="small"
      onClick={() => onStatusChange('archived')}
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: 36,
        height: 36,
        backgroundColor: selectedStatus === 'archived' ? 'warning.main' : alpha('#000', 0.06),
        color: selectedStatus === 'archived' ? 'white' : 'text.secondary',
        '&:hover': {
          backgroundColor: selectedStatus === 'archived' ? 'warning.dark' : alpha('#000', 0.1),
        },
        transition: 'all 0.2s',
      }}
    >
      <Badge badgeContent={archivedCount} color="error" max={99}>
        <DeleteIcon sx={{ fontSize: 20 }} />
      </Badge>
    </IconButton>
  );
};

export default ArchiveButton;
