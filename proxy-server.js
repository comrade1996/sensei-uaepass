const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for localhost:4200
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

// UAE Pass endpoints
const UAE_PASS_BASE_URL = 'https://stg-id.uaepass.ae'; // Staging environment
const TOKEN_URL = `${UAE_PASS_BASE_URL}/idshub/token`;
const USERINFO_URL = `${UAE_PASS_BASE_URL}/idshub/userinfo`;

// Token exchange proxy
app.post('/api/uae-pass/token', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'sandbox_stage',
      client_secret: 'sandbox_stage',
      code: code,
      redirect_uri: redirect_uri,
      code_verifier: req.body.code_verifier || ''
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Token exchange failed:', data);
      return res.status(response.status).json(data);
    }

    console.log('Token exchange successful');
    res.json(data);
  } catch (error) {
    console.error('Token proxy error:', error);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

// UserInfo proxy
app.post('/api/uae-pass/userinfo', async (req, res) => {
  try {
    const { token } = req.body;
    
    const response = await fetch(USERINFO_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('UserInfo fetch failed:', data);
      return res.status(response.status).json(data);
    }

    console.log('UserInfo fetch successful:', Object.keys(data));
    res.json(data);
  } catch (error) {
    console.error('UserInfo proxy error:', error);
    res.status(500).json({ error: 'UserInfo fetch failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 UAE Pass proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: ${UAE_PASS_BASE_URL}`);
  console.log(`🔗 Allowed origin: http://localhost:4200`);
});
