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
  Fade,
  Chip,
} from '@mui/material';
import debounce from 'lodash/debounce';
import {
  Close,
  Event,
  LocationOn,
  PersonAdd,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Schedule,
  Lock,
} from '@mui/icons-material';
import { appointmentsAPI, leadsAPI } from '../../../../services/api.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { loadGoogleMapsScript } from '../../../../utils/googleMapsLoader';
import PrivacyControl from '../../../common/PrivacyControl';

const NewAppointmentModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadSearchText, setLeadSearchText] = useState('');
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
    date: new Date().toISOString().split('T')[0],
    time: '09:00', // Default to 9 AM
    location: '',
    linkedLeadId: null,
    isPrivate: false,
    accessLevel: 'team',
  });

  const steps = [
    { label: 'Schedule', icon: Schedule, color: '#1976d2' },
    { label: 'Location', icon: LocationOn, color: '#9c27b0' },
    { label: 'Lead & Privacy', icon: PersonAdd, color: '#f57c00' },
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

  // Fetch leads when modal opens
  useEffect(() => {
    if (open) {
      fetchLeads();
    }
  }, [open]);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await leadsAPI.getAll();
      if (response.success) {
        setLeads(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoadingLeads(false);
    }
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
        types: ['establishment', 'geocode'],
        locationBias: new window.google.maps.Circle({
          center: { lat: userLat, lng: userLng },
          radius: searchRadius * 1609.34
        })
      };

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions = predictions.map(prediction => ({
            label: prediction.description,
            value: prediction.description,
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
          const suggestions = data.map(item => ({
            label: item.display_name,
            value: item.display_name,
          }));
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
    setFormData(prev => ({
      ...prev,
      location: value.value,
    }));
    setAddressSearchText(value.value);
    resetSessionToken();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const appointmentDateTime = `${formData.date}T${formData.time}:00`;

      const appointmentData = {
        scheduledDate: appointmentDateTime,
        location: formData.location,
        status: 'scheduled',
        type: 'showing',
        isPrivate: formData.isPrivate,
        accessLevel: formData.accessLevel,
      };

      if (formData.linkedLeadId) {
        appointmentData.leadId = formData.linkedLeadId;
      }

      const response = await appointmentsAPI.create(appointmentData);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data.id);
        }
        handleClose();
      } else {
        setError(response.error?.message || 'Failed to create appointment');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('An error occurred while creating the appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        linkedLeadId: null,
        isPrivate: false,
        accessLevel: 'team',
      });
      setSelectedAddress(null);
      setAddressSuggestions([]);
      setAddressSearchText('');
      setLeadSearchText('');
      setError('');
      setCurrentStep(0);
      resetSessionToken();
      onClose();
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 0) {
      if (!formData.date || !formData.time) {
        setError('Please select both date and time');
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.location) {
        setError('Please enter a location');
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

  const formatDateTime = () => {
    if (!formData.date || !formData.time) return 'Not set';
    const date = new Date(`${formData.date}T${formData.time}`);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSelectedLead = () => {
    if (!formData.linkedLeadId) return null;
    return leads.find(lead => lead.id === formData.linkedLeadId);
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
                Create New Appointment
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

            {/* Step 0: Schedule (Date & Time) */}
            {currentStep === 0 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                    autoFocus
                    helperText="Select the appointment date"
                  />

                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                    helperText="Select the appointment time (default: 9:00 AM)"
                  />

                  {formData.date && formData.time && (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1976d220, #2196f320)',
                        border: '2px solid #1976d2',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Scheduled For
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formatDateTime()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Fade>
            )}

            {/* Step 1: Location */}
            {currentStep === 1 && (
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
                        label="Location"
                        fullWidth
                        placeholder="Start typing a location..."
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
                        : "No locations found"
                    }
                  />
                </Box>
              </Fade>
            )}

            {/* Step 2: Lead & Privacy */}
            {currentStep === 2 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Autocomplete
                    options={leads}
                    loading={loadingLeads}
                    inputValue={leadSearchText}
                    onInputChange={(e, value) => setLeadSearchText(value)}
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
                        label="Link to Lead (optional)"
                        placeholder="Search by name or email..."
                        helperText="Optionally link this appointment to a lead"
                      />
                    )}
                    onChange={(e, value) => setFormData({ ...formData, linkedLeadId: value?.id || null })}
                    noOptionsText=""
                    ListboxProps={{ sx: { maxHeight: 300 } }}
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
                      <Schedule sx={{ color: '#1976d2', fontSize: 28 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Scheduled For
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {formatDateTime()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #9c27b020, #e91e6320)',
                      border: '2px solid #9c27b0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                      <LocationOn sx={{ color: '#9c27b0', fontSize: 28 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Location
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {formData.location || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {formData.linkedLeadId && getSelectedLead() && (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f57c0020, #ff980020)',
                        border: '2px solid #f57c00',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <PersonAdd sx={{ color: '#f57c00', fontSize: 28 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Linked Lead
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {getSelectedLead().firstName} {getSelectedLead().lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getSelectedLead().email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {formData.isPrivate && (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #d32f2f20, #f4433620)',
                        border: '2px solid #d32f2f',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <Lock sx={{ color: '#d32f2f', fontSize: 28 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Privacy
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            Private Appointment
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            Access Level: {formData.accessLevel}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
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
                {loading ? 'Creating...' : 'Create Appointment'}
              </Button>
            )}
          </Box>
        </form>
      </Dialog>
    </>
  );
};

export default NewAppointmentModal;
