import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  alpha,
} from '@mui/material';
import {
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DashboardContent - Config-driven content grid/list with animations
 * Supports archive view with checkboxes matching Clients dashboard
 */
export const DashboardContent = ({
  loading,
  error,
  data,
  viewMode,
  CardComponent,
  ListComponent = null, // Optional list view component
  TableComponent = null, // Optional table view component
  config,
  onUpdate,
  onDelete,
  onArchive,
  onRestore,
  customActions,
  // Archive view props
  selectedStatus,
  archivedData,
  handleBatchDelete,
  handleBatchRestore,
  batchDeleting,
  batchRestoring,
  handleSelectAll,
  handleClearSelection,
  // Year filtering for archive view
  selectedYear,
  onYearChange,
  yearOptions,
  // Multi-select props
  isSelectable = false,
  selectedItems = [],
  onSelectItem,
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
      <Paper
        sx={{
          p: 6,
          height: 240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: theme => alpha(theme.palette.primary.main, 0.03),
          border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No {selectedStatus} {config.entity.namePlural} found
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {config.dashboard.hero.showAddButton
            ? `Click "New ${config.entity.label}" to get started`
            : 'Try adjusting your filters'}
        </Typography>
      </Paper>
    );
  }

  // Determine which component to use based on viewMode
  const getComponent = () => {
    // Use provided view components if available
    if (viewMode === 'list' && ListComponent) return ListComponent;
    if (viewMode === 'table' && TableComponent) return TableComponent;
    // Default: use CardComponent (grid view)
    return CardComponent;
  };

  const Component = getComponent();

  // Table view needs headers
  const renderTableHeaders = () => {
    if (viewMode !== 'table' || !TableComponent) return null;

    // Define headers based on entity type
    const headersByEntity = {
      escrow: [
        'Property', 'Status', 'Price', 'Commission',
        'Acceptance', 'Close', 'Progress', 'Actions'
      ],
      listing: [
        'Property', 'Status', 'List Price', 'Commission',
        'MLS#', 'Beds/Baths', 'Days/Listed', 'Actions'
      ]
    };

    const headers = headersByEntity[config.entity.name] || [
      'Item', 'Status', 'Actions'
    ];

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr 80px',
          gap: 2,
          px: 2,
          py: 1,
          mb: 1,
          borderBottom: `2px solid ${alpha('#000', 0.1)}`,
        }}
      >
        {headers.map((header, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              textAlign: header === 'Progress' ? 'center' : 'left'
            }}
          >
            {header}
          </Typography>
        ))}
      </Box>
    );
  };

  // Grid layout with responsive columns and calculated gap
  // This ensures the rightmost card aligns with the hero section edge
  // and gaps are evenly distributed with a minimum threshold
  const getGridStyles = () => {
    if (viewMode === 'table') {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 1,
        width: '100%',
      };
    }

    if (viewMode === 'card') {
      // Responsive grid with fixed 320px cards
      // Center single-column layouts, left-align multi-column
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, 320px)', // All cards fixed at 320px
        justifyContent: { xs: 'center', sm: 'center', md: 'start' }, // Center on xs/sm (1 column), left on md+ (2+ columns)
        gap: {
          xs: 2, // 16px on mobile
          sm: 2, // 16px on small
          md: 2.5, // 20px on medium
          lg: 3, // 24px on large
          xl: 3, // 24px on xl
        },
        width: '100%',
      };
    }

    // Default (list view)
    return {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '5px',
      width: '100%',
    };
  };

  return (
    <>
      {renderTableHeaders()}

      <Box sx={getGridStyles()}>
        <AnimatePresence>
          {data.map((item, index) => {
              const itemId = item[config.api.idField];
              const isSelected = selectedItems.includes(itemId);

              return (
                <Box
                  component={motion.div}
                  key={itemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  sx={{
                    position: 'relative',
                    width: viewMode === 'card' ? '320px' : 'auto', // Fixed width for card view to match grid
                    '&:hover .multi-select-checkbox': {
                      opacity: 1,
                    },
                  }}
                >
                  {/* Multi-Select Checkbox - Outside card bounds, hidden until hover */}
                  {isSelectable && (
                    <Checkbox
                      className="multi-select-checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectItem?.(item);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        position: 'absolute',
                        top: viewMode === 'card' ? -12 : '50%',
                        left: viewMode === 'card' ? -12 : -48,
                        transform: viewMode === 'card' ? 'none' : 'translateY(-50%)',
                        zIndex: 10,
                        padding: 0,
                        opacity: isSelected ? 1 : 0,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: 24,
                        },
                      }}
                    />
                  )}

                  <Component
                    {...{ [config.entity.name]: item }}
                    onClick={() => {
                      // Navigate to detail page
                      window.location.href = `/${config.entity.namePlural}/${itemId}`;
                    }}
                    viewMode={viewMode}
                    index={index}
                    isArchived={false}
                    onUpdate={onUpdate ? (id, updates) => onUpdate(id, updates) : undefined}
                    onDelete={onDelete ? () => onDelete(itemId) : undefined}
                    onArchive={onArchive ? () => onArchive(itemId) : undefined}
                    customActions={customActions}
                    animationType="spring"
                    isSelectable={isSelectable}
                    isSelected={isSelected}
                    onSelect={onSelectItem}
                  />
                </Box>
              );
            })}
        </AnimatePresence>
      </Box>
    </>
  );
};
