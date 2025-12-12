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
import { useStatus } from '../../../contexts/StatusContext';
import { getCategoryById } from '../../../config/statuses/statusCategories';

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
  showArchived = false, // NEW: Flag to indicate if showing archived items
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

  // Get status context for label lookup
  const { getStatusByKey } = useStatus();

  // Empty state
  if (!data || data.length === 0) {
    // Format status text intelligently
    // Uses CATEGORY LABEL (from statusCategories.js) not status key
    const formatStatusText = (statusStr) => {
      // If viewing archived items, always show "Archived"
      if (showArchived) {
        return 'Archived';
      }

      if (!statusStr) return '';

      // Parse format: "CategoryKey:status1,status2" or just "CategoryKey"
      // Examples: "active:active", "all:active,closed", "won:closed", "lost:cancelled"

      // Handle "all" or "All" - return empty (no prefix needed)
      if (statusStr.toLowerCase() === 'all' || statusStr.toLowerCase().startsWith('all:')) {
        return '';
      }

      // Extract category key (before the colon)
      const categoryKey = statusStr.includes(':')
        ? statusStr.split(':')[0].toLowerCase()
        : statusStr.toLowerCase();

      // Skip if it's "all"
      if (categoryKey === 'all') return '';

      // Look up the CATEGORY (not status) to get the display label
      // getCategoryById returns the category config which has a 'label' property
      const entityName = config.entity.name; // e.g., 'escrow', 'listing', 'client'
      const entityPlural = config.entity.namePlural; // e.g., 'escrows', 'listings', 'clients'
      const category = getCategoryById(entityPlural, categoryKey);

      if (category) {
        return category.label; // Returns "Cancelled", "Closed", "Active", etc.
      }

      // Fallback: Try to get status label if no category found
      const status = getStatusByKey(categoryKey);
      if (status?.label) {
        return status.label;
      }

      // Last resort: capitalize the key
      return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
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

    // Check if no statuses are selected (format: "TabName:" with empty status list or just tab name with no statuses)
    const isNoStatusSelected = (() => {
      if (!selectedStatus) return false;
      // If it contains a colon, check if there are any statuses after it
      if (selectedStatus.includes(':')) {
        const statusList = selectedStatus.split(':')[1];
        return !statusList || statusList.trim() === '';
      }
      return false;
    })();

    // Show special message when no status is selected
    if (isNoStatusSelected) {
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
            background: theme => alpha(theme.palette.warning.main, 0.05),
            border: theme => `2px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Typography variant="h6" color="warning.dark" gutterBottom>
            No {config.entity.label} Status Selected
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
            Click on the status tab dropdown and select at least one status to view {config.entity.namePlural}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            Use the checkboxes in the dropdown to filter by specific statuses
          </Typography>
        </Paper>
      );
    }

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
    // Grid columns must match the corresponding TableRow component's gridTemplateColumns
    const headersByEntity = {
      escrow: {
        headers: ['Property', 'Status', 'Price', 'Commission', 'Acceptance', 'Closing', 'Clients', 'Actions'],
        // Must match EscrowTableRow gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 1.2fr 80px'
        gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 1.2fr 80px',
      },
      listing: {
        headers: ['Property', 'Status', 'List Price', 'Commission', 'MLS#', 'Beds/Baths', 'Days/Listed', 'Actions'],
        gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr 80px',
      },
      appointment: {
        headers: ['Appointment', 'Status', '+ Stops', 'Duration', 'Start', 'End', 'Location', 'Attendees', 'Actions'],
        // Must match AppointmentTableRow gridTemplateColumns: '2fr 1fr 70px 80px 1fr 80px 1.2fr 100px 80px'
        gridTemplateColumns: '2fr 1fr 70px 80px 1fr 80px 1.2fr 100px 80px',
      },
      client: {
        headers: ['Client', 'Status', 'Target Price', 'Commission', 'Beginning', 'Expiration', 'Leads', 'Phone', 'Actions'],
        // Must match ClientTableRow gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 100px 1.2fr 80px'
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 100px 1.2fr 80px',
      },
      lead: {
        headers: ['Lead', 'Status', 'Target Price', 'Commission', 'Created', 'Expires', 'Contacts', 'Score', 'Actions'],
        // Must match LeadTableRow gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 100px 80px 80px'
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 100px 80px 80px',
      },
      contact: {
        headers: ['Name', 'Contact', 'Portfolio', 'Lifetime Value', 'Created', 'Last Follow Up', 'Associated', 'Actions'],
        // Must match ContactTableRow gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px 80px'
        gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 100px 80px',
      },
    };

    const entityConfig = headersByEntity[config.entity.name] || {
      headers: ['Item', 'Status', 'Actions'],
      gridTemplateColumns: '2fr 1fr 80px',
    };

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: entityConfig.gridTemplateColumns,
          gap: 2,
          px: 2,
          py: 1,
          mb: 1,
          borderBottom: `2px solid ${alpha('#000', 0.1)}`,
          minWidth: 'max-content', // Prevent headers from being cut off
        }}
      >
        {entityConfig.headers.map((header, index) => (
          <Typography
            key={index}
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              textAlign: 'left',
              whiteSpace: 'nowrap',
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
        minWidth: 'max-content', // Prevent content from being cut off
      };
    }

    if (viewMode === 'card') {
      // Responsive grid with fixed 320px cards
      // Justification changes based on how many cards fit:
      // - 1 card: center
      // - 2-3 cards: space-evenly (adds space on edges)
      // - 4+ cards: space-between (flush with edges)
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 320px)', // Fill width with 320px cards
        justifyContent: {
          xs: 'center', // 1 card: center it
          sm: 'center', // 1 card: center it
          md: 'space-evenly', // 2-3 cards: space evenly with margins
          lg: 'space-evenly', // 2-3 cards: space evenly with margins
          xl: 'space-between', // 4+ cards: flush with edges
        },
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

  // For table view, wrap in scrollable container
  const tableWrapperStyles = viewMode === 'table' ? {
    overflowX: 'auto',
    overflowY: 'visible',
    width: '100%',
    // Hide scrollbar on Chrome/Safari but keep functionality
    '&::-webkit-scrollbar': {
      height: 8,
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: alpha('#000', 0.2),
      borderRadius: 4,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: alpha('#000', 0.3),
    },
  } : {};

  return (
    <Box sx={tableWrapperStyles}>
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
                    isArchived={showArchived}
                    onUpdate={onUpdate ? (id, updates) => onUpdate(id, updates) : undefined}
                    onDelete={onDelete ? () => onDelete(itemId) : undefined}
                    onArchive={onArchive ? () => onArchive(itemId) : undefined}
                    onRestore={onRestore ? () => onRestore(itemId) : undefined}
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
    </Box>
  );
};
