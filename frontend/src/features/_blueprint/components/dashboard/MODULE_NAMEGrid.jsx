import React from 'react';
import { Grid, Card, CardContent, CardActions, Typography, IconButton, Checkbox, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

/**
 * MODULE_TITLE Grid View Component
 *
 * Displays MODULE_PLURAL in a responsive grid layout with cards
 */
const MODULE_NAMEGrid = ({ items, loading, selectedItems = [], onSelectItem, onEdit, onDelete }) => {
  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {/* Selection Checkbox */}
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onChange={() => onSelectItem(item.id)}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 1
              }}
            />

            <CardContent sx={{ flexGrow: 1, pt: 5 }}>
              {/* Main Title */}
              <Typography variant="h6" gutterBottom noWrap>
                {item.name || 'Untitled'}
              </Typography>

              {/* Description or other fields */}
              <Typography variant="body2" color="text.secondary" sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {item.description || 'No description available'}
              </Typography>

              {/* Status Badge */}
              <Box sx={{ mb: 2 }}>
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

              {/* Additional Info */}
              {item.createdAt && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>

            {/* Actions */}
            <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
              <IconButton
                size="small"
                onClick={() => onEdit(item)}
                sx={{ color: 'primary.main' }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(item.id)}
                sx={{ color: 'error.main' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MODULE_NAMEGrid;
