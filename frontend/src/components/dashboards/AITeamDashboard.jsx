// Updated AITeamDashboard.jsx
// Replace your existing AITeamDashboard component with this

import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Avatar,
  Badge,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Settings,
  TrendingUp,
  AttachMoney,
  History,
  Warning,
  Business,
  ViewModule,
  ViewList,
  Groups,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { api } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import Office3D from './Office3D'; // Import the 3D office component

const AITeamDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [viewMode, setViewMode] = useState('office');
  const [currentFloor, setCurrentFloor] = useState('buyers');
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Fetch AI agents status
  const { data: agents, isLoading } = useQuery(
    'aiAgents',
    () => api.get('/ai/agents').then(res => res.data)
  );

  // Fetch token usage
  const { data: tokenUsage } = useQuery(
    'tokenUsage',
    () => api.get('/ai/token-usage').then(res => res.data),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  // Toggle agent mutation
  const toggleAgent = useMutation(
    ({ agentId, enabled }) => api.patch(`/ai/agents/${agentId}/toggle`, { enabled }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('aiAgents');
        enqueueSnackbar('Agent status updated', { variant: 'success' });
      },
      onError: () => {
        enqueueSnackbar('Failed to update agent status', { variant: 'error' });
      },
    }
  );

  // Calculate team stats
  const teamStats = {
    activeAgents: agents?.filter(a => a.enabled).length || 0,
    totalTasks: agents?.reduce((sum, a) => sum + (a.tasksToday || 0), 0) || 0,
    tokensUsed: tokenUsage?.currentMonth?.totalTokens || 0,
    successRate: 94.5, // You can calculate this from your data
  };

  // Get agent color based on role
  const getAgentColor = (role) => {
    const colors = {
      'Executive Assistant': '#1976d2',
      'Buyer Manager': '#2e7d32',
      'Seller Manager': '#d32f2f',
      'Operations Manager': '#9c27b0',
      'Buyer Agent': '#4caf50',
      'Seller Agent': '#f44336',
      'Operations Agent': '#ab47bc',
    };
    return colors[role] || '#757575';
  };

  // Handle agent click from 3D view
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
  };

  // Convert agents array to object format for 3D component
  const agentsObject = agents?.reduce((acc, agent) => {
    acc[agent.id] = agent;
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Virtual AI Office
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Your AI team workspace - {teamStats.activeAgents} agents online
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              {viewMode === 'office' && (
                <ToggleButtonGroup
                  value={currentFloor}
                  exclusive
                  onChange={(e, value) => value && setCurrentFloor(value)}
                  size="small"
                >
                  <ToggleButton value="buyers">
                    Buyer's Floor
                  </ToggleButton>
                  <ToggleButton value="sellers">
                    Seller's Floor
                  </ToggleButton>
                  <ToggleButton value="operations">
                    Operations Floor
                  </ToggleButton>
                </ToggleButtonGroup>
              )}

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, value) => value && setViewMode(value)}
              >
                <ToggleButton value="office">
                  <Business sx={{ mr: 1 }} />
                  3D Office
                </ToggleButton>
                <ToggleButton value="card">
                  <ViewModule sx={{ mr: 1 }} />
                  Cards
                </ToggleButton>
                <ToggleButton value="metrics">
                  <TrendingUp sx={{ mr: 1 }} />
                  Metrics
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>
        </Grid>

        {/* Team Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Groups sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{teamStats.activeAgents}/14</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">{teamStats.totalTasks}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tasks Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">${(teamStats.tokensUsed * 0.002).toFixed(2)}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Daily Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">{teamStats.successRate}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3D Office View */}
      {viewMode === 'office' && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={9}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">3D Office View</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label={`Floor: ${currentFloor.charAt(0).toUpperCase() + currentFloor.slice(1)}`}
                    color="primary"
                  />
                  <Tooltip title="Refresh">
                    <IconButton 
                      size="small"
                      onClick={() => queryClient.invalidateQueries('aiAgents')}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Office3D 
                agents={agentsObject} 
                selectedAgent={selectedAgent}
                onAgentClick={handleAgentClick}
                currentFloor={currentFloor}
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                Click on agents to view details • Drag to rotate • Scroll to zoom
              </Alert>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Agent Details
              </Typography>
              {selectedAgent ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge
                      color={selectedAgent.enabled ? "success" : "error"}
                      variant="dot"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar sx={{ bgcolor: getAgentColor(selectedAgent.role), mr: 2 }}>
                        {selectedAgent.name?.charAt(0)}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="subtitle1">{selectedAgent.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedAgent.role}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      label={selectedAgent.enabled ? 'Active' : 'Paused'}
                      size="small"
                      color={selectedAgent.enabled ? 'success' : 'default'}
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Activity
                    </Typography>
                    <Typography variant="body2">
                      {selectedAgent.currentActivity || 'Idle'}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Today's Metrics
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Tasks Completed"
                        secondary={selectedAgent.tasksToday || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Avg Response Time"
                        secondary={selectedAgent.avgResponseTime || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Tokens Used"
                        secondary={selectedAgent.tokensUsed || 0}
                      />
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 2 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<Settings />}
                      sx={{ mb: 1 }}
                    >
                      Configure
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      startIcon={selectedAgent.enabled ? <Pause /> : <PlayArrow />}
                      onClick={() => toggleAgent.mutate({ 
                        agentId: selectedAgent.id, 
                        enabled: !selectedAgent.enabled 
                      })}
                    >
                      {selectedAgent.enabled ? 'Pause' : 'Resume'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Select an agent to view details
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <Grid container spacing={2}>
          {agents?.map((agent) => (
            <Grid item xs={12} sm={6} md={4} key={agent.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderTop: `4px solid ${getAgentColor(agent.role)}`,
                  opacity: agent.enabled ? 1 : 0.6,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Badge
                        color={agent.enabled ? "success" : "error"}
                        variant="dot"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar sx={{ bgcolor: getAgentColor(agent.role), mr: 2 }}>
                          {agent.name?.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="h6">{agent.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agent.role}
                        </Typography>
                      </Box>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={agent.enabled}
                          onChange={() => toggleAgent.mutate({ 
                            agentId: agent.id, 
                            enabled: !agent.enabled 
                          })}
                          size="small"
                        />
                      }
                      label=""
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Activity
                    </Typography>
                    <Typography variant="body2">
                      {agent.currentActivity || 'Idle'}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Tasks Today
                      </Typography>
                      <Typography variant="h6">
                        {agent.tasksToday || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Tokens Used
                      </Typography>
                      <Typography variant="h6">
                        {agent.tokensUsed || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Efficiency
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={agent.efficiency || 0} 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Metrics View */}
      {viewMode === 'metrics' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Token Usage by Department
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tokenUsage?.byDepartment || []}>
                  <XAxis dataKey="department" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="tokens" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent AI Activities
              </Typography>
              <List dense>
                {tokenUsage?.recentActivities?.map((activity, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={activity.agent}
                      secondary={activity.action}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </ListItem>
                )) || <Typography color="text.secondary">No recent activities</Typography>}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AITeamDashboard;