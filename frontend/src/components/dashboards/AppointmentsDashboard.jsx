// frontend/src/components/dashboards/AppointmentsDashboard.jsx
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
  Cancel,
  CheckCircle,
  Schedule,
  Event,
  Group,
  LocationOn,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { appointmentsAPI } from '../../services/api';
import AppointmentForm from '../forms/AppointmentForm';
import StatsCard from '../common/StatsCard';

const AppointmentsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Filter appointments based on tab
  const filters = ['all', 'today', 'upcoming', 'completed'];
  const currentFilter = filters[tabValue];

  const { data, isLoading } = useQuery(
    ['appointments', currentFilter],
    () => {
      const params = {};
      if (currentFilter === 'today') {
        params.date = format(new Date(), 'yyyy-MM-dd');
      } else if (currentFilter === 'upcoming') {
        params.status = 'Scheduled';
        params.dateFrom = format(new Date(), 'yyyy-MM-dd');
      } else if (currentFilter === 'completed') {
        params.status = 'Completed';
      }
      return appointmentsAPI.getAll(params).then(res => res.data);
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
      keepPreviousData: true,
    }
  );

  // Mutations
  const cancelMutation = useMutation(
    ({ id, reason }) => appointmentsAPI.cancel(id, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        enqueueSnackbar('Appointment cancelled', { variant: 'info' });
      },
    }
  );

  const completeMutation = useMutation(
    ({ id, notes }) => appointmentsAPI.complete(id, { notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        enqueueSnackbar('Appointment marked as completed', { variant: 'success' });
      },
    }
  );

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'primary';
      case 'Confirmed': return 'success';
      case 'Completed': return 'default';
      case 'Cancelled': return 'error';
      case 'No Show': return 'warning';
      default: return 'default';
    }
  };

  const getTimeIndicator = (dateTime) => {
    const appointmentDate = new Date(dateTime);
    if (isPast(appointmentDate)) return { text: 'Past', color: 'text.secondary' };
    if (isToday(appointmentDate)) return { text: 'Today', color: 'error.main' };
    if (isTomorrow(appointmentDate)) return { text: 'Tomorrow', color: 'warning.main' };
    return { text: format(appointmentDate, 'MMM d'), color: 'text.primary' };
  };

  const columns = [
    {
      field: 'title',
      headerName: 'Title',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.appointmentType}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'dateTime',
      headerName: 'Date & Time',
      width: 180,
      renderCell: (params) => {
        const indicator = getTimeIndicator(params.value);
        return (
          <Box>
            <Typography variant="body2" color={indicator.color}>
              {indicator.text} • {format(new Date(params.value), 'h:mm a')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(params.value), 'EEEE')}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'clients',
      headerName: 'Clients',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Group sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {params.value?.map(c => c.name).join(', ') || 'No clients assigned'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" noWrap>
            {params.value || 'TBD'}
          </Typography>
        </Box>
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
          color={getStatusColor(params.value)}
          variant={params.value === 'Confirmed' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          {params.row.status === 'Scheduled' && (
            <>
              <Tooltip title="Mark Complete">
                <IconButton 
                  size="small"
                  onClick={() => completeMutation.mutate({ id: params.row.id })}
                >
                  <CheckCircle fontSize="small" color="success" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton 
                  size="small"
                  onClick={() => cancelMutation.mutate({ id: params.row.id, reason: 'Cancelled by user' })}
                >
                  <Cancel fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Appointment Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            Schedule Appointment
          </Button>
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Appointments"
            value={data?.stats?.today || 0}
            icon={<Event />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="This Week"
            value={data?.stats?.thisWeek || 0}
            icon={<Schedule />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Confirmed Rate"
            value={`${data?.stats?.confirmedRate || 0}%`}
            icon={<CheckCircle />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="No Shows"
            value={data?.stats?.noShows || 0}
            icon={<Cancel />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Appointments Table */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Appointments" />
          <Tab label="Today" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
        </Tabs>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data?.appointments || []}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[20, 50, 100]}
            loading={isLoading}
            disableSelectionOnClick
            checkboxSelection
            getRowId={(row) => row.id}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Form Dialog */}
      <AppointmentForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(data) => {
          const mutation = selectedAppointment 
            ? appointmentsAPI.update(selectedAppointment.id, data)
            : appointmentsAPI.create(data);
          
          mutation.then(() => {
            queryClient.invalidateQueries('appointments');
            enqueueSnackbar(`Appointment ${selectedAppointment ? 'updated' : 'created'}`, { variant: 'success' });
            handleCloseForm();
          });
        }}
        appointment={selectedAppointment}
      />
    </Container>
  );
};

export default AppointmentsDashboard;