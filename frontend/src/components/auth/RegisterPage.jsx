import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Link,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  Phone,
  Home,
  AppRegistration,
  ArrowBack,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import authService from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Account Details', 'Personal Information', 'Complete Setup'];

  const { control, handleSubmit, watch, formState: { errors }, trigger } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
    }
  });

  const password = watch('password');

  const handleNext = async () => {
    let fieldsToValidate = [];
    
    if (activeStep === 0) {
      fieldsToValidate = ['username', 'email', 'password', 'confirmPassword'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['firstName', 'lastName'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (activeStep === steps.length - 1) {
        handleSubmit(onSubmit)();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com'}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          phone: data.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        authService.token = result.data.token;
        authService.user = result.data.user;
        authService.apiKey = result.data.user.apiKey;
        
        localStorage.setItem('crm_auth_token', result.data.token);
        localStorage.setItem('crm_user_data', JSON.stringify(result.data.user));
        if (result.data.user.apiKey) {
          localStorage.setItem('crm_api_key', result.data.user.apiKey);
        }
        
        authService.setAuthHeader(result.data.token);
        
        // Update auth context
        login(result.data.user);
        
        // Navigate to dashboard
        navigate('/', { replace: true });
      } else {
        setError(result.error?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Controller
              name="username"
              control={control}
              rules={{ 
                required: 'Username is required',
                pattern: {
                  value: /^[a-zA-Z0-9_]{3,20}$/,
                  message: 'Username must be 3-20 characters, alphanumeric and underscore only'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="username"
                  autoFocus
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{ 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="email"
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="new-password"
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{ 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="new-password"
                />
              )}
            />
          </>
        );

      case 1:
        return (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    margin="normal"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={loading}
                    autoComplete="given-name"
                    autoFocus
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    margin="normal"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={loading}
                    autoComplete="family-name"
                  />
                )}
              />
            </Box>

            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Company Name (Optional)"
                  variant="outlined"
                  margin="normal"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="organization"
                />
              )}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone Number (Optional)"
                  variant="outlined"
                  margin="normal"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="tel"
                />
              )}
            />
          </>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" gutterBottom>
              Ready to Get Started!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your account is ready to be created with the following details:
            </Typography>
            
            <Box sx={{ my: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Username:</strong> {watch('username')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {watch('email')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Name:</strong> {watch('firstName')} {watch('lastName')}
              </Typography>
              {watch('company') && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Company:</strong> {watch('company')}
                </Typography>
              )}
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              You'll receive admin privileges with full access to all features.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Home sx={{ fontSize: 48, color: 'primary.main' }} />
            </Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Create Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set up your Real Estate CRM admin account
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {renderStepContent()}

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={activeStep === steps.length - 1 ? 
                  (loading ? <CircularProgress size={20} /> : <AppRegistration />) : 
                  null
                }
              >
                {activeStep === steps.length - 1 ? 
                  (loading ? 'Creating Account...' : 'Create Account') : 
                  'Next'
                }
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />

          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
            © 2025 Metz Real Estate CRM. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;