import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Skeleton,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { OpenInNew, Home, AttachMoney } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const PreviewCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .preview-overlay': {
      opacity: 1,
    },
    '& .preview-image': {
      transform: 'scale(1.05)',
    },
  },
}));

const PreviewOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2,
}));

const ZillowBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  backgroundColor: '#006AFF',
  color: 'white',
  padding: '4px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  zIndex: 3,
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
}));

const ZillowPreview = ({ url, height = 500, escrowData }) => {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // For demo purposes, we'll simulate the OG data that would come from Zillow
    // In production, you'd fetch this from your backend which would scrape the OG tags
    const fetchOpenGraphData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For the demo Zillow URL, return mock OG data
        // In production, your backend would fetch and parse the actual OG tags
        if (url.includes('19056207_zpid')) {
          // Use the actual Zillow image URL with proper size
          setPreviewData({
            title: '789 Pacific Coast Highway, Malibu, CA 90265',
            description: 'Luxury beachfront property in Malibu',
            // Use the escrow property image or a placeholder
            image: escrowData?.propertyImage || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
            price: '$3,500,000',
            details: {
              beds: escrowData?.property?.bedrooms || 5,
              baths: escrowData?.property?.bathrooms || 4,
              sqft: escrowData?.property?.sqft || '4,200',
              type: escrowData?.property?.type || 'Single Family Residence',
              yearBuilt: escrowData?.property?.yearBuilt || 2018,
              lot: '0.25 acres',
            },
            url: url,
            siteName: 'Zillow',
          });
        } else {
          // Fallback for other properties
          setPreviewData({
            title: escrowData?.propertyAddress || 'Property Preview',
            description: 'View property details on Zillow',
            image: escrowData?.propertyImage || null,
            price: escrowData?.purchasePrice ? `$${escrowData.purchasePrice.toLocaleString()}` : null,
            url: url,
            siteName: 'Zillow',
          });
        }
      } catch (err) {
        setError('Failed to load preview');
        console.error('Error fetching OG data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchOpenGraphData();
    }
  }, [url, escrowData]);

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <Card sx={{ height, position: 'relative' }}>
        <Skeleton variant="rectangular" height="60%" />
        <CardContent>
          <Skeleton variant="text" width="80%" height={32} />
          <Skeleton variant="text" width="60%" height={24} />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error || !previewData) {
    return (
      <Card 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: 'grey.100',
        }}
        onClick={handleClick}
      >
        <Stack alignItems="center" spacing={2}>
          <Home sx={{ fontSize: 48, color: 'grey.400' }} />
          <Typography color="text.secondary">
            {error || 'Click to view on Zillow'}
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <PreviewCard sx={{ height }} onClick={handleClick}>
      {/* Hover Overlay */}
      <PreviewOverlay className="preview-overlay">
        <Stack alignItems="center" spacing={2}>
          <OpenInNew sx={{ fontSize: 48, color: 'white' }} />
          <Typography variant="h6" color="white" fontWeight={600}>
            View on Zillow
          </Typography>
        </Stack>
      </PreviewOverlay>

      {/* Zillow Badge */}
      <ZillowBadge>
        <Home sx={{ fontSize: 16 }} />
        Zillow
      </ZillowBadge>

      {/* Property Image */}
      {previewData.image && (
        <CardMedia
          component="img"
          image={previewData.image}
          alt={previewData.title}
          className="preview-image"
          sx={{
            height: '60%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            console.error('Image failed to load:', previewData.image);
            e.target.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop';
          }}
        />
      )}

      {/* Property Details */}
      <CardContent sx={{ height: '40%', p: 3 }}>
        <Stack spacing={2}>
          {/* Price and Address */}
          <Box>
            {previewData.price && (
              <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                {previewData.price}
              </Typography>
            )}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {previewData.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {previewData.description}
            </Typography>
          </Box>

          {/* Property Features */}
          {previewData.details && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {previewData.details.beds && (
                <Chip 
                  size="small" 
                  label={`${previewData.details.beds} beds`}
                  variant="outlined"
                />
              )}
              {previewData.details.baths && (
                <Chip 
                  size="small" 
                  label={`${previewData.details.baths} baths`}
                  variant="outlined"
                />
              )}
              {previewData.details.sqft && (
                <Chip 
                  size="small" 
                  label={`${previewData.details.sqft} sqft`}
                  variant="outlined"
                />
              )}
              {previewData.details.type && (
                <Chip 
                  size="small" 
                  label={previewData.details.type}
                  variant="outlined"
                  color="primary"
                />
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </PreviewCard>
  );
};

export default ZillowPreview;