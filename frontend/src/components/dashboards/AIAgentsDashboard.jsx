import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Switch,
  Box,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Fade,
  Collapse,
} from '@mui/material';
import {
  SmartToy,
  Chat,
  History,
  Close,
  Send,
  PowerSettingsNew,
  Schedule,
  CheckCircle,
  Warning,
  TrendingUp,
  Person,
  Home,
  AccountBalance,
  Gavel,
  Campaign,
  Description,
  LocalOffer,
  AssignmentTurnedIn,
  Calculate,
  Business,
  Email,
  Support,
  Analytics,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { aiAPI, aiAgentsAPI } from '../../services/api';
import websocketService from '../../services/websocket';
import { formatDistanceToNow } from 'date-fns';

// Agent categories for organized display
const agentCategories = {
  executive: {
    title: 'Executive Assistant',
    manager: 'alex_executive',
    agents: []
  },
  buyers: {
    title: "Buyer's Team",
    manager: 'buyer_manager',
    agents: ['buyer_qualification', 'lead_nurturing', 'showing_scheduler']
  },
  listings: {
    title: 'Listing Team',
    manager: 'listing_manager',
    agents: ['listing_marketing', 'mls_sync', 'market_analyst']
  },
  operations: {
    title: 'Operations Team',
    manager: 'operations_manager',
    agents: ['transaction_coordinator', 'document_processor', 'compliance_monitor']
  }
};

// Agent configuration with details
const agentConfigs = {
  alex_executive: {
    name: 'Alex',
    title: 'Executive Assistant',
    icon: <SmartToy />,
    color: '#2196f3',
    description: 'Manages daily operations, coordinates team activities, and provides strategic insights',
    capabilities: ['Task Management', 'Team Coordination', 'Daily Briefings', 'Strategic Planning']
  },
  buyer_qualification: {
    name: 'Sofia',
    title: 'Buyer Qualification Specialist',
    icon: <Person />,
    color: '#4caf50',
    description: 'Qualifies buyer leads, assesses financial readiness, and matches preferences',
    capabilities: ['Lead Qualification', 'Financial Assessment', 'Property Matching', 'Follow-up Automation']
  },
  listing_marketing: {
    name: 'Marcus',
    title: 'Listing Marketing Expert',
    icon: <Campaign />,
    color: '#ff9800',
    description: 'Creates and manages property marketing campaigns across all channels',
    capabilities: ['Listing Descriptions', 'Social Media', 'Virtual Tours', 'Market Analysis']
  },
  transaction_coordinator: {
    name: 'Emma',
    title: 'Transaction Coordinator',
    icon: <AssignmentTurnedIn />,
    color: '#9c27b0',
    description: 'Manages escrow timelines, coordinates with all parties, ensures smooth closings',
    capabilities: ['Timeline Management', 'Document Tracking', 'Party Coordination', 'Deadline Alerts']
  },
  showing_scheduler: {
    name: 'David',
    title: 'Showing Scheduler',
    icon: <Schedule />,
    color: '#00bcd4',
    description: 'Coordinates property showings, manages calendars, and sends reminders',
    capabilities: ['Appointment Scheduling', 'Calendar Management', 'Reminder Automation', 'Route Planning']
  },
  market_analyst: {
    name: 'Rachel',
    title: 'Market Analyst',
    icon: <TrendingUp />,
    color: '#f44336',
    description: 'Provides real-time market insights, pricing recommendations, and trend analysis',
    capabilities: ['CMA Reports', 'Market Trends', 'Pricing Strategy', 'Competition Analysis']
  },
  lead_nurturing: {
    name: 'James',
    title: 'Lead Nurturing Specialist',
    icon: <Email />,
    color: '#ff5722',
    description: 'Maintains consistent communication with leads through personalized campaigns',
    capabilities: ['Email Campaigns', 'SMS Follow-ups', 'Lead Scoring', 'Drip Campaigns']
  },
  compliance_monitor: {
    name: 'Patricia',
    title: 'Compliance Monitor',
    icon: <Gavel />,
    color: '#607d8b',
    description: 'Ensures all transactions comply with regulations and best practices',
    capabilities: ['Regulatory Compliance', 'Document Review', 'Risk Assessment', 'Training Updates']
  },
  client_care: {
    name: 'Michael',
    title: 'Client Care Specialist',
    icon: <Support />,
    color: '#795548',
    description: 'Maintains client relationships, handles concerns, and ensures satisfaction',
    capabilities: ['Client Communication', 'Issue Resolution', 'Satisfaction Surveys', 'Relationship Management']
  },
  document_processor: {
    name: 'Sarah',
    title: 'Document Processor',
    icon: <Description />,
    color: '#3f51b5',
    description: 'Manages all transaction documents, ensures accuracy and completeness',
    capabilities: ['Document Management', 'E-signatures', 'Filing Systems', 'Accuracy Checks']
  },
  mls_sync: {
    name: 'Thomas',
    title: 'MLS Sync Specialist',
    icon: <Home />,
    color: '#009688',
    description: 'Keeps MLS listings updated and synchronized across all platforms',
    capabilities: ['MLS Updates', 'Data Synchronization', 'Listing Accuracy', 'Platform Integration']
  },
  offer_negotiator: {
    name: 'Linda',
    title: 'Offer Negotiation Expert',
    icon: <LocalOffer />,
    color: '#e91e63',
    description: 'Analyzes offers, provides negotiation strategies, and maximizes outcomes',
    capabilities: ['Offer Analysis', 'Negotiation Strategy', 'Counter Offers', 'Deal Optimization']
  },
  roi_calculator: {
    name: 'Robert',
    title: 'ROI Calculator',
    icon: <Calculate />,
    color: '#673ab7',
    description: 'Calculates investment returns, analyzes deals, and provides financial insights',
    capabilities: ['ROI Analysis', 'Investment Calculations', 'Cash Flow Analysis', 'Deal Comparison']
  },
  vendor_coordinator: {
    name: 'Jennifer',
    title: 'Vendor Coordinator',
    icon: <Business />,
    color: '#ffc107',
    description: 'Manages relationships with vendors, schedules services, and tracks performance',
    capabilities: ['Vendor Management', 'Service Scheduling', 'Quality Control', 'Cost Tracking']
  },
  // Team Managers
  buyer_manager: {
    name: 'Victoria',
    title: "Buyer's Manager",
    icon: <Analytics />,
    color: '#1976d2',
    description: 'Oversees all buyer-related operations and coordinates the buyer team agents',
    capabilities: ['Team Management', 'Buyer Strategy', 'Performance Analytics', 'Client Relations']
  },
  listing_manager: {
    name: 'Richard',
    title: 'Listing Manager',
    icon: <Analytics />,
    color: '#388e3c',
    description: 'Manages listing operations and coordinates the listing team agents',
    capabilities: ['Team Leadership', 'Listing Strategy', 'Market Analysis', 'Agent Coordination']
  },
  operations_manager: {
    name: 'Diana',
    title: 'Operations Manager',
    icon: <Analytics />,
    color: '#7b1fa2',
    description: 'Oversees transaction operations and ensures smooth processing',
    capabilities: ['Process Management', 'Compliance Oversight', 'Team Coordination', 'Quality Assurance']
  }
};

const AIAgentsDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activityTab, setActivityTab] = useState(0);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState({});
  const [activities, setActivities] = useState({});
  const [expandedAgents, setExpandedAgents] = useState({});
  const messagesEndRef = useRef(null);

  // Fetch agents data
  useEffect(() => {
    fetchAgents();
    
    // Set up WebSocket listeners
    const unsubscribeUpdate = websocketService.on('agent-update', handleAgentUpdate);
    const unsubscribeActivity = websocketService.on('ai:activity', handleNewActivity);
    
    return () => {
      unsubscribeUpdate();
      unsubscribeActivity();
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedAgent]);

  const fetchAgents = async () => {
    try {
      const response = await aiAgentsAPI.getAll();
      const agentsData = response.data || [];
      
      // Merge with config data
      const enrichedAgents = agentsData.map(agent => ({
        ...agent,
        ...agentConfigs[agent.id],
        lastActivity: agent.lastActivity || new Date().toISOString()
      }));
      
      setAgents(enrichedAgents);
      
      // Fetch activities for each agent
      enrichedAgents.forEach(agent => {
        fetchAgentActivities(agent.id);
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Use mock data as fallback
      const mockAgents = Object.entries(agentConfigs).map(([id, config]) => ({
        id,
        ...config,
        enabled: false,
        tasksCompleted: Math.floor(Math.random() * 100),
        lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));
      setAgents(mockAgents);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentActivities = async (agentId) => {
    try {
      const response = await aiAgentsAPI.getActivities(agentId);
      setActivities(prev => ({
        ...prev,
        [agentId]: response.data || []
      }));
    } catch (error) {
      console.error(`Error fetching activities for ${agentId}:`, error);
      // Mock activities as fallback
      setActivities(prev => ({
        ...prev,
        [agentId]: [
          {
            id: 1,
            type: 'task_completed',
            description: 'Analyzed market trends for downtown properties',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            type: 'client_interaction',
            description: 'Sent follow-up email to Johnson family',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      }));
    }
  };

  const handleAgentUpdate = (data) => {
    setAgents(prev => prev.map(agent => 
      agent.id === data.agentId ? { ...agent, ...data } : agent
    ));
  };

  const handleNewActivity = (data) => {
    if (data.agentId) {
      setActivities(prev => ({
        ...prev,
        [data.agentId]: [data, ...(prev[data.agentId] || [])]
      }));
    }
  };

  const toggleAgent = async (agentId, enabled) => {
    try {
      await aiAgentsAPI.updateStatus(agentId, enabled);
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? { ...agent, enabled } : agent
      ));
      
      // Notify via WebSocket
      websocketService.updateAgentStatus(agentId, enabled);
    } catch (error) {
      console.error('Error toggling agent:', error);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedAgent) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), newMessage]
    }));

    // Send via WebSocket
    websocketService.sendToAgent(selectedAgent.id, message, 'chat');

    // Simulate agent response
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        sender: 'agent',
        text: `I understand your request. I'll ${message.toLowerCase().includes('analyze') ? 'analyze that data' : 'take care of that'} right away.`,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), response]
      }));
    }, 1000);

    setMessage('');
  };

  const openChat = (agent) => {
    setSelectedAgent(agent);
    setChatOpen(true);
    setActivityTab(0);
  };

  const toggleAgentExpand = (agentId) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  const getAgentStatus = (agent) => {
    if (!agent.enabled) return { text: 'Offline', color: 'default' };
    const lastActivityTime = new Date(agent.lastActivity).getTime();
    const now = Date.now();
    const hoursSinceActivity = (now - lastActivityTime) / (1000 * 60 * 60);
    
    if (hoursSinceActivity < 1) return { text: 'Active', color: 'success' };
    if (hoursSinceActivity < 24) return { text: 'Idle', color: 'warning' };
    return { text: 'Inactive', color: 'default' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          AI Team Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your AI agents, chat with them directly, and view their activity logs
        </Typography>
      </Box>

      {/* Display agents by category */}
      {Object.entries(agentCategories).map(([categoryKey, category]) => {
        // Get manager and team agents
        const manager = agents.find(a => a.id === category.manager);
        const teamAgents = agents.filter(a => category.agents.includes(a.id));
        
        return (
          <Box key={categoryKey} sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {category.title}
            </Typography>
            
            {/* Manager Card */}
            {manager && (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  {(() => {
                    const status = getAgentStatus(manager);
                    const agentActivities = activities[manager.id] || [];
                    const isExpanded = expandedAgents[manager.id];
                    const agent = manager;

                    return (
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: agent.enabled ? '#4caf50' : '#bdbdbd',
                            border: '2px solid white'
                          }}
                        />
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: agent.color,
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                        {agent.icon}
                      </Avatar>
                    </Badge>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {agent.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {agent.title}
                      </Typography>
                      <Chip
                        label={status.text}
                        size="small"
                        color={status.color}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                    <Switch
                      checked={agent.enabled}
                      onChange={(e) => toggleAgent(agent.id, e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {agent.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Button
                      size="small"
                      onClick={() => toggleAgentExpand(agent.id)}
                      endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                    >
                      Capabilities
                    </Button>
                    <Collapse in={isExpanded}>
                      <Box sx={{ mt: 1 }}>
                        {agent.capabilities.map((capability, index) => (
                          <Chip
                            key={index}
                            label={capability}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Collapse>
                  </Box>

                  {agent.enabled && (
                    <Fade in>
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Recent Activity
                        </Typography>
                        {agentActivities.length > 0 ? (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {agentActivities[0].description}
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                            No recent activity
                          </Typography>
                        )}
                        {agent.lastActivity && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(agent.lastActivity), { addSuffix: true })}
                          </Typography>
                        )}
                      </Paper>
                    </Fade>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Tasks completed: {agent.tasksCompleted || 0}
                    </Typography>
                    {agent.enabled && agent.tasksCompleted > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((agent.tasksCompleted / 100) * 100, 100)}
                        sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    startIcon={<Chat />}
                    onClick={() => openChat(agent)}
                    disabled={!agent.enabled}
                  >
                    Chat
                  </Button>
                  <Button
                    startIcon={<History />}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setActivityTab(1);
                      setChatOpen(true);
                    }}
                  >
                    View Logs
                  </Button>
                </CardActions>
              </Card>
                    );
                  })()}
                </Grid>
              </Grid>
            )}
            
            {/* Team Agents */}
            {teamAgents.length > 0 && (
              <Grid container spacing={3}>
                {teamAgents.map((agent) => {
                  const status = getAgentStatus(agent);
                  const agentActivities = activities[agent.id] || [];
                  const isExpanded = expandedAgents[agent.id];

                  return (
                    <Grid item xs={12} md={6} lg={4} key={agent.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          transition: 'all 0.3s',
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: agent.enabled ? '#4caf50' : '#bdbdbd',
                                    border: '2px solid white'
                                  }}
                                />
                              }
                            >
                              <Avatar
                                sx={{
                                  bgcolor: agent.color,
                                  width: 56,
                                  height: 56,
                                  mr: 2
                                }}
                              >
                                {agent.icon}
                              </Avatar>
                            </Badge>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {agent.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {agent.title}
                              </Typography>
                              <Chip
                                label={status.text}
                                size="small"
                                color={status.color}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>

                            <Switch
                              checked={agent.enabled}
                              onChange={(e) => toggleAgent(agent.id, e.target.checked)}
                              color="primary"
                            />
                          </Box>

                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {agent.description}
                          </Typography>

                          <Box sx={{ mb: 2 }}>
                            <Button
                              size="small"
                              onClick={() => toggleAgentExpand(agent.id)}
                              endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                            >
                              Capabilities
                            </Button>
                            <Collapse in={isExpanded}>
                              <Box sx={{ mt: 1 }}>
                                {agent.capabilities.map((capability, index) => (
                                  <Chip
                                    key={index}
                                    label={capability}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Collapse>
                          </Box>

                          {agent.enabled && (
                            <Fade in>
                              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Recent Activity
                                </Typography>
                                {agentActivities.length > 0 ? (
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {agentActivities[0].description}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                    No recent activity
                                  </Typography>
                                )}
                                {agent.lastActivity && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDistanceToNow(new Date(agent.lastActivity), { addSuffix: true })}
                                  </Typography>
                                )}
                              </Paper>
                            </Fade>
                          )}

                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Tasks completed: {agent.tasksCompleted || 0}
                            </Typography>
                            {agent.enabled && agent.tasksCompleted > 0 && (
                              <LinearProgress
                                variant="determinate"
                                value={Math.min((agent.tasksCompleted / 100) * 100, 100)}
                                sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                              />
                            )}
                          </Box>
                        </CardContent>

                        <CardActions>
                          <Button
                            startIcon={<Chat />}
                            onClick={() => openChat(agent)}
                            disabled={!agent.enabled}
                          >
                            Chat
                          </Button>
                          <Button
                            startIcon={<History />}
                            onClick={() => {
                              setSelectedAgent(agent);
                              setActivityTab(1);
                              setChatOpen(true);
                            }}
                          >
                            View Logs
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        );
      })}

      {/* Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        {selectedAgent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: selectedAgent.color, mr: 2 }}>
                    {selectedAgent.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedAgent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAgent.title}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setChatOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>

            <Tabs 
              value={activityTab} 
              onChange={(e, v) => setActivityTab(v)}
              sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Chat" />
              <Tab label="Activity Log" />
            </Tabs>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
              {activityTab === 0 ? (
                <>
                  <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                    <List>
                      {(chatMessages[selectedAgent.id] || []).map((msg) => (
                        <ListItem
                          key={msg.id}
                          sx={{
                            flexDirection: 'column',
                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              maxWidth: '70%',
                              bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                              color: msg.sender === 'user' ? 'white' : 'text.primary'
                            }}
                          >
                            <Typography variant="body2">{msg.text}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                            </Typography>
                          </Paper>
                        </ListItem>
                      ))}
                      <div ref={messagesEndRef} />
                    </List>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder={`Ask ${selectedAgent.name} anything...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={!selectedAgent.enabled}
                    />
                    <IconButton 
                      onClick={handleSendMessage}
                      color="primary"
                      disabled={!selectedAgent.enabled || !message.trim()}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 3, overflowY: 'auto' }}>
                  <List>
                    {(activities[selectedAgent.id] || []).map((activity, index) => (
                      <React.Fragment key={activity.id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={activity.description}
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </Typography>
                                {activity.details && (
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {activity.details}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < activities[selectedAgent.id].length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  
                  {(!activities[selectedAgent.id] || activities[selectedAgent.id].length === 0) && (
                    <Alert severity="info">
                      No activity logs available for this agent yet.
                    </Alert>
                  )}
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AIAgentsDashboard;