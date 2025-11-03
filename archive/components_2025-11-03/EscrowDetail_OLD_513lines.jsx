import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Timeline as TimelineIcon,
  Assignment,
  AttachMoney,
  People,
  SmartToy,
  AutoAwesome,
  ChecklistRtl,
} from '@mui/icons-material';
import { escrowsAPI } from '../../services/api.service';
import EscrowCard from '../common/widgets/EscrowCard';

const EscrowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineTab, setTimelineTab] = useState(0);

  // Fetch escrow data
  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        setLoading(true);
        const response = await escrowsAPI.getById(id);
        if (response.success) {
          setEscrow(response.data);
        } else {
          setError('Failed to load escrow details');
        }
      } catch (err) {
        console.error('Error fetching escrow:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEscrow();
    }
  }, [id]);

  const handleUpdateEscrow = async (escrowId, updates) => {
    try {
      const response = await escrowsAPI.update(escrowId, updates);
      if (response.success) {
        setEscrow(response.data);
      }
    } catch (err) {
      console.error('Error updating escrow:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!escrow) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Escrow not found</Alert>
      </Box>
    );
  }

  // Mock timeline data (will be replaced with real data)
  const timelineEvents = [
    { id: 1, date: '2025-10-14', type: 'update', title: 'Escrow opened', description: 'Escrow opened by Jayden Metz' },
    { id: 2, date: '2025-10-13', type: 'update', title: 'Inspection scheduled', description: 'Home inspection scheduled for Oct 20' },
    { id: 3, date: '2025-10-12', type: 'task', title: 'Earnest money deposited', description: 'Buyer deposited $5,000 earnest money' },
  ];

  const upcomingTasks = [
    { id: 1, title: 'Order appraisal', dueDate: '2025-10-18', priority: 'high' },
    { id: 2, title: 'Send disclosures to buyer', dueDate: '2025-10-20', priority: 'medium' },
    { id: 3, title: 'Schedule final walkthrough', dueDate: '2025-11-10', priority: 'low' },
  ];

  // Mock automation/actions data
  const automations = [
    { id: 1, name: 'Auto-send contingency reminders', enabled: true },
    { id: 2, name: 'Track document signatures', enabled: true },
    { id: 3, name: 'Send closing day reminder', enabled: false },
  ];

  const quickActions = [
    { id: 1, label: 'Generate closing statement', icon: <AttachMoney /> },
    { id: 2, label: 'Email all parties', icon: <People /> },
    { id: 3, label: 'Request documents', icon: <Assignment /> },
  ];

  // Mock checklist data
  const checklists = escrow.checklists || {
    buyer_tasks: {
      earnest_money_deposited: true,
      loan_application_submitted: true,
      inspection_completed: false,
      appraisal_ordered: false,
      appraisal_received: false,
      homeowners_insurance: false,
      final_walkthrough: false,
      loan_approval_received: false,
    },
    seller_tasks: {
      disclosures_provided: true,
      repairs_completed: false,
      utilities_scheduled: false,
      property_vacant: false,
      keys_provided: false,
    },
    escrow_tasks: {
      title_ordered: true,
      title_cleared: false,
      funds_wired: false,
      documents_recorded: false,
      final_closing_statement: false,
    },
  };

  const checklistLabels = {
    buyer_tasks: {
      earnest_money_deposited: 'Earnest Money Deposited',
      loan_application_submitted: 'Loan Application Submitted',
      inspection_completed: 'Inspection Completed',
      appraisal_ordered: 'Appraisal Ordered',
      appraisal_received: 'Appraisal Received',
      homeowners_insurance: 'Homeowners Insurance',
      final_walkthrough: 'Final Walkthrough',
      loan_approval_received: 'Loan Approval Received',
    },
    seller_tasks: {
      disclosures_provided: 'Disclosures Provided',
      repairs_completed: 'Repairs Completed',
      utilities_scheduled: 'Utilities Scheduled',
      property_vacant: 'Property Vacant',
      keys_provided: 'Keys Provided',
    },
    escrow_tasks: {
      title_ordered: 'Title Ordered',
      title_cleared: 'Title Cleared',
      funds_wired: 'Funds Wired',
      documents_recorded: 'Documents Recorded',
      final_closing_statement: 'Final Closing Statement',
    },
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pt: 3, pb: 6 }}>
      <Box sx={{ maxWidth: 1800, mx: 'auto', px: 3 }}>
        {/* Main Layout: 3 columns */}
        <Box sx={{ display: 'flex', gap: 3 }}>

          {/* LEFT SIDEBAR - Escrow Details, Financials, People */}
          <Box sx={{ width: 280, flexShrink: 0 }}>
            {/* Escrow Details */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: 14 }}>
                Escrow Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={escrow.escrowStatus || 'Active'} size="small" color="primary" sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Opened</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {escrow.acceptance_date || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Closing</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {escrow.closing_date || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Escrow #</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {escrow.displayId || escrow.display_id}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Financials */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: 14 }}>
                Financials
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Purchase Price</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${Number(escrow.purchasePrice || escrow.purchase_price || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">My Commission</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ${Number(escrow.myCommission || escrow.my_commission || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* People */}
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: 14 }}>
                People
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {escrow.buyer_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Buyer</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.buyer_name}</Typography>
                  </Box>
                )}
                {escrow.seller_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Seller</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.seller_name}</Typography>
                  </Box>
                )}
                {escrow.buyer_agent_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Buyer's Agent</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.buyer_agent_name}</Typography>
                  </Box>
                )}
                {escrow.listing_agent_name && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Listing Agent</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.listing_agent_name}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          {/* CENTER - Large Escrow Card + Timeline */}
          <Box sx={{ flex: 1 }}>
            {/* Large Escrow Card */}
            <Box sx={{ mb: 3 }}>
              <EscrowCard
                escrow={escrow}
                viewMode="large"
                animationType="none"
                onUpdate={handleUpdateEscrow}
              />
            </Box>

            {/* Tabbed Timeline */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Tabs value={timelineTab} onChange={(e, val) => setTimelineTab(val)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab icon={<TimelineIcon />} label="Timeline" iconPosition="start" />
                <Tab icon={<Assignment />} label="Upcoming Tasks" iconPosition="start" />
              </Tabs>

              {/* Timeline Tab */}
              {timelineTab === 0 && (
                <Box sx={{ p: 3 }}>
                  {timelineEvents.map((event) => (
                    <Paper
                      key={event.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">{event.date}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {event.description}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Upcoming Tasks Tab */}
              {timelineTab === 1 && (
                <Box sx={{ p: 3 }}>
                  {upcomingTasks.map((task) => (
                    <Paper
                      key={task.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{task.title}</Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">Due: {task.dueDate}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {/* RIGHT SIDEBAR - AI Agent, Automations, Checklists */}
          <Box sx={{ width: 320, flexShrink: 0 }}>
            {/* AI Agent Slot */}
            <Paper sx={{ p: 3, mb: 2, borderRadius: 3, background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.1)} 0%, ${alpha('#6366f1', 0.1)} 100%)`, border: `1px solid ${alpha('#8b5cf6', 0.2)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SmartToy sx={{ fontSize: 28, color: '#8b5cf6' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>AI Assistant</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Coming soon: Your AI-powered escrow assistant will help automate tasks, predict issues, and provide insights.
              </Typography>
              <Chip label="Coming Soon" size="small" sx={{ bgcolor: alpha('#8b5cf6', 0.2), color: '#8b5cf6', fontWeight: 700 }} />
            </Paper>

            {/* Automations & Quick Actions */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: 14 }}>
                Automations
              </Typography>
              <List dense>
                {automations.map((auto) => (
                  <ListItem key={auto.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <AutoAwesome sx={{ fontSize: 18, color: auto.enabled ? 'success.main' : 'text.disabled' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={auto.name}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                    <Chip label={auto.enabled ? 'On' : 'Off'} size="small" color={auto.enabled ? 'success' : 'default'} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: 14 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quickActions.map((action) => (
                  <Paper
                    key={action.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      }
                    }}
                  >
                    {action.icon}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{action.label}</Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>

            {/* Checklists */}
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: 14 }}>
                Checklists
              </Typography>

              {/* Buyer Tasks */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ChecklistRtl sx={{ fontSize: 18, color: '#10b981' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Buyer Tasks</Typography>
                </Box>
                <List dense>
                  {Object.entries(checklists.buyer_tasks || {}).map(([key, completed]) => (
                    <ListItem key={key} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {completed ? (
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.disabled' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={checklistLabels.buyer_tasks[key]}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { textDecoration: completed ? 'line-through' : 'none', color: completed ? 'text.secondary' : 'text.primary' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Seller Tasks */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ChecklistRtl sx={{ fontSize: 18, color: '#f59e0b' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Seller Tasks</Typography>
                </Box>
                <List dense>
                  {Object.entries(checklists.seller_tasks || {}).map(([key, completed]) => (
                    <ListItem key={key} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {completed ? (
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.disabled' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={checklistLabels.seller_tasks[key]}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { textDecoration: completed ? 'line-through' : 'none', color: completed ? 'text.secondary' : 'text.primary' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Escrow Tasks */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ChecklistRtl sx={{ fontSize: 18, color: '#ec4899' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Escrow Tasks</Typography>
                </Box>
                <List dense>
                  {Object.entries(checklists.escrow_tasks || {}).map(([key, completed]) => (
                    <ListItem key={key} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {completed ? (
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.disabled' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={checklistLabels.escrow_tasks[key]}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { textDecoration: completed ? 'line-through' : 'none', color: completed ? 'text.secondary' : 'text.primary' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EscrowDetail;
