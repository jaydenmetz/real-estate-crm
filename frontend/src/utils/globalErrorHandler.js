// Global error handler for catching render errors
export const setupGlobalErrorHandlers = () => {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Check if it's a React-related error
    if (event.reason && event.reason.stack && event.reason.stack.includes('react')) {
      console.error('React-related unhandled rejection detected');
    }
  });

  // Override console.error to catch React errors
  const originalError = console.error;
  console.error = (...args) => {
    // Check for the specific "Cannot read properties of undefined (reading 'style')" error
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes("Cannot read properties of undefined (reading 'style')")) {
        console.warn('🔍 Caught style error - this often happens with render prop issues');
        console.trace('Style error trace:');
      }
      
      // Check for render prop errors
      if (args[0].includes('children is not a function') || 
          args[0].includes('children()')) {
        console.warn('🔍 Caught render prop error - a component is trying to call children as a function');
        console.trace('Render prop error trace:');
      }
    }
    
    // Call original console.error
    originalError.apply(console, args);
  };
};

// Helper to safely render children
export const safeRenderChildren = (children) => {
  if (!children) return null;
  
  // Handle function children (render props)
  if (typeof children === 'function') {
    try {
      return children();
    } catch (error) {
      console.error('Error calling children function:', error);
      return null;
    }
  }
  
  return children;
};