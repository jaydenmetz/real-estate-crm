import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Bed,
  Bathtub,
  SquareFoot,
  CalendarToday,
  Landscape,
  Home,
  AttachMoney,
  TrendingUp,
  LocationOn,
  Pool,
  DirectionsCar,
  Stairs,
  OpenInNew,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const StunningPropertyDisplay = ({ escrow }) => {
  const theme = useTheme();

  const property = escrow.propertyDetails || {};
  const financials = escrow.financials || {};

  // Property highlights - no duplicates with widgets below
  const highlights = [
    {
      icon: <Bed />,
      label: 'Bedrooms',
      value: property.bedrooms || '-',
      color: theme.palette.primary.main,
    },
    {
      icon: <Bathtub />,
      label: 'Bathrooms',
      value: property.bathrooms || '-',
      color: theme.palette.info.main,
    },
    {
      icon: <SquareFoot />,
      label: 'Living Space',
      value: property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : '-',
      color: theme.palette.success.main,
    },
    {
      icon: <Landscape />,
      label: 'Lot Size',
      value: property.lotSizeSqft ? `${property.lotSizeSqft.toLocaleString()} sqft` : '-',
      color: theme.palette.warning.main,
    },
    {
      icon: <CalendarToday />,
      label: 'Year Built',
      value: property.yearBuilt || '-',
      color: theme.palette.secondary.main,
    },
    {
      icon: <AttachMoney />,
      label: 'Price/sqft',
      value: property.pricePerSqft ? `$${property.pricePerSqft}` : '-',
      color: theme.palette.error.main,
    },
  ];


  return (
    <Card
      elevation={12}
      sx={{
        mb: 4,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.1),
      }}
    >
      <Grid container>
        {/* Left side - Image */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              position: 'relative',
              height: { xs: 400, md: 500 },
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            <motion.img
              src={escrow.propertyImage || escrow.property_image_url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200'}
              alt={escrow.propertyAddress || escrow.property_address}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Property type badge */}
            <Chip
              icon={<Home sx={{ color: 'white !important' }} />}
              label={property.propertyType || 'Single Family'}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: alpha(theme.palette.primary.main, 0.9),
                color: 'white',
                fontWeight: 600,
              }}
            />

            {/* Status badge */}
            <Chip
              label={escrow.escrowStatus}
              sx={{
                position: 'absolute',
                top: 60,
                left: 16,
                backgroundColor: alpha(
                  escrow.escrowStatus === 'Active' ? theme.palette.success.main :
                  escrow.escrowStatus === 'Pending' ? theme.palette.warning.main :
                  theme.palette.grey[600],
                  0.9
                ),
                color: 'white',
                fontWeight: 600,
              }}
            />

            {/* Zillow link button */}
            {(escrow.zillowUrl || escrow.zillow_url) && (
              <Tooltip title="Open in Zillow" placement="left">
                <Box
                  component="a"
                  href={escrow.zillowUrl || escrow.zillow_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    backgroundColor: alpha('#006AFF', 0.95),
                    color: 'white',
                    borderRadius: 2,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 106, 255, 0.3)',
                    border: '2px solid white',
                    '&:hover': {
                      backgroundColor: '#0050CC',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 106, 255, 0.4)',
                    },
                  }}
                >
                  <Box
                    component="svg"
                    sx={{ width: 20, height: 20 }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M10 2v2H8v2h2v2H8v2h2v2H8v2h2v2H8v2h2v2H8v2h2v-2h2v2h2v-2h2v2h2v-2h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2V6h-2V4h-2v2h-2V4h-2v2h-2V4h-2v2h-2V2h-2zm4 6v2h-2V8h2zm0 4v2h-2v-2h2zm0 4v2h-2v-2h2z"/>
                  </Box>
                  View on Zillow
                  <OpenInNew sx={{ fontSize: 16 }} />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Grid>

        {/* Right side - Property info */}
        <Grid item xs={12} md={5}>
          <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Address and price */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" fontWeight="700" gutterBottom>
                {escrow.propertyAddress}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn color="action" />
                <Typography variant="body1" color="text.secondary">
                  {property.city}, {property.state} {property.zipCode}
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="800" color="primary" sx={{ mt: 2 }}>
                ${escrow.purchasePrice?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {property.county} County • APN: {property.apn || 'N/A'}
              </Typography>
            </Box>

            {/* Property highlights grid */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {highlights.map((highlight, index) => (
                <Grid item xs={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(highlight.color, 0.08),
                        border: '1px solid',
                        borderColor: alpha(highlight.color, 0.2),
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {React.cloneElement(highlight.icon, { 
                          sx: { color: highlight.color, fontSize: 20 } 
                        })}
                        <Typography variant="caption" color="text.secondary">
                          {highlight.label}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="600">
                        {highlight.value}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Special features */}
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.pool && (
                  <Chip
                    icon={<Pool />}
                    label="Pool"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
                {property.spa && (
                  <Chip
                    icon={<Pool />}
                    label="Spa"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
                {property.garageSpaces && (
                  <Chip
                    icon={<DirectionsCar />}
                    label={`${property.garageSpaces} Car Garage`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                )}
                {property.stories && (
                  <Chip
                    icon={<Stairs />}
                    label={`${property.stories} Stories`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                )}
                {property.gatedCommunity && (
                  <Chip
                    label="Gated Community"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default StunningPropertyDisplay;