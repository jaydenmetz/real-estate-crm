import React, { useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete, DragIndicator } from '@mui/icons-material';

/**
 * DraggableClientItem - Reusable client item with drag handle for reordering
 * Used in EditClients editor for both buyer and seller lists
 *
 * @param {Object} client - Client object with id, firstName, lastName, email
 * @param {number} index - Index in the list
 * @param {string} listType - 'buyer' or 'seller' (for drag-between-lists)
 * @param {function} onRemove - Callback when delete is clicked
 * @param {function} onDragStart - Callback when drag starts
 * @param {function} onDragOver - Callback when dragging over this item
 * @param {function} onDrop - Callback when dropped on this item
 * @param {boolean} isDragging - Whether this item is being dragged
 * @param {boolean} isDropTarget - Whether this item is a drop target
 */
const DraggableClientItem = ({
  client,
  index,
  listType,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDropTarget = false,
}) => {
  const itemRef = useRef(null);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      client,
      index,
      sourceList: listType,
    }));
    onDragStart?.(index, listType);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(index, listType);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      onDrop?.(data, index, listType);
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <Box
      ref={itemRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: isDragging ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        px: 1.5,
        py: 1.5,
        opacity: isDragging ? 0.5 : 1,
        border: isDropTarget ? '2px dashed rgba(255,255,255,0.5)' : '2px solid transparent',
        transition: 'all 0.15s ease',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.15)',
        },
      }}
    >
      {/* Drag Handle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'rgba(255,255,255,0.4)',
          mr: 1,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          '&:hover': {
            color: 'rgba(255,255,255,0.7)',
          },
        }}
      >
        <DragIndicator sx={{ fontSize: 20 }} />
      </Box>

      {/* Client Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} color="white" noWrap>
          {client.firstName} {client.lastName}
        </Typography>
        {client.email && (
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }} noWrap>
            {client.email}
          </Typography>
        )}
      </Box>

      {/* Delete Button */}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.(client.id);
        }}
        size="small"
        sx={{
          color: 'rgba(255,255,255,0.5)',
          ml: 1,
          '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default DraggableClientItem;
