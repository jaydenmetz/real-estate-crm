import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from '@mui/material';
import { Home, Straighten, CalendarToday } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const WidgetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  }
}));

const PropertyWidget = ({ viewMode = 'medium', data = {} }) => {
  const bedrooms = data?.bedrooms || data?.bedroom_count || 0;
  const bathrooms = data?.bathrooms || data?.bathroom_count || 0;
  const squareFeet = data?.square_feet || data?.squareFeet || 0;
  const yearBuilt = data?.year_built || data?.yearBuilt;
  const propertyType = data?.property_type || data?.propertyType || 'Unknown';
  const lotSize = data?.lot_size || data?.lotSize;
  const features = data?.features || [];

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <WidgetCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Home sx={{ color: '#764ba2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Property Details
          </Typography>
        </Box>

        {viewMode === 'small' && (
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
              {bedrooms} bed | {bathrooms} bath
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {formatNumber(squareFeet)} sqft
            </Typography>
          </Box>
        )}

        {viewMode === 'medium' && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Bedrooms
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {bedrooms}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Bathrooms
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {bathrooms}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Square Feet
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatNumber(squareFeet)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Property Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {propertyType}
                </Typography>
              </Grid>
            </Grid>

            {features.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Features
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {features.slice(0, 4).map((feature, idx) => (
                    <Chip
                      key={idx}
                      label={feature}
                      size="small"
                      sx={{ bgcolor: '#f5f5f5' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {viewMode === 'large' && (
          <Box>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Bedrooms</TableCell>
                  <TableCell>{bedrooms}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Bathrooms</TableCell>
                  <TableCell>{bathrooms}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Square Feet</TableCell>
                  <TableCell>{formatNumber(squareFeet)} sqft</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Property Type</TableCell>
                  <TableCell>{propertyType}</TableCell>
                </TableRow>
                {yearBuilt && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Year Built</TableCell>
                    <TableCell>{yearBuilt}</TableCell>
                  </TableRow>
                )}
                {lotSize && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Lot Size</TableCell>
                    <TableCell>{lotSize}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {features.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Features & Amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {features.map((feature, idx) => (
                    <Chip
                      key={idx}
                      label={feature}
                      size="small"
                      sx={{ bgcolor: '#f5f5f5' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </WidgetCard>
  );
};

export default PropertyWidget;
