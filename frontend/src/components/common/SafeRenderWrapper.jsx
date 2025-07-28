import React from 'react';

/**
 * SafeRenderWrapper - A component that safely handles different types of children
 * including render props, regular elements, and edge cases
 */
const SafeRenderWrapper = ({ children, fallback = null }) => {
  try {
    // Handle null/undefined children
    if (children == null) {
      return fallback;
    }

    // Handle function children (render props)
    if (typeof children === 'function') {
      const result = children();
      // Ensure the function returns a valid React element
      if (React.isValidElement(result) || result == null) {
        return result;
      }
      console.warn('Render prop did not return a valid React element:', result);
      return fallback;
    }

    // Handle regular React elements
    if (React.isValidElement(children)) {
      return children;
    }

    // Handle arrays of elements
    if (Array.isArray(children)) {
      return <>{children}</>;
    }

    // Handle strings and numbers
    if (typeof children === 'string' || typeof children === 'number') {
      return children;
    }

    // Fallback for unexpected types
    console.warn('SafeRenderWrapper received unexpected children type:', typeof children, children);
    return fallback;
  } catch (error) {
    console.error('SafeRenderWrapper caught rendering error:', error);
    return fallback;
  }
};

export default SafeRenderWrapper;