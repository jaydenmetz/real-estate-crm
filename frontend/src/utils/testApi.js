// Simple API test utility
import { API_BASE_URL, apiCall } from '../services/api.service.service';

export const testApiConnection = async () => {
  console.log('Testing API connection...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('Resolved API_BASE_URL:', API_BASE_URL);
  console.log('Current location:', window.location.hostname);
  
  try {
    // Test health endpoint
    const healthUrl = `${API_BASE_URL}/health`;
    console.log('Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl);
    const contentType = response.headers.get('content-type');
    
    console.log('Response status:', response.status);
    console.log('Response content-type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Health check successful:', data);
      return { success: true, data };
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      return { success: false, error: 'Non-JSON response', text };
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test escrow endpoint
export const testEscrowEndpoint = async (escrowId) => {
  console.log('Testing escrow endpoint...');
  
  try {
    const result = await apiCall(`/v1/escrows/${escrowId}`);
    console.log('Escrow fetch successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Escrow fetch failed:', error);
    return { success: false, error: error.message };
  }
};