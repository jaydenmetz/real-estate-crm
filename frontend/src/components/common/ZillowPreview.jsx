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
    const fetchOpenGraphData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch actual Open Graph data from our backend
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/link-preview`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url }),
        });

        const result = await response.json();

        if (result.success) {
          const data = result.data;
          
          // Process the preview data
          const preview = {
            title: data.title || escrowData?.propertyAddress || 'Property Preview',
            description: data.description || 'View property details on Zillow',
            // If Zillow blocked us or no image, always use escrow image
            image: (data.isBlocked || !data.image) ? 
              (escrowData?.propertyImage || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop') : 
              data.image,
            url: url,
            siteName: data.siteName || 'Zillow',
          };

          // If Zillow was blocked, use escrow data for preview
          if (data.isBlocked) {
            preview.title = escrowData?.propertyAddress || 'View Property on Zillow';
            preview.price = escrowData?.purchasePrice ? `$${escrowData.purchasePrice.toLocaleString()}` : null;
            preview.details = escrowData?.property ? {
              beds: escrowData.property.bedrooms,
              baths: escrowData.property.bathrooms,
              sqft: escrowData.property.sqft,
              type: escrowData.property.type,
              yearBuilt: escrowData.property.yearBuilt,
            } : null;
          } else if (data.propertyData) {
            // If we have property-specific data from Zillow, use it
            preview.price = data.propertyData.price ? `$${parseInt(data.propertyData.price).toLocaleString()}` : null;
            preview.details = {
              beds: data.propertyData.beds,
              baths: data.propertyData.baths,
              sqft: data.propertyData.sqft,
              type: data.propertyData.propertyType,
              yearBuilt: data.propertyData.yearBuilt,
            };
          } else {
            // Fallback to escrow data
            preview.price = escrowData?.purchasePrice ? `$${escrowData.purchasePrice.toLocaleString()}` : null;
            preview.details = escrowData?.property ? {
              beds: escrowData.property.bedrooms,
              baths: escrowData.property.bathrooms,
              sqft: escrowData.property.sqft,
              type: escrowData.property.type,
              yearBuilt: escrowData.property.yearBuilt,
            } : null;
          }

          setPreviewData(preview);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch preview');
        }
      } catch (err) {
        setError('Failed to load preview');
        console.error('Error fetching OG data:', err);
        
        // Fallback to basic preview
        setPreviewData({
          title: escrowData?.propertyAddress || 'Property Preview',
          description: 'View property details on Zillow',
          image: escrowData?.propertyImage || null,
          price: escrowData?.purchasePrice ? `$${escrowData.purchasePrice.toLocaleString()}` : null,
          url: url,
          siteName: 'Zillow',
        });
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