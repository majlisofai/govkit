---
name: upstream-sync
description: "Take a new ArcKit release into GovKit: sync vendored assets and snapshots, run the compatibility gate, adapt GovKit to any renamed commands, templates or doc-type codes, review contract-level changes in ArcKit's CHANGELOG, and bump the tested range. Use when the user asks to update, upgrade or sync ArcKit, or when an arckit-upstream PR needs adapting."
---

# Upstream Sync

Follow `docs/how-to/maintainers/take-an-arckit-release.md`. The steps:

1. `node scripts/sync-arckit.mjs --ref <tag|latest>`. Note the old and new versions it prints.
2. `git diff --stat upstream/ plugins/govkit/references plugins/govkit/templates/_partials plugins/govkit/scripts/bash`, then `git diff upstream/snapshot/`, to list renamed or removed commands, templates and codes.
3. Run the gate: `node scripts/check-compat.mjs`, `python3 scripts/validate-content.py` and `node --test tests/`.
4. Fix each failure **in GovKit**, using the table in `docs/how-to/maintainers/fix-a-failing-compatibility-gate.md`. Never edit a vendored file to make the gate pass.
5. **Contract review, which the snapshot can't see.** Clone or fetch the ArcKit release and read the CHANGELOG entries between the two versions. Search them for:
   - `validate-arc-filename`: does it still ignore non-`ARC-` files? Run `tests/hooks.test.mjs` logic mentally against the new hook, or execute ArcKit's hook with a `GOV-` path to check.
   - `templates-custom`: is the lookup order unchanged?
   - `recipes` and `arckit-build`: is the recipe schema or `schema_version` unchanged?
   - `RENDERING.md`: has step 2's user-config chain changed? GovKit's runtime contract §4 depends on it.
   - `dependencies`, plus any marketplace or plugin rename.
   Report each item as unchanged, or changed together with what it now means for GovKit.
6. If everything passes, add the version to `tested` in `upstream/compat.json`. Widen `max_exclusive` only for a major release where step 5 found no contract change. Copy the file to `plugins/govkit/config/compat.json`.
7. Bump GovKit's patch version (or minor, if commands changed) in both manifests, and add a CHANGELOG entry that names the ArcKit version.
8. Show the user a summary of what changed upstream, what you adapted, and any contract item that needs their decision. Don't commit unless they ask.
