# Security Policy

## Supported versions

| Version | Supported                            |
| ------- | ------------------------------------ |
| 2.x     | Yes                                  |
| 1.x     | Security fixes only until 2026-10-31 |
| < 1.0   | No                                   |

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting for this repository. If that feature is unavailable, email the maintainer address listed in the npm package metadata with the subject `sensei-uaepass security report`.

Include the affected version, impact, reproduction steps or proof of concept, and any suggested remediation. Do not include real UAE PASS credentials, tokens, Emirates IDs, or personal information.

You should receive acknowledgment within five business days. Confirmed issues will be assessed, fixed, tested, and released according to severity. Public disclosure should wait until a patched version is available and users have had a reasonable upgrade window.

## Security model

The browser package never accepts a client secret. Token and user-information operations require application-controlled backend endpoints. Applications remain responsible for backend authentication, authorization, validation, rate limiting, logging redaction, secret management, HTTPS, and UAE PASS production approval.
