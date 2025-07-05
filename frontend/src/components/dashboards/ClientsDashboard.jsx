import React from 'react';
import { Container, Paper, Typography, Box, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import { api } from '../../services/api';

export default function ClientsDashboard() {
  const { data: clients = [], isLoading } = useQuery(
    'clients',
    () => api.get('/clients').then(res => res.data)
  );

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 }
  ];

  if (isLoading) return <LinearProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Clients</Typography>
      <Paper sx={{ width: '100%', height: 600 }}>
        <DataGrid
          rows={clients}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Paper>
    </Container>
  );
}
