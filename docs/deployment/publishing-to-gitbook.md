# Publishing to GitBook

This project uses the repository-level `.gitbook.yaml` file to set `docs` as the content root, `docs/README.md` as the landing page, and `docs/SUMMARY.md` as navigation.

## One-time setup

1. Create or open the GitBook space for `sensei-uaepass`.
2. Open the space's Git Sync or GitHub integration settings.
3. Authorize the GitBook GitHub application for `comrade1996/sensei-uaepass` only.
4. Select repository `sensei-uaepass` and branch `main`.
5. Leave the project directory blank or select `/`, the repository root.
6. Do not set the project directory to `/docs`; GitBook must read `.gitbook.yaml` from the repository root first.
7. Complete the initial sync and verify the landing page and navigation.

## Syncing content

- Each merged push to `main` triggers a sync and build.
- In GitBook, open the space's content or Git Sync view to trigger an update manually when needed.
- Treat GitHub `main` as the source of truth and review GitBook-created pull requests before merging.
- The sidebar is driven by `docs/SUMMARY.md`.

## Tips

- Keep consumer documentation under `docs/`.
- Keep every published page in `docs/SUMMARY.md`.
- Use small, focused pages and reference actual package symbols.
- Verify internal links and code blocks after every structural change.

## Custom domain & visibility

- Space → Settings → Domain: configure a custom domain if desired
- Space → Settings → Visibility: choose Public or Private
- You can also generate share links for specific pages
