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
import { api } from '../../services/api';
import StatsCard from '../common/StatsCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HomeDashboard = () => {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    () => api.get('/analytics/dashboard').then(res => res.data)
  );

  const { data: todaySchedule } = useQuery(
    'todaySchedule',
    () => api.get('/appointments', {
      params: { date: format(new Date(), 'yyyy-MM-dd') }
    }).then(res => res.data)
  );

  const { data: urgentTasks } = useQuery(
    'urgentTasks',
    () => api.get('/ai/alex/urgent-tasks').then(res => res.data)
  );

  if (statsLoading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Welcome Back! Here's Your Daily Overview
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Escrows"
            value={stats?.activeEscrows || 0}
            icon={<Home />}
            color="primary"
            trend="+12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="This Month Closed"
            value={stats?.monthClosed || 0}
            icon={<TrendingUp />}
            color="success"
            trend="+8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="YTD Sales Volume"
            value={`${(stats?.ytdVolume || 0).toLocaleString()}`}
            icon={<Assessment />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pipeline Value"
            value={`${(stats?.pipelineValue || 0).toLocaleString()}`}
            icon={<People />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Schedule sx={{ mr: 1, verticalAlign: 'bottom' }} />
              Today's Schedule
            </Typography>
            <List>
              {todaySchedule?.appointments?.map((apt) => (
                <ListItem key={apt.id} divider>
                  <ListItemText
                    primary={apt.title}
                    secondary={`${apt.startTime} - ${apt.location?.address || 'Virtual'}`}
                  />
                  <Chip
                    label={apt.appointmentType}
                    size="small"
                    color={apt.status === 'Confirmed' ? 'success' : 'default'}
                  />
                </ListItem>
              )) || <Typography color="text.secondary">No appointments today</Typography>}
            </List>
          </Paper>
        </Grid>

        {/* Urgent Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Warning sx={{ mr: 1, verticalAlign: 'bottom', color: 'error.main' }} />
              Urgent Actions Required
            </Typography>
            <List>
              {urgentTasks?.tasks?.map((task, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={task.description}
                    secondary={`Due: ${format(new Date(task.deadline), 'MMM d, h:mm a')}`}
                  />
                  <Chip
                    label={task.type}
                    size="small"
                    color="error"
                  />
                </ListItem>
              )) || <Typography color="text.secondary">No urgent tasks</Typography>}
            </List>
          </Paper>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Sales Trend
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={stats?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={{ fill: '#1976d2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomeDashboard;