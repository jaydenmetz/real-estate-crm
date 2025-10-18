import React from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';

const DashboardFilters = ({
  activeFilters = {},
  quickFilters = [],
  onFilterChange,
  onClearAll,
  showFilterIcon = true
}) => {
  const activeFilterCount = Object.keys(activeFilters).filter(key => activeFilters[key]).length;

  if (!quickFilters || quickFilters.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        sx={{ gap: 1 }}
      >
        {showFilterIcon && (
          <FilterList sx={{ color: 'text.secondary', mr: 1 }} />
        )}

        {quickFilters.map((filter, index) => {
          const isActive = activeFilters[filter.key] === filter.value;
          return (
            <Chip
              key={filter.key + filter.value || index}
              label={filter.label}
              onClick={() => onFilterChange(filter.key, isActive ? null : filter.value)}
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? 'primary' : 'default'}
              size="medium"
              sx={{
                fontWeight: isActive ? 600 : 400,
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : 'action.hover'
                }
              }}
            />
          );
        })}

        {activeFilterCount > 0 && onClearAll && (
          <Chip
            label={`Clear All (${activeFilterCount})`}
            onDelete={onClearAll}
            deleteIcon={<Clear />}
            color="error"
            variant="outlined"
            size="medium"
            sx={{ ml: 1 }}
          />
        )}
      </Stack>

      {activeFilterCount > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block' }}
        >
          {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
        </Typography>
      )}
    </Box>
  );
};

export default DashboardFilters;