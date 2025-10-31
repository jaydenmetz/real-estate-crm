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
  Stepper,
  Step,
  StepLabel,
  Fade,
  Slide,
} from '@mui/material';
import debounce from 'lodash/debounce';
import {
  Close,
  LocationOn,
  PersonAdd,
  Home,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Search,
} from '@mui/icons-material';
import { escrowsAPI, clientsAPI } from '../../../../services/api.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { loadGoogleMapsScript } from '../../../../utils/googleMapsLoader';
import { NewContactModal } from '../../../modals/NewContactModal';
import PrivacyControl from '../../../common/PrivacyControl';

const NewEscrowModal = ({ open, onClose, onSuccess }) => {
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

  // Helper function to check if a date is a US federal holiday
  const isUSHoliday = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    // Fixed holidays
    if (month === 0 && day === 1) return true; // New Year's Day
    if (month === 6 && day === 4) return true; // Independence Day
    if (month === 10 && day === 11) return true; // Veterans Day
    if (month === 11 && day === 25) return true; // Christmas Day

    // Floating holidays
    if (month === 0 && dayOfWeek === 1 && day >= 15 && day <= 21) return true; // MLK Jr. Day
    if (month === 1 && dayOfWeek === 1 && day >= 15 && day <= 21) return true; // Presidents' Day
    if (month === 4 && dayOfWeek === 1 && day >= 25) return true; // Memorial Day
    if (month === 8 && dayOfWeek === 1 && day <= 7) return true; // Labor Day
    if (month === 9 && dayOfWeek === 1 && day >= 8 && day <= 14) return true; // Columbus Day
    if (month === 10 && dayOfWeek === 4 && day >= 22 && day <= 28) return true; // Thanksgiving
    if (month === 10 && dayOfWeek === 5 && day >= 23 && day <= 29) return true; // Black Friday
    if ((month === 11 && day === 24 && dayOfWeek >= 1 && dayOfWeek <= 5) ||
        (month === 11 && day === 31 && dayOfWeek >= 1 && dayOfWeek <= 5)) return true; // Christmas Eve / New Year's Eve

    return false;
  };

  // Helper function to calculate COE date (30 days out, adjusting for weekends and holidays)
  const calculateDefaultCOE = (acceptanceDate = new Date()) => {
    const coeDate = new Date(acceptanceDate);
    coeDate.setDate(coeDate.getDate() + 30);

    while (true) {
      const dayOfWeek = coeDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = isUSHoliday(coeDate);

      if (!isWeekend && !isHoliday) {
        break;
      }

      coeDate.setDate(coeDate.getDate() + 1);
    }

    return coeDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: 'Bakersfield',
    state: 'CA',
    zipCode: '',
    county: '',
    purchasePrice: '',
    acceptanceDate: new Date().toISOString().split('T')[0],
    closeOfEscrowDate: calculateDefaultCOE(),
    commissionPercentage: '',
    commissionFlat: '',
    clientId: null,
    representationType: 'buyer',
    isPrivate: false,
    accessLevel: 'team',
  });

  const steps = [
    { label: 'Property', icon: Home, color: '#1976d2' },
    { label: 'Transaction', icon: CalendarToday, color: '#9c27b0' },
    { label: 'Commission', icon: AttachMoney, color: '#f57c00' },
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

  // Load 5 most recent clients when modal opens
  useEffect(() => {
    const loadRecentClients = async () => {
      if (!open) return;

      setLoadingClients(true);
      try {
        const response = await clientsAPI.getAll({
          limit: 5,
          sortBy: 'created_at',
          sortOrder: 'desc'
        });

        let results = [];
        if (response.success && response.data) {
          results = Array.isArray(response.data) ? response.data : [];
        }

        // Transform to match expected format
        const transformedClients = results.map(client => ({
          ...client,
          id: client.client_id || client.id,
          firstName: client.first_name || client.firstName,
          lastName: client.last_name || client.lastName,
          isClientRole: true,
        }));

        setClients(transformedClients);
      } catch (err) {
        console.error('Error loading recent clients:', err);
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    };

    loadRecentClients();
  }, [open]);

  // Debounced live search for clients
  const searchContactsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 2) {
        // When search is cleared, reload recent clients
        const loadRecentClients = async () => {
          setLoadingClients(true);
          try {
            const response = await clientsAPI.getAll({
              limit: 5,
              sortBy: 'created_at',
              sortOrder: 'desc'
            });

            let results = [];
            if (response.success && response.data) {
              results = Array.isArray(response.data) ? response.data : [];
            }

            const transformedClients = results.map(client => ({
              ...client,
              id: client.client_id || client.id,
              firstName: client.first_name || client.firstName,
              lastName: client.last_name || client.lastName,
              isClientRole: true,
            }));

            setClients(transformedClients);
          } catch (err) {
            console.error('Error loading recent clients:', err);
            setClients([]);
          } finally {
            setLoadingClients(false);
          }
        };
        loadRecentClients();
        return;
      }

      setLoadingClients(true);
      try {
        // Search clients by name or email
        const response = await clientsAPI.getAll({
          search: searchText,
          limit: 10
        });

        let results = [];
        if (response.success && response.data) {
          results = Array.isArray(response.data) ? response.data : [];
        }

        // Transform to match expected format
        const transformedClients = results.map(client => ({
          ...client,
          id: client.client_id || client.id,
          firstName: client.first_name || client.firstName,
          lastName: client.last_name || client.lastName,
          isClientRole: true,
        }));

        setClients(transformedClients);
      } catch (err) {
        console.error('Error searching clients:', err);
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    }, 300), // 300ms debounce
    []
  );

  // Trigger search when user types
  useEffect(() => {
    searchContactsDebounced(clientSearchText);
  }, [clientSearchText, searchContactsDebounced]);

  const handleNewClientSave = async (newContact) => {
    setNewClientModalOpen(false);
    // Add the new contact to the list immediately
    const transformedContact = {
      ...newContact,
      firstName: newContact.first_name || newContact.firstName,
      lastName: newContact.last_name || newContact.lastName,
      isClientRole: true,
    };
    setClients([transformedContact]);
    setFormData({ ...formData, clientId: newContact.id });
    const fullName = `${newContact.first_name || ''} ${newContact.last_name || ''}`.trim();
    setClientSearchText(`${fullName}${newContact.email ? ' - ' + newContact.email : ''}`);
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

    if (!formData.purchasePrice) {
      setError('Please enter the purchase price');
      return;
    }

    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let calculatedCommission = 0;
      if (formData.commissionPercentage) {
        calculatedCommission = parseFloat(formData.purchasePrice.replace(/,/g, '')) * parseFloat(formData.commissionPercentage) / 100;
      } else if (formData.commissionFlat) {
        calculatedCommission = parseFloat(formData.commissionFlat.replace(/,/g, ''));
      }

      const escrowData = {
        propertyAddress: formData.propertyAddress,
        city: formData.city || '',
        state: formData.state || 'CA',
        zipCode: formData.zipCode || '',
        county: formData.county || '',
        purchasePrice: parseFloat(formData.purchasePrice.replace(/,/g, '')) || 0,
        myCommission: calculatedCommission,
        commissionType: formData.commissionPercentage ? 'percentage' : 'flat',
        commissionRate: formData.commissionPercentage ? parseFloat(formData.commissionPercentage) : null,
        acceptanceDate: formData.acceptanceDate,
        closeOfEscrowDate: formData.closeOfEscrowDate,
        escrowNumber: `ESC-${Date.now()}`,
        openDate: formData.acceptanceDate,
        status: 'active',
        clientId: formData.clientId,
        representationType: formData.representationType,
        isPrivate: formData.isPrivate,
        accessLevel: formData.accessLevel,
      };

      const response = await escrowsAPI.create(escrowData);

      if (response.success) {
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
      setFormData({
        propertyAddress: '',
        city: 'Bakersfield',
        state: 'CA',
        zipCode: '',
        county: '',
        purchasePrice: '',
        acceptanceDate: new Date().toISOString().split('T')[0],
        closeOfEscrowDate: calculateDefaultCOE(),
        commissionPercentage: '',
        commissionFlat: '',
        clientId: null,
        representationType: 'buyer',
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
    } else if (currentStep === 1) {
      if (!formData.purchasePrice || !formData.clientId) {
        setError('Please enter purchase price and select a client');
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

  const calculateCommission = () => {
    if (formData.commissionPercentage && formData.purchasePrice) {
      return (parseFloat(formData.purchasePrice.replace(/,/g, '')) * parseFloat(formData.commissionPercentage) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (formData.commissionFlat) {
      return parseFloat(formData.commissionFlat.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '0.00';
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
                Create New Escrow
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  pt: 8, // Fixed top padding to anchor street address position
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Fade in timeout={400}>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    maxWidth: '100%',
                    mx: 'auto',
                    width: '100%',
                    px: 4, // Add left and right padding
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    {/* Street Address - Always Visible, Fixed Position */}
                    <Box sx={{
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
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
                    </Box>

                    {/* Additional Fields - Slide In After Address Selected */}
                    {formData.propertyAddress && (
                      <Fade in timeout={600}>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5,
                          animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          '@keyframes slideInUp': {
                            from: {
                              opacity: 0,
                              transform: 'translateY(30px)',
                            },
                            to: {
                              opacity: 1,
                              transform: 'translateY(0)',
                            },
                          },
                        }}>
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
                  </Box>
                </Fade>
              </Box>
            )}

            {/* Step 1: Transaction Details */}
            {currentStep === 1 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Purchase Price"
                    placeholder="450,000"
                    value={formData.purchasePrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const formatted = value ? parseInt(value).toLocaleString() : '';
                      setFormData({ ...formData, purchasePrice: formatted });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Enter the purchase price of the property"
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Acceptance Date"
                      type="date"
                      value={formData.acceptanceDate}
                      onChange={(e) => {
                        const newAcceptanceDate = e.target.value;
                        setFormData({
                          ...formData,
                          acceptanceDate: newAcceptanceDate,
                          closeOfEscrowDate: calculateDefaultCOE(new Date(newAcceptanceDate))
                        });
                      }}
                      InputLabelProps={{ shrink: true }}
                      helperText="Date offer was accepted"
                    />
                    <TextField
                      fullWidth
                      label="Close of Escrow Date"
                      type="date"
                      value={formData.closeOfEscrowDate}
                      onChange={(e) => setFormData({ ...formData, closeOfEscrowDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      helperText="Auto-adjusts to business day"
                    />
                  </Box>

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
                    filterOptions={(x) => x} // No local filtering - backend handles it
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {option.firstName} {option.lastName}
                            {option.isClientRole && (
                              <Chip
                                label="Client"
                                size="small"
                                sx={{
                                  ml: 1,
                                  height: 18,
                                  fontSize: '0.7rem',
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                }}
                              />
                            )}
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
                        placeholder="Search or create new client..."
                        helperText={clients.length === 0 && !clientSearchText ? "Showing 5 most recent clients" : "Type to search by name or email"}
                        required
                      />
                    )}
                    onChange={(e, value) => setFormData({ ...formData, clientId: value?.id || null })}
                    noOptionsText={loadingClients ? "Loading..." : "No clients found - click 'Add New Client' below"}
                    ListboxProps={{ sx: { maxHeight: 300 } }}
                    PaperComponent={({ children, ...other }) => (
                      <Paper {...other}>
                        {children}
                        {children && <Divider />}
                        <ListItemButton
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setNewClientModalOpen(true);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          sx={{ py: 1.5 }}
                        >
                          <ListItemIcon>
                            <PersonAdd color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={clientSearchText ? `Add "${clientSearchText}" as Client` : "Create New Client"}
                            primaryTypographyProps={{ fontWeight: 600, color: 'primary.main' }}
                          />
                        </ListItemButton>
                      </Paper>
                    )}
                  />

                  <FormControl fullWidth required>
                    <InputLabel>Representation Type</InputLabel>
                    <Select
                      value={formData.representationType}
                      onChange={(e) => setFormData({ ...formData, representationType: e.target.value })}
                      label="Representation Type"
                    >
                      <MenuItem value="buyer">Buyer</MenuItem>
                      <MenuItem value="seller">Seller</MenuItem>
                      <MenuItem value="dual">Dual Agency</MenuItem>
                    </Select>
                    <FormHelperText>Are you representing the buyer, seller, or both?</FormHelperText>
                  </FormControl>
                </Box>
              </Fade>
            )}

            {/* Step 2: Commission */}
            {currentStep === 2 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant={formData.commissionPercentage ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, commissionPercentage: formData.commissionPercentage || '2.5', commissionFlat: '' })}
                      sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                    >
                      Percentage %
                    </Button>
                    <Button
                      fullWidth
                      variant={formData.commissionFlat ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, commissionFlat: formData.commissionFlat || '10000', commissionPercentage: '' })}
                      sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                    >
                      Flat Amount $
                    </Button>
                  </Box>

                  {formData.commissionPercentage && (
                    <TextField
                      fullWidth
                      label="Commission Percentage"
                      placeholder="2.5"
                      value={formData.commissionPercentage}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setFormData({ ...formData, commissionPercentage: value });
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      helperText="Enter percentage (e.g., 2.5 for 2.5%)"
                    />
                  )}

                  {formData.commissionFlat && (
                    <TextField
                      fullWidth
                      label="Flat Commission Amount"
                      placeholder="10,000"
                      value={formData.commissionFlat}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        const formatted = value ? parseInt(value).toLocaleString() : '';
                        setFormData({ ...formData, commissionFlat: formatted });
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="Or enter a flat commission amount"
                    />
                  )}

                  {formData.purchasePrice && (formData.commissionPercentage || formData.commissionFlat) && (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4caf5020, #8bc34a20)',
                        border: '2px solid #4caf50',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Commission
                      </Typography>
                      <Typography variant="h4" fontWeight="700" color="success.dark">
                        ${calculateCommission()}
                      </Typography>
                    </Box>
                  )}

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
                        Purchase Price
                      </Typography>
                      <Typography variant="h5" fontWeight="700">
                        ${formData.purchasePrice || '0'}
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
                        Commission
                      </Typography>
                      <Typography variant="h5" fontWeight="700">
                        ${calculateCommission()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formData.commissionPercentage ? `${formData.commissionPercentage}%` : 'Flat'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #388e3c20, #66bb6a20)',
                        border: '2px solid #388e3c',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Acceptance Date
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {formData.acceptanceDate || 'Not set'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #388e3c20, #66bb6a20)',
                        border: '2px solid #388e3c',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Close Date
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {formData.closeOfEscrowDate || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #5c6bc020, #7986cb20)',
                      border: '2px solid #5c6bc0',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Representation
                    </Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                      {formData.representationType}
                    </Typography>
                  </Box>

                  {formData.isPrivate && (
                    <Chip
                      label="Private Escrow"
                      color="error"
                      icon={<LocationOn />}
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
                {loading ? 'Creating...' : 'Create Escrow'}
              </Button>
            )}
          </Box>
        </form>
      </Dialog>

      <NewContactModal
        open={newClientModalOpen}
        onClose={() => setNewClientModalOpen(false)}
        onSave={handleNewClientSave}
        roleType="client"
        roleConfig={{ primary: '#4caf50', secondary: '#66bb6a' }}
      />
    </>
  );
};

export { NewEscrowModal };
export default NewEscrowModal;
