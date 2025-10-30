import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

/**
 * PriceHistoryWidget - Displays listing price history and trends
 *
 * Props:
 * - entity: The full listing object
 * - data: Backend widget data (when Detail API implemented)
 * - computed: Computed fields from backend
 * - onClick: Function to open modal/expanded view
 */
const PriceHistoryWidget = ({ entity, data, computed, loading, onClick }) => {
  const listing = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const listingPrice = listing?.listing_price || 0;
  const originalPrice = listing?.original_price || listingPrice;
  const priceChange = listingPrice - originalPrice;
  const priceChangePercent = originalPrice ? ((priceChange / originalPrice) * 100).toFixed(1) : 0;

  return (
    <Paper
      sx={{
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {},
        transition: 'box-shadow 0.2s'
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TrendingUp sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Price History
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Current Price
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            ${listingPrice.toLocaleString()}
          </Typography>
        </Box>

        {originalPrice !== listingPrice && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Original Price
            </Typography>
            <Typography variant="h6">
              ${originalPrice.toLocaleString()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: priceChange >= 0 ? 'success.main' : 'error.main',
                mt: 0.5
              }}
            >
              {priceChange >= 0 ? '+' : ''}{priceChangePercent}% ({priceChange >= 0 ? '+' : ''}${Math.abs(priceChange).toLocaleString()})
            </Typography>
          </Box>
        )}
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for detailed price history
        </Typography>
      )}
    </Paper>
  );
};

export default PriceHistoryWidget;
