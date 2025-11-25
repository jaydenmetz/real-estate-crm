/**
 * StatusTabWithDropdown Component
 *
 * A tab with an integrated dropdown menu showing all statuses in the category.
 * Multi-select checkboxes with intelligent category controls.
 *
 * Features:
 * - Click tab when NOT selected: Switch to that category (all statuses selected by default)
 * - Click tab when ALREADY selected: Open dropdown to manage status filters
 * - Category checkboxes control all child statuses (indeterminate for partial selection)
 * - All statuses selected by default when switching tabs
 * - Empty selection = show all items (no filter)
 * - No color circles (removed per user request)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Tab,
  Menu,
  MenuItem,
  Box,
  Typography,
  alpha,
  Checkbox,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useStatus } from '../../../contexts/StatusContext';

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

    // If multiple but not all, show count
    return `${category.label} (${selectedStatuses.length})`;
  };

  const handleTabClick = (event) => {
    event.stopPropagation();

    if (isSelected) {
      // Tab is already selected - show dropdown
      setAnchorEl(event.currentTarget);
    } else {
      // Tab is not selected - switch to this category (all statuses selected by default)
      onCategoryClick(category.id);
    }
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleStatusToggle = (statusKey) => {
    onStatusToggle(statusKey);
    // Keep dropdown open for multi-select
  };

  const handleCategoryToggle = (categoryKey) => {
    // Get all status keys in this category
    const cat = allCategories?.find(c => c.category_key === categoryKey);
    if (!cat) return;

    const categoryStatusKeys = cat.statuses.map(s => s.status_key);

    // Check if all statuses in this category are selected
    const allSelected = categoryStatusKeys.every(key => selectedStatuses.includes(key));

    // Toggle all statuses in this category
    categoryStatusKeys.forEach(key => {
      // If all selected, deselect all. Otherwise, select all.
      if (allSelected && selectedStatuses.includes(key)) {
        onStatusToggle(key); // Deselect
      } else if (!allSelected && !selectedStatuses.includes(key)) {
        onStatusToggle(key); // Select
      }
    });
  };

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

  return (
    <>
      <Tab
        ref={tabRef}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
              {getDisplayLabel()}
            </Typography>
            {isSelected && (
              <KeyboardArrowDown
                sx={{
                  fontSize: 18,
                  transition: 'transform 0.2s',
                  transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
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
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
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
        {/* ALL TAB: Show grouped categories with indented statuses */}
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
                const someCategorySelected = selectedInCategory > 0 && selectedInCategory < categoryStatusKeys.length;

                return (
                  <React.Fragment key={cat.category_id}>
                    {/* Category checkbox */}
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
                          indeterminate={someCategorySelected}
                          size="small"
                          sx={{ p: 0 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {cat.category_label}
                        </Typography>
                      </Box>
                    </MenuItem>

                    {/* Indented statuses under this category */}
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
                            pl: 4, // Indented under category
                            fontWeight: isChecked ? 600 : 400,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Checkbox
                              checked={isChecked}
                              size="small"
                              sx={{ p: 0 }}
                              onClick={(e) => e.stopPropagation()}
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
                  </React.Fragment>
                );
              })}
          </>
        ) : (
          /* ACTIVE/CLOSED/CANCELLED TABS: Flat list with checkboxes */
          currentCategory?.statuses?.map((status) => {
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
                  pl: 1.5,
                  fontWeight: isChecked ? 600 : 400,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Checkbox
                    checked={isChecked}
                    size="small"
                    sx={{ p: 0 }}
                    onClick={(e) => e.stopPropagation()}
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
          }) || []
        )}
      </Menu>
    </>
  );
};

export { StatusTabWithDropdown };
export default StatusTabWithDropdown;
