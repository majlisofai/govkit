# GovStack overlay

Plugin `govkit-govstack` 0.1.0, namespace `/govkit-govstack:*`. Requires GovKit 0.4.0 or later and below 1.0.0. Source: [`plugins/govkit-govstack/`](https://github.com/majlisofai/govkit/tree/main/plugins/govkit-govstack). For a picture of how it fits between GovStack, GovKit and ArcKit, see the [integration view](../explanation/overlays.md).

## Commands

| Command | Arguments | Produces |
|---------|-----------|----------|
| `apply` | `[--central] [--activate] [--dry-run]` | `.govkit/doc-types.json` entries; `govstack-cfr.yaml` in `.govkit/frameworks/` or, with `--central`, the organisation layer |
| `bb` | `[list \| show <bb> \| add <bb> [--version <x.y.z>] \| refresh <bb>]` | `.govkit/frameworks/govstack-bb-<id>.yaml` |
| `map` | `<project>` | `GOV-<PID>-GSBB-v<V>.md` |
| `compliance` | `<project> <bb id \| cfr> [solution name]` | `govstack/GOV-<PID>-GSCA-<NNN>-v<V>.md` |

| Command | Handoffs |
|---------|----------|
| `apply` | `govkit-govstack:map`, `govkit:profile` |
| `bb` | `govkit-govstack:compliance`, `govkit:crosswalk` |
| `map` | `govkit-govstack:bb`, `govkit-govstack:compliance`, `govkit:diagram`, `arckit:adr` |
| `compliance` | `govkit:exception`, `arckit:risk`, `govkit:gate` |

## Skill and agents

| Name | Kind | Purpose |
|------|------|---------|
| `govstack-method` | Skill, model-invoked | GovStack vocabulary and routing. Not for authoring GovStack specifications. |
| `govstack-spec-reader` | Agent, dispatched by `bb add` and `bb refresh` | Reads a building-block specification and returns a framework draft. Tools: Read, WebFetch. Never judges. |
| `govkit-evidence-reader` | GovKit agent, reused by `compliance` | Extracts evidence. Accepted types depend on the verification class. |
| `govkit-control-assessor` | GovKit agent, reused by `compliance` | Rates each requirement Met (1) or Not met (0) |

## Doc types

Registered in `.govkit/doc-types.json` by `apply`. Defined in `govkit-overlay.json`.

| Code | Name | Category | Command | Multi-instance | Subdir |
|------|------|----------|---------|----------------|--------|
| GSBB | GovStack Building Block Map | Architecture | `govkit-govstack:map` | | |
| GSCA | GovStack Compliance Assessment | Assurance | `govkit-govstack:compliance` | yes | `govstack` |

## The `govstack-cfr` framework

GovStack Architecture Specification 2.1.0, section 6. 78 requirements:

| Category | Requirements | REQUIRED | RECOMMENDED | OBSERVABLE | AUDITABLE |
|----------|--------------|----------|-------------|------------|-----------|
| Development | 9 | 2 | 7 | 0 | 9 |
| Deployment | 12 | 3 | 9 | 1 | 11 |
| Architecture | 19 | 3 | 16 | 5 | 14 |
| Quality | 8 | 2 | 6 | 4 | 4 |
| Security | 16 | 6 | 10 | 3 | 13 |
| Data | 14 | 3 | 11 | 3 | 11 |
| **Total** | **78** | **19** | **59** | **16** | **62** |

REQUIRED requirements: `development-1`, `-2`; `deployment-1`, `-2`, `-3`; `architecture-1`, `-2`, `-6`; `quality-1`, `-2`; `security-1`, `-3`, `-4`, `-5`, `-7`, `-16`; `data-1`, `-2`, `-3`.

Control ids are `<category>-<n>`. In GovKit citations, use `govstack-cfr:security-1`. GovStack's own identifier is in `attributes.ref`, for example `govstack-cfr-security#req-1`.

## Building-block frameworks

`govstack-bb-<id>.yaml`, drafted by `bb add` from one of the 14 building blocks in [`references/building-blocks.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit-govstack/references/building-blocks.yaml):

Foundational: `identity`, `information-mediator`, `workflow`. Feature: `consent`, `registries`, `emarketplace`, `esignature`, `gis`, `messaging`, `payments`, `registration`, `scheduler`, `wallet`, `cloud-infrastructure`.

| Field | Value |
|-------|-------|
| Control `id` | `fr-<n>` (functional requirement) or `cfr-<n>` (cross-functional extension) |
| `group` | The Key Functionality, "All key functionalities", or "Cross-functional" |
| `attributes.ref` | `govstack-bb-<id>-fr#req-<n>` or `govstack-bb-<id>-cfr#req-<n>` |
| `attributes.extends` | For an extension, the core requirement it tightens, for example `govstack-cfr-data#req-3` |
| `attributes.kf` | Key Functionalities, when a requirement serves several |
| `attributes.legacy_keyword` | The original MUST/SHOULD keyword, for specifications not yet aligned with 2.0.0 |

## Classifier mapping

| GovStack | GovKit field | Default when absent |
|----------|--------------|---------------------|
| REQUIRED, RECOMMENDED, DRAFT, DEPRECATED | `obligation` | RECOMMENDED |
| OBSERVABLE, AUDITABLE | `attributes.verification` | AUDITABLE |
| IMMUTABLE, EXTENSIBLE, REPLACEABLE | `attributes.mutability` | REPLACEABLE |

## Verdict rules

| Rule | Effect |
|------|--------|
| Every in-scope REQUIRED requirement is Met or Not triggered | Self-assessed compliant |
| Any REQUIRED requirement is Not met | Not compliant. The requirement is a blocker (critical). |
| RECOMMENDED | Reported as coverage (met ÷ in scope). Unmet is minor. Never affects the verdict. |
| DRAFT, DEPRECATED | Listed, excluded from verdict and coverage |
| INAPPLICABLE | Only when a published building-block specification marks it, with rationale |
| OBSERVABLE with documentary evidence only | Not met — no observable evidence |
| No evidence | Not met — no evidence |
| A GovKit exception | Records an accepted gap. The requirement stays Not met. |

## Provenance

Files that `apply` or `bb` writes start with:

```text
# govkit-overlay govkit-govstack@0.1.0 — refreshed by /govkit-govstack:apply; delete this line to take ownership
```

The overlay refreshes files that carry this line and never overwrites files that don't. GovKit reports these files' source as the overlay.
