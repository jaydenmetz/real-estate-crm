import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, TextField, Autocomplete, CircularProgress, InputAdornment } from '@mui/material';
import { LocationOn, Close } from '@mui/icons-material';
import debounce from 'lodash/debounce';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * Beautiful Address Autocomplete Input Component
 * Live Google Places autocomplete with Nominatim fallback
 *
 * Features:
 * - Google Places Autocomplete (primary)
 * - OpenStreetMap Nominatim (fallback)
 * - Location bias based on user's home location
 * - Returns structured address data
 * - Clean, minimal design matching other themed inputs
 *
 * @param {string} value - Current address value
 * @param {function} onChange - Change handler (receives structured address object)
 * @param {function} onKeyDown - Keyboard event handler
 * @param {boolean} disabled - Disabled state
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const AddressInput = ({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  placeholder = 'Enter property address',
  autoFocus = true,
}) => {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressSearchText, setAddressSearchText] = useState(value || '');
  const abortControllerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const placesServiceRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Get user's location preferences with fallback to Bakersfield
  const userCity = user?.home_city || 'Bakersfield';
  const userState = user?.home_state || 'CA';
  const userLat = user?.home_lat || 35.3733;
  const userLng = user?.home_lng || -119.0187;
  const searchRadius = user?.search_radius_miles || 50;

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = async () => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
        return;
      }

      if (window.google?.maps?.places) {
        setGoogleMapsLoaded(true);
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.onload = () => {
          setGoogleMapsLoaded(true);
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

          const dummyDiv = document.createElement('div');
          placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    loadGoogleMaps();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

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
          radius: searchRadius * 1609.34
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
    }, 300),
    [userLat, userLng, searchRadius]
  );

  // Debounced Nominatim search (fallback)
  const searchNominatim = useMemo(
    () => debounce(async (input, callback) => {
      if (!input || input.length < 2) {
        callback([]);
        return;
      }

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
              label: zipCode
                ? `${streetAddress}, ${city}, ${state} ${zipCode}`
                : `${streetAddress}, ${city}, ${state}`,
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
    }, 500),
    [userCity, userState, userLat, userLng, searchRadius]
  );

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
      onChange(null);
    }
  }, [googleMapsLoaded, searchGooglePlaces, searchNominatim, onChange]);

  const handleAddressSelect = async (event, value) => {
    if (!value || typeof value === 'string') {
      onChange(null);
      return;
    }

    // Google Places result
    if (value.placeId && placesServiceRef.current) {
      const request = {
        placeId: value.placeId,
        fields: ['address_components', 'formatted_address', 'geometry'],
        sessionToken: sessionTokenRef.current,
      };

      placesServiceRef.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Parse address components
          let streetNumber = '';
          let route = '';
          let city = '';
          let state = '';
          let zipCode = '';
          let county = '';

          place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) streetNumber = component.long_name;
            if (types.includes('route')) route = component.long_name;
            if (types.includes('locality')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.short_name;
            if (types.includes('postal_code')) zipCode = component.long_name;
            if (types.includes('administrative_area_level_2')) county = component.long_name.replace(' County', '');
          });

          const streetAddress = `${streetNumber} ${route}`.trim();

          onChange({
            property_address: streetAddress, // Just street address, not full formatted address
            city,
            state,
            zip_code: zipCode,
            county,
            latitude: place.geometry?.location?.lat(),
            longitude: place.geometry?.location?.lng(),
          });

          // Reset session token
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      });
    } else if (value.value) {
      // Nominatim result
      const addressData = value.value;
      onChange({
        property_address: addressData.address, // Just street address, not full label
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zipCode,
        county: addressData.county,
        latitude: parseFloat(addressData.lat),
        longitude: parseFloat(addressData.lon),
      });
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <Autocomplete
        freeSolo
        options={addressSuggestions}
        loading={loadingAddress}
        inputValue={addressSearchText}
        onInputChange={handleInputChange}
        onChange={handleAddressSelect}
        disabled={disabled}
        filterOptions={(x) => x} // Don't filter - we're controlling the options
        getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn sx={{ color: 'white', fontSize: 24 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loadingAddress ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                minHeight: '60px',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: disabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.4)',
                  opacity: 1,
                },
              },
              '& .MuiAutocomplete-endAdornment': {
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              },
            }}
          />
        )}
        componentsProps={{
          popper: {
            sx: {
              '& .MuiPaper-root': {
                backgroundColor: 'rgba(16, 185, 129, 0.95)', // Green theme matching the modal
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 2,
                mt: 0.5,
              },
              '& .MuiAutocomplete-listbox': {
                '& .MuiAutocomplete-option': {
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  padding: '12px 16px',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                  '&[aria-selected="true"]': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    fontWeight: 600,
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                },
              },
              '& .MuiAutocomplete-noOptions': {
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                padding: '12px 16px',
              },
            },
          },
        }}
      />
    </Box>
  );
};
