import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
} from '@mui/material';
import DebugCard from '../common/DebugCard';
import DetailPageErrorBoundary from '../common/DetailPageErrorBoundary';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Edit,
  Phone,
  Email,
  Person,
  LocationOn,
  CalendarToday,
  Note,
  AttachMoney,
  TrendingUp,
  History,
  Task,
  CheckCircle,
  Cancel,
  Schedule,
  Star,
  StarBorder,
  Home,
  Business,
  DirectionsCar,
  School,
  FamilyRestroom,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { leadsAPI } from '../../services/api.service';

// Safe date parsing helper
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // If it's already a Date object, return it
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // Try to parse the date string
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// Safe date formatting helper
const safeFormatDate = (dateValue, formatString, fallback = 'N/A') => {
  const date = safeParseDate(dateValue);
  if (!date) return fallback;
  
  try {
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Debug logging
  // console.log('[LeadDetail] Component mounted');
  // console.log('[LeadDetail] ID received:', id);
  // console.log('[LeadDetail] Window location:', window.location.href);

  // Fetch lead details
  const { data: lead, isLoading, error, isError } = useQuery(
    ['lead', id],
    async () => {
      try {
        const response = await leadsAPI.getOne(id);
        return response;
      } catch (err) {
        console.error('Error fetching lead:', err);
        // Return mock data on error
        return mockLead;
      }
    },
    { 
      refetchInterval: 30000,
      retry: 1
    }
  );

  // Mock data for demonstration
  const mockLead = {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    status: 'hot',
    score: 95,
    source: 'Website',
    assignedTo: 'Alex AI',
    createdAt: '2024-01-15',
    lastContact: '2024-01-18',
    interested_in: 'Buying',
    propertyType: 'Single Family Home',
    budget: '$500,000 - $750,000',
    timeline: '1-3 months',
    location: 'Roseville, CA',
    preApproved: true,
    currentSituation: 'Renting',
    motivation: 'Growing family, need more space',
    starred: true,
    notes: [
      {
        id: 1,
        content: 'Initial contact made. Very motivated buyer, pre-approved for $750k.',
        createdAt: '2024-01-15T10:30:00',
        createdBy: 'System'
      },
      {
        id: 2,
        content: 'Interested in 4BR homes in Roseville area. School district is important.',
        createdAt: '2024-01-16T14:15:00',
        createdBy: 'Alex AI'
      },
      {
        id: 3,
        content: 'Scheduled property tour for this weekend. Sending 5 listings for review.',
        createdAt: '2024-01-18T09:00:00',
        createdBy: 'You'
      }
    ],
    activities: [
      {
        id: 1,
        type: 'lead_created',
        description: 'Lead created from website inquiry',
        timestamp: '2024-01-15T10:00:00',
        icon: 'add'
      },
      {
        id: 2,
        type: 'email_sent',
        description: 'Welcome email sent by Alex AI',
        timestamp: '2024-01-15T10:05:00',
        icon: 'email'
      },
      {
        id: 3,
        type: 'call_made',
        description: 'Initial qualification call completed',
        timestamp: '2024-01-15T10:30:00',
        icon: 'phone'
      },
      {
        id: 4,
        type: 'status_changed',
        description: 'Status changed from Warm to Hot',
        timestamp: '2024-01-16T14:15:00',
        icon: 'trending_up'
      },
      {
        id: 5,
        type: 'task_created',
        description: 'Property tour scheduled',
        timestamp: '2024-01-18T09:00:00',
        icon: 'event'
      }
    ],
    preferences: {
      bedrooms: '4+',
      bathrooms: '2.5+',
      squareFeet: '2,500+',
      lotSize: '6,000+ sq ft',
      garage: '3 car',
      features: ['Pool', 'Modern Kitchen', 'Home Office', 'Good Schools'],
      neighborhoods: ['West Roseville', 'Granite Bay', 'Rocklin'],
      maxHOA: '$200/month'
    },
    tasks: [
      {
        id: 1,
        title: 'Send property listings',
        dueDate: '2024-01-19',
        status: 'completed',
        assignedTo: 'You'
      },
      {
        id: 2,
        title: 'Property tour - 5 homes',
        dueDate: '2024-01-21',
        status: 'pending',
        assignedTo: 'You'
      },
      {
        id: 3,
        title: 'Follow up after tour',
        dueDate: '2024-01-22',
        status: 'pending',
        assignedTo: 'Alex AI'
      }
    ]
  };

  const displayLead = lead || mockLead;

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return 'error';
      case 'warm': return 'warning';
      case 'cold': return 'info';
      case 'converted': return 'success';
      default: return 'default';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'email_sent': return <Email />;
      case 'call_made': return <Phone />;
      case 'lead_created': return <Person />;
      case 'status_changed': return <TrendingUp />;
      case 'task_created': return <Task />;
      case 'note_added': return <Note />;
      default: return <History />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await leadsAPI.updateStatus(id, newStatus);
      queryClient.invalidateQueries(['lead', id]);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await leadsAPI.addNote(id, { content: newNote });
      setNewNote('');
      queryClient.invalidateQueries(['lead', id]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleConvertToClient = () => {
    // Implement conversion logic
    navigate(`/clients/new?leadId=${id}`);
  };

  if (isLoading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <DebugCard 
        pageName="LeadDetail"
        id={id}
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={displayLead}
        additionalInfo={{
          activeTab,
          hasLeadData: !!lead,
          usingMockData: !lead && !!displayLead
        }}
      />
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/leads')}
          sx={{ textDecoration: 'none' }}
        >
          Leads
        </Link>
        <Typography color="textPrimary">{displayLead.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
              {displayLead.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4">{displayLead.name}</Typography>
                <IconButton onClick={() => setEditMode(!editMode)}>
                  <Edit />
                </IconButton>
                <IconButton>
                  {displayLead.starred ? <Star color="primary" /> : <StarBorder />}
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={(displayLead.status || 'UNKNOWN').toUpperCase()}
                  color={getStatusColor(displayLead.status)}
                  size="small"
                />
                <Chip
                  label={`Score: ${displayLead.score}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<TrendingUp />}
                />
                <Chip
                  label={displayLead.source}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Assigned to: ${displayLead.assignedTo}`}
                  size="small"
                  variant="outlined"
                  color={displayLead.assignedTo.includes('AI') ? 'secondary' : 'default'}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" />
                  <Typography variant="body2">{displayLead.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" />
                  <Typography variant="body2">{displayLead.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">{displayLead.location}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Phone />}>
              Call
            </Button>
            <Button variant="outlined" startIcon={<Email />}>
              Email
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleConvertToClient}
            >
              Convert to Client
            </Button>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={displayLead.status}
                label="Status"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <MenuItem value="cold">Cold</MenuItem>
                <MenuItem value="warm">Warm</MenuItem>
                <MenuItem value="hot">Hot</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Timeline"
              value={displayLead.timeline}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Budget"
              value={displayLead.budget}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Interest"
              value={displayLead.interested_in}
              disabled={!editMode}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Preferences" />
          <Tab label="Activities" />
          <Tab label="Tasks" />
          <Tab label="Notes" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Lead Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Lead Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Property Type</Typography>
                    <Typography variant="body1">{displayLead.propertyType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Pre-Approved</Typography>
                    <Typography variant="body1">
                      {displayLead.preApproved ? (
                        <Chip label="Yes" color="success" size="small" />
                      ) : (
                        <Chip label="No" color="default" size="small" />
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Current Situation</Typography>
                    <Typography variant="body1">{displayLead.currentSituation}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Motivation</Typography>
                    <Typography variant="body1">{displayLead.motivation}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Created Date</Typography>
                    <Typography variant="body1">
                      {safeFormatDate(displayLead.createdAt, 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Last Contact</Typography>
                    <Typography variant="body1">
                      {safeFormatDate(displayLead.lastContact, 'MMM dd, yyyy h:mm a')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                <Timeline>
                  {displayLead.activities.slice(0, 5).map((activity, index) => (
                    <TimelineItem key={activity.id}>
                      <TimelineOppositeContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          {safeFormatDate(activity.timestamp, 'MMM dd, h:mm a')}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={index === 0 ? 'primary' : 'grey'}>
                          {getActivityIcon(activity.type)}
                        </TimelineDot>
                        {index < displayLead.activities.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="body2">{activity.description}</Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Quick Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Lead Score Analysis</Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Lead Score</Typography>
                    <Typography variant="h5" color="primary">{displayLead.score}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={displayLead.score} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Alert severity={displayLead.score >= 80 ? 'success' : 'info'}>
                  {displayLead.score >= 80 
                    ? 'High priority lead - engage immediately!'
                    : 'Continue nurturing this lead'}
                </Alert>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Upcoming Tasks</Typography>
                <List dense>
                  {displayLead.tasks.map((task) => (
                    <ListItem key={task.id}>
                      <ListItemIcon>
                        {task.status === 'completed' ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Schedule color="action" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={`Due: ${safeFormatDate(task.dueDate, 'MMM dd')} - ${task.assignedTo}`}
                        primaryTypographyProps={{
                          style: {
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Property Preferences</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Home /></ListItemIcon>
                        <ListItemText 
                          primary="Property Type"
                          secondary={displayLead.propertyType}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AttachMoney /></ListItemIcon>
                        <ListItemText 
                          primary="Budget Range"
                          secondary={displayLead.budget}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Business /></ListItemIcon>
                        <ListItemText 
                          primary="Bedrooms"
                          secondary={displayLead.preferences.bedrooms}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Business /></ListItemIcon>
                        <ListItemText 
                          primary="Bathrooms"
                          secondary={displayLead.preferences.bathrooms}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Home /></ListItemIcon>
                        <ListItemText 
                          primary="Square Feet"
                          secondary={displayLead.preferences.squareFeet}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationOn /></ListItemIcon>
                        <ListItemText 
                          primary="Lot Size"
                          secondary={displayLead.preferences.lotSize}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DirectionsCar /></ListItemIcon>
                        <ListItemText 
                          primary="Garage"
                          secondary={displayLead.preferences.garage}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AttachMoney /></ListItemIcon>
                        <ListItemText 
                          primary="Max HOA"
                          secondary={displayLead.preferences.maxHOA}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Desired Features</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {displayLead.preferences.features.map((feature) => (
                    <Chip key={feature} label={feature} />
                  ))}
                </Box>
                <Typography variant="subtitle1" gutterBottom>Preferred Neighborhoods</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {displayLead.preferences.neighborhoods.map((neighborhood) => (
                    <Chip key={neighborhood} label={neighborhood} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 1 }}
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    Add Note
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {displayLead.notes.map((note) => (
                    <ListItem key={note.id} alignItems="flex-start">
                      <ListItemText
                        primary={note.content}
                        secondary={
                          <>
                            {note.createdBy} • {safeFormatDate(note.createdAt, 'MMM dd, yyyy h:mm a')}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

const LeadDetailWithErrorBoundary = () => (
  <DetailPageErrorBoundary pageName="LeadDetail">
    <LeadDetail />
  </DetailPageErrorBoundary>
);

export default LeadDetailWithErrorBoundary;