import React, { useState, useEffect, useRef } from 'react';
import { getSafeTimestamp } from '../../utils/safeDateUtils';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  Paper,
  Chip,
  Button,
  Divider,
  InputAdornment,
  Autocomplete,
  Popper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material';
import {
  Close,
  Send,
  Person,
  Home,
  Email,
  Phone,
  Schedule,
  TrendingUp,
  LocationOn,
  Group,
  FilterList,
  Assignment,
  CheckCircle,
  Campaign,
  Analytics,
  Notifications,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { safeParseDate, safeFormatRelativeTime } from '../../utils/safeDateUtils';
import { clientsAPI, leadsAPI, listingsAPI } from '../../services/api';

// Quick commands for different agent types
const agentCommands = {
  // Executive commands
  alex_executive: [
    { icon: <TrendingUp />, label: 'Daily Brief', command: '/brief' },
    { icon: <Group />, label: 'Team Status', command: '/team-status' },
    { icon: <Assignment />, label: 'Urgent Tasks', command: '/urgent' },
    { icon: <Analytics />, label: 'Analytics', command: '/analytics' },
  ],
  
  // Buyer agent commands
  buyer_qualification: [
    { icon: <Person />, label: 'Qualify Lead', command: '/qualify' },
    { icon: <Home />, label: 'Match Properties', command: '/match' },
    { icon: <Email />, label: 'Follow Up', command: '/follow-up' },
    { icon: <CheckCircle />, label: 'Pre-approval Check', command: '/pre-approval' },
  ],
  
  // Listing agent commands
  listing_marketing: [
    { icon: <Campaign />, label: 'Create Campaign', command: '/campaign' },
    { icon: <Home />, label: 'Update Listing', command: '/update-listing' },
    { icon: <TrendingUp />, label: 'Market Analysis', command: '/market-analysis' },
    { icon: <Schedule />, label: 'Schedule Photos', command: '/schedule-photos' },
  ],
  
  // Manager commands
  buyer_manager: [
    { icon: <Group />, label: 'Team Overview', command: '/team' },
    { icon: <LocationOn />, label: 'Area Leads', command: '/area' },
    { icon: <FilterList />, label: 'Filter Buyers', command: '/filter-buyers' },
    { icon: <Analytics />, label: 'Performance', command: '/performance' },
  ],
  
  listing_manager: [
    { icon: <Home />, label: 'All Listings', command: '/listings' },
    { icon: <LocationOn />, label: 'Area Analysis', command: '/area-analysis' },
    { icon: <TrendingUp />, label: 'Market Report', command: '/market-report' },
    { icon: <Group />, label: 'Agent Performance', command: '/agent-performance' },
  ],
  
  operations_manager: [
    { icon: <Assignment />, label: 'All Escrows', command: '/escrows' },
    { icon: <Schedule />, label: 'Deadlines', command: '/deadlines' },
    { icon: <CheckCircle />, label: 'Compliance Check', command: '/compliance' },
    { icon: <Group />, label: 'Vendor Status', command: '/vendors' },
  ],
};

// Common areas for filtering
const bakersfieldAreas = [
  'NW Bakersfield',
  'SW Bakersfield', 
  'NE Bakersfield',
  'SE Bakersfield',
  'Downtown',
  'Rosedale',
  'Seven Oaks',
  'Haggin Oaks',
  'Stockdale',
  'River Oaks',
];

const EnhancedAgentChat = ({ agent, open, onClose, messages, setMessages, activities }) => {
  const [message, setMessage] = useState('');
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandAnchor, setCommandAnchor] = useState(null);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [isTypingCommand, setIsTypingCommand] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const messagesEndRef = useRef(null);
  const textFieldRef = useRef(null);

  // Combine chat messages and activities into a single timeline
  const combinedMessages = React.useMemo(() => {
    const chatMsgs = (messages[agent.id] || []).map(msg => ({
      ...msg,
      type: 'chat',
      timestamp: safeParseDate(msg.timestamp) || getSafeTimestamp()
    }));
    
    const activityMsgs = (activities[agent.id] || []).map(activity => ({
      ...activity,
      type: 'activity',
      sender: 'system',
      timestamp: safeParseDate(activity.timestamp) || getSafeTimestamp()
    }));
    
    // Combine and sort by timestamp
    return [...chatMsgs, ...activityMsgs].sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, activities, agent.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combinedMessages]);

  // Handle command input
  useEffect(() => {
    const checkForCommand = async () => {
      if (message.startsWith('/')) {
        setIsTypingCommand(true);
        const command = message.split(' ')[0];
        const query = message.substring(command.length + 1);
        
        // Handle different commands
        if (command === '/follow-up' && query) {
          // Fetch leads/clients for autocomplete
          try {
            const [leadsRes, clientsRes] = await Promise.all([
              leadsAPI.getAll({ search: query }),
              clientsAPI.getAll({ search: query })
            ]);
            
            const options = [
              ...leadsRes.data.leads.map(lead => ({
                type: 'lead',
                id: lead.id,
                name: `${lead.firstName} ${lead.lastName}`,
                email: lead.email,
                label: `Lead: ${lead.firstName} ${lead.lastName}`
              })),
              ...clientsRes.data.clients.map(client => ({
                type: 'client',
                id: client.id,
                name: `${client.firstName} ${client.lastName}`,
                email: client.email,
                label: `Client: ${client.firstName} ${client.lastName}`
              }))
            ];
            
            setAutocompleteOptions(options);
          } catch (error) {
            console.error('Error fetching autocomplete:', error);
          }
        } else if (command === '/area' && query) {
          // Filter areas based on query
          const filtered = bakersfieldAreas.filter(area => 
            area.toLowerCase().includes(query.toLowerCase())
          );
          setAutocompleteOptions(filtered.map(area => ({
            type: 'area',
            label: area,
            name: area
          })));
        }
      } else {
        setIsTypingCommand(false);
        setAutocompleteOptions([]);
      }
    };
    
    checkForCommand();
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: getSafeTimestamp()
    };

    setMessages(prev => ({
      ...prev,
      [agent.id]: [...(prev[agent.id] || []), newMessage]
    }));

    // Simulate agent processing command
    if (message.startsWith('/')) {
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          sender: 'agent',
          text: `Processing command: ${message}...`,
          timestamp: getSafeTimestamp()
        };
        
        setMessages(prev => ({
          ...prev,
          [agent.id]: [...(prev[agent.id] || []), response]
        }));
        
        // Simulate command result
        setTimeout(() => {
          let resultText = '';
          if (message.includes('/follow-up')) {
            resultText = '✅ Follow-up email scheduled for tomorrow at 9 AM';
          } else if (message.includes('/area')) {
            resultText = '📍 Found 12 active leads in the selected area. Would you like me to create a targeted campaign?';
          } else if (message.includes('/brief')) {
            resultText = '📊 Daily Brief: 3 new leads, 2 pending offers, 5 showings scheduled today';
          }
          
          const result = {
            id: Date.now() + 2,
            sender: 'agent',
            text: resultText,
            timestamp: getSafeTimestamp()
          };
          
          setMessages(prev => ({
            ...prev,
            [agent.id]: [...(prev[agent.id] || []), result]
          }));
        }, 1000);
      }, 500);
    }

    setMessage('');
    setAutocompleteOptions([]);
  };

  const handleQuickCommand = (command) => {
    setMessage(command + ' ');
    textFieldRef.current?.focus();
  };

  const getMessageStyle = (msg) => {
    if (msg.type === 'activity') {
      return {
        bgcolor: 'info.light',
        color: 'info.contrastText',
        maxWidth: '100%',
        mx: 'auto',
        my: 1,
        textAlign: 'center'
      };
    }
    
    return {
      bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
      color: msg.sender === 'user' ? 'white' : 'text.primary',
      maxWidth: '70%',
      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
    };
  };

  const commands = agentCommands[agent.id] || agentCommands[agent.id.replace(/_agent$/, '_manager')] || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '85vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: agent.color, mr: 2 }}>
              {agent.icon}
            </Avatar>
            <Box>
              <Typography variant="h6">{agent.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {agent.title}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Messages Area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <List sx={{ display: 'flex', flexDirection: 'column' }}>
            {combinedMessages.map((msg) => (
              <ListItem
                key={`${msg.type}-${msg.id}`}
                sx={{
                  display: 'flex',
                  justifyContent: msg.type === 'activity' ? 'center' : 
                    msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  px: 0
                }}
              >
                <Fade in>
                  <Paper
                    sx={{
                      p: 2,
                      ...getMessageStyle(msg)
                    }}
                    elevation={msg.type === 'activity' ? 0 : 1}
                  >
                    {msg.type === 'activity' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {msg.type === 'task_completed' && <CheckCircle sx={{ fontSize: 16 }} />}
                        {msg.type === 'notification' && <Notifications sx={{ fontSize: 16 }} />}
                        <Typography variant="body2">{msg.description || msg.text}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2">{msg.text}</Typography>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                      {format(msg.timestamp, 'h:mm a')}
                    </Typography>
                  </Paper>
                </Fade>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>
        
        <Divider />
        
        {/* Quick Commands */}
        <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {commands.map((cmd, index) => (
            <Chip
              key={index}
              icon={cmd.icon}
              label={cmd.label}
              onClick={() => handleQuickCommand(cmd.command)}
              size="small"
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
        
        <Divider />
        
        {/* Input Area */}
        <Box sx={{ p: 2 }}>
          {autocompleteOptions.length > 0 && isTypingCommand ? (
            <Autocomplete
              open
              options={autocompleteOptions}
              getOptionLabel={(option) => option.label || option}
              value={null}
              onChange={(event, newValue) => {
                if (newValue) {
                  const command = message.split(' ')[0];
                  setMessage(`${command} ${newValue.name || newValue}`);
                  setAutocompleteOptions([]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder={`Message ${agent.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  inputRef={textFieldRef}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: message.startsWith('/') && (
                      <InputAdornment position="start">
                        <Typography color="primary" variant="body2">/</Typography>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleSendMessage}
                          color="primary"
                          disabled={!message.trim()}
                        >
                          <Send />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
          ) : (
            <TextField
              fullWidth
              placeholder={`Message ${agent.name}... (Type / for commands)`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              inputRef={textFieldRef}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSendMessage}
                      color="primary"
                      disabled={!message.trim()}
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
          
          {message.startsWith('/') && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Type command and press space to see options
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAgentChat;