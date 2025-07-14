// frontend/src/components/details/EscrowDetail.jsx

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
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Collapse,
  ListItemAvatar,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Share,
  Print,
  MoreVert,
  Home,
  LocationOn,
  AttachMoney,
  CalendarToday,
  Person,
  Phone,
  Email,
  Description,
  Check,
  Warning,
  Error,
  Timer,
  Assignment,
  Gavel,
  AccountBalance,
  LocalShipping,
  CheckCircle,
  Schedule,
  Note,
  TrendingUp,
  Calculate,
  Groups,
  Assessment,
  ExpandMore,
  ExpandLess,
  Download,
  Upload,
  ContentCopy,
  NavigateNext,
  Business,
  Notifications,
  History,
  NoteAdd,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, differenceInDays } from 'date-fns';
import { useSnackbar } from 'notistack';
import { escrowsAPI } from '../../services/api';

// Mock data for fallback
const mockEscrowDetail = {
  id: 'esc_001',
  escrowNumber: 'ESC-2025-001',
  propertyAddress: '456 Ocean View Dr, La Jolla, CA 92037',
  propertyType: 'Single Family',
  transactionType: 'Purchase',
  purchasePrice: 1250000,
  earnestMoneyDeposit: 25000,
  downPayment: 250000,
  loanAmount: 1000000,
  commissionPercentage: 2.5,
  grossCommission: 31250,
  netCommission: 28125,
  escrowStatus: 'Active',
  currentStage: 'Inspection',
  acceptanceDate: new Date('2025-06-15'),
  closingDate: new Date('2025-07-30'),
  inspectionDeadline: new Date('2025-07-10'),
  appraisalDeadline: new Date('2025-07-15'),
  loanContingencyDeadline: new Date('2025-07-20'),
  createdAt: new Date('2025-06-14'),
  updatedAt: new Date('2025-07-08'),
  
  buyers: [
    {
      id: 'cli_001',
      name: 'Michael & Sarah Chen',
      email: 'chen.family@email.com',
      phone: '(858) 555-1234',
      preApproved: true,
      lender: 'Wells Fargo',
    }
  ],
  sellers: [
    {
      id: 'cli_002',
      name: 'Robert Johnson',
      email: 'rjohnson@email.com',
      phone: '(858) 555-5678',
    }
  ],
  
  listingAgent: {
    id: 'agent_001',
    name: 'You',
    email: 'you@realestate.com',
    phone: '(858) 555-0000',
    commission: 15625,
  },
  buyerAgent: {
    id: 'agent_002',
    name: 'Jessica Martinez',
    email: 'jmartinez@otherrealty.com',
    phone: '(858) 555-9999',
    brokerage: 'Premier Realty',
    commission: 15625,
  },
  
  escrowOfficer: {
    name: 'Linda Thompson',
    company: 'Pacific Escrow',
    phone: '(858) 555-2222',
    email: 'lthompson@pacificescrow.com',
  },
  
  timeline: [
    {
      id: 1,
      date: new Date('2025-06-14'),
      event: 'Offer submitted',
      description: 'Initial offer of $1,200,000 submitted',
      type: 'milestone',
    },
    {
      id: 2,
      date: new Date('2025-06-15'),
      event: 'Offer accepted',
      description: 'Counter at $1,250,000 accepted by buyer',
      type: 'milestone',
    },
    {
      id: 3,
      date: new Date('2025-06-16'),
      event: 'Escrow opened',
      description: 'Escrow opened with Pacific Escrow',
      type: 'milestone',
    },
  ],
  
  documents: [
    {
      id: 1,
      name: 'Purchase Agreement',
      type: 'contract',
      uploadedAt: new Date('2025-06-15'),
      uploadedBy: 'You',
      size: '2.4 MB',
      status: 'signed',
    },
    {
      id: 2,
      name: 'Earnest Money Receipt',
      type: 'receipt',
      uploadedAt: new Date('2025-06-17'),
      uploadedBy: 'Escrow Officer',
      size: '156 KB',
      status: 'completed',
    },
  ],
  
  notes: [
    {
      id: 1,
      content: 'Buyers are very motivated. Pre-approved for $1.3M',
      createdAt: new Date('2025-06-14T10:30:00'),
      createdBy: 'You',
    },
    {
      id: 2,
      content: 'Seller prefers to close before August 1st due to relocation.',
      createdAt: new Date('2025-06-15T14:15:00'),
      createdBy: 'You',
    },
  ],
  
  checklist: {
    opening: {
      contract_signed: true,
      escrow_opened: true,
      earnest_deposited: true,
      disclosures_sent: true,
      title_ordered: false,
    },
    dueDiligence: {
      inspection_complete: false,
      inspection_response: false,
      appraisal_ordered: false,
      loan_processing: false,
    },
    closing: {
      appraisal_received: false,
      loan_approved: false,
      closing_scheduled: false,
      final_walkthrough: false,
      docs_signed: false,
    }
  }
};

