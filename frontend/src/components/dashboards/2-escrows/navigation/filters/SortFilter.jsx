import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import { Sort } from '@mui/icons-material';

/**
 * SortFilter - Sort dropdown with icon
 *
 * @param {Array} sortOptions - Sort options from config
 * @param {string} sortBy - Currently selected sort
 * @param {Function} onSortByChange - Handler for sort change
 */
const SortFilter = ({
  sortOptions = [],
  sortBy,
  onSortByChange,
}) => {
  if (sortOptions.length === 0) return null;

  // Create labels map
  const sortLabels = sortOptions.reduce((acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  }, {});

  return (
    <>
      {/* Desktop */}
      <FormControl
        size="small"
        variant="standard"
        sx={{
          display: { xs: 'none', md: 'block' },
          minWidth: 140,
        }}
      >
        <Select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          disableUnderline
          startAdornment={
            <Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />
          }
          renderValue={(value) => (
            <Typography variant="body2" sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
            }}>
              {sortLabels[value] || value}
            </Typography>
          )}
          sx={{
            backgroundColor: 'transparent',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: alpha('#000', 0.04),
              borderColor: 'primary.main',
            },
            '& .MuiSelect-select': {
              paddingRight: '32px !important',
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {sortOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Mobile */}
      <FormControl
        size="small"
        variant="outlined"
        sx={{
          display: { xs: 'block', md: 'none' },
          flex: '1 1 auto',
          maxWidth: { xs: '60%', sm: '200px' },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            borderRadius: 2,
          },
        }}
      >
        <Select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          startAdornment={<Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />}
          renderValue={(value) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Sort: {sortLabels[value] || value}
              </Typography>
            </Box>
          )}
        >
          {sortOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default SortFilter;
