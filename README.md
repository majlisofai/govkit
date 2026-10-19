# GovKit

**A customizable governance overlay for [ArcKit](https://github.com/tractorjuice/arc-kit).** It adds commands, skills and agents for Claude Code.

ArcKit produces the architecture artefacts: principles, requirements, risk, designs, ADRs and more. GovKit governs them the way *your* organisation does. You choose the **approach** (operating model, lifecycle and posture), the **methods** (assessment scale, risk method and evidence rules), the **frameworks** you measure against, and the **tools** (which ArcKit commands and overlays to use, diagrams and tracker). GovKit then runs assessments, crosswalks, control and evidence registers, stage gates, exceptions and board reports on top of ArcKit.

GovKit **never forks or edits ArcKit**. It depends on the `arckit` plugin, and it reaches ArcKit only through the extension points ArcKit supports. You can therefore take every future ArcKit release.

## Install

GovKit needs ArcKit core from ArcKit's own marketplace:

```bash
claude plugin marketplace add tractorjuice/arckit-claude
claude plugin marketplace add majlisofai/govkit         # or a local path to this repo
claude plugin install arckit@arckit-claude
claude plugin install govkit@majlisofai
```

To set up a team repository so teammates get both automatically, copy [`examples/project-settings.json`](examples/project-settings.json) to `.claude/settings.json`.

## Quick start

```text
/govkit:init                 # interview → .govkit/profile.yaml (approach, methods, frameworks, tools)
/govkit:apply                # renders the profile into ArcKit's .arckit/templates-custom/ and .arckit/recipes/
/govkit:operating-model      # organisation-wide Governance Operating Model (000-global)
/govkit:start my-project     # recommended ArcKit + GovKit sequence to the next gate
```

## Commands

| Command | Produces | Purpose |
|---------|----------|---------|
| `/govkit:init` | `.govkit/profile.yaml` | Choose approach, methods, frameworks, tools |
| `/govkit:profile` | — | Show, validate, set or explain profile keys |
| `/govkit:framework` | `.govkit/frameworks/*.yaml` | List, show, add (researched), refresh or validate frameworks |
| `/govkit:apply` | `.arckit/templates-custom/`, `.arckit/recipes/` | Customize ArcKit through its own extension points |
| `/govkit:start` | — | Plan the next commands, gate by gate |
| `/govkit:compat` | — | Diagnose GovKit ↔ ArcKit compatibility |
| `/govkit:operating-model` | `GOV-000-GMOD` | Governance structure, decision rights, gates |
| `/govkit:applicability` | `GOV-NNN-APPL` | Which frameworks and controls apply, and why |
| `/govkit:crosswalk` | `GOV-NNN-XWLK` | Map controls across frameworks |
| `/govkit:controls` | `GOV-NNN-CTRL` | Unified, deduplicated control register |
| `/govkit:evidence` | `GOV-NNN-EVID` | Evidence register: current, stale, missing |
| `/govkit:assess` | `GOV-NNN-ASMT-NNN` | Rate a framework's controls from evidence |
| `/govkit:gate` | `GOV-NNN-GATE-NNN` | Stage-gate review with a GO / NO-GO recommendation |
| `/govkit:exception` | `GOV-NNN-EXCP-NNN` | Time-boxed exception with risk and approver |
| `/govkit:board-report` | `GOV-000-BRPT-NNN` | Portfolio report for the governing body |

The plugin also ships these **skills**:

- `governance-method`: applies your profile's vocabulary and scales whenever governance comes up, including inside ArcKit commands.
- `framework-authoring`: helps you model your own policies and regulations.

It also ships these **agents**:

- `govkit-evidence-reader`: extracts evidence and does not judge it.
- `govkit-control-assessor`: rates controls using only the evidence it is given.
- `govkit-framework-researcher`: drafts framework files from cited primary sources.

## What ships built in

| Kind | Built-in | Add your own in |
|------|----------|-----------------|
| Operating models | `three-lines` (IIA 2020) | `.govkit/methods/operating-models/` |
| Lifecycles | `stage-gate` (G0–G4) | `.govkit/methods/lifecycles/` |
| Assessment scales | `maturity-0-5`, `rag` | `.govkit/methods/scales/` |
| Risk methods | `iso31000-5x5` | `.govkit/methods/risk/` |
| Frameworks | `iso-iec-42001`, `nist-ai-rmf`, `iso-iec-38500` | `.govkit/frameworks/` |
| Templates | 9 GovKit artefact templates | `.govkit/templates-custom/` |
| Doc types | `GMOD APPL ASMT XWLK CTRL EVID GATE EXCP BRPT` | `.govkit/doc-types.json` |

The built-in frameworks hold **paraphrased** control intents only. Assess against your licensed copy of each standard. For jurisdiction-specific regulation (EU AI Act, UAE AI Charter, NIST 800-53 and so on), GovKit hands off to ArcKit's overlay plugins and does not duplicate them.

See [docs/CUSTOMIZING.md](docs/CUSTOMIZING.md).

## How compatibility with ArcKit is maintained

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/UPSTREAM.md](docs/UPSTREAM.md). In short:

- **Separate plugin and namespace.** GovKit is `/govkit:*` and declares `arckit` as a plugin dependency.
- **Separate filename prefix.** GovKit writes `GOV-*` artefacts in ArcKit's `projects/NNN-name/` layout. ArcKit's filename hook ignores them and GovKit's own hook validates them.
- **Supported extension points only.** GovKit writes `.arckit/templates-custom/` and `.arckit/recipes/`. It never writes `ARC-*` files and never edits ArcKit's files.
- **Vendored shared assets.** ArcKit's own overlays copy its `references/`, `_partials/` and helper scripts. GovKit vendors the same files, pinned and hashed in `upstream/arckit.lock.json`.
- **Compatibility gate.** `scripts/check-compat.mjs` proves that every `/arckit:*` reference, template name and doc-type code still exists in the locked release. A weekly workflow syncs the newest ArcKit tag and opens a PR that is either green or lists exactly what broke.

## Development

```bash
node scripts/sync-arckit.mjs --check     # vendored files untouched
node scripts/check-compat.mjs            # compatible with locked ArcKit
python3 scripts/validate-content.py      # frameworks/methods/profile/recipes valid (needs pyyaml)
node --test tests/                       # hooks, ID generator, validators
```

## Licence

MIT. Includes files vendored from ArcKit (MIT, © TractorJuice); see [NOTICE](NOTICE).
