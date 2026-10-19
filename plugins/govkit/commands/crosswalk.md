---
description: "Map controls across the applicable frameworks so one piece of evidence can satisfy several (XWLK). Uses official mappings where published; marks analyst judgement explicitly."
doc-type: XWLK
argument-hint: "<project ID or name> [framework ids...]"
effort: high
handoffs:
  - command: govkit:controls
    description: The crosswalk dedupes the unified control register.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Type**: XWLK. **Template**: `crosswalk`.

**Inputs** (P3). Required: the project's `GOV-*-APPL-*` artefact. Without it, use every framework in `frameworks.active` and say so. Optional: the framework ids in `$ARGUMENTS`, which narrow the set.

**Content**:

1. The primary framework, `frameworks.primary`, forms the rows. Every other applicable framework gets a column.
2. Take mappings from three sources, strongest first:
   1. a control's `mappings` field in the framework files
   2. an official published crosswalk. The publisher's mapping documents are an example: NIST publishes crosswalks for the AI RMF. Fetch it, cite it, and mark the row `official REF-nnn`.
   3. analyst judgement. Mark the row `judgement` and give a one-line rationale.
3. Use exactly one of these relationship types per cell: `equivalent`, `subset`, `superset` or `related`. Do not mark controls `equivalent` because their titles look similar. Compare the intents.
4. List every control in a non-primary framework that maps to nothing under **Unmapped Controls**. These need their own unified controls.

**Report** (P8): an overlap percentage for each framework pair, the number of official and judgement mappings, and the number of unmapped controls.
