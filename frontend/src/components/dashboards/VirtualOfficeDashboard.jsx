// VirtualOfficeDashboard.jsx
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
  Backdrop,
  Tab,
  Tabs,
  FormControlLabel,
  Switch,
  Badge,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  Timer,
  NotificationsActive,
  Map,
  MeetingRoom,
  Home,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import Office3D from './Office3D';
import { aiAgentsAPI, analyticsAPI } from '../../services/api';
import websocketService from '../../services/websocket';

// Agent configurations matching your floor plan
const agentProfiles = {
  alex: {
    id: 'alex',
    name: 'Alex',
    title: 'Executive Assistant',
    department: 'reception',
    icon: '🤖',
    color: '#1976d2',
    defaultPosition: { x: 15, z: -3.5 }, // Reception area
    status: 'available',
    currentTask: 'Managing appointments',
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah',
    title: 'Listing Manager',
    department: 'listings',
    icon: '🏠',
    color: '#2e7d32',
    defaultPosition: { x: -15, z: 11 }, // Executive office 1
    status: 'busy',
    currentTask: 'Reviewing new listings',
  },
  mike: {
    id: 'mike',
    name: 'Mike',
    title: 'Operations Manager',
    department: 'operations',
    icon: '⚙️',
    color: '#ed6c02',
    defaultPosition: { x: -5, z: 11 }, // Executive office 2
    status: 'available',
    currentTask: 'Coordinating team activities',
  },
  emma: {
    id: 'emma',
    name: 'Emma',
    title: 'Client Relations',
    department: 'clients',
    icon: '👥',
    color: '#9c27b0',
    defaultPosition: { x: 5, z: 11 }, // Executive office 3
    status: 'available',
    currentTask: 'Following up with clients',
  },
};

// Room configurations for your floor plan
const roomConfigs = {
  executive1: {
    name: 'Executive Office 1',
    type: 'office',
    capacity: 2,
    features: ['Desk', 'Meeting Chairs', 'Whiteboard'],
    assignedAgent: 'sarah',
  },
  executive2: {
    name: 'Executive Office 2',
    type: 'office',
    capacity: 2,
    features: ['Desk', 'Meeting Chairs', 'Monitor'],
    assignedAgent: 'mike',
  },
  executive3: {
    name: 'Executive Office 3',
    type: 'office',
    capacity: 2,
    features: ['Desk', 'Meeting Chairs', 'Filing Cabinet'],
    assignedAgent: 'emma',
  },
  conference: {
    name: 'Conference Room',
    type: 'meeting',
    capacity: 8,
    features: ['Conference Table', 'Projector', 'Video Conference'],
    currentMeeting: null,
  },
  officeStorage: {
    name: 'Office with Storage',
    type: 'office',
    capacity: 3,
    features: ['Desk', 'Storage Cabinets', 'Printer'],
    purpose: 'Administrative work and supply storage',
  },
  lounge: {
    name: 'Lounge Area',
    type: 'relaxation',
    capacity: 6,
    features: ['Comfortable Seating', 'Coffee Machine', 'Water Cooler'],
    amenities: ['Coffee', 'Tea', 'Snacks'],
  },
  reception: {
    name: 'Reception/Waiting Area',
    type: 'reception',
    capacity: 4,
    features: ['Reception Desk', 'Waiting Chairs', 'Info Display'],
    assignedAgent: 'alex',
  },
  meeting: {
    name: 'Meeting Room',
    type: 'meeting',
    capacity: 4,
    features: ['Round Table', 'Whiteboard', 'Phone'],
    availability: 'Available',
  },
  client: {
    name: 'Client Area',
    type: 'client',
    capacity: 3,
    features: ['Consultation Desk', 'Display Screen', 'Brochures'],
    purpose: 'Client consultations',
  },
  workspace: {
    name: 'Open Workspace',
    type: 'workspace',
    capacity: 10,
    features: ['Hot Desks', 'Collaboration Areas', 'Printers'],
    currentOccupancy: 5,
  },
};

const VirtualOfficeDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState('3d');
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Convert agent profiles to array format for Office3D
  const agents = Object.values(agentProfiles);

  // Fetch real-time data
  const { data: officeStats } = useQuery(
    'officeStats',
    () => analyticsAPI.getOfficeStats(),
    { refetchInterval: 30000 }
  );

  // WebSocket connection for real-time updates
  useEffect(() => {
    websocketService.on('agent-update', (data) => {
      queryClient.invalidateQueries('officeStats');
      enqueueSnackbar(`${data.agentName} is now ${data.status}`, { 
        variant: 'info' 
      });
    });

    websocketService.on('room-update', (data) => {
      if (data.roomId === selectedRoom?.id) {
        setSelectedRoom({ ...selectedRoom, ...data.updates });
      }
    });

    return () => {
      websocketService.off('agent-update');
      websocketService.off('room-update');
    };
  }, [selectedRoom]);

  const handleAgentClick = (agentId) => {
    const agent = agentProfiles[agentId];
    setSelectedAgent(agent);
  };

  const handleRoomClick = (roomName) => {
    const room = roomConfigs[roomName];
    if (room) {
      setSelectedRoom({ id: roomName, ...room });
      setShowRoomDetails(true);
    }
  };

  const handleSendMessageToAgent = () => {
    if (selectedAgent && agentMessage) {
      enqueueSnackbar(`Message sent to ${selectedAgent.name}`, { 
        variant: 'success' 
      });
      setAgentMessage('');
      // In real app, this would send via API
    }
  };

  const handleMakeAnnouncement = () => {
    if (announcement) {
      setShowAnnouncement(true);
      enqueueSnackbar('Announcement broadcasted!', { variant: 'success' });
      setTimeout(() => setShowAnnouncement(false), 5000);
    }
  };

  const handleRoomAction = (action, room) => {
    switch(action) {
      case 'book':
        enqueueSnackbar(`${room.name} booked successfully`, { 
          variant: 'success' 
        });
        break;
      case 'start_meeting':
        enqueueSnackbar(`Meeting started in ${room.name}`, { 
          variant: 'info' 
        });
        break;
      case 'order_refreshments':
        enqueueSnackbar('Refreshments ordered', { variant: 'success' });
        break;
      default:
        break;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Virtual Office Dashboard - Luxury Real Estate
        </Typography>
        <Typography variant="body1" color="text.secondary">
          40' x 30' Office Space | Real-time View
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Groups color="primary" />
                <Box>
                  <Typography variant="h6">
                    {agents.filter(a => a.status === 'available').length}/{agents.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agents Available
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <MeetingRoom color="success" />
                <Box>
                  <Typography variant="h6">
                    {Object.values(roomConfigs).filter(r => r.type === 'meeting').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Meeting Rooms
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Work color="warning" />
                <Box>
                  <Typography variant="h6">
                    {roomConfigs.workspace.currentOccupancy}/{roomConfigs.workspace.capacity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Workspace Occupancy
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Timer color="info" />
                <Box>
                  <Typography variant="h6">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Local Time
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3D Office View - Updated with Floating Style */}
      <Box
        sx={{
          position: 'relative',
          height: '600px',
          // Floating effect with transparent background
          background: 'transparent',
          // Remove overflow hidden to let elements float
          overflow: 'visible',
          // Enhanced floating shadow
          filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.15))',
          // Add some margin for the floating effect
          margin: '40px 0',
          // Transform for subtle 3D floating effect
          transform: 'perspective(1000px) rotateX(2deg)',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'perspective(1000px) rotateX(0deg) translateY(-5px)',
          }
        }}
      >
        {/* Office floor container with floating appearance */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            // Gradient background for the office floor
            background: 'linear-gradient(135deg, rgba(245,247,250,0.95) 0%, rgba(195,207,226,0.95) 100%)',
            // Subtle border for definition
            border: '1px solid rgba(255,255,255,0.5)',
            // Rounded corners for modern look
            borderRadius: 3,
            // Inner shadow for depth
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
            // Backdrop blur for glass effect
            backdropFilter: 'blur(10px)',
            p: 2,
          }}
        >
          <Office3D
            agents={agents}
            selectedAgent={selectedAgent}
            onAgentClick={handleAgentClick}
            onRoomClick={handleRoomClick}
          />
          
          {/* Quick Actions Overlay - Updated positioning */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 20,
            zIndex: 10
          }}>
            <Stack spacing={1}>
              <Tooltip title="Make Announcement">
                <IconButton 
                  color="primary" 
                  sx={{ 
                    bgcolor: 'background.paper', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => setShowAnnouncement(true)}
                >
                  <NotificationsActive />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh View">
                <IconButton 
                  color="secondary" 
                  sx={{ 
                    bgcolor: 'background.paper', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => queryClient.invalidateQueries()}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        {/* Floating office label */}
        <Fade in={true}>
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 2,
              fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(5px)'
            }}
          >
            Live Office View - Hover to interact
          </Box>
        </Fade>
      </Box>

      {/* Agent Details Panel */}
      {selectedAgent && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: selectedAgent.color, width: 56, height: 56 }}>
                  {selectedAgent.icon}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h5">{selectedAgent.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAgent.title}
                  </Typography>
                </Box>
                <Chip 
                  label={selectedAgent.status} 
                  color={selectedAgent.status === 'available' ? 'success' : 'warning'}
                />
              </Stack>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                Current Task: {selectedAgent.currentTask}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Send Message
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={agentMessage}
                    onChange={(e) => setAgentMessage(e.target.value)}
                  />
                  <Button 
                    variant="contained" 
                    endIcon={<Send />}
                    onClick={handleSendMessageToAgent}
                  >
                    Send
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Agent Activity
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Completed client call"
                    secondary="5 minutes ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Updated listing #4521"
                    secondary="12 minutes ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Scheduled viewing"
                    secondary="25 minutes ago"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Room Details Dialog */}
      <Dialog
        open={showRoomDetails}
        onClose={() => setShowRoomDetails(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRoom && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h5">{selectedRoom.name}</Typography>
                <IconButton onClick={() => setShowRoomDetails(false)}>
                  <Close />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Room Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRoom.type}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedRoom.capacity} people
                  </Typography>
                  
                  {selectedRoom.assignedAgent && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">
                        Assigned To
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {agentProfiles[selectedRoom.assignedAgent]?.name}
                      </Typography>
                    </>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Features
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {selectedRoom.features?.map((feature, index) => (
                      <Chip key={index} label={feature} size="small" />
                    ))}
                  </Stack>
                  
                  {selectedRoom.type === 'meeting' && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Schedule />}
                      onClick={() => handleRoomAction('book', selectedRoom)}
                      sx={{ mt: 2 }}
                    >
                      Book This Room
                    </Button>
                  )}
                  
                  {selectedRoom.type === 'relaxation' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Coffee />}
                      onClick={() => handleRoomAction('order_refreshments', selectedRoom)}
                      sx={{ mt: 2 }}
                    >
                      Order Refreshments
                    </Button>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog
        open={showAnnouncement}
        onClose={() => setShowAnnouncement(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Office Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type your announcement..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnnouncement(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleMakeAnnouncement}
            startIcon={<NotificationsActive />}
          >
            Broadcast
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Announcement */}
      <Snackbar
        open={showAnnouncement && announcement}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          <Typography variant="h6">Office Announcement</Typography>
          <Typography>{announcement}</Typography>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VirtualOfficeDashboard;