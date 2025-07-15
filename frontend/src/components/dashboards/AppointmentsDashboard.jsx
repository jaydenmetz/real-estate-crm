import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Link,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Cancel,
  CheckCircle,
  Schedule,
  Event,
  Group,
  LocationOn,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { appointmentsAPI } from '../../services/api';

const AppointmentsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  // Mock data for now
  const appointments = [
    {
      id: 1,
      title: 'Buyer Consultation',
      date: '2024-01-15',
      startTime: '10:00',
      appointmentType: 'Buyer Consultation',
      status: 'Scheduled',
      location: { address: '123 Main St' },
      clients: ['John Doe'],
    },
    {
      id: 2,
      title: 'Property Showing',
      date: '2024-01-16',
      startTime: '14:00',
      appointmentType: 'Property Showing',
      status: 'Scheduled',
      location: { address: '456 Oak Ave' },
      clients: ['Jane Smith'],
    },
  ];

  const stats = {
    todayCount: 3,
    upcomingCount: 12,
    completedCount: 45,
    canceledCount: 2,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      case 'No Show':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Buyer Consultation':
        return <Group sx={{ fontSize: 20, mr: 1 }} />;
      case 'Property Showing':
        return <LocationOn sx={{ fontSize: 20, mr: 1 }} />;
      case 'Listing Presentation':
        return <Event sx={{ fontSize: 20, mr: 1 }} />;
      default:
        return <Schedule sx={{ fontSize: 20, mr: 1 }} />;
    }
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          New Appointment
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today
                  </Typography>
                  <Typography variant="h4">
                    {stats.todayCount}
                  </Typography>
                </Box>
                <Event color="primary" fontSize="large" />
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
                    Upcoming
                  </Typography>
                  <Typography variant="h4">
                    {stats.upcomingCount}
                  </Typography>
                </Box>
                <Schedule color="info" fontSize="large" />
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
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {stats.completedCount}
                  </Typography>
                </Box>
                <CheckCircle color="success" fontSize="large" />
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
                    Cancelled
                  </Typography>
                  <Typography variant="h4">
                    {stats.canceledCount}
                  </Typography>
                </Box>
                <Cancel color="error" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All" />
          <Tab label="Today" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {/* Appointments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Clients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow 
                key={appointment.id}
                hover
                sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                <TableCell>
                  <Link
                    component="button"
                    variant="body1"
                    onClick={() => handleAppointmentClick(appointment.id)}
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {appointment.title}
                  </Link>
                </TableCell>
                <TableCell>
                  {safeFormatDate(appointment.date, 'MMM d, yyyy')} at {appointment.startTime || 'N/A'}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getTypeIcon(appointment.appointmentType)}
                    {appointment.appointmentType}
                  </Box>
                </TableCell>
                <TableCell>{appointment.location?.address || 'N/A'}</TableCell>
                <TableCell>{appointment.clients.join(', ')}</TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View">
                    <IconButton 
                      size="small"
                      onClick={() => handleAppointmentClick(appointment.id)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small">
                      <Edit />
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

export default AppointmentsDashboard;