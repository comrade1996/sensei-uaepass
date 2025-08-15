# 🥋 Sensei UAE Pass - Backend Examples

This directory contains backend implementation examples for use with the Sensei UAE Pass Angular library. These backends handle secure token exchange and user info retrieval.

## Available Examples

### Node.js/Express Backend

A complete, production-ready backend implementation using Node.js and Express.

**Features:**
- ✅ Secure token exchange with PKCE support
- ✅ User info retrieval
- ✅ Rate limiting and security headers
- ✅ CORS configuration
- ✅ Environment-based configuration
- ✅ Comprehensive error handling
- ✅ Request logging
- ✅ Health check endpoint

**Quick Start:**

```bash
cd examples/backends/nodejs-express
npm install
cp .env.example .env
# Edit .env with your UAE Pass credentials
npm start
```

The server will start on `http://localhost:3001` with the following endpoints:

- `POST /api/uae-pass/token` - Token exchange
- `POST /api/uae-pass/userinfo` - User info retrieval  
- `GET /health` - Health check

## Why Use a Backend Proxy?

The backend proxy is **highly recommended** for security reasons:

1. **Client Secret Protection** - Keeps your UAE Pass client secret secure on the server-side
2. **CORS Handling** - Avoids cross-origin issues with UAE Pass APIs
3. **Token Security** - Prevents exposure of sensitive tokens in the browser
4. **Request Validation** - Adds an extra layer of validation and error handling
5. **Rate Limiting** - Protects against abuse and API limits
6. **Logging & Monitoring** - Centralized logging for debugging and analytics

## Configuration

All backend examples support environment-based configuration:

```env
# UAE Pass Configuration
UAE_PASS_CLIENT_ID=your-client-id
UAE_PASS_CLIENT_SECRET=your-client-secret
UAE_PASS_ENVIRONMENT=staging  # or production

# Server Configuration
PORT=3001
ALLOWED_ORIGINS=http://localhost:4200

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Integration with Angular

Configure your Angular app to use the backend proxy:

```typescript
// In app.config.ts
provideUaePass({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:4200/uae-pass/callback',
  isProduction: false,
  tokenProxyUrl: 'http://localhost:3001/api/uae-pass/token',
  userInfoProxyUrl: 'http://localhost:3001/api/uae-pass/userinfo',
})
```

## Deployment

### Docker Deployment

```bash
cd examples/backends/nodejs-express
docker build -t sensei-uaepass-backend .
docker run -p 3001:3001 -e UAE_PASS_CLIENT_ID=your-id sensei-uaepass-backend
```

### Cloud Deployment

The backend examples are ready for deployment to:

- **Heroku** - Add `Procfile` with `web: node server.js`
- **AWS Lambda** - Use `serverless` framework
- **Google Cloud Run** - Use the included Dockerfile
- **Azure App Service** - Deploy directly from Git
- **DigitalOcean App Platform** - Use the app spec

## Security Considerations

- Always use HTTPS in production
- Set strong `CLIENT_SECRET` values
- Configure appropriate CORS origins
- Enable rate limiting
- Use environment variables for sensitive data
- Monitor and log all requests
- Validate all input parameters

## Contributing

To add a new backend example:

1. Create a new directory under `examples/backends/`
2. Include a complete implementation with documentation
3. Add environment configuration examples
4. Include deployment instructions
5. Update this README with the new example
