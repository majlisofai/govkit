# Profile

The profile is `.govkit/profile.yaml`. A key you leave out takes its value from the organisation profile named by `extends:`, then from the built-in [`profile.default.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/config/profile.default.yaml). Later layers override earlier ones key by key. Lists replace, they do not merge.

## Top level

| Key | Default | Description |
|-----|---------|-------------|
| `govkit_profile` | `1` | Profile format version. Required. |
| `extends` | — | Path to an organisation profile, relative to this file |
| `brand` | `tmofai` | Brand id. Resolves `brands/<id>/brand.yaml`. Built-ins: `tmofai`, `neutral`. |

## `organisation`

| Key | Default | Description |
|-----|---------|-------------|
| `name` | `"[Organisation name]"` | Used in Document Control and by the `neutral` brand |
| `sector` | `"[sector]"` | |
| `jurisdictions` | `[]` | For example `[UAE]` or `[EU, UK]`. Suggests ArcKit overlays and selects the Document Control partial when `document_control.partial` is `auto`. |
| `language` | `en-GB` | |

## `approach`

| Key | Default | Values |
|-----|---------|--------|
| `operating_model` | `three-lines` | An id in `methods/operating-models/` |
| `lifecycle` | `stage-gate` | An id in `methods/lifecycles/` |
| `posture` | `risk-based` | `risk-based`, `compliance-led`, `principles-led`. Sets the tone of findings. |
| `team_model` | `team-topologies` | An id in `methods/team-models/`. Used by `/govkit:team-design`. |

## `methods`

| Key | Default | Description |
|-----|---------|-------------|
| `assessment_scale` | `maturity-0-5` | An id in `methods/scales/` |
| `risk` | `iso31000-5x5` | An id in `methods/risk/` |
| `evidence.minimum_per_control` | `1` | Current evidence items a control needs |
| `evidence.accepted_types` | `[artefact, policy, record, log, test-result, attestation]` | |
| `evidence.max_age_days` | `365` | Older evidence is flagged stale |

## `frameworks`

| Key | Default | Description |
|-----|---------|-------------|
| `active` | `[iso-iec-42001, nist-ai-rmf, iso-iec-38500]` | Ids in `frameworks/` |
| `primary` | `iso-iec-42001` | Must be in `active`. Drives the unified control register's rows and the crosswalk. |

## `tools`

| Key | Default | Description |
|-----|---------|-------------|
| `arckit.overlays` | `[]` | ArcKit overlay plugins in use, for example `[arckit-uae]`. Install them separately. |
| `arckit.commands.exclude` | `[]` | ArcKit commands `/govkit:start` never recommends |
| `arckit.commands.substitute` | `{}` | ArcKit command → GovKit command, for example `{ conformance: "govkit:assess" }` |
| `arckit.template_overrides` | `[risk-register]` | ArcKit templates `/govkit:apply` re-renders. Each needs a rule in `arckit-overrides.md`. |
| `arckit.recipes` | `[govkit-baseline]` | Recipes copied to `.arckit/recipes/` |
| `diagrams` | `drawio` | `drawio`, `mermaid`, `plantuml` |
| `drawio.style` | `brand` | `brand` (the brand's `diagrams.drawio_style`) or a diagram-style id |
| `drawio.export` | `[]` | `[]` (the style's `export.formats`), `[svg]`, `[png]` or `[svg, png]` |
| `tracker` | `none` | `none`, `jira`, `servicenow`, `trello`. Formats action lines; GovKit never calls the tracker. |
| `publish` | `[pages]` | `pages` is the `/arckit:pages` dashboard |

## `document_control`

| Key | Default | Description |
|-----|---------|-------------|
| `partial` | `auto` | `auto`, or a partial file such as `document-control-uae.md`. `auto` picks by `organisation.jurisdictions`: UAE → `uae`, AT → `at`, anything else → `uk`. |
| `default_classification` | `OFFICIAL` | |
| `owner_role` | `"Head of Governance"` | Document Control owner |
| `approvers` | `["Governance Board"]` | |
| `review_cycle_months` | `12` | |

## Example

A UAE federal entity, from [`examples/profile.uae-federal.yaml`](https://github.com/majlisofai/govkit/blob/main/examples/profile.uae-federal.yaml):

```yaml
govkit_profile: 1
organisation:
  name: "Example Federal Authority"
  sector: government
  jurisdictions: [UAE]
approach:
  posture: compliance-led
methods:
  assessment_scale: rag
frameworks:
  active: [iso-iec-42001, nist-ai-rmf]
  primary: iso-iec-42001
tools:
  arckit:
    overlays: [arckit-uae]
    commands:
      exclude: [tcop, service-assessment, gcloud-search, gcloud-clarify, dos]
    template_overrides: [risk-register, requirements]
document_control:
  partial: document-control-uae.md
  default_classification: Confidential
  owner_role: "Chief AI Officer"
  approvers: ["AI Governance Committee"]
```
