// Utility to load Google Maps API script dynamically
let isLoading = false;
let isLoaded = false;
let loadPromise = null;

export const loadGoogleMapsScript = () => {
  // If already loaded, return immediately
  if (isLoaded && window.google?.maps?.places) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;

  loadPromise = new Promise((resolve, reject) => {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

      if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY_HERE') {
        isLoading = false;
        reject(new Error('Google Maps API key not configured'));
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for it to load
        existingScript.addEventListener('load', () => {
          isLoaded = true;
          isLoading = false;
          resolve();
        });
        existingScript.addEventListener('error', () => {
          isLoading = false;
          reject(new Error('Failed to load Google Maps script'));
        });
        return;
      }

      // Create and append script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.addEventListener('load', () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      });

      script.addEventListener('error', () => {
        isLoading = false;
        reject(new Error('Failed to load Google Maps script'));
      });

      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = () => {
  return isLoaded && window.google?.maps?.places;
};