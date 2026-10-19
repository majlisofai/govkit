# How to release a new GovKit version

This guide shows maintainers how to publish a new version of GovKit.

1. Run every check:

    ```bash
    node scripts/sync-arckit.mjs --check && node scripts/check-compat.mjs && python3 scripts/validate-content.py && node --test tests/
    ```

2. Bump the version in three places. They must be equal, or the `versions` check fails:
    - `plugins/govkit/.claude-plugin/plugin.json`: `version`
    - `.claude-plugin/marketplace.json`: the plugin entry's `version`
    - `.claude-plugin/marketplace.json`: `metadata.version`

3. Add an entry at the top of `CHANGELOG.md`: the version, the date, the ArcKit version it is tested against, and the changes.
4. Don't add a version to the `arckit` dependency in `plugin.json`. ArcKit publishes no `arckit--v*` tags, so a pinned version cannot resolve. The tested range lives in `compat.json`.
5. Commit with a conventional prefix (`feat:`, `fix:`, `docs:`, `test:`, `chore:`) and push to `main`. Users get the new version when their marketplace updates.
