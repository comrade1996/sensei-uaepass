const http = require('node:http');

const request = http.get(
  {
    hostname: '127.0.0.1',
    port: Number(process.env.PORT || 3001),
    path: '/health/live',
    timeout: 2_000,
  },
  (response) => {
    response.resume();
    process.exit(response.statusCode === 200 ? 0 : 1);
  }
);

request.on('error', () => process.exit(1));
request.on('timeout', () => {
  request.destroy();
  process.exit(1);
});