// Tom Ferry best practice checklists
const escrowChecklists = {
  opening: {
    title: 'Opening (Days 1-3)',
    items: [
      { id: 'contract_signed', label: 'Fully executed contract received', critical: true },
      { id: 'escrow_opened', label: 'Escrow opened and number assigned', critical: true },
      { id: 'earnest_deposited', label: 'Earnest money deposited', critical: true },
      { id: 'disclosures_sent', label: 'Seller disclosures sent to buyer', critical: true },
      { id: 'title_ordered', label: 'Preliminary title report ordered', critical: true },
      { id: 'inspection_scheduled', label: 'Home inspection scheduled', critical: false },
      { id: 'insurance_quote', label: 'Insurance quote requested by buyer', critical: false },
    ]
  },
  dueDiligence: {
    title: 'Due Diligence (Days 4-17)',
    items: [
      { id: 'inspection_complete', label: 'Home inspection completed', critical: true },
      { id: 'inspection_response', label: 'Inspection response negotiated', critical: true },
      { id: 'disclosures_signed', label: 'All disclosures signed by buyer', critical: true },
      { id: 'appraisal_ordered', label: 'Appraisal ordered by lender', critical: true },
      { id: 'loan_processing', label: 'Loan in underwriting', critical: true },
      { id: 'hoa_docs', label: 'HOA documents delivered (if applicable)', critical: false },
      { id: 'repairs_complete', label: 'Agreed repairs completed', critical: false },
    ]
  },
  finalSteps: {
    title: 'Final Steps (Days 18-30)',
    items: [
      { id: 'appraisal_received', label: 'Appraisal received at value', critical: true },
      { id: 'loan_approved', label: 'Loan approved - clear to close', critical: true },
      { id: 'closing_scheduled', label: 'Closing appointment scheduled', critical: true },
      { id: 'final_walkthrough', label: 'Final walkthrough scheduled', critical: true },
      { id: 'utilities_transfer', label: 'Utilities transfer arranged', critical: false },
      { id: 'docs_signed', label: 'Closing documents signed', critical: true },
      { id: 'funds_wired', label: 'Funds wired to escrow', critical: true },
    ]
  },
  postClosing: {
    title: 'Post-Closing',
    items: [
      { id: 'keys_delivered', label: 'Keys delivered to buyer', critical: true },
      { id: 'recording_confirmed', label: 'Recording confirmed', critical: true },
      { id: 'commission_received', label: 'Commission received', critical: true },
      { id: 'client_gift', label: 'Closing gift delivered', critical: false },
      { id: 'review_request', label: 'Review request sent', critical: false },
      { id: 'file_archived', label: 'Transaction file archived', critical: false },
    ]
  }
};

const EscrowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    buyers: true,
    sellers: true,
    professionals: true,
    financial: true,
  });
  const [newNote, setNewNote] = useState('');
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [checklistStates, setChecklistStates] = useState({});

  // Fetch escrow details
  const { data: escrow, isLoading, error } = useQuery(
    ['escrow', id],
    () => escrowsAPI.getById(id).then(res => res.data),
    {
      refetchInterval: 30000,
      onError: () => {
        // Return mock data on error
        return mockEscrowDetail;
      }
    }
  );

  // Use mock data if API fails
  const escrowData = escrow || mockEscrowDetail;

  // Initialize checklist states
  React.useEffect(() => {
    if (escrowData?.checklist) {
      const states = {};
      Object.entries(escrowData.checklist).forEach(([category, items]) => {
        Object.entries(items).forEach(([item, checked]) => {
          states[`${category}_${item}`] = checked;
        });
      });
      setChecklistStates(states);
    }
  }, [escrowData]);

  // Add note mutation
  const addNoteMutation = useMutation(
    (note) => escrowsAPI.addNote(id, { note }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['escrow', id]);
        enqueueSnackbar('Note added successfully', { variant: 'success' });
        setNewNote('');
        setOpenNoteDialog(false);
      },
      onError: () => {
        enqueueSnackbar('Failed to add note', { variant: 'error' });
      }
    }
  );

  // Update checklist mutation
  const updateChecklistMutation = useMutation(
    ({ category, item, checked }) => 
      escrowsAPI.updateChecklist(id, { category, item, checked }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['escrow', id]);
      }
    }
  );

  const handleChecklistToggle = (category, itemId) => {
    const key = `${category}_${itemId}`;
    const newValue = !checklistStates[key];
    setChecklistStates(prev => ({
      ...prev,
      [key]: newValue
    }));
    updateChecklistMutation.mutate({ category, item: itemId, checked: newValue });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDaysToClose = () => {
    if (!escrowData.closingDate) return null;
    return differenceInDays(new Date(escrowData.closingDate), new Date());
  };

  const getTimelineProgress = () => {
    const stages = ['Contract', 'Inspection', 'Appraisal', 'Loan Approval', 'Final Walkthrough', 'Closing'];
    const currentIndex = stages.indexOf(escrowData.currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'success',
      'Pending': 'warning',
      'Closing': 'info',
      'Closed': 'default',
      'Cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  const daysToClose = getDaysToClose();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/')}
        >
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body1"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/escrows')}
        >
          Escrows
        </Link>
        <Typography color="text.primary">{escrowData.propertyAddress}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navigate('/escrows')} sx={{ mr: 2 }}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {escrowData.propertyAddress}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={escrowData.escrowStatus}
                    color={getStatusColor(escrowData.escrowStatus)}
                    size="small"
                  />
                  <Chip
                    label={`Stage: ${escrowData.currentStage}`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={escrowData.propertyType}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`Escrow #${escrowData.escrowNumber}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Button variant="outlined" startIcon={<Edit />}>
                Edit
              </Button>
              <Button variant="outlined" startIcon={<Share />}>
                Share
              </Button>
              <Button variant="outlined" startIcon={<Print />}>
                Print
              </Button>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ${escrowData.purchasePrice.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Purchase Price
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                color={daysToClose && daysToClose < 7 ? 'error' : 'success'}
              >
                {daysToClose !== null ? daysToClose : '--'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days to Close
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ${escrowData.grossCommission.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Commission
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                ${escrowData.listingAgent.commission.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your Commission
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Transaction Progress</Typography>
            <Typography variant="body2">{Math.round(getTimelineProgress())}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getTimelineProgress()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Timeline" />
          <Tab label="Checklists" />
          <Tab label="Documents" />
          <Tab label="Financial" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Parties Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Groups sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Transaction Parties
                </Typography>

                {/* Buyers */}
                <Box sx={{ mb: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      mb: 1
                    }}
                    onClick={() => toggleSection('buyers')}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Buyers
                    </Typography>
                    <IconButton size="small">
                      {expandedSections.buyers ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedSections.buyers}>
                    {escrowData.buyers.map((buyer) => (
                      <Box key={buyer.id} sx={{ ml: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 2 }}>{buyer.name.charAt(0)}</Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">{buyer.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'bottom' }} />
                                {buyer.phone}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <Email sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'bottom' }} />
                                {buyer.email}
                              </Typography>
                            </Box>
                          </Box>
                          {buyer.preApproved && (
                            <Chip label="Pre-approved" color="success" size="small" />
                          )}
                        </Box>
                        {buyer.lender && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
                            Lender: {buyer.lender}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Collapse>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Sellers */}
                <Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      mb: 1
                    }}
                    onClick={() => toggleSection('sellers')}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Sellers
                    </Typography>
                    <IconButton size="small">
                      {expandedSections.sellers ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <Collapse in={expandedSections.sellers}>
                    {escrowData.sellers.map((seller) => (
                      <Box key={seller.id} sx={{ ml: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>{seller.name.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="body1">{seller.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'bottom' }} />
                                {seller.phone}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <Email sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'bottom' }} />
                                {seller.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Collapse>
                </Box>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <History sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    Recent Activity
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<NoteAdd />}
                    onClick={() => setOpenNoteDialog(true)}
                  >
                    Add Note
                  </Button>
                </Box>
                <List>
                  {escrowData.notes.map((note) => (
                    <ListItem key={note.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{note.createdBy.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={note.content}
                        secondary={
                          <>
                            {note.createdBy} • {format(new Date(note.createdAt), 'MMM dd, yyyy h:mm a')}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Key Dates */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CalendarToday sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Key Dates
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Acceptance Date"
                      secondary={format(new Date(escrowData.acceptanceDate), 'MMM d, yyyy')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Inspection Deadline"
                      secondary={
                        <Typography
                          variant="body2"
                          color={new Date(escrowData.inspectionDeadline) < new Date() ? 'error' : 'text.secondary'}
                        >
                          {format(new Date(escrowData.inspectionDeadline), 'MMM d, yyyy')}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Appraisal Deadline"
                      secondary={format(new Date(escrowData.appraisalDeadline), 'MMM d, yyyy')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Loan Contingency"
                      secondary={format(new Date(escrowData.loanContingencyDeadline), 'MMM d, yyyy')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Closing Date"
                      secondary={
                        <Typography variant="body2" color="primary">
                          {format(new Date(escrowData.closingDate), 'MMM d, yyyy')}
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AttachMoney sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Financial Summary
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Purchase Price</TableCell>
                      <TableCell align="right">${escrowData.purchasePrice.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Earnest Money</TableCell>
                      <TableCell align="right">${escrowData.earnestMoneyDeposit.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Down Payment</TableCell>
                      <TableCell align="right">${escrowData.downPayment.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Loan Amount</TableCell>
                      <TableCell align="right">${escrowData.loanAmount.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Divider />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Commission ({escrowData.commissionPercentage}%)</TableCell>
                      <TableCell align="right">${escrowData.grossCommission.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Your Commission</strong></TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        ${escrowData.listingAgent.commission.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Timeline position="alternate">
              {escrowData.timeline.map((event, index) => (
                <TimelineItem key={event.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {format(new Date(event.date), 'MMM d, yyyy')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot 
                      color={
                        event.type === 'milestone' ? 'success' : 
                        event.type === 'financial' ? 'primary' : 
                        'info'
                      }
                    >
                      {event.type === 'milestone' && <CheckCircle />}
                      {event.type === 'financial' && <AttachMoney />}
                      {event.type === 'task' && <Assignment />}
                    </TimelineDot>
                    {index < escrowData.timeline.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      {event.event}
                    </Typography>
                    <Typography>{event.description}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {Object.entries(escrowChecklists).map(([key, checklist]) => (
            <Grid item xs={12} md={6} key={key}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {checklist.title}
                  </Typography>
                  <FormGroup>
                    {checklist.items.map((item) => (
                      <FormControlLabel
                        key={item.id}
                        control={
                          <Checkbox
                            checked={checklistStates[`${key}_${item.id}`] || false}
                            onChange={() => handleChecklistToggle(key, item.id)}
                            color={item.critical ? 'primary' : 'default'}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: checklistStates[`${key}_${item.id}`] ? 'line-through' : 'none',
                                color: checklistStates[`${key}_${item.id}`] ? 'text.secondary' : 'text.primary',
                              }}
                            >
                              {item.label}
                            </Typography>
                            {item.critical && (
                              <Chip
                                label="Critical"
                                size="small"
                                color="error"
                                sx={{ ml: 1, height: 20 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Transaction Documents
              </Typography>
              <Button
                variant="contained"
                startIcon={<Upload />}
                size="small"
              >
                Upload Document
              </Button>
            </Box>
            <List>
              {escrowData.documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <Description />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={doc.name}
                    secondary={
                      <>
                        {doc.type} • {doc.size} • Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')} by {doc.uploadedBy}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {doc.status === 'signed' && (
                      <Chip label="Signed" color="success" size="small" sx={{ mr: 1 }} />
                    )}
                    {doc.status === 'review' && (
                      <Chip label="Review Required" color="warning" size="small" sx={{ mr: 1 }} />
                    )}
                    <Button size="small">View</Button>
                    <Button size="small">Download</Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Financial Breakdown
            </Typography>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Purchase Price</strong></TableCell>
                  <TableCell align="right">${escrowData.purchasePrice.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Earnest Money Deposit</TableCell>
                  <TableCell align="right">${escrowData.earnestMoneyDeposit.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Down Payment (20%)</TableCell>
                  <TableCell align="right">${escrowData.downPayment.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Loan Amount</TableCell>
                  <TableCell align="right">${escrowData.loanAmount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell colSpan={2}><strong>Commission Details</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Commission ({escrowData.commissionPercentage}%)</TableCell>
                  <TableCell align="right">${escrowData.grossCommission.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Listing Agent (50%)</TableCell>
                  <TableCell align="right">${escrowData.listingAgent.commission.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Buyer's Agent (50%)</TableCell>
                  <TableCell align="right">${escrowData.buyerAgent.commission.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Net Commission (after split)</strong></TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    <strong>${escrowData.netCommission.toLocaleString()}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Performance Indicators
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Days on Market"
                      secondary="From listing to contract"
                    />
                    <Typography variant="h6" color="primary">
                      12 days
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Contract to Close"
                      secondary="Expected closing time"
                    />
                    <Typography variant="h6" color="primary">
                      30 days
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="List to Sale Ratio"
                      secondary="Final price vs list price"
                    />
                    <Typography variant="h6" color="success.main">
                      104.2%
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transaction Health Score
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center', my: 3 }}>
                  <CircularProgress
                    variant="determinate"
                    value={85}
                    size={180}
                    thickness={4}
                    color="success"
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" component="div" color="text.secondary">
                        85%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Excellent
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Alert severity="success">
                  Transaction is progressing smoothly with all deadlines met on time.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><ContentCopy /></ListItemIcon>
          Duplicate Escrow
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Download /></ListItemIcon>
          Export Report
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <ListItemIcon><Error sx={{ color: 'error.main' }} /></ListItemIcon>
          Cancel Escrow
        </MenuItem>
      </Menu>

      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => addNoteMutation.mutate(newNote)} 
            variant="contained"
            disabled={!newNote.trim() || addNoteMutation.isLoading}
          >
            {addNoteMutation.isLoading ? 'Adding...' : 'Add Note'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EscrowDetail;