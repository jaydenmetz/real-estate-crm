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
  MenuItem,
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
  Route,
  Group,
} from '@mui/icons-material';
import { appointmentsAPI, leadsAPI } from '../../../../services/api.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { loadGoogleMapsScript } from '../../../../utils/googleMapsLoader';
import PrivacyControl from '../../../common/settings/PrivacyControl';
import { EditStops, EditAttendees } from '../editors';

// Appointment types for selection
const APPOINTMENT_TYPES = [
  { value: 'showing', label: 'Showing' },
  { value: 'open_house', label: 'Open House' },
  { value: 'listing_presentation', label: 'Listing Presentation' },
  { value: 'buyer_consultation', label: 'Buyer Consultation' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'appraisal', label: 'Appraisal' },
  { value: 'closing', label: 'Closing' },
  { value: 'walkthrough', label: 'Walkthrough' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
];

const NewAppointmentModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Get user's location preferences with fallback to Bakersfield
  const userCity = user?.home_city || 'Bakersfield';
  const userState = user?.home_state || 'CA';

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    appointmentType: 'showing',
    stops: [{
      stop_order: 1,
      location_address: '',
      city: '',
      state: '',
      zip_code: '',
      scheduled_time: '09:00',
      estimated_duration: 30,
    }],
    attendees: [],
    isPrivate: false,
    accessLevel: 'team',
  });

  // Steps for the multi-step wizard
  const steps = [
    { label: 'Schedule', icon: Schedule, color: '#1976d2' },
    { label: 'Stops', icon: Route, color: '#9c27b0' },
    { label: 'Attendees', icon: Group, color: '#f57c00' },
    { label: 'Privacy', icon: Lock, color: '#d32f2f' },
    { label: 'Review', icon: CheckCircle, color: '#388e3c' }
  ];

  // Calculate total duration from all stops
  const getTotalDuration = () => {
    return formData.stops.reduce((sum, stop) => sum + (stop.estimated_duration || 30), 0);
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (!minutes) return '30 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time || formData.stops.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate at least one stop has an address
    if (!formData.stops.some(stop => stop.location_address)) {
      setError('Please add at least one location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const appointmentDateTime = `${formData.date}T${formData.time}:00`;

      // Get first stop for primary location
      const firstStop = formData.stops[0];

      const appointmentData = {
        scheduledDate: appointmentDateTime,
        location: firstStop.location_address,
        city: firstStop.city,
        state: firstStop.state,
        zip_code: firstStop.zip_code,
        status: 'scheduled',
        type: formData.appointmentType,
        duration: getTotalDuration(),
        isPrivate: formData.isPrivate,
        accessLevel: formData.accessLevel,
        // Include stops for multi-stop appointments
        stops: formData.stops,
        // Include attendees
        attendees: formData.attendees,
      };

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
        appointmentType: 'showing',
        stops: [{
          stop_order: 1,
          location_address: '',
          city: '',
          state: '',
          zip_code: '',
          scheduled_time: '09:00',
          estimated_duration: 30,
        }],
        attendees: [],
        isPrivate: false,
        accessLevel: 'team',
      });
      setError('');
      setCurrentStep(0);
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
      if (!formData.stops.some(stop => stop.location_address)) {
        setError('Please add at least one location');
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

  // Handle stops update from EditStops component
  const handleStopsUpdate = (newStops) => {
    setFormData(prev => ({
      ...prev,
      stops: newStops,
    }));
  };

  // Handle attendees update from EditAttendees component
  const handleAttendeesUpdate = (newAttendees) => {
    setFormData(prev => ({
      ...prev,
      attendees: newAttendees,
    }));
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

  // Get primary attendee name for review
  const getPrimaryAttendeeName = () => {
    const primary = formData.attendees.find(a => a.is_primary);
    if (primary) return primary.display_name;
    if (formData.attendees.length > 0) return formData.attendees[0].display_name;
    return null;
  };

  // Get first stop address for review
  const getFirstStopAddress = () => {
    if (formData.stops.length === 0) return 'No location set';
    const firstStop = formData.stops[0];
    const parts = [
      firstStop.location_address,
      firstStop.city,
      firstStop.state,
      firstStop.zip_code,
    ].filter(Boolean);
    return parts.join(', ') || 'No location set';
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

            {/* Step 0: Schedule (Date, Time, Type) */}
            {currentStep === 0 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    select
                    label="Appointment Type"
                    value={formData.appointmentType}
                    onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                    helperText="What type of appointment is this?"
                  >
                    {APPOINTMENT_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                    helperText="Select the appointment date"
                  />

                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                    helperText="Select the appointment start time"
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

            {/* Step 1: Stops (Multi-stop locations) */}
            {currentStep === 1 && (
              <Fade in timeout={400}>
                <Box>
                  <EditStops
                    open={true}
                    value={formData.stops}
                    data={{
                      start_time: formData.time,
                      location: formData.stops[0]?.location_address || '',
                    }}
                    onSave={handleStopsUpdate}
                    inline={true}
                    color="#9c27b0"
                  />
                </Box>
              </Fade>
            )}

            {/* Step 2: Attendees */}
            {currentStep === 2 && (
              <Fade in timeout={400}>
                <Box>
                  <EditAttendees
                    open={true}
                    value={formData.attendees}
                    data={{}}
                    onSave={handleAttendeesUpdate}
                    inline={true}
                    color="#f57c00"
                  />
                </Box>
              </Fade>
            )}

            {/* Step 3: Privacy */}
            {currentStep === 3 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Configure privacy settings for this appointment
                  </Typography>

                  <PrivacyControl
                    isPrivate={formData.isPrivate}
                    accessLevel={formData.accessLevel}
                    onPrivateChange={(value) => setFormData({ ...formData, isPrivate: value })}
                    onAccessLevelChange={(value) => setFormData({ ...formData, accessLevel: value })}
                  />
                </Box>
              </Fade>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Fade in timeout={400}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Type & Schedule */}
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
                          {APPOINTMENT_TYPES.find(t => t.value === formData.appointmentType)?.label || 'Appointment'}
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {formatDateTime()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {formatDuration(getTotalDuration())}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Stops */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #9c27b020, #e91e6320)',
                      border: '2px solid #9c27b0',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                      <Route sx={{ color: '#9c27b0', fontSize: 28 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {formData.stops.length} {formData.stops.length === 1 ? 'Stop' : 'Stops'}
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                          {getFirstStopAddress()}
                        </Typography>
                        {formData.stops.length > 1 && (
                          <Typography variant="body2" color="text.secondary">
                            + {formData.stops.length - 1} more stops
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Attendees */}
                  {formData.attendees.length > 0 && (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f57c0020, #ff980020)',
                        border: '2px solid #f57c00',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <Group sx={{ color: '#f57c00', fontSize: 28 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formData.attendees.length} {formData.attendees.length === 1 ? 'Attendee' : 'Attendees'}
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {getPrimaryAttendeeName() || 'No attendees'}
                          </Typography>
                          {formData.attendees.length > 1 && (
                            <Typography variant="body2" color="text.secondary">
                              + {formData.attendees.length - 1} more
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Privacy */}
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
