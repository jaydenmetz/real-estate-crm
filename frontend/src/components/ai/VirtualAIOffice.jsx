import React, { useState, useEffect, useRef } from 'react';
import { safeFormatDate, getSafeTimestamp } from '../../utils/safeDateUtils';
import { 
  Container, Grid, Paper, Typography, Box, Card, CardContent, 
  Avatar, Badge, IconButton, Button, Chip, List, ListItem, 
  ListItemText, ListItemAvatar, Dialog, DialogTitle, DialogContent,
  Stack, ToggleButton, ToggleButtonGroup, Accordion, AccordionSummary,
  AccordionDetails, LinearProgress, Tabs, Tab, Divider, Tooltip,
  Fade, Zoom, Menu, MenuItem, Drawer, TextField, Checkbox, Alert
} from '@mui/material';
import {
  GridView, ViewList, Groups, Assignment, Speed, Schedule,
  TrendingUp, Assessment, Task, Business, Phone, VideoCall,
  ChatBubble, LocationOn, CheckCircle, Warning, AccessTime,
  AttachMoney, PeopleAlt, Description, Timeline, Analytics,
  Folder, MoreVert, Dashboard, Settings, Notifications,
  Electric, Star, EmojiEvents, Work, Coffee, PhoneInTalk,
  Computer, ExpandMore, ChevronRight, Close, Edit, Download,
  Add, Send, Delete, Search, FilterList, Upload, Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';
import Confetti from 'react-confetti';
import websocketService from '../../services/websocket';

// Mini Chart Component
const MiniChart = ({ data, color = 'primary' }) => {
  const max = Math.max(...data);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 48 }}>
      {data.map((value, idx) => (
        <Box
          key={idx}
          sx={{
            flex: 1,
            bgcolor: `${color}.main`,
            borderRadius: '4px 4px 0 0',
            height: `${(value / max) * 100}%`,
            minHeight: 4
          }}
        />
      ))}
    </Box>
  );
};

