/**
 * StatusTabWithDropdown Component
 *
 * A tab with an integrated dropdown menu showing all statuses in the category.
 * Multi-select checkboxes with intelligent category controls and smart nesting.
 *
 * Features:
 * - Click tab when NOT selected: Switch to that category (all statuses selected by default)
 * - Click tab when ALREADY selected: Open dropdown to manage status filters
 * - Smart nesting: Only shows category header + indented children if category has 2+ statuses
 * - Single status categories: Display flat (no redundant parent/child)
 * - Category checkboxes control all child statuses (indeterminate for partial selection)
 * - All statuses selected by default when switching tabs
 * - Empty selection = show all items (no filter)
 * - No color circles (removed per user request)
 *
 * Examples:
 * - Escrows (Active=1, Closed=1, Cancelled=1): All tabs show flat list
 * - Listings (Active=3, Closed=1): Active tab shows nested, Closed shows flat
 */

import React, { useState, useRef } from 'react';
import {
  Tab,
  Menu,
  MenuItem,
  Box,
  Typography,
  alpha,
  Checkbox,
  keyframes,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useStatus } from '../../../contexts/StatusContext';

// Pulsing animation for when no statuses are selected
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
`;

const StatusTabWithDropdown = ({
  category,
  entity,
  isSelected,
  onCategoryClick,
  onStatusToggle, // Toggle individual status in multi-select array
  selectedStatuses = [], // Array of selected status keys for this tab
  ...tabProps
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const tabRef = useRef(null);

  // Get status data from StatusContext (database-driven)
  const { categories: dbCategories, getStatusByKey, loading } = useStatus();

  // Get category data from database
  const currentCategory = dbCategories?.find(c => c.category_key === category.id);

  // For "All" tab, get all categories except "All" itself
  const allCategories = category.id === 'All'
    ? dbCategories?.filter(c => c.category_key !== 'All')
    : null;

  // Calculate display label
  const getDisplayLabel = () => {
    if (!isSelected || selectedStatuses.length === 0) {
      return category.label; // Default: show category name
    }

    // Get all statuses in this category
    const categoryStatuses = category.id === 'All'
      ? allCategories?.flatMap(cat => cat.statuses) || []
      : currentCategory?.statuses || [];

    const totalInCategory = categoryStatuses.length;

    // If all statuses selected, show category name
    if (selectedStatuses.length === totalInCategory) {
      return category.label;
    }

    // If single status selected, show that status name
    if (selectedStatuses.length === 1) {
      const status = getStatusByKey(selectedStatuses[0]);
      return status?.label || selectedStatuses[0];
    }

    // If multiple but not all, just show category name (count is redundant with stat cards)
    return category.label;
  };

  const handleTabClick = (event) => {
    event.stopPropagation();

    if (isSelected) {
      // Tab is already selected - show dropdown
      setAnchorEl(event.currentTarget);
    } else {
      // Tab is not selected - switch to this category (all statuses selected by default)
      // Get all status keys in this category from database
      const categoryStatuses = category.id === 'All'
        ? allCategories?.flatMap(cat => cat.statuses) || []
        : currentCategory?.statuses || [];

      const allStatusKeys = categoryStatuses.map(s => s.status_key);

      // Call onCategoryClick with all status keys
      onCategoryClick(category.id, allStatusKeys);
    }
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleStatusToggle = (statusKey) => {
    console.log('StatusTabWithDropdown.handleStatusToggle called with:', statusKey);
    console.log('Current selectedStatuses:', selectedStatuses);
    onStatusToggle(statusKey);
    // Keep dropdown open for multi-select
  };

  const handleCategoryToggle = (categoryKey) => {
    // Get all status keys in this category
    // Try both allCategories (for "All" tab) and currentCategory (for individual tabs)
    const cat = allCategories?.find(c => c.category_key === categoryKey) ||
                (currentCategory?.category_key === categoryKey ? currentCategory : null);
    if (!cat) return;

    const categoryStatusKeys = cat.statuses.map(s => s.status_key);

    // Check if all statuses in this category are selected
    const allSelected = categoryStatusKeys.every(key => selectedStatuses.includes(key));

    // Toggle all statuses in this category
    categoryStatusKeys.forEach(key => {
      if (allSelected) {
        // All selected: deselect this status (regardless of current state)
        if (selectedStatuses.includes(key)) {
          onStatusToggle(key);
        }
      } else {
        // Not all selected: select this status (regardless of current state)
        if (!selectedStatuses.includes(key)) {
          onStatusToggle(key);
        }
      }
    });
  };

  // NOTE: Status initialization is handled by DashboardNavigation's useEffect
  // which auto-upgrades "Active" to "Active:Active" on tab switch/initial load.
  // DO NOT add auto-initialization here - it prevents users from deselecting all checkboxes.

  // Loading state
  if (loading) {
    return (
      <Tab
        label={category.label}
        disabled
        sx={{ textTransform: 'none', minHeight: 48, px: 2 }}
        {...tabProps}
      />
    );
  }

  // Check if no statuses are selected (tab is selected but empty selection)
  const hasNoStatusesSelected = isSelected && selectedStatuses.length === 0;

  return (
    <>
      <Tab
        ref={tabRef}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isSelected ? 600 : 400,
                color: hasNoStatusesSelected ? 'warning.main' : 'inherit',
              }}
            >
              {getDisplayLabel()}
            </Typography>
            {isSelected && (
              <KeyboardArrowDown
                sx={{
                  fontSize: 18,
                  transition: 'transform 0.2s',
                  transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: hasNoStatusesSelected ? 'warning.main' : 'inherit',
                }}
              />
            )}
          </Box>
        }
        onClick={handleTabClick}
        sx={{
          textTransform: 'none',
          minHeight: 48,
          px: 2,
          cursor: 'pointer',
          borderRadius: 1,
          // Pulsing animation when no statuses selected
          ...(hasNoStatusesSelected && {
            animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
            backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.08),
            border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }),
          '&:hover': {
            backgroundColor: (theme) => hasNoStatusesSelected
              ? alpha(theme.palette.warning.main, 0.12)
              : alpha(theme.palette.primary.main, 0.04),
          },
        }}
        {...tabProps}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            minWidth: 220,
            maxHeight: 400,
            mt: 0.5,
            boxShadow: 3,
          },
        }}
      >
        {/* ALL TAB: Show grouped categories with smart nesting */}
        {category.id === 'All' && allCategories ? (
          <>
            {allCategories
              .sort((a, b) => (a.category_sort_order || 0) - (b.category_sort_order || 0))
              .map((cat) => {
                const categoryStatusKeys = cat.statuses.map(s => s.status_key);
                const selectedInCategory = categoryStatusKeys.filter(key =>
                  selectedStatuses.includes(key)
                ).length;
                const allCategorySelected = selectedInCategory === categoryStatusKeys.length;

                // Smart display: Only show nested structure if category has multiple statuses
                const hasMultipleStatuses = cat.statuses.length > 1;

                return (
                  <React.Fragment key={cat.category_id}>
                    {hasMultipleStatuses ? (
                      /* Multiple statuses: Show category header + indented children */
                      <>
                        {/* Category checkbox (parent) */}
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryToggle(cat.category_key);
                          }}
                          sx={{
                            fontSize: '0.875rem',
                            py: 1,
                            fontWeight: 600,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                              checked={allCategorySelected}
                              size="small"
                              sx={{ p: 0 }}
                              readOnly
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {cat.category_label}
                            </Typography>
                          </Box>
                        </MenuItem>

                        {/* Indented child statuses */}
                        {cat.statuses.map((status) => {
                          const isChecked = selectedStatuses.includes(status.status_key);

                          return (
                            <MenuItem
                              key={status.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusToggle(status.status_key);
                              }}
                              sx={{
                                fontSize: '0.875rem',
                                py: 1,
                                pl: 5, // Indented under category (increased from 4 to 5)
                                fontWeight: isChecked ? 600 : 400,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Checkbox
                                  checked={isChecked}
                                  size="small"
                                  sx={{ p: 0 }}
                                  readOnly
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: isChecked ? 600 : 400,
                                    color: isChecked ? 'text.primary' : 'text.secondary',
                                  }}
                                >
                                  {status?.label || status.status_key}
                                </Typography>
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </>
                    ) : (
                      /* Single status: Show flat (no redundant nesting) */
                      cat.statuses.map((status) => {
                        const isChecked = selectedStatuses.includes(status.status_key);

                        return (
                          <MenuItem
                            key={status.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusToggle(status.status_key);
                            }}
                            sx={{
                              fontSize: '0.875rem',
                              py: 1,
                              pl: 1.5, // No indentation for single status
                              fontWeight: isChecked ? 600 : 400,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Checkbox
                                checked={isChecked}
                                size="small"
                                sx={{ p: 0 }}
                                readOnly
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isChecked ? 600 : 400,
                                  color: isChecked ? 'text.primary' : 'text.secondary',
                                }}
                              >
                                {status?.label || status.status_key}
                              </Typography>
                            </Box>
                          </MenuItem>
                        );
                      })
                    )}
                  </React.Fragment>
                );
              })}
          </>
        ) : (
          /* INDIVIDUAL TABS: Smart nesting based on status count */
          (() => {
            const hasMultipleStatuses = (currentCategory?.statuses?.length || 0) > 1;

            if (hasMultipleStatuses) {
              // Multiple statuses: Show category header + indented children
              const categoryStatusKeys = currentCategory.statuses.map(s => s.status_key);
              const selectedInCategory = categoryStatusKeys.filter(key =>
                selectedStatuses.includes(key)
              ).length;
              const allCategorySelected = selectedInCategory === categoryStatusKeys.length;

              return (
                <>
                  {/* Category checkbox (parent) */}
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryToggle(currentCategory.category_key);
                    }}
                    sx={{
                      fontSize: '0.875rem',
                      py: 1,
                      fontWeight: 600,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        checked={allCategorySelected}
                        size="small"
                        sx={{ p: 0 }}
                        readOnly
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {currentCategory.category_label}
                      </Typography>
                    </Box>
                  </MenuItem>

                  {/* Indented child statuses */}
                  {currentCategory.statuses.map((status) => {
                    const isChecked = selectedStatuses.includes(status.status_key);

                    return (
                      <MenuItem
                        key={status.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggle(status.status_key);
                        }}
                        sx={{
                          fontSize: '0.875rem',
                          py: 1,
                          pl: 5, // Indented under category (increased from 4 to 5)
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Checkbox
                            checked={isChecked}
                            size="small"
                            sx={{ p: 0 }}
                            readOnly
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isChecked ? 600 : 400,
                              color: isChecked ? 'text.primary' : 'text.secondary',
                            }}
                          >
                            {status?.label || status.status_key}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </>
              );
            } else {
              // Single status: Show flat (no redundant nesting)
              return currentCategory?.statuses?.map((status) => {
                const isChecked = selectedStatuses.includes(status.status_key);

                return (
                  <MenuItem
                    key={status.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(status.status_key);
                    }}
                    sx={{
                      fontSize: '0.875rem',
                      py: 1,
                      pl: 1.5, // No indentation
                      fontWeight: isChecked ? 600 : 400,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Checkbox
                        checked={isChecked}
                        size="small"
                        sx={{ p: 0 }}
                        readOnly
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isChecked ? 600 : 400,
                          color: isChecked ? 'text.primary' : 'text.secondary',
                        }}
                      >
                        {status?.label || status.status_key}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              }) || [];
            }
          })()
        )}
      </Menu>
    </>
  );
};

export { StatusTabWithDropdown };
export default StatusTabWithDropdown;
