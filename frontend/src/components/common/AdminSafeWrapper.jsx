import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A wrapper component that provides extra safety checks for admin-specific rendering
 * This helps debug and prevent style-related errors that only affect admin users
 */
const AdminSafeWrapper = ({ children, fallback = null }) => {
  const { user, isAdmin: isAdminFn } = useAuth();
  // PHASE 3: Use AuthContext isAdmin() instead of hardcoded username check
  const isAdmin = isAdminFn();

  // Log for debugging
  if (isAdmin && process.env.NODE_ENV === 'development') {
    // // console.log('AdminSafeWrapper rendering for admin user');
  }

  try {
    // Handle different types of children
    if (!children) {
      return fallback;
    }

    // If children is a function (render prop)
    if (typeof children === 'function') {
      try {
        const result = children({ isAdmin });
        return result || fallback;
      } catch (error) {
        console.error('AdminSafeWrapper: Error calling children function:', error);
        return fallback;
      }
    }

    // If children is a React element or array of elements
    if (React.isValidElement(children) || Array.isArray(children)) {
      return <>{children}</>;
    }

    // For any other type, return as-is
    return children;
  } catch (error) {
    console.error('AdminSafeWrapper: Unexpected error:', error);
    return fallback;
  }
};

export default AdminSafeWrapper;