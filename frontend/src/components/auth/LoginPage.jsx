import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Link,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Home,
  Business,
  Shield,
  Speed,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import authService from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { createApiKey } from '../../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: true,
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(data.username, data.password, data.rememberMe);
      
      if (result.success) {
        // Update auth context
        login(result.user);
        
        // Try to create an API key for more reliable authentication
        try {
          const apiKeyResult = await createApiKey('Web Session', 365);
          console.log('API key created for session:', apiKeyResult.key_prefix);
        } catch (apiKeyError) {
          // API key creation failed, but JWT login succeeded
          console.warn('Could not create API key, using JWT only:', apiKeyError);
        }
        
        // Navigate to previous page or default dashboard
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
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
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Home sx={{ fontSize: 48, color: 'primary.main' }} />
            </Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Real Estate CRM
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your real estate business
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Controller
              name="username"
              control={control}
              rules={{ required: 'Username is required' }}
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
              name="password"
              control={control}
              rules={{ required: 'Password is required' }}
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
                  autoComplete="current-password"
                />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 3 }}>
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        disabled={loading}
                        color="primary"
                      />
                    }
                    label="Remember me"
                  />
                )}
              />
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement forgot password
                }}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ py: 1.5, mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          {/* Register Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component="a" href="/register" sx={{ textDecoration: 'none' }}>
                Create one
              </Link>
            </Typography>
          </Box>

          {/* Features */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Business sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="caption" display="block">
                    Manage Properties
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Shield sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="caption" display="block">
                    Secure & Private
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Speed sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="caption" display="block">
                    AI-Powered
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Home sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="caption" display="block">
                    Real Estate CRM
                  </Typography>
                </Box>
              </Grid>
            </Grid>
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

export default LoginPage;