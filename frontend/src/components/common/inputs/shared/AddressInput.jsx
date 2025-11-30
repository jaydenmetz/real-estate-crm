import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, TextField, Autocomplete, CircularProgress, InputAdornment, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LocationOn, Close } from '@mui/icons-material';
import debounce from 'lodash/debounce';
import { useAuth } from '../../../../contexts/AuthContext';
import { decodeHTML } from '../../../../utils/htmlEntities';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

/**
 * Beautiful Address Autocomplete Input Component
 * Uses Google Places API (New) with Nominatim fallback
 *
 * Features:
 * - Google Places API (New) - modern autocomplete
 * - OpenStreetMap Nominatim (fallback)
 * - Location bias based on user's home location
 * - Returns structured address data
 * - Clean, minimal design matching other themed inputs
 *
 * @param {string} value - Current address value
 * @param {function} onChange - Change handler (receives structured address object after selection)
 * @param {function} onInputChange - Optional handler for text input changes (before selection)
 * @param {function} onKeyDown - Keyboard event handler
 * @param {boolean} disabled - Disabled state
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {boolean} hideLabel - Hide the "Display Name" label (default: false)
 * @param {string} color - Theme color for dropdown background (default: green)
 */
export const AddressInput = ({
  value,
  onChange,
  onInputChange, // Optional callback for text input changes (before selection)
  onKeyDown,
  disabled = false,
  placeholder = 'Enter property address',
  autoFocus = true,
  hideLabel = false,
  color = '#10b981', // Default green theme
}) => {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressSearchText, setAddressSearchText] = useState(decodeHTML(value) || '');
  const [selectedPlaceData, setSelectedPlaceData] = useState(null); // Store Google Places data after selection
  const abortControllerRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // New Places API (New) refs
  const placesLibraryRef = useRef(null);
  const sessionTokenRef = useRef(null);

  // Get user's location preferences with fallback to Bakersfield
  const userCity = user?.home_city || 'Bakersfield';
  const userState = user?.home_state || 'CA';
  const userLat = user?.home_lat || 35.3733;
  const userLng = user?.home_lng || -119.0187;
  const searchRadius = user?.search_radius_miles || 50;

  // Load Google Maps Places API (New) using functional API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
        return;
      }

      try {
        // Set API key using new functional API
        setOptions({
          apiKey,
          version: 'weekly',
        });

        // Import Places library using functional API
        const placesLibrary = await importLibrary('places');
        placesLibraryRef.current = placesLibrary;

        // Create session token for billing optimization
        sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();

        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps Places API (New):', error);
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

  // Sync value prop with internal state when it changes (decode HTML entities for display)
  useEffect(() => {
    const decodedValue = decodeHTML(value) || '';
    if (decodedValue !== addressSearchText) {
      setAddressSearchText(decodedValue);
    }
  }, [value]);

  // Debounced Google Places API (New) search
  const searchGooglePlaces = useMemo(
    () => debounce(async (input, callback) => {
      if (!placesLibraryRef.current || !input || input.length < 3) {
        callback([]);
        return;
      }

      try {
        // Detect if user included a city name (has comma or multiple words that might be city)
        // If they're typing full address, don't bias - search broadly
        const hasComma = input.includes(',');
        const hasMultipleWords = input.trim().split(/\s+/).length > 3;
        const shouldBias = !hasComma && !hasMultipleWords;

        const request = {
          input,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['us'],
          includedPrimaryTypes: ['street_address', 'premise'],
        };

        // Only add location bias for short/partial searches
        if (shouldBias) {
          request.locationBias = {
            circle: {
              center: { lat: userLat, lng: userLng },
              radius: searchRadius * 1609.34, // Convert miles to meters
            },
          };
        }

        // Use new AutocompleteSuggestion.fetchAutocompleteSuggestions
        const { suggestions } = await placesLibraryRef.current.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        const formattedSuggestions = suggestions.map(suggestion => ({
          label: suggestion.placePrediction.text.text,
          value: suggestion,
          placeId: suggestion.placePrediction.placeId,
        }));

        callback(formattedSuggestions);
      } catch (error) {
        console.error('Places API (New) autocomplete error:', error);
        callback([]);
      }
    }, 500),
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
        // Detect if user included a city name (has comma or multiple words)
        const hasComma = input.includes(',');
        const hasMultipleWords = input.trim().split(/\s+/).length > 3;
        const shouldBias = !hasComma && !hasMultipleWords;

        // Use input as-is - don't force city name
        const searchQuery = input;

        let url = `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}&` +
          `format=json&` +
          `countrycodes=us&` +
          `limit=8&` +
          `addressdetails=1`;

        // Only add viewbox bias for short/partial searches
        if (shouldBias) {
          const latRadius = searchRadius / 69;
          const lngRadius = searchRadius / 55;
          const minLat = userLat - latRadius;
          const maxLat = userLat + latRadius;
          const minLng = userLng - lngRadius;
          const maxLng = userLng + lngRadius;
          url += `&viewbox=${minLng},${maxLat},${maxLng},${minLat}&bounded=0`;
        }

        const response = await fetch(url,
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
            // Convert full state name to 2-letter abbreviation (Nominatim returns full names)
            const stateFull = item.address?.state || userState;
            const stateAbbreviations = {
              'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
              'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
              'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
              'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
              'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
              'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
              'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
              'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
              'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
              'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
              'District of Columbia': 'DC', 'Puerto Rico': 'PR'
            };
            const state = stateAbbreviations[stateFull] || stateFull;
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

      // Notify parent of text changes (for enabling save button, etc.)
      if (onInputChange) {
        onInputChange(value);
      }

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
  }, [googleMapsLoaded, searchGooglePlaces, searchNominatim, onChange, onInputChange]);

  const handleAddressSelect = async (event, value) => {
    // If user typed custom text (not from suggestions), preserve it
    if (!value || typeof value === 'string') {
      // User pressed Enter or is still editing after autocomplete selection
      if (addressSearchText && addressSearchText.trim()) {
        // If we have stored Google Places data from a previous selection,
        // use the current text as display address but keep Google data for canonical address
        if (selectedPlaceData) {
          onChange({
            property_address: selectedPlaceData.canonicalAddress, // Keep Google's verified address for geocoding
            property_address_display: addressSearchText.trim(), // Use edited text for display
            city: selectedPlaceData.city,
            state: selectedPlaceData.state,
            zip_code: selectedPlaceData.zipCode,
            county: selectedPlaceData.county,
            latitude: selectedPlaceData.latitude,
            longitude: selectedPlaceData.longitude,
          });
        } else {
          // No autocomplete data - parse manually entered address
          const parts = addressSearchText.split(',').map(p => p.trim());
          let customAddress = addressSearchText;
          let city = '';
          let state = '';
          let zipCode = '';

          // Try to extract city, state, zip from formatted input like "171 & 175 N Cottage St, Porterville, CA 93257"
          if (parts.length >= 3) {
            customAddress = parts[0]; // "171 & 175 N Cottage St"
            city = parts[1]; // "Porterville"
            const stateZip = parts[2].split(' '); // ["CA", "93257"]
            state = (stateZip[0] || '').substring(0, 2).toUpperCase(); // Ensure max 2 chars
            zipCode = stateZip[1] || '';
          } else if (parts.length === 2) {
            customAddress = parts[0];
            const stateZip = parts[1].split(' ');
            state = (stateZip[0] || '').substring(0, 2).toUpperCase(); // Ensure max 2 chars
            zipCode = stateZip[1] || '';
          }

          onChange({
            property_address: customAddress,
            property_address_display: customAddress, // Same as canonical for manual entry
            city: city || userCity,
            state: state || userState,
            zip_code: zipCode,
            county: '',
            latitude: null,
            longitude: null,
          });
        }
      } else {
        onChange(null);
      }
      return;
    }

    // Google Places API (New) result - Fetch place details
    if (value.placeId && placesLibraryRef.current) {
      (async () => {
        try {
          // Create Place object using new API
          const place = new placesLibraryRef.current.Place({
            id: value.placeId,
            requestedLanguage: 'en',
          });

          // Fetch place details with specific fields
          await place.fetchFields({
            fields: ['addressComponents', 'formattedAddress', 'location'],
          });

          // Parse address components using new API structure
          let streetNumber = '';
          let route = '';
          let city = '';
          let state = '';
          let zipCode = '';
          let county = '';

          if (place.addressComponents) {
            place.addressComponents.forEach(component => {
              const types = component.types;
              if (types.includes('street_number')) streetNumber = component.longText;
              if (types.includes('route')) route = component.longText;
              // Try multiple city field types
              if (types.includes('locality')) city = component.longText;
              else if (!city && types.includes('sublocality')) city = component.longText;
              else if (!city && types.includes('postal_town')) city = component.longText;
              else if (!city && types.includes('administrative_area_level_3')) city = component.longText;
              if (types.includes('administrative_area_level_1')) state = component.shortText;
              if (types.includes('postal_code')) zipCode = component.longText;
              if (types.includes('administrative_area_level_2')) county = component.longText.replace(' County', '');
            });
          }

          const streetAddress = `${streetNumber} ${route}`.trim();

          // Store the Google Places data
          const placeData = {
            canonicalAddress: streetAddress,
            city,
            state,
            zipCode,
            county,
            latitude: place.location?.lat(),
            longitude: place.location?.lng(),
          };
          setSelectedPlaceData(placeData);

          // Pre-fill the input with the street address
          setAddressSearchText(streetAddress);

          // Initially, both display and canonical are the same
          onChange({
            property_address: streetAddress,
            property_address_display: streetAddress,
            city,
            state,
            zip_code: zipCode,
            county,
            latitude: place.location?.lat(),
            longitude: place.location?.lng(),
          });

          // Reset session token for billing optimization
          sessionTokenRef.current = new placesLibraryRef.current.AutocompleteSessionToken();
        } catch (error) {
          console.error('Places API (New) place details error:', error);
        }
      })();
    } else if (value.value) {
      // Nominatim result
      const addressData = value.value;
      const streetAddress = addressData.address;

      // Store the data
      setSelectedPlaceData({
        canonicalAddress: streetAddress,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        county: addressData.county,
        latitude: parseFloat(addressData.lat),
        longitude: parseFloat(addressData.lon),
      });

      // Pre-fill the input
      setAddressSearchText(streetAddress);

      onChange({
        property_address: streetAddress,
        property_address_display: streetAddress,
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
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* Display Name Label - shows after autocomplete selection (unless hideLabel is true) */}
      {!hideLabel && selectedPlaceData && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            mb: 0.5,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Display Name
        </Typography>
      )}

      <Autocomplete
        freeSolo
        options={addressSuggestions}
        loading={loadingAddress}
        loadingText={<span style={{ color: 'white' }}>Loading...</span>}
        inputValue={addressSearchText}
        onInputChange={handleInputChange}
        onChange={handleAddressSelect}
        disabled={disabled}
        filterOptions={(x) => x} // Don't filter - we're controlling the options
        getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
        open={addressSuggestions.length > 0 || loadingAddress} // Only open dropdown when we have suggestions or are loading
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
                  {loadingAddress ? <CircularProgress sx={{ color: 'white' }} size={20} /> : null}
                  {params.InputProps?.endAdornment}
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
                backgroundColor: alpha(color, 0.95), // Match modal background color
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
