const http = require('http');

const data = JSON.stringify({
  username: 'admin',
  password: 'Password123!'
});

const options = {
  hostname: 'localhost',
  port: 5050,
  path: '/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      console.log('Response:', JSON.stringify(response, null, 2));
      if (response.success && response.data && response.data.token) {
        console.log('\nToken:', response.data.token);
      }
    } catch (e) {
      console.log('Raw response:', body);
    }
  });
});

req.on('error', console.error);
req.write(data);
req.end();