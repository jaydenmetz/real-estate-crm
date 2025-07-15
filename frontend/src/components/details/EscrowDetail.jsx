// frontend/src/components/details/EscrowDetail.jsx

import React, { useState } from 'react';
import DetailPageDebugger from '../common/DetailPageDebugger';
import DetailPageErrorBoundary from '../common/DetailPageErrorBoundary';
import EscrowDashboard from './EscrowDashboard';
import MetricCard from '../escrows/MetricCard';
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
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
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
  Select,
  FormControl,
  InputLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TableContainer,
  InputAdornment,
  Switch,
  ButtonGroup,
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
  Badge,
  AccountTree,
  Store,
  AddTask,
  EventNote,
  HourglassEmpty,
  Flag,
  Visibility,
  VisibilityOff,
  CheckBox,
  CheckBoxOutlineBlank,
  IndeterminateCheckBox,
  Category,
  Domain,
  PeopleAlt,
  DateRange,
  Receipt,
  Task,
  Analytics,
  SystemUpdate,
  BarChart,
  BedOutlined,
  BathtubOutlined,
  SquareFootOutlined,
  Landscape,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, differenceInDays, addDays, parseISO, isValid } from 'date-fns';
import { useSnackbar } from 'notistack';
import { escrowsAPI } from '../../services/api';

// Safe date parsing function
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Invalid date:', dateValue);
    return null;
  }
};

