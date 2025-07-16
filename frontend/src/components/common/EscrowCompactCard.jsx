import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CalendarToday,
  AttachMoney,
  Person,
  Home,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';

const EscrowCompactCard = ({ escrow, index, showCommission }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status) => {
    const statusColors = {
      'Active': 'success',
      'Pending': 'warning',
      'Closed': 'default',
      'Cancelled': 'error',
    };
    return statusColors[status] || 'default';
  };
  
  const daysUntilClosing = differenceInDays(new Date(escrow.closingDate), new Date());
  const progress = Math.max(0, Math.min(100, ((30 - daysUntilClosing) / 30) * 100));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        sx={{ 
          mb: 2,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() => navigate(`/escrows/${escrow.id}`)}
      >
        <CardContent>
          <Stack spacing={2}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {escrow.propertyAddress}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={escrow.status} 
                    color={getStatusColor(escrow.status)} 
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {escrow.escrowNumber}
                  </Typography>
                </Stack>
              </Box>
              <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                <MoreVert />
              </IconButton>
            </Box>
            
            {/* Info Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Purchase Price</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    ${escrow.purchasePrice?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Closing Date</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {format(new Date(escrow.closingDate), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Box>
              
              {showCommission && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney fontSize="small" color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Commission</Typography>
                    <Typography variant="body2" fontWeight="medium" color="primary.main">
                      ${escrow.commission?.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Progress */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Progress to closing
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {daysUntilClosing} days remaining
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ height: 6, borderRadius: 1 }}
                color={daysUntilClosing < 7 ? 'warning' : 'primary'}
              />
            </Box>
            
            {/* Parties */}
            <Stack direction="row" spacing={2} sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Buyer: {escrow.buyers?.join(', ')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Home fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Seller: {escrow.sellers?.join(', ')}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EscrowCompactCard;