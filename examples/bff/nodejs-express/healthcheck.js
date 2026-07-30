const net = require('node:net');

const socket = net.connect(
  {
    host: '127.0.0.1',
    port: Number(process.env.PORT || 3001),
  },
  () => {
    socket.write('GET /health/live HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n');
  }
);

let statusCode = 0;
socket.on('data', (chunk) => {
  const match = /^HTTP\/1\.1 (\d{3})/.exec(chunk.toString());
  if (match) statusCode = Number(match[1]);
});
socket.on('close', () => process.exit(statusCode === 200 ? 0 : 1));
socket.on('error', () => process.exit(1));
socket.setTimeout(2_000, () => {
  socket.destroy();
  process.exit(1);
});