// Activity Timeline Component
const ActivityTimeline = ({ activities }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ 
        position: 'absolute', 
        left: 16, 
        top: 0, 
        bottom: 0, 
        width: 2, 
        bgcolor: 'grey.300' 
      }} />
      {activities.map((activity, idx) => (
        <Box key={idx} sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{
            position: 'absolute',
            left: 12,
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: activity.type === 'success' ? 'success.main' : 
                    activity.type === 'warning' ? 'warning.main' : 'info.main'
          }} />
          <Box sx={{ ml: 4 }}>
            <Typography variant="body2" fontWeight="medium">{activity.title}</Typography>
            <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// 3D Office Layout Component
const OfficeWorkspace = ({ agents, onAgentClick, onAgentDrop, onRoomClick }) => {
  const [hoveredArea, setHoveredArea] = useState(null);
  const [agentLocations, setAgentLocations] = useState({});
  const [draggedAgent, setDraggedAgent] = useState(null);
  const [animatingAgents, setAnimatingAgents] = useState({});
  const officeRef = useRef(null);

  // Office areas with enhanced properties
  const officeAreas = [
    { id: 'reception', x: 10, y: 10, width: 180, height: 100, name: 'Reception', icon: Business, color: 'primary.light', capacity: 2 },
    { id: 'privateOffices', x: 200, y: 10, width: 200, height: 180, name: 'Private Offices', icon: Work, color: 'secondary.light', capacity: 4 },
    { id: 'conferenceRoom', x: 10, y: 120, width: 180, height: 120, name: 'Conference Room', icon: Groups, color: 'success.light', capacity: 8 },
    { id: 'openWorkspace', x: 200, y: 200, width: 200, height: 150, name: 'Open Workspace', icon: Computer, color: 'warning.light', capacity: 10 },
    { id: 'breakRoom', x: 10, y: 250, width: 180, height: 100, name: 'Break Room', icon: Coffee, color: 'info.light', capacity: 4 },
    { id: 'phoneBooths', x: 410, y: 10, width: 80, height: 340, name: 'Phone Booths', icon: PhoneInTalk, color: 'error.light', capacity: 3 }
  ];

  // Smart agent positioning with animations
  useEffect(() => {
    const locations = {};
    const animations = {};
    
    agents.forEach(agent => {
      const newLocation = getAgentLocation(agent);
      const oldLocation = agentLocations[agent.id];
      
      if (oldLocation && oldLocation !== newLocation) {
        animations[agent.id] = {
          from: oldLocation,
          to: newLocation,
          progress: 0
        };
      }
      
      locations[agent.id] = newLocation;
    });
    
    setAgentLocations(locations);
    setAnimatingAgents(animations);
  }, [agents]);

  // Animate agent movements
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatingAgents(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(agentId => {
          updated[agentId].progress += 0.1;
          if (updated[agentId].progress >= 1) {
            delete updated[agentId];
          }
        });
        return updated;
      });
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  const getAgentLocation = (agent) => {
    if (agent.currentTask?.includes('call') || agent.currentTask?.includes('phone')) {
      return 'phoneBooths';
    } else if (agent.currentTask?.includes('meeting') || agent.currentTask?.includes('consultation')) {
      return 'conferenceRoom';
    } else if (agent.role === 'executive' || agent.role === 'manager') {
      return 'privateOffices';
    } else if (agent.status === 'break') {
      return 'breakRoom';
    } else {
      return 'openWorkspace';
    }
  };

  const getAgentsInArea = (areaId) => {
    return agents.filter(agent => agentLocations[agent.id] === areaId);
  };

  const handleDragStart = (e, agent) => {
    setDraggedAgent(agent);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, areaId) => {
    e.preventDefault();
    if (draggedAgent && onAgentDrop) {
      onAgentDrop(draggedAgent, areaId);
    }
    setDraggedAgent(null);
  };

  const getAgentPosition = (agent, area) => {
    const agentsInArea = getAgentsInArea(area.id);
    const index = agentsInArea.findIndex(a => a.id === agent.id);
    const cols = Math.ceil(Math.sqrt(agentsInArea.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      x: area.x + 10 + col * 35,
      y: area.y + 30 + row * 35
    };
  };

  return (
    <Box
      ref={officeRef}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 800,
        height: 400,
        bgcolor: 'grey.100',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden',
        p: 2,
        background: 'linear-gradient(45deg, #e3f2fd 30%, #f3e5f5 90%)',
        perspective: '1000px'
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        transformStyle: 'preserve-3d',
        transform: 'rotateX(10deg)'
      }}>
        {/* Office Floor Plan */}
        {officeAreas.map((area) => {
          const agentsInArea = getAgentsInArea(area.id);
          const isHovered = hoveredArea === area.id;
          const Icon = area.icon;
          const isFull = agentsInArea.length >= area.capacity;
          
          return (
            <Paper
              key={area.id}
              onMouseEnter={() => setHoveredArea(area.id)}
              onMouseLeave={() => setHoveredArea(null)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, area.id)}
              onClick={() => onRoomClick && onRoomClick(area)}
              elevation={isHovered ? 8 : 2}
              sx={{
                position: 'absolute',
                left: area.x,
                top: area.y,
                width: area.width,
                height: area.height,
                bgcolor: area.color,
                border: 2,
                borderColor: isHovered ? 'primary.main' : 'divider',
                borderStyle: draggedAgent && !isFull ? 'dashed' : 'solid',
                borderRadius: 2,
                p: 1,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateZ(20px) scale(1.02)' : 'translateZ(0) scale(1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Icon sx={{ mr: 0.5, fontSize: 16 }} />
                  <Typography variant="caption" fontWeight="bold">{area.name}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {agentsInArea.length}/{area.capacity}
                </Typography>
              </Box>
              
              {/* Meeting indicator */}
              {area.id === 'conferenceRoom' && agentsInArea.length > 1 && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 4, 
                  right: 4, 
                  width: 8, 
                  height: 8, 
                  bgcolor: 'error.main', 
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
              )}
              
              {/* Agent Avatars with animation */}
              <Box sx={{ position: 'relative', flex: 1 }}>
                {agentsInArea.map((agent) => {
                  const position = getAgentPosition(agent, area);
                  const animation = animatingAgents[agent.id];
                  
                  let displayX = position.x - area.x;
                  let displayY = position.y - area.y;
                  
                  if (animation) {
                    const fromArea = officeAreas.find(a => a.id === animation.from);
                    const fromPos = getAgentPosition(agent, fromArea);
                    displayX = (fromPos.x - fromArea.x) + (displayX - (fromPos.x - fromArea.x)) * animation.progress;
                    displayY = (fromPos.y - fromArea.y) + (displayY - (fromPos.y - fromArea.y)) * animation.progress;
                  }
                  
                  return (
                    <Avatar
                      key={agent.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, agent)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAgentClick(agent);
                      }}
                      sx={{
                        position: 'absolute',
                        left: displayX,
                        top: displayY,
                        width: 32,
                        height: 32,
                        bgcolor: agent.status === 'working' ? 'success.main' : 'grey.500',
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: animation ? 'none' : 'all 0.3s ease',
                        animation: agent.status === 'working' ? 'pulse 2s infinite' : 'none',
                        '&:hover': { transform: 'scale(1.1)' },
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                          '70%': { boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                        }
                      }}
                      title={agent.name}
                    >
                      {agent.icon}
                      {agent.hasNotification && (
                        <Box sx={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 12,
                          height: 12,
                          bgcolor: 'error.main',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite'
                        }} />
                      )}
                    </Avatar>
                  );
                })}
              </Box>
              
              {agentsInArea.length === 0 && (
                <Typography variant="caption" color="text.secondary" align="center">
                  Drop agents here
                </Typography>
              )}
            </Paper>
          );
        })}
        
        {/* Active paths between rooms */}
        {Object.entries(animatingAgents).map(([agentId, animation]) => {
          const fromArea = officeAreas.find(a => a.id === animation.from);
          const toArea = officeAreas.find(a => a.id === animation.to);
          if (!fromArea || !toArea) return null;
          
          const x1 = fromArea.x + fromArea.width / 2;
          const y1 = fromArea.y + fromArea.height / 2;
          const x2 = toArea.x + toArea.width / 2;
          const y2 = toArea.y + toArea.height / 2;
          
          return (
            <svg
              key={agentId}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <line
                x1={x1}
                y1={y1}
                x2={x1 + (x2 - x1) * animation.progress}
                y2={y1 + (y2 - y1) * animation.progress}
                stroke="#2196F3"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity={0.5}
              />
            </svg>
          );
        })}
      </Box>
      
      {/* Office Legend */}
      <Paper sx={{ 
        position: 'absolute', 
        bottom: 8, 
        right: 8, 
        p: 1,
        bgcolor: 'rgba(255,255,255,0.9)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          <Typography variant="caption">Active</Typography>
          <Box sx={{ width: 12, height: 12, bgcolor: 'grey.500', borderRadius: '50%', ml: 1 }} />
          <Typography variant="caption">Available</Typography>
          <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%', ml: 1 }} />
          <Typography variant="caption">Meeting</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

// Enhanced Database Item Detail Page
const DatabaseItemPage = ({ type, item, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [checklistItems, setChecklistItems] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // Tom Ferry Best Practice Checklists
  const getChecklist = () => {
    const checklists = {
      escrow: [
        { id: 'purchase_agreement_signed', label: 'Purchase Agreement Signed', category: 'Documents' },
        { id: 'emd_received', label: 'Earnest Money Deposit Received', category: 'Financial' },
        { id: 'home_inspection_ordered', label: 'Home Inspection Ordered', category: 'Inspections' },
        { id: 'appraisal_ordered', label: 'Appraisal Ordered', category: 'Lender' },
        { id: 'title_ordered', label: 'Title Report Ordered', category: 'Title' },
        { id: 'disclosures_delivered', label: 'All Disclosures Delivered', category: 'Documents' },
        { id: 'loan_application_complete', label: 'Loan Application Complete', category: 'Lender' },
        { id: 'contingencies_removed', label: 'All Contingencies Removed', category: 'Timeline' },
        { id: 'clear_to_close', label: 'Clear to Close Received', category: 'Lender' },
        { id: 'final_walkthrough', label: 'Final Walkthrough Scheduled', category: 'Closing' },
        { id: 'utilities_transferred', label: 'Utilities Transfer Arranged', category: 'Closing' },
        { id: 'closing_docs_signed', label: 'Closing Documents Signed', category: 'Closing' }
      ],
      listing: [
        { id: 'listing_agreement_signed', label: 'Listing Agreement Signed', category: 'Documents' },
        { id: 'property_photos_taken', label: 'Professional Photos Taken', category: 'Marketing' },
        { id: 'virtual_tour_created', label: 'Virtual Tour Created', category: 'Marketing' },
        { id: 'mls_listing_active', label: 'MLS Listing Active', category: 'Marketing' },
        { id: 'sign_installed', label: 'For Sale Sign Installed', category: 'Marketing' },
        { id: 'social_media_posted', label: 'Social Media Campaign Live', category: 'Marketing' },
        { id: 'email_blast_sent', label: 'Email Blast to Database', category: 'Marketing' },
        { id: 'open_house_scheduled', label: 'Open House Scheduled', category: 'Showings' },
        { id: 'feedback_system_active', label: 'Showing Feedback System Active', category: 'Showings' },
        { id: 'weekly_seller_update', label: 'Weekly Seller Updates Active', category: 'Communication' },
        { id: 'price_review_30days', label: '30-Day Price Review Scheduled', category: 'Strategy' }
      ],
      client: [
        { id: 'contact_info_complete', label: 'Contact Information Complete', category: 'Profile' },
        { id: 'buyer_consultation_done', label: 'Buyer Consultation Completed', category: 'Process' },
        { id: 'needs_assessment_done', label: 'Needs Assessment Completed', category: 'Process' },
        { id: 'financing_verified', label: 'Financing Pre-Approval Verified', category: 'Financial' },
        { id: 'property_criteria_defined', label: 'Property Criteria Defined', category: 'Preferences' },
        { id: 'auto_search_setup', label: 'Auto Property Search Setup', category: 'Technology' },
        { id: 'communication_pref_set', label: 'Communication Preferences Set', category: 'Profile' },
        { id: 'added_to_newsletter', label: 'Added to Newsletter List', category: 'Marketing' },
        { id: 'birthday_recorded', label: 'Birthday/Anniversary Recorded', category: 'Relationship' },
        { id: 'social_media_connected', label: 'Connected on Social Media', category: 'Relationship' }
      ],
      appointment: [
        { id: 'client_confirmed', label: 'Client Confirmation Received', category: 'Preparation' },
        { id: 'location_confirmed', label: 'Location/Access Confirmed', category: 'Preparation' },
        { id: 'agenda_sent', label: 'Agenda Sent to Client', category: 'Preparation' },
        { id: 'materials_prepared', label: 'Materials/Comps Prepared', category: 'Preparation' },
        { id: 'reminder_sent_24hr', label: '24-Hour Reminder Sent', category: 'Communication' },
        { id: 'reminder_sent_2hr', label: '2-Hour Reminder Sent', category: 'Communication' },
        { id: 'followup_scheduled', label: 'Follow-up Task Scheduled', category: 'Post-Meeting' }
      ],
      lead: [
        { id: 'initial_contact_made', label: 'Initial Contact Made (5 min)', category: 'Response' },
        { id: 'needs_assessed', label: 'Needs Assessment Complete', category: 'Qualification' },
        { id: 'timeline_identified', label: 'Timeline Identified', category: 'Qualification' },
        { id: 'motivation_scored', label: 'Motivation Level Scored', category: 'Qualification' },
        { id: 'added_to_database', label: 'Added to Database', category: 'Systems' },
        { id: 'drip_campaign_started', label: '8x8 Campaign Started', category: 'Follow-up' },
        { id: 'value_video_sent', label: 'Value Video/Content Sent', category: 'Nurture' },
        { id: 'consultation_offered', label: 'Consultation Offered', category: 'Conversion' }
      ]
    };
    return checklists[type] || [];
  };

  const checklist = getChecklist();
  const completedCount = Object.values(checklistItems).filter(v => v).length;
  const progress = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  const handleChecklistToggle = (itemId) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        id: Date.now(),
        text: newNote,
        timestamp: safeFormatDate(getSafeTimestamp(), 'MM/dd/yyyy HH:mm:ss'),
        author: 'You'
      }]);
      setNewNote('');
    }
  };

  // Group checklist items by category
  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Mock analytics data
  const analyticsData = {
    dailyViews: [12, 15, 8, 22, 18, 25, 30],
    leadSources: [
      { name: 'Zillow', value: 35 },
      { name: 'Website', value: 25 },
      { name: 'Referral', value: 20 },
      { name: 'Social', value: 20 }
    ],
    activityTimeline: [
      { title: 'Property viewed online', time: '2 hours ago', type: 'info' },
      { title: 'Email sent to client', time: '5 hours ago', type: 'success' },
      { title: 'Price adjustment', time: 'Yesterday', type: 'warning' },
      { title: 'Listed on MLS', time: '3 days ago', type: 'success' }
    ]
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {type === 'escrow' && '🏠 Escrow Details'}
            {type === 'listing' && '📋 Listing Details'}
            {type === 'client' && '👤 Client Profile'}
            {type === 'appointment' && '📅 Appointment Details'}
            {type === 'lead' && '🎯 Lead Details'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={item.status} 
              color={item.status === 'Active' || item.status === 'Scheduled' ? 'success' : 'default'}
            />
            <IconButton size="small"><Edit /></IconButton>
            <IconButton size="small"><Download /></IconButton>
            <IconButton onClick={onClose} size="small"><Close /></IconButton>
          </Box>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
        <Typography variant="caption" color="text.secondary">
          {completedCount} of {checklist.length} tasks completed ({Math.round(progress)}%)
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Checklist" />
          <Tab label="People" />
          <Tab label="Timeline" />
          <Tab label="Analytics" />
          <Tab label="Documents" />
          <Tab label="Notes" />
        </Tabs>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" />
                  Key Information
                </Typography>
                {type === 'escrow' && (
                  <Stack spacing={1}>
                    <Typography><strong>Property:</strong> {item.address}</Typography>
                    <Typography><strong>Price:</strong> ${item.price?.toLocaleString()}</Typography>
                    <Typography><strong>Closing Date:</strong> {item.closingDate}</Typography>
                    <Typography><strong>Escrow #:</strong> {item.escrowNumber}</Typography>
                  </Stack>
                )}
                {type === 'listing' && (
                  <Stack spacing={1}>
                    <Typography><strong>Address:</strong> {item.address}</Typography>
                    <Typography><strong>List Price:</strong> ${item.price?.toLocaleString()}</Typography>
                    <Typography><strong>Days on Market:</strong> {item.daysOnMarket}</Typography>
                    <Typography><strong>MLS #:</strong> {item.mlsNumber}</Typography>
                  </Stack>
                )}
                {type === 'client' && (
                  <Stack spacing={1}>
                    <Typography><strong>Name:</strong> {item.name}</Typography>
                    <Typography><strong>Email:</strong> {item.email}</Typography>
                    <Typography><strong>Phone:</strong> {item.phone}</Typography>
                    <Typography><strong>Type:</strong> {item.clientType}</Typography>
                  </Stack>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="success" />
                  Quick Stats
                </Typography>
                <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                  <Grid item xs={4}>
                    <Typography variant="h4" color="primary">{completedCount}</Typography>
                    <Typography variant="caption">Tasks Done</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h4" color="warning.main">{checklist.length - completedCount}</Typography>
                    <Typography variant="caption">Remaining</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h4" color="success.main">{Math.round(progress)}%</Typography>
                    <Typography variant="caption">Complete</Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>Activity (7 days)</Typography>
                  <MiniChart data={analyticsData.dailyViews} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Checklist Tab */}
        {activeTab === 1 && (
          <Box>
            {Object.entries(groupedChecklist).map(([category, items]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {category}
                </Typography>
                <Stack spacing={1}>
                  {items.map((item) => (
                    <Paper key={item.id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={checklistItems[item.id] || false}
                          onChange={() => handleChecklistToggle(item.id)}
                        />
                        <Typography 
                          sx={{ 
                            flex: 1,
                            textDecoration: checklistItems[item.id] ? 'line-through' : 'none',
                            color: checklistItems[item.id] ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {item.label}
                        </Typography>
                        {checklistItems[item.id] && (
                          <CheckCircle color="success" />
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            ))}
            <Button 
              startIcon={<Add />} 
              variant="outlined" 
              sx={{ mt: 2 }}
            >
              Add Custom Checklist Item
            </Button>
          </Box>
        )}

        {/* People Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleAlt color="primary" />
                  Primary Contacts
                </Typography>
                <List>
                  {[
                    { name: 'John Doe', role: 'Buyer', avatar: 'JD' },
                    { name: 'Jane Smith', role: 'Seller', avatar: 'JS' }
                  ].map((contact, idx) => (
                    <ListItem key={idx}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: idx === 0 ? 'primary.main' : 'secondary.main' }}>
                          {contact.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={contact.name} secondary={contact.role} />
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small"><Phone /></IconButton>
                        <IconButton size="small"><ChatBubble /></IconButton>
                        <IconButton size="small"><VideoCall /></IconButton>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business color="success" />
                  Service Providers
                </Typography>
                <List>
                  {[
                    { name: 'ABC Escrow', type: 'Escrow Company' },
                    { name: 'XYZ Home Loans', type: 'Lender' },
                    { name: 'Pro Inspect', type: 'Home Inspector' }
                  ].map((provider, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={provider.name} secondary={provider.type} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Timeline Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="primary" />
                  Important Dates
                </Typography>
                <List>
                  {[
                    { label: 'Contract Acceptance', date: 'January 5, 2025', icon: AccessTime },
                    { label: 'Inspection Deadline', date: 'January 12, 2025', icon: Warning, urgent: true },
                    { label: 'Loan Contingency', date: 'January 20, 2025', icon: AccessTime },
                    { label: 'Closing Date', date: 'February 5, 2025', icon: CheckCircle }
                  ].map((event, idx) => {
                    const Icon = event.icon;
                    return (
                      <ListItem key={idx} sx={{ borderLeft: event.urgent ? 4 : 0, borderColor: 'warning.main' }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: event.urgent ? 'warning.light' : 'grey.200' }}>
                            <Icon color={event.urgent ? 'warning' : 'action'} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={event.label} secondary={event.date} />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline color="success" />
                  Recent Activity
                </Typography>
                <ActivityTimeline activities={analyticsData.activityTimeline} />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Analytics Tab */}
        {activeTab === 4 && (
          <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: 40 }} />
                    <Typography variant="h4">${(item.commission || 15000).toLocaleString()}</Typography>
                    <Typography>Est. Commission</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Timeline sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{item.daysActive || 15} Days</Typography>
                    <Typography>Time Active</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Electric sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{Math.round(progress)}%</Typography>
                    <Typography>Completion Rate</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Star sx={{ fontSize: 40 }} />
                    <Typography variant="h4">92%</Typography>
                    <Typography>Client Satisfaction</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Lead Sources</Typography>
              <Grid container spacing={3}>
                {analyticsData.leadSources.map((source, idx) => (
                  <Grid item xs={6} md={3} key={idx}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{source.value}%</Typography>
                      <Typography variant="body2" color="text.secondary">{source.name}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Documents Tab */}
        {activeTab === 5 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Documents</Typography>
              <Button startIcon={<Upload />} variant="contained">
                Upload Document
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {[
                { name: 'Purchase Agreement.pdf', size: '2.4 MB', date: '3 days ago' },
                { name: 'Pre-Approval Letter.pdf', size: '156 KB', date: '1 week ago' },
                { name: 'Property Photos.zip', size: '45 MB', date: '2 days ago' },
                { name: 'Inspection Report.pdf', size: '8.2 MB', date: '5 days ago' }
              ].map((doc, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Description sx={{ fontSize: 40, color: 'primary.main' }} />
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">{doc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.size} • {doc.date}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button size="small">View</Button>
                      <Button size="small">Download</Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Notes Tab */}
        {activeTab === 6 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <Button 
                variant="contained" 
                onClick={handleAddNote}
                sx={{ minWidth: 'auto' }}
              >
                <Send />
              </Button>
            </Box>
            
            <Stack spacing={2}>
              {notes.map((note) => (
                <Paper key={note.id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{note.author}</Typography>
                      <Typography variant="caption" color="text.secondary">{note.timestamp}</Typography>
                    </Box>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>{note.text}</Typography>
                </Paper>
              ))}
              
              {notes.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No notes yet. Add one above!</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Additional Database Pages Component
const OtherDataPage = ({ type, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const getDataForType = () => {
    const mockData = {
      documents: [
        { id: 1, name: 'Purchase Agreement - 123 Main St', date: '2025-01-05', size: '2.4 MB', type: 'Contract' },
        { id: 2, name: 'Listing Photos - 456 Oak Ave', date: '2025-01-04', size: '45 MB', type: 'Media' },
        { id: 3, name: 'Inspection Report - 789 Pine Rd', date: '2025-01-03', size: '8.2 MB', type: 'Report' }
      ],
      communications: [
        { id: 1, type: 'Email', subject: 'Offer Accepted!', to: 'John Doe', date: '2025-01-05 14:23', status: 'Sent' },
        { id: 2, type: 'SMS', subject: 'Showing Confirmation', to: 'Jane Smith', date: '2025-01-05 10:15', status: 'Delivered' },
        { id: 3, type: 'Call', subject: 'Follow-up Discussion', to: 'Bob Johnson', date: '2025-01-04 16:45', status: 'Completed' }
      ],
      aiActivities: [
        { id: 1, agent: 'Alex', action: 'Sent daily briefing', timestamp: '2025-01-05 07:00', tokens: 1250 },
        { id: 2, agent: 'Lead Qualifier', action: 'Qualified new lead', timestamp: '2025-01-05 09:30', tokens: 450 },
        { id: 3, agent: 'Market Analyst', action: 'Generated CMA report', timestamp: '2025-01-05 11:00', tokens: 2100 }
      ],
      webhooks: [
        { id: 1, url: 'https://api.company.com/webhook', events: ['escrow.created', 'escrow.updated'], status: 'Active', lastTriggered: '2025-01-05 13:00' },
        { id: 2, url: 'https://zapier.com/hooks/123', events: ['listing.sold'], status: 'Active', lastTriggered: '2025-01-04 15:30' }
      ]
    };
    
    return mockData[type] || [];
  };
  
  const data = getDataForType();
  const filteredData = data.filter(item => {
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {type === 'documents' && '📄 Documents'}
            {type === 'communications' && '💬 Communications'}
            {type === 'aiActivities' && '🤖 AI Activities'}
            {type === 'webhooks' && '🔗 Webhooks'}
            {type === 'notes' && '📝 Notes'}
            {type === 'priceHistory' && '📈 Price History'}
            {type === 'deletionRequests' && '🗑️ Deletion Requests'}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Search and Filter Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button variant="outlined" startIcon={<FilterList />}>
            Filter
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            Add New
          </Button>
        </Box>
        
        {/* Data Display */}
        <Paper>
          {type === 'documents' && (
            <List>
              {filteredData.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <Description />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.type} • ${item.size} • ${item.date}`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button size="small">View</Button>
                    <Button size="small">Download</Button>
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
          
          {type === 'communications' && (
            <List>
              {filteredData.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.light' }}>
                      {item.type === 'Email' ? '@' : item.type === 'SMS' ? 'T' : 'C'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.subject}
                    secondary={`To: ${item.to} • ${item.date}`}
                  />
                  <Chip 
                    label={item.status} 
                    color={item.status === 'Sent' || item.status === 'Delivered' ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          {type === 'aiActivities' && (
            <List>
              {filteredData.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      🤖
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.agent}: ${item.action}`}
                    secondary={item.timestamp}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.tokens.toLocaleString()} tokens
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

// Main VirtualAIOffice Component
const VirtualAIOffice = () => {
  const [viewMode, setViewMode] = useState('workspace');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedDatabaseItem, setSelectedDatabaseItem] = useState(null);
  const [selectedOtherData, setSelectedOtherData] = useState(null);
  const [otherDataMenuAnchor, setOtherDataMenuAnchor] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // Initialize agents state
  const [agents, setAgents] = useState({
    alex_executive: {
      id: 'alex_executive',
      name: 'Alex - Executive Assistant',
      role: 'executive',
      department: 'management',
      icon: '👔',
      image: '/avatars/alex.png',
      status: 'working',
      currentTask: 'Preparing daily briefing',
      hasNotification: true,
      apiEndpoint: '/api/v1/ai/alex',
      metrics: {
        tasksToday: 23,
        avgResponseTime: '2.3s',
        efficiency: '98%',
        lastActive: 'Active now'
      }
    },
    buyer_manager: {
      id: 'buyer_manager',
      name: 'Buyer Manager',
      role: 'manager',
      department: 'buyer',
      icon: '🏡',
      status: 'working',
      currentTask: 'Reviewing lead pipeline',
      apiEndpoint: '/api/v1/ai/buyer-manager',
      metrics: {
        tasksToday: 15,
        avgResponseTime: '3.1s',
        efficiency: '95%',
        lastActive: '2 min ago'
      }
    },
    listing_manager: {
      id: 'listing_manager',
      name: 'Listing Manager',
      role: 'manager',
      department: 'listing',
      icon: '📋',
      status: 'working',
      currentTask: 'Market analysis review',
      apiEndpoint: '/api/v1/ai/listing-manager',
      metrics: {
        tasksToday: 18,
        avgResponseTime: '2.8s',
        efficiency: '96%',
        lastActive: '5 min ago'
      }
    },
    ops_manager: {
      id: 'ops_manager',
      name: 'Operations Manager',
      role: 'manager',
      department: 'operations',
      icon: '⚙️',
      status: 'available',
      currentTask: null,
      apiEndpoint: '/api/v1/ai/ops-manager',
      metrics: {
        tasksToday: 12,
        avgResponseTime: '2.5s',
        efficiency: '97%',
        lastActive: '10 min ago'
      }
    },
    buyer_qualifier: {
      id: 'buyer_qualifier',
      name: 'Buyer Lead Qualifier',
      role: 'agent',
      department: 'buyer',
      icon: '📞',
      status: 'working',
      currentTask: 'Qualifying new lead: Sarah J.',
      apiEndpoint: '/api/v1/ai/buyer-qualifier',
      metrics: {
        tasksToday: 28,
        avgResponseTime: '1.8s',
        efficiency: '94%',
        lastActive: 'Active now'
      }
    },
    buyer_nurture: {
      id: 'buyer_nurture',
      name: 'Buyer Nurture Specialist',
      role: 'agent',
      department: 'buyer',
      icon: '💌',
      status: 'working',
      currentTask: 'Sending follow-up emails',
      apiEndpoint: '/api/v1/ai/buyer-nurture',
      metrics: {
        tasksToday: 45,
        avgResponseTime: '2.1s',
        efficiency: '93%',
        lastActive: '1 min ago'
      }
    },
    showing_coord: {
      id: 'showing_coord',
      name: 'Showing Coordinator',
      role: 'agent',
      department: 'buyer',
      icon: '🗓️',
      status: 'working',
      currentTask: 'Scheduling property tours',
      apiEndpoint: '/api/v1/ai/showing-coord',
      metrics: {
        tasksToday: 22,
        avgResponseTime: '2.4s',
        efficiency: '95%',
        lastActive: '3 min ago'
      }
    },
    listing_launch: {
      id: 'listing_launch',
      name: 'Listing Launch Specialist',
      role: 'agent',
      department: 'listing',
      icon: '🚀',
      status: 'available',
      currentTask: null,
      apiEndpoint: '/api/v1/ai/listing-launch',
      metrics: {
        tasksToday: 8,
        avgResponseTime: '3.2s',
        efficiency: '96%',
        lastActive: '15 min ago'
      }
    },
    market_analyst: {
      id: 'market_analyst',
      name: 'Market Analyst',
      role: 'agent',
      department: 'listing',
      icon: '📊',
      status: 'working',
      currentTask: 'CMA for 123 Main St',
      apiEndpoint: '/api/v1/ai/market-analyst',
      metrics: {
        tasksToday: 14,
        avgResponseTime: '4.1s',
        efficiency: '92%',
        lastActive: 'Active now'
      }
    },
    listing_marketing: {
      id: 'listing_marketing',
      name: 'Listing Marketing Agent',
      role: 'agent',
      department: 'listing',
      icon: '📣',
      status: 'working',
      currentTask: 'Creating social media campaign',
      apiEndpoint: '/api/v1/ai/listing-marketing',
      metrics: {
        tasksToday: 32,
        avgResponseTime: '2.7s',
        efficiency: '94%',
        lastActive: '2 min ago'
      }
    },
    transaction_coord: {
      id: 'transaction_coord',
      name: 'Transaction Coordinator',
      role: 'agent',
      department: 'operations',
      icon: '📄',
      status: 'working',
      currentTask: 'Processing escrow docs',
      apiEndpoint: '/api/v1/ai/transaction-coord',
      metrics: {
        tasksToday: 19,
        avgResponseTime: '2.2s',
        efficiency: '97%',
        lastActive: 'Active now'
      }
    },
    compliance_officer: {
      id: 'compliance_officer',
      name: 'Compliance Officer',
      role: 'agent',
      department: 'operations',
      icon: '⚖️',
      status: 'available',
      currentTask: null,
      apiEndpoint: '/api/v1/ai/compliance',
      metrics: {
        tasksToday: 11,
        avgResponseTime: '3.5s',
        efficiency: '99%',
        lastActive: '20 min ago'
      }
    }
  });

  // Calculate team stats
  const teamStats = {
    activeAgents: Object.values(agents).filter(a => a.status === 'working').length,
    totalTasks: Object.values(agents).reduce((sum, agent) => sum + agent.metrics.tasksToday, 0),
    efficiency: Math.round(
      Object.values(agents).reduce((sum, agent) => sum + parseInt(agent.metrics.efficiency), 0) / 
      Object.values(agents).length
    ),
    avgResponseTime: Math.round(
      Object.values(agents).reduce((sum, agent) => sum + parseFloat(agent.metrics.avgResponseTime), 0) / 
      Object.values(agents).length * 10
    ) / 10
  };

  // Mock database items
  const mockDatabaseItems = {
    escrows: [
      { id: 1, type: 'escrow', address: '123 Main St, Citrus Heights', price: 450000, status: 'Active', closingDate: '02/05/2025', escrowNumber: 'ESC-2025-001', daysActive: 15, commission: 13500 },
      { id: 2, type: 'escrow', address: '789 Pine Rd, Sacramento', price: 525000, status: 'Active', closingDate: '02/15/2025', escrowNumber: 'ESC-2025-002', daysActive: 8, commission: 15750 }
    ],
    listings: [
      { id: 1, type: 'listing', address: '456 Oak Ave, Sacramento', price: 599000, status: 'Active', daysOnMarket: 12, mlsNumber: 'MLS-2025-123' },
      { id: 2, type: 'listing', address: '321 Elm St, Roseville', price: 725000, status: 'Active', daysOnMarket: 5, mlsNumber: 'MLS-2025-124' }
    ],
    clients: [
      { id: 1, type: 'client', name: 'John & Jane Doe', email: 'doe@email.com', phone: '(555) 123-4567', clientType: 'Buyer', status: 'Active' },
      { id: 2, type: 'client', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '(555) 987-6543', clientType: 'Seller', status: 'Active' }
    ],
    appointments: [
      { id: 1, type: 'appointment', title: 'Buyer Consultation - Smith Family', date: '01/08/2025', time: '2:00 PM', status: 'Scheduled' },
      { id: 2, type: 'appointment', title: 'Property Showing - 456 Oak Ave', date: '01/09/2025', time: '10:00 AM', status: 'Scheduled' }
    ],
    leads: [
      { id: 1, type: 'lead', name: 'Sarah Johnson', source: 'Zillow', status: 'New', temperature: 'Hot', email: 'sarah@email.com' },
      { id: 2, type: 'lead', name: 'Mike Wilson', source: 'Website', status: 'Contacted', temperature: 'Warm', email: 'mike@email.com' }
    ]
  };

  // Other data types
  const otherDataTypes = [
    { name: 'documents', label: 'Documents', icon: Description, count: 147 },
    { name: 'communications', label: 'Communications', icon: ChatBubble, count: 892 },
    { name: 'notes', label: 'Notes', icon: Assignment, count: 234 },
    { name: 'aiActivities', label: 'AI Activities', icon: Analytics, count: 12847 },
    { name: 'priceHistory', label: 'Price History', icon: Timeline, count: 89 },
    { name: 'webhooks', label: 'Webhooks', icon: Notifications, count: 8 },
    { name: 'deletionRequests', label: 'Deletion Requests', icon: Folder, count: 3 }
  ];

  // WebSocket connection
  useEffect(() => {
    websocketService.connect();
    
    websocketService.on('agent_update', (data) => {
      setAgents(prev => ({
        ...prev,
        [data.agentId]: {
          ...prev[data.agentId],
          ...data.updates
        }
      }));
    });

    websocketService.on('activity', (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 50));
    });

    websocketService.on('achievement', (achievement) => {
      setAchievements(prev => [achievement, ...prev]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleAgentDrop = (agent, areaId) => {
    // Update agent's task based on the area they're dropped in
    const updatedAgent = { ...agent };
    
    if (areaId === 'conferenceRoom') {
      updatedAgent.currentTask = 'In team meeting';
    } else if (areaId === 'phoneBooths') {
      updatedAgent.currentTask = 'On client call';
    } else if (areaId === 'breakRoom') {
      updatedAgent.status = 'break';
      updatedAgent.currentTask = null;
    } else {
      updatedAgent.status = 'working';
    }
    
    setAgents(prev => ({
      ...prev,
      [agent.id]: updatedAgent
    }));
    
    // Send update to backend
    websocketService.sendToAgent(agent.id, {
      command: 'move_to',
      location: areaId
    });
  };

  const handleRoomClick = (room) => {
    // Handle room click events (e.g., schedule meeting in conference room)
    console.log('Room clicked:', room);
  };

  // Convert agents object to array for workspace
  const agentsArray = Object.values(agents);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Header */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                🏢 Virtual AI Office
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Your AI team workspace - {teamStats.activeAgents} agents online
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, value) => value && setViewMode(value)}
                aria-label="view mode"
              >
                <ToggleButton value="workspace" aria-label="workspace view">
                  <GridView sx={{ mr: 1 }} />
                  Workspace
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewList sx={{ mr: 1 }} />
                  List View
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
              
              <Button
                variant="outlined"
                onClick={(e) => setOtherDataMenuAnchor(e.currentTarget)}
                endIcon={<ExpandMore />}
              >
                Other Data
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Team Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Groups sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{teamStats.activeAgents}/12</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">{teamStats.totalTasks}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tasks Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Speed sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">{teamStats.efficiency}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">{teamStats.avgResponseTime}s</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Avg Response
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      {viewMode === 'workspace' ? (
        <Grid container spacing={3}>
          {/* 3D Office */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Office Floor Plan</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                <OfficeWorkspace 
                  agents={agentsArray}
                  onAgentClick={(agent) => setSelectedAgent(agent)}
                  onAgentDrop={handleAgentDrop}
                  onRoomClick={handleRoomClick}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Agent Activity */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 2, height: 600, overflow: 'hidden' }}>
              <Typography variant="h6" gutterBottom>Agent Activity</Typography>
              <List sx={{ overflow: 'auto', maxHeight: 520 }}>
                {agentsArray.map((agent) => (
                  <ListItem
                    key={agent.id}
                    button
                    onClick={() => setSelectedAgent(agent)}
                    sx={{
                      bgcolor: agent.status === 'working' ? 'success.light' : 'transparent',
                      mb: 1,
                      borderRadius: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={agent.hasNotification ? '!' : 0}
                        color="error"
                        variant="dot"
                      >
                        <Avatar sx={{ bgcolor: agent.status === 'working' ? 'success.main' : 'grey.500' }}>
                          {agent.icon}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={agent.name}
                      secondary={agent.currentTask || 'Available'}
                    />
                    {agent.status === 'working' && (
                      <Chip size="small" label="Active" color="success" />
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Performance Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #FFD93D 0%, #FFE74C 100%)',
                  color: 'text.primary'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EmojiEvents sx={{ fontSize: 40 }} />
                    <Typography variant="h6">23</Typography>
                    <Typography variant="body2">Tasks Completed Today</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #42A5F5 0%, #66BB6A 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Phone sx={{ fontSize: 40 }} />
                    <Typography variant="h6">47</Typography>
                    <Typography variant="body2">Calls Made</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #AB47BC 0%, #7E57C2 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ChatBubble sx={{ fontSize: 40 }} />
                    <Typography variant="h6">128</Typography>
                    <Typography variant="body2">Messages Sent</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Star sx={{ fontSize: 40 }} />
                    <Typography variant="h6">4.9</Typography>
                    <Typography variant="body2">Client Satisfaction</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <Grid item xs={12}>
              <Alert severity="success" icon={<EmojiEvents />}>
                <Typography variant="subtitle2">
                  🎉 {achievements[0].achievement}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      ) : (
        // List View
        <Grid container spacing={3}>
          {Object.entries(mockDatabaseItems).map(([key, items]) => (
            <Grid item xs={12} key={key}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {key} ({items.length})
                </Typography>
                <Grid container spacing={2}>
                  {items.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSelectedDatabaseItem(item)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {item.address || item.name || item.title}
                          </Typography>
                          <Chip 
                            label={item.status} 
                            size="small" 
                            color={item.status === 'Active' || item.status === 'Scheduled' ? 'success' : 'default'}
                          />
                          {item.price && (
                            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                              ${item.price.toLocaleString()}
                            </Typography>
                          )}
                          {item.closingDate && (
                            <Typography variant="body2" color="text.secondary">
                              Closing: {item.closingDate}
                            </Typography>
                          )}
                          {item.temperature && (
                            <Chip 
                              label={item.temperature} 
                              size="small" 
                              color={item.temperature === 'Hot' ? 'error' : 'default'}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Other Data Menu */}
      <Menu
        anchorEl={otherDataMenuAnchor}
        open={Boolean(otherDataMenuAnchor)}
        onClose={() => setOtherDataMenuAnchor(null)}
      >
        {otherDataTypes.map((dataType) => {
          const Icon = dataType.icon;
          return (
            <MenuItem 
              key={dataType.name}
              onClick={() => {
                setSelectedOtherData(dataType.name);
                setOtherDataMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={dataType.label} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {dataType.count}
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>

      {/* Agent Detail Dialog */}
      {selectedAgent && (
        <Dialog open={true} onClose={() => setSelectedAgent(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {selectedAgent.icon}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedAgent.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAgent.role} • {selectedAgent.department}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={selectedAgent.status === 'working' ? 'Working' : 'Available'} 
                color={selectedAgent.status === 'working' ? 'success' : 'default'}
                sx={{ mb: 1 }}
              />
              {selectedAgent.currentTask && (
                <Typography variant="body1">
                  <strong>Current Task:</strong> {selectedAgent.currentTask}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Tasks Today</Typography>
                <Typography variant="h6">{selectedAgent.metrics.tasksToday}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Avg Response</Typography>
                <Typography variant="h6">{selectedAgent.metrics.avgResponseTime}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Efficiency</Typography>
                <Typography variant="h6">{selectedAgent.metrics.efficiency}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Last Active</Typography>
                <Typography variant="h6" color="success.main">{selectedAgent.metrics.lastActive}</Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" size="small" startIcon={<Assignment />}>
                Assign Task
              </Button>
              <Button variant="outlined" size="small" startIcon={<ChatBubble />}>
                Send Message
              </Button>
              <Button variant="outlined" size="small" startIcon={<Analytics />}>
                View Performance
              </Button>
            </Stack>
            
            {selectedAgent.hasNotification && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  New notification: Client response received
                </Typography>
              </Alert>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Database Item Detail */}
      {selectedDatabaseItem && (
        <DatabaseItemPage
          type={selectedDatabaseItem.type}
          item={selectedDatabaseItem}
          onClose={() => setSelectedDatabaseItem(null)}
        />
      )}
      
      {/* Other Data Pages */}
      {selectedOtherData && (
        <OtherDataPage
          type={selectedOtherData}
          onClose={() => setSelectedOtherData(null)}
        />
      )}
    </Container>
  );
};

export default VirtualAIOffice;