/**
 * 🥋 Sensei UAE Pass - Node.js/Express Backend Example
 * 
 * This is a complete backend implementation for UAE Pass token exchange
 * and user info retrieval using Node.js and Express.
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const UAE_PASS_CONFIG = {
  staging: {
    baseUrl: 'https://stg-id.uaepass.ae',
    tokenUrl: 'https://stg-id.uaepass.ae/idshub/token',
    userInfoUrl: 'https://stg-id.uaepass.ae/idshub/userinfo',
    logoutUrl: 'https://stg-id.uaepass.ae/idshub/logout'
  },
  production: {
    baseUrl: 'https://id.uaepass.ae',
    tokenUrl: 'https://id.uaepass.ae/idshub/token',
    userInfoUrl: 'https://id.uaepass.ae/idshub/userinfo',
    logoutUrl: 'https://id.uaepass.ae/idshub/logout'
  }
};

// Environment variables (set these in your .env file)
const CLIENT_ID = process.env.UAE_PASS_CLIENT_ID || 'sandbox_stage';
const CLIENT_SECRET = process.env.UAE_PASS_CLIENT_SECRET || 'sandbox_stage';
const ENVIRONMENT = process.env.UAE_PASS_ENVIRONMENT || 'staging';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(',');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'sensei-uaepass-backend',
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

// Token exchange endpoint
app.post('/api/uae-pass/token', async (req, res) => {
  try {
    const { code, redirect_uri, code_verifier } = req.body;
    
    // Validation
    if (!code || !redirect_uri || !code_verifier) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameters: code, redirect_uri, or code_verifier'
      });
    }

    const config = UAE_PASS_CONFIG[ENVIRONMENT];
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: redirect_uri,
      code_verifier: code_verifier
    });

    console.log(`Exchanging token for code: ${code.substring(0, 10)}...`);

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Sensei-UaePass/1.0.0'
      },
      body: params.toString()
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Token exchange failed:', data);
      return res.status(response.status).json(data);
    }

    console.log('Token exchange successful');
    
    // Remove sensitive data before logging
    const logData = { ...data };
    if (logData.access_token) {
      logData.access_token = logData.access_token.substring(0, 10) + '...';
    }
    console.log('Token response:', logData);
    
    res.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ 
      error: 'server_error',
      error_description: 'Internal server error during token exchange'
    });
  }
});

// User info endpoint
app.post('/api/uae-pass/userinfo', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing required parameter: token'
      });
    }

    const config = UAE_PASS_CONFIG[ENVIRONMENT];
    
    console.log(`Fetching user info with token: ${token.substring(0, 10)}...`);

    const response = await fetch(config.userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Sensei-UaePass/1.0.0'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('UserInfo fetch failed:', data);
      return res.status(response.status).json(data);
    }

    console.log('UserInfo fetch successful');
    
    // Log user info without sensitive data
    const logData = { ...data };
    if (logData.idn) {
      logData.idn = logData.idn.substring(0, 3) + '***********';
    }
    console.log('User info:', logData);
    
    res.json(data);
  } catch (error) {
    console.error('UserInfo fetch error:', error);
    res.status(500).json({ 
      error: 'server_error',
      error_description: 'Internal server error during user info fetch'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'server_error',
    error_description: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'not_found',
    error_description: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🥋 Sensei UAE Pass Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${ENVIRONMENT}`);
  console.log(`🔗 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`🛡️ Rate limiting: 100 requests per 15 minutes`);
});

module.exports = app;
