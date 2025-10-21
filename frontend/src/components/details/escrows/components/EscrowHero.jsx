import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatCurrency, formatDate, parseCurrency } from '../../../../utils/formatters';
import { getStatusConfig } from '../../../../constants/escrowConfig';
import EditableField from './EditableField';

// Ultra-compact Hero (100px height) for maximum information density
const HeroContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  height: 100,
  position: 'relative',
}));

const PropertyImageBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 120,
  height: 80,
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  flexShrink: 0,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.grey[200],
}));

const PropertyImage = styled('img')({
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
  background: theme.palette.grey[300],
  color: theme.palette.grey[600],
  fontSize: '2rem',
}));

const InfoSection = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minWidth: 0,
});

const AddressSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
});

const MetricsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
}));

const MetricBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
});

const EscrowHero = ({ escrow, onUpdate }) => {
  const [imageError, setImageError] = useState(false);

  if (!escrow) {
    return null;
  }

  // Extract data from escrow object
  const propertyAddress = escrow?.property_address || escrow?.details?.propertyAddress || 'Property Address';
  const city = escrow?.city || '';
  const state = escrow?.state || '';
  const escrowNumber = escrow?.display_id || escrow?.details?.escrowNumber || 'ESC-2025-0001';
  const purchasePrice = escrow?.purchase_price || escrow?.financials?.purchasePrice || 0;
  const commission = escrow?.my_commission || escrow?.financials?.agentNet || 0;
  const closingDate = escrow?.closing_date || escrow?.timeline?.coeDate || escrow?.details?.scheduledCoeDate;
  const status = escrow?.escrow_status || escrow?.status || 'Active';
  const progress = escrow?.completion_percentage || escrow?.details?.checklistProgress || 0;

  // Property image
  const propertyImage = escrow?.property_image_url || escrow?.details?.propertyImage;

  // Status config
  const statusConfig = getStatusConfig(status);

  // Update handlers
  const handleUpdateField = async (field, value) => {
    if (onUpdate) {
      await onUpdate({ [field]: value });
    }
  };

  return (
    <HeroContainer>
      {/* Property Image - 120x80 */}
      <PropertyImageBox>
        {propertyImage && !imageError ? (
          <PropertyImage
            src={propertyImage}
            alt={propertyAddress}
            onError={() => setImageError(true)}
          />
        ) : (
          <ImagePlaceholder>🏠</ImagePlaceholder>
        )}
      </PropertyImageBox>

      {/* Info Section */}
      <InfoSection>
        {/* Left: Address */}
        <AddressSection>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.25rem',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {propertyAddress}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
            }}
          >
            {city && state ? `${city}, ${state}` : ''} {escrowNumber && `• ${escrowNumber}`}
          </Typography>
        </AddressSection>

        {/* Right: Metrics - inline, no cards */}
        <MetricsRow>
          {/* Price - Editable */}
          <MetricBox>
            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', textTransform: 'uppercase' }}>
              Price
            </Typography>
            <EditableField
              value={purchasePrice}
              onSave={(value) => handleUpdateField('purchase_price', value)}
              type="currency"
              format={formatCurrency}
              parse={parseCurrency}
              displayClass="MuiTypography-root MuiTypography-h6"
              disabled={!onUpdate}
            />
          </MetricBox>

          {/* Commission - Calculated (not editable) */}
          <MetricBox>
            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', textTransform: 'uppercase' }}>
              Commission
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.125rem', color: 'primary.main' }}>
              {formatCurrency(commission)}
            </Typography>
          </MetricBox>

          {/* Closing - Editable */}
          <MetricBox>
            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', textTransform: 'uppercase' }}>
              Closing
            </Typography>
            <EditableField
              value={closingDate}
              onSave={(value) => handleUpdateField('closing_date', value)}
              type="date"
              format={(date) => formatDate(date, 'MMM d, yyyy')}
              displayClass="MuiTypography-root MuiTypography-h6"
              placeholder="Set date"
              disabled={!onUpdate}
            />
          </MetricBox>

          {/* Status Badge with Completion % */}
          <Box sx={{ ml: 2 }}>
            <Chip
              label={`${statusConfig.label} • ${progress}%`}
              size="small"
              sx={{
                backgroundColor: statusConfig.color,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 28,
              }}
            />
          </Box>
        </MetricsRow>
      </InfoSection>
    </HeroContainer>
  );
};

export default EscrowHero;
