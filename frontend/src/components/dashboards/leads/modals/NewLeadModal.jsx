import React, { useState } from 'react';
import {
  Dialog,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Fade,
} from '@mui/material';
import {
  Close,
  PersonAdd,
  Security,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Phone,
  Email,
} from '@mui/icons-material';
import { leadsAPI } from '../../../../services/api.service';
import PrivacyControl from '../../../common/settings/PrivacyControl';

const NewLeadModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    isPrivate: false,
    accessLevel: 'team',
  });

  const steps = [
    { label: 'Contact Info', icon: PersonAdd, color: '#1976d2' },
    { label: 'Privacy', icon: Security, color: '#9c27b0' },
    { label: 'Review', icon: CheckCircle, color: '#388e3c' }
  ];

  // Phone formatting: (XXX) XXX-XXXX
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const leadData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone,
        email: formData.email.trim().toLowerCase(),
        status: 'new',
        source: 'manual',
        isPrivate: formData.isPrivate,
        accessLevel: formData.accessLevel,
      };

      const response = await leadsAPI.create(leadData);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data.id);
        }
        handleClose();
      } else {
        setError(response.error?.message || 'Failed to create lead');
      }
    } catch (err) {
      console.error('Error creating lead:', err);
      setError('An error occurred while creating the lead');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
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
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
        setError('Please complete all contact fields');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
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

  const StepIcon = steps[currentStep].icon;

  return (
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
              Create New Lead
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

          {/* Step 0: Contact Info */}
          {currentStep === 0 && (
            <Fade in timeout={400}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    autoFocus
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    sx={{ flex: 1 }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Phone"
                  placeholder="(555) 555-5555"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  helperText="10-digit phone number"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  helperText="Valid email address"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Box>
            </Fade>
          )}

          {/* Step 1: Privacy */}
          {currentStep === 1 && (
            <Fade in timeout={400}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <PrivacyControl
                  isPrivate={formData.isPrivate}
                  accessLevel={formData.accessLevel}
                  onPrivateChange={(value) => setFormData({ ...formData, isPrivate: value })}
                  onAccessLevelChange={(value) => setFormData({ ...formData, accessLevel: value })}
                />
              </Box>
            </Fade>
          )}

          {/* Step 2: Review */}
          {currentStep === 2 && (
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
                    <PersonAdd sx={{ color: '#1976d2', fontSize: 28 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Contact Name
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {formData.firstName} {formData.lastName}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Phone sx={{ color: '#9c27b0', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="600">
                      {formData.phone || 'Not provided'}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Email sx={{ color: '#9c27b0', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="600">
                      {formData.email || 'Not provided'}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Security sx={{ color: '#388e3c', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Privacy Settings
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="600">
                    {formData.isPrivate ? 'Private (Only Me)' : `Shared (${formData.accessLevel === 'team' ? 'Team' : 'Brokerage'})`}
                  </Typography>
                </Box>
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
              {loading ? 'Creating...' : 'Create Lead'}
            </Button>
          )}
        </Box>
      </form>
    </Dialog>
  );
};

export default NewLeadModal;
