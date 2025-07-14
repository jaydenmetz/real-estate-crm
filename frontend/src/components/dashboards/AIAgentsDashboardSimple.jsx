import React, { useState } from 'react';
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
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import {
  SmartToy,
  Chat,
  Person,
  Campaign,
  Email,
  Analytics,
  Close,
  Send,
} from '@mui/icons-material';

const AIAgentsDashboardSimple = () => {
  const [agents, setAgents] = useState([
    // Executive
    {
      id: 'alex_executive',
      name: 'Alex',
      title: 'Executive Assistant',
      category: 'executive',
      color: '#2196f3',
      enabled: true,
      description: 'Manages daily operations and coordinates team activities',
    },
    // Buyer's Team
    {
      id: 'buyer_manager',
      name: 'Victoria',
      title: "Buyer's Manager",
      category: 'buyers',
      color: '#1976d2',
      enabled: true,
      description: 'Oversees all buyer-related operations',
    },
    {
      id: 'buyer_qualification',
      name: 'Sofia',
      title: 'Buyer Qualification Specialist',
      category: 'buyers',
      color: '#4caf50',
      enabled: false,
      description: 'Qualifies buyer leads and assesses financial readiness',
    },
    {
      id: 'lead_nurturing',
      name: 'James',
      title: 'Lead Nurturing Specialist',
      category: 'buyers',
      color: '#ff5722',
      enabled: false,
      description: 'Maintains communication with leads',
    },
    {
      id: 'showing_scheduler',
      name: 'David',
      title: 'Showing Scheduler',
      category: 'buyers',
      color: '#00bcd4',
      enabled: false,
      description: 'Coordinates property showings',
    },
    // Listing Team
    {
      id: 'listing_manager',
      name: 'Richard',
      title: 'Listing Manager',
      category: 'listings',
      color: '#388e3c',
      enabled: true,
      description: 'Manages listing operations',
    },
    {
      id: 'listing_marketing',
      name: 'Marcus',
      title: 'Listing Marketing Expert',
      category: 'listings',
      color: '#ff9800',
      enabled: false,
      description: 'Creates property marketing campaigns',
    },
    {
      id: 'mls_sync',
      name: 'Thomas',
      title: 'MLS Sync Specialist',
      category: 'listings',
      color: '#009688',
      enabled: false,
      description: 'Keeps MLS listings updated',
    },
    {
      id: 'market_analyst',
      name: 'Rachel',
      title: 'Market Analyst',
      category: 'listings',
      color: '#f44336',
      enabled: false,
      description: 'Provides market insights and pricing recommendations',
    },
    // Operations Team
    {
      id: 'operations_manager',
      name: 'Diana',
      title: 'Operations Manager',
      category: 'operations',
      color: '#7b1fa2',
      enabled: true,
      description: 'Oversees transaction operations',
    },
    {
      id: 'transaction_coordinator',
      name: 'Emma',
      title: 'Transaction Coordinator',
      category: 'operations',
      color: '#9c27b0',
      enabled: false,
      description: 'Manages escrow timelines',
    },
    {
      id: 'document_processor',
      name: 'Sarah',
      title: 'Document Processor',
      category: 'operations',
      color: '#3f51b5',
      enabled: false,
      description: 'Manages transaction documents',
    },
    {
      id: 'compliance_monitor',
      name: 'Patricia',
      title: 'Compliance Monitor',
      category: 'operations',
      color: '#607d8b',
      enabled: false,
      description: 'Ensures regulatory compliance',
    },
  ]);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});

  const getIcon = (agentId) => {
    if (agentId.includes('manager') || agentId === 'alex_executive') return <Analytics />;
    if (agentId.includes('buyer') || agentId.includes('lead')) return <Person />;
    if (agentId.includes('listing') || agentId.includes('market')) return <Campaign />;
    if (agentId.includes('nurturing')) return <Email />;
    return <SmartToy />;
  };

  const handleToggle = (agentId) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, enabled: !agent.enabled }
          : agent
      )
    );
  };

  const openChat = (agent) => {
    setSelectedAgent(agent);
    setChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedAgent) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), newMessage],
    }));

    // Simulate response
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        text: `I'll help you with that right away!`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), response],
      }));
    }, 1000);

    setMessage('');
  };

  const categories = [
    { key: 'executive', title: 'Executive Assistant' },
    { key: 'buyers', title: "Buyer's Team" },
    { key: 'listings', title: 'Listing Team' },
    { key: 'operations', title: 'Operations Team' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          AI Team Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your AI agents, chat with them directly, and view their activity
        </Typography>
      </Box>

      {categories.map(category => {
        const categoryAgents = agents.filter(a => a.category === category.key);
        if (categoryAgents.length === 0) return null;

        return (
          <Box key={category.key} sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {category.title}
            </Typography>
            
            <Grid container spacing={3}>
              {categoryAgents.map(agent => (
                <Grid 
                  item 
                  xs={12} 
                  md={6} 
                  lg={agent.id === 'alex_executive' || agent.id.includes('manager') ? 12 : 4} 
                  key={agent.id}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: agent.color, width: 56, height: 56, mr: 2 }}>
                          {getIcon(agent.id)}
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {agent.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {agent.title}
                          </Typography>
                          <Chip
                            label={agent.enabled ? 'Active' : 'Inactive'}
                            size="small"
                            color={agent.enabled ? 'success' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>

                        <Switch
                          checked={agent.enabled}
                          onChange={() => handleToggle(agent.id)}
                          color="primary"
                        />
                      </Box>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {agent.description}
                      </Typography>

                      {agent.enabled && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Recent Activity
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Completed 5 tasks today
                          </Typography>
                        </Paper>
                      )}

                      <LinearProgress
                        variant="determinate"
                        value={agent.enabled ? 75 : 0}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
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
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {/* Simple Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAgent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: selectedAgent.color, mr: 2 }}>
                    {getIcon(selectedAgent.id)}
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

            <DialogContent>
              <List sx={{ minHeight: 300, maxHeight: 400, overflowY: 'auto' }}>
                {(messages[selectedAgent.id] || []).map((msg, index) => (
                  <ListItem key={msg.id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        ml: msg.sender === 'user' ? 'auto' : 0,
                        mr: msg.sender === 'user' ? 0 : 'auto',
                        maxWidth: '70%',
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                    </Paper>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder={`Message ${selectedAgent.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton onClick={handleSendMessage} color="primary">
                  <Send />
                </IconButton>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AIAgentsDashboardSimple;