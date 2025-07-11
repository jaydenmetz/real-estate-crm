// File: frontend/src/components/dashboards/Office3DRoomInteractions.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  Close,
  Schedule,
  VideoCall,
  Description,
  Message,
  Assessment,
  Groups,
  Coffee,
  LocalBar,
  Spa,
  Work,
  Business,
  PhoneInTalk,
  TrendingUp,
  Star,
  WhatshotOutlined,
  Assignment,
  NotificationsActive,
  CheckCircle,
  Timer,
  People,
  AttachMoney,
  Email,
  LocationOn,
  Event,
  BarChart,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Room configurations based on 2D floor plan
const roomConfigs = {
  partnerOffice: {
    name: 'Partner Office',
    type: 'office',
    size: "10' x 10'",
    capacity: 4,
    features: ['Executive Desk', 'Meeting Chairs', 'Private Workspace'],
    icon: <Business />,
    color: '#1976d2'
  },
  seniorOffice1: {
    name: 'Senior Office 1',
    type: 'office',
    size: "9' x 10'",
    capacity: 3,
    features: ['Desk', 'Client Chairs', 'Filing Cabinet'],
    icon: <Work />,
    color: '#1976d2'
  },
  seniorOffice2: {
    name: 'Senior Office 2',
    type: 'office',
    size: "9' x 10'",
    capacity: 3,
    features: ['Desk', 'Client Chairs', 'Filing Cabinet'],
    icon: <Work />,
    color: '#1976d2'
  },
  conferenceRoom: {
    name: 'Conference Room',
    type: 'meeting',
    size: "16' x 10'",
    capacity: 12,
    features: ['Large Table', '85" Display', 'Video Conference System', 'Whiteboard'],
    icon: <Groups />,
    color: '#ff9800'
  },
  managerSuite: {
    name: "Manager's Suite",
    type: 'office',
    size: "11' x 10'",
    capacity: 6,
    features: ['Executive Desk', 'Lounge Area', 'Private TV', 'Coffee Table'],
    icon: <Star />,
    color: '#9c27b0'
  },
  commonArea: {
    name: 'Open Common Area',
    type: 'open',
    size: "20' x 13'",
    capacity: 20,
    features: ['Flexible Seating', 'Collaboration Space', 'Natural Light'],
    icon: <People />,
    color: '#4caf50'
  },
  wellnessZone: {
    name: 'Wellness Zone',
    type: 'wellness',
    size: "14' x 7'",
    capacity: 8,
    features: ['Quiet Zone', 'Relaxation Seating', 'Plants', 'Natural Light'],
    icon: <Spa />,
    color: '#4caf50'
  },
  refreshmentBar: {
    name: 'Refreshment Bar',
    type: 'amenity',
    size: "14' x 5'",
    capacity: 6,
    features: ['Coffee Machine', 'Refrigerator', 'Bar Seating', 'Snacks'],
    icon: <Coffee />,
    color: '#ff9800'
  },
  reception: {
    name: 'Reception',
    type: 'public',
    size: "11' x 10'",
    capacity: 8,
    features: ['Curved Desk', 'Waiting Area', 'Guest WiFi', 'Company Display'],
    icon: <Business />,
    color: '#00bcd4'
  },
  clientLounge: {
    name: 'Client Lounge',
    type: 'lounge',
    size: "17' x 10'",
    capacity: 15,
    features: ['Premium Seating', 'Entertainment System', 'Refreshments', 'Reading Materials'],
    icon: <People />,
    color: '#e91e63'
  },
  leadLounge: {
    name: 'Lead Lounge',
    type: 'lounge',
    size: "17' x 10'",
    capacity: 15,
    features: ['Comfortable Seating', 'Presentation Screen', 'Coffee Station', 'Lead Nurture Area'],
    icon: <TrendingUp />,
    color: '#3f51b5'
  }
};

// Room detail panel component
const RoomDetailPanel = ({ room, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [taskDialog, setTaskDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const config = roomConfigs[room.id] || {};

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    attendees: '',
    purpose: ''
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    type: '',
    assignTo: '',
    priority: 'medium',
    notes: ''
  });

  const handleBooking = () => {
    if (!bookingForm.startTime || !bookingForm.endTime) {
      enqueueSnackbar('Please select start and end times', { variant: 'error' });
      return;
    }

    onAction('book_room', {
      room: room.id,
      ...bookingForm
    });

    setBookingDialog(false);
    enqueueSnackbar(`${config.name} booked successfully`, { variant: 'success' });
  };

  const handleTaskAssignment = () => {
    if (!taskForm.type || !taskForm.assignTo) {
      enqueueSnackbar('Please select task type and assignee', { variant: 'error' });
      return;
    }

    onAction('assign_task', {
      room: room.id,
      ...taskForm
    });

    setTaskDialog(false);
    enqueueSnackbar('Task assigned successfully', { variant: 'success' });
  };

  const renderRoomInfo = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              {config.icon}
              <Box>
                <Typography variant="h6">{config.name}</Typography>
                <Chip 
                  label={config.type} 
                  size="small" 
                  sx={{ bgcolor: config.color, color: 'white' }}
                />
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Size</Typography>
                <Typography variant="body1">{config.size}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Capacity</Typography>
                <Typography variant="body1">{config.capacity} people</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Features</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {config.features?.map((feature, index) => (
                <Chip key={index} label={feature} size="small" variant="outlined" />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Grid container spacing={1}>
          {['meeting', 'office'].includes(config.type) && (
            <>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  startIcon={<Schedule />}
                  onClick={() => setBookingDialog(true)}
                >
                  Book Room
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<VideoCall />}
                  onClick={() => onAction('start_video', room)}
                >
                  Video Call
                </Button>
              </Grid>
            </>
          )}
          
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Assignment />}
              onClick={() => setTaskDialog(true)}
            >
              Assign Task
            </Button>
          </Grid>
          
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Assessment />}
              onClick={() => onAction('view_analytics', room)}
            >
              Analytics
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const renderActivity = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Recent Activity</Typography>
      <List>
        <ListItem>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.light' }}>A</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Alex scheduled a meeting"
            secondary="2 hours ago"
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'success.light' }}>S</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Sarah completed client presentation"
            secondary="3 hours ago"
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'warning.light' }}>D</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="David updated listing materials"
            secondary="5 hours ago"
          />
        </ListItem>
      </List>
    </Box>
  );

  const renderSchedule = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Today's Schedule</Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Team Meeting"
            secondary="9:00 AM - 10:00 AM"
          />
          <Chip label="In Progress" color="warning" size="small" />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Client Presentation"
            secondary="11:00 AM - 12:00 PM"
          />
          <Chip label="Upcoming" size="small" />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Strategy Session"
            secondary="2:00 PM - 3:30 PM"
          />
          <Chip label="Upcoming" size="small" />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Room Utilization Today
        </Typography>
        <LinearProgress variant="determinate" value={65} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          65% (5.2 hours booked)
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Paper
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 400,
          height: '100%',
          overflow: 'auto',
          boxShadow: 3,
          zIndex: 1000
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{config.name}</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </Box>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ px: 2 }}>
          <Tab label="Info" />
          <Tab label="Activity" />
          <Tab label="Schedule" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && renderRoomInfo()}
          {activeTab === 1 && renderActivity()}
          {activeTab === 2 && renderSchedule()}
        </Box>
      </Paper>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Book {config.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={bookingForm.startTime}
                onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={bookingForm.endTime}
                onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Attendees"
                value={bookingForm.attendees}
                onChange={(e) => setBookingForm({ ...bookingForm, attendees: e.target.value })}
                placeholder="Enter email addresses"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                multiline
                rows={2}
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBooking}>Book Room</Button>
        </DialogActions>
      </Dialog>

      {/* Task Assignment Dialog */}
      <Dialog open={taskDialog} onClose={() => setTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task for {config.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={taskForm.type}
                  onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                  label="Task Type"
                >
                  <MenuItem value="clean">Cleaning</MenuItem>
                  <MenuItem value="setup">Room Setup</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="inspection">Inspection</MenuItem>
                  <MenuItem value="preparation">Meeting Preparation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={taskForm.assignTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignTo: e.target.value })}
                  label="Assign To"
                >
                  <MenuItem value="alex">Alex (Executive Assistant)</MenuItem>
                  <MenuItem value="mike">Mike (Operations Manager)</MenuItem>
                  <MenuItem value="maintenance">Maintenance Team</MenuItem>
                  <MenuItem value="cleaning">Cleaning Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={taskForm.notes}
                onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTaskAssignment}>Assign Task</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Higher-order component to enhance Office3D with room interactions
const enhanceOffice3DWithRoomInteractions = (Office3DComponent) => {
  return (props) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const handleRoomClick = (room) => {
      setSelectedRoom(room);
    };

    const handleRoomAction = (action, data) => {
      console.log('Room action:', action, data);
      
      switch (action) {
        case 'book_room':
          // Handle room booking
          break;
        case 'start_video':
          enqueueSnackbar(`Starting video call in ${data.name}`, { variant: 'info' });
          break;
        case 'assign_task':
          // Handle task assignment
          break;
        case 'view_analytics':
          enqueueSnackbar(`Opening analytics for ${data.name}`, { variant: 'info' });
          break;
        default:
          break;
      }
    };

    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <Office3DComponent
          {...props}
          onRoomClick={handleRoomClick}
        />
        
        {selectedRoom && (
          <RoomDetailPanel
            room={selectedRoom}
            onClose={() => setSelectedRoom(null)}
            onAction={handleRoomAction}
          />
        )}
      </Box>
    );
  };
};

export default enhanceOffice3DWithRoomInteractions;