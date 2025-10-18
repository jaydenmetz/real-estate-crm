import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { Add } from '@mui/icons-material';

const DashboardEmptyState = ({
  title = 'No items found',
  subtitle = 'Get started by creating your first item',
  icon,
  actionLabel = 'Create New',
  onAction,
  imageUrl,
  showAction = true
}) => {
  return (
    <Card sx={{
      textAlign: 'center',
      p: 6,
      bgcolor: 'grey.50',
      boxShadow: 0,
      border: '2px dashed',
      borderColor: 'grey.300'
    }}>
      <CardContent>
        {icon && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3
          }}>
            <Box sx={{
              p: 3,
              bgcolor: 'primary.lighter',
              borderRadius: '50%',
              color: 'primary.main',
              display: 'flex'
            }}>
              {icon}
            </Box>
          </Box>
        )}

        {imageUrl && (
          <Box sx={{ mb: 3 }}>
            <img
              src={imageUrl}
              alt="Empty state"
              style={{
                maxWidth: '200px',
                opacity: 0.5
              }}
            />
          </Box>
        )}

        <Typography variant="h6" gutterBottom color="text.primary">
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
        >
          {subtitle}
        </Typography>

        {showAction && onAction && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAction}
            size="large"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardEmptyState;