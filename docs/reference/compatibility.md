# Compatibility

## Interface with ArcKit

GovKit relies only on these items. Each is checked against every ArcKit release.

| GovKit relies on | ArcKit guarantee | Checked by |
|------------------|------------------|------------|
| `projects/NNN-name/` layout, `000-global` | ArcKit's project structure | vendored `create-project.sh` |
| ArcKit's filename hook ignores non-`ARC-` files | `validate-arc-filename.mjs` exits early, as for ArcKit's NHS overlay | contract test runs ArcKit's real hook, snapshotted per sync, on `GOV-*` paths |
| `.arckit/templates-custom/<name>-template.md` takes precedence | ArcKit's template lookup order | `overrides` check |
| `.arckit/recipes/<name>.yaml` takes precedence | ArcKit's `arckit-build` skill | `validate-content.py` (recipe codes) |
| Command names referenced as `arckit:<cmd>` | ArcKit's command set | `arckit-refs` check against `upstream/snapshot/commands.json` |
| Doc-type codes in lifecycles and evidence hints | ArcKit's `config/doc-types.mjs` | `validate-content.py` against `upstream/snapshot/doc-types.json` |
| Shared references, `_partials`, helper scripts | ArcKit's `sync-shared-assets.py` list | `sync-arckit.mjs --check` hashes |

GovKit does not rely on ArcKit's internal hook code, its manifest format beyond `name` and `version`, or any file outside this list.

## Compatibility gate

`node scripts/check-compat.mjs` prints PASS or FAIL per check and exits 1 on any FAIL.

| Check | Verifies |
|-------|----------|
| `vendored` | Vendored ArcKit files match `upstream/arckit.lock.json` |
| `versions` | `plugin.json` version equals `marketplace.json`; `plugins/govkit/config/compat.json` equals `upstream/compat.json`; the locked ArcKit version is inside the range |
| `doc-types` | No GovKit code collides with an ArcKit code |
| `arckit-refs` | Every `arckit:<cmd>` and `arckit-<overlay>:<cmd>` resolves in the locked release |
| `govkit-refs` | Every `govkit:<cmd>` resolves to a GovKit command or skill |
| `overrides` | Every rule heading in `references/govkit/arckit-overrides.md` names a template in the locked release |
| `templates` | Every GovKit doc type with a command has that command and a template |

The same checks cover every GovKit overlay: a directory `plugins/govkit-<name>/` with a `govkit-overlay.json`.

| Check | Verifies for each overlay |
|-------|---------------------------|
| `versions` | Its `plugin.json` version equals its `marketplace.json` entry. It depends on `govkit`. GovKit's version is inside the overlay's `govkit.min` … `govkit.max_exclusive`. |
| `doc-types` | Its codes collide with no ArcKit, GovKit or other overlay code |
| `arckit-refs`, `govkit-refs` | Its references resolve. Every `govkit-<overlay>:<cmd>`, in GovKit or any overlay, names a command or skill of that overlay. |
| `templates` | Each doc type's command exists with matching `doc-type:` frontmatter and its template exists. Every `installs` file exists. |

`validate-content.py` also validates each overlay's frameworks and methods, and counts overlay codes as known doc types for `evidence_hints`.

## Tested range

`upstream/compat.json`, copied byte-identical to `plugins/govkit/config/compat.json`:

```json
{
  "arckit": {
    "min": "6.18.0",
    "max_exclusive": "7.0.0",
    "tested": ["6.18.2"]
  }
}
```

| Enforced by | When |
|-------------|------|
| `govkit-session.mjs` hook | Each session: warns if the installed ArcKit is outside `min` … `max_exclusive` |
| `/govkit:compat` | On demand: also reports whether the version is in `tested` |
| `check-compat.mjs` (`versions`) | In CI: fails if the locked version is outside the range |

The `arckit` dependency in `plugin.json` carries no version, because ArcKit publishes no `arckit--v*` tags.

## Vendored files

`upstream/arckit.lock.json` lists every vendored file with its hash: `references/*.md` (except `references/govkit/`), `templates/_partials/` and `scripts/bash/`. These files belong to ArcKit. Change them only with `sync-arckit.mjs`.

## Workflows

| Workflow | Trigger | Runs |
|----------|---------|------|
| `ci.yml` | Push to `main`, pull requests | All four checks, on Node 22 and Python 3.12 |
| `arckit-upstream.yml` | Every Monday | Syncs the newest ArcKit tag, runs the gate, opens a PR titled **compatible** or **NEEDS ADAPTATION** |
