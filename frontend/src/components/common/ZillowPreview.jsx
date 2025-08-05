import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Skeleton,
  Stack,
} from '@mui/material';
import { OpenInNew, Home } from '@mui/icons-material';
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
        console.error('Error fetching OG data:', err);
        
        // Always use fallback data instead of showing error
        setPreviewData({
          title: escrowData?.propertyAddress || 'Property Preview',
          description: 'View property details on Zillow',
          image: escrowData?.propertyImage || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
          url: url,
          siteName: 'Zillow',
        });
        setError(null); // Don't show error state
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
        <Skeleton variant="rectangular" height="100%" />
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

      {/* Property Image - Full height */}
      {previewData.image && (
        <CardMedia
          component="img"
          image={previewData.image}
          alt={previewData.title}
          className="preview-image"
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            console.error('Image failed to load:', previewData.image);
            e.target.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop';
          }}
        />
      )}
    </PreviewCard>
  );
};

export default ZillowPreview;