import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Checkbox,
  LinearProgress,
  IconButton,
  Collapse,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  AccountBalance as BankIcon,
  AdminPanelSettings as AdminIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from 'recharts';

// Styled components (blue theme for escrows)
const WidgetCard = styled(motion.div)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)', // Blue gradient (escrows theme)
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
  }
}));

const CategoryCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${color}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: `0 8px 20px ${color}40`,
  }
}));

const ChecklistItem = styled(motion.div)(({ theme, checked }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  background: checked 
    ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%)'
    : 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1),
  border: `1px solid ${checked ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: checked
      ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 212, 255, 0.3) 100%)'
      : 'rgba(255, 255, 255, 0.15)',
    transform: 'translateX(8px)',
  }
}));

const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = '#00ff88' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Box position="relative" display="inline-flex">
      <svg width={size} height={size}>
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        right={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography variant="h4" fontWeight="bold">
          {progress}%
        </Typography>
        <Typography variant="caption">Complete</Typography>
      </Box>
    </Box>
  );
};

const AnimatedCheckbox = styled(Checkbox)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.5)',
  '&.Mui-checked': {
    color: '#00ff88',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 28,
  }
}));

function ChecklistWidget({ type, data, expanded, onExpand, onUpdate }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  
  if (!data) return null;

  // Define checklist categories
  const categories = {
    loan: {
      label: 'Loan',
      icon: <BankIcon />,
      color: '#4ecdc4',
      gradient: 'linear-gradient(135deg, #4ecdc4 0%, #44a8b3 100%)',
      items: [
        { key: 'le', label: 'Loan Estimate (LE)', priority: 'high' },
        { key: 'lockedRate', label: 'Rate Locked', priority: 'high' },
        { key: 'appraisalOrdered', label: 'Appraisal Ordered', priority: 'medium' },
        { key: 'appraisalReceived', label: 'Appraisal Received', priority: 'medium' },
        { key: 'clearToClose', label: 'Clear to Close', priority: 'critical' },
        { key: 'cd', label: 'Closing Disclosure (CD)', priority: 'critical' },
        { key: 'loanDocsSigned', label: 'Loan Docs Signed', priority: 'high' },
        { key: 'cashToClosePaid', label: 'Cash to Close Paid', priority: 'high' },
        { key: 'loanFunded', label: 'Loan Funded', priority: 'critical' }
      ]
    },
    house: {
      label: 'Property',
      icon: <HomeIcon />,
      color: '#4A90E2',
      gradient: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)', // Blue gradient (escrows theme)
      items: [
        { key: 'homeInspectionOrdered', label: 'Inspection Ordered', priority: 'high' },
        { key: 'emd', label: 'Earnest Money Deposited', priority: 'critical' },
        { key: 'solarTransferInitiated', label: 'Solar Transfer', priority: 'low' },
        { key: 'avid', label: 'AVID Warranty', priority: 'low' },
        { key: 'homeInspectionReceived', label: 'Inspection Received', priority: 'high' },
        { key: 'sellerDisclosures', label: 'Seller Disclosures', priority: 'medium' },
        { key: 'rr', label: 'Repair Request (RR)', priority: 'medium' },
        { key: 'cr', label: 'Contingency Removal (CR)', priority: 'critical' },
        { key: 'recorded', label: 'Recorded', priority: 'critical' }
      ]
    },
    admin: {
      label: 'Admin',
      icon: <AdminIcon />,
      color: '#ffd700',
      gradient: 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)',
      items: [
        { key: 'mlsStatusUpdate', label: 'MLS Status Updated', priority: 'medium' },
        { key: 'tcEmail', label: 'TC Email Sent', priority: 'low' },
        { key: 'tcGlideInvite', label: 'TC Glide Invite', priority: 'low' },
        { key: 'addContactsToPhone', label: 'Contacts Added to Phone', priority: 'low' },
        { key: 'addContactsToNotion', label: 'Contacts in Notion', priority: 'low' }
      ]
    }
  };

  const category = categories[type];
  if (!category) return null;

  // Calculate progress
  const completedItems = category.items.filter(item => data[item.key]).length;
  const totalItems = category.items.length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Group items by priority
  const criticalItems = category.items.filter(item => item.priority === 'critical');
  const highItems = category.items.filter(item => item.priority === 'high');
  const mediumItems = category.items.filter(item => item.priority === 'medium');
  const lowItems = category.items.filter(item => item.priority === 'low');

  // Data for radial chart
  const radialData = [
    { name: 'Progress', value: progress, fill: category.color }
  ];

  const handleItemToggle = (key) => {
    if (onUpdate) {
      onUpdate(type, key, !data[key]);
    }
  };

  return (
    <WidgetCard
      gradient={category.gradient}
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated Background Pattern */}
      <motion.div
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          {category.icon}
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {category.label} Checklist
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {completedItems} of {totalItems} complete
            </Typography>
          </Box>
        </Box>
        
        {/* Progress Ring */}
        <ProgressRing progress={progress} size={80} color={category.color} />
      </Box>

      {/* Progress Bar */}
      <Box mb={3}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 6,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              background: `linear-gradient(90deg, ${category.color} 0%, #00ff88 100%)`,
              boxShadow: `0 0 20px ${category.color}80`,
            }
          }}
        />
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Paper sx={{ 
            p: 1.5, 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <TrophyIcon sx={{ color: '#ffd700', mb: 0.5 }} />
            <Typography variant="h6" fontWeight="bold">
              {criticalItems.filter(item => data[item.key]).length}/{criticalItems.length}
            </Typography>
            <Typography variant="caption">Critical</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ 
            p: 1.5, 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <TrendingIcon sx={{ color: '#00ff88', mb: 0.5 }} />
            <Typography variant="h6" fontWeight="bold">
              {highItems.filter(item => data[item.key]).length}/{highItems.length}
            </Typography>
            <Typography variant="caption">High Priority</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper sx={{ 
            p: 1.5, 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <SpeedIcon sx={{ color: '#4ecdc4', mb: 0.5 }} />
            <Typography variant="h6" fontWeight="bold">
              {progress}%
            </Typography>
            <Typography variant="caption">Complete</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Checklist Items Preview */}
      <Box mb={2}>
        {category.items.slice(0, 3).map((item, index) => (
          <ChecklistItem
            key={item.key}
            checked={data[item.key]}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleItemToggle(item.key);
            }}
            onMouseEnter={() => setHoveredItem(item.key)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <AnimatedCheckbox
              checked={data[item.key]}
              icon={<UncheckedIcon />}
              checkedIcon={
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <CheckIcon />
                </motion.div>
              }
            />
            <Typography 
              variant="body2" 
              sx={{ 
                flex: 1,
                textDecoration: data[item.key] ? 'line-through' : 'none',
                opacity: data[item.key] ? 0.7 : 1
              }}
            >
              {item.label}
            </Typography>
            {item.priority === 'critical' && (
              <Chip
                label="Critical"
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 0, 0, 0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.65rem'
                }}
              />
            )}
          </ChecklistItem>
        ))}
        
        {category.items.length > 3 && (
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.7, 
              display: 'block', 
              textAlign: 'center', 
              mt: 1 
            }}
          >
            +{category.items.length - 3} more items
          </Typography>
        )}
      </Box>

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            All Items
          </Typography>
          
          {/* Group by Priority */}
          {criticalItems.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Critical Items
              </Typography>
              {criticalItems.map((item) => (
                <ChecklistItem
                  key={item.key}
                  checked={data[item.key]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemToggle(item.key);
                  }}
                >
                  <AnimatedCheckbox checked={data[item.key]} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item.label}
                  </Typography>
                </ChecklistItem>
              ))}
            </Box>
          )}
          
          {highItems.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                High Priority
              </Typography>
              {highItems.map((item) => (
                <ChecklistItem
                  key={item.key}
                  checked={data[item.key]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemToggle(item.key);
                  }}
                >
                  <AnimatedCheckbox checked={data[item.key]} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item.label}
                  </Typography>
                </ChecklistItem>
              ))}
            </Box>
          )}
          
          {[...mediumItems, ...lowItems].length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                Other Items
              </Typography>
              {[...mediumItems, ...lowItems].map((item) => (
                <ChecklistItem
                  key={item.key}
                  checked={data[item.key]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemToggle(item.key);
                  }}
                >
                  <AnimatedCheckbox checked={data[item.key]} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item.label}
                  </Typography>
                </ChecklistItem>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Expand Indicator */}
      <Box display="flex" justifyContent="center" mt={2}>
        <IconButton
          size="small"
          sx={{ 
            color: 'white', 
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.3s' 
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
    </WidgetCard>
  );
}

export default ChecklistWidget;