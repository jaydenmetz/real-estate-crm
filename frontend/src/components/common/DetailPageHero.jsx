import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Star,
  StarBorder,
  Edit,
  Share,
  Print,
  MoreVert,
  TrendingUp,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  LocationOn,
  AttachMoney,
  Home,
  Person,
  Event,
  AutoAwesome,
} from '@mui/icons-material';

// Animations
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// Styled Components
const HeroWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme?.spacing?.(4) || 32,
  borderRadius: theme?.spacing?.(3) || 24,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: 320,
}));

const HeroBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 400,
    height: 400,
    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: `${float} 8s ease-in-out infinite reverse`,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme?.spacing?.(6, 4) || '48px 32px',
  color: 'white',
  ...(theme?.breakpoints?.down?.('sm') && {
    [theme.breakpoints.down('sm')]: {
      padding: theme?.spacing?.(4, 2) || '32px 16px',
    },
  }),
}));

const ShimmerEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
  backgroundSize: '1000px 100%',
  animation: `${shimmer} 3s linear infinite`,
  pointerEvents: 'none',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme?.spacing?.(2) || 16,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'scale(1.1)',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

// Status configurations
const statusConfig = {
  active: { icon: <CheckCircle />, color: '#4CAF50' },
  pending: { icon: <Schedule />, color: '#FF9800' },
  completed: { icon: <CheckCircle />, color: '#4CAF50' },
  cancelled: { icon: <Error />, color: '#F44336' },
  hot: { icon: <TrendingUp />, color: '#F44336' },
  warm: { icon: <TrendingUp />, color: '#FF9800' },
  cold: { icon: <TrendingUp />, color: '#2196F3' },
  new: { icon: <Star />, color: '#4CAF50' },
  in_progress: { icon: <Schedule />, color: '#2196F3' },
};

const DetailPageHero = ({
  title,
  subtitle,
  status,
  statusLabel,
  type,
  icon: Icon = Home,
  primaryAction,
  secondaryAction,
  starred,
  onStarToggle,
  onEdit,
  onShare,
  onPrint,
  children,
  color,
  infoCards = [],
  breadcrumbs,
  customActions,
  aiAssistant,
}) => {
  const theme = useTheme();
  const statusInfo = statusConfig[status?.toLowerCase()] || { icon: null, color: theme?.palette?.grey?.[500] || '#9e9e9e' };
  
  // Determine gradient based on type or custom color
  const gradientMap = {
    escrow: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    listing: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    client: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    appointment: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    lead: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  };
  
  const background = color || gradientMap[type] || gradientMap.escrow;

  return (
    <HeroWrapper sx={{ background }}>
      <HeroBackground />
      <ShimmerEffect />
      
      <HeroContent>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} lg={children ? 7 : 12}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Breadcrumbs */}
              {breadcrumbs && (
                <Box sx={{ mb: 2 }}>
                  {breadcrumbs}
                </Box>
              )}
              
              <Stack spacing={3}>
                {/* Header with Icon and Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <Icon sx={{ fontSize: 32 }} />
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {title}
                      </Typography>
                      {subtitle && (
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                          {subtitle}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  
                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1}>
                    {onStarToggle && (
                      <Tooltip title={starred ? "Remove from favorites" : "Add to favorites"}>
                        <ActionButton onClick={onStarToggle}>
                          {starred ? <Star /> : <StarBorder />}
                        </ActionButton>
                      </Tooltip>
                    )}
                    {onEdit && (
                      <Tooltip title="Edit">
                        <ActionButton onClick={onEdit}>
                          <Edit />
                        </ActionButton>
                      </Tooltip>
                    )}
                    {onShare && (
                      <Tooltip title="Share">
                        <ActionButton onClick={onShare}>
                          <Share />
                        </ActionButton>
                      </Tooltip>
                    )}
                    {onPrint && (
                      <Tooltip title="Print">
                        <ActionButton onClick={onPrint}>
                          <Print />
                        </ActionButton>
                      </Tooltip>
                    )}
                    {customActions}
                  </Stack>
                </Stack>
                
                {/* Status and Actions */}
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  {status && (
                    <StatusChip
                      icon={statusInfo.icon}
                      label={statusLabel || status.toUpperCase()}
                      sx={{
                        '& .MuiChip-icon': {
                          color: statusInfo.color,
                        },
                      }}
                    />
                  )}
                  
                  {primaryAction && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {primaryAction}
                    </motion.div>
                  )}
                  
                  {secondaryAction && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {secondaryAction}
                    </motion.div>
                  )}
                  
                  {aiAssistant && (
                    <Chip
                      icon={<AutoAwesome />}
                      label="AI Assistant Active"
                      sx={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        animation: `${pulse} 2s ease-in-out infinite`,
                      }}
                    />
                  )}
                </Stack>
                
                {/* Info Cards */}
                {infoCards.length > 0 && (
                  <Grid container spacing={2}>
                    {infoCards.map((card, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Paper
                            sx={{
                              p: 2,
                              background: 'rgba(255, 255, 255, 0.1)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: 'white',
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {card.icon}
                              <Box>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                  {card.label}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {card.value}
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Stack>
            </motion.div>
          </Grid>
          
          {/* Custom Content Area */}
          {children && (
            <Grid item xs={12} lg={5}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {children}
              </motion.div>
            </Grid>
          )}
        </Grid>
      </HeroContent>
    </HeroWrapper>
  );
};

export default DetailPageHero;