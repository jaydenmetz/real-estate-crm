import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Initialize network monitoring as early as possible
import './services/networkMonitor';

// Force immediate network monitor initialization for production admin users
if (typeof window !== 'undefined') {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.username === 'admin') {
      // Import and enable immediately for admin users
      import('./services/networkMonitor').then(module => {
        const networkMonitor = module.default;
        networkMonitor.enable();
        console.log('🔍 Production: Network Monitor force-enabled for admin user in index.js');
      });
    }
  } catch (e) {
    // Silent fail
  }
}

// Debug environment variables in production
console.log('🔧 Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_WS_URL: process.env.REACT_APP_WS_URL
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);