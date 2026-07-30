class MemorySessionStore {
  constructor({ now = Date.now } = {}) {
    this.now = now;
    this.sessions = new Map();
  }

  async get(id) {
    const record = this.sessions.get(id);
    if (!record) return null;
    if (record.expiresAt <= this.now()) {
      this.sessions.delete(id);
      return null;
    }
    return structuredClone(record.value);
  }

  async set(id, value, ttlMs) {
    this.sessions.set(id, {
      value: structuredClone(value),
      expiresAt: this.now() + ttlMs,
    });
  }

  async delete(id) {
    this.sessions.delete(id);
  }
}

/**
 * Adapter for a node-redis compatible client. The application owns the client
 * connection and passes it to this store.
 */
class RedisSessionStore {
  constructor(client, { prefix = 'uaepass:bff:' } = {}) {
    if (!client) throw new Error('RedisSessionStore requires a Redis client');
    this.client = client;
    this.prefix = prefix;
  }

  async get(id) {
    const raw = await this.client.get(`${this.prefix}${id}`);
    return raw ? JSON.parse(raw) : null;
  }

  async set(id, value, ttlMs) {
    await this.client.set(`${this.prefix}${id}`, JSON.stringify(value), {
      PX: ttlMs,
    });
  }

  async delete(id) {
    await this.client.del(`${this.prefix}${id}`);
  }
}

module.exports = { MemorySessionStore, RedisSessionStore };
