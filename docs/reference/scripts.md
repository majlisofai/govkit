# Scripts

## Plugin scripts

In `plugins/govkit/scripts/`. Zero-dependency Node ESM, except `export-drawio.sh`. Commands run them as `${CLAUDE_PLUGIN_ROOT}/scripts/…`.

### generate-gov-id.mjs

```text
generate-gov-id.mjs PROJECT_ID DOC_TYPE [VERSION] [--filename] [--relpath] [--next-num DIR] [--root DIR]
```

| Option | Effect |
|--------|--------|
| `VERSION` | Default `1.0` |
| `--filename` | Append `.md` |
| `--relpath` | Implies `--filename`. Prefix the type's `subdir`. |
| `--next-num DIR` | Allocate the next sequence number from the files in `DIR`. Required for multi-instance types. |
| `--root DIR` | Repository root used to find `.govkit/doc-types.json`. Default: the current directory. |

Exits 1 on an unknown type, an unknown option or a missing `--next-num`.

### validate-team.mjs

```text
validate-team.mjs MODEL.json [--json]
```

Checks a team model against its `rules` block. See the [team model reference](team-model.md#rules). Prints one line per finding, then a summary line starting `OK:` or `INVALID:`. Exits 1 on any error-severity finding.

### render-team-matrix.mjs

```text
render-team-matrix.mjs MODEL.json -o OUT.drawio
```

Draws the team matrix: streams as columns, chapters as rows (one dot per member), platform teams below, enabling and complicated-subsystem teams on the right, a summary and a legend. Styles come from the model's `styles`. Missing styles fall back to neutral defaults. The layout is deterministic. Prints `<file>: <n> streams × <n> chapters, …, <n> cells`. Exits 2 on wrong usage.

### validate-drawio.mjs

```text
validate-drawio.mjs FILE.drawio [--grid N] [--json]
```

| Errors (exit 1) | Warnings |
|-----------------|----------|
| XML not well-formed | Vertex position off the page grid (with `--grid`) |
| No `<mxfile>` or `<diagram>`, or a compressed diagram | Overlapping sibling vertices, where neither contains the other |
| Missing root cells `id="0"` and `id="1"` | Edge label of whitespace only |
| Duplicate cell id within a page | |
| `parent`, `source` or `target` naming no cell on the page | |
| Vertex without `<mxGeometry>` | |
| Edge with neither `source`+`target` nor `sourcePoint`+`targetPoint` | |

Prints `OK: <file> — <n> page(s), <n> vertices, <n> edges, <n> warning(s)` on success.

### export-drawio.sh

```text
export-drawio.sh FILE.drawio [svg] [png]
```

Exports with the draw.io desktop CLI and embeds the diagram, so the output stays editable. Default format: `svg`.

| Output | Content |
|--------|---------|
| `FILE.drawio.svg` | Editable SVG |
| `FILE.drawio.png` | Editable PNG at 2× scale |

| Exit | Meaning |
|------|---------|
| 0 | Exported. Prints each output path. |
| 1 | Export failed, or bad input |
| 3 | draw.io desktop not found. Callers skip, not fail. |

Looks for draw.io at `$DRAWIO_BIN`, `/Applications/draw.io.app`, `~/Applications/draw.io.app`, `drawio` or `draw.io` on `PATH`, `/opt/drawio/drawio`, and `C:\Program Files\draw.io\draw.io.exe`. On Linux without a display it uses `xvfb-run` when available.

### check-contrast.mjs

```text
check-contrast.mjs [--min 4.5] FG BG [FG BG ...] [--json]
```

Prints the WCAG 2.x contrast ratio of each pair. Colours are `#RGB` or `#RRGGBB`. `--min` defaults to 4.5 (AA body text); use 3 for large text and UI borders. Exits 1 if any pair is below `--min`.

### bash/ helpers

`common.sh`, `create-project.sh` and `list-projects.sh` are vendored from ArcKit unchanged. `create-project.sh --json --name "<name>"` creates `projects/NNN-name/` in ArcKit's layout.

## Repository tooling

In `scripts/` at the repository root. Not shipped with the plugin.

| Script | Usage | Checks or does |
|--------|-------|----------------|
| `sync-arckit.mjs` | `[--ref <tag> \| --ref latest \| --source <dir> \| --check]` | Without options, re-syncs the locked ArcKit ref. With `--ref` or `--source`, vendors ArcKit's shared files and snapshots its commands, templates and doc types into `upstream/`. `--check` verifies the vendored files against the lock and changes nothing. |
| `check-compat.mjs` | — | The compatibility gate. See [Compatibility](compatibility.md#compatibility-gate). |
| `validate-content.py` | `[path/.govkit]` | Frameworks, methods, profile and recipes are valid against the GovKit and locked ArcKit registries. Needs PyYAML. |

Run every check before committing:

```bash
node scripts/sync-arckit.mjs --check && node scripts/check-compat.mjs && python3 scripts/validate-content.py && node --test tests/
```
