# GitHub Repository Setup

Use these settings for `comrade1996/sensei-uaepass` after the modernization changes are merged.

## Repository Metadata

In **Settings → General**, configure:

- **Description**: `Secure UAE PASS authentication for Angular with OAuth 2.0, PKCE, Signals, standalone components, and Arabic/RTL support.`
- **Website**: `https://sensei-5.gitbook.io/sensei-uaepass/`
- **Topics**: `uaepass`, `uae-pass`, `angular`, `oauth2`, `pkce`, `authentication`, `digital-identity`, `typescript`, `arabic`, `rtl`
- **Features**: Enable Issues, Discussions, and private vulnerability reporting.

The package metadata already points to this repository and the canonical GitBook documentation.

## Required Execution Order

Complete the setup in this order because GitHub cannot select required checks until the new CI workflow has run at least once:

1. Commit the modernization changes locally.
2. Push the commit to a temporary branch, not directly to `main`.
3. Open a pull request into `main` and wait for all CI jobs to finish.
4. Configure the `main` ruleset using the checks created by that pull request.
5. Create and protect the GitHub `npm` environment.
6. Register the npm trusted publisher.
7. Connect GitBook and verify a successful sync.
8. Merge the pull request through GitHub.
9. Verify the merge commit on `main`, then create and push `v2.0.0`.

Do not push the tag before the GitHub environment and npm trusted publisher are ready. Pushing `v2.0.0` immediately starts the publication workflow.

## Push the Release Branch and Open the Pull Request

From the repository after creating the local commit:

```bash
git switch -c release/v2.0.0
git push -u origin release/v2.0.0
```

On GitHub:

1. Open **Pull requests**.
2. Select **New pull request**.
3. Set **base** to `main` and **compare** to `release/v2.0.0`.
4. Use a title such as `release: modernize and secure sensei-uaepass v2.0.0`.
5. Complete the pull request checklist and create the pull request.
6. Wait for these exact checks to appear and pass:
   - `Node 22.12.0 quality gates`
   - `Node 24 quality gates`
   - `Dependency review`
7. Do not merge yet.

If a check name does not appear, confirm the pull request targets `main`, then push a new commit or close and reopen the pull request after correcting the workflow.

## Configure the `main` Ruleset

1. Open `https://github.com/comrade1996/sensei-uaepass/settings/rules`.
2. Select **Rulesets**, then **New ruleset → New branch ruleset**.
3. Enter `Protect main` as the ruleset name.
4. Set **Enforcement status** to **Active**.
5. Leave the bypass list empty. If emergency bypass is required, restrict it to repository administrators and document every use.
6. Under **Target branches**, select **Add target → Include default branch**. Confirm that `main` is shown.
7. Enable **Restrict deletions**.
8. Enable **Block force pushes**.
9. Enable **Require a pull request before merging**, then configure:
   - Required approvals: `1` or more.
   - Dismiss stale pull request approvals when new commits are pushed.
   - Require review from Code Owners.
   - Require approval of the most recent reviewable push.
   - Require conversation resolution before merging.
10. Enable **Require signed commits**.
11. Enable **Require linear history** and use squash or rebase merging for the release pull request.
12. Enable **Require status checks to pass**, then add these exact checks from the open pull request:
    - `Node 22.12.0 quality gates`
    - `Node 24 quality gates`
    - `Dependency review`
13. For each status check, select **GitHub Actions** as the expected source when GitHub offers that choice.
14. Enable **Require branches to be up to date before merging**.
15. Select **Create**.
16. Return to the pull request and confirm GitHub now blocks merging whenever approval, freshness, conversation, signature, or CI requirements are missing.

If GitHub does not list a required check, the check must first complete on a recent pull request. Do not enter a guessed or shortened check name.

## Create the Protected GitHub `npm` Environment

1. Open `https://github.com/comrade1996/sensei-uaepass/settings/environments`.
2. Select **New environment**.
3. Enter the case-sensitive name `npm` and select **Configure environment**.
4. Under **Deployment protection rules**, add one or more trusted maintainers or a release team as **Required reviewers**.
5. Enable **Prevent self-review** when a separate reviewer is available. A sole maintainer must leave this disabled or add another qualified reviewer, otherwise every release will deadlock.
6. Disable administrator bypass when the repository plan exposes that option.
7. Under **Deployment branches and tags**, select **Selected branches and tags**.
8. Add a deployment tag rule for `v*.*.*`.
9. Do not add environment secrets. In particular, do not create `NPM_TOKEN`.
10. Save the protection settings.

The release job declares `environment: npm`, so publication pauses for these protections before npm receives an OIDC identity.

## Register the npm Trusted Publisher

The release workflow uses OIDC and does not use a long-lived `NPM_TOKEN`.

1. Sign in to `https://www.npmjs.com/` with an owner of `sensei-uaepass`.
2. Open **Packages → sensei-uaepass → Settings**.
3. Find **Trusted Publisher** or **Trusted publishing**.
4. Select **GitHub Actions** as the publisher.
5. Enter these case-sensitive values:
   - **Organization or user**: `comrade1996`
   - **Repository**: `sensei-uaepass`
   - **Workflow filename**: `publish.yml`
   - **Environment name**: `npm`
