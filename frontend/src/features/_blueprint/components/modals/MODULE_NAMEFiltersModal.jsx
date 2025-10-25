import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip
} from '@mui/material';

/**
 * MODULE_NAME Filters Modal Component
 *
 * Modal for filtering MODULE_PLURAL
 */
const MODULE_NAMEFiltersModal = ({ open, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState({
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Sync with parent filters
  useEffect(() => {
    if (filters) {
      setLocalFilters({
        status: filters.status || 'all',
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'desc'
      });
    }
  }, [filters]);

  const handleChange = (field) => (event) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
  };

  const hasActiveFilters = () => {
    return localFilters.status !== 'all' ||
           localFilters.sortBy !== 'created_at' ||
           localFilters.sortOrder !== 'desc';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filter MODULE_PLURAL
          {hasActiveFilters() && (
            <Chip
              label={`${Object.values(localFilters).filter(v => v !== 'all').length} active`}
              size="small"
              color="primary"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {/* Status Filter */}
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={localFilters.status}
              onChange={handleChange('status')}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>

          {/* Sort By Filter */}
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={localFilters.sortBy}
              onChange={handleChange('sortBy')}
              label="Sort By"
            >
              <MenuItem value="created_at">Created Date</MenuItem>
              <MenuItem value="updated_at">Updated Date</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>

          {/* Sort Order Filter */}
          <FormControl fullWidth>
            <InputLabel>Sort Order</InputLabel>
            <Select
              value={localFilters.sortOrder}
              onChange={handleChange('sortOrder')}
              label="Sort Order"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>

          {/* Add more filter fields as needed */}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleReset} color="secondary">
          Reset
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MODULE_NAMEFiltersModal;
