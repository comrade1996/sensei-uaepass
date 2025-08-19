# Publishing to GitBook

This project is set up to work with GitBook via `gitbook.yaml` and `docs/SUMMARY.md`.

## One-time setup

1. Create a GitBook Space
2. Connect your Git provider and select this repository
3. Set Docs Root to `docs/` (or GitBook will pick it via `gitbook.yaml`)

## Syncing content

- Each push to the default branch (or selected branch) triggers a sync/build
- In GitBook, open your Space → Content → Sync to manually trigger updates if needed
- The sidebar is driven by `docs/SUMMARY.md`

## Tips

- Keep all Markdown under `docs/` (existing VitePress `index.html` is ignored)
- The `docs/node_modules/` folder is ignored in navigation since pages are driven by `SUMMARY.md`
- Use small, focused pages and reference actual code symbols (components, services) for clarity

## Custom domain & visibility

- Space → Settings → Domain: configure a custom domain if desired
- Space → Settings → Visibility: choose Public or Private
- You can also generate share links for specific pages
