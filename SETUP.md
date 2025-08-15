# 🥋 Sensei UAE Pass - Complete Setup & Deployment Guide

## 🎉 Project Status: Ready for Deployment!

Your UAE Pass Angular library is now complete with all requested features:

### ✅ Completed Features

- **Multi-language Support** - Full English/Arabic localization with RTL
- **Language-Specific UI** - Dynamic button logos based on language
- **Elegant Callback Component** - Beautiful loading animations and states
- **GitHub Actions** - Automated NPM publishing and GitHub Pages deployment
- **Complete Documentation** - Updated README, deployment guides, and setup instructions

## 🚀 Deployment Checklist

### 1. GitHub Repository Setup

- [ ] Create GitHub repository
- [ ] Update package.json with your repository URLs
- [ ] Push code to GitHub
- [ ] Configure NPM_TOKEN secret
- [ ] Enable GitHub Pages

### 2. NPM Publishing

- [ ] Create NPM account
- [ ] Generate automation token
- [ ] Configure GitHub secrets
- [ ] Create version tag to trigger publishing

### 3. Demo Deployment

- [ ] GitHub Pages automatically deploys on push to main
- [ ] Demo will be available at: `https://yourusername.github.io/uae-pass-angular/`

## Prerequisites

- Node.js 18+ and npm 8+
- Angular CLI 19+
- UAE Pass credentials (client ID and secret)
- Git repository (GitHub recommended)

## Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/comrade1996/sensei-uaepass.git
cd sensei-uaepass
npm install
```

### 2. Build the Library

```bash
npm run build:lib
```

### 3. Start Development

```bash
# Start both demo and proxy server
npm run dev

# Or start individually
npm run start:demo    # Angular demo app
npm run start:proxy   # Backend proxy server
```

## GitHub Repository Setup

### 1. Repository Settings

Go to your GitHub repository settings and configure:

**Secrets and Variables → Actions:**

- `NPM_TOKEN` - Your npm authentication token

**Pages:**

- Source: GitHub Actions
- Custom domain (optional): `sensei-uaepass.dev`

### 2. Branch Protection

Protect your `main` branch:

- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 3. Repository Topics

Add these topics for discoverability:

- `uae-pass`
- `oauth2`
- `angular`
- `typescript`
- `pkce`
- `authentication`
- `sensei`

## NPM Publishing Setup

### 1. Create NPM Account

1. Sign up at [npmjs.com](https://www.npmjs.com)
2. Verify your email address
3. Enable 2FA (recommended)

### 2. Generate Access Token

1. Go to Account → Access Tokens
2. Generate New Token → Automation
3. Copy the token

### 3. Add Token to GitHub

1. Go to repository Settings → Secrets and variables → Actions
2. Add new secret: `NPM_TOKEN`
3. Paste your npm token

## Publishing Your First Release

### Automatic Publishing (Recommended)

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Action will automatically:

- Build the library
- Run tests
- Publish to NPM
- Create GitHub release
- Deploy documentation

### Manual Publishing

```bash
# Build and publish manually
npm run build:lib
npm run publish:lib
```

## Environment Configuration

### Development Environment

Create `.env` files for your backend:

```bash
# examples/backends/nodejs-express/.env
UAE_PASS_CLIENT_ID=sandbox_stage
UAE_PASS_CLIENT_SECRET=sandbox_stage
UAE_PASS_ENVIRONMENT=staging
PORT=3001
ALLOWED_ORIGINS=http://localhost:4200
```

### Production Environment

Set environment variables in your hosting platform:

**Heroku:**

```bash
heroku config:set UAE_PASS_CLIENT_ID=your-prod-client-id
heroku config:set UAE_PASS_CLIENT_SECRET=your-prod-client-secret
heroku config:set UAE_PASS_ENVIRONMENT=production
```

**Vercel:**

```bash
vercel env add UAE_PASS_CLIENT_ID
vercel env add UAE_PASS_CLIENT_SECRET
vercel env add UAE_PASS_ENVIRONMENT
```

**Netlify:**
Add in Site settings → Environment variables

## UAE Pass Integration

### 1. Get UAE Pass Credentials

1. Visit [UAE Pass Developer Portal](https://docs.uaepass.ae/)
2. Complete the onboarding process
3. Register your application
4. Get your client ID and secret

### 2. Register Redirect URIs

Add these URIs to your UAE Pass application:

- `http://localhost:4200/uae-pass/callback` (development)
- `https://your-domain.com/uae-pass/callback` (production)

### 3. Configure Environments

**Staging Environment:**

- Base URL: `https://stg-id.uaepass.ae`
- Use for development and testing

**Production Environment:**

- Base URL: `https://id.uaepass.ae`
- Use after UAE Pass assessment approval

## Deployment Options

### Frontend (Angular App)

**Netlify:**

```bash
# Build command
npm run build:demo

# Publish directory
dist/demo
```

**Vercel:**

```bash
# Framework preset: Angular
# Build command: npm run build:demo
# Output directory: dist/demo
```

**GitHub Pages:**

```bash
# Automatically deployed via GitHub Actions
# Available at: https://username.github.io/sensei-uaepass
```

### Backend (Node.js)

**Heroku:**

```bash
cd examples/backends/nodejs-express
heroku create your-app-name
git push heroku main
```

**Railway:**

```bash
railway login
railway init
railway up
```

**DigitalOcean App Platform:**

- Connect your GitHub repository
- Select the backend directory
- Configure environment variables

## Monitoring and Analytics

### Error Tracking

Add error tracking to your backend:

```javascript
// Sentry example
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

### Analytics

Track authentication events:

```javascript
// Google Analytics example
gtag("event", "uae_pass_login", {
  event_category: "authentication",
  event_label: "success",
});
```

## Troubleshooting

### Common Issues

**PKCE code_verifier error:**

- Ensure backend receives `code_verifier` parameter
- Check proxy server is running
- Verify CORS configuration

**CORS errors:**

- Add your frontend domain to `ALLOWED_ORIGINS`
- Ensure backend is accessible from frontend

**Token exchange fails:**

- Verify client ID and secret
- Check UAE Pass environment (staging/production)
- Ensure redirect URI is registered

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=sensei-uaepass:* npm start

# Angular
ng serve --configuration=development
```

## Support

- 📖 [Documentation](https://comrade1996.github.io/sensei-uaepass/)
- 🐛 [Issues](https://github.com/comrade1996/sensei-uaepass/issues)
- 💬 [Discussions](https://github.com/comrade1996/sensei-uaepass/discussions)
- 📧 Email: support@sensei-uaepass.dev

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

_Built with sensei-level mastery_ 🥋
