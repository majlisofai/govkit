---
description: "Run a stage-gate review (GATE, multi-instance) for the profile's lifecycle: check required ArcKit and GovKit artefacts, evaluate criteria from evidence, and record a GO / GO-WITH-CONDITIONS / NO-GO recommendation for the approver."
doc-type: GATE
argument-hint: "<project ID or name> <gate id, e.g. G2>"
effort: high
handoffs:
  - command: govkit:board-report
    description: Roll the gate decision up to the governing body.
  - command: arckit:health
    description: Check artefact currency before the gate.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Type**: GATE (multi-instance, `gates/`). **Template**: `gate`.

**Inputs** (P3). Required: the lifecycle file and the gate id. If no gate id is given, use the first gate without a GO decision in `gates/`. Optional: every `ARC-*` and `GOV-*` artefact in the project, plus `projects/000-global/GOV-000-GMOD-*` for the approver's named body.

**Content**:

1. **Required Artefacts.** Make one row for each code in the gate's `required.arckit` and `required.govkit`. Use the latest version in the project. Mark an artefact "stale" if a newer upstream artefact exists, as ArcKit's traceability expects, or if its Document Control review date has passed.
2. **Criteria.** Judge each criterion from the artefacts. Cite the section. Never mark a criterion met without a citation.
3. **Open Risks and Exceptions.** From ArcKit `RISK`, take risks in the profile risk method's High and Critical bands. From `exceptions/`, take open EXCPs and flag any whose expiry falls before the next gate.
4. **Recommendation.**
   - NO-GO if a required artefact is missing, a criterion is unmet with no condition that could satisfy it, or a Critical risk is untreated.
   - GO-WITH-CONDITIONS if all gaps can be closed by named, dated conditions.
   - Otherwise GO.
5. **Decision Record.** Leave it `[PENDING]`. The approver decides. GovKit records a recommendation only.
6. Never produce a missing artefact during a gate review. Name the command that produces it.

**Report** (P8): the recommendation, the counts of artefacts present and missing, criteria met, and conditions.
