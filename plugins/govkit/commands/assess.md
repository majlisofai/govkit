---
description: "Assess a project against one framework using the profile's assessment scale (ASMT, multi-instance): rate every applicable control from evidence, compute gaps, raise risks, and delegate jurisdiction-specific checks to ArcKit overlays."
doc-type: ASMT
argument-hint: "<project ID or name> <framework id>"
effort: high
handoffs:
  - command: arckit:risk
    description: Add critical and major gaps to the ArcKit risk register.
  - command: govkit:gate
    description: Use the assessment at the next gate review.
  - command: govkit:exception
    description: Request exceptions for gaps that will be accepted.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Type**: ASMT (multi-instance, `assessments/`). **Template**: `assessment`.

**Inputs** (P3). Required: the framework file. If no framework id is given, use `frameworks.primary`. Optional: `GOV-*-APPL-*` for scope and targets, `GOV-*-CTRL-*` and `GOV-*-EVID-*`, and ArcKit `REQ`, `RISK` and `HLDR`.

**Content**:

1. **Scope.** Assess the controls that APPL marks applicable. Without APPL, assess every control in the framework and say so. The target is the control's `target`, then APPL's target, then the scale's `default_target`.
2. **Evidence.**
   - If an EVID register exists, use it.
   - Otherwise dispatch `govkit-evidence-reader` as `/govkit:evidence` step 1 does, with the framework controls in place of CTL controls. Recommend `/govkit:evidence` for a durable register.
3. **Rate the controls with the assessor agent.** Dispatch `govkit-control-assessor` once per framework group, in parallel, with `{ "scale": <scale file>, "posture": <approach.posture>, "controls": [{id, title, intent, target}], "evidence": [<evidence records for those controls>] }`. It returns a rating, a finding and a recommendation for each control. Every rating cites evidence IDs. Without evidence, the rating is the scale's lowest level, marked "no evidence".
4. **Gaps.** gap = target − rating. Map it to severity with the scale's `gap_severity`.
5. **Delegated Assessments.** For each `related_arckit.overlay_commands` and `related_govkit.overlay_commands` entry, look for that command's artefact in the project and summarise its result. If it is missing, write "not yet run" and recommend the command. Do not re-assess what the overlay covers.
6. **Risks Raised.** For each critical or major gap, propose a risk with likelihood × impact under the profile's risk method. Do not write the ArcKit risk register yourself (runtime contract §5). Hand off to `/arckit:risk`, which reads this assessment.
7. Tone follows `approach.posture`. risk-based leads with risk, compliance-led leads with conformance, and principles-led leads with intent.

**Report** (P8): controls at or above target, and the count for each gap severity. Then the three most important actions.
