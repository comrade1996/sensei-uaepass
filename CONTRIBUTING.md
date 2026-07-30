# Contributing

## Before opening a change

Use GitHub Issues for reproducible bugs and focused feature proposals. Security reports must follow `SECURITY.md` and must not be disclosed publicly.

## Development setup

Requirements:

- Node.js 22.12 or 24
- npm 10 or newer
- Chrome or Chromium for headless tests

```bash
npm ci
npm run validate
```

The repository has three maintained areas:

- `projects/uae-pass` — Angular BFF session client
- `projects/demo` — browser demo with no provider-token access
- `examples/bff/nodejs-express` — server-owned OAuth, identity, and session boundary

To validate the BFF as a standalone package:

```bash
cd examples/bff/nodejs-express
npm ci
npm test
```

## Pull requests

- Keep each pull request focused and explain user-visible and security impact.
- Add or update tests for behavior changes.
- Update the package README, GitBook pages, and changelog when public API or configuration changes.
- Keep OAuth state, PKCE, callbacks, provider tokens, and complete identity responses
  inside the BFF boundary.
- Preserve backward compatibility unless the change is explicitly proposed for a major release.
- Do not commit credentials, identity data, generated coverage, build output, or package tarballs.
- Ensure formatting, lint, tests, coverage, builds, package validation, documentation lint, and production dependency audit pass.

Commits should be concise and imperative. Maintainers may squash merge pull requests.

## Release process

Releases are created only from a signed or protected `vX.Y.Z` tag whose version matches `projects/uae-pass/package.json`. The release workflow reruns all quality gates and publishes to npm with provenance.
