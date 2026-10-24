---
description: "Decide which active frameworks (and which of their controls) apply to a project, with rationale and target levels (APPL)."
doc-type: APPL
argument-hint: "<project ID or name>"
effort: high
handoffs:
  - command: govkit:controls
    description: Build the unified control register from the applicable controls.
  - command: govkit:crosswalk
    description: Map overlapping controls across the applicable frameworks.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/create-project.sh *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Type**: APPL. **Template**: `applicability`.

**Inputs** (P3). Required: none. Optional, read if present: the project's ArcKit `REQ`, `STKE`, `DATA`, `DPIA`, `ATRS` and `SOBC`, and `projects/000-global/GOV-000-GMOD-*.md`.

**Content**:

1. **Project Characteristics.** Derive each characteristic from the inputs and cite the source. Use AI/ML, personal data, jurisdictions (default `organisation.jurisdictions`) and criticality. Where no artefact says, ask the user one question per unknown.
2. **Applicability Decision.** Make one row for each framework in `frameworks.active`. Judge it against the characteristics and the framework's `type`. A regulation applies if its trigger is met. A management-system or principles framework applies organisation-wide unless the operating model scopes it out. The target level is the scale's `default_target` unless the user or a control's `target` says otherwise. If the framework has `related_arckit.overlay_commands` or `related_govkit.overlay_commands`, put them in the "Delegated to overlay" column.
3. **Excluded Controls.** For a Partial framework, list each excluded control with its reason. Leave "Approved by" as `[PENDING]`. An exclusion is a governance decision, not the model's.
4. If the characteristics suggest a framework that is not active, such as personal data with no privacy framework, recommend it in the summary. Do not add it.

**Report** (P8): the number of frameworks that apply, partially apply and do not apply, and the number of excluded controls awaiting approval.
