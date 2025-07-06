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
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  TrendingUp,
  Speed,
  Assignment,
  PersonAdd
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { api } from '../../services/api';
import LeadForm from '../forms/LeadForm';
import StatsCard from '../common/StatsCard';

const LeadsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Fetch leads based on status
  const statusMap = ['all', 'New', 'Contacted', 'Qualified', 'Converted'];
  const currentStatus = statusMap[tabValue];
  
  const { data, isLoading } = useQuery(
    ['leads', currentStatus],
    () => api.get('/leads', { 
      params: currentStatus !== 'all' ? { status: currentStatus } : {} 
    }).then(res => res.data)
  );

  // Create/Update mutation
  const mutation = useMutation(
    (leadData) => {
      if (selectedLead) {
        return api.put(`/leads/${selectedLead.id}`, leadData);
      }
      return api.post('/leads', leadData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('leads');
        enqueueSnackbar('Lead saved successfully', { variant: 'success' });
        handleCloseForm();
      },
      onError: (error) => {
        enqueueSnackbar(error.response?.data?.error?.message || 'Error saving lead', { 
          variant: 'error' 
        });
      },
    }
  );

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedLead(null);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setOpenForm(true);
  };

  const handleConvert = async (lead) => {
    try {
      await api.post(`/leads/${lead.id}/convert`, {
        clientType: lead.leadType,
        notes: 'Converted from lead'
      });
      queryClient.invalidateQueries('leads');
      enqueueSnackbar('Lead converted to client successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error converting lead', { variant: 'error' });
    }
  };

  const getTemperatureColor = (temperature) => {
    switch (temperature) {
      case 'Hot': return 'error';
      case 'Warm': return 'warning';
      case 'Cool': return 'info';
      case 'Cold': return 'default';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const columns = [
    {
      field: 'fullName',
      headerName: 'Name',
      width: 180,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.leadSource}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 180,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
    },
    {
      field: 'leadType',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'leadTemperature',
      headerName: 'Temperature',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getTemperatureColor(params.value)}
        />
      ),
    },
    {
      field: 'leadScore',
      headerName: 'Score',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            color={getScoreColor(params.value)}
            sx={{ width: 40, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'leadStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Converted' ? 'success' :
            params.value === 'Qualified' ? 'primary' :
            params.value === 'Contacted' ? 'info' : 'default'
          }
        />
      ),
    },
    {
      field: 'dateCreated',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'nextFollowUpDate',
      headerName: 'Next Follow-up',
      width: 130,
      valueFormatter: (params) => params.value ? format(new Date(params.value), 'MMM d, yyyy') : 'Not set',
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          color={params.value && new Date(params.value) < new Date() ? 'error' : 'inherit'}
        >
          {params.value ? format(new Date(params.value), 'MMM d, yyyy') : 'Not set'}
        </Typography>
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
          <IconButton size="small">
            <Visibility fontSize="small" />
          </IconButton>
          {params.row.leadStatus !== 'Converted' && (
            <Tooltip title="Convert to Client">
              <IconButton size="small" onClick={() => handleConvert(params.row)}>
                <PersonAdd fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Lead Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            New Lead
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
            title="Total Leads"
            value={data?.total || 0}
            icon={<Assignment />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="This Month"
            value={data?.thisMonth || 0}
            icon={<TrendingUp />}
            color="success"
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Conversion Rate"
            value={`${(data?.conversionRate || 0).toFixed(1)}%`}
            icon={<Speed />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Response Time"
            value={`${data?.avgResponseTime || 0}m`}
            icon={<Speed />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Lead Funnel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lead Funnel
        </Typography>
        <Grid container spacing={2}>
          {[
            { status: 'New', count: data?.funnelData?.new || 0, color: 'primary' },
            { status: 'Contacted', count: data?.funnelData?.contacted || 0, color: 'info' },
            { status: 'Qualified', count: data?.funnelData?.qualified || 0, color: 'warning' },
            { status: 'Appointment Set', count: data?.funnelData?.appointmentSet || 0, color: 'secondary' },
            { status: 'Converted', count: data?.funnelData?.converted || 0, color: 'success' }
          ].map((stage) => (
            <Grid item xs key={stage.status}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color={`${stage.color}.main`}>
                    {stage.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stage.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Leads Table */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Leads" />
          <Tab label="New" />
          <Tab label="Contacted" />
          <Tab label="Qualified" />
          <Tab label="Converted" />
        </Tabs>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data?.leads || []}
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
      <LeadForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(data) => mutation.mutate(data)}
        lead={selectedLead}
        loading={mutation.isLoading}
      />
    </Container>
  );
};

export default LeadsDashboard;