import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { api } from '../../services/api';
import EscrowForm from '../forms/EscrowForm';
import StatsCard from '../common/StatsCard';

const EscrowsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Fetch escrows based on status
  const status = ['Active', 'Pending', 'Closed'][tabValue];
  const { data, isLoading } = useQuery(
    ['escrows', status],
    () => api.get('/escrows', { params: { status } }).then(res => res.data)
  );

  // Create/Update mutation
  const mutation = useMutation(
    (escrowData) => {
      if (selectedEscrow) {
        return api.put(`/escrows/${selectedEscrow.id}`, escrowData);
      }
      return api.post('/escrows', escrowData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('escrows');
        enqueueSnackbar('Escrow saved successfully', { variant: 'success' });
        handleCloseForm();
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error?.message || 'Error saving escrow', { 
          variant: 'error' 
        });
      },
    }
  );

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedEscrow(null);
  };

  const handleEdit = (escrow) => {
    setSelectedEscrow(escrow);
    setOpenForm(true);
  };

  const columns = [
    {
      field: 'propertyAddress',
      headerName: 'Property Address',
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'purchasePrice',
      headerName: 'Purchase Price',
      width: 130,
      valueFormatter: (params) => `${params.value?.toLocaleString()}`,
    },
    {
      field: 'buyers',
      headerName: 'Buyers',
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.value?.map(buyer => buyer.name).join(', ') || 'N/A'}
        </Box>
      ),
    },
    {
      field: 'closingDate',
      headerName: 'Closing Date',
      width: 120,
      valueFormatter: (params) => params.value ? format(new Date(params.value), 'MMM d, yyyy') : '',
    },
    {
      field: 'escrowStatus',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Active' ? 'success' :
            params.value === 'Pending' ? 'warning' : 'default'
          }
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Escrow Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            New Escrow
          </Button>
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Active"
            value={data?.pagination?.total || 0}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Closing This Week"
            value={data?.closingThisWeek || 0}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Volume"
            value={`${(data?.totalVolume || 0).toLocaleString()}`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Days to Close"
            value={data?.avgDaysToClose || 0}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Tabs and Data Grid */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Active" />
          <Tab label="Pending" />
          <Tab label="Closed" />
        </Tabs>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data?.escrows || []}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[20, 50, 100]}
            loading={isLoading}
            disableSelectionOnClick
            checkboxSelection
          />
        </Box>
      </Paper>

      {/* Form Dialog */}
      <EscrowForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(data) => mutation.mutate(data)}
        escrow={selectedEscrow}
        loading={mutation.isLoading}
      />
    </Container>
  );
};

export default EscrowsDashboard;