import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { loadGoogleMapsScript } from '../../utils/googleMapsLoader';

const NewEscrowModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressSearchText, setAddressSearchText] = useState('');
  const addressInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get user's location preferences with fallback to Bakersfield
  const userCity = user?.home_city || 'Bakersfield';
  const userState = user?.home_state || 'CA';
  const userLat = user?.home_lat || 35.3733;
  const userLng = user?.home_lng || -119.0187;
  const licensedStates = user?.licensed_states || ['CA'];
  const searchRadius = user?.search_radius_miles || 50;

  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: 'Bakersfield',  // Default to Bakersfield
    state: 'CA',           // Default to CA
    zipCode: '',           // Start empty, will populate on selection
    county: '',
  });

  // Use Google Places Autocomplete if API key is available
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
        })
        .catch((error) => {
          console.warn('Failed to load Google Maps:', error.message);
          // Fallback to Nominatim will be used
        });
    }
  }, [open, hasValidGoogleKey, googleMapsLoaded]);

  useEffect(() => {
    if (open && googleMapsLoaded && window.google?.maps?.places && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.address_components) {
          let streetNumber = '';
          let streetName = '';
          let city = 'Bakersfield';  // Keep Bakersfield as default
          let state = 'CA';           // Keep CA as default
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
              city = component.long_name;  // Update if provided
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name;  // Update if provided
            }
            if (types.includes('postal_code')) {
              zipCode = component.long_name;  // Populate zip on selection
            }
            if (types.includes('administrative_area_level_2')) {
              county = component.long_name;
            }
          });

          const fullAddress = `${streetNumber} ${streetName}`.trim();
          setFormData({
            propertyAddress: fullAddress,  // Street address only
            city: city || 'Bakersfield',   // Default to Bakersfield if empty
            state: state || 'CA',           // Default to CA if empty
            zipCode,                        // Populate from selection
            county: county.replace(' County', ''),
          });
          setSelectedAddress(place);
        }
      });

      return () => {
        if (window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocomplete);
        }
      };
    }
  }, [open, googleMapsLoaded]);

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

  // Fallback to Nominatim if no Google API key - ZERO DELAY implementation
  const fetchAddressSuggestions = useCallback((input) => {
    if (googleMapsLoaded) return; // Skip if using Google Places

    // Cancel ANY previous request immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear suggestions immediately if input is too short
    // Allow single digit for address numbers
    if (!input || input.length < 1) {
      setAddressSuggestions([]);
      setLoadingAddress(false);
      return;
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Start loading immediately (optimistic UI)
    setLoadingAddress(true);

    // Execute async fetch without await to avoid blocking
    (async () => {
      try {
        // Calculate bounding box around user's location (in degrees, roughly)
        // 1 degree latitude ≈ 69 miles, 1 degree longitude ≈ 55 miles (at 35° latitude)
        const latRadius = searchRadius / 69;
        const lngRadius = searchRadius / 55;
        const minLat = userLat - latRadius;
        const maxLat = userLat + latRadius;
        const minLng = userLng - lngRadius;
        const maxLng = userLng + lngRadius;

        // Smart query building for better partial matches
        let searchQuery;
        const cleanInput = input.trim();

        // Check if input is ONLY numbers (like "325" or "3")
        const isOnlyNumbers = /^\d+$/.test(cleanInput);
        // Check if input starts with number and has text (like "325 flow" or "325 F")
        const startsWithNumber = /^\d+\s+/.test(cleanInput);
        // Check if it's a number with a single letter (common for lettered streets like "325 F")
        const isNumberPlusSingleLetter = /^\d+\s+[A-Za-z]$/.test(cleanInput);

        if (isOnlyNumbers) {
          // Just numbers - search with user's city
          searchQuery = `${input} *, ${userCity}, ${userState}`;
        } else if (isNumberPlusSingleLetter) {
          // Special case for lettered streets (like "325 F")
          // Add "Street" to help Nominatim find it
          searchQuery = `${input} Street, ${userCity}, ${userState}`;
        } else if (startsWithNumber) {
          // Has number and partial street name - search as-is
          searchQuery = input.includes(',') ? input : `${input}, ${userCity}, ${userState}`;
        } else {
          // Just street name (no numbers) - search as-is first
          searchQuery = `${input}, ${userCity}, ${userState}`;
        }

        // Try primary search
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `format=json&` +
          `countrycodes=us&` +
          `limit=15&` +  // Increase limit for partial matches
          `addressdetails=1&` +
          `viewbox=${minLng},${maxLat},${maxLng},${minLat}&` +  // Dynamic bounding box
          `bounded=0`,  // Prefer results in box but don't exclude others
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
            }
          }
        );

        // Check if this request was aborted before processing
        if (controller.signal.aborted) return;

        let data = await response.json();

        // Handle error responses
        if (data.error) {
          console.error('Nominatim error:', data.error);
          if (!controller.signal.aborted) {
            setAddressSuggestions([]);
            setLoadingAddress(false);
          }
          return;
        }

        // If no results, try different search strategies based on input type
        if (data.length === 0 && !input.includes(',')) {
          // Try common street suffixes
          const streetTypes = ['street', 'drive', 'avenue', 'road', 'court', 'lane', 'way', 'boulevard', 'circle', 'place'];

          // Special handling for number + single letter (like "325 F")
          if (isNumberPlusSingleLetter) {
            // Try just "Street" and "Avenue" for lettered streets
            const letterStreetTypes = ['Street', 'Avenue'];
            for (const streetType of letterStreetTypes) {
              if (controller.signal.aborted) break;

              const fallbackQuery = `${input} ${streetType}, ${userCity}, ${userState}`;
              const fallbackResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(fallbackQuery)}&` +
                `format=json&` +
                `countrycodes=us&` +
                `limit=5&` +
                `addressdetails=1&` +
                `viewbox=${minLng},${maxLat},${maxLng},${minLat}&` +
                `bounded=1`,
                {
                  signal: controller.signal,
                  headers: {
                    'Cache-Control': 'no-cache',
                  }
                }
              );

              if (!controller.signal.aborted) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData && fallbackData.length > 0) {
                  data = [...data, ...fallbackData];
                }
              }
            }
          }
          // If it's only numbers, try common street names in user's city with that number
          else if (isOnlyNumbers) {
            // Common street names to try with the number (generic names that exist in most cities)
            const commonStreets = ['Main', 'First', 'Second', 'Oak', 'Elm', 'Park', 'Washington', 'Lincoln', 'Market', 'Church', 'State', 'Center'];

            for (const streetName of commonStreets) {
              if (controller.signal.aborted) break;

              // Try with different street types
              for (const streetType of streetTypes.slice(0, 3)) { // Just try street, drive, avenue for numbers
                if (controller.signal.aborted) break;

                const fallbackQuery = `${input} ${streetName} ${streetType}, ${userCity}, ${userState}`;

                const fallbackResponse = await fetch(
                  `https://nominatim.openstreetmap.org/search?` +
                  `q=${encodeURIComponent(fallbackQuery)}&` +
                  `format=json&` +
                  `countrycodes=us&` +
                  `limit=2&` +  // Just 2 per combination
                  `addressdetails=1&` +
                  `viewbox=${minLng},${maxLat},${maxLng},${minLat}&` +
                  `bounded=1`,  // Strict to user's area for number searches
                  {
                    signal: controller.signal,
                    headers: {
                      'Cache-Control': 'no-cache',
                    }
                  }
                );

                if (!controller.signal.aborted) {
                  const fallbackData = await fallbackResponse.json();
                  if (fallbackData && fallbackData.length > 0) {
                    data = [...data, ...fallbackData];
                  }
                }
              }
            }
          } else if (!startsWithNumber) {
            // For partial street names (not starting with numbers)
            for (const streetType of streetTypes) {
              if (controller.signal.aborted) break;

              const fallbackQuery = `${input} ${streetType}, ${userCity}, ${userState}`;

              const fallbackResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(fallbackQuery)}&` +
                `format=json&` +
                `countrycodes=us&` +
                `limit=5&` +  // Limit per street type
                `addressdetails=1&` +
                `viewbox=${minLng},${maxLat},${maxLng},${minLat}&` +
                `bounded=0`,
                {
                  signal: controller.signal,
                  headers: {
                    'Cache-Control': 'no-cache',
                  }
                }
              );

              if (!controller.signal.aborted) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData && fallbackData.length > 0) {
                  data = [...data, ...fallbackData];
                }
              }
            }
          }
        }

        // Process results FAST
        const uniqueAddresses = new Map();

        // Process and deduplicate results
        data
          .filter(item => {
            // More lenient filtering - include results that have any address component
            return item.address?.road || item.address?.house_number || item.name || item.address?.street;
          })
          .forEach(item => {
            const streetNumber = item.address?.house_number || '';
            const streetName = item.address?.road || item.name || '';
            const fullAddress = streetNumber ?
              `${streetNumber} ${streetName}`.trim() :
              streetName;

            const city = item.address?.city ||
                        item.address?.town ||
                        item.address?.village ||
                        item.address?.hamlet ||
                        userCity;

            const state = item.address?.state || userState;
            const stateAbbr = state.length > 2 ? userState : state;
            const zipCode = item.address?.postcode || '';

            const label = `${fullAddress}, ${city}, ${stateAbbr} ${zipCode}`.trim();

            // Use label as key to avoid duplicates
            if (!uniqueAddresses.has(label)) {
              uniqueAddresses.set(label, {
                label: label,
                value: {
                  address: fullAddress,
                  city: city,
                  state: stateAbbr,
                  zipCode: zipCode,
                  county: item.address?.county?.replace(' County', '') || '',
                  lat: item.lat,
                  lon: item.lon,
                }
              });
            }
          });

        // Convert to array and limit results
        const suggestions = Array.from(uniqueAddresses.values()).slice(0, 15);

        // Only update if this request wasn't aborted
        if (!controller.signal.aborted) {
          setAddressSuggestions(suggestions);
          setLoadingAddress(false);
        }
      } catch (error) {
        // Silently ignore abort errors
        if (error.name !== 'AbortError') {
          console.error('Error fetching address suggestions:', error);
          if (!controller.signal.aborted) {
            setAddressSuggestions([]);
            setLoadingAddress(false);
          }
        }
      }
    })(); // Execute immediately
  }, [googleMapsLoaded, userCity, userState, userLat, userLng, searchRadius]);


  const handleAddressSelect = (event, value) => {
    if (value && typeof value === 'object' && value.value) {
      // Extract just the street address (no city, state, zip)
      const streetAddress = value.value.address;

      setFormData({
        propertyAddress: streetAddress,  // Street address only
        city: value.value.city || 'Bakersfield',  // Use provided or default
        state: value.value.state || 'CA',         // Use provided or default
        zipCode: value.value.zipCode || '',       // Populate zip from selection
        county: value.value.county || '',
      });
      setSelectedAddress(value);
      setAddressSearchText(streetAddress);  // Show only street address in input
    } else if (typeof value === 'string') {
      // User typed something custom - keep defaults
      setSelectedAddress(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.propertyAddress || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all address fields');
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
        city: 'Bakersfield',  // Reset to default
        state: 'CA',           // Reset to default
        zipCode: '',           // Clear zip
        county: '',
      });
      setSelectedAddress(null);
      setAddressSuggestions([]);
      setAddressSearchText('');
      setError('');
      onClose();
    }
  };

  const renderContent = () => {
    return (
      <Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enter the property address for this escrow.
        </Typography>

        {/* Address input with autofill */}
        {
hasValidGoogleKey && googleMapsLoaded ? (
          <TextField
            inputRef={addressInputRef}
            fullWidth
            label="Street Address"
            placeholder="Enter street number and name only..."
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
          <Autocomplete
            freeSolo
            options={addressSuggestions}
            loading={loadingAddress}
            inputValue={addressSearchText}
            onInputChange={(event, value, reason) => {
              setAddressSearchText(value);
              if (reason === 'input') {
                setFormData({ ...formData, propertyAddress: value });
                setSelectedAddress(null);
                // Call directly - NO DEBOUNCE for instant response
                fetchAddressSuggestions(value);
              }
            }}
            onChange={handleAddressSelect}
            getOptionLabel={(option) => {
              return typeof option === 'string' ? option : option.label || '';
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ py: 1.5 }}>
                <LocationOn sx={{ mr: 2, flexShrink: 0, color: 'action.active' }} />
                <Typography variant="body2">
                  {option.label}
                </Typography>
              </Box>
            )}
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
        )}

        {/* Additional address fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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

      </Box>
    );
  };



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
            New Escrow
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
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewEscrowModal;