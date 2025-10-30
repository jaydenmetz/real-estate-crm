import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MapPin, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

// Blue gradient hero similar to escrows (dynamic height based on content)
const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

const ImageBox = styled(Box)(({ theme }) => ({
  width: 192,
  height: 192,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  flexShrink: 0,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '4px solid rgba(255, 255, 255, 0.2)',
  [theme.breakpoints.down('md')]: {
    width: 120,
    height: 120,
  },
}));

const EntityImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ImagePlaceholder = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '3rem',
}));

const StatCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

/**
 * DetailHero Component
 *
 * Hero card matching escrows design
 * Features: Image, title, status chips, stat cards
 */
export const DetailHero = ({ entity, config }) => {
  const [imageError, setImageError] = useState(false);

  if (!entity) return null;

  const heroConfig = config.detail?.hero || {};

  // Get field values from entity
  const getValue = (field, defaultValue = '') => {
    if (typeof field === 'function') {
      return field(entity);
    }
    return entity[field] || defaultValue;
  };

  // Format value based on format type
  const formatValue = (value, format) => {
    if (!value && value !== 0) return 'N/A';

    switch (format) {
      case 'currency':
        const num = typeof value === 'number' ? value : parseFloat(value) || 0;
        return `$${(num / 1000).toFixed(1)}K`;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        try {
          return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
          return value;
        }
      case 'percent':
        return `${value}%`;
      default:
        return value;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusMap = heroConfig.statusColors || {
      active: '#4caf50',
      pending: '#ff9800',
      closed: '#2196f3',
      cancelled: '#f44336',
    };
    return statusMap[status?.toLowerCase()] || '#9e9e9e';
  };

  const titleField = heroConfig.titleField || 'name';
  // Handle both 'name' field and separate 'first_name'/'last_name' fields
  let title = getValue(titleField);
  if (!title && entity.first_name && entity.last_name) {
    title = `${entity.first_name} ${entity.last_name}`;
  } else if (!title && entity.first_name) {
    title = entity.first_name;
  } else if (!title && entity.last_name) {
    title = entity.last_name;
  }
  const imageField = heroConfig.imageField || 'image_url';
  const imageUrl = getValue(imageField);
  const status = getValue(heroConfig.statusField || 'status');
  const statusColor = getStatusColor(status);
  const stats = heroConfig.stats || [];

  return (
    <HeroContainer
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main Content Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {/* Image */}
        {heroConfig.showImage !== false && (
          <ImageBox>
            {imageUrl && !imageError ? (
              <EntityImage
                src={imageUrl}
                alt={title}
                onError={() => setImageError(true)}
              />
            ) : (
              <ImagePlaceholder>
                {heroConfig.placeholderIcon || '🏠'}
              </ImagePlaceholder>
            )}
          </ImageBox>
        )}

        {/* Title and Metadata */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Status and ID Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {status && (
              <Chip
                label={status}
                sx={{
                  backgroundColor: statusColor,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 28,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              />
            )}

            {heroConfig.displayIdField && (
              <Chip
                label={getValue(heroConfig.displayIdField)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 28,
                }}
              />
            )}
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>

          {/* Subtitle Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {heroConfig.subtitleFields?.map((field, index) => {
              const value = getValue(field.field || field);
              const Icon = field.icon === 'MapPin' ? MapPin : field.icon === 'Calendar' ? Calendar : User;

              return value ? (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Icon size={16} style={{ opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {value}
                  </Typography>
                </Box>
              ) : null;
            })}
          </Box>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          },
          gap: 2,
        }}
      >
        {stats.map((stat, index) => {
          const value = getValue(stat.field, stat.defaultValue);
          const formattedValue = formatValue(value, stat.format);

          return (
            <StatCard key={index}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: 0.8,
                  fontWeight: 600,
                }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  color: stat.color || 'white',
                  lineHeight: 1,
                }}
              >
                {formattedValue}
              </Typography>
            </StatCard>
          );
        })}
      </Box>
    </HeroContainer>
  );
};
