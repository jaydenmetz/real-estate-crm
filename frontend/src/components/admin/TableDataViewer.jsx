import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stack,
  Alert
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  ArrowBack,
  Refresh,
  Delete,
  DeleteForever,
  Add,
  DeleteOutline
} from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const TableDataViewer = ({ tableName, displayName, onBack }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    fetchTableData();
  }, [tableName, paginationModel.page, paginationModel.pageSize]);

  const fetchTableData = async () => {
    setLoading(true);
    setError('');
    try {
      const offset = paginationModel.page * paginationModel.pageSize;
      const response = await apiInstance.get(
        `/admin/table/${tableName}?limit=${paginationModel.pageSize}&offset=${offset}`
      );

      if (response.success) {
        setTableData(response.data);
        // Initialize newRowData with empty values for each column
        const emptyRow = {};
        response.data.columns.forEach(col => {
          if (col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at') {
            emptyRow[col.name] = '';
          }
        });
        setNewRowData(emptyRow);
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
      setError('Failed to load table data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await apiInstance.delete(`/admin/table/${tableName}/rows`, {
        data: { ids: selectedRows }
      });

      if (response.success) {
        setSuccess(`Deleted ${response.data.deletedCount} row(s)`);
        setSelectedRows([]);
        fetchTableData();
      }
    } catch (error) {
      setError(`Failed to delete rows: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteAll = async () => {
    if (deleteAllConfirmation !== 'DELETE_ALL') {
      setError('Please type DELETE_ALL to confirm');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const response = await apiInstance.delete(`/admin/table/${tableName}/all`, {
        data: { confirmation: 'DELETE_ALL' }
      });

      if (response.success) {
        setSuccess(`Deleted all ${response.data.deletedCount} rows`);
        setSelectedRows([]);
        fetchTableData();
      }
    } catch (error) {
      setError(`Failed to delete all rows: ${error.message}`);
    } finally {
      setDeleteAllDialogOpen(false);
      setDeleteAllConfirmation('');
    }
  };

  const handleCreateRow = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await apiInstance.post(`/admin/table/${tableName}`, newRowData);

      if (response.success) {
        setSuccess('Row created successfully');
        fetchTableData();
        setCreateDialogOpen(false);
      }
    } catch (error) {
      setError(`Failed to create row: ${error.message}`);
    }
  };

  const handleDeleteSingleRow = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await apiInstance.delete(`/admin/table/${tableName}/rows`, {
        data: { ids: [id] }
      });

      if (response.success) {
        setSuccess('Row deleted');
        fetchTableData();
      }
    } catch (error) {
      setError(`Failed to delete row: ${error.message}`);
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

  // Determine which columns to freeze (pin)
  const getFrozenColumns = () => {
    const frozenCols = [];
    const columnNames = tableData.columns.map(c => c.name);

    // Priority freeze: id, email, username, name, first_name, created_at
    if (columnNames.includes('id')) frozenCols.push('id');
    if (columnNames.includes('email')) frozenCols.push('email');
    if (columnNames.includes('username')) frozenCols.push('username');
    if (columnNames.includes('name')) frozenCols.push('name');
    if (columnNames.includes('first_name')) frozenCols.push('first_name');

    return frozenCols;
  };

  const frozenColumns = getFrozenColumns();

  // Convert columns from database schema to DataGrid format
  const columns = tableData.columns.map((col) => {
    const isPinned = frozenColumns.includes(col.name);

    return {
      field: col.name,
      headerName: col.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      flex: 1,
      minWidth: 150,
      pinned: isPinned ? 'left' : undefined,
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
          return <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{JSON.stringify(value)}</Typography>;
        }

        // Handle timestamps
        if (col.name.includes('_at') || col.name === 'created' || col.name === 'updated') {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{date.toLocaleString()}</Typography>;
            }
          } catch (e) {
            // Not a valid date, fall through to default
          }
        }

        return <Typography variant="body2">{String(value)}</Typography>;
      }
    };
  });

  // Add actions column with delete button
  columns.push({
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    pinned: 'right',
    getActions: (params) => [
      <GridActionsCellItem
        icon={<DeleteOutline />}
        label="Delete"
        onClick={() => handleDeleteSingleRow(params.row.id || params.row._rowId)}
        color="error"
      />
    ]
  });

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

        {/* Action Buttons */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          color="success"
        >
          Add Row
        </Button>

        <Button
          variant="contained"
          startIcon={<Delete />}
          onClick={() => setDeleteDialogOpen(true)}
          disabled={selectedRows.length === 0}
          color="warning"
        >
          Delete Selected ({selectedRows.length})
        </Button>

        <Button
          variant="contained"
          startIcon={<DeleteForever />}
          onClick={() => setDeleteAllDialogOpen(true)}
          color="error"
        >
          Delete All
        </Button>

        <IconButton onClick={fetchTableData} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

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
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              overflow: 'visible',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
            },
            '& .MuiDataGrid-columnHeader--pinned': {
              backgroundColor: '#f5f5f5',
            },
            '& .MuiDataGrid-cell--pinned': {
              backgroundColor: '#fafafa',
            }
          }}
        />
      </Paper>

      {/* Delete Selected Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Selected Rows</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedRows.length} row(s)? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSelected} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Dialog */}
      <Dialog open={deleteAllDialogOpen} onClose={() => setDeleteAllDialogOpen(false)}>
        <DialogTitle>⚠️ Delete All Rows - DANGEROUS</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will permanently delete ALL {tableData.totalCount.toLocaleString()} rows from the <strong>{displayName}</strong> table.
            This action CANNOT be undone!
          </DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            Type <strong>DELETE_ALL</strong> to confirm:
          </DialogContentText>
          <TextField
            fullWidth
            placeholder="DELETE_ALL"
            value={deleteAllConfirmation}
            onChange={(e) => setDeleteAllConfirmation(e.target.value)}
            error={deleteAllConfirmation !== '' && deleteAllConfirmation !== 'DELETE_ALL'}
            helperText={deleteAllConfirmation !== '' && deleteAllConfirmation !== 'DELETE_ALL' ? 'Must match exactly' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteAllDialogOpen(false);
            setDeleteAllConfirmation('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAll}
            color="error"
            variant="contained"
            disabled={deleteAllConfirmation !== 'DELETE_ALL'}
          >
            Delete All Rows
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Row Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Row in {displayName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {tableData.columns
              .filter(col => col.name !== 'id' && col.name !== 'created_at' && col.name !== 'updated_at')
              .map((col) => (
                <TextField
                  key={col.name}
                  fullWidth
                  label={col.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  placeholder={`Enter ${col.name}`}
                  value={newRowData[col.name] || ''}
                  onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                  helperText={`Type: ${col.type}`}
                />
              ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRow} variant="contained" color="success">
            Create Row
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TableDataViewer;
