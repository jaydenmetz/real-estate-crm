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
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Settings,
  TrendingUp,
  AttachMoney,
  History,
  Warning,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { api } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';

const AITeamDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
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
    }
  );

  const getAgentColor = (role) => {
    switch (role) {
      case 'executive': return '#1976d2';
      case 'manager': return '#388e3c';
      case 'agent': return '#f57c00';
      default: return '#757575';
    }
  };

  const formatCost = (tokens) => {
    // Rough cost calculation based on model
    const costPerMillion = {
      'claude-3-opus': 15,
      'claude-3-sonnet': 3,
      'claude-3-haiku': 0.25,
    };
    return (tokens / 1000000 * 3).toFixed(2); // Assuming average cost
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        AI Team Management
      </Typography>

      {/* Overall Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">AI Team Performance</Typography>
              <Box>
                <Chip
                  label={`${agents?.filter(a => a.enabled).length || 0}/${agents?.length || 0} Active`}
                  color="primary"
                />
                <Button
                  startIcon={<Pause />}
                  variant="outlined"
                  size="small"
                  sx={{ ml: 1 }}
                  onClick={() => {/* Implement pause all */}}
                >
                  Pause All
                </Button>
              </Box>
            </Box>

            {/* Token Usage Chart */}
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={tokenUsage?.byDepartment || []}
                    dataKey="tokens"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {tokenUsage?.byDepartment?.map((entry, index) => (
                      <Cell key={index} fill={getAgentColor(entry.role)} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Cost Breakdown */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Monthly Cost Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Current Month
                  </Typography>
                  <Typography variant="h5">
                    ${tokenUsage?.currentMonthCost || '0.00'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Projected
                  </Typography>
                  <Typography variant="h5">
                    ${tokenUsage?.projectedCost || '0.00'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Budget
                  </Typography>
                  <Typography variant="h5">
                    $1,000
                  </Typography>
                </Grid>
              </Grid>
              <LinearProgress
                variant="determinate"
                value={(tokenUsage?.currentMonthCost / 1000) * 100 || 0}
                sx={{ mt: 2 }}
                color={tokenUsage?.currentMonthCost > 800 ? 'error' : 'primary'}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
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

      {/* Agents Grid */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        AI Agents Control Panel
      </Typography>
      
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {agent.name}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={agent.enabled}
                        onChange={(e) => toggleAgent.mutate({
                          agentId: agent.id,
                          enabled: e.target.checked
                        })}
                        size="small"
                      />
                    }
                    label=""
                  />
                </Box>

                <Chip
                  label={agent.role}
                  size="small"
                  sx={{ mb: 2, bgcolor: getAgentColor(agent.role), color: 'white' }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {agent.department} Department
                </Typography>

                <Divider sx={{ my: 2 }} />

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
                      Cost Today
                    </Typography>
                    <Typography variant="h6">
                      ${agent.costToday || '0.00'}
                    </Typography>
                  </Grid>
                </Grid>

                {agent.currentTask && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      Current: {agent.currentTask}
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Tooltip title="View Activity Log">
                    <IconButton size="small" onClick={() => setSelectedAgent(agent)}>
                      <History />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Settings">
                    <IconButton size="small">
                      <Settings />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Cost Optimization Suggestions */}
      {tokenUsage?.suggestions && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            <TrendingUp sx={{ mr: 1, verticalAlign: 'bottom' }} />
            Cost Optimization Suggestions
          </Typography>
          <List>
            {tokenUsage.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <Warning color="warning" sx={{ mr: 2 }} />
                <ListItemText
                  primary={suggestion.title}
                  secondary={`Potential savings: ${suggestion.savings}/month`}
                />
                <Button size="small" variant="outlined">
                  Apply
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default AITeamDashboard;