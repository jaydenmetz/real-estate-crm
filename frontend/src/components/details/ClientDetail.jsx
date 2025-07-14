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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
  FormControlLabel,
  Checkbox,
  Menu,
} from '@mui/material';
import DetailPageDebugger from '../common/DetailPageDebugger';
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
  Description,
  Upload,
  Download,
  Visibility,
  Send,
  MoreVert,
  Add,
  Chat,
  Assignment,
  FolderOpen,
  VideoCameraFront,
  PhoneInTalk,
  EmailOutlined,
  MessageOutlined,
  InsertDriveFile,
  PictureAsPdf,
  Image,
  AccountBalance,
  CreditCard,
  Cake,
  Work,
  LocalOffer,
  SwapHoriz,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { api } from '../../services/api';

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

// Safe formatDistanceToNow helper
const safeFormatDistanceToNow = (dateValue, options = {}, fallback = 'N/A') => {
  const date = safeParseDate(dateValue);
  if (!date) return fallback;
  
  try {
    return formatDistanceToNow(date, options);
  } catch (error) {
    console.error('Error formatting distance to now:', error);
    return fallback;
  }
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Debug logging
  console.log('[ClientDetail] Component mounted');
  console.log('[ClientDetail] ID received:', id);
  console.log('[ClientDetail] Window location:', window.location.href);

  // Fetch client details
  const { data: client, isLoading, error, isError } = useQuery(
    ['client', id],
    async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        return res.data;
      } catch (err) {
        console.error('Error fetching client:', err);
        // Return mock data on error
        return mockClient;
      }
    },
    { 
      refetchInterval: 30000,
      retry: 1
    }
  );

  // Mock data for demonstration
  const mockClient = {
    id: 1,
    name: 'Michael & Sarah Thompson',
    email: 'michael.thompson@email.com',
    phone: '(555) 234-5678',
    alternatePhone: '(555) 234-5679',
    status: 'Active',
    type: 'Buyer',
    source: 'Referral',
    assignedAgent: 'You',
    createdAt: '2023-06-15',
    lastContact: '2024-01-18',
    birthday: '1985-03-15',
    anniversary: '2010-06-20',
    occupation: 'Software Engineer / Teacher',
    address: '789 Oak Street, San Diego, CA 92103',
    budget: '$800,000 - $1,200,000',
    preApproved: true,
    lender: 'Wells Fargo',
    preferredContactMethod: 'Email',
    timeZone: 'PST',
    notes: 'Looking for 4BR home in good school district. Both work from home occasionally.',
    tags: ['VIP', 'Cash Buyer', 'Repeat Client'],
    starred: true,
    lifetimeValue: '$45,000',
    totalTransactions: 3,
    referrals: 5,
    properties: {
      owned: [
        {
          id: 1,
          address: '789 Oak Street, San Diego, CA 92103',
          type: 'Single Family',
          purchaseDate: '2018-07-15',
          purchasePrice: '$650,000',
          currentValue: '$850,000',
          status: 'Primary Residence'
        }
      ],
      interested: [
        {
          id: 2,
          address: '456 Maple Drive, La Jolla, CA 92037',
          type: 'Single Family',
          listPrice: '$1,150,000',
          status: 'Scheduled Showing',
          notes: 'Love the location, concerned about price'
        },
        {
          id: 3,
          address: '321 Beach Blvd, Carlsbad, CA 92008',
          type: 'Condo',
          listPrice: '$875,000',
          status: 'Viewed',
          notes: 'Backup option'
        }
      ]
    },
    appointments: [
      {
        id: 1,
        title: 'Property Tour - La Jolla',
        date: '2024-01-20',
        time: '2:00 PM',
        type: 'Property Showing',
        status: 'Scheduled'
      },
      {
        id: 2,
        title: 'Market Update Meeting',
        date: '2024-01-25',
        time: '10:00 AM',
        type: 'Consultation',
        status: 'Scheduled'
      }
    ],
    communications: [
      {
        id: 1,
        type: 'email',
        subject: 'New Listings Matching Your Criteria',
        date: '2024-01-17T14:30:00',
        direction: 'outbound',
        status: 'sent',
        preview: 'Hi Michael and Sarah, I found 3 new properties that match your criteria...'
      },
      {
        id: 2,
        type: 'call',
        subject: 'Follow up on La Jolla property',
        date: '2024-01-16T10:15:00',
        direction: 'inbound',
        duration: '15 min',
        notes: 'Discussed financing options and scheduling a tour'
      },
      {
        id: 3,
        type: 'text',
        subject: 'Confirmation for Saturday showing',
        date: '2024-01-15T16:45:00',
        direction: 'outbound',
        status: 'delivered'
      }
    ],
    documents: [
      {
        id: 1,
        name: 'Pre-approval Letter.pdf',
        type: 'pdf',
        size: '245 KB',
        uploadDate: '2024-01-10',
        category: 'Financial'
      },
      {
        id: 2,
        name: 'Buyer Preferences Worksheet.docx',
        type: 'doc',
        size: '128 KB',
        uploadDate: '2024-01-05',
        category: 'Preferences'
      },
      {
        id: 3,
        name: 'Market Analysis Report.pdf',
        type: 'pdf',
        size: '1.2 MB',
        uploadDate: '2024-01-15',
        category: 'Reports'
      }
    ],
    activities: [
      {
        id: 1,
        type: 'client_created',
        description: 'Client profile created',
        timestamp: '2023-06-15T09:00:00',
        user: 'System'
      },
      {
        id: 2,
        type: 'property_viewed',
        description: 'Viewed property at 321 Beach Blvd',
        timestamp: '2024-01-14T15:30:00',
        user: 'You'
      },
      {
        id: 3,
        type: 'document_uploaded',
        description: 'Uploaded Pre-approval Letter',
        timestamp: '2024-01-10T11:20:00',
        user: 'You'
      },
      {
        id: 4,
        type: 'appointment_scheduled',
        description: 'Scheduled property tour for La Jolla',
        timestamp: '2024-01-17T16:00:00',
        user: 'You'
      }
    ],
    preferences: {
      propertyType: ['Single Family', 'Townhouse'],
      bedrooms: '4+',
      bathrooms: '3+',
      sqft: '2,500+',
      lot: '7,000+ sqft',
      features: ['Home Office', 'Pool', 'Updated Kitchen', '2-Car Garage'],
      neighborhoods: ['La Jolla', 'Carmel Valley', 'Del Mar'],
      schools: ['Great Schools Rating 8+'],
      maxHOA: '$300/month',
      moveInDate: '3-6 months',
      dealBreakers: ['Busy street', 'Major repairs needed', 'No backyard']
    }
  };

  const displayClient = client || mockClient;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'warning';
      case 'Archived': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Buyer': return <Home />;
      case 'Seller': return <Business />;
      case 'Both': return <SwapHoriz />;
      case 'Investor': return <TrendingUp />;
      default: return <Person />;
    }
  };

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'email': return <EmailOutlined />;
      case 'call': return <PhoneInTalk />;
      case 'text': return <MessageOutlined />;
      case 'video': return <VideoCameraFront />;
      case 'meeting': return <Business />;
      default: return <Chat />;
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'pdf': return <PictureAsPdf />;
      case 'doc':
      case 'docx': return <Description />;
      case 'xls':
      case 'xlsx': return <Description />;
      case 'img':
      case 'jpg':
      case 'png': return <Image />;
      default: return <InsertDriveFile />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'client_created': return <Person />;
      case 'property_viewed': return <Home />;
      case 'document_uploaded': return <Upload />;
      case 'appointment_scheduled': return <CalendarToday />;
      case 'communication_sent': return <Send />;
      case 'note_added': return <Note />;
      case 'status_changed': return <TrendingUp />;
      default: return <History />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      // Add note API call
      await api.post(`/clients/${id}/notes`, { content: newNote });
      queryClient.invalidateQueries(['client', id]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <DetailPageDebugger 
        pageName="ClientDetail"
        id={id}
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={displayClient}
        additionalInfo={{
          activeTab,
          hasClientData: !!client,
          usingMockData: !client && !!displayClient
        }}
      />
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator="›" sx={{ mb: 2 }}>
          <Link color="inherit" href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            Dashboard
          </Link>
          <Link color="inherit" href="/clients" onClick={(e) => { e.preventDefault(); navigate('/clients'); }}>
            Clients
          </Link>
          <Typography color="text.primary">{displayClient.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate('/clients')}>
                <ArrowBack />
              </IconButton>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                {displayClient.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4">{displayClient.name}</Typography>
                  <Tooltip title={displayClient.starred ? 'Remove from favorites' : 'Add to favorites'}>
                    <IconButton size="small" onClick={() => console.log('Toggle star')}>
                      {displayClient.starred ? <Star color="warning" /> : <StarBorder />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={displayClient.status}
                    size="small"
                    color={getStatusColor(displayClient.status)}
                  />
                  <Chip
                    label={displayClient.type}
                    size="small"
                    icon={getTypeIcon(displayClient.type)}
                  />
                  {displayClient.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditMode(!editMode)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleMenuClose(); }}>
                <ListItemIcon><Email /></ListItemIcon>
                Send Email
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); }}>
                <ListItemIcon><Phone /></ListItemIcon>
                Call Client
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); }}>
                <ListItemIcon><CalendarToday /></ListItemIcon>
                Schedule Appointment
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); }}>
                <ListItemIcon><Description /></ListItemIcon>
                Generate Report
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {displayClient.totalTransactions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {displayClient.lifetimeValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lifetime Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {displayClient.referrals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Referrals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {safeFormatDistanceToNow(displayClient.lastContact, { addSuffix: true })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Contact
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Properties" />
          <Tab label="Appointments" />
          <Tab label="Communications" />
          <Tab label="Documents" />
          <Tab label="Notes" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={displayClient.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone /></ListItemIcon>
                    <ListItemText 
                      primary="Phone"
                      secondary={displayClient.phone}
                    />
                  </ListItem>
                  {displayClient.alternatePhone && (
                    <ListItem>
                      <ListItemIcon><Phone /></ListItemIcon>
                      <ListItemText 
                        primary="Alternate Phone"
                        secondary={displayClient.alternatePhone}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon><LocationOn /></ListItemIcon>
                    <ListItemText 
                      primary="Address"
                      secondary={displayClient.address}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Work /></ListItemIcon>
                    <ListItemText 
                      primary="Occupation"
                      secondary={displayClient.occupation}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Cake /></ListItemIcon>
                    <ListItemText 
                      primary="Birthday"
                      secondary={displayClient.birthday}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><FamilyRestroom /></ListItemIcon>
                    <ListItemText 
                      primary="Anniversary"
                      secondary={displayClient.anniversary}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Schedule /></ListItemIcon>
                    <ListItemText 
                      primary="Time Zone"
                      secondary={displayClient.timeZone}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><AttachMoney /></ListItemIcon>
                    <ListItemText 
                      primary="Budget"
                      secondary={displayClient.budget}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle /></ListItemIcon>
                    <ListItemText 
                      primary="Pre-Approved"
                      secondary={displayClient.preApproved ? 'Yes' : 'No'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AccountBalance /></ListItemIcon>
                    <ListItemText 
                      primary="Lender"
                      secondary={displayClient.lender}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Timeline */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {displayClient.activities.length > 0 ? (
                  <Timeline>
                    {displayClient.activities.slice(0, 4).map((activity, index) => (
                      <TimelineItem key={activity.id}>
                        <TimelineOppositeContent color="textSecondary" sx={{ maxWidth: '120px' }}>
                          {safeFormatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color="primary">
                            {getActivityIcon(activity.type)}
                          </TimelineDot>
                          {index < displayClient.activities.slice(0, 4).length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            by {activity.user}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No recent activity
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Owned Properties */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Owned Properties
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Purchase Date</TableCell>
                        <TableCell>Purchase Price</TableCell>
                        <TableCell>Current Value</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayClient.properties.owned.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>{property.address}</TableCell>
                          <TableCell>{property.type}</TableCell>
                          <TableCell>{safeFormatDate(property.purchaseDate, 'MMM d, yyyy')}</TableCell>
                          <TableCell>{property.purchasePrice}</TableCell>
                          <TableCell>{property.currentValue}</TableCell>
                          <TableCell>
                            <Chip label={property.status} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Properties of Interest */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Properties of Interest
                </Typography>
                <List>
                  {displayClient.properties.interested.map((property) => (
                    <ListItem key={property.id}>
                      <ListItemIcon>
                        <Home />
                      </ListItemIcon>
                      <ListItemText
                        primary={property.address}
                        secondary={
                          <>
                            {property.type} • {property.listPrice}
                            <br />
                            {property.notes}
                          </>
                        }
                      />
                      <Chip 
                        label={property.status} 
                        size="small"
                        color={property.status === 'Scheduled Showing' ? 'primary' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Property Preferences */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Preferences
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">Property Types</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {displayClient.preferences.propertyType.map((type) => (
                        <Chip key={type} label={type} size="small" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="textSecondary">Bedrooms</Typography>
                    <Typography variant="body1">{displayClient.preferences.bedrooms}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="textSecondary">Bathrooms</Typography>
                    <Typography variant="body1">{displayClient.preferences.bathrooms}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Desired Features</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {displayClient.preferences.features.map((feature) => (
                        <Chip key={feature} label={feature} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Preferred Neighborhoods</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {displayClient.preferences.neighborhoods.map((neighborhood) => (
                        <Chip key={neighborhood} label={neighborhood} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Deal Breakers</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {displayClient.preferences.dealBreakers.map((item) => (
                        <Chip key={item} label={item} size="small" color="error" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Upcoming Appointments */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Appointments</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => navigate('/appointments/new', { state: { clientId: id } })}
                  >
                    Schedule New
                  </Button>
                </Box>
                <List>
                  {displayClient.appointments.map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      button
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                    >
                      <ListItemIcon>
                        <CalendarToday />
                      </ListItemIcon>
                      <ListItemText
                        primary={appointment.title}
                        secondary={`${safeFormatDate(appointment.date, 'MMMM d, yyyy')} at ${appointment.time}`}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={appointment.type} 
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={appointment.status} 
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Communication History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Communication History</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<Email />}>Email</Button>
                    <Button size="small" startIcon={<Phone />}>Call</Button>
                    <Button size="small" startIcon={<MessageOutlined />}>Text</Button>
                  </Box>
                </Box>
                <List>
                  {displayClient.communications.map((comm) => (
                    <ListItem key={comm.id} alignItems="flex-start">
                      <ListItemIcon>
                        {getCommunicationIcon(comm.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1">{comm.subject}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {safeFormatDistanceToNow(comm.date, { addSuffix: true })}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            {comm.type === 'call' && comm.duration && (
                              <Typography variant="body2" color="textSecondary">
                                Duration: {comm.duration}
                              </Typography>
                            )}
                            {comm.preview && (
                              <Typography variant="body2" color="textSecondary">
                                {comm.preview}
                              </Typography>
                            )}
                            {comm.notes && (
                              <Typography variant="body2" color="textSecondary">
                                Notes: {comm.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Chip 
                        label={comm.direction} 
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          {/* Documents */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Documents</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Upload />}
                    onClick={() => console.log('Upload document')}
                  >
                    Upload Document
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Upload Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayClient.documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getDocumentIcon(doc.type)}
                              {doc.name}
                            </Box>
                          </TableCell>
                          <TableCell>{doc.category}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>{safeFormatDate(doc.uploadDate, 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => console.log('View document')}>
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" onClick={() => console.log('Download document')}>
                              <Download />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && (
        <Grid container spacing={3}>
          {/* Notes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notes</Typography>
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
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Client Notes:</strong> {displayClient.notes}
                    </Typography>
                  </Alert>
                  {/* Additional notes would be listed here */}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions Floating Button */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Email />}
          onClick={() => console.log('Send email')}
        >
          Send Email
        </Button>
      </Box>
    </Container>
  );
};

const ClientDetailWithErrorBoundary = () => (
  <DetailPageErrorBoundary pageName="ClientDetail">
    <ClientDetail />
  </DetailPageErrorBoundary>
);

export default ClientDetailWithErrorBoundary;