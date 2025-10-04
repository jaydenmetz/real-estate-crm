import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  Grid,
  IconButton,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home,
  CalendarToday,
  AttachMoney,
  AccountBalance,
  Description,
  Business,
  Person,
  Schedule,
  CheckCircle,
  Visibility,
  Edit,
  Archive as ArchiveIcon,
  CloudUpload,
  Message,
  ExpandMore,
  ExpandLess,
  LocationOn,
  Phone,
  Email,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isValid } from 'date-fns';

const EscrowWidgetLarge = ({ escrow, index = 0 }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Parse data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const loanAmount = parseFloat(escrow.loanAmount) || 0;
  const earnestMoney = parseFloat(escrow.earnestMoney) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;
  const downPayment = purchasePrice - loanAmount;

  // Calculate days to close
  const closingDate = escrow.scheduledCoeDate || escrow.closingDate;
  let daysToClose = 'N/A';
  let isUrgent = false;
  let isPastDue = false;

  if (closingDate) {
    try {
      const closeDate = new Date(closingDate);
      if (isValid(closeDate)) {
        const days = differenceInDays(closeDate, new Date());
        daysToClose = days;
        isUrgent = days <= 7 && days > 0;
        isPastDue = days < 0;
      }
    } catch (e) {
      daysToClose = escrow.daysToClose || 'N/A';
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isValid(d)) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {}
    return 'N/A';
  };

  // Status config
  const getStatusConfig = (status) => {
    const configs = {
      'Active': { color: 'success', bg: '#4caf50' },
      'Pending': { color: 'warning', bg: '#ff9800' },
      'Closed': { color: 'default', bg: '#9e9e9e' },
      'Cancelled': { color: 'error', bg: '#f44336' },
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(escrow.escrowStatus);

  // Timeline milestones
  const milestones = [
    { label: 'Open', date: escrow.acceptanceDate, completed: true },
    { label: 'Inspection', date: escrow.inspectionDate, completed: !!escrow.inspectionDate },
    { label: 'Appraisal', date: escrow.appraisalDate, completed: !!escrow.appraisalDate },
    { label: 'Loan Approval', date: escrow.loanApprovalDate, completed: !!escrow.loanApprovalDate },
    { label: 'Close', date: closingDate, completed: escrow.escrowStatus === 'Closed' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        onClick={() => navigate(`/escrows/${escrow.id}`)}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(statusConfig.bg, 0.15)}`,
            borderColor: alpha(statusConfig.bg, 0.2),
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header Section */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2.5 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  }}
                >
                  <Home sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {escrow.propertyAddress || 'No Address'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                    {escrow.city}, {escrow.state} {escrow.zipCode}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      MLS #: {escrow.mlsNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
              <Chip
                label={escrow.escrowStatus}
                size="large"
                color={statusConfig.color}
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 2,
                  py: 3,
                }}
              />
            </Grid>
          </Grid>

          {/* Stats Row */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={4} md={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.success.main, 0.05),
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <AttachMoney sx={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5 }}>
                  Sale Price
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {formatCurrency(purchasePrice)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <AccountBalance sx={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5 }}>
                  Loan Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {formatCurrency(loanAmount)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.warning.main, 0.05),
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <AttachMoney sx={{ fontSize: 24, color: 'warning.main' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5 }}>
                  Down Payment
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {formatCurrency(downPayment)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 24, color: 'primary.main' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5 }}>
                  Close Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {formatDate(closingDate)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(isPastDue ? theme.palette.error.main : isUrgent ? theme.palette.warning.main : theme.palette.info.main, 0.2)}`,
                  backgroundColor: alpha(isPastDue ? theme.palette.error.main : isUrgent ? theme.palette.warning.main : theme.palette.info.main, 0.05),
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Schedule sx={{ fontSize: 24, color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'info.main' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5 }}>
                  Days Remaining
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    textAlign: 'center',
                    color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'text.primary',
                  }}
                >
                  {daysToClose}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <AttachMoney sx={{ fontSize: 24, color: 'secondary.main' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 0.5 }}>
                  Commission
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {formatCurrency(commission)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Transaction Details */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description sx={{ color: 'primary.main' }} />
                Transaction Details
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Open Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(escrow.acceptanceDate)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Escrow Company</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.escrowCompany || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Escrow Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.escrowNumber || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Title Company</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.titleCompany || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Transaction Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.transactionType || 'Purchase'}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ color: 'primary.main' }} />
                Financial Details
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Earnest Money Deposit</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>${earnestMoney.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Earnest Money Held By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.earnestMoneyHeldBy || 'Escrow Company'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Loan Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.loanType || 'Conventional'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Lender Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.lenderName || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Loan Officer</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.loanOfficer || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Important Dates */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ color: 'primary.main' }} />
              Important Dates
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Inspection
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(escrow.inspectionDate)}
                  </Typography>
                  {escrow.inspectionDate && (
                    <Chip
                      label={escrow.inspectionStatus || 'Pending'}
                      size="small"
                      color={escrow.inspectionStatus === 'Pass' ? 'success' : 'default'}
                      sx={{ mt: 0.5, fontSize: 10 }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Appraisal
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(escrow.appraisalDate)}
                  </Typography>
                  {escrow.appraisalValue && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                      ${escrow.appraisalValue?.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Contingency Removal
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(escrow.contingencyRemovalDate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Final Walkthrough
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(escrow.finalWalkthroughDate)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Parties Involved */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: 'primary.main' }} />
              Parties Involved
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Buyer Name(s)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.clientName || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Buyer Agent</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.buyerAgent || escrow.assignedAgent || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Seller Name(s)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.sellerName || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Listing Agent</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{escrow.listingAgent || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Progress Timeline */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment sx={{ color: 'primary.main' }} />
              Progress Timeline
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Overall Progress</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{checklistProgress}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={checklistProgress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  },
                }}
              />
            </Box>

            {/* Milestone Timeline */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              {milestones.map((milestone, idx) => (
                <Box key={idx} sx={{ textAlign: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      backgroundColor: milestone.completed
                        ? theme.palette.success.main
                        : alpha(theme.palette.text.secondary, 0.2),
                      color: milestone.completed ? 'white' : 'text.secondary',
                    }}
                  >
                    {milestone.completed ? <CheckCircle /> : <Schedule />}
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
                    {milestone.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    {formatDate(milestone.date)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Notes Section */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, cursor: 'pointer' }}
              onClick={() => setNotesExpanded(!notesExpanded)}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Message sx={{ color: 'primary.main' }} />
                Internal Notes
              </Typography>
              <IconButton size="small">
                {notesExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={notesExpanded}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {escrow.notes || 'No notes available for this escrow.'}
                </Typography>
              </Box>
            </Collapse>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/escrows/${escrow.id}`);
              }}
              sx={{
                flex: '1 1 200px',
                py: 1.5,
                px: 3,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <Visibility />
              View Full Details
            </Box>
            <Box
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/escrows/${escrow.id}/edit`);
              }}
              sx={{
                flex: '1 1 150px',
                py: 1.5,
                px: 3,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                border: `1px solid ${theme.palette.primary.main}`,
                color: 'primary.main',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Edit />
              Edit Transaction
            </Box>
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                flex: '1 1 150px',
                py: 1.5,
                px: 3,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                border: `1px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
                color: 'text.secondary',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  color: 'text.primary',
                },
              }}
            >
              <CloudUpload />
              Upload Documents
            </Box>
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                flex: '1 1 120px',
                py: 1.5,
                px: 3,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                border: `1px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
                color: 'text.secondary',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  color: 'text.primary',
                },
              }}
            >
              <Message />
              Add Note
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EscrowWidgetLarge;
