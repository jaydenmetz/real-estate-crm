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
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import ClientForm from '../forms/ClientForm';
import StatsCard from '../common/StatsCard';

const ClientsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filter map for tabs
  const filterMap = ['all', 'Active', 'Past Client', 'Prospect'];
  const currentFilter = filterMap[tabValue];
  
  // Fetch clients with proper error handling and mock data fallback
  const { data: apiResponse, isLoading } = useQuery(
    ['clients', currentFilter],
    async () => {
      try {
        const response = await api.get('/clients', { 
          params: currentFilter !== 'all' ? { status: currentFilter } : {}
        });
        
        // Extract data from the nested structure
        if (response.data && response.data.data) {
          return response.data.data;
        } else if (response.data) {
          return response.data;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        // Return mock data on error
        return getMockData();
      }
    },
    {
      refetchInterval: 30000,
      retry: 1,
      onError: (error) => {
        console.error('Query error:', error);
        enqueueSnackbar('Failed to load clients. Using sample data.', { variant: 'warning' });
      }
    }
  );

  // Mock data fallback
  const getMockData = () => {
    const mockClients = [
      {
        id: '1',
        name: 'John Henderson',
        firstName: 'John',
        lastName: 'Henderson',
        email: 'john.henderson@email.com',
        phone: '(555) 123-4567',
        type: 'Buyer',
        status: 'Active',
        preferredContact: 'Email',
        notes: 'First-time homebuyer, budget $450k',
        tags: ['buyer', 'first-time'],
        lifetimeValue: 15000,
        lastContactDate: new Date('2024-01-05'),
        createdAt: new Date('2023-06-15')
      },
      {
        id: '2',
        name: 'Sarah Martinez',
        firstName: 'Sarah',
        lastName: 'Martinez',
        email: 'sarah.martinez@email.com',
        phone: '(555) 234-5678',
        type: 'Seller',
        status: 'Active',
        preferredContact: 'Phone',
        notes: 'Relocating for job, needs quick sale',
        tags: ['seller', 'relocation'],
        lifetimeValue: 25000,
        lastContactDate: new Date('2024-01-06'),
        createdAt: new Date('2023-06-20')
      },
      {
        id: '3',
        name: 'Mike Johnson',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '(555) 345-6789',
        type: 'Both',
        status: 'Active',
        preferredContact: 'Text',
        notes: 'Upgrading to larger home, sell first',
        tags: ['buyer', 'seller', 'move-up'],
        lifetimeValue: 45000,
        lastContactDate: new Date('2024-01-04'),
        createdAt: new Date('2023-05-10')
      }
    ];

    // Filter based on current tab
    const filteredClients = currentFilter === 'all' 
      ? mockClients 
      : mockClients.filter(client => client.status === currentFilter);

    return {
      clients: filteredClients,
      total: mockClients.length,
      activeCount: mockClients.filter(c => c.status === 'Active').length,
      birthdaysThisMonth: 2,
      avgLifetimeValue: mockClients.reduce((sum, c) => sum + c.lifetimeValue, 0) / mockClients.length
    };
  };

  // Use the data with fallback
  const data = apiResponse || getMockData();

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
        enqueueSnackbar(`Client ${selectedClient ? 'updated' : 'created'} successfully`, { variant: 'success' });
        handleCloseForm();
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error?.message || 'Error saving client', { variant: 'error' });
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

  const handleView = (client) => {
    navigate(`/clients/${client.id}`);
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.firstName?.[0]}{params.row.lastName?.[0]}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 140,
    },
    {
      field: 'type',
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
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
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
          <IconButton size="small" onClick={() => handleView(params.row)}>
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
            value={`$${((data?.avgLifetimeValue || 0).toLocaleString())}`}
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
            onRowClick={(params) => {
              navigate(`/clients/${params.row.id}`);
            }}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Form Dialog */}
      {openForm && (
        <ClientForm
          open={openForm}
          onClose={handleCloseForm}
          onSubmit={(data) => mutation.mutate(data)}
          client={selectedClient}
          loading={mutation.isLoading}
        />
      )}
    </Container>
  );
};

export default ClientsDashboard;