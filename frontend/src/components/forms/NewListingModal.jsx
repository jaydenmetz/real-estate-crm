import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
} from '@mui/material';
import debounce from 'lodash/debounce';
import {
  Close,
  LocationOn,
  Search,
  Home,
} from '@mui/icons-material';
import { listingsAPI } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';
import { loadGoogleMapsScript } from '../../utils/googleMapsLoader';

const NewListingModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressSearchText, setAddressSearchText] = useState('');
  const abortControllerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Get user's location preferences with fallback to Bakersfield
  const userCity = user?.home_city || 'Bakersfield';
  const userState = user?.home_state || 'CA';
  const userLat = user?.home_lat || 35.3733;
  const userLng = user?.home_lng || -119.0187;
  const searchRadius = user?.search_radius_miles || 50;

  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: 'Bakersfield',  // Default to Bakersfield
    state: 'CA',           // Default to CA
    zipCode: '',           // Start empty, will populate on selection
    county: '',
    listPrice: '',
    propertyType: 'Single Family',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    listingStatus: 'Coming Soon',
  });

  // Check for Google API key
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasValidGoogleKey = GOOGLE_API_KEY && GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE';
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Load Google Maps script when modal opens
  useEffect(() => {
    if (open && hasValidGoogleKey && !googleMapsLoaded) {
      loadGoogleMapsScript()
        .then(() => {
          console.log('Google Maps loaded successfully');
          setGoogleMapsLoaded(true);
          // Initialize services
          if (window.google?.maps?.places) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            placesServiceRef.current = new window.google.maps.places.PlacesService(
              document.createElement('div')
            );
            // Create a new session token for billing optimization
            sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
          }
        })
        .catch((error) => {
          console.warn('Failed to load Google Maps:', error.message);
          // Fallback to Nominatim will be used
        });
    }
  }, [open, hasValidGoogleKey, googleMapsLoaded]);

  // Reset session token after a place is selected
  const resetSessionToken = () => {
    if (window.google?.maps?.places) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Debounced Google Places search
  const searchGooglePlaces = useMemo(
    () => debounce(async (input, callback) => {
      if (!autocompleteServiceRef.current || !input || input.length < 3) {
        callback([]);
        return;
      }

      const request = {
        input,
        sessionToken: sessionTokenRef.current,
        componentRestrictions: { country: 'us' },
        types: ['address'],
        locationBias: new window.google.maps.Circle({
          center: { lat: userLat, lng: userLng },
          radius: searchRadius * 1609.34 // Convert miles to meters
        })
      };

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions = predictions.map(prediction => ({
            label: prediction.description,
            value: prediction,
            placeId: prediction.place_id
          }));
          callback(suggestions);
        } else {
          callback([]);
        }
      });
    }, 300), // 300ms debounce
    [userLat, userLng, searchRadius]
  );

  // Debounced Nominatim search (fallback)
  const searchNominatim = useMemo(
    () => debounce(async (input, callback) => {
      if (!input || input.length < 2) {
        callback([]);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const latRadius = searchRadius / 69;
        const lngRadius = searchRadius / 55;
        const minLat = userLat - latRadius;
        const maxLat = userLat + latRadius;
        const minLng = userLng - lngRadius;
        const maxLng = userLng + lngRadius;

        const searchQuery = input.includes(',')
          ? input
          : `${input}, ${userCity}, ${userState}`;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `format=json&` +
          `countrycodes=us&` +
          `limit=8&` +
          `addressdetails=1&` +
          `viewbox=${minLng},${maxLat},${maxLng},${minLat}&` +
          `bounded=0`,
          {
            signal: controller.signal,
            headers: {
              'User-Agent': 'RealEstateCRM/1.0'
            }
          }
        );

        if (!controller.signal.aborted) {
          const data = await response.json();

          const suggestions = data.map(item => {
            const parts = [];
            if (item.address?.house_number) parts.push(item.address.house_number);
            if (item.address?.road) parts.push(item.address.road);

            const streetAddress = parts.join(' ') || item.display_name.split(',')[0];
            const city = item.address?.city || item.address?.town || userCity;
            const state = item.address?.state || userState;
            const zipCode = item.address?.postcode || '';

            return {
              label: `${streetAddress}, ${city}, ${state}${zipCode ? ' ' + zipCode : ''}`,
              value: {
                address: streetAddress,
                city,
                state,
                zipCode,
                county: item.address?.county?.replace(' County', '') || '',
                lat: item.lat,
                lon: item.lon,
              }
            };
          });

          callback(suggestions);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Nominatim search error:', error);
          callback([]);
        }
      }
    }, 500), // 500ms debounce for API calls
    [userCity, userState, userLat, userLng, searchRadius]
  );

  // Handle input change with proper debouncing
  const handleInputChange = useCallback((event, value, reason) => {
    if (reason === 'input') {
      setAddressSearchText(value);
      setLoadingAddress(true);

      if (googleMapsLoaded && autocompleteServiceRef.current) {
        searchGooglePlaces(value, (suggestions) => {
          setAddressSuggestions(suggestions);
          setLoadingAddress(false);
        });
      } else {
        searchNominatim(value, (suggestions) => {
          setAddressSuggestions(suggestions);
          setLoadingAddress(false);
        });
      }
    } else if (reason === 'clear') {
      setAddressSearchText('');
      setAddressSuggestions([]);
      setSelectedAddress(null);
    }
  }, [googleMapsLoaded, searchGooglePlaces, searchNominatim]);

  // Handle address selection
  const handleAddressSelect = async (event, value) => {
    if (!value || typeof value === 'string') {
      setSelectedAddress(null);
      return;
    }

    setSelectedAddress(value);

    // If it's a Google Places result, get full details
    if (value.placeId && placesServiceRef.current) {
      setLoadingAddress(true);

      const request = {
        placeId: value.placeId,
        fields: ['address_components', 'formatted_address'],
        sessionToken: sessionTokenRef.current
      };

      placesServiceRef.current.getDetails(request, (place, status) => {
        setLoadingAddress(false);

        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          let streetNumber = '';
          let streetName = '';
          let city = 'Bakersfield';
          let state = 'CA';
          let zipCode = '';
          let county = '';

          place.address_components?.forEach(component => {
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

          setFormData(prev => ({
            ...prev,
            propertyAddress: fullAddress,
            city: city || 'Bakersfield',
            state: state || 'CA',
            zipCode: zipCode || '',
            county: county.replace(' County', ''),
          }));

          setAddressSearchText(fullAddress);
          // Reset session token after successful selection
          resetSessionToken();
        }
      });
    }
    // If it's a Nominatim result
    else if (value.value) {
      setFormData(prev => ({
        ...prev,
        propertyAddress: value.value.address,
        city: value.value.city || 'Bakersfield',
        state: value.value.state || 'CA',
        zipCode: value.value.zipCode || '',
        county: value.value.county || '',
      }));
      setAddressSearchText(value.value.address);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.propertyAddress) {
      setError('Please enter a property address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format the full address for the backend
      const fullAddress = `${formData.propertyAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();

      // Create listing with provided data
      const listingData = {
        propertyAddress: fullAddress,
        listPrice: formData.listPrice ? parseFloat(formData.listPrice) : null,
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
        listingStatus: formData.listingStatus,
      };

      const response = await listingsAPI.create(listingData);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data);
        }
        handleClose();
      } else {
        setError(response.error?.message || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('An error occurred while creating the listing');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        propertyAddress: '',
        city: 'Bakersfield',
        state: 'CA',
        zipCode: '',
        county: '',
        listPrice: '',
        propertyType: 'Single Family',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        listingStatus: 'Coming Soon',
      });
      setSelectedAddress(null);
      setAddressSuggestions([]);
      setAddressSearchText('');
      setError('');
      // Reset session token when closing
      resetSessionToken();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Home color="primary" />
          <Typography variant="h6" fontWeight="600">
            New Listing
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

          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
              Property Address
            </Typography>

            {/* Unified Autocomplete for both Google and Nominatim */}
            <Autocomplete
              freeSolo
              options={addressSuggestions}
              loading={loadingAddress}
              inputValue={addressSearchText}
              onInputChange={handleInputChange}
              onChange={handleAddressSelect}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.label || '';
              }}
              filterOptions={(x) => x} // Disable built-in filtering
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ py: 1.5 }}>
                  <LocationOn sx={{ mr: 2, flexShrink: 0, color: 'action.active' }} />
                  <Box>
                    <Typography variant="body2">
                      {option.label}
                    </Typography>
                    {googleMapsLoaded && (
                      <Typography variant="caption" color="text.secondary">
                        Powered by Google
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Street Address"
                  fullWidth
                  placeholder="Start typing an address..."
                  variant="outlined"
                  autoFocus
                  required
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
                  helperText={
                    googleMapsLoaded
                      ? "Powered by Google Places"
                      : "Type at least 2 characters to search"
                  }
                />
              )}
              noOptionsText={
                addressSearchText.length < (googleMapsLoaded ? 3 : 2)
                  ? `Type at least ${googleMapsLoaded ? 3 : 2} characters to search`
                  : "No addresses found"
              }
              sx={{ mb: 2 }}
            />

            {/* Additional address fields */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="City"
                placeholder="Bakersfield"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                sx={{ flex: 2 }}
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="ZIP Code"
                placeholder="93301"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
              Listing Details
            </Typography>

            {/* Property details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="List Price"
                  placeholder="450000"
                  value={formData.listPrice}
                  onChange={(e) => setFormData({ ...formData, listPrice: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    label="Property Type"
                  >
                    <MenuItem value="Single Family">Single Family</MenuItem>
                    <MenuItem value="Condo">Condo</MenuItem>
                    <MenuItem value="Townhouse">Townhouse</MenuItem>
                    <MenuItem value="Multi-Family">Multi-Family</MenuItem>
                    <MenuItem value="Land">Land</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.listingStatus}
                    onChange={(e) => setFormData({ ...formData, listingStatus: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="Coming Soon">Coming Soon</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Bedrooms"
                  type="number"
                  placeholder="3"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Bathrooms"
                  type="number"
                  placeholder="2.5"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Square Footage"
                  type="number"
                  placeholder="2000"
                  value={formData.squareFootage}
                  onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sq ft</InputAdornment>,
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Box>
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
            startIcon={loading ? <CircularProgress size={20} /> : <Home />}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewListingModal;