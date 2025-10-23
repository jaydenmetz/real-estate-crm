import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Autocomplete,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Fade,
} from '@mui/material';
import debounce from 'lodash/debounce';
import {
  Close,
  LocationOn,
  PersonAdd,
  Home,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Bed,
  AttachMoney,
  Lock,
} from '@mui/icons-material';
import { listingsAPI, clientsAPI } from '../../../../services/api.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { loadGoogleMapsScript } from '../../../../utils/googleMapsLoader';
import NewClientModal from '../../clients/modals/NewClientModal';
import PrivacyControl from '../../../common/PrivacyControl';

const NewListingModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [clientSearchText, setClientSearchText] = useState('');
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
    clientId: null,
    isPrivate: false,
    accessLevel: 'team',
  });

  const steps = [
    { label: 'Property Address', icon: Home, color: '#1976d2' },
    { label: 'Property Details', icon: Bed, color: '#9c27b0' },
    { label: 'Client & Privacy', icon: PersonAdd, color: '#f57c00' },
    { label: 'Review', icon: CheckCircle, color: '#388e3c' }
  ];

  // Check for Google API key
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const hasValidGoogleKey = GOOGLE_API_KEY && GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE';
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Load Google Maps script when modal opens
  useEffect(() => {
    if (open && hasValidGoogleKey && !googleMapsLoaded) {
      loadGoogleMapsScript()
        .then(() => {
          setGoogleMapsLoaded(true);
          if (window.google?.maps?.places) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
            placesServiceRef.current = new window.google.maps.places.PlacesService(
              document.createElement('div')
            );
            sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
          }
        })
        .catch((error) => {
          console.warn('Failed to load Google Maps:', error.message);
        });
    }
  }, [open, hasValidGoogleKey, googleMapsLoaded]);

  // Fetch clients when modal opens
  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await clientsAPI.getAll();
      if (response.success) {
        setClients(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleNewClientSave = async (newClient) => {
    setNewClientModalOpen(false);
    await fetchClients();
    setFormData({ ...formData, clientId: newClient.id });
    setClientSearchText(`${newClient.firstName} ${newClient.lastName} - ${newClient.email}`);
  };

  const resetSessionToken = () => {
    if (window.google?.maps?.places) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  };

  useEffect(() => {
    return () => {
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
      setSelectedAddress(null);
    }
  }, [googleMapsLoaded, searchGooglePlaces, searchNominatim]);

  const handleAddressSelect = async (event, value) => {
    if (!value || typeof value === 'string') {
      setSelectedAddress(null);
      return;
    }

    setSelectedAddress(value);

    // Google Places result
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
            if (types.includes('street_number')) streetNumber = component.long_name;
            if (types.includes('route')) streetName = component.long_name;
            if (types.includes('locality')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.short_name;
            if (types.includes('postal_code')) zipCode = component.long_name;
            if (types.includes('administrative_area_level_2')) county = component.long_name;
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
          resetSessionToken();
        }
      });
    }
    // Nominatim result
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

    if (!formData.propertyAddress || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all address fields');
      return;
    }

    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullAddress = `${formData.propertyAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();

      const listingData = {
        propertyAddress: fullAddress,
        propertyType: formData.propertyType,
        listingStatus: formData.listingStatus,
        clientId: formData.clientId,
        isPrivate: formData.isPrivate,
        accessLevel: formData.accessLevel,
      };

      if (formData.listPrice) {
        listingData.listPrice = parseFloat(formData.listPrice.replace(/,/g, ''));
      }
      if (formData.bedrooms) {
        listingData.bedrooms = parseInt(formData.bedrooms);
      }
      if (formData.bathrooms) {
        listingData.bathrooms = parseFloat(formData.bathrooms);
      }
      if (formData.squareFootage) {
        listingData.squareFootage = parseInt(formData.squareFootage.replace(/,/g, ''));
      }

      const response = await listingsAPI.create(listingData);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data.id);
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
        clientId: null,
        isPrivate: false,
        accessLevel: 'team',
      });
      setSelectedAddress(null);
      setAddressSuggestions([]);
      setAddressSearchText('');
      setError('');
      setCurrentStep(0);
      resetSessionToken();
      onClose();
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 0) {
      if (!formData.propertyAddress || !formData.city || !formData.state || !formData.zipCode) {
        setError('Please complete all address fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.clientId) {
        setError('Please select a client');
        return;
      }
    }

    setError('');
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return parseFloat(price.replace(/,/g, '')).toLocaleString('en-US');
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${steps[currentStep].color}ee, ${steps[currentStep].color}99)`,
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <StepIcon sx={{ fontSize: 28, color: steps[currentStep].color }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Create New Listing
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Compact Progress Stepper */}
        <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: '#fafafa' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;

              return (
                <Box
                  key={step.label}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: isCompleted || isActive ? step.color : '#e0e0e0',
                    opacity: isCompleted || isActive ? 1 : 0.5,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'scaleY(1.3)' : 'scaleY(1)',
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Form Content */}
          <Box sx={{ px: 3, py: 3, minHeight: 400, maxHeight: '60vh', overflowY: 'auto' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Step 0: Property Address */}
            {currentStep === 0 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                    filterOptions={(x) => x}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ py: 1.5 }}>
                        <LocationOn sx={{ mr: 2, flexShrink: 0, color: 'action.active' }} />
                        <Box>
                          <Typography variant="body2">{option.label}</Typography>
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
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="City"
                      placeholder="Bakersfield"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      fullWidth
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
              </Fade>
            )}

            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="List Price"
                    placeholder="450,000"
                    value={formData.listPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const formatted = value ? parseInt(value).toLocaleString() : '';
                      setFormData({ ...formData, listPrice: formatted });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Enter the listing price"
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth required>
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
                      <FormHelperText>Type of property</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth required>
                      <InputLabel>Listing Status</InputLabel>
                      <Select
                        value={formData.listingStatus}
                        onChange={(e) => setFormData({ ...formData, listingStatus: e.target.value })}
                        label="Listing Status"
                      >
                        <MenuItem value="Coming Soon">Coming Soon</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                      </Select>
                      <FormHelperText>Current status</FormHelperText>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Bedrooms"
                      type="number"
                      placeholder="3"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      helperText="Number of bedrooms"
                    />
                    <TextField
                      fullWidth
                      label="Bathrooms"
                      type="number"
                      placeholder="2.5"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      helperText="Number of bathrooms"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Square Footage"
                    placeholder="2,000"
                    value={formData.squareFootage}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const formatted = value ? parseInt(value).toLocaleString() : '';
                      setFormData({ ...formData, squareFootage: formatted });
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">sq ft</InputAdornment>,
                    }}
                    helperText="Total living area"
                  />
                </Box>
              </Fade>
            )}

            {/* Step 2: Client & Privacy */}
            {currentStep === 2 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Autocomplete
                    options={Array.isArray(clients) ? clients : []}
                    loading={loadingClients}
                    inputValue={clientSearchText}
                    onInputChange={(e, value) => setClientSearchText(value)}
                    getOptionLabel={(option) =>
                      option.firstName && option.lastName
                        ? `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}`
                        : ''
                    }
                    filterOptions={(options, { inputValue }) => {
                      if (!Array.isArray(options)) return [];
                      if (!inputValue || inputValue.trim() === '') return options.slice(0, 5);

                      const filtered = options.filter(option => {
                        const searchText = inputValue.toLowerCase();
                        const fullName = `${option.firstName || ''} ${option.lastName || ''}`.toLowerCase();
                        const email = option.email?.toLowerCase() || '';
                        return fullName.includes(searchText) || email.includes(searchText);
                      });

                      return filtered.slice(0, 5);
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {option.firstName} {option.lastName}
                          </Typography>
                          {option.email && (
                            <Typography variant="caption" color="text.secondary">
                              {option.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Client"
                        placeholder="Search by name or email..."
                        helperText="Select the client for this listing"
                        required
                      />
                    )}
                    onChange={(e, value) => setFormData({ ...formData, clientId: value?.id || null })}
                    noOptionsText=""
                    ListboxProps={{ sx: { maxHeight: 300 } }}
                    PaperComponent={({ children, ...other }) => (
                      <Paper {...other}>
                        {children}
                        {children && <Divider />}
                        <ListItemButton
                          onClick={() => setNewClientModalOpen(true)}
                          sx={{ py: 1.5 }}
                        >
                          <ListItemIcon>
                            <PersonAdd color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Create New Client"
                            primaryTypographyProps={{ fontWeight: 600, color: 'primary.main' }}
                          />
                        </ListItemButton>
                      </Paper>
                    )}
                  />

                  <PrivacyControl
                    isPrivate={formData.isPrivate}
                    accessLevel={formData.accessLevel}
                    onPrivateChange={(value) => setFormData({ ...formData, isPrivate: value })}
                    onAccessLevelChange={(value) => setFormData({ ...formData, accessLevel: value })}
                  />
                </Box>
              </Fade>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1976d220, #2196f320)',
                      border: '2px solid #1976d2',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                      <LocationOn sx={{ color: '#1976d2', fontSize: 28 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Property Address
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {formData.propertyAddress || 'Not provided'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formData.city}, {formData.state} {formData.zipCode}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #9c27b020, #e91e6320)',
                        border: '2px solid #9c27b0',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        List Price
                      </Typography>
                      <Typography variant="h5" fontWeight="700">
                        ${formatPrice(formData.listPrice)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #9c27b020, #e91e6320)',
                        border: '2px solid #9c27b0',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Property Type
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formData.propertyType}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f57c0020, #ff980020)',
                        border: '2px solid #f57c00',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Bedrooms
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formData.bedrooms || 'Not specified'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f57c0020, #ff980020)',
                        border: '2px solid #f57c00',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Bathrooms
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formData.bathrooms || 'Not specified'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f57c0020, #ff980020)',
                        border: '2px solid #f57c00',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Square Feet
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formData.squareFootage ? `${formatPrice(formData.squareFootage)} sq ft` : 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #388e3c20, #66bb6a20)',
                      border: '2px solid #388e3c',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Listing Status
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {formData.listingStatus}
                    </Typography>
                  </Box>

                  {formData.isPrivate && (
                    <Chip
                      label="Private Listing"
                      color="error"
                      icon={<Lock />}
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  )}
                </Box>
              </Fade>
            )}
          </Box>

          {/* Navigation Buttons */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              bgcolor: '#fafafa',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              startIcon={<NavigateBefore />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant="contained"
                endIcon={<NavigateNext />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${steps[currentStep].color}ee, ${steps[currentStep].color}99)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${steps[currentStep].color}, ${steps[currentStep].color}dd)`,
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${steps[currentStep].color}ee, ${steps[currentStep].color}99)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${steps[currentStep].color}, ${steps[currentStep].color}dd)`,
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
            )}
          </Box>
        </form>
      </Dialog>

      <NewClientModal
        open={newClientModalOpen}
        onClose={() => setNewClientModalOpen(false)}
        onSuccess={handleNewClientSave}
      />
    </>
  );
};

export default NewListingModal;
