import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle
} from '@mui/material';
import { Refresh, ErrorOutline } from '@mui/icons-material';

const DashboardError = ({
  error,
  onRetry,
  title = 'Error Loading Data',
  showDetails = true
}) => {
  const errorMessage = error?.message || 'An unexpected error occurred';
  const errorDetails = error?.response?.data?.message || error?.stack;

  return (
    <Box sx={{ py: 4 }}>
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'error.lighter',
          border: '2px solid',
          borderColor: 'error.main'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: 'error.main',
              borderRadius: '50%',
              color: 'white',
              display: 'flex'
            }}
          >
            <ErrorOutline sx={{ fontSize: 48 }} />
          </Box>
        </Box>

        <Typography variant="h5" gutterBottom color="error.main">
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {errorMessage}
        </Typography>

        {showDetails && errorDetails && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            <AlertTitle>Error Details</AlertTitle>
            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {errorDetails}
            </Typography>
          </Alert>
        )}

        {onRetry && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Refresh />}
            onClick={onRetry}
            size="large"
          >
            Retry
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardError;
