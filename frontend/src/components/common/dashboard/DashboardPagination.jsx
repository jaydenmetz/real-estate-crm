import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';

const DashboardPagination = ({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  showItemsPerPage = true,
  showTotalCount = true
}) => {
  if (totalPages <= 1 && !showTotalCount) return null;

  const startItem = totalItems > 0 ? (page - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mt: 4,
      flexWrap: 'wrap',
      gap: 2
    }}>
      {/* Left: Item count */}
      {showTotalCount && totalItems > 0 && (
        <Typography variant="body2" color="text.secondary">
          Showing {startItem} - {endItem} of {totalItems} items
        </Typography>
      )}

      {/* Center: Pagination */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, newPage) => onPageChange(newPage)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      )}

      {/* Right: Items per page */}
      {showItemsPerPage && onItemsPerPageChange && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Show:
          </Typography>
          <FormControl size="small">
            <Select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(e.target.value)}
              sx={{ minWidth: 70 }}
            >
              {itemsPerPageOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default DashboardPagination;