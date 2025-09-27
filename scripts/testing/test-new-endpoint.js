const express = require('express');
const app = express();
const escrowRoutes = require('./src/routes/escrow.routes.updated');

// Middleware
app.use(express.json());

// Use the updated routes
app.use('/api/v1', escrowRoutes);

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Test endpoint: GET http://localhost:3001/api/v1/escrows/ESC-TEST-001');
});