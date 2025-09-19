import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Autocomplete,
  Paper,
} from '@mui/material';
import {
  Close,
  LocationOn,
  Search,
} from '@mui/icons-material';
import { escrowsAPI } from '../../services/api.service';
import { debounce } from 'lodash';

const NewEscrowModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [addressSearchText, setAddressSearchText] = useState('');
  const addressInputRef = useRef(null);

  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',
    county: '',
  });

  // Use Google Places Autocomplete if API key is available
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasValidGoogleKey = GOOGLE_API_KEY && GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE';

  useEffect(() => {
    if (open && hasValidGoogleKey && window.google && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.address_components) {
          let streetNumber = '';
          let streetName = '';
          let city = '';
          let state = '';
          let zipCode = '';
          let county = '';

          place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            }
            if (types.includes('route')) {
              streetName = component.long_name;
            }
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
            if (types.includes('postal_code')) {
              zipCode = component.long_name;
            }
            if (types.includes('administrative_area_level_2')) {
              county = component.long_name;
            }
          });

          const fullAddress = `${streetNumber} ${streetName}`.trim();
          setFormData({
            propertyAddress: fullAddress,
            city,
            state,
            zipCode,
            county: county.replace(' County', ''),
          });
          setSelectedAddress(place);
        }
      });

      return () => {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      };
    }
  }, [open, hasValidGoogleKey]);

  // Fallback to Nominatim if no Google API key
  const fetchAddressSuggestions = debounce(async (input) => {
    if (hasValidGoogleKey) return; // Skip if using Google Places

    if (input.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setLoadingAddress(true);
    try {
      // Add Bakersfield, CA to help with local searches if not already specified
      const searchQuery = input.includes(',') ? input : `${input}, Bakersfield, CA`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `format=json&` +
        `countrycodes=us&` +
        `limit=10&` +
        `addressdetails=1&` +
        `viewbox=-119.2,35.5,-118.8,35.2&` +  // Bakersfield area bounding box
        `bounded=0`  // Prefer results in box but don't exclude others
      );

      const data = await response.json();

      // Handle error responses
      if (data.error) {
        console.error('Nominatim error:', data.error);
        setAddressSuggestions([]);
        return;
      }

      const suggestions = data.map(item => ({
        label: item.display_name,
        value: {
          address: item.address?.house_number ?
            `${item.address.house_number} ${item.address.road || item.name || ''}`.trim() :
            (item.address?.road || item.name || ''),
          // Better city extraction - check multiple fields
          city: item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.hamlet ||
                'Bakersfield',  // Default to Bakersfield if no city found
          state: item.address?.state || 'CA',
          zipCode: item.address?.postcode || '',
          county: item.address?.county?.replace(' County', '') || 'Kern',
          lat: item.lat,
          lon: item.lon,
        }
      }));

      console.log('Mapped suggestions:', suggestions);
      console.log('Setting addressSuggestions to:', suggestions.length, 'items');
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setLoadingAddress(false);
    }
  }, 300);

  const handleAddressSelect = (event, value) => {
    if (value && typeof value === 'object' && value.value) {
      setFormData({
        propertyAddress: value.value.address,
        city: value.value.city,
        state: value.value.state,
        zipCode: value.value.zipCode,
        county: value.value.county,
      });
      setSelectedAddress(value);
      setAddressSearchText(value.label);
    } else if (typeof value === 'string') {
      // User typed something custom
      setSelectedAddress(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that either an address was selected or manual entry is complete
    if (!manualEntry && !selectedAddress) {
      setError('Please select an address from the suggestions or choose "Enter address manually"');
      return;
    }

    if (manualEntry && (!formData.propertyAddress || !formData.city || !formData.state || !formData.zipCode)) {
      setError('Please fill in all address fields');
      return;
    }

    if (!formData.propertyAddress) {
      setError('Please select or enter a property address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create escrow with minimal data - just address info
      const escrowData = {
        propertyAddress: formData.propertyAddress,
        city: formData.city || '',
        state: formData.state || 'CA',
        zipCode: formData.zipCode || '',
        county: formData.county || '',
        // Set default values for required fields
        purchasePrice: 0,
        myCommission: 0,
        acceptanceDate: new Date().toISOString(),
        scheduledCoeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        escrowStatus: 'Active Under Contract',
        myRole: 'Listing Agent',
      };

      const response = await escrowsAPI.create(escrowData);

      if (response.success) {
        // Call success callback with the new escrow ID
        if (onSuccess) {
          onSuccess(response.data.id);
        }
        handleClose();
      } else {
        setError(response.error?.message || 'Failed to create escrow');
      }
    } catch (err) {
      console.error('Error creating escrow:', err);
      setError('An error occurred while creating the escrow');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        propertyAddress: '',
        city: '',
        state: 'CA',
        zipCode: '',
        county: '',
      });
      setSelectedAddress(null);
      setAddressSuggestions([]);
      setManualEntry(false);
      setAddressSearchText('');
      setError('');
      onClose();
    }
  };

  const renderContent = () => {
    return (
      <Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Search for the property address or enter it manually.
        </Typography>

        {/* Toggle for manual entry */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={manualEntry ? 'contained' : 'outlined'}
            onClick={() => {
              setManualEntry(!manualEntry);
              setSelectedAddress(null);
              if (!manualEntry) {
                // Clear form when switching to manual
                setFormData({
                  propertyAddress: '',
                  city: '',
                  state: 'CA',
                  zipCode: '',
                  county: '',
                });
              }
            }}
            startIcon={<LocationOn />}
          >
            {manualEntry ? 'Search for Address' : 'Enter Address Manually'}
          </Button>
          {!manualEntry && addressSearchText && !selectedAddress && (
            <Typography variant="caption" color="error">
              Please select an address from the list
            </Typography>
          )}
        </Box>

        {/* Debug info */}
        {!hasValidGoogleKey && addressSuggestions.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Found {addressSuggestions.length} suggestions
          </Typography>
        )}

        {/* Address input based on mode */}
        {!manualEntry ? (
          // Search mode
          hasValidGoogleKey ? (
          <TextField
            inputRef={addressInputRef}
            fullWidth
            label="Property Address"
            placeholder="Start typing an address..."
            value={formData.propertyAddress}
            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
            variant="outlined"
            autoFocus
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
            }}
            helperText="Start typing to search for addresses"
          />
        ) : (
          <>
          {console.log('Current addressSuggestions:', addressSuggestions)}
          <Autocomplete
            freeSolo
            disablePortal
            options={addressSuggestions}
            loading={loadingAddress}
            value={selectedAddress}
            inputValue={addressSearchText}
            onInputChange={(event, value, reason) => {
              console.log('onInputChange triggered:', value, reason);
              setAddressSearchText(value);
              if (reason === 'input') {
                setFormData({ ...formData, propertyAddress: value });
                fetchAddressSuggestions(value);
              }
            }}
            onChange={handleAddressSelect}
            getOptionLabel={(option) => {
              return typeof option === 'string' ? option : option.label || '';
            }}
            isOptionEqualToValue={(option, value) => {
              return option.label === value?.label;
            }}
            renderOption={(props, option) => {
              console.log('Rendering option:', option);
              return (
                <Box component="li" {...props}>
                  <LocationOn sx={{ mr: 2, flexShrink: 0, color: 'action.active' }} />
                  <Box>
                    <Typography variant="body2">
                      {option.value?.address || 'No address'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.value?.city || 'No city'}, {option.value?.state || 'No state'} {option.value?.zipCode || ''}
                    </Typography>
                  </Box>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Property Address"
                fullWidth
                required
                placeholder="Start typing an address..."
                variant="outlined"
                autoFocus
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <>
                      {loadingAddress ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                helperText="Start typing to search for addresses"
              />
            )}
          />
          </>
        )
        ) : (
          // Manual entry mode
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Street Address"
              placeholder="e.g., 325 Flower Street"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              required
              variant="outlined"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="City"
                placeholder="Bakersfield"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                sx={{ flex: 2 }}
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="ZIP Code"
                placeholder="93301"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                required
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              fullWidth
              label="County (optional)"
              placeholder="Kern"
              value={formData.county}
              onChange={(e) => setFormData({ ...formData, county: e.target.value })}
            />
          </Box>
        )}

        {/* Show parsed address details if available */}
        {!manualEntry && selectedAddress && (formData.city || formData.state || formData.zipCode) && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.300',
            }}
          >
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Detected Address Details:
            </Typography>
            <Typography variant="body2">
              {formData.city && `City: ${formData.city}`}
              {formData.city && formData.state && ', '}
              {formData.state && `State: ${formData.state}`}
              {(formData.city || formData.state) && formData.zipCode && ', '}
              {formData.zipCode && `ZIP: ${formData.zipCode}`}
              {formData.county && `, County: ${formData.county}`}
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };


  // Load Google Maps API if needed
  useEffect(() => {
    if (hasValidGoogleKey && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    }
  }, [hasValidGoogleKey]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" />
          <Typography variant="h6" fontWeight="600">
            Quick Create Escrow
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {renderContent()}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.propertyAddress}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
          >
            {loading ? 'Creating...' : 'Create Escrow'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewEscrowModal;