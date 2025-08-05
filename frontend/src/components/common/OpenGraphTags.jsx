import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Component to add Open Graph tags to your pages
 * This makes your property links show nice previews when shared
 */
const OpenGraphTags = ({ property }) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://yourcrm.com';
  const defaultImage = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=630&fit=crop';
  
  return (
    <Helmet>
      {/* Open Graph tags */}
      <meta property="og:title" content={`${property.propertyAddress} - ${property.city}, ${property.state}`} />
      <meta property="og:description" content={`${property.bedrooms || ''}BR/${property.bathrooms || ''}BA home listed at $${property.purchasePrice?.toLocaleString()}. ${property.squareFeet ? `${property.squareFeet} sq ft.` : ''}`} />
      <meta property="og:image" content={property.propertyImage || defaultImage} />
      <meta property="og:url" content={`${baseUrl}/escrows/${property.id}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Real Estate CRM" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${property.propertyAddress} - ${property.city}, ${property.state}`} />
      <meta name="twitter:description" content={`${property.bedrooms || ''}BR home listed at $${property.purchasePrice?.toLocaleString()}`} />
      <meta name="twitter:image" content={property.propertyImage || defaultImage} />
      
      {/* Standard meta tags */}
      <title>{property.propertyAddress} - Property Details</title>
      <meta name="description" content={`View details for ${property.propertyAddress}, ${property.city}, ${property.state}`} />
    </Helmet>
  );
};

export default OpenGraphTags;