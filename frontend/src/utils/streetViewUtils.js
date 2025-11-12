/**
 * Google Street View Utilities
 * Generates Street View Static API URLs for property addresses
 *
 * Note: Requires REACT_APP_GOOGLE_MAPS_API_KEY in environment variables
 * Get your API key at: https://console.cloud.google.com/apis/credentials
 * Enable: Street View Static API
 */

/**
 * Generate Google Street View image URL for an address
 * @param {string} address - Full property address
 * @param {object} options - Optional configuration
 * @param {number} options.width - Image width (default: 600)
 * @param {number} options.height - Image height (default: 400)
 * @param {number} options.fov - Field of view in degrees (default: 90)
 * @param {number} options.heading - Compass heading (default: auto)
 * @param {number} options.pitch - Up/down angle (default: 0)
 * @returns {string} Street View image URL
 */
export function getStreetViewUrl(address, options = {}) {
  if (!address) return null;

  const {
    width = 600,
    height = 400,
    fov = 90,
    heading = null,
    pitch = 0
  } = options;

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // If no API key, return placeholder
  if (!apiKey) {
    console.warn('REACT_APP_GOOGLE_MAPS_API_KEY not set - using placeholder image');
    return getPlaceholderImage(address);
  }

  // Build Street View Static API URL
  const baseUrl = 'https://maps.googleapis.com/maps/api/streetview';
  const params = new URLSearchParams({
    size: `${width}x${height}`,
    location: address,
    fov: fov.toString(),
    pitch: pitch.toString(),
    key: apiKey
  });

  // Add optional heading if provided
  if (heading !== null) {
    params.append('heading', heading.toString());
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a placeholder image URL for properties without Street View
 * Creates a simple colored placeholder with the address initials
 * @param {string} address - Property address
 * @returns {string} Placeholder image URL (data URI or via placeholder service)
 */
function getPlaceholderImage(address) {
  // Extract initials from address (first letter of street number and name)
  const parts = address.split(/[\s,]+/);
  const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

  // Use a placeholder service like via.placeholder.com or ui-avatars.com
  const bgColor = '10b981'; // Green color
  const textColor = 'ffffff';

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=600&background=${bgColor}&color=${textColor}&bold=true&format=svg`;
}

/**
 * Get the best available image URL for a property
 * Priority: property_image_url > zillow_image_url > street view > placeholder
 * @param {object} escrow - Escrow object with image URLs and address
 * @returns {string} Best available image URL
 */
export function getBestPropertyImage(escrow) {
  // Priority 1: Uploaded property image
  if (escrow.property_image_url || escrow.propertyImageUrl) {
    return escrow.property_image_url || escrow.propertyImageUrl;
  }

  // Priority 2: Zillow image
  if (escrow.zillow_image_url || escrow.zillowImageUrl) {
    return escrow.zillow_image_url || escrow.zillowImageUrl;
  }

  // Priority 3: Street View (if address exists)
  // Build full address with city, state, zip for accurate Street View
  const streetAddress = escrow.property_address || escrow.propertyAddress;
  const city = escrow.city;
  const state = escrow.state;
  const zipCode = escrow.zip_code || escrow.zipCode;

  if (streetAddress) {
    // Build complete address for Street View (e.g., "616 42nd St, Bakersfield, CA 93301")
    let fullAddress = streetAddress;
    if (city && state) {
      fullAddress = `${streetAddress}, ${city}, ${state}`;
      if (zipCode) {
        fullAddress += ` ${zipCode}`;
      }
    }

    return getStreetViewUrl(fullAddress, {
      width: 800,
      height: 600,
      fov: 90,
      pitch: 10 // Slight upward angle for better building view
    });
  }

  // Priority 4: Placeholder
  return getPlaceholderImage(streetAddress || 'Property');
}

export default {
  getStreetViewUrl,
  getBestPropertyImage
};
