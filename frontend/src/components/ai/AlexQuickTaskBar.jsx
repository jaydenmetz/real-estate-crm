// frontend/src/components/ai/AlexQuickTaskBar.jsx
import React, { useState, useEffect } from 'react';
import { getSafeTimestamp } from '../../utils/safeDateUtils';
import {
  Box,
  Paper,
  TextField,
  Button,
  Chip,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Tooltip,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
} from '@mui/material';
import {
  SmartToy,
  Send,
  Schedule,
  ContactPhone,
  Email,
  Assignment,
  TrendingUp,
  Assessment,
  Home,
  People,
  Notifications,
  Add,
  Delete,
  Edit,
  Close,
  Settings,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import websocketService from '../../services/websocket';

const AlexQuickTaskBar = () => {
  const [task, setTask] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentActivity, setRecentActivity] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customTasks, setCustomTasks] = useState([]);
  const [newTaskDialog, setNewTaskDialog] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ text: '', action: '', icon: 'task' });
  
  const location = useLocation();
  const queryClient = useQueryClient();

  // Default page-specific quick tasks
  const defaultPageSuggestions = {
    '/': [
      { icon: <Assessment />, text: "Give me today's briefing", action: 'daily_briefing' },
      { icon: <Schedule />, text: "What's urgent today?", action: 'urgent_tasks' },
      { icon: <TrendingUp />, text: "Show performance summary", action: 'performance' },
      { icon: <Notifications />, text: "Any critical alerts?", action: 'alerts' }
    ],
    '/escrows': [
      { icon: <Assignment />, text: "Check closing deadlines", action: 'check_deadlines' },
      { icon: <Email />, text: "Send status updates", action: 'status_updates' },
      { icon: <ContactPhone />, text: "Call parties with issues", action: 'call_parties' },
      { icon: <Home />, text: "Review pending tasks", action: 'review_tasks' }
    ],
    '/leads': [
      { icon: <ContactPhone />, text: "Follow up on new leads", action: 'follow_leads' },
      { icon: <People />, text: "Score recent inquiries", action: 'score_inquiries' },
      { icon: <Email />, text: "Send nurture sequence", action: 'nurture_sequence' },
      { icon: <Assessment />, text: "Analyze lead sources", action: 'analyze_sources' }
    ],
    '/appointments': [
      { icon: <Schedule />, text: "Schedule follow-ups", action: 'schedule_followups' },
      { icon: <ContactPhone />, text: "Confirm appointments", action: 'confirm_appointments' },
      { icon: <Email />, text: "Send reminders", action: 'send_reminders' },
      { icon: <Assignment />, text: "Prep appointment packets", action: 'prep_packets' }
    ],
    '/listings': [
      { icon: <Assessment />, text: "Analyze listing performance", action: 'analyze_listings' },
      { icon: <ContactPhone />, text: "Follow up on showings", action: 'showing_feedback' },
      { icon: <TrendingUp />, text: "Update MLS listings", action: 'update_mls' },
      { icon: <People />, text: "Call prospects", action: 'call_prospects' }
    ],
    '/clients': [
      { icon: <Email />, text: "Send market updates", action: 'market_updates' },
      { icon: <People />, text: "Schedule annual check-ins", action: 'annual_checkins' },
      { icon: <Assignment />, text: "Update client profiles", action: 'update_profiles' },
      { icon: <Schedule />, text: "Anniversary reminders", action: 'anniversary_reminders' }
    ],
    '/ai-team': [
      { icon: <Assessment />, text: "Review team performance", action: 'team_performance' },
      { icon: <Settings />, text: "Optimize workflows", action: 'optimize_workflows' },
      { icon: <TrendingUp />, text: "Check KPIs", action: 'review_kpis' },
      { icon: <Assignment />, text: "Generate team report", action: 'team_report' }
    ]
  };

  // Load custom tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('alexCustomTasks');
    if (savedTasks) {
      setCustomTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Get page suggestions
  const getPageSuggestions = (pathname) => {
    const defaults = defaultPageSuggestions[pathname] || defaultPageSuggestions['/'];
    const pageCustomTasks = customTasks.filter(task => 
      task.pages?.includes(pathname) || task.pages?.includes('all')
    );
    
    return [...defaults, ...pageCustomTasks];
  };

  // Update suggestions when location changes
  useEffect(() => {
    setSuggestions(getPageSuggestions(location.pathname));
  }, [location.pathname, customTasks]);

  // Subscribe to WebSocket for Alex responses
  useEffect(() => {
    const handleAlexResponse = (data) => {
      setRecentActivity(data.message);
      setIsProcessing(false);
    };

    websocketService.on('alex:response', handleAlexResponse);
    return () => websocketService.off('alex:response', handleAlexResponse);
  }, []);

  // Execute task mutation
  const executeTask = useMutation(
    (taskData) => {
      setIsProcessing(true);
      setRecentActivity(`Processing: ${taskData.description}`);
      
      // Send to Alex via WebSocket
      websocketService.emit('alex:task', {
        task: taskData.description,
        action: taskData.action,
        page: taskData.page,
        timestamp: getSafeTimestamp()
      });

      // Simulate processing time
      setTimeout(() => {
        setRecentActivity(`✅ ${taskData.description} - Completed`);
        setIsProcessing(false);
        
        // Invalidate relevant queries
        if (taskData.action.includes('briefing')) {
          queryClient.invalidateQueries(['dashboardStats']);
        } else if (taskData.action.includes('urgent')) {
          queryClient.invalidateQueries(['urgentTasks']);
        }
        
        // Clear after showing completion
        setTimeout(() => setRecentActivity(''), 3000);
      }, 2000 + Math.random() * 3000);
      
      return Promise.resolve({ success: true });
    }
  );

  const handleQuickTask = (suggestion) => {
    executeTask.mutate({
      description: suggestion.text,
      action: suggestion.action,
      page: location.pathname
    });
  };

  const handleCustomTask = () => {
    if (!task.trim()) return;
    
    executeTask.mutate({
      description: task,
      action: 'custom',
      page: location.pathname
    });
    setTask('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomTask();
    }
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = suggestions.filter((_, i) => i !== index);
    setSuggestions(updatedTasks);
    
    // If it's a custom task, remove from storage
    const customIndex = index - defaultPageSuggestions[location.pathname]?.length;
    if (customIndex >= 0) {
      const newCustomTasks = customTasks.filter((_, i) => i !== customIndex);
      setCustomTasks(newCustomTasks);
      localStorage.setItem('alexCustomTasks', JSON.stringify(newCustomTasks));
    }
  };

  const handleAddTask = () => {
    const iconMap = {
      task: <Assignment />,
      phone: <ContactPhone />,
      email: <Email />,
      schedule: <Schedule />,
      people: <People />,
      analytics: <Assessment />,
      trending: <TrendingUp />,
    };

    const newTask = {
      icon: iconMap[newTaskForm.icon] || <Assignment />,
      text: newTaskForm.text,
      action: newTaskForm.action || newTaskForm.text.toLowerCase().replace(/\s+/g, '_'),
      pages: [location.pathname],
      custom: true
    };

    const updatedCustomTasks = [...customTasks, newTask];
    setCustomTasks(updatedCustomTasks);
    localStorage.setItem('alexCustomTasks', JSON.stringify(updatedCustomTasks));
    
    setNewTaskDialog(false);
    setNewTaskForm({ text: '', action: '', icon: 'task' });
  };

  return (
    <>
      <Paper 
        elevation={3}
        sx={{ 
          top: 64, // Below AppBar
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2
        }}
      >
        {/* Main Bar */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Badge 
              badgeContent={isProcessing ? '●' : 0} 
              color="success"
              variant="dot"
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  mr: 2,
                  animation: isProcessing ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              >
                <SmartToy />
              </Avatar>
            </Badge>

            <Box sx={{ flexGrow: 1 }}>
              <Fade in={!!recentActivity}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.9,
                    color: recentActivity.includes('✅') ? '#4caf50' : 'inherit'
                  }}
                >
                  {recentActivity || `Ready to help with ${location.pathname.slice(1) || 'dashboard'} tasks`}
                </Typography>
              </Fade>
            </Box>

            <Tooltip title={editMode ? "Done Editing" : "Edit Quick Tasks"}>
              <IconButton 
                color="inherit"
                onClick={() => setEditMode(!editMode)}
                sx={{ ml: 1 }}
              >
                {editMode ? <Close /> : <Settings />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Task Input */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask Alex anything..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255,255,255,0.7)',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleCustomTask}
                      disabled={isProcessing || !task.trim()}
                      sx={{ color: 'white' }}
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Quick Task Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestions.map((suggestion, index) => (
              <Zoom key={index} in style={{ transitionDelay: `${index * 50}ms` }}>
                <Box sx={{ position: 'relative' }}>
                  <Tooltip title={`Alex will: ${suggestion.text}`}>
                    <Chip
                      icon={suggestion.icon}
                      label={suggestion.text}
                      onClick={() => !editMode && handleQuickTask(suggestion)}
                      disabled={isProcessing}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        cursor: editMode ? 'default' : 'pointer',
                        '&:hover': { 
                          bgcolor: editMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
                          transform: editMode ? 'none' : 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        },
                        '&.Mui-disabled': {
                          opacity: 0.5,
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                  </Tooltip>
                  {editMode && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(index)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        width: 20,
                        height: 20,
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                    >
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              </Zoom>
            ))}
            
            {editMode && (
              <Zoom in>
                <Chip
                  icon={<Add />}
                  label="Add Task"
                  onClick={() => setNewTaskDialog(true)}
                  sx={{
                    bgcolor: 'rgba(76, 175, 80, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(76, 175, 80, 0.5)',
                    '&:hover': { 
                      bgcolor: 'rgba(76, 175, 80, 0.3)',
                    }
                  }}
                />
              </Zoom>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Add Task Dialog */}
      <Dialog open={newTaskDialog} onClose={() => setNewTaskDialog(false)}>
        <DialogTitle>Add Quick Task</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Task Description"
              value={newTaskForm.text}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, text: e.target.value })}
              placeholder="e.g., Review pending contracts"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Action ID (optional)"
              value={newTaskForm.action}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, action: e.target.value })}
              placeholder="e.g., review_contracts"
              helperText="Leave empty to auto-generate"
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              label="Icon"
              value={newTaskForm.icon}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, icon: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="task">Task</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="schedule">Schedule</option>
              <option value="people">People</option>
              <option value="analytics">Analytics</option>
              <option value="trending">Trending</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTaskDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTask} 
            variant="contained"
            disabled={!newTaskForm.text.trim()}
          >
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlexQuickTaskBar;