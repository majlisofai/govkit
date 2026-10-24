# How to release a new GovKit version

This guide shows maintainers how to publish a new version of GovKit or of a GovKit module such as `govkit-govstack`.

Each plugin is released on its own. A release is a git tag `<plugin>--v<version>` (for example `govkit--v0.5.0`) and a GitHub release whose notes are the plugin's `CHANGELOG.md` entry. Claude Code resolves plugin dependency versions against tags of this form.

While a version is `0.x`, it is published as a GitHub **pre-release** and titled `(beta)`. `1.0.0` is the first stable release. Users who install from the marketplace get whatever is on `main`, so the tag is the record of what was released.

## With GitHub Actions

1. In **Actions → Prepare release → Run workflow**, choose the plugin and the bump: `patch`, `minor`, `major` or an exact `X.Y.Z`.

    The workflow sets the version in the plugin's `plugin.json` and its `marketplace.json` entry. For `govkit`, it also sets `marketplace.json` `metadata.version`. It adds a stub entry at the top of `CHANGELOG.md` and opens a `chore(release):` PR.

2. On the PR branch, replace the `TODO` line in the stub with the changes.
3. Run every check locally (below). PRs opened by a workflow don't trigger CI.
4. Merge the PR. The **Release** workflow runs the CI gate, then tags the merge commit and publishes the GitHub release.

The Release workflow publishes every plugin whose current version has no tag yet. If a bump reaches `main` some other way, it is still released. If the gate fails, nothing is tagged. Fix the problem and push again, or re-run **Release** by hand.

## Locally

```bash
node scripts/release.mjs bump govkit minor        # or patch, major, 0.5.0
# edit the new CHANGELOG.md entry
node scripts/sync-arckit.mjs --check && node scripts/check-compat.mjs && python3 scripts/validate-content.py && node scripts/release.mjs check && node --test tests/
git commit -am "chore(release): govkit 0.5.0"
```

Push or merge to `main`. The Release workflow does the rest. To see what it would publish, run `node scripts/release.mjs publish --dry-run`.

## CHANGELOG entries

| Plugin | Heading | Required |
|--------|---------|----------|
| `govkit` | `## 0.5.0 — 2026-11-02`, followed by the ArcKit version it is tested against | Yes. `release.mjs check` fails without it. |
| A module | `## govkit-govstack 0.2.0 — 2026-11-02`, followed by the GovKit range it supports | No. Without one, the release uses GitHub's generated notes. |

`release.mjs check` also fails while an entry still contains the `TODO` stub.

## Rules

- Versions are plain `X.Y.Z`. Beta status comes from the `0.` major version, not from a `-beta` suffix.
- Don't add a version to the `arckit` dependency in `plugin.json`. ArcKit publishes no `arckit--v*` tags, so a pinned version cannot resolve. The tested range lives in `compat.json`.
- A GovKit bump can fall outside a module's `govkit.max_exclusive` in `govkit-overlay.json`, for example at `1.0.0`. Widen the range in the same PR once the module is checked against the new version. `check-compat.mjs` fails until you do.
