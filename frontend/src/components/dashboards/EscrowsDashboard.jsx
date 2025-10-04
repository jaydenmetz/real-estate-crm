import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NewEscrowModal from '../forms/NewEscrowModal';
import EscrowCardGrid from '../common/EscrowCardGrid';
import EscrowCompactCard from '../common/EscrowCompactCard';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  Grow,
  Slide,
  Skeleton,
  useTheme,
  alpha,
  Stack,
  Collapse,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip as MuiTooltip,
  Tabs,
  Tab,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  AttachMoney,
  Home,
  CheckCircle,
  Schedule,
  Add,
  ArrowForward,
  LocationOn,
  CalendarToday,
  Person,
  Timer,
  AccountBalance,
  Handshake,
  Assessment,
  Speed,
  BugReport,
  ExpandMore,
  ExpandLess,
  Storage,
  Refresh,
  Error as ErrorIcon,
  Analytics,
  DataObject,
  NetworkCheck,
  Info,
  Warning,
  ViewModule,
  ViewList,
  ViewAgenda,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { safeFormatDate, safeParseDate } from '../../utils/safeDateUtils';
import { escrowsAPI } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import networkMonitor from '../../services/networkMonitor.service';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

// Enhanced animated stat card component with gradient animations
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.001 }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          minHeight: 140,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(color, 0.2)}`,
            border: `1px solid ${alpha(color, 0.4)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography 
                color="textSecondary" 
                gutterBottom 
                variant="body2"
                sx={{ fontWeight: 500, letterSpacing: 0.5 }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h3" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  color,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                }}
              >
                <span style={{ fontSize: '0.7em' }}>{prefix}</span>
                <CountUp 
                  end={value} 
                  duration={2.5} 
                  separator="," 
                  decimals={suffix === 'M' ? 2 : 0}
                />
                <span style={{ fontSize: '0.7em' }}>{suffix}</span>
              </Typography>
              {trend && (
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                  <Typography variant="caption" color="success.main">
                    {trend}% from last month
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.8)', opacity: 1 },
                    '50%': { transform: 'scale(1.2)', opacity: 0.5 },
                    '100%': { transform: 'scale(0.8)', opacity: 1 },
                  },
                }}
              />
              <Icon sx={{ fontSize: 48, color, zIndex: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Mini contact card component
const MiniContactCard = ({ title, name, initials, color = '#2196f3' }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 0.75,
      borderRadius: 1,
      backgroundColor: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.2)}`,
      minHeight: 32,
    }}
  >
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography 
        variant="caption" 
        sx={{ 
          fontSize: '9px',
          color: 'text.secondary',
          display: 'block',
          lineHeight: 1,
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          fontSize: '10px',
          fontWeight: 600,
          display: 'block',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name || 'Not Assigned'}
      </Typography>
    </Box>
  </Box>
);

// Enhanced escrow card component with stunning visuals
const EscrowCard = ({ escrow, onClick, index, onChecklistUpdate, onArchive, onRestore, onDelete, isArchived }) => {
  const theme = useTheme();
  const [localEscrow, setLocalEscrow] = useState(escrow);
  const [archiving, setArchiving] = useState(false);

  // Update local state when escrow prop changes
  useEffect(() => {
    setLocalEscrow(escrow);
  }, [escrow]);
  const statusColors = {
    'Active Under Contract': '#4caf50',
    'active under contract': '#4caf50',
    'Pending': '#ff9800',
    'pending': '#ff9800',
    'Closed': '#9e9e9e',
    'closed': '#9e9e9e',
    'Cancelled': '#f44336',
    'cancelled': '#f44336',
    // Legacy support
    'Active': '#4caf50',
    'active': '#4caf50'
  };
  
  const statusColor = statusColors[escrow.escrowStatus] || '#9e9e9e';
  
  // Calculate timeline progress
  const acceptanceDate = escrow.acceptanceDate ? new Date(escrow.acceptanceDate) : new Date();
  const coeDate = escrow.scheduledCoeDate ? new Date(escrow.scheduledCoeDate) : new Date(acceptanceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const totalDays = Math.floor((coeDate - acceptanceDate) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.floor((today - acceptanceDate) / (1000 * 60 * 60 * 24));
  const progressPercentage = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  
  // Calculate proportional milestone positions based on actual dates
  const calculatePosition = (date) => {
    if (!date) return null;
    const milestoneDate = new Date(date);
    const daysFromStart = Math.floor((milestoneDate - acceptanceDate) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max((daysFromStart / totalDays) * 100, 0), 100);
  };
  
  // Define 5 main milestones for every real estate transaction
  // These are the key dates that every transaction should have
  const milestones = [
    { 
      name: 'Escrow Opened', 
      date: escrow.escrowOpenedDate || escrow.acceptanceDate,
      position: 0,
      icon: '📝',
      completed: true,
      isMain: true
    },
    { 
      name: 'Contingencies', 
      date: escrow.contingencyRemovalDate || escrow.contingenciesDate || 
            (escrow.acceptanceDate && new Date(new Date(escrow.acceptanceDate).getTime() + 17 * 24 * 60 * 60 * 1000).toISOString()),
      position: 35,
      icon: '✅',
      completed: escrow.contingencyRemovalDate ? new Date(escrow.contingencyRemovalDate) <= today : false,
      isMain: true
    },
    { 
      name: 'Loan Approval', 
      date: escrow.loanApprovalDate || 
            (escrow.acceptanceDate && new Date(new Date(escrow.acceptanceDate).getTime() + 21 * 24 * 60 * 60 * 1000).toISOString()),
      position: 60,
      icon: '🏦',
      completed: escrow.loanApprovalDate ? new Date(escrow.loanApprovalDate) <= today : false,
      isMain: true
    },
    { 
      name: 'Final Walkthrough', 
      date: escrow.finalWalkthroughDate || 
            (escrow.scheduledCoeDate && new Date(new Date(escrow.scheduledCoeDate).getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()),
      position: 85,
      icon: '🔍',
      completed: escrow.finalWalkthroughDate ? new Date(escrow.finalWalkthroughDate) <= today : false,
      isMain: true
    },
    { 
      name: 'Escrow Closed', 
      date: escrow.actualCoeDate || escrow.scheduledCoeDate,
      position: 100,
      icon: '🏠',
      completed: escrow.escrowStatus === 'Closed' || escrow.escrowStatus === 'closed',
      isMain: true
    }
  ];
  
  // Calculate house and loan checklist progress
  const houseChecklist = localEscrow.checklists?.house || {};
  const loanChecklist = localEscrow.checklists?.loan || {};
  
  const houseItems = Object.keys(houseChecklist).length;
  const houseCompleted = Object.values(houseChecklist).filter(item => item === true || item?.completed).length;
  const houseProgress = houseItems > 0 ? (houseCompleted / houseItems) * 100 : 0;
  
  const loanItems = Object.keys(loanChecklist).length;
  const loanCompleted = Object.values(loanChecklist).filter(item => item === true || item?.completed).length;
  const loanProgress = loanItems > 0 ? (loanCompleted / loanItems) * 100 : 0;
  
  // Find next pending items for each checklist
  const getNextPendingItem = (checklist) => {
    const items = Object.entries(checklist);
    for (const [key, value] of items) {
      if (value !== true && !value?.completed) {
        // Return both key and formatted name
        return {
          key,
          name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
        };
      }
    }
    return null;
  };
  
  const nextHouseItem = getNextPendingItem(houseChecklist);
  const nextLoanItem = getNextPendingItem(loanChecklist);
  
  // Handle checklist item toggle
  const handleChecklistToggle = async (type, itemKey, e) => {
    e.stopPropagation(); // Prevent card navigation
    
    const updatedChecklists = { ...localEscrow.checklists };
    if (!updatedChecklists[type]) updatedChecklists[type] = {};
    updatedChecklists[type][itemKey] = !updatedChecklists[type][itemKey];
    
    setLocalEscrow({
      ...localEscrow,
      checklists: updatedChecklists
    });
    
    // Call API to update
    if (onChecklistUpdate) {
      onChecklistUpdate(escrow.id, updatedChecklists);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'visible',
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: alpha(statusColor, 0.3),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 10px 40px ${alpha(statusColor, 0.2)}`,
            borderColor: alpha(statusColor, 0.5),
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 1)',
            '& .arrow-icon': {
              transform: 'translateX(5px)',
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: statusColor,
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.04),
              },
            }}
            onClick={() => onClick(escrow.id)}
          >
            {/* Property Image Section - Left Side */}
            <Box 
              sx={{ 
                width: { xs: '100%', sm: 300, md: 340 },
                height: { xs: 200, sm: 240 },
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
                flexShrink: 0,
              }}
            >
              <img
                src={escrow.propertyImage || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'}
                alt={escrow.propertyAddress}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  console.error('Dashboard image failed to load:', escrow.propertyImage);
                  e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
                }}
              />
              
              {/* Overlay gradient */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                }}
              />
              
              {/* Status chip */}
              <Chip
                label={escrow.escrowStatus}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: isArchived ? 60 : 12,
                  background: alpha(statusColor, 0.95),
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />

              {/* Archive/Delete buttons */}
              {!isArchived ? (
                <IconButton
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setArchiving(true);
                    try {
                      if (onArchive) {
                        await onArchive(escrow.id);
                      }
                    } finally {
                      // Always reset archiving state
                      setArchiving(false);
                    }
                  }}
                  disabled={archiving}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: alpha('#ff9800', 0.1),
                    '&:hover': {
                      backgroundColor: alpha('#ff9800', 0.2),
                    },
                  }}
                >
                  {archiving ? <CircularProgress size={20} /> : <ArchiveIcon fontSize="small" />}
                </IconButton>
              ) : (
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore && onRestore(escrow.id);
                    }}
                    sx={{
                      backgroundColor: alpha('#4caf50', 0.1),
                      '&:hover': {
                        backgroundColor: alpha('#4caf50', 0.2),
                      },
                    }}
                  >
                    <RestoreIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete && onDelete(escrow.id);
                    }}
                    sx={{
                      backgroundColor: alpha('#f44336', 0.1),
                      '&:hover': {
                        backgroundColor: alpha('#f44336', 0.2),
                      },
                    }}
                  >
                    <DeleteForeverIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              
              {/* Zillow button if URL exists */}
              {(escrow.zillowUrl || escrow.zillow_url) && (
                <Box
                  component="a"
                  href={escrow.zillowUrl || escrow.zillow_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: alpha('#006AFF', 0.95),
                    color: 'white',
                    borderRadius: 1,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#0050CC',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0, 106, 255, 0.4)',
                    },
                  }}
                >
                  <Box
                    component="svg"
                    sx={{ width: 14, height: 14 }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M10 2v2H8v2h2v2H8v2h2v2H8v2h2v2H8v2h2v2H8v2h2v-2h2v2h2v-2h2v2h2v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2V6h-2V4h-2v2h-2V4h-2v2h-2V4h-2v2h-2V2h-2zm4 6v2h-2V8h2zm0 4v2h-2v-2h2zm0 4v2h-2v-2h2z"/>
                  </Box>
                  Zillow
                </Box>
              )}
              
              {/* Property Address */}
              <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {escrow.propertyAddress}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem' }}>
                  Escrow #: {escrow.escrowNumber || escrow.displayId || 'N/A'}
                </Typography>
              </Box>
            </Box>

            {/* Content Section - Right Side */}
            <Box sx={{ 
              flex: 1, 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              height: { xs: 'auto', sm: 240 },
              overflow: 'hidden',
            }}>
              <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
                {/* Purchase Price and Commission */}
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', lineHeight: 1 }}>
                    Purchase Price
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25, fontSize: '1.1rem' }}>
                    ${Number(escrow.purchasePrice).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                    ${Number(escrow.myCommission).toLocaleString()} commission
                  </Typography>
                </Grid>

                {/* Contact Cards 2x2 Grid - Centered */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid container spacing={0.5} sx={{ maxWidth: 360 }}>
                      {/* Left Column - Buyer's Agent & Lender */}
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <MiniContactCard
                            title="Buyer's Agent"
                            name={escrow.buyerAgent || escrow.buyer_agent || escrow.people?.buyerAgent?.name}
                            initials={getInitials(escrow.buyerAgent || escrow.buyer_agent || escrow.people?.buyerAgent?.name)}
                            color="#4caf50"
                          />
                          <MiniContactCard
                            title="Lender"
                            name={escrow.lenderName || escrow.lender_name || escrow.loan_officer_name}
                            initials={getInitials(escrow.lenderName || escrow.lender_name || escrow.loan_officer_name)}
                            color="#2196f3"
                          />
                        </Stack>
                      </Grid>
                      {/* Right Column - Listing Agent & Escrow Officer */}
                      <Grid item xs={6}>
                        <Stack spacing={0.5}>
                          <MiniContactCard
                            title="Listing Agent"
                            name={escrow.listingAgent || escrow.listing_agent || escrow.people?.listingAgent?.name}
                            initials={getInitials(escrow.listingAgent || escrow.listing_agent || escrow.people?.listingAgent?.name)}
                            color="#ff9800"
                          />
                          <MiniContactCard
                            title="Escrow Officer"
                            name={escrow.escrowOfficerName || escrow.escrow_officer_name}
                            initials={getInitials(escrow.escrowOfficerName || escrow.escrow_officer_name)}
                            color="#9c27b0"
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Days to Close - Far Right */}
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 75,
                        height: 75,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(escrow.daysToClose <= 7 ? theme.palette.error.main : theme.palette.primary.main, 0.1)} 0%, ${alpha(escrow.daysToClose <= 7 ? theme.palette.error.main : theme.palette.primary.main, 0.05)} 100%)`,
                        border: `2px solid ${alpha(escrow.daysToClose <= 7 ? theme.palette.error.main : theme.palette.primary.main, 0.3)}`,
                        boxShadow: `0 4px 12px ${alpha(escrow.daysToClose <= 7 ? theme.palette.error.main : theme.palette.primary.main, 0.15)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 6px 16px ${alpha(escrow.daysToClose <= 7 ? theme.palette.error.main : theme.palette.primary.main, 0.25)}`,
                        },
                      }}
                    >
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800,
                          color: escrow.daysToClose <= 7 ? 'error.main' : 'primary.main',
                          fontSize: '2rem',
                          lineHeight: 1,
                        }}
                      >
                        {escrow.daysToClose > 0 ? escrow.daysToClose : 0}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          color: escrow.daysToClose <= 7 ? 'error.main' : 'primary.main',
                          opacity: 0.8,
                          mt: 0.25,
                        }}
                      >
                        DAYS
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

            {/* Enhanced Timeline Progress with Milestones */}
            <Box sx={{ mt: 'auto', pt: 1 }}>
              {/* Main Timeline */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.65rem' }}>
                  ESCROW TIMELINE
                </Typography>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${alpha(statusColor, 0.05)} 0%, ${alpha(statusColor, 0.1)} 100%)`,
                    overflow: 'visible',
                    position: 'relative',
                    border: `1px solid ${alpha(statusColor, 0.2)}`,
                  }}
                >
                  {/* Animated progress fill */}
                  <Box
                    sx={{
                      height: '100%',
                      width: `${Math.min(progressPercentage, 100)}%`,
                      background: `linear-gradient(90deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
                      borderRadius: 6,
                      transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        animation: 'shimmer 2s infinite',
                      },
                      '@keyframes shimmer': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' },
                      },
                    }}
                  />
                  
                  {/* Today marker with pulse animation */}
                  {progressPercentage > 0 && progressPercentage < 100 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${progressPercentage}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                      }}
                    >
                      <Box
                        sx={{
                          width: 3,
                          height: 24,
                          backgroundColor: '#ff4444',
                          boxShadow: '0 0 10px rgba(255, 68, 68, 0.5)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -25,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#ff4444',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: 1,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -4,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid #ff4444',
                          },
                        }}
                      >
                        TODAY
                      </Box>
                    </Box>
                  )}
                  
                  {/* Enhanced Milestones */}
                  {milestones.map((milestone, idx) => (
                    <MuiTooltip 
                      key={idx} 
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            {milestone.icon} {milestone.name}
                          </Typography>
                          {milestone.date && (
                            <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                              {safeFormatDate(milestone.date, 'MMM d, yyyy')}
                            </Typography>
                          )}
                          <Typography variant="caption" display="block" sx={{ 
                            color: milestone.completed ? '#4caf50' : '#ff9800',
                            fontWeight: 600,
                            mt: 0.5
                          }}>
                            {milestone.completed ? '✓ Completed' : '○ Pending'}
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${milestone.position}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: milestone.position === 0 || milestone.position === 100 ? 20 : 16,
                            height: milestone.position === 0 || milestone.position === 100 ? 20 : 16,
                            borderRadius: '50%',
                            backgroundColor: milestone.completed ? statusColor : '#fff',
                            border: `3px solid ${milestone.completed ? statusColor : alpha(statusColor, 0.3)}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: milestone.position === 0 || milestone.position === 100 ? 5 : 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: milestone.position === 0 || milestone.position === 100 ? '10px' : '8px',
                            boxShadow: milestone.completed 
                              ? `0 0 0 4px ${alpha(statusColor, 0.2)}` 
                              : 'none',
                            '&:hover': {
                              transform: 'translate(-50%, -50%) scale(1.3)',
                              boxShadow: `0 0 0 8px ${alpha(statusColor, 0.2)}`,
                            },
                          }}
                        >
                          {milestone.icon}
                        </Box>
                        {/* Date label on the bar */}
                        {milestone.date && (
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              left: `${milestone.position}%`,
                              top: milestone.position % 20 === 0 ? -30 : 28,
                              transform: 'translateX(-50%)',
                              fontSize: '9px',
                              fontWeight: 600,
                              color: milestone.completed ? statusColor : 'text.secondary',
                              whiteSpace: 'nowrap',
                              opacity: 0.9,
                            }}
                          >
                            {safeFormatDate(milestone.date, 'M/d')}
                          </Typography>
                        )}
                      </Box>
                    </MuiTooltip>
                  ))}
                </Box>
                
                {/* Days counter */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: statusColor, fontSize: '0.65rem' }}>
                    Day {daysElapsed} of {totalDays}
                  </Typography>
                </Box>
              </Box>
              
              {/* House and Loan Checklists */}
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {/* House Checklist */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
                        🏠 HOUSE
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 700, 
                          color: houseCompleted === houseItems ? '#4caf50' : 'text.secondary',
                          fontSize: '0.7rem'
                        }}
                      >
                        {houseCompleted}/{houseItems}
                      </Typography>
                    </Box>
                    {nextHouseItem ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          p: 0.5,
                          borderRadius: 1,
                          backgroundColor: alpha('#4caf50', 0.05),
                          border: `1px solid ${alpha('#4caf50', 0.2)}`,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: alpha('#4caf50', 0.1),
                            borderColor: alpha('#4caf50', 0.4),
                            transform: 'translateX(2px)',
                          },
                        }}
                        onClick={(e) => handleChecklistToggle('house', nextHouseItem.key, e)}
                      >
                        <Checkbox
                          size="small"
                          checked={false}
                          sx={{ 
                            p: 0,
                            color: '#4caf50',
                            '&.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: 14,
                            },
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.65rem',
                            color: 'text.primary',
                            lineHeight: 1,
                          }}
                        >
                          {nextHouseItem.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          p: 0.5,
                          borderRadius: 1,
                          backgroundColor: alpha('#4caf50', 0.1),
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.65rem',
                            color: '#4caf50',
                            fontWeight: 600,
                          }}
                        >
                          ✅ All Complete
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                {/* Loan Checklist */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
                        🏦 LOAN
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 700, 
                          color: loanCompleted === loanItems ? '#2196f3' : 'text.secondary',
                          fontSize: '0.7rem'
                        }}
                      >
                        {loanCompleted}/{loanItems}
                      </Typography>
                    </Box>
                    {nextLoanItem ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          p: 0.5,
                          borderRadius: 1,
                          backgroundColor: alpha('#2196f3', 0.05),
                          border: `1px solid ${alpha('#2196f3', 0.2)}`,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: alpha('#2196f3', 0.1),
                            borderColor: alpha('#2196f3', 0.4),
                            transform: 'translateX(2px)',
                          },
                        }}
                        onClick={(e) => handleChecklistToggle('loan', nextLoanItem.key, e)}
                      >
                        <Checkbox
                          size="small"
                          checked={false}
                          sx={{ 
                            p: 0,
                            color: '#2196f3',
                            '&.Mui-checked': {
                              color: '#2196f3',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: 14,
                            },
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.65rem',
                            color: 'text.primary',
                            lineHeight: 1,
                          }}
                        >
                          {nextLoanItem.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          p: 0.5,
                          borderRadius: 1,
                          backgroundColor: alpha('#2196f3', 0.1),
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.65rem',
                            color: '#2196f3',
                            fontWeight: 600,
                          }}
                        >
                          ✅ All Complete
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EscrowsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [escrows, setEscrows] = useState([]);
  const [archivedEscrows, setArchivedEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewEscrowModal, setShowNewEscrowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'compact', 'detailed'
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [selectedArchivedIds, setSelectedArchivedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalEscrows: 0,
    activeEscrows: 0,
    totalVolume: 0,
    projectedCommission: 0,
    closedThisMonth: 0,
    avgDaysToClose: 0,
    grossCommission: 0,
    myCommission: 0,
    ytdClosed: 0,
    ytdVolume: 0,
    ytdChange: 0,
    monthClosed: 0,
    monthVolume: 0,
    monthChange: 0,
    weekProjected: 0,
    weekVolume: 0,
    weekChange: 0,
    closingThisWeek: 0,
    pendingActions: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [debugExpanded, setDebugExpanded] = useState(false);
  const [networkData, setNetworkData] = useState({
    stats: networkMonitor.getStats(),
    requests: networkMonitor.getRequests(),
    errors: networkMonitor.getErrors()
  });

  useEffect(() => {
    fetchEscrows();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'archived') {
      // Calculate stats for archived escrows (should show 0s when empty)
      calculateStats(archivedEscrows, 'archived');
    } else if (escrows.length > 0) {
      calculateStats(escrows, selectedStatus);
    } else {
      // Set all stats to 0 when no escrows
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, escrows, archivedEscrows]);

  // Sync archived count with archived escrows array
  useEffect(() => {
    setArchivedCount(archivedEscrows.length);
  }, [archivedEscrows]);

  // Auto-refresh network data when debug panel is expanded
  useEffect(() => {
    if (debugExpanded) {
      const interval = setInterval(() => {
        setNetworkData({
          stats: networkMonitor.getStats(),
          requests: networkMonitor.getRequests(),
          errors: networkMonitor.getErrors()
        });
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [debugExpanded]);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      console.log('Fetching escrows...');

      // Fetch all escrows including archived
      const response = await escrowsAPI.getAll({ includeArchived: true });
      console.log('API Response:', response);

      if (response.success) {
        const allData = response.data.escrows || response.data || [];

        // Separate active and archived escrows based on deleted_at field
        const escrowData = allData.filter(escrow => !escrow.deleted_at && !escrow.deletedAt);
        const archivedData = allData.filter(escrow => escrow.deleted_at || escrow.deletedAt);

        console.log('All escrows received:', allData.length);
        console.log('Active escrows found:', escrowData.length);
        console.log('Archived escrows found:', archivedData.length);

        setEscrows(escrowData);
        setArchivedEscrows(archivedData);
        setArchivedCount(archivedData.length);

        // Calculate stats only for active escrows
        calculateStats(escrowData, selectedStatus);
        generateChartData(escrowData);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching escrows:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (escrowData, statusFilter = 'active') => {
    // Safety check for escrowData or if it's archived with no data
    if (!escrowData || !Array.isArray(escrowData) || (statusFilter === 'archived' && escrowData.length === 0)) {
      setStats({
        totalEscrows: 0,
        activeEscrows: 0,
        totalVolume: 0,
        projectedCommission: 0,
        closedThisMonth: 0,
        avgDaysToClose: 0,
        grossCommission: 0,
        myCommission: 0,
        ytdClosed: 0,
        ytdVolume: 0,
        ytdChange: 0,
        monthClosed: 0,
        monthVolume: 0,
        monthChange: 0,
        weekProjected: 0,
        weekVolume: 0,
        weekChange: 0,
        closingThisWeek: 0,
        pendingActions: 0,
      });
      return;
    }
    
    let filteredEscrows = [];
    
    // Filter based on selected status
    switch (statusFilter) {
      case 'active':
        filteredEscrows = escrowData.filter(e => 
          e.escrowStatus === 'Active Under Contract' || 
          e.escrowStatus === 'active under contract' ||
          e.escrowStatus === 'Pending' || 
          e.escrowStatus === 'pending' ||
          e.escrowStatus === 'Active' || 
          e.escrowStatus === 'active'
        );
        break;
      case 'closed':
        filteredEscrows = escrowData.filter(e => 
          e.escrowStatus === 'Closed' || 
          e.escrowStatus === 'closed' ||
          e.escrowStatus === 'Completed' || 
          e.escrowStatus === 'completed'
        );
        break;
      case 'cancelled':
        filteredEscrows = escrowData.filter(e =>
          e.escrowStatus === 'Cancelled' ||
          e.escrowStatus === 'cancelled' ||
          e.escrowStatus === 'Withdrawn' ||
          e.escrowStatus === 'withdrawn' ||
          e.escrowStatus === 'Expired' ||
          e.escrowStatus === 'expired'
        );
        break;
      case 'archived':
        // For archived, just use all the data since it's already filtered
        filteredEscrows = escrowData;
        break;
      default:
        filteredEscrows = escrowData;
    }
    
    // Calculate stats for filtered escrows
    const totalVolume = filteredEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    const myCommission = filteredEscrows.reduce((sum, e) => sum + Number(e.myCommission || 0), 0);
    
    // Calculate gross commission (assuming 5% total commission rate if not specified)
    const grossCommission = filteredEscrows.reduce((sum, e) => {
      const purchasePrice = Number(e.purchasePrice || 0);
      const commissionRate = Number(e.totalCommissionRate || 5) / 100;
      return sum + (purchasePrice * commissionRate);
    }, 0);
    
    // Calculate time-based stats
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // YTD Stats
    const ytdEscrows = escrowData.filter(e => {
      const closeDate = e.actualCoeDate || e.closingDate;
      if (!closeDate) return false;
      const date = new Date(closeDate);
      return date >= startOfYear && (e.escrowStatus === 'Closed' || e.escrowStatus === 'closed');
    });
    const ytdClosed = ytdEscrows.length;
    const ytdVolume = ytdEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    
    // Calculate YTD change (mock data for now, would need last year's data)
    const ytdChange = 15.2; // Mock: 15.2% increase
    
    // Monthly Stats
    const monthEscrows = escrowData.filter(e => {
      const closeDate = e.actualCoeDate || e.closingDate;
      if (!closeDate) return false;
      const date = new Date(closeDate);
      return date >= startOfMonth && (e.escrowStatus === 'Closed' || e.escrowStatus === 'closed');
    });
    const monthClosed = monthEscrows.length;
    const monthVolume = monthEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    const monthChange = -8.5; // Mock: 8.5% decrease from last month
    
    // Weekly Projected Stats
    const weekEscrows = escrowData.filter(e => {
      const closeDate = e.scheduledCoeDate || e.closingDate;
      if (!closeDate) return false;
      const date = new Date(closeDate);
      return date >= startOfWeek && date <= endOfWeek && 
        (e.escrowStatus === 'Active Under Contract' || e.escrowStatus === 'active under contract' ||
         e.escrowStatus === 'Pending' || e.escrowStatus === 'pending');
    });
    const weekProjected = weekEscrows.length;
    const weekVolume = weekEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0);
    const weekChange = 23.8; // Mock: 23.8% increase from last week
    
    // Closing this week count
    const closingThisWeek = weekEscrows.length;
    
    // Pending actions (mock for now)
    const pendingActions = 5;
    
    setStats({
      totalEscrows: filteredEscrows.length,
      activeEscrows: filteredEscrows.length, // For backward compatibility
      totalVolume,
      projectedCommission: myCommission, // For backward compatibility
      closedThisMonth: monthClosed,
      avgDaysToClose: Math.round(filteredEscrows.reduce((sum, e) => sum + (Number(e.daysToClose) || 0), 0) / (filteredEscrows.length || 1)),
      grossCommission,
      myCommission,
      ytdClosed,
      ytdVolume,
      ytdChange,
      monthClosed,
      monthVolume,
      monthChange,
      weekProjected,
      weekVolume,
      weekChange,
      closingThisWeek,
      pendingActions,
    });
  };

  const generateChartData = (escrowData) => {
    // Safety check for escrowData
    if (!escrowData || !Array.isArray(escrowData)) {
      setChartData([]);
      return;
    }
    
    // Generate last 6 months of data
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthEscrows = []; /* Temporarily disabled date filtering
      const monthEscrows = escrowData.filter(e => {
        const escrowDate = safeParseDate(e.acceptanceDate);
        if (!escrowDate) return false;
        return escrowDate.getMonth() === date.getMonth() && escrowDate.getFullYear() === date.getFullYear();
      }); */

      months.push({
        month: monthName,
        escrows: monthEscrows.length,
        volume: monthEscrows.reduce((sum, e) => sum + Number(e.purchasePrice || 0), 0) / 1000000,
      });
    }
    
    setChartData(months);
  };

  const handleEscrowClick = (escrowId) => {
    console.log('Escrow clicked - ID:', escrowId);
    navigate(`/escrows/${escrowId}`);
  };

  const handleCreateNew = () => {
    setShowNewEscrowModal(true);
  };

  const handleNewEscrowSuccess = (escrowId) => {
    // Refresh the escrows list
    fetchEscrows();
    // Navigate to the new escrow detail page
    navigate(`/escrows/${escrowId}`);
  };

  const handleChecklistUpdate = async (escrowId, updatedChecklists) => {
    try {
      // Update the checklist via API
      await escrowsAPI.updateChecklist(escrowId, updatedChecklists);

      // Update local state to reflect the change
      setEscrows(prevEscrows =>
        prevEscrows.map(esc =>
          esc.id === escrowId
            ? { ...esc, checklists: updatedChecklists }
            : esc
        )
      );
    } catch (error) {
      console.error('Failed to update checklist:', error);
    }
  };

  const handleArchive = async (escrowId) => {
    try {
      const response = await escrowsAPI.archive(escrowId);
      if (response && response.success) {
        // Move escrow from active to archived
        const archivedEscrow = escrows.find(e => e.id === escrowId);
        if (archivedEscrow) {
          // Mark as archived
          archivedEscrow.deleted_at = new Date().toISOString();

          setEscrows(prev => prev.filter(e => e.id !== escrowId));
          setArchivedEscrows(prev => [...prev, archivedEscrow]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active escrows
          const remainingEscrows = escrows.filter(e => e.id !== escrowId);
          calculateStats(remainingEscrows, selectedStatus);
          generateChartData(remainingEscrows);
        }
      } else {
        console.error('Archive failed - no success response');
      }
    } catch (error) {
      // Safely log error - make sure we're not rendering an object
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to archive escrow:', errorMessage);

      // Optional: Show user-friendly error message
      // You could set an error state here if you have one
      console.log('Archive operation failed. Please try again.');
    }
  };

  const handleRestore = async (escrowId) => {
    try {
      const response = await escrowsAPI.restore(escrowId);
      if (response.success) {
        // Move escrow from archived to active
        const restoredEscrow = archivedEscrows.find(e => e.id === escrowId);
        if (restoredEscrow) {
          // Remove archived marker
          delete restoredEscrow.deleted_at;
          delete restoredEscrow.deletedAt;

          setArchivedEscrows(prev => prev.filter(e => e.id !== escrowId));
          setEscrows(prev => [...prev, restoredEscrow]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active escrows
          const updatedEscrows = [...escrows, restoredEscrow];
          calculateStats(updatedEscrows, selectedStatus);
          generateChartData(updatedEscrows);
        }
      }
    } catch (error) {
      console.error('Failed to restore escrow:', error);
    }
  };

  const handlePermanentDelete = async (escrowId, skipConfirmation = false) => {
    // Check if running in test mode (can be set via window or query param)
    const isTestMode = window.location.search.includes('testMode=true') ||
                       window.__ESCROW_TEST_MODE__ === true ||
                       skipConfirmation === true;

    // Single confirmation dialog unless in test mode
    if (!isTestMode && !window.confirm('Are you sure you want to permanently delete this escrow? This action cannot be undone.')) {
      return;
    }

    try {
      // Check if escrow is already archived
      const escrowToDelete = archivedEscrows.find(e => e.id === escrowId) ||
                             escrows.find(e => e.id === escrowId);

      // If not archived, archive first
      if (escrowToDelete && !escrowToDelete.deleted_at && !escrowToDelete.deletedAt) {
        const archiveResponse = await escrowsAPI.archive(escrowId);
        if (!archiveResponse.success) {
          console.error('Failed to archive escrow before deletion');
          return;
        }
      }

      // Now permanently delete the archived escrow
      const response = await escrowsAPI.delete(escrowId);
      if (response.success) {
        // Remove from both lists
        setArchivedEscrows(prev => prev.filter(e => e.id !== escrowId));
        setEscrows(prev => prev.filter(e => e.id !== escrowId));
        setArchivedCount(prev => Math.max(0, prev - 1));

        // Recalculate stats with remaining active escrows only
        const remainingEscrows = escrows.filter(e => e.id !== escrowId);
        calculateStats(remainingEscrows, selectedStatus);
        generateChartData(remainingEscrows);

        console.log('Successfully permanently deleted escrow:', escrowId);
      }
    } catch (error) {
      console.error('Failed to permanently delete escrow:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} escrow${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await escrowsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted escrows from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedEscrows(prev => prev.filter(e => !deletedIds.has(e.id)));
        setEscrows(prev => prev.filter(e => !deletedIds.has(e.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active escrows only
        const remainingEscrows = escrows.filter(e => !deletedIds.has(e.id));
        calculateStats(remainingEscrows, selectedStatus);
        generateChartData(remainingEscrows);

        console.log(`Successfully permanently deleted ${response.data.deletedCount || selectedArchivedIds.length} escrows`);
      }
    } catch (error) {
      console.error('Failed to batch delete escrows:', error);
      alert('Failed to delete escrows. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedEscrows.map(e => e.id));
    } else {
      setSelectedArchivedIds([]);
    }
  };

  const handleSelectEscrow = (escrowId, checked) => {
    if (checked) {
      setSelectedArchivedIds(prev => [...prev, escrowId]);
    } else {
      setSelectedArchivedIds(prev => prev.filter(id => id !== escrowId));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Debug Panel - Admin Only */}
        {user?.username === 'admin' && (
          <Box sx={{ mb: 4 }}>
            {/* Summary Debug Card */}
            <Card
              onClick={() => setDebugExpanded(!debugExpanded)}
              sx={(theme) => ({
                background: `linear-gradient(135deg,
                  ${alpha(theme.palette.primary.main, 0.08)} 0%,
                  ${alpha(theme.palette.secondary.main, 0.08)} 50%,
                  ${alpha(theme.palette.error.main, 0.08)} 100%
                )`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: '16px',
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                  transform: 'translateY(-2px)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg,
                    ${theme.palette.primary.main} 0%,
                    ${theme.palette.secondary.main} 33%,
                    ${theme.palette.error.main} 66%,
                    ${theme.palette.warning.main} 100%
                  )`,
                }
              })}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={(theme) => ({
                        p: 1.5,
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                      })}
                    >
                      <BugReport />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                      Debug Panel: Escrows Dashboard
                    </Typography>
                    <Chip
                      label={process.env.NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟢 LOCAL'}
                      sx={{
                        background: process.env.NODE_ENV === 'production'
                          ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)'
                          : 'linear-gradient(45deg, #00b894, #00cec9)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip
                      label="Admin Only"
                      sx={{
                        background: 'linear-gradient(45deg, #fdcb6e, #e17055)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {debugExpanded ? <ExpandLess /> : <ExpandMore />}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNetworkData({
                          stats: networkMonitor.getStats(),
                          requests: networkMonitor.getRequests(),
                          errors: networkMonitor.getErrors()
                        });
                      }}
                      sx={(theme) => ({
                        color: theme.palette.primary.main,
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.1)
                        }
                      })}
                    >
                      <MuiTooltip title="Refresh Network Data">
                        <Refresh />
                      </MuiTooltip>
                    </IconButton>
                    <CopyButton
                      text={JSON.stringify({
                        pageInfo: {
                          url: window.location.href,
                          timestamp: new Date().toISOString(),
                          user: user?.username,
                          userAgent: navigator.userAgent,
                          screenResolution: `${window.screen.width}x${window.screen.height}`
                        },
                        escrowsData: {
                          totalEscrows: escrows.length,
                          activeEscrows: escrows.filter(e => e.escrowStatus === 'Active Under Contract' || e.escrowStatus === 'active under contract').length,
                          stats: stats,
                          escrowsSample: escrows.slice(0, 3).map(e => ({
                            id: e.id,
                            propertyAddress: e.propertyAddress,
                            status: e.escrowStatus,
                            salePrice: e.salePrice,
                            acceptanceDate: e.acceptanceDate
                          })),
                          selectedStatus: selectedStatus,
                          viewMode: viewMode
                        },
                        networkActivity: {
                          stats: networkData.stats,
                          recentRequests: networkData.requests.slice(-5),
                          errorCount: networkData.stats.errors,
                          allRequests: networkData.requests,
                          allErrors: networkData.errors
                        },
                        browserInfo: {
                          location: window.location,
                          localStorage: {
                            hasUser: !!localStorage.getItem('user'),
                            userKeys: Object.keys(localStorage)
                          }
                        }
                      }, null, 2)}
                      label="📋 Copy Debug Summary"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #764ba2, #667eea)',
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Detailed Debug Panel */}
            <Collapse in={debugExpanded}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Dashboard Statistics */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Analytics /> Escrows Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Total Escrows</Typography>
                          <Typography variant="h4">{escrows.length}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Active Escrows</Typography>
                          <Typography variant="h4">{stats.activeEscrows}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Total Volume</Typography>
                          <Typography variant="h5">${(stats.totalVolume / 1000000).toFixed(1)}M</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Commission</Typography>
                          <Typography variant="h5">${(stats.projectedCommission / 1000).toFixed(0)}K</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Grid>

                {/* API & Network Info */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 169, 244, 0.1))',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NetworkCheck /> Network & API Status
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">API Endpoint</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {process.env.REACT_APP_API_URL || 'Not configured'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Environment</Typography>
                          <Chip
                            label={process.env.NODE_ENV}
                            size="small"
                            color={process.env.NODE_ENV === 'production' ? 'error' : 'success'}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Network Requests</Typography>
                          <Typography variant="body2">{networkData.stats.total}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Network Errors</Typography>
                          <Typography variant="body2" color={networkData.stats.errors > 0 ? 'error' : 'inherit'}>
                            {networkData.stats.errors}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Error Rate</Typography>
                          <Typography variant="body2" color={networkData.stats.errorRate > 10 ? 'error' : 'inherit'}>
                            {networkData.stats.errorRate.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Avg Response Time</Typography>
                          <Typography variant="body2">
                            {networkData.stats.avgDuration.toFixed(0)}ms
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>

                {/* Recent Escrows */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Storage /> Recent Escrows Data
                      </Typography>
                      <Stack spacing={2}>
                        {escrows.slice(0, 3).map((escrow) => (
                          <Box
                            key={escrow.id}
                            sx={{
                              p: 2,
                              background: 'rgba(0,0,0,0.03)',
                              borderRadius: '8px',
                              fontFamily: 'monospace',
                              fontSize: '0.85rem'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ID: {escrow.id} | Status: {escrow.escrowStatus}
                            </Typography>
                            <Typography variant="body2">
                              {escrow.propertyAddress}
                            </Typography>
                            <Typography variant="body2">
                              Price: ${escrow.salePrice?.toLocaleString() || 0} | COE: {safeFormatDate(escrow.scheduledCoeDate, 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Card>
                </Grid>

                {/* Network Activity Log */}
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(171, 71, 188, 0.1))',
                    border: '1px solid rgba(156, 39, 176, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NetworkCheck /> Network Activity Log
                        <Chip
                          label={`${networkData.requests.length} requests`}
                          size="small"
                          sx={{ ml: 'auto' }}
                        />
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <Stack spacing={1}>
                          {networkData.requests.slice(-10).reverse().map((req, index) => (
                            <Box
                              key={req.id || index}
                              sx={{
                                p: 1.5,
                                background: req.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                border: `1px solid ${req.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {req.method} {req.statusCode || 'PENDING'}
                                </Typography>
                                <Typography variant="caption">
                                  {req.duration ? `${req.duration}ms` : 'pending...'}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {req.url}
                              </Typography>
                              {req.error && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                  Error: {req.error}
                                </Typography>
                              )}
                            </Box>
                          ))}
                          {networkData.requests.length === 0 && (
                            <Typography variant="caption" color="text.secondary" align="center">
                              No network requests yet. Refresh to see latest activity.
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Collapse>
          </Box>
        )}

        {/* Hero Section with Stats */}
        <HeroSection>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Escrow Management
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Track and manage all your real estate transactions in one place
            </Typography>
          </motion.div>

          {/* Stats Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Escrows
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      <CountUp end={stats.totalEscrows || 0} duration={2} separator="," />
                    </Typography>
                  </Box>
                  <Home sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
                {/* Mini chart */}
                <Box sx={{ height: 40, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.slice(-7)}>
                      <defs>
                        <linearGradient id="colorEscrows" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#ffffff"
                        fill="url(#colorEscrows)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Active Escrows
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      <CountUp end={stats.activeEscrows || 0} duration={2} separator="," />
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
                {/* Mini chart */}
                <Box sx={{ height: 40, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.slice(-7)}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Volume
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      $<CountUp
                        end={(stats.totalVolume || 0) / 1000000}
                        duration={2}
                        separator=","
                        decimals={1}
                        suffix="M"
                      />
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
                {/* Mini chart */}
                <Box sx={{ height: 40, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(-7)}>
                      <Bar dataKey="value" fill="rgba(255,255,255,0.6)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Commission
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      $<CountUp
                        end={(stats.projectedCommission || 0) / 1000}
                        duration={2}
                        separator=","
                        decimals={0}
                        suffix="K"
                      />
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
                {/* Mini chart */}
                <Box sx={{ height: 40, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.slice(-7)}>
                      <defs>
                        <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#ffffff"
                        fill="url(#colorCommission)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleCreateNew}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Create New Escrow
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Assessment />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Transaction Analytics
            </Button>
          </Box>
        </HeroSection>

      {/* Status Tabs with View Mode Toggle */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 2,
          }}
        >
          <Tabs
            value={selectedStatus}
            onChange={(e, newValue) => setSelectedStatus(newValue)}
            sx={{
              flex: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                minHeight: 56,
              },
              '& .Mui-selected': {
                fontWeight: 700,
              },
            }}
          >
            <Tab label="Active Escrows" value="active" />
            <Tab label="Closed Escrows" value="closed" />
            <Tab label="Cancelled Escrows" value="cancelled" />
            <Tab
              label={`Archived Escrows${archivedCount > 0 ? ` (${archivedCount})` : ''}`}
              value="archived"
              sx={{
                color: selectedStatus === 'archived' ? 'warning.main' : 'text.secondary'
              }}
            />
          </Tabs>

          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModule sx={{ mr: 1, fontSize: 18 }} />
                Grid
              </ToggleButton>
              <ToggleButton value="compact" aria-label="compact view">
                <ViewList sx={{ mr: 1, fontSize: 18 }} />
                Compact
              </ToggleButton>
              <ToggleButton value="detailed" aria-label="detailed view">
                <ViewAgenda sx={{ mr: 1, fontSize: 18 }} />
                Detailed
              </ToggleButton>
            </ToggleButtonGroup>

            <IconButton
              size="small"
              onClick={() => setShowCalendar(!showCalendar)}
              sx={{
                color: showCalendar ? 'primary.main' : 'text.secondary',
                backgroundColor: showCalendar ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              <CalendarToday />
            </IconButton>
          </Stack>
        </Paper>
      </Box>


        {/* Enhanced Charts - REMOVED PER USER REQUEST */}
        {/* <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: 250,
                  background: theme => alpha(theme.palette.primary.main, 0.03),
                  border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: theme => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}>
                  Escrow Volume Trend
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => `$${value}M`}
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#2196f3"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: 250,
                  background: theme => alpha(theme.palette.success.main, 0.03),
                  border: theme => `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    left: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: theme => `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 70%)`,
                  }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}>
                  Monthly Escrow Count
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="escrows"
                      stroke="#4caf50"
                      strokeWidth={3}
                      dot={{ fill: '#4caf50', r: 6, strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid> */}


      {/* Calendar View */}
      {showCalendar ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Escrow Calendar - Key Dates
          </Typography>
          <Grid container spacing={2}>
            {(() => {
              // Generate calendar grid for current month
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const daysInMonth = lastDay.getDate();
              const startingDayOfWeek = firstDay.getDay();

              // Get all escrows with important dates
              const allEscrows = [...escrows, ...archivedEscrows];

              // Organize escrows by date
              const escrowsByDate = {};
              allEscrows.forEach(escrow => {
                const dates = [
                  { date: escrow.openDate, type: 'Open', color: '#4caf50' },
                  { date: escrow.closeDate, type: 'Close', color: '#2196f3' },
                  { date: escrow.inspectionDate, type: 'Inspection', color: '#ff9800' },
                  { date: escrow.appraisalDate, type: 'Appraisal', color: '#9c27b0' },
                ].filter(d => d.date);

                dates.forEach(({ date, type, color }) => {
                  const dateStr = safeFormatDate(date, 'yyyy-MM-dd');
                  if (!escrowsByDate[dateStr]) escrowsByDate[dateStr] = [];
                  escrowsByDate[dateStr].push({ ...escrow, eventType: type, eventColor: color });
                });
              });

              const days = [];

              // Day headers
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
                days.push(
                  <Grid item xs={12 / 7} key={`header-${day}`}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'center', display: 'block' }}>
                      {day}
                    </Typography>
                  </Grid>
                );
              });

              // Empty cells before first day
              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(<Grid item xs={12 / 7} key={`empty-${i}`}><Box sx={{ height: 80 }} /></Grid>);
              }

              // Calendar days
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEscrows = escrowsByDate[dateStr] || [];
                const isToday = day === today.getDate() && month === today.getMonth();

                days.push(
                  <Grid item xs={12 / 7} key={`day-${day}`}>
                    <Paper
                      elevation={isToday ? 3 : 0}
                      onClick={() => {
                        if (dayEscrows.length > 0) {
                          setSelectedDate({ date: dateStr, escrows: dayEscrows });
                          setCalendarDialogOpen(true);
                        }
                      }}
                      sx={{
                        height: 80,
                        p: 1,
                        cursor: dayEscrows.length > 0 ? 'pointer' : 'default',
                        border: theme => `1px solid ${isToday ? theme.palette.primary.main : theme.palette.divider}`,
                        backgroundColor: isToday ? theme => alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                        '&:hover': dayEscrows.length > 0 ? {
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                        } : {},
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {day}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {dayEscrows.slice(0, 2).map((escrow, idx) => (
                          <Chip
                            key={idx}
                            label={escrow.eventType}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: 9,
                              mb: 0.5,
                              backgroundColor: escrow.eventColor,
                              color: 'white',
                              '& .MuiChip-label': { px: 0.5 },
                            }}
                          />
                        ))}
                        {dayEscrows.length > 2 && (
                          <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                            +{dayEscrows.length - 2} more
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              }

              return days;
            })()}
          </Grid>
        </Paper>
      ) : (
        <>
          {/* Escrow Cards */}
          <Box sx={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            flexDirection: 'column',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : undefined,
            gap: 2
          }}>
        <AnimatePresence>
          {(() => {
            // If archived tab is selected, show archived escrows
            if (selectedStatus === 'archived') {
              if (!archivedEscrows || archivedEscrows.length === 0) {
                return (
                  <Paper
                    sx={{
                      p: 6,
                      height: 240,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      background: theme => alpha(theme.palette.warning.main, 0.03),
                      border: theme => `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      gridColumn: '1 / -1',
                    }}
                  >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No archived escrows
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Archived escrows will appear here
                    </Typography>
                  </Paper>
                );
              }

              return (
                <>
                  {/* Batch action toolbar for archived escrows */}
                  <Box sx={{ gridColumn: '1 / -1', mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox
                      checked={selectedArchivedIds.length === archivedEscrows.length && archivedEscrows.length > 0}
                      indeterminate={selectedArchivedIds.length > 0 && selectedArchivedIds.length < archivedEscrows.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <Typography variant="body2">
                      {selectedArchivedIds.length > 0
                        ? `${selectedArchivedIds.length} selected`
                        : 'Select all'}
                    </Typography>
                    {selectedArchivedIds.length > 0 && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={batchDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
                        onClick={handleBatchDelete}
                        disabled={batchDeleting}
                      >
                        Delete {selectedArchivedIds.length} Escrow{selectedArchivedIds.length > 1 ? 's' : ''}
                      </Button>
                    )}
                  </Box>

                  {archivedEscrows.map((escrow, index) => {
                const isSelected = selectedArchivedIds.includes(escrow.id);

                return (
                  <Box key={escrow.id} sx={{ position: 'relative' }}>
                    {/* Selection checkbox */}
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => handleSelectEscrow(escrow.id, e.target.checked)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 10,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {viewMode === 'grid' ? (
                      <EscrowCardGrid
                        escrow={escrow}
                        index={index}
                        showCommission={true}
                        isArchived={true}
                        onQuickAction={(action, escrowData) => {
                          if (action === 'view') {
                            handleEscrowClick(escrowData.id);
                          } else if (action === 'restore') {
                            handleRestore(escrowData.id);
                          } else if (action === 'delete') {
                            handlePermanentDelete(escrowData.id);
                          }
                        }}
                        sx={{ pl: 5 }}
                      />
                    ) : viewMode === 'compact' ? (
                      <EscrowCompactCard
                        escrow={escrow}
                        index={index}
                        showCommission={true}
                        isArchived={true}
                        onRestore={() => handleRestore(escrow.id)}
                        onDelete={() => handlePermanentDelete(escrow.id)}
                        sx={{ pl: 5 }}
                      />
                    ) : (
                      <EscrowCard
                        escrow={escrow}
                        onClick={handleEscrowClick}
                        onChecklistUpdate={handleChecklistUpdate}
                        onRestore={handleRestore}
                        onDelete={handlePermanentDelete}
                        isArchived={true}
                        index={index}
                        sx={{ pl: 5 }}
                      />
                    )}
                  </Box>
                );
              })}
                </>
              );
            }

            // Otherwise show regular escrows filtered by status
            const filteredEscrows = escrows.filter(e => {
              switch (selectedStatus) {
                case 'active':
                  return e.escrowStatus === 'Active Under Contract' ||
                         e.escrowStatus === 'active under contract' ||
                         e.escrowStatus === 'Pending' ||
                         e.escrowStatus === 'pending' ||
                         e.escrowStatus === 'Active' ||
                         e.escrowStatus === 'active';
                case 'closed':
                  return e.escrowStatus === 'Closed' ||
                         e.escrowStatus === 'closed' ||
                         e.escrowStatus === 'Completed' ||
                         e.escrowStatus === 'completed';
                case 'cancelled':
                  return e.escrowStatus === 'Cancelled' ||
                         e.escrowStatus === 'cancelled' ||
                         e.escrowStatus === 'Withdrawn' ||
                         e.escrowStatus === 'withdrawn' ||
                         e.escrowStatus === 'Expired' ||
                         e.escrowStatus === 'expired';
                default:
                  return true;
              }
            });
            
            if (!filteredEscrows || filteredEscrows.length === 0) {
              return (
            <Paper
              sx={{
                p: 6,
                height: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: theme => alpha(theme.palette.primary.main, 0.03),
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                gridColumn: '1 / -1',
              }}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No {selectedStatus} escrows found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedStatus === 'active' ? 'Create a new escrow to get started' : `No ${selectedStatus} escrows in the system`}
              </Typography>
            </Paper>
              );
            } else {
              return filteredEscrows.map((escrow, index) => {
                // Choose component based on view mode
                if (viewMode === 'grid') {
                  return (
                    <EscrowCardGrid
                      key={escrow.id}
                      escrow={escrow}
                      index={index}
                      showCommission={true}
                      onQuickAction={(action, escrowData) => {
                        if (action === 'view') {
                          handleEscrowClick(escrowData.id);
                        } else if (action === 'archive') {
                          handleArchive(escrowData.id);
                        }
                      }}
                    />
                  );
                } else if (viewMode === 'compact') {
                  return (
                    <EscrowCompactCard
                      key={escrow.id}
                      escrow={escrow}
                      index={index}
                      showCommission={true}
                    />
                  );
                } else {
                  // Detailed view - use original card
                  return (
                    <EscrowCard
                      key={escrow.id}
                      escrow={escrow}
                      onClick={handleEscrowClick}
                      onChecklistUpdate={handleChecklistUpdate}
                      onArchive={handleArchive}
                      isArchived={false}
                      index={index}
                    />
                  );
                }
              });
            }
          })()}
        </AnimatePresence>
      </Box>
        </>
      )}

      {/* Calendar Date Detail Dialog */}
      <Dialog
        open={calendarDialogOpen}
        onClose={() => setCalendarDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDate && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Escrow Events - {safeFormatDate(selectedDate.date, 'MMMM d, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDate.escrows.length} event{selectedDate.escrows.length !== 1 ? 's' : ''} scheduled
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedDate && (
            <List>
              {selectedDate.escrows.map((escrow, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    border: theme => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                  onClick={() => {
                    setCalendarDialogOpen(false);
                    handleEscrowClick(escrow.id);
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: escrow.eventColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    >
                      {escrow.eventType.charAt(0)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {escrow.address}
                        </Typography>
                        <Chip
                          label={escrow.eventType}
                          size="small"
                          sx={{
                            backgroundColor: escrow.eventColor,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Client: {escrow.clientName || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: ${escrow.salePrice?.toLocaleString() || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {escrow.status}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* New Escrow Modal */}
      <NewEscrowModal
        open={showNewEscrowModal}
        onClose={() => setShowNewEscrowModal(false)}
        onSuccess={handleNewEscrowSuccess}
      />
      </Container>
    </>
  );
};

export default EscrowsDashboard;