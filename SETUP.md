# Sensei UAE PASS Setup Guide

Use this guide for local development and integration setup. GitBook is the canonical consumer documentation; `DEPLOYMENT.md` covers maintainer releases.

## Readiness Checklist

### Repository

- [ ] Install Node.js `22.12.0` or newer.
- [ ] Run `npm ci` and `npm run validate`.
- [ ] Configure the `main` ruleset and required CI checks.
- [ ] Enable private vulnerability reporting.
- [ ] Connect GitBook to the `docs` directory.

### Publishing

- [ ] Create the GitHub `npm` environment.
- [ ] Configure npm trusted publishing for `.github/workflows/publish.yml`.
- [ ] Remove obsolete long-lived npm automation tokens.
- [ ] Require two-factor authentication for npm maintainers.

### UAE PASS

- [ ] Register staging and production redirect URIs.
- [ ] Keep the UAE PASS client secret only in the backend secret manager.
- [ ] Deploy HTTPS token and user info proxy routes.
- [ ] Restrict backend CORS to exact frontend origins.

## Prerequisites

- Node.js `22.12.0` or newer and npm.
- UAE PASS application credentials.
- An Angular 19.2 or 20 application for consumer integration.
- A backend capable of securely holding the UAE PASS client secret.

## Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/comrade1996/sensei-uaepass.git
cd sensei-uaepass
npm ci
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

Follow `GITHUB_SETUP.md` to configure repository metadata, topics, private vulnerability reporting, the `main` ruleset, and required CI checks.

Keep `https://sensei-5.gitbook.io/sensei-uaepass/` as the only canonical documentation site. Do not create a duplicate GitHub Pages documentation deployment.

## NPM Publishing Setup

The release pipeline uses npm trusted publishing with GitHub OIDC. It does not read an `NPM_TOKEN` secret.

1. Enable two-factor authentication on each maintainer account.
2. Create an `npm` environment in the GitHub repository.
3. Configure the `sensei-uaepass` trusted publisher for repository `comrade1996/sensei-uaepass`, workflow `publish.yml`, and environment `npm`.
4. Optionally require reviewers on the `npm` environment.

## Publishing a Release

Run all local checks before creating the release pull request:

```bash
npm run validate
```

After merging the version and changelog updates, create a matching annotated tag:

```bash
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

The release workflow reruns all gates, verifies the tag version, publishes with provenance, and creates the GitHub release. There is no manual or duplicate publishing workflow.

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

### Frontend

Build the demo or consuming Angular application with its production configuration:

```bash
npm run build:demo
```

Deploy the generated browser output to a static host or application platform. Configure the production `tokenProxyUrl` and `userInfoProxyUrl` before building. The repository does not include an automatic GitHub Pages deployment.

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
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'your-sentry-dsn' });
```

### Analytics

Track authentication events:

```javascript
// Google Analytics example
gtag('event', 'uae_pass_login', {
  event_category: 'authentication',
  event_label: 'success',
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

- 📖 [Documentation](https://sensei-5.gitbook.io/sensei-uaepass/)
- 🐛 [Issues](https://github.com/comrade1996/sensei-uaepass/issues)
- [Private security reports](https://github.com/comrade1996/sensei-uaepass/security/advisories/new)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

_Built with sensei-level mastery_ 🥋
