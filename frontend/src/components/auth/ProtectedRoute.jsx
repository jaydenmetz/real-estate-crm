import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import apiInstance from '../../services/api.service';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [verifying, setVerifying] = useState(!!requiredRole);
  const [authorized, setAuthorized] = useState(false);

  // PHASE 3.5: Verify role with backend (cannot be bypassed by localStorage modification)
  useEffect(() => {
    const verifyRole = async () => {
      // If no role required, authorize immediately
      if (!requiredRole) {
        setAuthorized(true);
        setVerifying(false);
        return;
      }

      try {
        // Call backend to verify role (checks JWT token, not localStorage)
        // Pass params directly as second argument (apiInstance.get handles query string conversion)
        const response = await apiInstance.get('/auth/verify-role', { requiredRole });

        if (response.success && response.data.authorized) {
          // // console.log(`✅ Role verified: ${response.data.userRole} === ${requiredRole}`);
          setAuthorized(true);
        } else {
          console.warn(`❌ Role verification failed: ${response.data.userRole} !== ${requiredRole}`);
          setAuthorized(false);
        }
      } catch (error) {
        console.error('Role verification error:', error);
        setAuthorized(false);
      } finally {
        setVerifying(false);
      }
    };

    if (isAuthenticated && requiredRole) {
      verifyRole();
    } else if (!requiredRole) {
      setAuthorized(true);
      setVerifying(false);
    }
  }, [isAuthenticated, requiredRole]);

  // Show loading spinner while checking auth or verifying role
  if (loading || verifying) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // PHASE 3.5: Check server-verified role (not localStorage)
  if (requiredRole && !authorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;