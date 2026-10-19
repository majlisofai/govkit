---
description: "Build the unified Control Register (CTRL) — one control per obligation, deduplicated across frameworks via the crosswalk, each with an owner role and expected evidence."
doc-type: CTRL
argument-hint: "<project ID or name>"
effort: high
handoffs:
  - command: govkit:evidence
    description: Collect evidence against each control.
  - command: arckit:requirements
    description: Controls that need building become NFR-GOV requirements.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Type**: CTRL. **Template**: `controls`.

**Inputs** (P3). Required: `GOV-*-APPL-*`. Optional: `GOV-*-XWLK-*`, `projects/000-global/GOV-000-GMOD-*`, and the ArcKit `REQ` and `RISK` artefacts.

**Content**:

1. Start from the applicable controls of the primary framework. Each becomes a unified control `CTL-NNN` that cites `framework:control`.
2. For every other applicable framework, use the crosswalk. An `equivalent` or `subset` mapping adds the source control to an existing CTL row. Any other control becomes a new CTL row. Without a crosswalk, do not merge: one CTL per control, and recommend `/govkit:crosswalk`.
3. **Owner role** comes from the operating model's `artefact_ownership`, or `first-line` for controls about operations. Leave the named **Owner** as `[PENDING]` unless an ArcKit `STKE` or `RISK` artefact names one.
4. **Evidence expected** comes from the frameworks' `evidence_hints`. Express them as artefact types such as "ArcKit RISK register" and "GovKit EXCP". Add concrete records where the control intent needs them, for example "model card" or "access review log".
5. **Status** is `Implemented` only if an existing artefact already evidences the control. Cite it. Otherwise use `Planned` or `Not implemented`.
6. Fill **Coverage by Framework**. Every in-scope control must be mapped. Treat any unmapped control as a defect: fix it before writing.

**Report** (P8): the number of unified controls, the number of source controls covered, and owner coverage (roles assigned versus named owners).
