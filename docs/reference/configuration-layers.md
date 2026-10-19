# Configuration layers

## Profile resolution

The effective profile is built in this order. Later layers override earlier ones key by key. Lists replace.

| Order | File |
|-------|------|
| 1 | `plugins/govkit/config/profile.default.yaml` (built-in) |
| 2 | The file named by `extends:` in `.govkit/profile.yaml`, relative to that file |
| 3 | `.govkit/profile.yaml` |

If `.govkit/profile.yaml` doesn't exist, the defaults are used.

## Content resolution

Each content file resolves through three layers. The first match wins.

| Order | Layer | Location |
|-------|-------|----------|
| 1 | Project | `.govkit/<path>` |
| 2 | Organisation | `<org>/<path>`, where `<org>` is the directory of the profile named by `extends:` |
| 3 | Built-in | `plugins/govkit/<path>` |

| Kind | `<path>` | Selected by |
|------|----------|-------------|
| Operating model | `methods/operating-models/<id>.yaml` | `approach.operating_model` |
| Lifecycle | `methods/lifecycles/<id>.yaml` | `approach.lifecycle` |
| Assessment scale | `methods/scales/<id>.yaml` | `methods.assessment_scale` |
| Risk method | `methods/risk/<id>.yaml` | `methods.risk` |
| Team model | `methods/team-models/<id>.yaml` | `approach.team_model` |
| Framework | `frameworks/<id>.yaml` | `frameworks.active` |
| Brand | `brands/<id>/brand.yaml`, with `assets/` | `brand` |
| Diagram style | `diagram-styles/<id>.yaml` | `diagrams.drawio_style` in the brand, or `tools.drawio.style` |
| GovKit template | `templates-custom/<name>-template.md` (project, organisation); `templates/<name>-template.md` (built-in) | the command |
| Recipe | `.govkit/recipes/<id>.yaml`, then built-in `recipes/<id>.yaml` | `tools.arckit.recipes` |
| Custom doc types | `.govkit/doc-types.json` | — |

An id that resolves to no file is an error. The command stops and names the id and every path it checked.

## Files GovKit writes outside `.govkit/`

| Path | Written by |
|------|------------|
| `.arckit/templates-custom/<name>-template.{md,html}` | `/govkit:apply` |
| `.arckit/recipes/<id>.yaml` | `/govkit:apply` |
| `projects/000-global/brand/` | `/govkit:apply` |
| `docs/brand/` | `/govkit:apply`, when the brand sets `arckit.pages: true` |
| `projects/<NNN-name>/…/GOV-*` | artefact commands |
