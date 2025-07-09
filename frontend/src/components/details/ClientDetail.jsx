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
} from '@mui/material';
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
  Home,
  AttachMoney,
  CalendarToday,
  Person,
  Assignment,
  History,
  Description,
  TrendingUp,
  LocationOn,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { clientsAPI } from '../../services/api';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // Fetch client details
  const { data: client, isLoading } = useQuery(
    ['client', id],
    () => clientsAPI.getOne(id),
    { refetchInterval: 30000 }
  );

  // Mock data for demonstration
  const mockClient = {
    id: 1,
    name: 'Robert Chen',
    email: 'rchen@email.com',
    phone: '(555) 234-5678',
    type: 'Buyer',
    status: 'Active',
    source: 'Referral',
    agent: 'You',
    createdAt: new Date('2023-06-15'),
    lastActivity: new Date('2024-01-17'),
    address: '123 Main St, Roseville, CA 95661',
    notes: 'First-time buyer, very motivated',
    totalTransactions: 1,
    totalVolume: '$650,000',
    properties: [
      {
        id: 1,
        address: '456 Oak Ave, Roseville, CA',
        type: 'Purchase',
        status: 'In Escrow',
        price: '$650,000',
        date: '2024-01-10',
      }
    ],
    communications: [
      {
        id: 1,
        type: 'email',
        subject: 'Property Documents',
        date: new Date('2024-01-17'),
        preview: 'Hi Robert, attached are the documents...'
      },
      {
        id: 2,
        type: 'call',
        subject: 'Inspection Results',
        date: new Date('2024-01-15'),
        duration: '15 min'
      }
    ],
    activities: [
      {
        id: 1,
        type: 'client_created',
        description: 'Client profile created',
        timestamp: new Date('2023-06-15'),
      },
      {
        id: 2,
        type: 'property_shown',
        description: 'Showed 5 properties in West Roseville',
        timestamp: new Date('2023-12-20'),
      },
      {
        id: 3,
        type: 'offer_made',
        description: 'Offer submitted for 456 Oak Ave',
        timestamp: new Date('2024-01-05'),
      },
      {
        id: 4,
        type: 'escrow_opened',
        description: 'Escrow opened for 456 Oak Ave',
        timestamp: new Date('2024-01-10'),
      }
    ]
  };

  const displayClient = client || mockClient;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'email_sent': return <Email />;
      case 'call_made': return <Phone />;
      case 'property_shown': return <Home />;
      case 'offer_made': return <AttachMoney />;
      case 'escrow_opened': return <Assignment />;
      default: return <History />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/clients')}
          sx={{ textDecoration: 'none' }}
        >
          Clients
        </Link>
        <Typography color="textPrimary">{displayClient.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
              {displayClient.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4">{displayClient.name}</Typography>
                <Chip 
                  label={displayClient.type} 
                  color="primary" 
                  size="small"
                />
                <Chip 
                  label={displayClient.status} 
                  color={displayClient.status === 'Active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" />
                  <Typography variant="body2">{displayClient.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" />
                  <Typography variant="body2">{displayClient.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">{displayClient.address}</Typography>
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
            <Button variant="contained" startIcon={<Edit />}>
              Edit
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Properties" />
          <Tab label="Communications" />
          <Tab label="Documents" />
          <Tab label="Activity" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Client Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Client Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Client Since</Typography>
                    <Typography variant="body1">
                      {format(displayClient.createdAt, 'MMMM d, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Lead Source</Typography>
                    <Typography variant="body1">{displayClient.source}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
                    <Typography variant="body1">{displayClient.totalTransactions}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Total Volume</Typography>
                    <Typography variant="body1">{displayClient.totalVolume}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Activity Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                <Timeline>
                  {displayClient.activities.map((activity, index) => (
                    <TimelineItem key={activity.id}>
                      <TimelineOppositeContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          {format(activity.timestamp, 'MMM d, yyyy')}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={index === 0 ? 'primary' : 'grey'}>
                          {getActivityIcon(activity.type)}
                        </TimelineDot>
                        {index < displayClient.activities.length - 1 && <TimelineConnector />}
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
                <Typography variant="h6" gutterBottom>Quick Stats</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Activity"
                      secondary={format(displayClient.lastActivity, 'MMM d, yyyy')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Assigned Agent"
                      secondary={displayClient.agent}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notes</Typography>
                <Typography variant="body2">{displayClient.notes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property Address</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayClient.properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.address}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={property.status} 
                      size="small"
                      color={property.status === 'In Escrow' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{property.price}</TableCell>
                  <TableCell>{property.date}</TableCell>
                  <TableCell>
                    <Button size="small">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ClientDetail;