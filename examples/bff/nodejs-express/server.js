const { createServer } = require('node:http');

const { createApp } = require('./src/app');
const { loadConfig } = require('./src/config');
const { MemorySessionStore } = require('./src/session-store');

function loadSessionStore(config) {
  if (config.nodeEnv !== 'production') return new MemorySessionStore();
  const modulePath = process.env.SESSION_STORE_MODULE;
  if (!modulePath) {
    throw new Error('Production requires SESSION_STORE_MODULE for a shared session store');
  }
  const store = require(modulePath);
  if (!store || typeof store.get !== 'function' || typeof store.set !== 'function') {
    throw new Error('SESSION_STORE_MODULE must export a session store instance');
  }
  return store;
}

const config = loadConfig();
const store = loadSessionStore(config);
const server = createServer(createApp({ config, store }));

server.listen(config.port, () => {
  console.info({
    event: 'server_started',
    port: config.port,
    environment: config.environment,
  });
});

function shutdown(signal) {
  console.info({ event: 'server_stopping', signal });
  server.close((error) => {
    process.exit(error ? 1 : 0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
