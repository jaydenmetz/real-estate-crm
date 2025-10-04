import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, Refresh } from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const TableDataViewer = ({ tableName, displayName, onBack }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    fetchTableData();
  }, [tableName, paginationModel.page, paginationModel.pageSize]);

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const offset = paginationModel.page * paginationModel.pageSize;
      const response = await apiInstance.get(
        `/admin/table/${tableName}?limit=${paginationModel.pageSize}&offset=${offset}`
      );

      if (response.success) {
        setTableData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!tableData && loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tableData) {
    return (
      <Box p={3}>
        <Typography color="error">Failed to load table data</Typography>
        <Button onClick={onBack} startIcon={<ArrowBack />} sx={{ mt: 2 }}>
          Back to Overview
        </Button>
      </Box>
    );
  }

  // Convert columns from database schema to DataGrid format
  const columns = tableData.columns.map((col) => ({
    field: col.name,
    headerName: col.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const value = params.value;

      // Handle different data types
      if (value === null || value === undefined) {
        return <Typography variant="body2" color="textSecondary">NULL</Typography>;
      }

      if (typeof value === 'boolean') {
        return (
          <Chip
            label={value ? 'TRUE' : 'FALSE'}
            size="small"
            color={value ? 'success' : 'default'}
          />
        );
      }

      if (typeof value === 'object') {
        return <Typography variant="body2">{JSON.stringify(value)}</Typography>;
      }

      // Handle timestamps
      if (col.name.includes('_at') || col.name === 'created' || col.name === 'updated') {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return <Typography variant="body2">{date.toLocaleString()}</Typography>;
          }
        } catch (e) {
          // Not a valid date, fall through to default
        }
      }

      return <Typography variant="body2">{String(value)}</Typography>;
    }
  }));

  // Add an ID column if not present (DataGrid requires it)
  const rows = tableData.rows.map((row, index) => ({
    ...row,
    _rowId: row.id || index
  }));

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {displayName}
        </Typography>
        <Chip
          label={`${tableData.totalCount.toLocaleString()} rows`}
          color="primary"
          size="small"
        />
        <Box flexGrow={1} />
        <IconButton onClick={fetchTableData} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Data Grid */}
      <Paper elevation={3} sx={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._rowId}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={tableData.totalCount}
          paginationMode="server"
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              overflow: 'visible',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default TableDataViewer;
