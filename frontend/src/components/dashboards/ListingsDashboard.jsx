import React from 'react';
import { Container, Paper, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import { api } from '../../services/api';

export default function ListingsDashboard() {
  const { data: listings = [], isLoading } = useQuery(
    'listings',
    () => api.get('/listings').then(res => res.data)
  );

  const columns = [
    { field: 'address', headerName: 'Address', width: 250 },
    { field: 'price', headerName: 'Price', width: 130, valueFormatter: params => `$${params.value.toLocaleString()}` },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'agent', headerName: 'Agent', width: 200 }
  ];

  if (isLoading) return <LinearProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Listings</Typography>
      <Paper sx={{ width: '100%', height: 600 }}>
        <DataGrid
          rows={listings}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Paper>
    </Container>
  );
}