import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  Lock as LockIcon,
  Home as HomeIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth.service';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the page the user was trying to access (if any)
  const from = location.state?.from?.pathname || '/admin';

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Logout current user first (if any)
      try {
        await logout();
      } catch (logoutErr) {
        // // console.log('Logout error (may already be logged out):', logoutErr);
      }

      // // console.log('Attempting admin login with email:', email);

      // Login with provided credentials
      const result = await authService.login(email, password);

      // // console.log('Login result:', result);

      if (result.success) {
        // // console.log('Login successful, user:', result.user);

        // Check if logged-in user has system_admin role
        // This check happens on backend via ProtectedRoute's server-side verification
        // We verify the role here too for immediate feedback
        if (result.user.role !== 'system_admin') {
          setError('Access denied. Only system administrators can access this page.');
          // Logout the non-admin user
          await logout();
          return;
        }

        // Update auth context with user data
        login(result.user);

        // // console.log('System admin verified, navigating to:', from);
        // Redirect to the page the user was trying to access
        // ProtectedRoute will do server-side verification as well
        navigate(from, { replace: true });
      } else {
        console.error('Login failed:', result.error);
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(`Login failed: ${err.message || 'Please check your credentials.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.98)'
          }}
        >
          {/* Lock Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <LockIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          {/* Title */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You don't have permission to access this page.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Admin Login Section */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Admin Login Required
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please login with a system administrator account to continue:
          </Typography>

          <Box
            component="form"
            onSubmit={handleAdminLogin}
            sx={{ mb: 3 }}
          >
            {/* Admin Username/Email */}
            <TextField
              fullWidth
              label="Admin Username"
              placeholder="Enter admin username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              autoFocus
              autoComplete="username"
            />

            {/* Admin Password */}
            <TextField
              fullWidth
              type="password"
              label="Admin Password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              autoComplete="current-password"
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !email || !password}
              startIcon={<LoginIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)'
                }
              }}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="textSecondary">
              OR
            </Typography>
          </Divider>

          {/* Go Home Button */}
          <Button
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{ mb: 2 }}
          >
            Go to Home Page
          </Button>

          <Typography variant="caption" color="textSecondary" display="block">
            Only users with <strong>system_admin</strong> role can access this page
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Unauthorized;
