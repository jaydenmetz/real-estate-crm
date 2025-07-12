import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  Tab,
  Tabs,
  FormControlLabel,
  Switch,
  Alert,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Business,
  ViewModule,
  ViewList,
  GridView,
  Refresh,
  Groups,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Schedule,
  Assessment,
  Analytics,
  Send,
  Close,
  PlayArrow,
  Pause,
  QuestionAnswer,
  SupportAgent,
  Work,
  Computer,
  Coffee,
  PhoneInTalk,
  Celebration,
  Speed,
  Warning,
  SmartToy,
  Home,
  People,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { useSnackbar } from 'notistack';
import Confetti from 'react-confetti';
import { aiAgentsAPI, analyticsAPI } from '../../services/api';
import websocketService from '../../services/websocket';
import Office3DViewer from '../office/Office3DViewer';

// Agent profiles data
const agentProfiles = {
  executive_assistant: {
    id: 'executive_assistant',
    name: 'Alex',
    title: 'Executive Assistant',
    department: 'management',
    icon: '🤖',
    color: '#1976d2',
    image: 'https://i.pravatar.cc/300?img=33',
    defaultLocation: { area: 'reception', x: 50, y: 50 },
    stage: 4,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/alex',
    status: 'available',
    role: 'manager',
    metrics: {
      tasksToday: 45,
      avgResponseTime: '1.2m',
      efficiency: '98%',
      lastActive: 'Active now'
    }
  },
  buyer_manager: {
    id: 'buyer_manager',
    name: 'Sarah',
    title: 'Buyer Manager',
    department: 'buyer',
    icon: '🏠',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=23',
    defaultLocation: { area: 'buyerDept', x: 30, y: 30 },
    stage: 3,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/sarah',
    status: 'busy',
    role: 'senior',
    metrics: {
      tasksToday: 28,
      avgResponseTime: '2.8m',
      efficiency: '94%',
      lastActive: 'Active now'
    }
  },
  listing_manager: {
    id: 'listing_manager',
    name: 'Michael',
    title: 'Listing Manager',
    department: 'listing',
    icon: '📋',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=8',
    defaultLocation: { area: 'listingDept', x: 70, y: 30 },
    stage: 3,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/michael',
    status: 'available',
    role: 'senior',
    metrics: {
      tasksToday: 31,
      avgResponseTime: '3.1m',
      efficiency: '92%',
      lastActive: '5 minutes ago'
    }
  },
  operations_manager: {
    id: 'operations_manager',
    name: 'Emma',
    title: 'Operations Manager',
    department: 'operations',
    icon: '⚙️',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=5',
    defaultLocation: { area: 'operationsDept', x: 50, y: 30 },
    stage: 3,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/emma',
    status: 'busy',
    role: 'senior',
    metrics: {
      tasksToday: 26,
      avgResponseTime: '2.5m',
      efficiency: '96%',
      lastActive: '2 minutes ago'
    }
  },
  lead_qualifier: {
    id: 'lead_qualifier',
    name: 'Jake',
    title: 'Lead Qualifier',
    department: 'buyer',
    icon: '🎯',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=52',
    defaultLocation: { area: 'buyerDept', x: 20, y: 60 },
    stage: 2,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/jake',
    metrics: {
      tasksToday: 67,
      avgResponseTime: '45s',
      efficiency: '91%',
      lastActive: 'Active now'
    }
  },
  buyer_nurture: {
    id: 'buyer_nurture',
    name: 'Sophie',
    title: 'Buyer Nurture Specialist',
    department: 'buyer',
    icon: '💗',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=25',
    defaultLocation: { area: 'buyerDept', x: 60, y: 60 },
    stage: 2,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/sophie',
    metrics: {
      tasksToday: 52,
      avgResponseTime: '2m',
      efficiency: '88%',
      lastActive: '7 minutes ago'
    }
  },
  showing_coordinator: {
    id: 'showing_coordinator',
    name: 'Ryan',
    title: 'Showing Coordinator',
    department: 'buyer',
    icon: '🏡',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=68',
    defaultLocation: { area: 'buyerDept', x: 40, y: 80 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/ryan',
    metrics: {
      tasksToday: 23,
      avgResponseTime: '3m',
      efficiency: '95%',
      lastActive: '20 minutes ago'
    }
  },
  buyer_consultation: {
    id: 'buyer_consultation',
    name: 'Ashley',
    title: 'Buyer Consultation Specialist',
    department: 'buyer',
    icon: '💼',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=20',
    defaultLocation: { area: 'buyerDept', x: 80, y: 80 },
    stage: 2,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/ashley',
    metrics: {
      tasksToday: 18,
      avgResponseTime: '5m',
      efficiency: '93%',
      lastActive: '15 minutes ago'
    }
  },
  listing_launch: {
    id: 'listing_launch',
    name: 'David',
    title: 'Listing Launch Specialist',
    department: 'listing',
    icon: '🚀',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=13',
    defaultLocation: { area: 'listingDept', x: 30, y: 70 },
    stage: 2,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/david',
    metrics: {
      tasksToday: 14,
      avgResponseTime: '4m',
      efficiency: '97%',
      lastActive: '30 minutes ago'
    }
  },
  market_analyst: {
    id: 'market_analyst',
    name: 'Lisa',
    title: 'Market Analyst',
    department: 'listing',
    icon: '📊',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=32',
    defaultLocation: { area: 'listingDept', x: 70, y: 70 },
    stage: 2,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/lisa',
    metrics: {
      tasksToday: 29,
      avgResponseTime: '6m',
      efficiency: '94%',
      lastActive: '12 minutes ago'
    }
  },
  listing_marketing: {
    id: 'listing_marketing',
    name: 'Chris',
    title: 'Listing Marketing Agent',
    department: 'listing',
    icon: '📣',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=67',
    defaultLocation: { area: 'listingDept', x: 50, y: 90 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/chris',
    metrics: {
      tasksToday: 41,
      avgResponseTime: '2.5m',
      efficiency: '90%',
      lastActive: '8 minutes ago'
    }
  },
  transaction_coordinator: {
    id: 'transaction_coordinator',
    name: 'Jessica',
    title: 'Transaction Coordinator',
    department: 'operations',
    icon: '📑',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=26',
    defaultLocation: { area: 'operationsDept', x: 20, y: 70 },
    stage: 2,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/jessica',
    metrics: {
      tasksToday: 35,
      avgResponseTime: '2.8m',
      efficiency: '94%',
      lastActive: 'Active now'
    }
  },
  compliance_officer: {
    id: 'compliance_officer',
    name: 'Carlos',
    title: 'Legal & Compliance',
    department: 'operations',
    icon: '✅',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=11',
    defaultLocation: { area: 'operationsDept', x: 30, y: 70 },
    stage: 1,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/carlos',
    metrics: {
      tasksToday: 23,
      avgResponseTime: '6m',
      efficiency: '99%',
      lastActive: '18 minutes ago'
    }
  },
  financial_analyst: {
    id: 'financial_analyst',
    name: 'Finn',
    title: 'Commission & Finance',
    department: 'operations',
    icon: '💰',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=12',
    defaultLocation: { area: 'operationsDept', x: 70, y: 70 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/finn',
    metrics: {
      tasksToday: 19,
      avgResponseTime: '4.5m',
      efficiency: '97%',
      lastActive: '25 minutes ago'
    }
  },
  database_specialist: {
    id: 'database_specialist',
    name: 'Olivia',
    title: 'CRM & Database Admin',
    department: 'support',
    icon: '💾',
    color: '#757575',
    image: 'https://i.pravatar.cc/300?img=23',
    defaultLocation: { area: 'breakRoom', x: 50, y: 50 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/olivia',
    metrics: {
      tasksToday: 38,
      avgResponseTime: '3.2m',
      efficiency: '95%',
      lastActive: '10 minutes ago'
    }
  }
};

// Department configurations
const departments = {
  management: { name: 'Executive', color: '#1976d2', icon: '🏢' },
  buyer: { name: 'Buyer Department', color: '#2e7d32', icon: '🏠' },
  listing: { name: 'Listing Department', color: '#ed6c02', icon: '📋' },
  operations: { name: 'Operations Department', color: '#9c27b0', icon: '⚙️' },
  support: { name: 'Support', color: '#757575', icon: '🔧' }
};

const VirtualOfficeDashboard = () => {
  const [viewMode, setViewMode] = useState('3d');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState('corporate');
  const [dmMessage, setDmMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [teamStats, setTeamStats] = useState({
    totalTasks: 0,
    activeAgents: 0,
    avgResponseTime: '0m',
    efficiency: '0%'
  });
  
  const { enqueueSnackbar } = useSnackbar();

  // Convert agent profiles to array format
  const agents = Object.values(agentProfiles);

  // Fetch team statistics
  const { data: stats, refetch: refetchStats } = useQuery(
    'aiTeamStats',
    () => analyticsAPI.getAITeamStats(),
    {
      refetchInterval: 30000,
      onSuccess: (data) => {
        if (data) {
          setTeamStats({
            totalTasks: data.totalTasks || 0,
            activeAgents: data.activeAgents || agents.filter(a => a.status === 'available').length,
            avgResponseTime: data.avgResponseTime || '2.5m',
            efficiency: data.efficiency || '93%'
          });
        }
      }
    }
  );

  // WebSocket connection for real-time updates
  useEffect(() => {
    const handleAgentUpdate = (data) => {
      enqueueSnackbar(`${data.agentName} is now ${data.status}`, { 
        variant: 'info' 
      });
      refetchStats();
    };

    const handleTaskComplete = (data) => {
      if (data.milestone) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        enqueueSnackbar(`🎉 Milestone: ${data.message}`, { 
          variant: 'success' 
        });
      }
    };

    websocketService.on('agent-update', handleAgentUpdate);
    websocketService.on('task-complete', handleTaskComplete);

    return () => {
      websocketService.off('agent-update', handleAgentUpdate);
      websocketService.off('task-complete', handleTaskComplete);
    };
  }, [enqueueSnackbar, refetchStats]);

  const handleAgentClick = (agentId) => {
    const agent = agentProfiles[agentId];
    setSelectedAgent(agent);
  };

  const handleSendMessage = () => {
    if (selectedAgent && dmMessage.trim()) {
      enqueueSnackbar(`Message sent to ${selectedAgent.name}`, { 
        variant: 'success' 
      });
      // Here you would send the message via API
      setDmMessage('');
    }
  };

  const renderTeamStats = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Groups sx={{ mr: 1 }} />
              <Typography variant="h6">Active Agents</Typography>
            </Box>
            <Typography variant="h3">{teamStats.activeAgents}/14</Typography>
            <LinearProgress 
              variant="determinate" 
              value={(teamStats.activeAgents / 14) * 100} 
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)' }}
            />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle sx={{ mr: 1 }} />
              <Typography variant="h6">Tasks Today</Typography>
            </Box>
            <Typography variant="h3">{teamStats.totalTasks}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              +12% from yesterday
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed sx={{ mr: 1 }} />
              <Typography variant="h6">Avg Response</Typography>
            </Box>
            <Typography variant="h3">{teamStats.avgResponseTime}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Target: &lt;5m
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1 }} />
              <Typography variant="h6">Efficiency</Typography>
            </Box>
            <Typography variant="h3">{teamStats.efficiency}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Above target!
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAgentProfile = () => (
    <Dialog
      open={!!selectedAgent}
      onClose={() => setSelectedAgent(null)}
      maxWidth="md"
      fullWidth
    >
      {selectedAgent && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={selectedAgent.image} 
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                  <Typography variant="h5">{selectedAgent.name}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {selectedAgent.title}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedAgent(null)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Tasks Today" 
                      secondary={selectedAgent.metrics.tasksToday}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Avg Response Time" 
                      secondary={selectedAgent.metrics.avgResponseTime}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Efficiency" 
                      secondary={selectedAgent.metrics.efficiency}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Last Active" 
                      secondary={selectedAgent.metrics.lastActive}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Agent Details</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Department" 
                      secondary={departments[selectedAgent.department]?.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="AI Model" 
                      secondary={selectedAgent.model}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Stage" 
                      secondary={`Stage ${selectedAgent.stage}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip 
                          label={selectedAgent.status || 'Available'} 
                          color={selectedAgent.status === 'busy' ? 'warning' : 'success'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Send Direct Message</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={`Message ${selectedAgent.name}...`}
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleSendMessage}
                    disabled={!dmMessage.trim()}
                  >
                    <Send />
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Button variant="outlined" startIcon={<Assessment />}>
                    View Reports
                  </Button>
                  <Button variant="outlined" startIcon={<Analytics />}>
                    Performance Stats
                  </Button>
                  <Button variant="outlined" startIcon={<Schedule />}>
                    Schedule Task
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  const renderListView = () => (
    <Grid container spacing={3}>
      {Object.entries(departments).map(([key, dept]) => {
        const deptAgents = agents.filter(agent => agent.department === key);
        if (deptAgents.length === 0) return null;
        
        return (
          <Grid item xs={12} key={key}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>{dept.icon}</span>
                {dept.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {deptAgents.map(agent => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={agent.image} 
                            sx={{ width: 48, height: 48, mr: 2 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">{agent.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {agent.title}
                            </Typography>
                          </Box>
                          <Chip
                            label={agent.status || 'Available'}
                            color={agent.status === 'busy' ? 'warning' : 'success'}
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Tasks Today</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {agent.metrics.tasksToday}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Response Time</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {agent.metrics.avgResponseTime}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Efficiency</Typography>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {agent.metrics.efficiency}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

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
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => refetchStats()}
              >
                Refresh
              </Button>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, value) => value && setViewMode(value)}
                aria-label="view mode"
              >
                <ToggleButton value="3d" aria-label="3d view">
                  <Business sx={{ mr: 1 }} />
                  3D View
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewList sx={{ mr: 1 }} />
                  List View
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Team Stats */}
      {renderTeamStats()}

      {/* Main Content */}
      <Box sx={{ mt: 4 }}>
        {viewMode === '3d' ? (
          <Paper 
            sx={{ 
              height: '600px', 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Office3DViewer 
              agents={agents}
              onAgentClick={handleAgentClick}
              selectedOffice={selectedOffice}
            />
          </Paper>
        ) : (
          renderListView()
        )}
      </Box>

      {/* Agent Profile Dialog */}
      {renderAgentProfile()}
    </Container>
  );
};

export default VirtualOfficeDashboard;