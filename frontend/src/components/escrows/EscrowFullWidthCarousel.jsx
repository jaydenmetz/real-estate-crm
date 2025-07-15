import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Button,
  Container,
  Grid,
  Paper,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Schedule,
  AttachMoney,
  Home,
  People,
  OpenInNew,
  Share,
  Favorite,
  FavoriteBorder,
  LocationOn,
  Gavel,
  AssignmentTurnedIn,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { differenceInDays } from 'date-fns';

const EscrowFullWidthCarousel = ({ escrows }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState({});
  const navigate = useNavigate();
  const touchStartX = useRef(null);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? escrows.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === escrows.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    
    touchStartX.current = null;
  };

  const toggleFavorite = (escrowId) => {
    setIsFavorite(prev => ({
      ...prev,
      [escrowId]: !prev[escrowId]
    }));
  };

  const handleViewDetails = (escrowId) => {
    navigate(`/escrows/${escrowId}`);
  };

  const currentEscrow = escrows[currentIndex];
  
  if (!currentEscrow) return null;

  const daysToClose = currentEscrow.closingDate ? 
    differenceInDays(new Date(currentEscrow.closingDate), new Date()) : null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'closing': return 'info';
      case 'closed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getUrgencyColor = () => {
    if (!daysToClose) return 'default';
    if (daysToClose <= 7) return 'error';
    if (daysToClose <= 14) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Card 
        sx={{ 
          width: '100%',
          height: 'auto',
          overflow: 'hidden',
          position: 'relative',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Hero Section with Image */}
        <Box sx={{ position: 'relative', height: 400 }}>
          <Box
            component="img"
            src={currentEscrow.propertyImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600'}
            alt={currentEscrow.propertyAddress}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          
          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            }}
          />
          
          {/* Navigation Arrows */}
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
            size="large"
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
            size="large"
          >
            <ChevronRight fontSize="large" />
          </IconButton>
          
          {/* Status Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              left: 24,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Chip
              label={currentEscrow.escrowStatus}
              color={getStatusColor(currentEscrow.escrowStatus)}
              sx={{
                fontWeight: 'bold',
                fontSize: '0.875rem',
                bgcolor: 'rgba(255,255,255,0.95)',
              }}
            />
            {daysToClose && daysToClose <= 7 && (
              <Chip
                icon={<Warning />}
                label="Closing Soon"
                color="error"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  bgcolor: 'rgba(255,255,255,0.95)',
                }}
              />
            )}
          </Box>
          
          {/* Action Buttons */}
          <Box
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              display: 'flex',
              gap: 1,
            }}
          >
            <IconButton 
              onClick={() => toggleFavorite(currentEscrow.id)}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              {isFavorite[currentEscrow.id] ? 
                <Favorite /> : 
                <FavoriteBorder />
              }
            </IconButton>
            <IconButton 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Share />
            </IconButton>
          </Box>
          
          {/* Property Info Overlay */}
          <Container maxWidth="xl">
            <Box
              sx={{
                position: 'absolute',
                bottom: 32,
                left: 0,
                right: 0,
                px: 3,
                color: 'white',
              }}
            >
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {currentEscrow.propertyAddress}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn />
                  <Typography variant="h6">
                    {currentEscrow.propertyType} • {currentEscrow.escrowNumber}
                  </Typography>
                </Box>
                <Chip
                  label={`${currentEscrow.bedrooms || 3} beds • ${currentEscrow.bathrooms || 2} baths • ${currentEscrow.squareFootage || '2,000'} sq ft`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </Box>
            </Box>
          </Container>
        </Box>
        
        {/* Content Section */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {/* Key Metrics */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {/* Purchase Price */}
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      ${currentEscrow.purchasePrice?.toLocaleString() || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purchase Price
                    </Typography>
                  </Paper>
                </Grid>
                
                {/* Days to Close */}
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Schedule sx={{ fontSize: 32, color: getUrgencyColor() + '.main', mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold" color={getUrgencyColor() + '.main'}>
                      {daysToClose !== null ? 
                        (daysToClose > 0 ? `${daysToClose}` : 'Closed') : 
                        'N/A'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days to Close
                    </Typography>
                  </Paper>
                </Grid>
                
                {/* Commission */}
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ${((currentEscrow.grossCommission || 0) * 0.5).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your Commission
                    </Typography>
                  </Paper>
                </Grid>
                
                {/* Progress */}
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <AssignmentTurnedIn sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {currentEscrow.checklistProgress || 65}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Parties Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Transaction Parties
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <People sx={{ color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          BUYERS
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium">
                        {currentEscrow.buyers?.[0]?.name || 'Buyer Information'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Home sx={{ color: 'secondary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          SELLERS
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight="medium">
                        {currentEscrow.sellers?.[0]?.name || 'Seller Information'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Timeline Progress */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Escrow Timeline
                </Typography>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      {currentEscrow.currentStage || 'Contract'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentEscrow.checklistProgress || 65}% Complete
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={currentEscrow.checklistProgress || 65} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Opened: {safeFormatDate(currentEscrow.escrowOpenDate, 'MMM d')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Closing: {safeFormatDate(currentEscrow.closingDate, 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
            
            {/* Side Actions */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<OpenInNew />}
                  onClick={() => handleViewDetails(currentEscrow.id)}
                  sx={{
                    py: 2,
                    mb: 2,
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}
                >
                  VIEW FULL DETAILS
                </Button>
                
                {/* Quick Actions */}
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button fullWidth variant="outlined" size="small">
                      Upload Document
                    </Button>
                    <Button fullWidth variant="outlined" size="small">
                      Send Update
                    </Button>
                    <Button fullWidth variant="outlined" size="small">
                      Schedule Task
                    </Button>
                  </Box>
                </Paper>
                
                {/* Next Deadline */}
                {daysToClose && daysToClose > 0 && (
                  <Paper sx={{ p: 2, bgcolor: getUrgencyColor() + '.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Gavel sx={{ color: getUrgencyColor() + '.main' }} />
                      <Typography variant="subtitle2">
                        Next Deadline
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      Loan Approval Due
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {daysToClose > 7 ? 'In 3 days' : 'Tomorrow'}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Card>
      
      {/* Carousel Indicators */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mt: 3,
        }}
      >
        {escrows.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: index === currentIndex ? 32 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
              transition: 'all 0.3s',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: index === currentIndex ? 'primary.dark' : 'grey.400',
              },
            }}
          />
        ))}
      </Box>
      
      {/* Counter */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {currentIndex + 1} of {escrows.length} Active Escrows
        </Typography>
      </Box>
    </Box>
  );
};

export default EscrowFullWidthCarousel;