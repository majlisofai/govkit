# Taking ArcKit Updates

GovKit tracks ArcKit releases (tags `vX.Y.Z` on `tractorjuice/arc-kit`) and does not track `main`.

## Automatic

The `.github/workflows/arckit-upstream.yml` workflow runs every Monday. It syncs the newest ArcKit tag, runs the full compatibility gate, and opens a PR titled either **compatible** or **NEEDS ADAPTATION**. The PR body is the gate's output, so it lists exactly which reference, template or code changed.

## Manual

```bash
node scripts/sync-arckit.mjs --ref latest        # or --ref v6.19.0, or --source ../arc-kit
node scripts/check-compat.mjs
python3 scripts/validate-content.py
node --test tests/
git diff upstream/snapshot/                      # what changed in ArcKit's public surface
```

## When the gate fails

| Failure | Typical cause | Fix |
|---------|---------------|-----|
| `arckit-refs` | ArcKit renamed or removed a command | Update the reference in GovKit's commands, recipe or frameworks |
| `overrides` | ArcKit renamed a template | Rename the rule heading in `references/govkit/arckit-overrides.md` |
| content `… not an ArcKit doc type` | ArcKit renamed a code | Update `methods/lifecycles/*.yaml` and framework `evidence_hints` |
| `doc-types` collision | ArcKit added a code GovKit uses | Rename the GovKit code and add a migration note to the CHANGELOG |
| `vendored` | A file was hand-edited | Revert it. Never edit vendored files. |

Then:

1. Add the version to `tested` in `upstream/compat.json`. For a major ArcKit release, raise `max_exclusive` only after reviewing ArcKit's CHANGELOG for changes to the filename hook, template lookup or recipe format. Those are contract items that the snapshot cannot see.
2. Copy `upstream/compat.json` to `plugins/govkit/config/compat.json`.
3. Bump the GovKit version in `plugins/govkit/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, and add a CHANGELOG entry.

## Files GovKit owns versus vendors

`upstream/arckit.lock.json` lists every vendored file with its hash. Those files are ArcKit's: never edit them. Everything else under `plugins/govkit/` is GovKit's. `references/govkit/` is GovKit's even though it sits inside the vendored `references/` folder.

## Proposals worth taking upstream

These would let GovKit drop workarounds. Raise them on `tractorjuice/arc-kit`:

1. **A plugin-extensible doc-type registry**, for example ArcKit's hook also reading `.arckit/doc-types-custom.json`. GovKit could then write `ARC-*` files that `/arckit:pages`, `/arckit:health` and traceability index.
2. **Published `arckit--vX.Y.Z` tags** on `arckit-claude`, so `plugin.json` can declare a version range.
3. **Overlay discovery for non-`arckit-*` plugin names** in `/arckit:customize` and `arckit-build`.
