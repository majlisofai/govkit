# GovKit Architecture

## Layers

```text
┌────────────────────────────────────────────────────────────────────┐
│ Your repository                                                    │
│   .govkit/profile.yaml            ← approach, methods, frameworks, │
│   .govkit/{frameworks,methods,brands,diagram-styles,              │
│           templates-custom}/      ← your overrides                 │
│   <org>/  (extends:)              ← central org layer              │
│   .arckit/templates-custom/       ← written by /govkit:apply        │
│   .arckit/recipes/                ← written by /govkit:apply        │
│   projects/NNN-name/ARC-*.md      ← ArcKit artefacts               │
│   projects/NNN-name/GOV-*.md      ← GovKit artefacts               │
├────────────────────────────────────────────────────────────────────┤
│ govkit plugin  (/govkit:*)         this repo: plugins/govkit/       │
│   commands · skills · agents · hooks · methods · frameworks ·      │
│   templates · vendored ArcKit shared assets (locked)               │
├────────────────────────────────────────────────────────────────────┤
│ arckit plugin  (/arckit:*)  + optional overlays (arckit-uae, …)    │
│   unmodified, from the arckit-claude marketplace                   │
└────────────────────────────────────────────────────────────────────┘
```

## Interface contract with ArcKit

GovKit relies **only** on the following, and `scripts/check-compat.mjs` verifies each item against every ArcKit release:

| GovKit relies on | ArcKit guarantee | Checked by |
|------------------|------------------|------------|
| `projects/NNN-name/` layout, `000-global` | ArcKit's project structure | vendored `create-project.sh` |
| ArcKit's filename hook ignores non-`ARC-` files | `validate-arc-filename.mjs` early exit, the same path ArcKit's NHS overlay uses | contract test runs ArcKit's real hook (snapshotted per sync) on `GOV-*` paths |
| `.arckit/templates-custom/<name>-template.md` takes precedence | ArcKit's template lookup order | `overrides` check (template names exist) |
| `.arckit/recipes/<name>.yaml` takes precedence | ArcKit's `arckit-build` skill | `validate-content.py` (recipe codes) |
| Command names referenced as `arckit:<cmd>` | ArcKit's command set | `arckit-refs` check against `upstream/snapshot/commands.json` |
| Doc-type codes in lifecycles and evidence hints | `config/doc-types.mjs` | `validate-content.py` against `upstream/snapshot/doc-types.json` |
| Shared references, `_partials`, helper scripts | ArcKit's `sync-shared-assets.py` list | `sync-arckit.mjs --check` hashes |

GovKit never relies on ArcKit's internal hook code, its manifest format beyond `name` and `version`, or any file outside that list.

## Why `GOV-` and not `ARC-`

ArcKit's `validate-arc-filename.mjs` blocks any `ARC-*.md` whose type code isn't in ArcKit's own `config/doc-types.mjs`. A third-party plugin cannot extend that registry. The alternatives each had a cost:

- *Reusing ArcKit codes* such as `CONF` or `ANAL` would collide with ArcKit's own artefacts and their single-instance rules.
- *Patching ArcKit* would break the requirement to take future ArcKit releases unchanged.

ArcKit's own NHS overlay set the precedent: artefacts without the `ARC-` prefix pass through ArcKit untouched. GovKit uses the same layout, version and sequence rules, so that a later upstream registration would be a mechanical rename.

**Trade-off:** ArcKit's `/arckit:pages`, `/arckit:health` and traceability don't index `GOV-*` files today. GovKit artefacts cite `ARC-*` IDs, so the links are there for a human reader. Indexing is the main item to propose upstream (see UPSTREAM.md).

## Commands, skills, agents

- **Commands** each produce one artefact or one action. Shared steps live in `references/govkit/runtime-contract.md` and `artefact-procedure.md`, so the commands don't repeat them.
- **Skills** are model-invoked:
  - `governance-method` keeps vocabulary consistent, including inside ArcKit commands.
  - `framework-authoring` guides hand-edited content.
- **Agents** follow ArcKit's reader/judge split:
  - The *reader* (`govkit-evidence-reader`) extracts evidence and has no field in its schema where a judgement could go.
  - The *judge* (`govkit-control-assessor`) sees only the reader's output.
  - The *researcher* (`govkit-framework-researcher`) drafts frameworks from cited primary sources.
- **Hooks:**
  - `validate-gov-filename.mjs` (PreToolUse Write) is the GOV counterpart of ArcKit's hook.
  - `govkit-session.mjs` (SessionStart) detects a profile and warns when the installed ArcKit is outside the tested range. ArcKit publishes no `arckit--vX.Y.Z` tags, so `plugin.json` cannot pin a version range, and this hook is the runtime half of the version check.
