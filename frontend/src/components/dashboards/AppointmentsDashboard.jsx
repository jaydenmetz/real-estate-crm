import React from 'react';
import { Container, Paper, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { api } from '../../services/api';

export default function AppointmentsDashboard() {
  const { data: appointments = [], isLoading } = useQuery(
    'appointments',
    () => api.get('/appointments').then(res => res.data)
  );

  const columns = [
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'date', headerName: 'Date', width: 150, valueFormatter: params => format(new Date(params.value), 'MMM d, yyyy') },
    { field: 'time', headerName: 'Time', width: 120 },
    { field: 'client', headerName: 'Client', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 }
  ];

  if (isLoading) return <LinearProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Appointments</Typography>
      <Paper sx={{ width: '100%', height: 600 }}>
        <DataGrid
          rows={appointments}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Paper>
    </Container>
  );
}