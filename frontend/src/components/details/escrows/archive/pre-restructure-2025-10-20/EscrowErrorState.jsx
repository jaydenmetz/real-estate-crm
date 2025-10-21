import React from 'react';
import { Box, Container, Paper, Alert, IconButton } from '@mui/material';
import { Refresh as RefreshIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import EscrowErrorDebugPanel from '../../../common/EscrowErrorDebugPanel';
import { checkIsAdmin } from '../utils/eventHandlers';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 30, 0.8)'
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(255, 255, 255, 0.3)'}`,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
}));

/**
 * EscrowErrorState - Error display for escrow details
 *
 * Shows either:
 * - Debug panel (for admin users) with full error details
 * - Simple error message (for regular users) with back/refresh buttons
 */
const EscrowErrorState = ({ error, escrowId, onBack, onRefresh }) => {
  const isAdmin = checkIsAdmin();

  return (
    <StyledContainer maxWidth={false}>
      {isAdmin ? (
        <Box sx={{ maxWidth: 1600, margin: '0 auto', p: 2 }}>
          <EscrowErrorDebugPanel error={error} escrowId={escrowId} />
        </Box>
      ) : (
        <GlassCard sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'Failed to load escrow details'}
          </Alert>
          <Box>
            <IconButton onClick={onBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </GlassCard>
      )}
    </StyledContainer>
  );
};

export default EscrowErrorState;
