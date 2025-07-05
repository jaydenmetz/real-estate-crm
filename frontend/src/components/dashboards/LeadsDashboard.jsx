import React from 'react';
import { Container, Paper, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from 'react-query';
import { api } from '../../services/api';

export default function LeadsDashboard() {
  const { data: leads = [], isLoading } = useQuery(
    'leads',
    () => api.get('/leads').then(res => res.data)
  );

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'source', headerName: 'Source', width: 150 },
    { field: 'contactDate', headerName: 'Contact Date', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 }
  ];

  if (isLoading) return <LinearProgress />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Leads</Typography>
      <Paper sx={{ width: '100%', height: 600 }}>
        <DataGrid
          rows={leads}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Paper>
    </Container>
  );
}
