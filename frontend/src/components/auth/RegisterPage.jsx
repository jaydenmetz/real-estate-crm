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
  Phone as PhoneIcon,
  Home,
  ArrowBack,
  ArrowForward,
  CheckCircleOutline,
} from '@mui/icons-material';
import { Google } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const RegisterPage = ({ hasGoogleAuth = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [usernameReadonly, setUsernameReadonly] = useState(true);

  const steps = ['Your Information', 'Create Account'];

  const { control, handleSubmit, watch, formState: { errors }, trigger, setValue } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    }
  });

  const password = watch('password');
  const phone = watch('phone');

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    if (!value) return value;

    // Remove all non-digits
    const phoneNumber = value.replace(/[^\d]/g, '');

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length < 4) {
      return phoneNumber;
    } else if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (onChange) => (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  const handleNext = async () => {
    let fieldsToValidate = [];

    if (activeStep === 0) {
      fieldsToValidate = ['firstName', 'lastName', 'phone', 'email'];

      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        // Move to next step (no need to create lead since registration captures all data)
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      fieldsToValidate = ['username', 'password', 'confirmPassword'];

      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        handleSubmit(onSubmit)();
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
      const endpoint = apiUrl.includes('/v1') ? `${apiUrl}/auth/register` : `${apiUrl}/v1/auth/register`;

      // Get unformatted phone number
      const rawPhone = data.phone.replace(/[^\d]/g, '');

      const response = await fetch(endpoint, {
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
          phone: rawPhone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.data?.token) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));

          // Redirect to onboarding tutorial
          setTimeout(() => {
            navigate('/onboarding/welcome');
          }, 500);
        }
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
      const endpoint = apiUrl.includes('/v1') ? `${apiUrl}/auth/google` : `${apiUrl}/v1/auth/google`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user info
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        // Use the login function from AuthContext if available
        if (login) {
          await login(result.data.token, result.data.user);
        }

        // Redirect to onboarding tutorial for new users
        setTimeout(() => {
          navigate('/onboarding/welcome');
        }, 500);
      } else {
        setError(result.error?.message || 'Google sign-in failed');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('An error occurred during Google sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Tell us about yourself
            </Typography>

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
              name="phone"
              control={control}
              rules={{
                required: 'Phone number is required',
                pattern: {
                  value: /^\(\d{3}\) \d{3}-\d{4}$/,
                  message: 'Phone must be in format (XXX) XXX-XXXX'
                }
              }}
              render={({ field: { onChange, value, ...field } }) => (
                <TextField
                  {...field}
                  value={value}
                  onChange={handlePhoneChange(onChange)}
                  fullWidth
                  label="Phone Number"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone?.message || 'Format: (XXX) XXX-XXXX'}
                  disabled={loading}
                  placeholder="(555) 123-4567"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                  autoComplete="tel"
                  inputProps={{
                    maxLength: 14, // (XXX) XXX-XXXX = 14 characters
                  }}
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
                  label="Email Address"
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
          </>
        );

      case 1:
        return (
          <>
            {/* Hidden dummy fields to prevent browser autofill - must be first */}
            <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}>
              <input type="text" name="fake-username" tabIndex="-1" autoComplete="off" />
              <input type="password" name="fake-password" tabIndex="-1" autoComplete="new-password" />
            </div>

            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Create your account credentials
            </Typography>

            <Alert severity="success" sx={{ mb: 2 }}>
              Great! We've saved your information. Now let's set up your login credentials.
            </Alert>

            <Controller
              name="username"
              control={control}
              rules={{
                required: 'Username is required',
                pattern: {
                  value: /^[a-zA-Z0-9_]{3,20}$/,
                  message: 'Username must be 3-20 characters (letters, numbers, underscore only)'
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
                  helperText={errors.username?.message || 'This will be your login username'}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                    readOnly: usernameReadonly,
                  }}
                  onFocus={() => setUsernameReadonly(false)}
                  inputProps={{
                    autoComplete: "off",
                    name: "registration-username-field",
                    id: "registration-username-unique"
                  }}
                  autoFocus
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
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number'
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
                  helperText={errors.password?.message || 'Min 8 characters, uppercase, lowercase, number'}
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
                  inputProps={{
                    autoComplete: "new-password",
                    name: "registration-password-field",
                    id: "registration-password-unique"
                  }}
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
                  type={showConfirmPassword ? 'text' : 'password'}
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    autoComplete: "new-password",
                    name: "registration-confirm-password-field",
                    id: "registration-confirm-password-unique"
                  }}
                />
              )}
            />
          </>
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
              Get Started
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join thousands of real estate professionals
            </Typography>
          </Box>

          {/* Google Sign-In Button */}
          {activeStep === 0 && hasGoogleAuth && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                  or
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
            </Box>
          )}

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {renderStepContent()}

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={activeStep === 0 ? <ArrowForward /> : (loading ? <CircularProgress size={20} /> : <CheckCircleOutline />)}
                sx={{
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5568d3 0%, #66438e 100%)',
                  }
                }}
              >
                {activeStep === 0 ? 'Continue' : (loading ? 'Creating Account...' : 'Create Account')}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />

          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
            © 2025 Real Estate CRM. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// Wrap with GoogleOAuthProvider
const RegisterPageWithGoogle = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn('Google Client ID not configured. Google Sign-In will not work.');
    return <RegisterPage hasGoogleAuth={false} />;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <RegisterPage hasGoogleAuth={true} />
    </GoogleOAuthProvider>
  );
};

export default RegisterPageWithGoogle;
