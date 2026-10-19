# GovKit — maintainer notes

GovKit is a Claude Code plugin (`plugins/govkit/`, namespace `/govkit:*`) that overlays ArcKit (`arckit@arckit-claude`). The README covers what it does. This file covers how to change it safely.

## Hard rules

1. **Never edit vendored ArcKit files.** These are the files listed in `upstream/arckit.lock.json`: `references/*.md` (except `references/govkit/`), `templates/_partials/` and `scripts/bash/`. Change them only with `node scripts/sync-arckit.mjs`.
2. **Never write `ARC-*` artefacts from GovKit.** GovKit produces `GOV-*` files. For ArcKit artefacts, hand off to `/arckit:*` commands, and customize ArcKit only via `.arckit/templates-custom/` and `.arckit/recipes/`.
3. **Every `arckit:<cmd>` you write must exist** in `upstream/snapshot/commands.json`. Every ArcKit doc-type code must exist in `upstream/snapshot/doc-types.json`. `check-compat.mjs` and `validate-content.py` enforce both.
4. **Don't pin a version in the `arckit` dependency** in `plugin.json`. ArcKit publishes no `arckit--v*` tags, so a pinned version cannot resolve. The tested range lives in `upstream/compat.json`, and must be copied byte-identical to `plugins/govkit/config/compat.json`.
5. **Never hard-code presentation.** Colours, fonts, logos, status words and diagram styling come from the resolved brand (runtime contract §6) and diagram style. A new output surface gets new brand fields, not inline styling.
6. **Plugin scripts and hooks are zero-dependency Node ESM.** Plugins are cloned and never `npm install`ed. Repo tooling may use Python with PyYAML.

## Adding things

- **A GovKit doc type:** register it in `plugins/govkit/config/doc-types.mjs`, then add a command with a matching `doc-type:` frontmatter, a template, and the template mapping in `check-compat.mjs`. Check that the code doesn't collide with ArcKit's.
- **A command:** follow `references/govkit/artefact-procedure.md` (steps P1–P8). Don't restate the shared steps.
- **An ArcKit template override:** add a `## <arckit-template-name>` rule to `references/govkit/arckit-overrides.md`. The heading must match an ArcKit `<name>-template.md`.
- **A built-in framework:** paraphrase intents only. Use titles only for paywalled standards. Set `verified`, and use doc-type codes in `evidence_hints`.

## Checks (run all before committing)

```bash
node scripts/sync-arckit.mjs --check && node scripts/check-compat.mjs && python3 scripts/validate-content.py && node --test tests/
```

## Releasing

Bump the version in `plugins/govkit/.claude-plugin/plugin.json` and in `.claude-plugin/marketplace.json` (both the plugin entry and the metadata), and update `CHANGELOG.md`. To take a new ArcKit release, use the `upstream-sync` skill in `.claude/skills/`.

Commits use conventional prefixes: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, and `chore(upstream):` for ArcKit syncs.
