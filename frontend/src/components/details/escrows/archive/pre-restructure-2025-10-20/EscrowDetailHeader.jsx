import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(255, 255, 255, 0.5)',
}));

/**
 * EscrowDetailHeader - Top header bar with navigation and actions
 *
 * Features:
 * - Back to escrows navigation
 * - Escrow number and address display
 * - Save button (shown when unsaved changes exist)
 * - Refresh button with animation
 * - Dark mode toggle
 */
const EscrowDetailHeader = ({
  escrowNumber,
  propertyAddress,
  hasUnsavedChanges,
  isRefreshing,
  isDarkMode,
  onBack,
  onSave,
  onRefresh,
  onToggleDarkMode,
  showSaveButton = false, // Only show in Data Editor tab
}) => {
  return (
    <HeaderBar>
      <Box display="flex" alignItems="center" gap={2}>
        <Tooltip title="Back to Escrows">
          <IconButton onClick={onBack} size="large">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ margin: 0, fontSize: '1.5rem' }}
          >
            {escrowNumber || 'Escrow Details'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}
          >
            {propertyAddress}
          </motion.p>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        {hasUnsavedChanges && showSaveButton && (
          <Tooltip title="Save All Changes">
            <IconButton onClick={onSave} color="primary">
              <SaveIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={isRefreshing ? "Refreshing..." : "Refresh Data"}>
          <span>
            <IconButton
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              >
                <RefreshIcon />
              </motion.div>
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
          <IconButton onClick={onToggleDarkMode}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </HeaderBar>
  );
};

export default EscrowDetailHeader;
