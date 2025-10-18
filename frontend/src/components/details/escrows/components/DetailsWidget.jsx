import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Collapse,
  Grid,
  Divider,
  Button
} from '@mui/material';
import {
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, differenceInDays, parseISO } from 'date-fns';

// Styled components
const WidgetCard = styled(motion.div)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}));

const PropertyImage = styled('div')(({ image }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url(${image})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.3,
  filter: 'blur(2px)',
  zIndex: 0,
}));

const ContentOverlay = styled(Box)({
  position: 'relative',
  zIndex: 1,
});

const ProgressRing = styled(motion.div)(({ theme, progress, size = 120 }) => ({
  width: size,
  height: size,
  position: 'relative',
  '& svg': {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: 'rotate(-90deg)',
  },
  '& circle': {
    fill: 'none',
    strokeWidth: 8,
  },
  '& .background': {
    stroke: 'rgba(255, 255, 255, 0.2)',
  },
  '& .progress': {
    stroke: 'white',
    strokeLinecap: 'round',
    strokeDasharray: `${2 * Math.PI * 50}`,
    strokeDashoffset: `${2 * Math.PI * 50 * (1 - progress / 100)}`,
    transition: 'stroke-dashoffset 0.5s ease',
  }
}));

const StatusBadge = styled(Chip)(({ statuscolor }) => ({
  backgroundColor: statuscolor === 'active' ? '#4caf50' :
                  statuscolor === 'pending' ? '#ff9800' :
                  statuscolor === 'closed' ? '#9e9e9e' : '#f44336',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  padding: '4px 8px',
}));

const TimelineVisualization = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1),
  backdropFilter: 'blur(10px)',
}));

const MilestoneMarker = styled(motion.div)(({ theme, status }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: status === 'completed' ? '#4caf50' :
              status === 'current' ? '#2196f3' :
              status === 'upcoming' ? 'rgba(255, 255, 255, 0.3)' : '#f44336',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxShadow: status === 'current' ? '0 0 20px rgba(33, 150, 243, 0.5)' : 'none',
  '&::after': status === 'current' ? {
    content: '""',
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: '2px solid #2196f3',
    animation: 'pulse 2s infinite',
  } : {},
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1.5)',
      opacity: 0,
    },
  },
}));

function DetailsWidget({ data, expanded, onExpand, onUpdate }) {
  const [hoveredMilestone, setHoveredMilestone] = useState(null);

  if (!data) return null;

  // Calculate status and progress
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'active';
      case 'pending': return 'pending';
      case 'closed': return 'closed';
      default: return 'pending';
    }
  };

  const daysToClose = data.daysToClose || 0;
  const checklistProgress = data.checklistProgress || 0;

  // Timeline milestones
  const milestones = [
    { id: 'accepted', label: 'Offer Accepted', date: data.acceptanceDate, status: 'completed' },
    { id: 'inspection', label: 'Inspections', date: data.inspectionDate, status: 'completed' },
    { id: 'appraisal', label: 'Appraisal', date: data.appraisalDate, status: 'current' },
    { id: 'loan', label: 'Loan Approval', date: data.loanApprovalDate, status: 'upcoming' },
    { id: 'closing', label: 'Closing', date: data.scheduledCoeDate, status: 'upcoming' },
  ];

  return (
    <WidgetCard
      gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {data.propertyImage && <PropertyImage image={data.propertyImage} />}
      
      <ContentOverlay>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {data.escrowNumber}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {data.propertyAddress}
            </Typography>
          </Box>
          <StatusBadge
            label={data.escrowStatus}
            statuscolor={getStatusColor(data.escrowStatus)}
            size="small"
          />
        </Box>

        {/* Progress Rings */}
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={6}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <ProgressRing progress={checklistProgress} size={100}>
                <svg width="100" height="100">
                  <circle className="background" cx="50" cy="50" r="45" />
                  <motion.circle
                    className="progress"
                    cx="50"
                    cy="50"
                    r="45"
                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - checklistProgress / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  sx={{ transform: 'translate(-50%, -50%)' }}
                  textAlign="center"
                >
                  <Typography variant="h5" fontWeight="bold">
                    {checklistProgress}%
                  </Typography>
                  <Typography variant="caption">Complete</Typography>
                </Box>
              </ProgressRing>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box textAlign="center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Typography variant="h3" fontWeight="bold">
                  {Math.abs(daysToClose)}
                </Typography>
                <Typography variant="body2">
                  Days {daysToClose >= 0 ? 'to Close' : 'Past Close'}
                </Typography>
              </motion.div>
            </Box>
          </Grid>
        </Grid>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <MoneyIcon fontSize="small" />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Purchase Price
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${data.purchasePrice?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <MoneyIcon fontSize="small" />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Commission
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${data.myCommission?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Expanded Timeline */}
        <Collapse in={expanded}>
          <TimelineVisualization>
            <Typography variant="h6" gutterBottom>
              Transaction Timeline
            </Typography>
            <Box display="flex" justifyContent="space-between" position="relative" mt={3}>
              {/* Timeline Line */}
              <Box
                position="absolute"
                top="20px"
                left="20px"
                right="20px"
                height="2px"
                bgcolor="rgba(255, 255, 255, 0.3)"
                zIndex={0}
              />
              
              {/* Milestones */}
              {milestones.map((milestone, index) => (
                <Box
                  key={milestone.id}
                  position="relative"
                  textAlign="center"
                  flex={1}
                  onMouseEnter={() => setHoveredMilestone(milestone.id)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                >
                  <MilestoneMarker
                    status={milestone.status}
                    animate={hoveredMilestone === milestone.id ? { scale: 1.2 } : {}}
                  >
                    {milestone.status === 'completed' && <CheckCircleIcon />}
                    {milestone.status === 'current' && <ScheduleIcon />}
                    {milestone.status === 'upcoming' && <CalendarIcon />}
                  </MilestoneMarker>
                  
                  <AnimatePresence>
                    {hoveredMilestone === milestone.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ marginTop: 8 }}
                      >
                        <Typography variant="caption" display="block">
                          {milestone.label}
                        </Typography>
                        {milestone.date && (
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {format(parseISO(milestone.date), 'MMM d, yyyy')}
                          </Typography>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              ))}
            </Box>

            {/* Additional Details */}
            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Escrow Company
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {data.escrowCompany || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Lead Source
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {data.leadSource || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit
                }}
              >
                Edit Details
              </Button>
              {data.zillowUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<LaunchIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(data.zillowUrl, '_blank');
                  }}
                >
                  View on Zillow
                </Button>
              )}
            </Box>
          </TimelineVisualization>
        </Collapse>

        {/* Expand Indicator */}
        <Box display="flex" justifyContent="center" mt={2}>
          <IconButton
            size="small"
            sx={{ color: 'white', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </ContentOverlay>
    </WidgetCard>
  );
}

export default DetailsWidget;