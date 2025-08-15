# 🚀 Deployment Guide

This guide covers deploying the UAE Pass Angular library to NPM and hosting the demo on GitHub Pages.

## Prerequisites

1. **GitHub Repository**: Create a new repository on GitHub
2. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
3. **NPM Token**: Generate an access token in NPM settings

## Setup Steps

### 1. GitHub Repository Setup

1. Create a new repository on GitHub (e.g., `uae-pass-angular`)
2. Clone this project to your local machine
3. Update the repository URLs in `projects/uae-pass/package.json`
4. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: UAE Pass Angular library"
git branch -M main
git remote add origin https://github.com/yourusername/uae-pass-angular.git
git push -u origin main
```

### 2. NPM Publishing Setup

#### Configure NPM Token
1. Go to [npmjs.com](https://www.npmjs.com/) → Account Settings → Access Tokens
2. Generate a new **Automation** token
3. In your GitHub repository, go to Settings → Secrets and Variables → Actions
4. Add a new secret named `NPM_TOKEN` with your token value

#### Update Package Information
Update `projects/uae-pass/package.json`:
```json
{
  "name": "your-package-name",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/uae-pass-angular.git"
  }
}
```

### 3. GitHub Pages Setup

1. In your GitHub repository, go to Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy on pushes to `main` branch

## Publishing Workflows

### Automatic NPM Publishing

The library will automatically publish to NPM when you create a git tag:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

### Manual NPM Publishing

You can also trigger publishing manually:

1. Go to Actions tab in your GitHub repository
2. Select "Publish to NPM" workflow
3. Click "Run workflow"
4. Enter the version number (e.g., 1.0.1)

### GitHub Pages Deployment

The demo automatically deploys to GitHub Pages on every push to `main`:

- **Demo URL**: `https://yourusername.github.io/uae-pass-angular/`
- **Automatic**: Deploys on every push to main branch
- **Manual**: Can be triggered from Actions tab

## Version Management

### Semantic Versioning

Follow [semantic versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features, backward compatible
- **PATCH** (1.0.1): Bug fixes, backward compatible

### Release Process

1. **Update Version**: 
   ```bash
   cd projects/uae-pass
   npm version patch  # or minor/major
   ```

2. **Update Changelog**: Document changes in `CHANGELOG.md`

3. **Create Release**:
   ```bash
   git add .
   git commit -m "Release v1.0.1"
   git tag v1.0.1
   git push origin main --tags
   ```

## Environment Configuration

### Production vs Staging

The demo can be configured for different environments:

```typescript
// For staging
provideUaePass({
  isProduction: false,
  // ... other config
})

// For production
provideUaePass({
  isProduction: true,
  // ... other config
})
```

### GitHub Pages Configuration

The demo is built with the correct base href for GitHub Pages:
```bash
ng build --base-href="/uae-pass-angular/"
```

## Monitoring Deployments

### NPM Package Status
- Check package at: `https://www.npmjs.com/package/your-package-name`
- Monitor download stats and versions

### GitHub Pages Status
- Check deployment status in Actions tab
- View live demo at your GitHub Pages URL

### CI/CD Status
- All workflows run on push/PR to main
- Check Actions tab for build status
- Workflows include linting, testing, and building

## Troubleshooting

### NPM Publishing Issues
- **Token expired**: Generate new NPM token
- **Package name taken**: Choose a unique package name
- **Build fails**: Check build logs in Actions tab

### GitHub Pages Issues
- **404 errors**: Check base-href configuration
- **Assets not loading**: Verify asset paths are relative
- **Deployment fails**: Check Pages settings and workflow permissions

### Common Solutions
```bash
# Clear npm cache
npm cache clean --force

# Rebuild everything
npm run clean
npm ci
npm run build:lib

# Check package contents
cd dist/uae-pass
npm pack --dry-run
```

## Security Considerations

1. **Never commit secrets**: Use GitHub secrets for tokens
2. **Review dependencies**: Regularly audit npm packages
3. **Update regularly**: Keep Angular and dependencies updated
4. **Proxy usage**: Use backend proxy for UAE Pass API calls in production

## Support

- **Issues**: Create issues on GitHub repository
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Keep README.md updated with latest features
