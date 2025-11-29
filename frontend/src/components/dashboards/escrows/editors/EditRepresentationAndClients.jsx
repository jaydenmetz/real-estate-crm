import React, { useState, useEffect } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { Person, Home, Group } from '@mui/icons-material';
import { ClientSelector } from './ClientSelector';

/**
 * Combined Representation Type + Clients Editor
 * Shows representation type selector with client fields appearing below based on selection
 *
 * Flow:
 * 1. User selects Buyer/Seller/Dual
 * 2. Client selector(s) appear below immediately:
 *    - Buyer → Single "Buyer" selector
 *    - Seller → Single "Seller" selector
 *    - Dual → Two selectors: "Buyer(s)" above "Seller(s)"
 *
 * @param {string} representationType - Current representation type ('buyer' | 'seller' | 'dual')
 * @param {function} onRepresentationTypeChange - Callback when representation type changes
 * @param {array} buyerClients - Array of buyer client IDs
 * @param {array} sellerClients - Array of seller client IDs
 * @param {function} onBuyerClientsChange - Callback when buyer clients change
 * @param {function} onSellerClientsChange - Callback when seller clients change
 */
export const EditRepresentationAndClients = ({
  representationType = 'buyer',
  onRepresentationTypeChange,
  buyerClients = [],
  sellerClients = [],
  onBuyerClientsChange,
  onSellerClientsChange,
}) => {
  const [selectedType, setSelectedType] = useState(representationType);

  useEffect(() => {
    setSelectedType(representationType);
  }, [representationType]);

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setSelectedType(newType);
      onRepresentationTypeChange(newType);
    }
  };

  return (
    <Box>
      {/* Representation Type Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            mb: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Representation Type
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: 'white',
            mb: 2,
            letterSpacing: '-1px',
          }}
        >
          Who do you represent?
        </Typography>

        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          fullWidth
          sx={{
            gap: 1.5,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              '&:not(:first-of-type)': {
                marginLeft: 0,
                borderRadius: 2,
              },
              '&:first-of-type': {
                borderRadius: 2,
              },
            },
            '& .MuiToggleButton-root': {
              color: 'rgba(255,255,255,0.7)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.2)',
              fontWeight: 600,
              py: 2.5,
              px: 2,
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              textTransform: 'none',
              borderRadius: 2,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.35)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
              },
            },
          }}
        >
          <ToggleButton value="buyer">
            <Person sx={{ fontSize: 28 }} />
            <Typography variant="body2" fontWeight={600}>
              Buyer
            </Typography>
          </ToggleButton>

          <ToggleButton value="seller">
            <Home sx={{ fontSize: 28 }} />
            <Typography variant="body2" fontWeight={600}>
              Seller
            </Typography>
          </ToggleButton>

          <ToggleButton value="dual">
            <Group sx={{ fontSize: 28 }} />
            <Typography variant="body2" fontWeight={600}>
              Dual
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

      {/* Client Selection(s) - Dynamic based on representation type */}
      {selectedType === 'dual' ? (
        // Dual Agency: Two client selectors stacked (without modal wrappers)
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Buyer Clients - Embedded inline content */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.9)',
                mb: 1,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Buyer(s)
            </Typography>
            <ClientSelector
              value={buyerClients}
              onChange={onBuyerClientsChange}
              label="Buyer(s)"
            />
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Seller Clients - Embedded inline content */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.9)',
                mb: 1,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Seller(s)
            </Typography>
            <ClientSelector
              value={sellerClients}
              onChange={onSellerClientsChange}
              label="Seller(s)"
            />
          </Box>
        </Box>
      ) : (
        // Single Representation: One client selector (without modal wrapper)
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              mb: 1,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {selectedType === 'buyer' ? 'Buyer' : 'Seller'}
          </Typography>
          <ClientSelector
            value={selectedType === 'buyer' ? buyerClients : sellerClients}
            onChange={selectedType === 'buyer' ? onBuyerClientsChange : onSellerClientsChange}
            label={selectedType === 'buyer' ? 'Buyer' : 'Seller'}
          />
        </Box>
      )}
    </Box>
  );
};
