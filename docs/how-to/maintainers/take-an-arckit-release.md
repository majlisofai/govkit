# How to take a new ArcKit release

This guide shows maintainers how to move GovKit to a new ArcKit release. GovKit tracks release tags (`vX.Y.Z` on `tractorjuice/arc-kit`), not ArcKit's `main` branch.

In Claude Code, the `upstream-sync` skill in `.claude/skills/` runs these steps for you. Ask it to "sync ArcKit".

## If the weekly workflow opened a PR

The [`arckit-upstream`](https://github.com/majlisofai/govkit/blob/main/.github/workflows/arckit-upstream.yml) workflow runs every Monday. It syncs the newest tag, runs the compatibility gate, and opens a PR titled **compatible** or **NEEDS ADAPTATION**. The PR body is the gate's output.

- **Compatible:** check out the PR branch and continue at [Widen the tested range](#widen-the-tested-range).
- **Needs adaptation:** check out the PR branch and [fix the failing gate](fix-a-failing-compatibility-gate.md). Then continue below.

## Sync by hand

1. Sync the release:

    ```bash
    node scripts/sync-arckit.mjs --ref latest
    ```

    Use `--ref v6.19.0` for a specific tag, or `--source ../arc-kit` to use a local checkout as it is.

2. Run the gate:

    ```bash
    node scripts/check-compat.mjs && python3 scripts/validate-content.py && node --test tests/
    ```

3. If anything fails, [fix the failing gate](fix-a-failing-compatibility-gate.md).
4. See what changed in ArcKit's public surface:

    ```bash
    git diff upstream/snapshot/
    ```

## Widen the tested range

1. Add the version to `tested` in `upstream/compat.json`.
2. For a new major ArcKit version, raise `max_exclusive` only after reading ArcKit's CHANGELOG for changes to:
    - the filename hook
    - the template lookup order
    - the recipe format

    These are contract items that the snapshot cannot see.

3. Copy the file so the two are byte-identical:

    ```bash
    cp upstream/compat.json plugins/govkit/config/compat.json
    ```

4. [Release a new GovKit version](release-govkit.md). Commit with the prefix `chore(upstream):`.
