# Security Policy

## Supported versions

| Version | Supported                            |
| ------- | ------------------------------------ |
| 3.x     | Yes                                  |
| 2.x     | Security fixes only until 2027-01-31 |
| 1.x     | No                                   |

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub private
vulnerability reporting. If it is unavailable, email the maintainer address in the
npm package metadata with the subject `sensei-uaepass security report`.

Include the affected version, impact, reproduction steps, and suggested remediation.
Never include real UAE PASS credentials, codes, tokens, cookies, Emirates IDs, or
personal information.

Acknowledgment is targeted within five business days. Public disclosure should wait
until a patch is available and users have had a reasonable upgrade window.

## Security model

Version 3 uses an application BFF:

- the browser never receives UAE PASS tokens;
- the BFF owns state, PKCE, callback processing, token exchange, user info, and
  logout;
- Angular receives an opaque session cookie and minimized profile;
- production requires a shared server-side session store.

Deployers remain responsible for provider onboarding, authorization, secure
infrastructure, secret management, session-store security, HTTPS, monitoring, data
retention, and independent production approval.
