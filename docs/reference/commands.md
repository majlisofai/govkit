# Commands

All commands are in the `/govkit:` namespace. Commands that write an artefact follow the shared artefact procedure (steps P1–P8) and the runtime contract. GovKit module commands are listed in their own references: the [GovStack module](govstack-overlay.md#commands) (`/govkit-govstack:*`) and the [FINOS module](finos-module.md#commands) (`/govkit-finos:*`).

## Summary

| Command | Arguments | Produces |
|---------|-----------|----------|
| [`init`](#init) | `[organisation name] [--defaults]` | `.govkit/profile.yaml` |
| [`profile`](#profile) | `[show \| validate \| set <key> <value> \| explain <key>]` | — |
| [`framework`](#framework) | `[list \| show <id> \| add <name or URL> \| refresh <id> \| validate <id>]` | `.govkit/frameworks/<id>.yaml` |
| [`apply`](#apply) | `[--dry-run] [template names...]` | `.arckit/templates-custom/`, `.arckit/recipes/`, published logo |
| [`start`](#start) | `[project name or ID] [--gate G2]` | — (a plan) |
| [`compat`](#compat) | — | — (a report) |
| [`operating-model`](#operating-model) | `[focus or changes]` | `GOV-000-GMOD-v<V>.md` |
| [`applicability`](#applicability) | `<project ID or name>` | `GOV-<PID>-APPL-v<V>.md` |
| [`crosswalk`](#crosswalk) | `<project ID or name> [framework ids...]` | `GOV-<PID>-XWLK-v<V>.md` |
| [`controls`](#controls) | `<project ID or name>` | `GOV-<PID>-CTRL-v<V>.md` |
| [`evidence`](#evidence) | `<project ID or name> [--refresh]` | `GOV-<PID>-EVID-v<V>.md` |
| [`assess`](#assess) | `<project ID or name> <framework id>` | `assessments/GOV-<PID>-ASMT-<NNN>-v<V>.md` |
| [`gate`](#gate) | `<project ID or name> <gate id>` | `gates/GOV-<PID>-GATE-<NNN>-v<V>.md` |
| [`exception`](#exception) | `<project ID or name> <control or principle> <reason>` | `exceptions/GOV-<PID>-EXCP-<NNN>-v<V>.md` |
| [`board-report`](#board-report) | `[reporting period] [project IDs...]` | `board-reports/GOV-000-BRPT-<NNN>-v<V>.md` |
| [`diagram`](#diagram) | `<project> <view and subject> \| --from <ARC document ID>` | `diagrams/GOV-<PID>-DGRM-<NNN>-v<V>.{md,drawio,drawio.svg,drawio.png}` |
| [`team-design`](#team-design) | `<project> [hub name] [--from <model.json or ARC ID>] [--evolve]` | `GOV-<PID>-TEAM-v<V>.{md,json,drawio,drawio.svg,drawio.png}` |
| [`create-brand`](#create-brand) | `[brand id] [--from <file, URL or skill>] [--central \| --project]` | `brands/<id>/`, `diagram-styles/<id>.yaml` |

`team-design` and `create-brand` are skills that you can also run as commands.

## Setup and configuration

### init

Sets up GovKit in the repository. Interviews for organisation, approach, methods, frameworks, tools, document control and brand, then writes `.govkit/profile.yaml` with only the keys that differ from the defaults.

| Item | Value |
|------|-------|
| `--defaults` | Skip the interview. Use the built-in defaults with only the organisation name filled in. |
| Also creates | `.govkit/frameworks/`, `.govkit/methods/`, `.govkit/templates-custom/` (each with a README), and `projects/000-global/` |
| Existing profile | Shown, with a choice to amend or replace. Never overwritten silently. |
| Handoffs | `govkit:apply`, `govkit:operating-model`, `arckit:principles` |

Jurisdictions suggest ArcKit overlays: UAE → `arckit-uae`, EU → `arckit-eu`, US → `arckit-us`, CA → `arckit-ca`, AU → `arckit-au`, FR → `arckit-fr`, AT → `arckit-at`, NL → `arckit-nl`.

### profile

Shows, validates or changes the active profile. Default sub-command: `show`.

| Sub-command | Does |
|-------------|------|
| `show` | The effective value of every key and the layer it came from: default, extends or project |
| `validate` | PASS/FAIL per check: every id resolves to a file; every active framework exists; `primary` is in `active`; every `exclude`/`substitute` key is a real ArcKit command; every `substitute` value is a real GovKit command; every overlay is installed |
| `set <key> <value>` | Edits `.govkit/profile.yaml` (never the defaults), shows before and after, re-runs `validate`. Reminds you to run `/govkit:apply` when the key affects a template or recipe. |
| `explain <key>` | What the key controls and which commands read it |

### framework

Manages framework files.

| Sub-command | Does |
|-------------|------|
| `list` | id, name, version, type, control count, source (built-in, custom or override) and whether active |
| `show <id>` | Header fields, then controls grouped by `group` |
| `add <name or URL>` | Drafts a framework with the `govkit-framework-researcher` agent, with a citation per control. Shows the draft, writes `.govkit/frameworks/<id>.yaml` on confirmation, then runs `validate`. |
| `refresh <id>` | Re-researches the source, shows a control diff, writes the result to `.govkit/frameworks/<id>.yaml`, updates `verified` |
| `validate <id>` | `id` equals the file name; required fields present; control ids unique; every `evidence_hints` code exists; every `mappings` target exists; `verified` within 12 months (warning) |

Handoffs: `govkit:profile`, `govkit:crosswalk`.

### apply

Applies the profile and brand to ArcKit's extension points. Idempotent. Re-run after changing the brand or upgrading ArcKit.

| Step | Writes |
|------|--------|
| Brand | Logo files to `projects/000-global/brand/` (and `docs/brand/` when `arckit.pages` is true); `projects/000-global/brand/BRAND.md` |
| Template overrides | `.arckit/templates-custom/<name>-template.{md,html}` for each name in `tools.arckit.template_overrides`, plus `pages` and `presentation` when the brand enables them |
| Recipes | `.arckit/recipes/<id>.yaml` for each id in `tools.arckit.recipes`, without targets whose skill is excluded |

Every file written carries `<!-- govkit-override name=… upstream=<arckit version> profile-hash=… brand=<id>@<version> -->`. A file in `.arckit/templates-custom/` without that comment is never overwritten. `--dry-run` writes nothing. Template names as arguments limit the run to those templates.

Report statuses: created, updated, unchanged, skipped (hand-written), unsupported (no rule).

Handoffs: `arckit:build`, `govkit:compat`.

### start

Recommends the command sequence for a project, gate by gate, up to the current gate (the first whose required artefacts are not all present) or to `--gate`. Runs nothing.

Applies `tools.arckit.commands.substitute` and `exclude`, and substitutes `/arckit:diagram` with `/govkit:diagram` when `tools.diagrams` is `drawio`. An excluded command that produces a required artefact is flagged as a gap.

### compat

Diagnoses compatibility in this environment. Prints PASS/WARN/FAIL with a fix for each FAIL.

| Check | Detail |
|-------|--------|
| ArcKit version | Inside `min` … `max_exclusive` of `config/compat.json`, and whether it is in `tested` |
| Stale overrides | An override's `upstream=` differs from the installed ArcKit version |
| References | Every `arckit:` and `arckit-<overlay>:` reference in GovKit exists in the installed plugin. Missing in an uninstalled overlay is informational. |

## Governance artefacts

### operating-model

Writes the organisation-wide Governance Operating Model to `projects/000-global/`.

| Item | Value |
|------|-------|
| Type | GMOD |
| Required inputs | The profile's operating model, lifecycle, scale and risk method |
| Optional inputs | `ARC-000-PRIN-*`, ArcKit `STKE` |
| Sections | Governance structure, decision rights (RACI per gate and per doc type), lifecycle and gates, methods, frameworks in force, tooling |
| Handoffs | `arckit:principles`, `govkit:applicability` |

### applicability

Decides which active frameworks and controls apply to a project, with rationale and target levels.

| Item | Value |
|------|-------|
| Type | APPL |
| Required inputs | none |
| Optional inputs | ArcKit `REQ`, `STKE`, `DATA`, `DPIA`, `ATRS`, `SOBC`; `GOV-000-GMOD` |
| Sections | Project characteristics, applicability decision per framework, excluded controls (approval `[PENDING]`) |
| Handoffs | `govkit:controls`, `govkit:crosswalk` |

### crosswalk

Maps controls across the applicable frameworks. The primary framework forms the rows.

| Item | Value |
|------|-------|
| Type | XWLK |
| Required inputs | `GOV-*-APPL-*` (without it, all active frameworks) |
| Mapping sources | Control `mappings`, then an official published crosswalk (`official REF-nnn`), then analyst judgement (`judgement`, with rationale) |
| Relationship types | `equivalent`, `subset`, `superset`, `related` |
| Handoffs | `govkit:controls` |

### controls

Builds the unified control register: one `CTL-NNN` per obligation, deduplicated through the crosswalk.

| Item | Value |
|------|-------|
| Type | CTRL |
| Required inputs | `GOV-*-APPL-*` |
| Optional inputs | `GOV-*-XWLK-*`, `GOV-000-GMOD`, ArcKit `REQ`, `RISK` |
| Status values | `Implemented` (with citation), `Planned`, `Not implemented` |
| Handoffs | `govkit:evidence`, `arckit:requirements` |

### evidence

Builds or refreshes the evidence register.

| Item | Value |
|------|-------|
| Type | EVID |
| Required inputs | `GOV-*-CTRL-*` |
| `--refresh` | Uses the previous EVID as the baseline and keeps evidence IDs where the location is unchanged |
| Stale when | Older than `methods.evidence.max_age_days`, or citing a superseded artefact version |
| Agent | `govkit-evidence-reader`, batches of about 10 controls, at most 8 in parallel |
| Handoffs | `govkit:assess`, `govkit:exception` |

### assess

Rates a project against one framework on the profile's assessment scale.

| Item | Value |
|------|-------|
| Type | ASMT (multi-instance, `assessments/`) |
| Required inputs | The framework file (default `frameworks.primary`) |
| Optional inputs | `GOV-*-APPL-*`, `GOV-*-CTRL-*`, `GOV-*-EVID-*`, ArcKit `REQ`, `RISK`, `HLDR` |
| Target | Control `target`, then APPL target, then the scale's `default_target` |
| Gap | target − rating, mapped through the scale's `gap_severity` |
| Agents | `govkit-evidence-reader` if there is no EVID; `govkit-control-assessor` per framework group |
| Handoffs | `arckit:risk`, `govkit:gate`, `govkit:exception` |

### gate

Runs a stage-gate review and records a recommendation.

| Item | Value |
|------|-------|
| Type | GATE (multi-instance, `gates/`) |
| Required inputs | The lifecycle file and a gate id (default: the first gate without a GO decision) |
| Recommendation | NO-GO if a required artefact is missing, a criterion is unmet with no satisfiable condition, or a Critical risk is untreated; GO-WITH-CONDITIONS if every gap has a named, dated condition; otherwise GO |
| Decision record | Always `[PENDING]` |
| Handoffs | `govkit:board-report`, `arckit:health` |

### exception

Records a time-boxed exception to a control or principle.

| Item | Value |
|------|-------|
| Type | EXCP (multi-instance, `exceptions/`) |
| Required inputs | The control or principle (a CTL, framework control, or principle in `ARC-000-PRIN-*`) |
| Mandatory fields | Justification, requested-by, expiry. Open-ended exceptions are refused. |
| Approver | Second line within appetite; governing body above it. Decision `[PENDING]`. |
| Handoffs | `arckit:risk` |

### board-report

Produces a portfolio report for the governing body, in `projects/000-global/`.

| Item | Value |
|------|-------|
| Type | BRPT (multi-instance, `board-reports/`) |
| Required inputs | At least one project with a GOV artefact |
| Sections | Portfolio status with trend, top 10 risks above appetite, exceptions (expired or expiring within 30 days flagged), evidence health, decisions requested |
| Handoffs | `arckit:pages`, `arckit:presentation` |

## Diagrams, teams and brand

### diagram

Creates a governed draw.io diagram. Stops if `tools.diagrams` is `mermaid` or `plantuml`, unless you ask for draw.io explicitly.

| Item | Value |
|------|-------|
| Type | DGRM (multi-instance, `diagrams/`) |
| Notations | ArchiMate 3.2, C4, flow/DFD, sequence |
| Optional inputs | ArcKit `REQ`, `HLDR`, `DLDR`, `DATA`, `DIAG`, `DFD`, `ADR`; `ARC-000-PRIN-*` |
| `--from` | Converts the Mermaid and PlantUML blocks of an ArcKit artefact |
| Handoffs | `arckit:hld-review`, `govkit:evidence` |

### team-design

Designs or evolves a team organisation. See the [team model reference](team-model.md).

| Item | Value |
|------|-------|
| Type | TEAM (single-instance; a redesign is a new version) |
| `--from` | Start from a model JSON or an ArcKit document |
| `--evolve` | Start from the latest TEAM model in the project and change only what you ask |
| Next steps | `/govkit:gate`, `/arckit:roadmap` |

### create-brand

Creates or updates a brand and its diagram style. See the [brand reference](brand.md).

| Item | Value |
|------|-------|
| `--from` | A guideline file (PDF, DOCX, MD), URL, claude.ai design-system artifact, or skill name |
| `--central` | Write to the organisation layer named by `extends:` |
| `--project` | Write to `.govkit/brands/<id>/` |
| Checks | WCAG AA contrast of `colours.text_pairs`, diagram preview, document preview, voice |
