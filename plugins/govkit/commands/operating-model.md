---
description: "Write the organisation-wide Governance Operating Model (GMOD) from the profile's approach — structure, decision rights, gates, methods, frameworks and tooling."
doc-type: GMOD
argument-hint: "[focus or changes]"
effort: high
handoffs:
  - command: arckit:principles
    description: Architecture principles sit beside the operating model in 000-global.
  - command: govkit:applicability
    description: Decide which frameworks apply to each project.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/create-project.sh *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Project**: `000-global`. **Type**: GMOD. **Template**: `operating-model`.

**Inputs** (P3): optional — `projects/000-global/ARC-000-PRIN-*.md`, any ArcKit `STKE` artefacts (for body names). The operating-model, lifecycle, scale and risk-method files named by the profile are required.

**Content** (between P5 and P6):

1. **Governance Structure** — one row per `roles[]` entry in the operating model; ask the user (AskUserQuestion) for the named body/post per role if no stakeholder artefact names it.
2. **Decision Rights** — one RACI row per gate in the lifecycle and per GovKit doc type in `artefact_ownership`; Accountable = the role in the method.
3. **Lifecycle and Gates** — one row per gate, copied from the lifecycle file (approver mapped to the named body).
4. **Methods** — summarise the scale levels, risk bands and appetite, and the profile's evidence rules.
5. **Frameworks in Force** — every `frameworks.active` entry with version and type; mark the primary.
6. **Tooling** — ArcKit version and overlays, `tools.*` choices.

**Report** (P8): the number of roles, gates and frameworks; any role left unassigned.
