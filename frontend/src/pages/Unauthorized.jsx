import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { logout, login } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Logout current user first
      await logout();

      // Login as admin
      const result = await authService.login('admin', password);

      if (result.success) {
        // Update auth context
        await login(result.user.token || result.token, result.user);

        // Redirect to admin panel
        navigate('/admin');
      } else {
        setError(result.error || 'Invalid admin password');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Failed to login as admin. Please check your password.');
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
            Admin Login
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            If you're an admin, enter the admin password to switch accounts:
          </Typography>

          <Box
            component="form"
            onSubmit={handleAdminLogin}
            sx={{ mb: 3 }}
          >
            <TextField
              fullWidth
              type="password"
              label="Admin Password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
              autoFocus
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
              disabled={loading || !password}
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
            Username for admin login: <strong>admin</strong>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Unauthorized;
