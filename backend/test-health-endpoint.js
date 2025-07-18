const express = require('express');
const healthRoutes = require('./src/routes/health.routes');

const app = express();
app.use('/api/v1', healthRoutes);

const PORT = 3002;
const server = app.listen(PORT, () => {
  console.log(`Health check endpoint running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/v1/health/escrow-system`);
  
  // Make a test request
  const http = require('http');
  http.get(`http://localhost:${PORT}/api/v1/health/escrow-system`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('\nHealth Check Response:');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
      server.close();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('Error:', err);
    server.close();
    process.exit(1);
  });
});