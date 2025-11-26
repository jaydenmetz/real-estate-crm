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
  // Date range props
  dateRangeFilter,
  customStartDate,
  customEndDate,
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
    // Format status text intelligently
    const formatStatusText = (statusStr) => {
      if (!statusStr) return '';

      // Parse format: "CategoryKey:status1,status2" or just "CategoryKey"
      // Examples: "Active:Active", "All:Active,Closed", "Active", "Closed:Closed"

      // Remove "All:" prefix completely if present
      let cleaned = statusStr.replace(/^All:/, '');

      // If result is empty or just "All", return empty string (no status prefix)
      if (!cleaned || cleaned === 'All') return '';

      // Split by BOTH colon and comma to handle "Closed:Closed" format
      // Replace colons with commas, then split by comma
      const parts = cleaned.replace(/:/g, ',').split(',').map(s => s.trim()).filter(Boolean);

      // Remove duplicates (e.g., "Active:Active" becomes just "Active")
      const uniqueParts = [...new Set(parts)];

      if (uniqueParts.length === 0) return '';
      if (uniqueParts.length === 1) return uniqueParts[0];
      if (uniqueParts.length === 2) return `${uniqueParts[0]} or ${uniqueParts[1]}`;

      // 3+ items: "A, B, or C"
      const lastPart = uniqueParts[uniqueParts.length - 1];
      const firstParts = uniqueParts.slice(0, -1).join(', ');
      return `${firstParts}, or ${lastPart}`;
    };

    // Format date range for display
    const formatDateRange = () => {
      const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
          return null;
        }
      };

      if (customStartDate && customEndDate) {
        return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
      } else if (customStartDate) {
        return `${formatDate(customStartDate)} onwards`;
      } else if (customEndDate) {
        return `Up to ${formatDate(customEndDate)}`;
      } else if (dateRangeFilter && dateRangeFilter !== 'all_time') {
        // Preset filters like "This Month", "Last 30 Days", etc.
        return dateRangeFilter.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }

      return 'All Dates';
    };

    const formattedStatus = formatStatusText(selectedStatus);
    const dateRangeText = formatDateRange();

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
          No {formattedStatus}{formattedStatus ? ' ' : ''}{config.entity.namePlural.charAt(0).toUpperCase() + config.entity.namePlural.slice(1)} Found
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
          {config.dashboard.hero.showAddButton
            ? `Click "New ${config.entity.label}" to get started`
            : 'Try adjusting your filters'}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Dates Displayed: {dateRangeText}
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
        'Acceptance', 'Close Date', 'Progress', 'Actions'
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
