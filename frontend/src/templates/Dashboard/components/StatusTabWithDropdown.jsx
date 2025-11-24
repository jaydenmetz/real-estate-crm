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
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { getCategoryDropdown, getStatusById } from '../../../config/statuses';

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

  return (
    <>
      <Tab
        ref={tabRef}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
              {category.label}
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
        {/* Option: View All in Category */}
        <MenuItem
          onClick={handleCategorySelect}
          selected={!currentStatus} // Highlight if showing all statuses
          sx={{
            fontSize: '0.875rem',
            py: 1,
            fontWeight: !currentStatus ? 600 : 400,
            '&.Mui-selected': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                opacity: !currentStatus ? 1 : 0,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: !currentStatus ? 600 : 400 }}>
              {category.label.startsWith('All') ? category.label : `All ${category.label}`}
            </Typography>
          </Box>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {/* Individual Status Options */}
        {dropdown.items.map((statusId) => {
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
                pl: 3,
                fontWeight: isCurrentStatus ? 600 : 400,
                '&.Mui-selected': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Status Indicator Dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: status?.color || 'grey.400',
                    opacity: isCurrentStatus ? 1 : 0,
                  }}
                />

                {/* Status Label */}
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
      </Menu>
    </>
  );
};

export { StatusTabWithDropdown };
export default StatusTabWithDropdown;
