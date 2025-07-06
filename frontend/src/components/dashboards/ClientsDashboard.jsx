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
  Avatar
} from '@mui/material';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  Person,
  Email,
  Phone,
  CakeOutlined,
  FavoriteOutlined
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { api } from '../../services/api';
import ClientForm from '../forms/ClientForm';
import StatsCard from '../common/StatsCard';

const ClientsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Fetch clients based on status/type
  const filterMap = ['all', 'Active', 'Past Client', 'Prospect'];
  const currentFilter = filterMap[tabValue];
  
  const { data, isLoading } = useQuery(
    ['clients', currentFilter],
    () => api.get('/clients', { 
      params: currentFilter !== 'all' ? { status: currentFilter } : {} 
    }).then(res => res.data)
  );

  // Create/Update mutation
  const mutation = useMutation(
    (clientData) => {
      if (selectedClient) {
        return api.put(`/clients/${selectedClient.id}`, clientData);
      }
      return api.post('/clients', clientData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        enqueueSnackbar('Client saved successfully', { variant: 'success' });
        handleCloseForm();
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error?.message || 'Error saving client', { 
          variant: 'error' 
        });
      },
    }
  );

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedClient(null);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setOpenForm(true);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
          {getInitials(params.row.firstName, params.row.lastName)}
        </Avatar>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Name',
      width: 200,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {params.row.preferredName && (
            <Typography variant="caption" color="text.secondary">
              "{params.row.preferredName}"
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'clientType',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Buyer' ? 'primary' :
            params.value === 'Seller' ? 'secondary' :
            params.value === 'Both' ? 'success' : 'default'
          }
        />
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email fontSize="small" color="action" />
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone fontSize="small" color="action" />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'clientStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color={
            params.value === 'Active' ? 'success' :
            params.value === 'Past Client' ? 'primary' :
            params.value === 'Prospect' ? 'warning' : 'default'
          }
        />
      ),
    },
    {
      field: 'lifetimeValue',
      headerName: 'Lifetime Value',
      width: 130,
      valueFormatter: (params) => params.value ? `$${params.value.toLocaleString()}` : '$0',
    },
    {
      field: 'lastContactDate',
      headerName: 'Last Contact',
      width: 120,
      valueFormatter: (params) => params.value ? format(new Date(params.value), 'MMM d, yyyy') : 'Never',
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
        <Typography variant="h4">Client Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            New Client
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
            title="Total Clients"
            value={data?.total || 0}
            icon={<Person />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Clients"
            value={data?.activeCount || 0}
            icon={<FavoriteOutlined />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Birthdays This Month"
            value={data?.birthdaysThisMonth || 0}
            icon={<CakeOutlined />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Lifetime Value"
            value={`$${(data?.avgLifetimeValue || 0).toLocaleString()}`}
            icon={<Person />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Client Segments */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Clients" />
          <Tab label="Active" />
          <Tab label="Past Clients" />
          <Tab label="Prospects" />
        </Tabs>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data?.clients || []}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[20, 50, 100]}
            loading={isLoading}
            disableSelectionOnClick
            checkboxSelection
            getRowId={(row) => row.id}
          />
        </Box>
      </Paper>

      {/* Form Dialog */}
      <ClientForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(data) => mutation.mutate(data)}
        client={selectedClient}
        loading={mutation.isLoading}
      />
    </Container>
  );
};

export default ClientsDashboard;
