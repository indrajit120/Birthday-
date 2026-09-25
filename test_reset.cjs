const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/factory-reset',
  method: 'POST',
  headers: {
    // Need a token to test, let's just bypass by using a mock token or something? 
    // Wait, the API requires a valid JWT token. I can get one by logging in.
  }
});
