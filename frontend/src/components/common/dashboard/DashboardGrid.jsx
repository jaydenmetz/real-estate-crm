import React from 'react';
import {
  Grid,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';

const DashboardGrid = ({
  viewMode = 'cards',
  items = [],
  renderCard,
  renderListItem,
  renderTableRow,
  tableColumns = [],
  onItemClick,
  emptyMessage = 'No items found',
  gridProps = { spacing: 3 },
  listProps = {},
  tableProps = {}
}) => {
  // Empty state
  if (!items || items.length === 0) {
    return (
      <Box sx={{
        textAlign: 'center',
        py: 8,
        px: 2
      }}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Cards View
  if (viewMode === 'cards' && renderCard) {
    return (
      <Grid container {...gridProps}>
        {items.map((item, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={item.id || index}
          >
            <Box
              onClick={() => onItemClick && onItemClick(item)}
              sx={{ cursor: onItemClick ? 'pointer' : 'default' }}
            >
              {renderCard(item, index)}
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  // List View
  if (viewMode === 'list' && renderListItem) {
    return (
      <List {...listProps}>
        {items.map((item, index) => (
          <ListItem
            key={item.id || index}
            onClick={() => onItemClick && onItemClick(item)}
            sx={{
              cursor: onItemClick ? 'pointer' : 'default',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            {renderListItem(item, index)}
          </ListItem>
        ))}
      </List>
    );
  }

  // Table View
  if (viewMode === 'table' && (renderTableRow || tableColumns.length > 0)) {
    return (
      <TableContainer component={Paper} {...tableProps}>
        <Table>
          {tableColumns.length > 0 && (
            <TableHead>
              <TableRow>
                {tableColumns.map((column, index) => (
                  <TableCell
                    key={column.field || index}
                    align={column.align || 'left'}
                    width={column.width}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={item.id || index}
                hover
                onClick={() => onItemClick && onItemClick(item)}
                sx={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                {renderTableRow ? (
                  renderTableRow(item, index)
                ) : (
                  tableColumns.map((column, colIndex) => (
                    <TableCell key={colIndex} align={column.align || 'left'}>
                      {column.renderCell
                        ? column.renderCell(item[column.field], item)
                        : item[column.field]}
                    </TableCell>
                  ))
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Calendar View (placeholder for future)
  if (viewMode === 'calendar') {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Typography color="text.secondary">
          Calendar view coming soon
        </Typography>
      </Box>
    );
  }

  // Fallback
  return (
    <Typography color="error">
      View mode "{viewMode}" not configured properly
    </Typography>
  );
};

export default DashboardGrid;