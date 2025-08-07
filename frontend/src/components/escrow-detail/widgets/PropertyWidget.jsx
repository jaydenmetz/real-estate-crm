import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  Grid,
  IconButton,
  Collapse,
  Button,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Home as HomeIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon,
  Landscape as LandscapeIcon,
  Pool as PoolIcon,
  Spa as SpaIcon,
  Security as SecurityIcon,
  Elderly as ElderlyIcon,
  ExpandMore as ExpandMoreIcon,
  Map as MapIcon,
  PhotoLibrary as PhotoIcon,
  Launch as LaunchIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// Styled components
const WidgetCard = styled(motion.div)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
  }
}));

const House3D = styled(motion.div)(({ theme }) => ({
  width: 120,
  height: 120,
  position: 'relative',
  margin: '0 auto',
  transformStyle: 'preserve-3d',
  transform: 'rotateX(-20deg) rotateY(45deg)',
  '& .house-base': {
    position: 'absolute',
    width: 80,
    height: 60,
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: 40,
      background: 'rgba(255, 255, 255, 0.4)',
      transform: 'rotateX(90deg) translateZ(20px)',
      transformOrigin: 'bottom',
    }
  },
  '& .house-roof': {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: '50px solid transparent',
    borderRight: '50px solid transparent',
    borderBottom: '40px solid rgba(255, 100, 100, 0.6)',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  }
}));

const RoomBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  background: 'white',
  color: theme.palette.primary.main,
  borderRadius: '50%',
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
}));

const FeatureChip = styled(motion.div)(({ theme, active }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1.5),
  background: active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${active ? 'white' : 'rgba(255, 255, 255, 0.3)'}`,
  color: 'white',
  fontSize: '0.875rem',
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const ComparisonChart = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1),
  backdropFilter: 'blur(10px)',
}));

function PropertyWidget({ data, expanded, onExpand, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!data) return null;

  // Calculate property age
  const propertyAge = data.yearBuilt ? new Date().getFullYear() - data.yearBuilt : null;
  
  // Size comparison data for chart
  const sizeData = [
    { name: 'House', value: data.squareFeet || 0, color: '#8884d8' },
    { name: 'Lot', value: (data.lotSizeSqft || 0) - (data.squareFeet || 0), color: '#82ca9d' },
  ];

  // Property features
  const features = [
    { icon: <PoolIcon fontSize="small" />, label: 'Pool', active: data.pool },
    { icon: <SpaIcon fontSize="small" />, label: 'Spa', active: data.spa },
    { icon: <SecurityIcon fontSize="small" />, label: 'Gated', active: data.gatedCommunity },
    { icon: <ElderlyIcon fontSize="small" />, label: 'Senior', active: data.seniorCommunity },
  ];

  return (
    <WidgetCard
      gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Property Details
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {data.propertyType || 'Single Family Home'}
          </Typography>
        </Box>
        <Chip
          label={`${propertyAge || '?'} years old`}
          size="small"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </Box>

      {/* 3D House with Room Badges */}
      <Box position="relative" mb={3}>
        <motion.div
          animate={{ rotateY: expanded ? 360 : 45 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <House3D>
            <div className="house-base" />
            <div className="house-roof" />
          </House3D>
        </motion.div>
        
        {/* Room count badges */}
        <RoomBadge sx={{ top: 20, left: 20 }}>
          <BedIcon fontSize="small" />
          {data.bedrooms || 0}
        </RoomBadge>
        <RoomBadge sx={{ top: 20, right: 20 }}>
          <BathtubIcon fontSize="small" />
          {data.bathrooms || 0}
        </RoomBadge>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <SquareFootIcon fontSize="small" />
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                House Size
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {data.squareFeet?.toLocaleString() || '—'} sqft
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <LandscapeIcon fontSize="small" />
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Lot Size
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {data.lotSizeSqft?.toLocaleString() || '—'} sqft
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Property Features */}
      <Box mb={2}>
        {features.map((feature, index) => (
          <FeatureChip
            key={index}
            active={feature.active}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {feature.icon}
            {feature.label}
          </FeatureChip>
        ))}
      </Box>

      {/* Price per Square Foot */}
      {data.pricePerSqft && (
        <Box
          p={1.5}
          bgcolor="rgba(255, 255, 255, 0.1)"
          borderRadius={1}
          textAlign="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            ${data.pricePerSqft}/sqft
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Price per Square Foot
          </Typography>
        </Box>
      )}

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <ComparisonChart>
          <Typography variant="h6" gutterBottom>
            Property Breakdown
          </Typography>
          
          {/* Size Comparison Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sizeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {sizeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Additional Details Grid */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                APN
              </Typography>
              <Typography variant="body2">{data.apn || '—'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                County
              </Typography>
              <Typography variant="body2">{data.county || '—'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                HOA Fee
              </Typography>
              <Typography variant="body2">
                {data.hoaFee ? `$${data.hoaFee}` : 'None'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                Zoning
              </Typography>
              <Typography variant="body2">{data.zoning || '—'}</Typography>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="contained"
              size="small"
              startIcon={<MapIcon />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Open map view
              }}
            >
              View Map
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhotoIcon />}
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
                // Open photo gallery
              }}
            >
              Photos
            </Button>
          </Box>
        </ComparisonChart>
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

export default PropertyWidget;