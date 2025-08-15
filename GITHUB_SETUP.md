# 🐙 GitHub Repository Setup

Follow these steps to set up your GitHub repository for the UAE Pass Angular library.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository" or go to https://github.com/new
3. Repository settings:
   - **Name**: `uae-pass-angular`
   - **Description**: `🥋 UAE Pass Angular library with multi-language support and elegant UI`
   - **Visibility**: Public (for GitHub Pages and NPM publishing)
   - **Initialize**: Don't initialize (we have existing code)

## Step 2: Update Repository URLs

Before pushing, update the repository URLs in your package.json:

```bash
# Edit projects/uae-pass/package.json
# Replace "yourusername" with your actual GitHub username
```

## Step 3: Initialize and Push

```bash
# Navigate to your project root
cd c:\Projects\Impelementation\work\IT\uae-pass-angular

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial UAE Pass Angular library with localization support

- Complete OAuth 2.0 PKCE flow implementation
- Multi-language support (English/Arabic) with RTL
- Language-specific button logos
- Elegant callback component with animations
- Comprehensive TypeScript interfaces
- GitHub Actions for CI/CD and NPM publishing
- Demo application with GitHub Pages deployment"

# Set main branch
git branch -M main

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/uae-pass-angular.git

# Push to GitHub
git push -u origin main
```

## Step 4: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

### Required Secrets:
- **`NPM_TOKEN`**: Your NPM automation token
  - Go to [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens
  - Generate "Automation" token
  - Copy and paste as secret value

### Optional Secrets (for enhanced features):
- **`CODECOV_TOKEN`**: If you want code coverage reports
- **`SLACK_WEBHOOK`**: For deployment notifications

## Step 5: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. The demo will be available at: `https://yourusername.github.io/uae-pass-angular/`

## Step 6: Configure Branch Protection (Optional)

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require pull request reviews

## Step 7: Create First Release

```bash
# Create and push a version tag for first release
git tag v1.0.0
git push origin v1.0.0
```

This will trigger:
- NPM package publishing
- GitHub release creation
- GitHub Pages deployment

## Repository Structure

Your repository will have:
```
uae-pass-angular/
├── .github/workflows/          # CI/CD workflows
│   ├── ci.yml                 # Continuous integration
│   ├── deploy-pages.yml       # GitHub Pages deployment
│   └── publish-npm.yml        # NPM publishing
├── projects/
│   ├── demo/                  # Demo application
│   └── uae-pass/             # Library source code
├── dist/                      # Build output (ignored)
├── docs/                      # Documentation
├── DEPLOYMENT.md             # Deployment guide
├── README.md                 # Main documentation
└── package.json              # Workspace configuration
```

## Next Steps

After setup:
1. **Test workflows**: Push a small change to verify CI/CD
2. **Update documentation**: Customize README with your details
3. **Create issues**: Set up issue templates for bug reports/features
4. **Add contributors**: Invite team members if needed
5. **Monitor**: Watch Actions tab for workflow status

## Verification Checklist

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] NPM_TOKEN secret configured
- [ ] GitHub Pages enabled
- [ ] First tag/release created
- [ ] Demo accessible at GitHub Pages URL
- [ ] Package published to NPM
- [ ] CI workflows passing
