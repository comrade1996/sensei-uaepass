# Deployment and Release Guide

This repository has one release path: a version tag triggers `.github/workflows/publish.yml`, which validates, packages, and publishes `sensei-uaepass` with npm provenance.

## Prerequisites

- Maintainer access to `comrade1996/sensei-uaepass` on GitHub.
- Maintainer access and two-factor authentication for `sensei-uaepass` on npm.
- Node.js `22.12.0` or newer and npm.
- The GitHub `npm` environment and npm trusted publisher described in `GITHUB_SETUP.md`.
- A clean `main` branch with all required CI checks passing.

## Trusted Publishing

Do not add `NPM_TOKEN` to GitHub. The release job requests a short-lived credential over OIDC using `id-token: write`. The npm trusted publisher must exactly match:

- **Organization or user**: `comrade1996`
- **Repository**: `sensei-uaepass`
- **Workflow**: `publish.yml`
- **Environment**: `npm`

The workflow upgrades npm before publishing because trusted publishing requires a supported npm CLI.

## Release Quality Gates

Run the same release gate locally before opening the release pull request:

```bash
npm ci
npm run validate
```

This checks formatting, lint, library tests and coverage, production builds, tarball contents, package metadata, type resolution, documentation, and production dependency vulnerabilities.

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Major**: Breaking API or behavior changes.
- **Minor**: Backward-compatible features.
- **Patch**: Backward-compatible fixes.

The root and library manifests must have the same version. Update `CHANGELOG.md` in the same release pull request.

## Release Process

1. Update the `version` in `package.json`, `package-lock.json`, and `projects/uae-pass/package.json`.
2. Move the release notes in `CHANGELOG.md` under the matching version and date.
3. Run `npm run validate`.
4. Merge the release pull request after all required reviews and CI checks pass.
5. Create an annotated tag from the exact merge commit and push it:

   ```bash
   git tag -a v2.0.0 -m "Release v2.0.0"
   git push origin v2.0.0
   ```

6. Approve the `npm` environment deployment if approval protection is enabled.
7. Verify the GitHub release, attached tarball, npm version, provenance statement, and installation in a clean consumer project.

The tag must exactly match the version in `projects/uae-pass/package.json`. The workflow fails before publishing if they differ.

## Backend Deployment

Angular applications must send authorization codes to `tokenProxyUrl` and request identity data through `userInfoProxyUrl`. Deploy both routes over HTTPS and keep the UAE PASS client secret only in the backend secret manager.

Production backends must enforce exact frontend origins, validate request bodies, apply rate limits, use strict outbound timeouts, redact tokens and authorization codes from logs, and return generic upstream errors. See the canonical backend proxy guide in GitBook for the endpoint contracts.

## Monitoring

- Review the `Release` workflow and GitHub environment deployment history.
- Verify the published version at `https://www.npmjs.com/package/sensei-uaepass`.
- Confirm the npm package page displays provenance linked to the expected repository and workflow.
- Monitor Dependabot, code scanning, dependency review, and private vulnerability reports.
- Treat unexpected publishing attempts or provenance identities as security incidents.

## Troubleshooting

- **OIDC authentication fails**: Confirm the npm trusted publisher repository, workflow filename, and environment exactly match the workflow.
- **Environment waits indefinitely**: Check required reviewers and deployment branch rules for the GitHub `npm` environment.
- **Tag validation fails**: Make the tag and `projects/uae-pass/package.json` versions identical.
- **Version already exists**: Never overwrite a release. Increment the version and publish a new tag.
- **Quality gate fails**: Reproduce with `npm ci && npm run validate`; do not bypass the gate.
- **Package contents fail**: Run `npm run package:check` and inspect the npm dry-run output.

## Rollback

Published npm versions are immutable. If a release is faulty:

1. Deprecate the affected version on npm with a clear migration message.
2. Revert or fix the source through a reviewed pull request.
3. Publish a new patch version through the normal signed tag workflow.
4. Use npm unpublish only when npm policy permits it and the security response requires it.

Report suspected credential compromise or malicious publication through the private vulnerability reporting process in `SECURITY.md`.