// Safe date formatting function
const safeFormatDate = (dateValue, formatString = 'MMM d, yyyy') => {
  const date = safeParseDate(dateValue);
  if (!date) return 'N/A';
  try {
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Calculate days between dates
const calculateDaysBetween = (startDate, endDate) => {
  const start = safeParseDate(startDate);
  const end = safeParseDate(endDate);
  if (!start || !end) return null;
  try {
    return differenceInDays(end, start);
  } catch (error) {
    return null;
  }
};

// Property types
const PROPERTY_TYPES = ['SFR', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial'];
const TRANSACTION_TYPES = ['Purchase', 'Listing', 'Both Sides'];
const ESCROW_STATUSES = ['Active', 'Pending', 'Closed', 'Cancelled', 'Hold'];

// Mock comprehensive escrow data
const mockEscrowDetail = {
  // Core Information
  id: 'esc_001',
  escrowNumber: 'ESC-2025-001',
  propertyAddress: '456 Ocean View Dr, La Jolla, CA 92037',
  escrowStatus: 'Active',
  transactionType: 'Both Sides',
  escrowOpenDate: '2025-01-05',
  scheduledCoeDate: '2025-02-05',
  actualCoeDate: null,
  mlsNumber: 'MLS-2025-123456',
  propertyType: 'SFR',
  
  // Property Features
  bedrooms: 4,
  bathrooms: 3,
  squareFootage: 3200,
  lotSize: 8500, // sq ft
  yearBuilt: 2018,
  
  // Financial Details
  purchasePrice: 1250000,
  listPrice: 1200000,
  loanAmount: 1000000,
  downPaymentAmount: 250000,
  downPaymentPercentage: 20,
  commissionPercentageBuySide: 2.5,
  commissionPercentageListSide: 2.5,
  grossCommission: 62500,
  myCommission: 31250,
  commissionSplit: 70,
  commissionAdjustments: -2500,
  commissionAdjustmentNotes: 'Transaction coordinator fee',
  referralFee: 0,
  transactionCoordinatorFee: 500,
  homeWarrantyCost: 600,
  expenseAdjustments: 0,
  totalExpenses: 3600,
  netCommission: 27650,
  cashToClose: 265000,
  vpExpensesPaidThroughEscrow: 0,
  
  // Relations
  clients: [
    { id: 'cli_001', name: 'Michael Chen', type: 'Buyer', email: 'mchen@email.com', phone: '(858) 555-1234' },
    { id: 'cli_002', name: 'Sarah Chen', type: 'Buyer', email: 'schen@email.com', phone: '(858) 555-1235' }
  ],
  leadSource: { id: 'lead_001', name: 'Zillow', type: 'Online' },
  listing: { id: 'list_001', mlsNumber: 'MLS-2025-123456', address: '456 Ocean View Dr' },
  propertyInquiries: [
    { id: 'inq_001', date: '2024-12-15', source: 'Website', notes: 'Initial inquiry' }
  ],
  appointments: [
    { id: 'apt_001', date: '2024-12-20', type: 'Showing', notes: 'First showing' },
    { id: 'apt_002', date: '2025-01-03', type: 'Inspection', notes: 'Home inspection' }
  ],
  openHouse: { id: 'oh_001', date: '2024-12-10', visitors: 45 },
  transactionCoordinator: { id: 'tc_001', name: 'Jessica Martinez', company: 'Premier TC Services' },
  buyerAgent: { id: 'ba_001', name: 'You', email: 'you@realty.com', phone: '(858) 555-0001' },
  listingAgent: { id: 'la_001', name: 'You', email: 'you@realty.com', phone: '(858) 555-0001' },
  loanOfficer: { id: 'lo_001', name: 'Robert Smith', company: 'Wells Fargo', phone: '(858) 555-2001' },
  escrowOfficer: { id: 'eo_001', name: 'Linda Thompson', company: 'Pacific Escrow', phone: '(858) 555-3001' },
  titleOfficer: { id: 'to_001', name: 'James Wilson', company: 'First American Title', phone: '(858) 555-3002' },
  homeInspector: { id: 'hi_001', name: 'Mike Johnson', company: 'A+ Home Inspections', phone: '(858) 555-4001' },
  termiteInspector: { id: 'ti_001', name: 'Tom Davis', company: 'Termite Control Inc', phone: '(858) 555-4002' },
  homeWarrantyCompany: { id: 'hw_001', name: 'American Home Shield', phone: '1-800-555-0001' },
  nhdCompany: { id: 'nhd_001', name: 'Property ID', phone: '(858) 555-5001' },
  appraiser: { id: 'ap_001', name: 'Susan Lee', company: 'Accurate Appraisals', phone: '(858) 555-6001' },
  
  // Important Dates & Deadlines
  acceptanceDate: '2025-01-02',
  emdDueDate: '2025-01-05',
  emdReceivedDate: '2025-01-04',
  inspectionPeriodEndDate: '2025-01-12',
  contingencyRemovalDate: '2025-01-15',
  loanContingencyDate: '2025-01-20',
  appraisalContingencyDate: '2025-01-18',
  allContingenciesRemovedDate: null,
  loanApprovalDate: null,
  clearToCloseDate: null,
  signingDate: null,
  fundingDate: null,
  recordingDate: null,
  possessionDate: null,
  
  // Document Tracking
  purchaseAgreementStatus: 'Signed',
  counterOffers: 2,
  addendums: ['Solar Lease Transfer', 'Repair Request'],
  sellerDisclosuresStatus: 'Received',
  inspectionReportsStatus: 'Complete',
  repairRequestsStatus: 'Negotiating',
  titleReportStatus: 'In Progress',
  hoaDocumentsStatus: 'Pending',
  loanDocumentsStatus: 'Processing',
  closingDocumentsStatus: 'Not Started',
  
  // Communication Log
  lastClientContactDate: '2025-01-14',
  nextFollowUpDate: '2025-01-16',
  importantNotes: 'Buyers are very motivated. Must close by Feb 5 for job relocation.',
  specialInstructions: 'Call before 5 PM only. Prefer text communication.',
  redFlags: 'Appraisal may come in low - comps are mixed',
  
  // Analytics Fields
  leadSourceType: 'Online',
  marketingCampaign: 'Google Ads Q4 2024',
  totalMarketingCost: 2500,
  timeFromLeadToContract: 18,
  timeFromContractToClose: null,
  clientSatisfactionScore: null,
  wouldReferScore: null,
  
  // System Fields
  createdDate: '2025-01-02',
  lastModifiedDate: '2025-01-14',
  createdBy: 'Jayden Metz',
  assignedTo: 'Jayden Metz',
  tags: ['Hot Lead', 'Cash Buyer', 'Relocation'],
  priorityLevel: 'High',
  archivedStatus: false,
};

// Checklist items organized by phase
const escrowChecklists = {
  phase1: {
    title: 'Phase 1: First Day of Escrow',
    items: [
      { id: 'fully_executed_pa', label: 'Fully Executed Purchase Agreement Received', critical: true },
      { id: 'open_escrow', label: 'Open Escrow with Title/Escrow Company', critical: true },
      { id: 'send_congrats', label: 'Send Congratulations to Client', critical: false },
      { id: 'add_contacts_crm', label: 'Add All Contacts to CRM', critical: true },
      { id: 'add_contacts_phone', label: 'Add All Contacts to Phone', critical: false },
      { id: 'intro_email', label: 'Send Introduction Email to All Parties', critical: true },
      { id: 'order_nhd', label: 'Order NHD Report', critical: true },
      { id: 'confirm_emd', label: 'Confirm EMD Deposit Instructions', critical: true },
      { id: 'emd_deposited', label: 'EMD Deposited', critical: true },
      { id: 'update_mls', label: 'Update MLS Status to Pending', critical: true },
      { id: 'create_drive_folder', label: 'Create Transaction Folder in Google Drive', critical: false },
      { id: 'send_tc_glide', label: 'Send TC (Transaction Coordinator) Glide Invite', critical: false },
      { id: 'tc_intro_sent', label: 'TC Introduction Email Sent', critical: false },
    ]
  },
  phase2: {
    title: 'Phase 2: Inspections/Contingency Phase',
    items: [
      { id: 'schedule_inspection', label: 'Schedule Home Inspection', critical: true },
      { id: 'inspection_ordered', label: 'Home Inspection Ordered', critical: true },
      { id: 'inspection_completed', label: 'Home Inspection Completed', critical: true },
      { id: 'inspection_report', label: 'Home Inspection Report Received', critical: true },
      { id: 'review_inspection', label: 'Review Inspection Report with Client', critical: true },
      { id: 'schedule_termite', label: 'Schedule Termite Inspection', critical: true },
      { id: 'termite_completed', label: 'Termite Inspection Completed', critical: true },
      { id: 'termite_report', label: 'Termite Report Received', critical: true },
      { id: 'schedule_roof', label: 'Schedule Roof Inspection (if needed)', critical: false },
      { id: 'schedule_pool', label: 'Schedule Pool/Spa Inspection (if applicable)', critical: false },
      { id: 'sewer_inspection', label: 'Sewer Line Inspection (if applicable)', critical: false },
      { id: 'repair_request', label: 'Request for Repairs Submitted (if applicable)', critical: false },
      { id: 'repair_response', label: 'Repair Response Received', critical: false },
      { id: 'repair_negotiations', label: 'Repair Negotiations Complete', critical: false },
      { id: 'seller_disclosures', label: 'Seller Disclosures Received', critical: true },
      { id: 'review_disclosures', label: 'Seller Disclosures Reviewed with Client', critical: true },
      { id: 'hoa_docs', label: 'HOA Documents Received (if applicable)', critical: false },
      { id: 'hoa_reviewed', label: 'HOA Documents Reviewed', critical: false },
      { id: 'avid_received', label: 'AVID (Additional Disclosures) Received', critical: true },
      { id: 'prelim_title', label: 'Preliminary Title Report Received', critical: true },
      { id: 'title_reviewed', label: 'Title Report Reviewed', critical: true },
      { id: 'order_warranty', label: 'Order Home Warranty', critical: false },
      { id: 'appraisal_ordered', label: 'Appraisal Ordered', critical: true },
      { id: 'appraisal_scheduled', label: 'Appraisal Appointment Scheduled', critical: true },
      { id: 'appraisal_completed', label: 'Appraisal Completed', critical: true },
      { id: 'appraisal_report', label: 'Appraisal Report Received', critical: true },
      { id: 'appraisal_value', label: 'Appraisal Value Confirmed', critical: true },
      { id: 'remove_inspection_cont', label: 'Remove Inspection Contingency', critical: true },
      { id: 'remove_appraisal_cont', label: 'Remove Appraisal Contingency', critical: true },
      { id: 'remove_loan_cont', label: 'Remove Loan Contingency', critical: true },
      { id: 'all_cont_removed', label: 'All Contingencies Removed', critical: true },
    ]
  },
  phase3: {
    title: 'Phase 3: Closing Preparation Phase',
    items: [
      { id: 'loan_estimate', label: 'Loan Estimate (LE) Received', critical: true },
      { id: 'le_reviewed', label: 'Loan Estimate Reviewed with Client', critical: true },
      { id: 'rate_locked', label: 'Interest Rate Locked', critical: true },
      { id: 'loan_approved', label: 'Loan Approved', critical: true },
      { id: 'clear_to_close', label: 'Clear to Close Received', critical: true },
      { id: 'closing_disclosure', label: 'Closing Disclosure (CD) Received', critical: true },
      { id: 'cd_reviewed', label: 'CD Reviewed with Client', critical: true },
      { id: 'schedule_signing', label: 'Schedule Signing Appointment', critical: true },
      { id: 'final_walkthrough_sched', label: 'Final Walkthrough Scheduled', critical: true },
      { id: 'final_walkthrough_done', label: 'Final Walkthrough Completed', critical: true },
      { id: 'utilities_info', label: 'Utilities Transfer Information Sent', critical: false },
      { id: 'solar_transfer', label: 'Solar Transfer Initiated (if applicable)', critical: false },
      { id: 'cash_wired', label: 'Cash to Close Wired', critical: true },
      { id: 'docs_signed', label: 'Loan Documents Signed', critical: true },
      { id: 'loan_funded', label: 'Loan Funded', critical: true },
      { id: 'recording_confirmed', label: 'Recording Confirmed', critical: true },
      { id: 'commission_received', label: 'Commission Disbursement Confirmed', critical: true },
      { id: 'keys_delivered', label: 'Keys Delivered', critical: true },
      { id: 'possession_given', label: 'Possession Given', critical: true },
      { id: 'mls_closed', label: 'Update MLS Status to Closed', critical: true },
      { id: 'closing_gift', label: 'Send Closing Gift', critical: false },
      { id: 'request_reviews', label: 'Request Reviews/Testimonials', critical: false },
      { id: 'post_close_drip', label: 'Add to Post-Close Drip Campaign', critical: false },
    ]
  }
};

const EscrowDetail = ({ defaultView = 'dashboard' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  const [viewMode, setViewMode] = useState(defaultView);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    coreInfo: true,
    financial: true,
    relations: true,
    dates: true,
    documents: true,
    communication: true,
    analytics: true,
    system: true,
  });
  const [showPrivateFinancials, setShowPrivateFinancials] = useState(false);
  const [checklistStates, setChecklistStates] = useState({});
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Fetch escrow details
  const { data: escrow, isLoading, error } = useQuery(
    ['escrow', id],
    async () => {
      try {
        const response = await escrowsAPI.getOne(id);
        return response.data?.data || response.data;
      } catch (err) {
        console.error('API error:', err);
        return mockEscrowDetail;
      }
    },
    {
      refetchInterval: 30000,
      retry: 1,
    }
  );

  const escrowData = escrow || mockEscrowDetail;
  
  // Calculate derived values
  const daysInEscrow = calculateDaysBetween(escrowData.escrowOpenDate, new Date());
  const daysToEmd = calculateDaysBetween(escrowData.acceptanceDate, escrowData.emdDueDate);
  const daysToContingencyRemoval = calculateDaysBetween(new Date(), escrowData.contingencyRemovalDate);
  
  // Calculate checklist progress
  const calculateChecklistProgress = () => {
    let completed = 0;
    let total = 0;
    
    Object.values(escrowChecklists).forEach(phase => {
      phase.items.forEach(item => {
        total++;
        if (checklistStates[item.id]) completed++;
      });
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Initialize checklist states
  React.useEffect(() => {
    if (escrowData.checklists) {
      setChecklistStates(escrowData.checklists);
    }
  }, [escrowData]);

  // Update checklist mutation
  const updateChecklistMutation = useMutation(
    ({ itemId, checked }) => 
      escrowsAPI.updateChecklist(id, { itemId, checked }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['escrow', id]);
      }
    }
  );

  const handleChecklistToggle = (itemId) => {
    const newValue = !checklistStates[itemId];
    setChecklistStates(prev => ({
      ...prev,
      [itemId]: newValue
    }));
    updateChecklistMutation.mutate({ itemId, checked: newValue });
  };

  const handleBulkChecklistAction = (action) => {
    if (action === 'check' || action === 'uncheck') {
      const updates = {};
      selectedItems.forEach(itemId => {
        updates[itemId] = action === 'check';
      });
      setChecklistStates(prev => ({ ...prev, ...updates }));
      // TODO: Batch update API call
    }
    setSelectedItems(new Set());
    setBulkSelectMode(false);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'success',
      'Pending': 'warning',
      'Closed': 'default',
      'Cancelled': 'error',
      'Hold': 'info'
    };
    return colors[status] || 'default';
  };

  const getDeadlineColor = (date) => {
    const deadlineDate = safeParseDate(date);
    if (!deadlineDate) return 'text.secondary';
    const daysUntil = differenceInDays(deadlineDate, new Date());
    if (daysUntil < 0) return 'error';
    if (daysUntil <= 3) return 'warning.main';
    return 'text.secondary';
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const checklistProgress = calculateChecklistProgress();

  // Show dashboard view if selected
  if (viewMode === 'dashboard') {
    return <EscrowDashboard />;
  }

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
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navigate('/escrows')} sx={{ mr: 2 }}>
                <ArrowBack />
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  {escrowData.propertyAddress}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip
                    label={escrowData.escrowStatus}
                    color={getStatusColor(escrowData.escrowStatus)}
                    size="small"
                  />
                  <Chip
                    label={escrowData.transactionType}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={escrowData.propertyType}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<Badge />}
                    label={`Escrow #${escrowData.escrowNumber}`}
                    variant="outlined"
                    size="small"
                  />
                  {escrowData.mlsNumber && (
                    <Chip
                      label={`MLS #${escrowData.mlsNumber}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {escrowData.priorityLevel === 'High' && (
                    <Chip
                      icon={<Flag />}
                      label="High Priority"
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
                {/* Property Features */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BedOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {escrowData.bedrooms || 3} beds
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BathtubOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {escrowData.bathrooms || 2} baths
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SquareFootOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {escrowData.squareFootage?.toLocaleString() || '2,000'} sq ft
                    </Typography>
                  </Box>
                  {escrowData.lotSize > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Landscape sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {escrowData.lotSize >= 43560 
                          ? `${(escrowData.lotSize / 43560).toFixed(1)} acres`
                          : `${escrowData.lotSize?.toLocaleString()} sq ft lot`
                        }
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="dashboard">
                  <BarChart sx={{ mr: 1 }} />
                  Dashboard
                </ToggleButton>
                <ToggleButton value="details">
                  <Category sx={{ mr: 1 }} />
                  Details
                </ToggleButton>
              </ToggleButtonGroup>
              <ButtonGroup>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </ButtonGroup>
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar with Percentage */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Overall Completion</Typography>
            <Typography variant="body2" fontWeight="bold">{checklistProgress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={checklistProgress}
            sx={{ height: 10, borderRadius: 5 }}
            color={checklistProgress === 100 ? 'success' : checklistProgress > 75 ? 'primary' : 'warning'}
          />
        </Box>
      </Paper>

      {/* Key Metrics with Expandable Details */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Days to Close"
            value={daysToClose || 'N/A'}
            icon={<Schedule />}
            color={daysToClose && daysToClose <= 7 ? 'error' : 'primary'}
            trend={-5}
            escrowData={escrowData}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="My Commission"
            value={(escrowData.grossCommission || escrowData.purchasePrice * 0.025) * 0.5}
            icon={<AttachMoney />}
            color="success"
            trend={12}
            escrowData={escrowData}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Checklist Progress"
            value={`${checklistProgress}%`}
            icon={<Task />}
            color="info"
            trend={8}
            escrowData={escrowData}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Communication Score"
            value={92}
            icon={<Chat />}
            color="primary"
            trend={3}
            escrowData={escrowData}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Category />} label="Core Info" iconPosition="start" />
          <Tab icon={<AttachMoney />} label="Financial" iconPosition="start" />
          <Tab icon={<AccountTree />} label="Relations" iconPosition="start" />
          <Tab icon={<DateRange />} label="Dates" iconPosition="start" />
          <Tab icon={<Task />} label="Checklist" iconPosition="start" />
          <Tab icon={<Description />} label="Documents" iconPosition="start" />
          <Tab icon={<History />} label="Communication" iconPosition="start" />
          <Tab icon={<Analytics />} label="Analytics" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                <Domain sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Core Information
              </Typography>
              <IconButton onClick={() => toggleSection('coreInfo')}>
                {expandedSections.coreInfo ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.coreInfo}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" width="40%">Escrow ID/Number</TableCell>
                        <TableCell>{escrowData.escrowNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Property Address</TableCell>
                        <TableCell>{escrowData.propertyAddress}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Escrow Status</TableCell>
                        <TableCell>
                          <Chip 
                            label={escrowData.escrowStatus} 
                            color={getStatusColor(escrowData.escrowStatus)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Transaction Type</TableCell>
                        <TableCell>{escrowData.transactionType}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Property Type</TableCell>
                        <TableCell>{escrowData.propertyType}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" width="40%">Escrow Open Date</TableCell>
                        <TableCell>{safeFormatDate(escrowData.escrowOpenDate)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Scheduled COE Date</TableCell>
                        <TableCell>{safeFormatDate(escrowData.scheduledCoeDate)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Actual COE Date</TableCell>
                        <TableCell>{escrowData.actualCoeDate ? safeFormatDate(escrowData.actualCoeDate) : 'Pending'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Days in Escrow</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${daysInEscrow || 0} days`}
                            color={daysInEscrow > 30 ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">MLS Number</TableCell>
                        <TableCell>{escrowData.mlsNumber}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                <AttachMoney sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Financial Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={showPrivateFinancials}
                      onChange={(e) => setShowPrivateFinancials(e.target.checked)}
                    />
                  }
                  label="Show Private Fields"
                />
                <IconButton onClick={() => toggleSection('financial')}>
                  {expandedSections.financial ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </Box>
            
            <Collapse in={expandedSections.financial}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Transaction Details
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" width="50%">Purchase Price</TableCell>
                        <TableCell align="right">${escrowData.purchasePrice?.toLocaleString() || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">List Price</TableCell>
                        <TableCell align="right">${escrowData.listPrice?.toLocaleString() || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Loan Amount</TableCell>
                        <TableCell align="right">${escrowData.loanAmount?.toLocaleString() || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Down Payment Amount</TableCell>
                        <TableCell align="right">${escrowData.downPaymentAmount?.toLocaleString() || 0}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Down Payment %</TableCell>
                        <TableCell align="right">{escrowData.downPaymentPercentage || 0}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th">Cash to Close</TableCell>
                        <TableCell align="right">${escrowData.cashToClose?.toLocaleString() || 0}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Commission Details {!showPrivateFinancials && <Chip label="Private" size="small" />}
                  </Typography>
                  {showPrivateFinancials ? (
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" width="50%">Buy Side Commission</TableCell>
                          <TableCell align="right">{escrowData.commissionPercentageBuySide || 0}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">List Side Commission</TableCell>
                          <TableCell align="right">{escrowData.commissionPercentageListSide || 0}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Gross Commission</TableCell>
                          <TableCell align="right">${escrowData.grossCommission?.toLocaleString() || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">My Commission</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            ${escrowData.myCommission?.toLocaleString() || 0}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Commission Split</TableCell>
                          <TableCell align="right">{escrowData.commissionSplit || 0}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Adjustments</TableCell>
                          <TableCell align="right" sx={{ color: escrowData.commissionAdjustments < 0 ? 'error.main' : 'success.main' }}>
                            ${escrowData.commissionAdjustments?.toLocaleString() || 0}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Total Expenses</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            -${escrowData.totalExpenses?.toLocaleString() || 0}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell component="th" sx={{ fontWeight: 'bold' }}>Net Commission</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            ${escrowData.netCommission?.toLocaleString() || 0}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <VisibilityOff sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        Commission details are hidden. Toggle to view.
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                {showPrivateFinancials && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      Fees & Expenses
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Referral Fee</TableCell>
                          <TableCell align="right">${escrowData.referralFee?.toLocaleString() || 0}</TableCell>
                          <TableCell>Transaction Coordinator Fee</TableCell>
                          <TableCell align="right">${escrowData.transactionCoordinatorFee?.toLocaleString() || 0}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Home Warranty Cost</TableCell>
                          <TableCell align="right">${escrowData.homeWarrantyCost?.toLocaleString() || 0}</TableCell>
                          <TableCell>VP Expenses Paid Through Escrow</TableCell>
                          <TableCell align="right">${escrowData.vpExpensesPaidThroughEscrow?.toLocaleString() || 0}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {escrowData.commissionAdjustmentNotes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Adjustment Notes:</strong> {escrowData.commissionAdjustmentNotes}
                      </Alert>
                    )}
                  </Grid>
                )}
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Clients */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PeopleAlt sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Clients
                </Typography>
                <List>
                  {escrowData.clients?.map((client) => (
                    <ListItem key={client.id}>
                      <ListItemAvatar>
                        <Avatar>{client.name?.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {client.name}
                            <Chip label={client.type} size="small" color="primary" />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2">{client.email}</Typography>
                            <Typography variant="body2">{client.phone}</Typography>
                          </>
                        }
                      />
                      <Button size="small" onClick={() => navigate(`/clients/${client.id}`)}>
                        View
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Professional Team */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Business sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Professional Team
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Transaction Coordinator"
                      secondary={escrowData.transactionCoordinator?.name || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Buyer's Agent"
                      secondary={escrowData.buyerAgent?.name || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Listing Agent"
                      secondary={escrowData.listingAgent?.name || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Loan Officer"
                      secondary={`${escrowData.loanOfficer?.name || 'Not assigned'} - ${escrowData.loanOfficer?.company || ''}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Escrow Officer"
                      secondary={`${escrowData.escrowOfficer?.name || 'Not assigned'} - ${escrowData.escrowOfficer?.company || ''}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Title Officer"
                      secondary={`${escrowData.titleOfficer?.name || 'Not assigned'} - ${escrowData.titleOfficer?.company || ''}`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Vendors */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Store sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Vendors & Service Providers
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Home Inspector"
                          secondary={`${escrowData.homeInspector?.name || 'Not scheduled'} - ${escrowData.homeInspector?.company || ''}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Termite Inspector"
                          secondary={`${escrowData.termiteInspector?.name || 'Not scheduled'} - ${escrowData.termiteInspector?.company || ''}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Appraiser"
                          secondary={`${escrowData.appraiser?.name || 'Not scheduled'} - ${escrowData.appraiser?.company || ''}`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Home Warranty Company"
                          secondary={escrowData.homeWarrantyCompany?.name || 'Not selected'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="NHD Company"
                          secondary={escrowData.nhdCompany?.name || 'Not ordered'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Lead Source"
                          secondary={`${escrowData.leadSource?.name || 'Unknown'} - ${escrowData.leadSource?.type || ''}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Related Listing"
                          secondary={escrowData.listing?.mlsNumber || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <CalendarToday sx={{ mr: 1, verticalAlign: 'bottom' }} />
              Important Dates & Deadlines
            </Typography>
            
            <Grid container spacing={3}>
              {/* Contract & EMD Dates */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Contract & EMD
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Acceptance Date</TableCell>
                      <TableCell>{safeFormatDate(escrowData.acceptanceDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>EMD Due Date</TableCell>
                      <TableCell sx={{ color: getDeadlineColor(escrowData.emdDueDate) }}>
                        {safeFormatDate(escrowData.emdDueDate)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>EMD Received</TableCell>
                      <TableCell>
                        {escrowData.emdReceivedDate ? (
                          <Chip 
                            label={safeFormatDate(escrowData.emdReceivedDate)}
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip label="Pending" size="small" color="warning" />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Days to EMD</TableCell>
                      <TableCell>{daysToEmd || 0} days</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>

              {/* Contingency Dates */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Contingencies
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Inspection Period End</TableCell>
                      <TableCell sx={{ color: getDeadlineColor(escrowData.inspectionPeriodEndDate) }}>
                        {safeFormatDate(escrowData.inspectionPeriodEndDate)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Loan Contingency</TableCell>
                      <TableCell sx={{ color: getDeadlineColor(escrowData.loanContingencyDate) }}>
                        {safeFormatDate(escrowData.loanContingencyDate)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Appraisal Contingency</TableCell>
                      <TableCell sx={{ color: getDeadlineColor(escrowData.appraisalContingencyDate) }}>
                        {safeFormatDate(escrowData.appraisalContingencyDate)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>All Contingencies Removed</TableCell>
                      <TableCell>
                        {escrowData.allContingenciesRemovedDate ? (
                          <Chip 
                            label={safeFormatDate(escrowData.allContingenciesRemovedDate)}
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip label="Pending" size="small" color="warning" />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Days to Removal</TableCell>
                      <TableCell sx={{ color: daysToContingencyRemoval < 0 ? 'error' : 'inherit' }}>
                        {daysToContingencyRemoval || 0} days
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>

              {/* Closing Dates */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Closing Process
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Loan Approval</TableCell>
                      <TableCell>
                        {escrowData.loanApprovalDate ? safeFormatDate(escrowData.loanApprovalDate) : 'Pending'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Clear to Close</TableCell>
                      <TableCell>
                        {escrowData.clearToCloseDate ? safeFormatDate(escrowData.clearToCloseDate) : 'Pending'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Signing Date</TableCell>
                      <TableCell>
                        {escrowData.signingDate ? safeFormatDate(escrowData.signingDate) : 'Not scheduled'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Funding Date</TableCell>
                      <TableCell>
                        {escrowData.fundingDate ? safeFormatDate(escrowData.fundingDate) : 'Pending'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Recording Date</TableCell>
                      <TableCell>
                        {escrowData.recordingDate ? (
                          <Chip 
                            label={safeFormatDate(escrowData.recordingDate)}
                            size="small"
                            color="success"
                          />
                        ) : (
                          'Pending'
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Possession Date</TableCell>
                      <TableCell>
                        {escrowData.possessionDate ? safeFormatDate(escrowData.possessionDate) : 'COE'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Box>
          {/* Checklist Controls */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Phase</InputLabel>
                    <Select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      label="Filter by Phase"
                    >
                      <MenuItem value="all">All Phases</MenuItem>
                      <MenuItem value="phase1">Phase 1: First Day</MenuItem>
                      <MenuItem value="phase2">Phase 2: Contingencies</MenuItem>
                      <MenuItem value="phase3">Phase 3: Closing</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant={bulkSelectMode ? 'contained' : 'outlined'}
                    onClick={() => setBulkSelectMode(!bulkSelectMode)}
                    startIcon={<CheckBox />}
                  >
                    {bulkSelectMode ? 'Cancel Bulk' : 'Bulk Actions'}
                  </Button>
                </Box>
                
                {bulkSelectMode && selectedItems.size > 0 && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`${selectedItems.size} selected`} />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkChecklistAction('check')}
                    >
                      Check All
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkChecklistAction('uncheck')}
                    >
                      Uncheck All
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Checklist Items */}
          <Grid container spacing={2}>
            {Object.entries(escrowChecklists)
              .filter(([key]) => selectedPhase === 'all' || selectedPhase === key)
              .map(([key, phase]) => (
                <Grid item xs={12} key={key}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {phase.title}
                      </Typography>
                      <List>
                        {phase.items.map((item) => (
                          <ListItem key={item.id} dense>
                            {bulkSelectMode ? (
                              <ListItemIcon>
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedItems);
                                    if (e.target.checked) {
                                      newSelected.add(item.id);
                                    } else {
                                      newSelected.delete(item.id);
                                    }
                                    setSelectedItems(newSelected);
                                  }}
                                />
                              </ListItemIcon>
                            ) : (
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={checklistStates[item.id] || false}
                                  onChange={() => handleChecklistToggle(item.id)}
                                  color={item.critical ? 'primary' : 'default'}
                                />
                              </ListItemIcon>
                            )}
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      textDecoration: checklistStates[item.id] ? 'line-through' : 'none',
                                      color: checklistStates[item.id] ? 'text.secondary' : 'text.primary',
                                    }}
                                  >
                                    {item.label}
                                  </Typography>
                                  {item.critical && (
                                    <Chip
                                      label="Critical"
                                      size="small"
                                      color="error"
                                      sx={{ height: 20 }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={checklistStates[item.id] && (
                                <Typography variant="caption" color="text.secondary">
                                  Completed on {safeFormatDate(new Date())}
                                </Typography>
                              )}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {activeTab === 5 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Description sx={{ mr: 1, verticalAlign: 'bottom' }} />
              Document Tracking
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Purchase Agreement</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.purchaseAgreementStatus || 'Pending'}
                          size="small"
                          color={escrowData.purchaseAgreementStatus === 'Signed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Counter Offers</TableCell>
                      <TableCell>{escrowData.counterOffers || 0} counter(s)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Addendums</TableCell>
                      <TableCell>
                        {escrowData.addendums?.length > 0 ? (
                          <Stack direction="row" spacing={0.5}>
                            {escrowData.addendums.map((add, idx) => (
                              <Chip key={idx} label={add} size="small" />
                            ))}
                          </Stack>
                        ) : (
                          'None'
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Seller Disclosures</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.sellerDisclosuresStatus || 'Pending'}
                          size="small"
                          color={escrowData.sellerDisclosuresStatus === 'Received' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Inspection Reports</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.inspectionReportsStatus || 'Pending'}
                          size="small"
                          color={escrowData.inspectionReportsStatus === 'Complete' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Repair Requests</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.repairRequestsStatus || 'N/A'}
                          size="small"
                          color={escrowData.repairRequestsStatus === 'Negotiating' ? 'warning' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Title Report</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.titleReportStatus || 'Pending'}
                          size="small"
                          color={escrowData.titleReportStatus === 'Clear' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HOA Documents</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.hoaDocumentsStatus || 'N/A'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Loan Documents</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.loanDocumentsStatus || 'Pending'}
                          size="small"
                          color={escrowData.loanDocumentsStatus === 'Approved' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Closing Documents</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.closingDocumentsStatus || 'Not Started'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 6 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <History sx={{ mr: 1, verticalAlign: 'bottom' }} />
              Communication Log
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Last Client Contact</TableCell>
                        <TableCell>{safeFormatDate(escrowData.lastClientContactDate)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Next Follow-up</TableCell>
                        <TableCell sx={{ color: getDeadlineColor(escrowData.nextFollowUpDate) }}>
                          {safeFormatDate(escrowData.nextFollowUpDate)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Box>
            
            {escrowData.importantNotes && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Important Notes</Typography>
                <Typography variant="body2">{escrowData.importantNotes}</Typography>
              </Alert>
            )}
            
            {escrowData.specialInstructions && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Special Instructions</Typography>
                <Typography variant="body2">{escrowData.specialInstructions}</Typography>
              </Alert>
            )}
            
            {escrowData.redFlags && (
              <Alert severity="error">
                <Typography variant="subtitle2" gutterBottom>Red Flags/Concerns</Typography>
                <Typography variant="body2">{escrowData.redFlags}</Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 7 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Analytics Fields
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Lead Source Type</TableCell>
                      <TableCell>{escrowData.leadSourceType || 'Unknown'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Marketing Campaign</TableCell>
                      <TableCell>{escrowData.marketingCampaign || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Marketing Cost</TableCell>
                      <TableCell>${escrowData.totalMarketingCost?.toLocaleString() || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Time from Lead to Contract</TableCell>
                      <TableCell>{escrowData.timeFromLeadToContract || 0} days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Time from Contract to Close</TableCell>
                      <TableCell>{escrowData.timeFromContractToClose || 'In Progress'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Client Satisfaction Score</TableCell>
                      <TableCell>{escrowData.clientSatisfactionScore || 'Pending'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Would Refer Score</TableCell>
                      <TableCell>{escrowData.wouldReferScore || 'Pending'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SystemUpdate sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  System Fields
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Created Date</TableCell>
                      <TableCell>{safeFormatDate(escrowData.createdDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Last Modified</TableCell>
                      <TableCell>{safeFormatDate(escrowData.lastModifiedDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Created By</TableCell>
                      <TableCell>{escrowData.createdBy}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>{escrowData.assignedTo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tags</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {escrowData.tags?.map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Priority Level</TableCell>
                      <TableCell>
                        <Chip 
                          label={escrowData.priorityLevel}
                          size="small"
                          color={escrowData.priorityLevel === 'High' ? 'error' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Archived Status</TableCell>
                      <TableCell>{escrowData.archivedStatus ? 'Archived' : 'Active'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon><Notifications /></ListItemIcon>
          Set Reminders
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <ListItemIcon><Error sx={{ color: 'error.main' }} /></ListItemIcon>
          Cancel Escrow
        </MenuItem>
      </Menu>
    </Container>
  );
};

// Wrap with error boundary
const EscrowDetailWithErrorBoundary = () => (
  <DetailPageErrorBoundary pageName="Escrow Detail">
    <EscrowDetail />
  </DetailPageErrorBoundary>
);

export default EscrowDetailWithErrorBoundary;