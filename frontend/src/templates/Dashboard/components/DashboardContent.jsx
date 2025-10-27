import React from 'react';
import { Box, Typography, CircularProgress, Grid, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DashboardContent - Config-driven content grid/list with animations
 */
export const DashboardContent = ({
  loading,
  error,
  data,
  viewMode,
  CardComponent,
  config,
  onUpdate,
  onDelete,
  onArchive,
  onRestore,
  customActions,
}) => {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 4 }}>
        Failed to load {config.entity.namePlural}: {error.message}
      </Alert>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No {config.entity.namePlural} found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {config.dashboard.hero.showAddButton
            ? `Click "New ${config.entity.label}" to get started`
            : 'Try adjusting your filters'}
        </Typography>
      </Box>
    );
  }

  // Determine grid layout based on view mode
  const gridColumns = {
    xs: 1,
    sm: viewMode === 'list' ? 1 : 2,
    md: viewMode === 'list' ? 1 : viewMode === 'small' ? 2 : 1,
    lg: viewMode === 'list' ? 1 : viewMode === 'small' ? 4 : 1,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: gridColumns.sm === 1 ? '1fr' : 'repeat(2, 1fr)',
          md: gridColumns.md === 1 ? '1fr' : gridColumns.md === 2 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          lg: gridColumns.lg === 1 ? '1fr' : 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      <AnimatePresence>
        {data.map((item, index) => {
          // Get item ID from config
          const itemId = item[config.api.idField];

          return (
            <motion.div
              key={itemId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05, // Stagger animation
              }}
            >
              <CardComponent
                {...{ [config.entity.name]: item }} // Pass item as prop (e.g., escrow={item})
                viewMode={viewMode}
                index={index}
                onUpdate={onUpdate ? (updates) => onUpdate(itemId, updates) : undefined}
                onDelete={onDelete ? () => onDelete(itemId) : undefined}
                onArchive={onArchive ? () => onArchive(itemId) : undefined}
                onRestore={onRestore ? () => onRestore(itemId) : undefined}
                customActions={customActions}
                animationType="spring"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Box>
  );
};
