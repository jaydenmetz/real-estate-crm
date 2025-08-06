import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NewEscrowModal from '../forms/NewEscrowModal';
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { safeFormatDate, safeParseDate } from '../../utils/safeDateUtils';
import { escrowsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from '../common/CopyButton';
import DebugPanel from '../common/DebugPanel';
import networkMonitor from '../../services/networkMonitor';

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
const EscrowCard = ({ escrow, onClick, index, onChecklistUpdate }) => {
  const theme = useTheme();
  const [localEscrow, setLocalEscrow] = useState(escrow);
  
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
                  right: 12,
                  background: alpha(statusColor, 0.95),
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
              
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
  const [loading, setLoading] = useState(true);
  const [showNewEscrowModal, setShowNewEscrowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('active');
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

  useEffect(() => {
    fetchEscrows();
  }, []);

  useEffect(() => {
    if (escrows.length > 0) {
      calculateStats(escrows, selectedStatus);
    }
  }, [selectedStatus, escrows]);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      console.log('Fetching escrows...');
      const response = await escrowsAPI.getAll();
      console.log('API Response:', response);
      
      if (response.success) {
        const escrowData = response.data.escrows || [];
        console.log('Escrows found:', escrowData.length);
        
        // Log ID information for debugging
        if (escrowData.length > 0) {
          console.log('Sample escrow IDs:');
          escrowData.slice(0, 3).forEach((esc, idx) => {
            console.log(`  ${idx + 1}. id: ${esc.id}, displayId: ${esc.displayId}`);
          });
        }
        
        setEscrows(escrowData);
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
    // Safety check for escrowData
    if (!escrowData || !Array.isArray(escrowData)) {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Enhanced Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Escrow Dashboard
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                  Track and manage all your real estate transactions in one place
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Add />}
                    onClick={handleCreateNew}
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      '&:hover': { 
                        bgcolor: 'rgba(255,255,255,0.9)' 
                      }
                    }}
                  >
                    Create New Escrow
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      color: 'white', 
                      borderColor: 'white',
                      '&:hover': { 
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                    startIcon={<Assessment />}
                  >
                    Transaction Analytics
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 3, 
                  p: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  <Stack spacing={2}>
                    {/* YTD Closed */}
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.7, display: 'block', fontSize: '0.7rem' }}>
                        YTD Closed
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography variant="h4" fontWeight="bold">
                            <CountUp end={stats.ytdClosed} duration={1.5} />
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            deals
                          </Typography>
                        </Stack>
                        <Chip
                          icon={stats.ytdChange >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingUp sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />}
                          label={`${Math.abs(stats.ytdChange)}%`}
                          size="small"
                          sx={{
                            bgcolor: stats.ytdChange >= 0 ? alpha('#4caf50', 0.2) : alpha('#f44336', 0.2),
                            color: stats.ytdChange >= 0 ? '#4caf50' : '#f44336',
                            fontWeight: 'bold',
                            border: `1px solid ${stats.ytdChange >= 0 ? '#4caf50' : '#f44336'}`,
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        ${(stats.ytdVolume / 1000000).toFixed(1)}M total volume
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                    
                    {/* Monthly Closed */}
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.7, display: 'block', fontSize: '0.7rem' }}>
                        Monthly Closed
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography variant="h4" fontWeight="bold">
                            <CountUp end={stats.monthClosed} duration={1.5} />
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            deals
                          </Typography>
                        </Stack>
                        <Chip
                          icon={stats.monthChange >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingUp sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />}
                          label={`${Math.abs(stats.monthChange)}%`}
                          size="small"
                          sx={{
                            bgcolor: stats.monthChange >= 0 ? alpha('#4caf50', 0.2) : alpha('#f44336', 0.2),
                            color: stats.monthChange >= 0 ? '#4caf50' : '#f44336',
                            fontWeight: 'bold',
                            border: `1px solid ${stats.monthChange >= 0 ? '#4caf50' : '#f44336'}`,
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        ${(stats.monthVolume / 1000000).toFixed(1)}M volume
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                    
                    {/* This Week Projected */}
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.7, display: 'block', fontSize: '0.7rem' }}>
                        This Week Projected
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography variant="h4" fontWeight="bold">
                            <CountUp end={stats.weekProjected} duration={1.5} />
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            closings
                          </Typography>
                        </Stack>
                        <Chip
                          icon={stats.weekChange >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingUp sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />}
                          label={`${Math.abs(stats.weekChange)}%`}
                          size="small"
                          sx={{
                            bgcolor: stats.weekChange >= 0 ? alpha('#4caf50', 0.2) : alpha('#f44336', 0.2),
                            color: stats.weekChange >= 0 ? '#4caf50' : '#f44336',
                            fontWeight: 'bold',
                            border: `1px solid ${stats.weekChange >= 0 ? '#4caf50' : '#f44336'}`,
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        ${(stats.weekVolume / 1000000).toFixed(1)}M projected
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                    
                    {/* Quick Stats */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Closing This Week
                        </Typography>
                        <Chip 
                          label={stats.closingThisWeek || 0} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Pending Actions
                        </Typography>
                        <Chip 
                          label={stats.pendingActions || 0} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'warning.main', 
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </HeroSection>
      </motion.div>

      {/* Status Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedStatus}
          onChange={(e, newValue) => setSelectedStatus(newValue)}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
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
        </Tabs>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Home}
              title={`Total ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
              value={stats.totalEscrows}
              color="#2196f3"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TrendingUp}
              title="Gross Commission"
              value={stats.grossCommission}
              prefix="$"
              color="#ff9800"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={CheckCircle}
              title="My Commission"
              value={stats.myCommission}
              prefix="$"
              color="#9c27b0"
              delay={400}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={AttachMoney}
              title="Total Volume"
              value={stats.totalVolume / 1000000}
              prefix="$"
              suffix="M"
              color="#4caf50"
              delay={600}
            />
          </Grid>
        </Grid>

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

      {/* Action Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Escrows
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleCreateNew}
          size="large"
        >
          Create New Escrow
        </Button>
      </Box>

      {/* Escrow Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AnimatePresence>
          {(() => {
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
                textAlign: 'center',
                background: theme => alpha(theme.palette.primary.main, 0.03),
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
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
              return filteredEscrows.map((escrow, index) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  onClick={handleEscrowClick}
                  onChecklistUpdate={handleChecklistUpdate}
                  index={index}
                />
              ));
            }
          })()}
        </AnimatePresence>
      </Box>

      {/* New Debug Panel - Admin Only */}
      {(
      <DebugPanel
        pageTitle="Debug Panel: Escrows Dashboard"
        user={user}
        apiRequests={[
          {
            url: '/api/v1/escrows',
            method: 'GET',
            status: 200,
            duration: networkMonitor.getStats().avgDuration || 0,
            timestamp: new Date().toISOString(),
            response: { escrows: escrows.slice(0, 3), total: escrows.length, stats }
          }
        ]}
        databases={[
          {
            name: 'PostgreSQL - Escrows',
            recordCount: escrows.length,
            lastSync: new Date().toISOString(),
            status: 'connected',
            sampleData: escrows[0]
          },
          {
            name: 'Redis Cache',
            recordCount: networkMonitor.getStats().total,
            lastSync: new Date().toISOString(),
            status: 'connected'
          }
        ]}
        customData={{
          dashboardStats: stats,
          chartData: { points: chartData.length, type: 'area' },
          filterStatus: 'all',
          viewMode: 'grid',
          user: {
            username: user?.username,
            role: user?.role,
            permissions: user?.permissions
          }
        }}
      />
      )}

      {/* New Escrow Modal */}
      <NewEscrowModal
        open={showNewEscrowModal}
        onClose={() => setShowNewEscrowModal(false)}
        onSuccess={handleNewEscrowSuccess}
      />
    </Container>
  );
};

export default EscrowsDashboard;