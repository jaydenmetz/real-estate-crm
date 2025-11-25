/**
 * StatusTabWithDropdown Component
 *
 * A tab with an integrated dropdown menu showing all statuses in the category.
 * When the tab is already selected, clicking it opens a dropdown to filter by specific status.
 *
 * Features:
 * - Click tab when NOT selected: Switch to that category (all statuses)
 * - Click tab when ALREADY selected: Open dropdown to filter by specific status
 * - Dropdown shows: "All [Category]" option + Divider + Individual status options
 * - Works with status configuration system
 */

import React, { useState, useRef } from 'react';
import {
  Tab,
  Menu,
  MenuItem,
  Divider,
  Box,
  Typography,
  alpha,
  Checkbox,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { getCategoryDropdown, getStatusById, getEntityCategories } from '../../../config/statuses';

const StatusTabWithDropdown = ({
  category,
  entity,
  isSelected,
  onCategoryClick,
  onStatusClick,
  currentStatus, // Currently selected status (if filtering by single status)
  ...tabProps
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const tabRef = useRef(null);

  // Debug logging
  console.log('StatusTabWithDropdown rendered:', {
    categoryLabel: category?.label,
    entity,
    isSelected,
    categoryStatuses: category?.statuses
  });

  const handleTabClick = (event) => {
    event.stopPropagation();

    console.log('Tab clicked:', {
      categoryLabel: category?.label,
      isSelected,
      willShowDropdown: isSelected,
      currentTarget: event.currentTarget
    });

    if (isSelected) {
      // Tab is already selected - show dropdown
      console.log('Opening dropdown...');
      setAnchorEl(event.currentTarget);
    } else {
      // Tab is not selected - switch to this category
      console.log('Switching to category:', category.id);
      onCategoryClick(category.id);
    }
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleStatusSelect = (statusId) => {
    onStatusClick(statusId);
    handleDropdownClose();
  };

  const handleCategorySelect = () => {
    // Select entire category (all statuses)
    onCategoryClick(category.id);
    handleDropdownClose();
  };

  // Get dropdown data
  const dropdown = getCategoryDropdown(entity, category.id);

  // For "All" tab, get all categories to show grouped view
  const allCategories = category.id === 'all' ? getEntityCategories(entity) : null;

  // Determine display label: show specific status if filtering, otherwise show category label
  const displayLabel = currentStatus
    ? getStatusById(entity, currentStatus)?.label || currentStatus
    : category.label;

  return (
    <>
      <Tab
        ref={tabRef}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
              {displayLabel}
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
          sx={{
            minWidth: 220,
            maxHeight: 400,
            mt: 0.5,
            boxShadow: 3,
          },
        }}
      >
        {/* ALL TAB: Show grouped categories with indented statuses */}
        {category.id === 'all' && allCategories ? (
          <>
            {Object.values(allCategories)
              .filter(cat => cat.id !== 'all') // Don't show "All" category itself
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Category checkbox */}
                  <MenuItem
                    onClick={() => onCategoryClick(cat.id)}
                    sx={{
                      fontSize: '0.875rem',
                      py: 1,
                      fontWeight: 600,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        checked={false} // Categories themselves aren't selectable
                        size="small"
                        sx={{ p: 0 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cat.label}
                      </Typography>
                    </Box>
                  </MenuItem>

                  {/* Indented statuses under this category */}
                  {cat.statuses.map((statusId) => {
                    const status = getStatusById(entity, statusId);
                    const isCurrentStatus = currentStatus === statusId;

                    return (
                      <MenuItem
                        key={statusId}
                        onClick={() => handleStatusSelect(statusId)}
                        selected={isCurrentStatus}
                        sx={{
                          fontSize: '0.875rem',
                          py: 1,
                          pl: 4, // Indented under category
                          fontWeight: isCurrentStatus ? 600 : 400,
                          '&.Mui-selected': {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Checkbox
                            checked={isCurrentStatus}
                            size="small"
                            sx={{ p: 0 }}
                          />
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: status?.color || 'grey.400',
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isCurrentStatus ? 600 : 400,
                              color: isCurrentStatus ? 'text.primary' : 'text.secondary',
                            }}
                          >
                            {status?.label || statusId}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </React.Fragment>
              ))}
          </>
        ) : (
          /* ACTIVE/CLOSED/CANCELLED TABS: Flat list with checkboxes */
          dropdown.items.map((statusId) => {
            const status = getStatusById(entity, statusId);
            const isCurrentStatus = currentStatus === statusId;

            return (
              <MenuItem
                key={statusId}
                onClick={() => handleStatusSelect(statusId)}
                selected={isCurrentStatus}
                sx={{
                  fontSize: '0.875rem',
                  py: 1,
                  pl: 1.5,
                  fontWeight: isCurrentStatus ? 600 : 400,
                  '&.Mui-selected': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Checkbox
                    checked={isCurrentStatus}
                    size="small"
                    sx={{ p: 0 }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: status?.color || 'grey.400',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isCurrentStatus ? 600 : 400,
                      color: isCurrentStatus ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    {status?.label || statusId}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
};

export { StatusTabWithDropdown };
export default StatusTabWithDropdown;
