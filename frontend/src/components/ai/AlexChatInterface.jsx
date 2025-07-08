
import React, { useState, useEffect, useRef } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  SmartToy,
  Send,
  Close,
  MoreVert,
  Schedule,
  Warning,
  Assessment,
  People,
  Home,
  Business,
  Clear,
  Minimize,
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { aiAPI, escrowsAPI, listingsAPI, clientsAPI, appointmentsAPI, leadsAPI } from '../../services/api';
import websocketService from '../../services/websocket';

const AlexChatInterface = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'alex',
      content: "Hi! I'm Alex, your Executive Assistant. I can help you manage your real estate business. What would you like to focus on today?",
      timestamp: new Date(),
      quickActions: [
        { label: 'Daily Briefing', icon: <Assessment />, action: 'daily-briefing' },
        { label: 'Urgent Tasks', icon: <Warning />, action: 'urgent-tasks' },
        { label: 'Schedule Review', icon: <Schedule />, action: 'schedule-review' },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  // Subscribe to WebSocket events
  useEffect(() => {
    const handleAlexMessage = (data) => {
      addMessage('alex', data.message, data.quickActions);
      if (!open) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleUrgentNotification = (data) => {
      addMessage('alex', `🚨 Urgent: ${data.message}`, [
        { label: 'View Details', action: 'view-details', data: data }
      ]);
      if (!open) {
        setUnreadCount(prev => prev + 1);
      }
    };

    websocketService.on('alex:message', handleAlexMessage);
    websocketService.on('alex:urgent', handleUrgentNotification);

    return () => {
      websocketService.off('alex:message', handleAlexMessage);
      websocketService.off('alex:urgent', handleUrgentNotification);
    };
  }, [open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset unread count when opened
  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type, content, quickActions = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      quickActions
    }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    addMessage('user', userMessage);
    setLoading(true);

    try {
      // Process user input through Alex AI
      const response = await websocketService.emit('alex:request', {
        message: userMessage,
        context: {
          currentView: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      });

      // Alex will respond via WebSocket
    } catch (error) {
      addMessage('alex', 'I encountered an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action, data = null) => {
    setLoading(true);
    
    try {
      switch (action) {
        case 'daily-briefing':
          const briefing = await aiAPI.getDailyBrief();
          addMessage('alex', formatDailyBriefing(briefing.data));
          break;
          
        case 'urgent-tasks':
          const tasks = await aiAPI.getUrgentTasks();
          addMessage('alex', formatUrgentTasks(tasks.data));
          break;
          
        case 'schedule-review':
          const appointments = await appointmentsAPI.getAll({ 
            date: new Date().toISOString().split('T')[0] 
          });
          addMessage('alex', formatSchedule(appointments.data));
          break;
          
        default:
          // Handle custom actions
          websocketService.emit('alex:action', { action, data });
      }
    } catch (error) {
      addMessage('alex', 'I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDailyBriefing = (data) => {
    return `📊 **Daily Briefing**

**Escrows:** ${data.escrows.active} active, ${data.escrows.closingSoon} closing soon
**Listings:** ${data.listings.active} active, ${data.listings.new} new views
**Appointments:** ${data.appointments.today} today, ${data.appointments.tomorrow} tomorrow
**Leads:** ${data.leads.new} new, ${data.leads.followUp} need follow-up

**Top Priority:** ${data.topPriority || 'No urgent items'}`;
  };

  const formatUrgentTasks = (tasks) => {
    if (!tasks || tasks.length === 0) {
      return "✅ No urgent tasks at the moment. You're all caught up!";
    }
    
    return `🚨 **Urgent Tasks**

${tasks.map((task, i) => `${i + 1}. ${task.description} (${task.type})`).join('\n')}`;
  };

  const formatSchedule = (appointments) => {
    if (!appointments || appointments.length === 0) {
      return "📅 No appointments scheduled for today.";
    }
    
    return `📅 **Today's Schedule**

${appointments.map(apt => `• ${apt.startTime} - ${apt.title} (${apt.appointmentType})`).join('\n')}`;
  };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title="Alex - Executive Assistant">
        <Fab
          color="primary"
          aria-label="alex-assistant"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1300,
          }}
          onClick={() => setOpen(true)}
        >
          <Badge badgeContent={unreadCount} color="error">
            <SmartToy />
          </Badge>
        </Fab>
      </Tooltip>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: minimized ? 'auto' : '80vh',
            maxHeight: '80vh',
            m: 2,
            position: 'fixed',
            bottom: 0,
            right: 0,
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <SmartToy sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography variant="h6">Alex - Executive Assistant</Typography>
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => setMinimized(!minimized)}
              sx={{ mr: 1 }}
            >
              <Minimize />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setOpen(false)}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        {!minimized && (
          <>
            <DialogContent dividers sx={{ p: 2, height: 'calc(100% - 140px)', overflow: 'auto' }}>
              <List>
                {messages.map((message) => (
                  <ListItem
                    key={message.id}
                    sx={{
                      flexDirection: 'column',
                      alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                    
                    {message.quickActions && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {message.quickActions.map((action, idx) => (
                          <Chip
                            key={idx}
                            label={action.label}
                            icon={action.icon}
                            onClick={() => handleQuickAction(action.action, action.data)}
                            size="small"
                            variant="outlined"
                            clickable
                          />
                        ))}
                      </Box>
                    )}
                  </ListItem>
                ))}
                {loading && (
                  <ListItem sx={{ justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                  </ListItem>
                )}
                <div ref={messagesEndRef} />
              </List>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask Alex anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                size="small"
                multiline
                maxRows={3}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                endIcon={<Send />}
              >
                Send
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <Typography variant="caption">Switch Agent</Typography>
        </MenuItem>
        
        {[
          { name: 'Ella - Lead Response', avatar: '👩‍💼' },
          { name: 'Olivia - Admin', avatar: '👩‍💻' },
          { name: 'Marcus - Marketing', avatar: '👨‍💼' },
        ].map((agent) => (
          <MenuItem key={agent.name} onClick={() => { /* Switch agent logic */ setAnchorEl(null); }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '12px' }}>
              {agent.avatar}
            </Avatar>
            {agent.name}
          </MenuItem>
        ))}
        
        <Divider />
        
        <MenuItem onClick={() => { setMessages([]); setAnchorEl(null); }}>
          <Clear sx={{ mr: 1 }} />
          Clear Chat
        </MenuItem>
      </Menu>
    </>
  );
};

export default AlexChatInterface;