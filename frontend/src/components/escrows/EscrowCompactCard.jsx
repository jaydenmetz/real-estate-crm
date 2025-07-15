import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Button,
  Grid,
  LinearProgress,
  Grow,
  Fade,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Schedule,
  AttachMoney,
  Home,
  People,
  OpenInNew,
  LocationOn,
  Gavel,
  CheckCircle,
  Warning,
  TrendingUp,
  Assignment,
  BathtubOutlined,
  BedOutlined,
  SquareFootOutlined,
  Landscape,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { differenceInDays } from 'date-fns';

const EscrowCompactCard = ({ escrow, index }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const images = escrow.propertyImages || [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
  ];

  const daysToClose = escrow.closingDate ? 
    differenceInDays(new Date(escrow.closingDate), new Date()) : null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'closing': return 'info';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getUrgencyColor = () => {
    if (!daysToClose) return 'text.secondary';
    if (daysToClose <= 7) return 'error.main';
    if (daysToClose <= 14) return 'warning.main';
    return 'success.main';
  };

  const handlePreviousImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleViewDetails = () => {
    setIsExpanding(true);
    const rect = cardRef.current?.getBoundingClientRect();
    
    // Create expanding overlay effect
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.backgroundColor = 'white';
    overlay.style.borderRadius = '12px';
    overlay.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    document.body.appendChild(overlay);

    // Animate to full screen
    setTimeout(() => {
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.borderRadius = '0';
    }, 10);

    // Navigate after animation
    setTimeout(() => {
      navigate(`/escrows/${escrow.id}`);
      document.body.removeChild(overlay);
      setIsExpanding(false);
    }, 600);
  };

  const commission = escrow.grossCommission || (escrow.purchasePrice * 0.025);
  const myCommission = commission * 0.5;

  return (
    <Grow in={true} timeout={300 + index * 100}>
      <Card 
        ref={cardRef}
        sx={{ 
          mb: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 6,
          },
          opacity: isExpanding ? 0.9 : 1,
        }}
      >
        <Grid container>
          {/* Left Content Section */}
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 3 }}>
              {/* Header with Address and Status */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {escrow.propertyAddress}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {escrow.propertyType} • {escrow.escrowNumber}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={escrow.escrowStatus}
                    color={getStatusColor(escrow.escrowStatus)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  {daysToClose && daysToClose <= 7 && (
                    <Chip
                      icon={<Warning />}
                      label="Closing Soon"
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              {/* Key Metrics Grid */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Purchase Price
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${escrow.purchasePrice?.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Days to Close
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color={getUrgencyColor()}>
                      {daysToClose !== null ? 
                        (daysToClose > 0 ? daysToClose : 'Closed') : 
                        'N/A'
                      }
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Your Commission
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ${myCommission?.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {escrow.checklistProgress || 65}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Parties and Stage */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    icon={<People />}
                    label={escrow.buyers?.[0]?.name || 'Buyer'}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Home />}
                    label={escrow.sellers?.[0]?.name || 'Seller'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'info.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {escrow.currentStage || 'Contract'}
                  </Typography>
                </Box>
              </Box>

              {/* Timeline Progress Bar */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Timeline Progress
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Closing: {safeFormatDate(escrow.closingDate, 'MMM d, yyyy')}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={escrow.checklistProgress || 65} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              {/* Action Button */}
              <Button
                variant="contained"
                onClick={handleViewDetails}
                startIcon={<OpenInNew />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  }
                }}
              >
                View Details
              </Button>
            </Box>
          </Grid>

          {/* Right Image Carousel Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative', height: '100%', minHeight: 250 }}>
              {/* Image Container */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`Property ${currentImageIndex + 1}`}
                  style={{
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
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  }}
                />
                
                {/* Property Features Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    color: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BedOutlined sx={{ fontSize: 18 }} />
                      <Typography variant="body2">
                        {escrow.bedrooms || 3} beds
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BathtubOutlined sx={{ fontSize: 18 }} />
                      <Typography variant="body2">
                        {escrow.bathrooms || 2} baths
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SquareFootOutlined sx={{ fontSize: 18 }} />
                      <Typography variant="body2">
                        {escrow.squareFootage || '2,000'} sq ft
                      </Typography>
                    </Box>
                    {escrow.lotSize > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Landscape sx={{ fontSize: 18 }} />
                        <Typography variant="body2">
                          {escrow.lotSize >= 43560 
                            ? `${(escrow.lotSize / 43560).toFixed(1)} acres`
                            : `${escrow.lotSize.toLocaleString()} sq ft`
                          }
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePreviousImage}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      }}
                      size="small"
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      }}
                      size="small"
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
                
                {/* Image Indicators */}
                {images.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 0.5,
                    }}
                  >
                    {images.map((_, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Grow>
  );
};

export default EscrowCompactCard;