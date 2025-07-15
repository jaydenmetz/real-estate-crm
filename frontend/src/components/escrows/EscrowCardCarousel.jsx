import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  Button,
  Fade,
  Zoom,
  Backdrop,
  Portal,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Close,
  Schedule,
  AttachMoney,
  Home,
  People,
  Visibility,
  Share,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { safeFormatDate } from '../../utils/safeDateUtils';

const EscrowCardCarousel = ({ escrows, onCardClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const [cardRect, setCardRect] = useState(null);
  const [isFavorite, setIsFavorite] = useState({});
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? escrows.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === escrows.length - 1 ? 0 : prev + 1));
  };

  const handleViewDetails = (escrow, event) => {
    event.stopPropagation();
    
    // Get card position for animation
    const card = event.currentTarget.closest('.escrow-card');
    if (card) {
      const rect = card.getBoundingClientRect();
      setCardRect(rect);
      setExpandedCard(escrow);
      
      // Navigate after animation starts
      setTimeout(() => {
        navigate(`/escrows/${escrow.id}`);
      }, 300);
    }
  };

  const toggleFavorite = (escrowId, event) => {
    event.stopPropagation();
    setIsFavorite(prev => ({
      ...prev,
      [escrowId]: !prev[escrowId]
    }));
  };

  const currentEscrow = escrows[currentIndex];
  
  if (!currentEscrow) return null;

  const calculateDaysToClose = (closingDate) => {
    if (!closingDate) return null;
    const today = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysToClose = calculateDaysToClose(currentEscrow.closingDate);

  return (
    <>
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Main Carousel Container */}
        <Card 
          className="escrow-card"
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* Image Section with Overlay Info */}
          <Box sx={{ position: 'relative', height: '60%' }}>
            <CardMedia
              component="img"
              height="100%"
              image={currentEscrow.propertyImage || 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800'}
              alt={currentEscrow.propertyAddress}
              sx={{ objectFit: 'cover' }}
            />
            
            {/* Gradient Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              }}
            />
            
            {/* Top Controls */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Chip
                label={currentEscrow.escrowStatus}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  fontWeight: 'bold',
                  color: currentEscrow.escrowStatus === 'Active' ? 'success.main' : 'warning.main',
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={(e) => toggleFavorite(currentEscrow.id, e)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                >
                  {isFavorite[currentEscrow.id] ? 
                    <Favorite sx={{ color: 'error.main' }} /> : 
                    <FavoriteBorder />
                  }
                </IconButton>
                <IconButton 
                  sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                >
                  <Share />
                </IconButton>
              </Box>
            </Box>
            
            {/* Property Info Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                color: 'white',
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentEscrow.propertyAddress}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<Home sx={{ color: 'white !important' }} />}
                  label={currentEscrow.propertyType}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                <Typography variant="body2">
                  {currentEscrow.escrowNumber}
                </Typography>
              </Box>
            </Box>
            
            {/* Navigation Arrows */}
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'white' },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'white' },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
          
          {/* Content Section */}
          <CardContent sx={{ flexGrow: 1, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Key Metrics */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <AttachMoney sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Purchase Price
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    ${currentEscrow.purchasePrice?.toLocaleString() || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Schedule sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Days to Close
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    color={daysToClose && daysToClose <= 7 ? 'error.main' : 'success.main'}
                  >
                    {daysToClose !== null ? 
                      (daysToClose > 0 ? `${daysToClose} days` : 'Closed') : 
                      'N/A'
                    }
                  </Typography>
                </Box>
              </Box>
              
              {/* Parties */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  PARTIES
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    icon={<People />}
                    label={currentEscrow.buyers?.[0]?.name || 'Buyer'}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Home />}
                    label={currentEscrow.sellers?.[0]?.name || 'Seller'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              {/* Closing Date */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  CLOSING DATE
                </Typography>
                <Typography variant="body1">
                  {safeFormatDate(currentEscrow.closingDate, 'MMMM d, yyyy')}
                </Typography>
              </Box>
              
              {/* Action Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Visibility />}
                onClick={(e) => handleViewDetails(currentEscrow, e)}
                sx={{
                  mt: 'auto',
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  }
                }}
              >
                VIEW DETAILS
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {/* Carousel Indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {escrows.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Expansion Animation Overlay */}
      <Portal>
        <Backdrop
          open={Boolean(expandedCard)}
          sx={{
            zIndex: 9999,
            bgcolor: 'rgba(0,0,0,0.9)',
          }}
        >
          {expandedCard && cardRect && (
            <Box
              sx={{
                position: 'fixed',
                top: cardRect.top,
                left: cardRect.left,
                width: cardRect.width,
                height: cardRect.height,
                bgcolor: 'white',
                borderRadius: 2,
                animation: 'expandCard 0.3s ease-out forwards',
                '@keyframes expandCard': {
                  '0%': {
                    top: cardRect.top,
                    left: cardRect.left,
                    width: cardRect.width,
                    height: cardRect.height,
                  },
                  '100%': {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw',
                    height: '90vh',
                  },
                },
              }}
            />
          )}
        </Backdrop>
      </Portal>
    </>
  );
};

export default EscrowCardCarousel;