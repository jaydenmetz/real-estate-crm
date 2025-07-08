import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Home,
  People,
  Assessment,
  Warning,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import api from '../../services/api';

const HomeDashboard = () => {
  // Mock data for now
  const stats = {
    activeEscrows: 12,
    activeListings: 8,
    totalClients: 156,
    upcomingAppointments: 4,
  };

  const todaySchedule = [
    { id: 1, title: 'Property Showing', time: '10:00 AM', type: 'showing' },
    { id: 2, title: 'Client Meeting', time: '2:00 PM', type: 'meeting' },
  ];

  const urgentTasks = [
    { id: 1, title: 'Follow up with John Doe', priority: 'high' },
    { id: 2, title: 'Submit offer for 123 Main St', priority: 'urgent' },
  ];

  // You can uncomment these when the backend is ready:
  /*
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    () => api.get('/analytics/dashboard')
  );

  const { data: todaySchedule } = useQuery(
    'todaySchedule',
    () => api.get('/appointments', {
      date: format(new Date(), 'yyyy-MM-dd')
    })
  );

  const { data: urgentTasks } = useQuery(
    'urgentTasks',
    () => api.get('/ai/alex/urgent-tasks')
  );

  if (statsLoading) {
    return <LinearProgress />;
  }
  */

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Welcome Back!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Escrows
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeEscrows}
                  </Typography>
                </Box>
                <Assessment color="primary" fontSize="large" />
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
                    Active Listings
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeListings}
                  </Typography>
                </Box>
                <Home color="secondary" fontSize="large" />
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
                    Total Clients
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalClients}
                  </Typography>
                </Box>
                <People color="success" fontSize="large" />
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
                    Today's Appointments
                  </Typography>
                  <Typography variant="h4">
                    {stats.upcomingAppointments}
                  </Typography>
                </Box>
                <Schedule color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Schedule
            </Typography>
            {todaySchedule.length > 0 ? (
              <List>
                {todaySchedule.map((appointment) => (
                  <ListItem key={appointment.id}>
                    <ListItemText
                      primary={appointment.title}
                      secondary={appointment.time}
                    />
                    <Chip 
                      label={appointment.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No appointments scheduled for today
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Urgent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Urgent Tasks
            </Typography>
            {urgentTasks.length > 0 ? (
              <List>
                {urgentTasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemText primary={task.title} />
                    <Chip 
                      label={task.priority} 
                      size="small" 
                      color={task.priority === 'urgent' ? 'error' : 'warning'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No urgent tasks at the moment
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomeDashboard;