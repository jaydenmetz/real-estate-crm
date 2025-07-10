// File: frontend/src/components/dashboards/Office3DRoomInteractions.jsx
// This is a NEW FILE - create it in your dashboards folder

import React, { useState, useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { 
  Box, Paper, Typography, Button, IconButton, Stack, Grid, 
  Avatar, Chip, LinearProgress, Tabs, Tab, List, ListItem, 
  ListItemText, ListItemAvatar, Divider, Card, CardContent,
  Fade, Backdrop, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import {
  Close, Schedule, VideoCall, Description, Message,
  Assessment, Groups, Coffee, LocalBar, Spa, Work,
  Business, PhoneInTalk, TrendingUp, Star, WhatshotOutlined,
  AcUnit, Assignment, NotificationsActive, CheckCircle,
  Timer, People, TrendingDown, AttachMoney, Videocam,
  Phone, Email, LocationOn, Event, BarChart
} from '@mui/icons-material';

// Room detail panel component
const RoomDetailPanel = ({ room, onClose, agents, clients, leads, onAction }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Conference Room Content
  const renderConferenceRoom = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Stack spacing={1}>
          <Button 
            fullWidth 
            startIcon={<Schedule />} 
            variant="contained"
            onClick={() => onAction('schedule_meeting', room)}
          >
            Schedule Meeting
          </Button>
          <Button 
            fullWidth 
            startIcon={<VideoCall />} 
            variant="outlined"
            onClick={() => onAction('start_video', room)}
          >
            Start Video Call
          </Button>
          <Button 
            fullWidth 
            startIcon={<Description />} 
            variant="outlined"
            onClick={() => onAction('book_presentation', room)}
          >
            Book Presentation
          </Button>
          <Button 
            fullWidth 
            startIcon={<Assessment />} 
            variant="outlined"
            onClick={() => onAction('view_calendar', room)}
          >
            View Room Calendar
          </Button>
        </Stack>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>Meeting History</Typography>
        <List dense>
          {[
            { title: 'Q4 Sales Review', time: '2h ago', attendees: 8, agent: 'Sarah' },
            { title: 'Client Presentation - Smith', time: 'Yesterday', attendees: 4, agent: 'Mike' },
            { title: 'Team Standup', time: 'Mon 9 AM', attendees: 12, agent: 'Alex' },
            { title: 'Contract Negotiation', time: 'Last Week', attendees: 6, agent: 'Lisa' },
            { title: 'Strategy Session', time: 'Last Week', attendees: 10, agent: 'Sarah' }
          ].map((meeting, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={meeting.title}
                secondary={`${meeting.time} • ${meeting.attendees} attendees • Host: ${meeting.agent}`}
              />
            </ListItem>
          ))}
        </List>
        <Button size="small" onClick={() => onAction('view_all_meetings', room)}>
          View All History
        </Button>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>Room Status</Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">Current Status</Typography>
            <Chip 
              label="Available" 
              color="success" 
              size="small" 
              icon={<CheckCircle />}
            />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Next Meeting</Typography>
            <Typography variant="body1">3:00 PM - Budget Review</Typography>
            <Typography variant="caption" color="text.secondary">In 2 hours 15 minutes</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Equipment</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label='85" Display' size="small" variant="outlined" />              <Chip label="Whiteboard" size="small" variant="outlined" />
              <Chip label="Conference Phone" size="small" variant="outlined" />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Capacity</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <People fontSize="small" />
              <Typography variant="body1">12 people maximum</Typography>
            </Box>
          </Box>
          {agents && agents.filter(a => a.location === 'conferenceRoom').length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary">Currently Inside</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {agents.filter(a => a.location === 'conferenceRoom').map(agent => (
                  <Chip 
                    key={agent.id}
                    label={agent.name}
                    size="small"
                    avatar={<Avatar sx={{ width: 20, height: 20 }}>{agent.name[0]}</Avatar>}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Grid>
    </Grid>
  );

  // Manager's Office Content
  const renderManagerOffice = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>M</Avatar>
            <Box>
              <Typography variant="h5">Manager's Suite</Typography>
              <Typography variant="body2" color="text.secondary">Executive Operations Center</Typography>
              <Chip label="In Office" color="success" size="small" sx={{ mt: 1 }} />
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h4" color="primary">87%</Typography>
                  <Typography variant="body2" color="text.secondary">Team Performance</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h4" color="success.main">$2.4M</Typography>
                  <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Recent Decisions</Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Approved marketing budget increase"
                  secondary="2 hours ago"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Assigned Sarah to luxury waterfront listing"
                  secondary="This morning"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Scheduled team training for next week"
                  secondary="Yesterday"
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Stack spacing={1}>
            <Button 
              fullWidth 
              startIcon={<Message />} 
              variant="contained"
              onClick={() => onAction('request_meeting', room)}
            >
              Request 1-on-1
            </Button>
            <Button 
              fullWidth 
              startIcon={<Assignment />} 
              variant="outlined"
              onClick={() => onAction('submit_report', room)}
            >
              Submit Report
            </Button>
            <Button 
              fullWidth 
              startIcon={<BarChart />} 
              variant="outlined"
              onClick={() => onAction('view_okrs', room)}
            >
              View OKRs
            </Button>
            <Button 
              fullWidth 
              startIcon={<Email />} 
              variant="outlined"
              onClick={() => onAction('send_message', room)}
            >
              Send Message
            </Button>
          </Stack>
          
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Office Hours</Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Monday - Friday"
                  secondary="9:00 AM - 6:00 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Open Door Policy"
                  secondary="2:00 PM - 4:00 PM"
                />
              </ListItem>
            </List>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  // Client Lounge Content
  const renderClientLounge = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Active Clients in Lounge</Typography>
      <Grid container spacing={2}>
        {(clients || [
          { id: 1, name: 'John Smith', vip: true, rating: 5, propertyInterest: 'Luxury Condo', lastInteraction: '2 hours ago', inLounge: true, netWorth: '$5M+' },
          { id: 2, name: 'Jane Doe', vip: false, rating: 4, propertyInterest: 'Beach House', lastInteraction: 'Yesterday', inLounge: true, netWorth: '$2M+' },
          { id: 3, name: 'Robert Chen', vip: true, rating: 5, propertyInterest: 'Investment Properties', lastInteraction: '1 hour ago', inLounge: true, netWorth: '$10M+' },
          { id: 4, name: 'Maria Garcia', vip: false, rating: 4, propertyInterest: 'Family Home', lastInteraction: '3 days ago', inLounge: true, netWorth: '$1M+' }
        ]).filter(c => c.inLounge).map((client, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderColor: client.vip ? 'warning.main' : 'divider',
                borderWidth: client.vip ? 2 : 1
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar sx={{ mr: 2, bgcolor: client.vip ? 'warning.main' : 'primary.main' }}>
                    {client.name?.[0]}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2">{client.name}</Typography>
                    <Box display="flex" alignItems="center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} sx={{ 
                          fontSize: 14, 
                          color: i < client.rating ? 'warning.main' : 'action.disabled' 
                        }} />
                      ))}
                    </Box>
                  </Box>
                  {client.vip && <Chip label="VIP" size="small" color="warning" />}
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle' }} /> {client.propertyInterest}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <AttachMoney sx={{ fontSize: 16, verticalAlign: 'middle' }} /> {client.netWorth}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last seen: {client.lastInteraction}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Lounge Analytics</Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Clients Currently Here</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {(clients || []).filter(c => c.inLounge).length}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Average Wait Time</Typography>
                    <Typography variant="body2" fontWeight="bold">12 mins</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Satisfaction Score</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">4.8/5</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">VIP Clients Present</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {(clients || []).filter(c => c.inLounge && c.vip).length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack spacing={1}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<LocalBar />}
                    onClick={() => onAction('order_refreshments', room)}
                  >
                    Order Refreshments
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<NotificationsActive />}
                    onClick={() => onAction('notify_agent', room)}
                  >
                    Notify Agent of Arrival
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<Videocam />}
                    onClick={() => onAction('control_tv', room)}
                  >
                    Control Lounge TV
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<Spa />}
                    onClick={() => onAction('adjust_ambiance', room)}
                  >
                    Adjust Ambiance
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  // Lead Lounge Content
  const renderLeadLounge = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Active Leads Walking Around</Typography>
      <Grid container spacing={2}>
        {(leads || [
          { id: 1, name: 'Mike Johnson', source: 'Website', temperature: 'hot', daysInPipeline: 3, nextAction: 'Call today', value: '$750K', assignedTo: 'Sarah' },
          { id: 2, name: 'Lisa Brown', source: 'Referral', temperature: 'warm', daysInPipeline: 7, nextAction: 'Send listings', value: '$500K', assignedTo: 'Mike' },
          { id: 3, name: 'Tom Wilson', source: 'Open House', temperature: 'cold', daysInPipeline: 15, nextAction: 'Follow up email', value: '$300K', assignedTo: 'Lisa' },
          { id: 4, name: 'Amanda Lee', source: 'Social Media', temperature: 'hot', daysInPipeline: 1, nextAction: 'Schedule showing', value: '$1.2M', assignedTo: 'Sarah' },
          { id: 5, name: 'David Park', source: 'Zillow', temperature: 'warm', daysInPipeline: 5, nextAction: 'Qualification call', value: '$450K', assignedTo: 'Alex' },
          { id: 6, name: 'Rachel Green', source: 'Referral', temperature: 'hot', daysInPipeline: 2, nextAction: 'Contract review', value: '$900K', assignedTo: 'Mike' }
        ]).map((lead, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card 
              variant="outlined" 
              sx={{ 
                borderColor: lead.temperature === 'hot' ? 'error.main' : 
                           lead.temperature === 'warm' ? 'warning.main' : 'info.main',
                position: 'relative',
                overflow: 'visible',
                animation: lead.temperature === 'hot' ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.02)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            >
              <CardContent>
                <Box position="absolute" top={-8} right={8}>
                  {lead.temperature === 'hot' && <WhatshotOutlined color="error" />}
                  {lead.temperature === 'warm' && <WhatshotOutlined color="warning" />}
                  {lead.temperature === 'cold' && <AcUnit color="info" />}
                </Box>
                <Typography variant="subtitle2" fontWeight="bold">{lead.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {lead.source} • {lead.value}
                </Typography>
                <Box mt={1}>
                  <Typography variant="caption">Pipeline Progress</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(lead.daysInPipeline * 10, 100)} 
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: 'grey.300',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: lead.temperature === 'hot' ? 'error.main' :
                                       lead.temperature === 'warm' ? 'warning.main' : 'info.main'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Day {lead.daysInPipeline} • Agent: {lead.assignedTo}
                  </Typography>
                </Box>
                <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                  <Timer sx={{ fontSize: 12, verticalAlign: 'middle' }} /> {lead.nextAction}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>Lead Analytics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4">{leads?.length || 6}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Leads
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" color="error.main">
                  {leads?.filter(l => l.temperature === 'hot').length || 3}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hot Leads
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4" color="success.main">24%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Conversion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h4">1.2h</Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Response Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box mt={2}>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<People />}
              onClick={() => onAction('capture_lead', room)}
            >
              Capture New Lead
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<TrendingUp />}
              onClick={() => onAction('bulk_outreach', room)}
            >
              Bulk Outreach
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Assignment />}
              onClick={() => onAction('reassign_leads', room)}
            >
              Reassign Leads
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  // Reception Content
  const renderReception = () => (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>A</Avatar>
        <Box>
          <Typography variant="h5">Reception Desk</Typography>
          <Typography variant="body2" color="text.secondary">Alex - Executive Assistant</Typography>
          <Chip label="Active" color="success" size="small" sx={{ mt: 1 }} />
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Today's Activity</Typography>
          <List dense>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <People />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="John Smith arrived"
                secondary="VIP Client • 10 minutes ago"
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <Phone />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Call from potential buyer"
                secondary="Transferred to Sarah • 30 minutes ago"
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <Event />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="3 appointments scheduled"
                secondary="For this afternoon • 1 hour ago"
              />
            </ListItem>
          </List>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Stack spacing={1}>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<NotificationsActive />}
              onClick={() => onAction('make_announcement', room)}
            >
              Make Announcement
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<People />}
              onClick={() => onAction('visitor_checkin', room)}
            >
              Visitor Check-in
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Event />}
              onClick={() => onAction('view_schedule', room)}
            >
              View Day Schedule
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  // Private Office Content (for Partner/Senior offices)
  const renderPrivateOffice = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Office Details</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ width: 50, height: 50 }}>
                  {room.id === 'partnerOffice' ? 'P' : 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {room.id === 'partnerOffice' ? 'Partner Office' : 'Senior Agent Office'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {room.id === 'partnerOffice' ? 'Executive Suite' : 'Private Workspace'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Current Activity</Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Working on luxury listing presentation"
                    secondary="Started 45 minutes ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="2 calls completed this morning"
                    secondary="Client follow-ups"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Stack spacing={1}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Message />}
              onClick={() => onAction('knock_door', room)}
            >
              Knock on Door
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Event />}
              onClick={() => onAction('book_time', room)}
            >
              Book Time
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<Description />}
              onClick={() => onAction('drop_document', room)}
            >
              Drop Document
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  // Render room content based on room ID
  const renderRoomContent = () => {
    switch (room.id) {
      case 'conferenceRoom':
        return renderConferenceRoom();
      case 'managerOffice':
        return renderManagerOffice();
      case 'clientLounge':
        return renderClientLounge();
      case 'leadLounge':
        return renderLeadLounge();
      case 'reception':
        return renderReception();
      case 'partnerOffice':
      case 'seniorOffice1':
      case 'seniorOffice2':
        return renderPrivateOffice();
      default:
        return <Typography>Room details coming soon...</Typography>;
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Business sx={{ color: 'primary.main' }} />
            <Typography variant="h5">{room.name}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 3 }}>
        {renderRoomContent()}
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Office3D component with room interactions
export const enhanceOffice3DWithRoomInteractions = (Office3DComponent) => {
  return ({ agents, selectedAgent, onAgentClick, currentFloor, clients, leads }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [highlightedRoom, setHighlightedRoom] = useState(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const originalCameraPosition = useRef(null);
    const roomMeshesRef = useRef({});
    const highlightLayerRef = useRef(null);
    
    // Room definitions matching your floor plan
    const rooms = [
      { id: 'conferenceRoom', name: 'Conference Room', position: { x: 32, z: -27.5 } },
      { id: 'managerOffice', name: "Manager's Office", position: { x: -40, z: 0 } },
      { id: 'clientLounge', name: 'Client Lounge', position: { x: -40, z: 27.5 } },
      { id: 'leadLounge', name: 'Lead Lounge', position: { x: 8, z: 27.5 } },
      { id: 'reception', name: 'Reception', position: { x: -55, z: 27.5 } },
      { id: 'partnerOffice', name: 'Partner Office', position: { x: -50, z: -27.5 } },
      { id: 'seniorOffice1', name: 'Senior Office 1', position: { x: -25, z: -27.5 } },
      { id: 'seniorOffice2', name: 'Senior Office 2', position: { x: 0, z: -27.5 } }
    ];

    // Initialize room click handlers
    const setupRoomInteractions = (scene, camera) => {
      sceneRef.current = scene;
      cameraRef.current = camera;
      
      // Create highlight layer
      highlightLayerRef.current = new BABYLON.HighlightLayer("roomHighlight", scene);
      highlightLayerRef.current.outerGlow = true;
      highlightLayerRef.current.innerGlow = false;
      highlightLayerRef.current.blurHorizontalSize = 1.5;
      highlightLayerRef.current.blurVerticalSize = 1.5;
      
      // Store original camera position
      originalCameraPosition.current = {
        alpha: camera.alpha,
        beta: camera.beta,
        radius: camera.radius,
        target: camera.target.clone()
      };
      
      // Add click handlers to room meshes
      rooms.forEach(room => {
        // Try to find the room by its ID
        const roomMesh = scene.getMeshByName(room.id);
        if (roomMesh) {
          roomMeshesRef.current[room.id] = roomMesh;
          
          // Make room clickable
          roomMesh.actionManager = new BABYLON.ActionManager(scene);
          roomMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
              BABYLON.ActionManager.OnPickTrigger,
              () => handleRoomClick(room)
            )
          );
          
          // Add hover effects
          roomMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
              BABYLON.ActionManager.OnPointerOverTrigger,
              () => handleRoomHover(room)
            )
          );
          
          roomMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
              BABYLON.ActionManager.OnPointerOutTrigger,
              () => handleRoomHoverOut(room)
            )
          );
        }
      });
    };

    const handleRoomClick = (room) => {
      if (selectedRoom?.id === room.id) {
        // Clicking same room deselects it
        deselectRoom();
      } else {
        selectRoom(room);
      }
    };

    const handleRoomHover = (room) => {
      if (!selectedRoom && highlightLayerRef.current) {
        const mesh = roomMeshesRef.current[room.id];
        if (mesh) {
          highlightLayerRef.current.addMesh(mesh, BABYLON.Color3.Yellow());
          setHighlightedRoom(room);
          
          // Change cursor
          document.body.style.cursor = 'pointer';
        }
      }
    };

    const handleRoomHoverOut = (room) => {
      if (!selectedRoom && highlightLayerRef.current) {
        const mesh = roomMeshesRef.current[room.id];
        if (mesh) {
          highlightLayerRef.current.removeMesh(mesh);
          setHighlightedRoom(null);
          
          // Reset cursor
          document.body.style.cursor = 'default';
        }
      }
    };

    const selectRoom = (room) => {
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      
      if (!camera || !scene) return;
      
      // Highlight the room
      if (highlightLayerRef.current) {
        // Remove previous highlights
        Object.values(roomMeshesRef.current).forEach(mesh => {
          highlightLayerRef.current.removeMesh(mesh);
        });
        
        // Add highlight to selected room
        const mesh = roomMeshesRef.current[room.id];
        if (mesh) {
          highlightLayerRef.current.addMesh(mesh, BABYLON.Color3.Green());
        }
      }
      
      // Animate camera to focus on room
      const targetPosition = new BABYLON.Vector3(room.position.x, 0, room.position.z);
      
      // Create smooth camera animations
      const animationAlpha = BABYLON.Animation.CreateAndStartAnimation(
        "cameraAlpha",
        camera,
        "alpha",
        30,
        24,
        camera.alpha,
        camera.alpha, // Keep same alpha
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      const animationBeta = BABYLON.Animation.CreateAndStartAnimation(
        "cameraBeta",
        camera,
        "beta",
        30,
        24,
        camera.beta,
        Math.PI / 3, // Slightly lower angle
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      const animationRadius = BABYLON.Animation.CreateAndStartAnimation(
        "cameraRadius",
        camera,
        "radius",
        30,
        24,
        camera.radius,
        50, // Zoom in closer
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      const animationTarget = BABYLON.Animation.CreateAndStartAnimation(
        "cameraTarget",
        camera,
        "target",
        30,
        24,
        camera.target,
        targetPosition,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      // Set selected room after animation starts
      setTimeout(() => {
        setSelectedRoom(room);
      }, 100);
    };

    const deselectRoom = () => {
      const camera = cameraRef.current;
      
      if (!camera || !originalCameraPosition.current) return;
      
      // Remove highlights
      if (highlightLayerRef.current) {
        Object.values(roomMeshesRef.current).forEach(mesh => {
          highlightLayerRef.current.removeMesh(mesh);
        });
      }
      
      // Animate camera back to original position
      const orig = originalCameraPosition.current;
      
      BABYLON.Animation.CreateAndStartAnimation(
        "cameraAlphaReset",
        camera,
        "alpha",
        30,
        24,
        camera.alpha,
        orig.alpha,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      BABYLON.Animation.CreateAndStartAnimation(
        "cameraBetaReset",
        camera,
        "beta",
        30,
        24,
        camera.beta,
        orig.beta,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      BABYLON.Animation.CreateAndStartAnimation(
        "cameraRadiusReset",
        camera,
        "radius",
        30,
        24,
        camera.radius,
        orig.radius,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      BABYLON.Animation.CreateAndStartAnimation(
        "cameraTargetReset",
        camera,
        "target",
        30,
        24,
        camera.target,
        orig.target,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        new BABYLON.CubicEase()
      );
      
      setSelectedRoom(null);
    };

    // Handle room actions
    const handleRoomAction = (action, room) => {
      console.log(`Action: ${action} for room: ${room.name}`);
      // Here you can implement actual actions like API calls, opening modals, etc.
      // For now, we'll just log the action
      
      switch(action) {
        case 'schedule_meeting':
          // Open meeting scheduler
          break;
        case 'start_video':
          // Start video call
          break;
        case 'order_refreshments':
          // Send order to kitchen/reception
          break;
        case 'capture_lead':
          // Open lead capture form
          break;
        // Add more cases as needed
      }
    };

    return (
      <Box position="relative">
        <Office3DComponent
          agents={agents}
          selectedAgent={selectedAgent}
          onAgentClick={onAgentClick}
          currentFloor={currentFloor}
          onSceneReady={setupRoomInteractions}
        />
        
        {selectedRoom && (
          <>
            <Backdrop
              open={true}
              sx={{ 
                zIndex: 1300, 
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}
              onClick={() => deselectRoom()}
            />
            <RoomDetailPanel
              room={selectedRoom}
              onClose={() => deselectRoom()}
              agents={agents}
              clients={clients}
              leads={leads}
              onAction={handleRoomAction}
            />
          </>
        )}
        
        {/* Room tooltip on hover */}
        {highlightedRoom && !selectedRoom && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              px: 2,
              py: 1,
              borderRadius: 1,
              boxShadow: 2,
              pointerEvents: 'none'
            }}
          >
            <Typography variant="body2">
              Click to view {highlightedRoom.name}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
};

// Export the enhancement function
export default enhanceOffice3DWithRoomInteractions;