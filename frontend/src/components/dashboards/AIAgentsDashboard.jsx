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
  Badge,
  LinearProgress,
  Fade,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  SmartToy,
  Chat,
  Schedule,
  TrendingUp,
  Person,
  Home,
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
import EnhancedAgentChat from '../ai/EnhancedAgentChat';

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
  const [chatMessages, setChatMessages] = useState({});
  const [activities, setActivities] = useState({});
  const [expandedAgents, setExpandedAgents] = useState({});

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
    setLoading(true);
    
    // Always use mock data for now
    const mockAgents = Object.entries(agentConfigs).map(([id, config]) => ({
      id,
      ...config,
      enabled: false,
      tasksCompleted: Math.floor(Math.random() * 100),
      lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
    
    setAgents(mockAgents);
    
    // Mock activities for each agent
    mockAgents.forEach(agent => {
      setActivities(prev => ({
        ...prev,
        [agent.id]: [
          {
            id: 1,
            type: 'task_completed',
            description: 'Analyzed market trends for downtown properties',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            type: 'notification',
            description: 'New lead qualified ✅',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      }));
    });
    
    setLoading(false);
    
    // Try to fetch real data in background
    try {
      const response = await aiAgentsAPI.getAll();
      if (response?.data?.length > 0) {
        const agentsData = response.data;
        const enrichedAgents = agentsData.map(agent => ({
          ...agent,
          ...agentConfigs[agent.id],
          lastActivity: agent.lastActivity || new Date().toISOString()
        }));
        setAgents(enrichedAgents);
      }
    } catch (error) {
      // Silently fail - we already have mock data
      console.log('Using mock data for AI agents');
    }
  };

  const fetchAgentActivities = async (agentId) => {
    // Skip for now - activities are set in fetchAgents
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


  const openChat = (agent) => {
    setSelectedAgent(agent);
    setChatOpen(true);
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
                    Chat & Activity
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

      {/* Enhanced Chat Dialog */}
      {selectedAgent && (
        <EnhancedAgentChat
          agent={selectedAgent}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={chatMessages}
          setMessages={setChatMessages}
          activities={activities}
        />
      )}
    </Container>
  );
};

export default AIAgentsDashboard;