6. Under allowed actions, enable **npm publish**. Do not enable staged publishing unless the release workflow is intentionally changed to use it.
7. Save the trusted publisher.
8. In the package's **Publishing access** settings, select **Require two-factor authentication and disallow tokens**.
9. Save the publishing access change.
10. Open the npm account token page and revoke obsolete automation or granular write tokens previously used by this repository.

Verify that the workflow filename contains only `publish.yml`, not `.github/workflows/publish.yml`. The values must exactly match the GitHub repository, workflow, and environment. The workflow receives a short-lived credential through GitHub's OIDC identity provider and publishes with npm provenance.

## Connect GitBook to `docs`

The repository-level `.gitbook.yaml` already sets `root: ./docs`, with `README.md` as the landing page and `SUMMARY.md` as navigation.

1. Sign in to GitBook and open the existing `sensei-uaepass` organization and documentation space.
2. Open the space settings, then open **Git Sync**. Depending on the GitBook interface version, this may appear under **Integrations**.
3. Select **GitHub**, then install or authorize the GitBook GitHub application for `comrade1996` if requested.
4. Grant the application access to `comrade1996/sensei-uaepass` using repository-only access rather than all repositories.
5. Select repository `sensei-uaepass`.
6. Select branch `main`.
7. Leave the GitBook project directory blank or set it to `/` so it uses the repository root. Do not set it to `/docs`; GitBook must first read the repository-level `.gitbook.yaml`, which then points to `./docs`.
8. Complete the initial synchronization.
9. Verify that the GitBook landing page comes from `docs/README.md` and navigation comes from `docs/SUMMARY.md`.
10. Open several pages and verify internal links, code blocks, and navigation.
11. Confirm the published site remains `https://sensei-5.gitbook.io/sensei-uaepass/`.
12. Make GitHub `main` the source of truth. Review GitBook-created pull requests before merging if bidirectional editing is enabled.

Do not enable a duplicate GitHub Pages documentation site.

## Merge and Release `v2.0.0`

### Merge the pull request

1. Confirm every required check is green.
2. Confirm the branch is up to date with `main`.
3. Obtain the required approval and resolve every conversation.
4. Review the **Files changed** tab and confirm no credentials, generated tarballs, `dist`, or coverage artifacts are present.
5. Select **Squash and merge**.
6. Use commit title `release: modernize and secure sensei-uaepass v2.0.0`.
7. Delete the remote `release/v2.0.0` branch after the merge.

### Synchronize and verify locally

```bash
git switch main
git pull --ff-only origin main
npm ci
npm run validate
node -p "require('./package.json').version"
node -p "require('./projects/uae-pass/package.json').version"
```

Both version commands must print `2.0.0`. Confirm the merge commit is the commit intended for publication:

```bash
git status --short
git log -1 --show-signature --oneline
```

The status output must be empty. Do not tag a dirty working tree or an unreviewed commit.

### Create and push the release tag

```bash
git tag -s v2.0.0 -m "Release v2.0.0"
git show --show-signature v2.0.0
git push origin v2.0.0
```

Use `git tag -a` instead of `git tag -s` only when GPG or SSH commit signing has not yet been configured. The repository rules should otherwise prefer a signed tag.

Pushing `v2.0.0` starts the `Release` workflow. Open the Actions tab, approve the `npm` environment deployment when prompted, and wait for every step to complete.

### Verify publication

1. Confirm the GitHub `Release` workflow succeeded.
2. Confirm GitHub created release `v2.0.0` and attached `sensei-uaepass-2.0.0.tgz`.
3. Confirm npm displays `sensei-uaepass@2.0.0`.
4. Confirm npm displays provenance linked to `comrade1996/sensei-uaepass` and `publish.yml`.
5. Install `sensei-uaepass@2.0.0` in a clean Angular consumer and run its production build.
6. Confirm GitBook synchronized the merged documentation from `main`.

The workflow validates that the tag matches the library manifest, reruns every quality gate, publishes with provenance, and creates the GitHub release containing the tarball.

## Verification Checklist

- [ ] Repository metadata and topics configured
- [ ] Private vulnerability reporting enabled
- [ ] Release branch pushed and pull request CI completed
- [ ] Active `main` ruleset targets the default branch
- [ ] Exact Node 22.12.0, Node 24, and dependency review checks required
- [ ] Pull request approval, Code Owner, freshness, and conversation rules enabled
- [ ] Force pushes and deletion blocked
- [ ] Protected `npm` environment created with `v*.*.*` tag policy
- [ ] npm trusted publisher matches `publish.yml` and environment `npm`
- [ ] npm publishing access disallows tokens
- [ ] Obsolete npm automation tokens removed
- [ ] GitBook reads the root configuration and synchronizes `docs`
- [ ] Pull request merged through the protected branch
- [ ] Local `main` clean and synchronized with the merge commit
- [ ] Workspace and library versions both equal `2.0.0`
- [ ] Signed `v2.0.0` tag points to the reviewed merge commit
- [ ] Release workflow and protected environment deployment succeeded
- [ ] Published package and GitHub release verified
- [ ] Published package displays npm provenance
