import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * EscrowLoadingState - Loading spinner for escrow details
 *
 * Displays centered loading spinner with gradient background
 * while escrow data is being fetched
 */
const EscrowLoadingState = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CircularProgress size={60} sx={{ color: 'white' }} />
    </Box>
  );
};

export default EscrowLoadingState;
