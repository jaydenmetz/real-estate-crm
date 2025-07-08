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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  PersonAdd,
  Email,
  Phone,
  TrendingUp,
  Assignment,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { leadsAPI } from '../../services/api';

const LeadsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  // Mock data for now
  const leads = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '555-0123',
      leadSource: 'Website',
      leadType: 'Buyer',
      status: 'New',
      score: 85,
      assigned_to: 'John Agent',
      created_at: '2024-01-10',
    },
    {
      id: 2,
      name: 'Mike Wilson',
      email: 'mike.w@email.com',
      phone: '555-0124',
      leadSource: 'Referral',
      leadType: 'Seller',
      status: 'Contacted',
      score: 72,
      assigned_to: 'Jane Agent',
      created_at: '2024-01-09',
    },
  ];

  const stats = {
    newLeads: 12,
    hotLeads: 5,
    contacted: 23,
    converted: 8,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'info';
      case 'Contacted': return 'primary';
      case 'Qualified': return 'success';
      case 'Unqualified': return 'error';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Leads</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Add lead')}
        >
          New Lead
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    New Leads
                  </Typography>
                  <Typography variant="h4">
                    {stats.newLeads}
                  </Typography>
                </Box>
                <PersonAdd color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Hot Leads
                  </Typography>
                  <Typography variant="h4">
                    {stats.hotLeads}
                  </Typography>
                </Box>
                <TrendingUp color="error" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Contacted
                  </Typography>
                  <Typography variant="h4">
                    {stats.contacted}
                  </Typography>
                </Box>
                <Phone color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Converted
                  </Typography>
                  <Typography variant="h4">
                    {stats.converted}
                  </Typography>
                </Box>
                <CheckCircle color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Leads" />
          <Tab label="New" />
          <Tab label="Hot" />
          <Tab label="Contacted" />
          <Tab label="Qualified" />
        </Tabs>
      </Paper>

      {/* Leads Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{lead.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lead.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{lead.leadSource}</TableCell>
                <TableCell>{lead.leadType}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={lead.score}
                      sx={{
                        width: 50,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.300',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(lead.score) === 'success' ? 'success.main' :
                                          getScoreColor(lead.score) === 'warning' ? 'warning.main' : 'error.main'
                        }
                      }}
                    />
                    <Typography variant="body2">{lead.score}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={lead.status}
                    color={getStatusColor(lead.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{lead.assigned_to}</TableCell>
                <TableCell>{format(new Date(lead.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Tooltip title="View">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Contact">
                    <IconButton size="small">
                      <Phone />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default LeadsDashboard;