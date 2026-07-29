# Data Minimization

The reference BFF returns only:

- `sub`
- `fullnameEN`, when present
- `fullnameAR`, when present

Add fields only when a documented application requirement exists.

Never log authorization codes, access tokens, refresh tokens, ID tokens, session
cookies, CSRF tokens, Emirates IDs, or complete provider profiles.

For every retained field, document:

- business purpose;
- authorized readers;
- storage location;
- masking rules;
- retention period;
- deletion process;
- audit requirements.

The demo intentionally does not display Emirates ID, raw provider JSON, or tokens.
