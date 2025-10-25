import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, IconButton, Checkbox, Box, Typography, Divider } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

/**
 * MODULE_TITLE List View Component
 *
 * Displays MODULE_PLURAL in a compact list layout
 */
const MODULE_NAMEList = ({ items, loading, selectedItems = [], onSelectItem, onEdit, onDelete }) => {
  return (
    <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ListItem
            sx={{
              opacity: loading ? 0.6 : 1,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  edge="end"
                  onClick={() => onEdit(item)}
                  sx={{ color: 'primary.main' }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => onDelete(item.id)}
                  sx={{ color: 'error.main' }}
                >
                  <Delete />
                </IconButton>
              </Box>
            }
          >
            <ListItemIcon>
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onChange={() => onSelectItem(item.id)}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {item.name || 'Untitled'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: item.status === 'active' ? 'success.light' : 'grey.300',
                      color: item.status === 'active' ? 'success.dark' : 'text.secondary',
                      fontWeight: 600
                    }}
                  >
                    {item.status || 'unknown'}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {item.description || 'No description available'}
                  </Typography>
                  {item.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
          {index < items.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default MODULE_NAMEList;
